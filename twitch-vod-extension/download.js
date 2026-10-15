import {
  getVideo, getQualities, getSegments,
  fmtDuration, fmtBytes, fmtDate, safeFilename,
} from "./lib/twitch.js";

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);

const CONCURRENCY = 6;
// Nombre maximal de segments téléchargés d'avance en attente d'écriture.
const MAX_AHEAD = 24;

let job = null;
let controller = null;

function fail(msg) {
  $("error").textContent = msg;
  $("error").classList.remove("hidden");
  $("bar").classList.add("failed");
}

async function prepare() {
  const id = params.get("id");
  const group = params.get("q");
  const start = Number(params.get("start")) || 0;
  const endParam = Number(params.get("end"));

  const [video, qualities] = await Promise.all([getVideo(id), getQualities(id)]);
  const quality = qualities.find((q) => q.group === group) || qualities[0];
  const playlist = await getSegments(quality.url);
  const end = endParam > start ? endParam : playlist.total;

  // On garde tous les segments qui recoupent la plage demandée.
  const segments = playlist.segments.filter((s) => s.start + s.duration > start && s.start < end);
  if (!segments.length) throw new Error("Aucun segment dans cette plage.");

  const full = start <= 0 && end >= playlist.total - 1;
  const date = video.createdAt.slice(0, 10);
  const suffix = full ? "" : ` [${fmtDuration(start).replace(/:/g, "-")} - ${fmtDuration(end).replace(/:/g, "-")}]`;
  const filename = safeFilename(`${video.owner?.displayName || "twitch"} - ${date} - ${video.title || video.id}${suffix}`) + `.${playlist.ext}`;

  job = { video, quality, playlist, segments, filename, start, end };

  document.title = `${video.title} — Twitch Redif`;
  const thumb = video.previewThumbnailURL;
  if (thumb && !thumb.includes("404_processing")) $("thumb").src = thumb;
  $("title").textContent = video.title || "(sans titre)";
  $("channel").textContent = `${video.owner?.displayName ?? "?"} · ${fmtDate(video.createdAt)}`;
  $("quality").textContent = [quality.name, quality.resolution].filter(Boolean).join(" — ");
  const realStart = segments[0].start;
  const last = segments[segments.length - 1];
  $("range").textContent = `${fmtDuration(realStart)} → ${fmtDuration(last.start + last.duration)} (${segments.length} segments)`;
  $("file").textContent = filename;
  const estimate = quality.bandwidth ? (quality.bandwidth / 8) * (last.start + last.duration - realStart) : 0;
  $("progress").textContent = estimate ? `Prêt · taille estimée ~${fmtBytes(estimate)}` : "Prêt";
  $("start").disabled = false;
}

async function fetchWithRetry(url, signal, tries = 5) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { signal });
      if (res.ok) return new Uint8Array(await res.arrayBuffer());
      lastErr = new Error(`HTTP ${res.status}`);
      lastErr.status = res.status;
      if (res.status === 403 || res.status === 404) break;
    } catch (e) {
      if (signal.aborted) throw e;
      lastErr = e;
    }
    await new Promise((r) => setTimeout(r, 500 * 2 ** i));
  }
  throw lastErr;
}

// Twitch coupe le son de certains passages (musique sous droits) : la playlist
// annonce alors « N-unmuted.ts » qui renvoie 403, la version jouable est « N-muted.ts ».
async function fetchSegment(url, signal) {
  try {
    return await fetchWithRetry(url, signal);
  } catch (e) {
    if ((e.status === 403 || e.status === 404) && /-unmuted\.(ts|mp4)/.test(url)) {
      return fetchWithRetry(url.replace(/-unmuted\.(ts|mp4)/, "-muted.$1"), signal);
    }
    throw e;
  }
}

// Écrit dans un fichier choisi par l'utilisateur, ou à défaut accumule
// des Blob et déclenche un téléchargement classique à la fin.
async function openSink(filename, ext) {
  if ("showSaveFilePicker" in window) {
    const handle = await showSaveFilePicker({
      suggestedName: filename,
      types: [{
        description: ext === "mp4" ? "Vidéo MP4" : "Flux MPEG-TS",
        accept: ext === "mp4" ? { "video/mp4": [".mp4"] } : { "video/mp2t": [".ts"] },
      }],
    });
    const writable = await handle.createWritable();
    return {
      write: (chunk) => writable.write(chunk),
      close: () => writable.close(),
      abort: () => writable.abort().catch(() => {}),
    };
  }
  const parts = [];
  return {
    write: async (chunk) => parts.push(new Blob([chunk])),
    close: async () => {
      const url = URL.createObjectURL(new Blob(parts, { type: ext === "mp4" ? "video/mp4" : "video/mp2t" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    },
    abort: async () => (parts.length = 0),
  };
}

async function run() {
  const { segments, playlist, filename } = job;
  let sink;
  try {
    sink = await openSink(filename, playlist.ext);
  } catch (e) {
    if (e.name === "AbortError") return; // l'utilisateur a fermé le sélecteur
    throw e;
  }

  controller = new AbortController();
  const { signal } = controller;
  $("start").disabled = true;
  $("cancel").classList.remove("hidden");
  $("error").classList.add("hidden");
  $("bar").classList.remove("failed", "done");

  const total = segments.length;
  const done = new Map();
  let nextFetch = 0;
  let nextWrite = 0;
  let bytes = 0;
  const t0 = performance.now();
  // Les workers et l'écrivain s'attendent mutuellement : chaque changement
  // (segment reçu, segment écrit, annulation) réveille tous ceux qui attendent.
  let waiters = [];
  const notify = () => { const w = waiters; waiters = []; w.forEach((r) => r()); };
  const waitForChange = () => new Promise((r) => waiters.push(r));
  signal.addEventListener("abort", notify);

  const updateUI = () => {
    const pct = (nextWrite / total) * 100;
    $("bar").firstElementChild.style.width = `${pct}%`;
    const elapsed = (performance.now() - t0) / 1000;
    const rate = bytes / Math.max(elapsed, 0.001);
    $("progress").textContent = `${nextWrite} / ${total} segments · ${fmtBytes(bytes)} (${pct.toFixed(1)} %)`;
    $("speed").textContent = elapsed > 1 ? `${fmtBytes(rate)}/s` : "";
    if (nextWrite > 0 && nextWrite < total) {
      const eta = (elapsed / nextWrite) * (total - nextWrite);
      $("eta").textContent = `reste ~${fmtDuration(eta)}`;
    }
  };

  try {
    if (playlist.init) {
      const init = await fetchWithRetry(playlist.init, signal);
      await sink.write(init);
      bytes += init.byteLength;
    }

    const worker = async () => {
      while (nextFetch < total && !signal.aborted) {
        // Ne pas prendre trop d'avance sur l'écriture (mémoire bornée).
        while (nextFetch - nextWrite >= MAX_AHEAD && !signal.aborted) await waitForChange();
        if (nextFetch >= total) break;
        const i = nextFetch++;
        const data = await fetchSegment(segments[i].url, signal);
        done.set(i, data);
        notify();
      }
    };

    const writer = async () => {
      while (nextWrite < total) {
        if (signal.aborted) throw new DOMException("Annulé", "AbortError");
        const data = done.get(nextWrite);
        if (!data) { await waitForChange(); continue; }
        done.delete(nextWrite);
        await sink.write(data);
        bytes += data.byteLength;
        nextWrite++;
        updateUI();
        notify();
      }
    };

    const workers = Array.from({ length: CONCURRENCY }, worker);
    await Promise.all([
      writer(),
      Promise.all(workers).catch((e) => { controller.abort(); throw e; }),
    ]);

    await sink.close();
    $("bar").classList.add("done");
    $("progress").textContent = `Terminé · ${fmtBytes(bytes)} en ${fmtDuration((performance.now() - t0) / 1000)}`;
    $("speed").textContent = "";
    $("eta").textContent = "";
    document.title = `✓ ${job.video.title}`;
  } catch (e) {
    await sink.abort();
    if (signal.aborted && e.name === "AbortError") {
      $("progress").textContent = "Annulé";
      $("bar").classList.add("failed");
    } else {
      fail(`Échec : ${e.message}`);
    }
    $("start").disabled = false;
  } finally {
    $("cancel").classList.add("hidden");
    controller = null;
  }
}

$("start").addEventListener("click", () => run().catch((e) => fail(e.message)));
$("cancel").addEventListener("click", () => controller?.abort());
window.addEventListener("beforeunload", (e) => {
  if (controller) e.preventDefault();
});

prepare().catch((e) => {
  $("title").textContent = "Impossible de préparer le téléchargement";
  fail(e.message);
});
