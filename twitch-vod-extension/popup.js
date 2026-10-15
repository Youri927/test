import {
  getVideo, getChannelVideos, getQualities, parseInput,
  fmtDuration, fmtDate, parseTime,
} from "./lib/twitch.js";

const $ = (id) => document.getElementById(id);

const TYPE_LABEL = { ARCHIVE: "Rediffusion", HIGHLIGHT: "Temps fort", UPLOAD: "Mise en ligne" };

let currentLogin = null;
let currentVideo = null;
let currentQualities = [];

function setStatus(msg, isError = false) {
  const el = $("status");
  el.textContent = msg || "";
  el.classList.toggle("hidden", !msg);
  el.classList.toggle("error", isError);
  el.classList.toggle("muted", !isError);
}

function show(section) {
  $("channel").classList.toggle("hidden", section !== "channel");
  $("vod").classList.toggle("hidden", section !== "vod");
}

async function openTarget(target) {
  if (!target) {
    setStatus("Entre un nom de chaîne, un lien twitch.tv/videos/… ou un ID de VOD.", true);
    return;
  }
  if (target.type === "channel") return loadChannel(target.login);
  return loadVideo(target.id, false);
}

async function loadChannel(login) {
  currentLogin = login;
  show(null);
  setStatus("Chargement des vidéos…");
  try {
    const type = $("type").value || null;
    const ch = await getChannelVideos(login, type);
    currentLogin = ch.login;
    $("channel-name").textContent = ch.displayName;
    renderList(ch.videos);
    setStatus(ch.videos.length ? "" : "Aucune vidéo disponible pour ce filtre.");
    show("channel");
  } catch (e) {
    setStatus(e.message, true);
  }
}

function renderList(videos) {
  const list = $("list");
  list.replaceChildren();
  for (const v of videos) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "item";

    const thumb = document.createElement("div");
    thumb.className = "thumb";
    thumb.append(thumbImg(v.previewThumbnailURL));
    const len = document.createElement("span");
    len.className = "len";
    len.textContent = fmtDuration(v.lengthSeconds);
    thumb.append(len);

    const meta = document.createElement("div");
    meta.className = "meta";
    const title = document.createElement("div");
    title.className = "title";
    title.textContent = v.title || "(sans titre)";
    const sub = document.createElement("div");
    sub.className = "muted";
    sub.textContent = [fmtDate(v.createdAt), v.game?.name].filter(Boolean).join(" · ");
    meta.append(title, sub);

    btn.append(thumb, meta);
    btn.addEventListener("click", () => loadVideo(v.id, true));
    list.append(btn);
  }
}

function thumbImg(url) {
  // Les VOD en cours de traitement ont une miniature « 404_processing ».
  if (!url || url.includes("404_processing")) {
    const ph = document.createElement("div");
    ph.className = "ph";
    return ph;
  }
  const img = document.createElement("img");
  img.src = url;
  img.alt = "";
  return img;
}

async function loadVideo(id, fromList) {
  show(null);
  setStatus("Chargement de la VOD…");
  $("vod-error").classList.add("hidden");
  try {
    const [video, qualities] = await Promise.all([getVideo(id), getQualities(id)]);
    currentVideo = video;
    currentQualities = qualities;

    const thumb = video.previewThumbnailURL;
    $("vod-thumb").src = thumb && !thumb.includes("404_processing") ? thumb : "";
    $("vod-title").textContent = video.title || "(sans titre)";
    $("vod-sub").textContent = [
      video.owner?.displayName,
      TYPE_LABEL[video.broadcastType] || null,
      fmtDate(video.createdAt),
      fmtDuration(video.lengthSeconds),
    ].filter(Boolean).join(" · ");

    const sel = $("quality");
    sel.replaceChildren();
    for (const [i, q] of qualities.entries()) {
      const o = document.createElement("option");
      o.value = String(i);
      const res = q.resolution ? ` — ${q.resolution}` : "";
      const gbh = q.bandwidth ? ` · ~${((q.bandwidth / 8) * 3600 / 1024 ** 3).toFixed(1)} Go/h` : "";
      o.textContent = `${q.name}${res}${gbh}`;
      sel.append(o);
    }

    $("start").value = "0:00:00";
    $("end").value = fmtDuration(video.lengthSeconds);
    $("back").classList.toggle("hidden", !fromList);
    setStatus("");
    show("vod");
  } catch (e) {
    setStatus(e.message, true);
    if (fromList) show("channel");
  }
}

function readRange() {
  const total = currentVideo.lengthSeconds;
  const start = parseTime($("start").value || "0");
  const end = $("end").value ? parseTime($("end").value) : total;
  if (Number.isNaN(start) || Number.isNaN(end)) throw new Error("Format de temps invalide (ex. 1:23:45).");
  if (end <= start) throw new Error("La fin doit être après le début.");
  return { start: Math.min(start, total), end: Math.min(end, total) };
}

function vodError(msg) {
  const el = $("vod-error");
  el.textContent = msg;
  el.classList.toggle("hidden", !msg);
}

$("download").addEventListener("click", () => {
  try {
    const { start, end } = readRange();
    const q = currentQualities[Number($("quality").value)];
    const params = new URLSearchParams({
      id: currentVideo.id,
      q: q.group,
      start: String(start),
      end: String(end),
    });
    chrome.tabs.create({ url: chrome.runtime.getURL(`download.html?${params}`) });
  } catch (e) {
    vodError(e.message);
  }
});

$("copy").addEventListener("click", async () => {
  const q = currentQualities[Number($("quality").value)];
  await navigator.clipboard.writeText(q.url);
  const btn = $("copy");
  const old = btn.textContent;
  btn.textContent = "Copié ✓";
  setTimeout(() => (btn.textContent = old), 1500);
});

$("back").addEventListener("click", () => {
  setStatus("");
  show("channel");
});

$("type").addEventListener("change", () => currentLogin && loadChannel(currentLogin));

$("search").addEventListener("submit", (e) => {
  e.preventDefault();
  openTarget(parseInput($("q").value));
});

// À l'ouverture : on part de l'onglet actif s'il est sur twitch.tv.
(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const target = tab?.url ? parseInput(tab.url) : null;
  if (target && /twitch\.tv/.test(tab.url)) {
    $("q").value = target.type === "video" ? tab.url : target.login;
    openTarget(target);
  } else {
    setStatus("Ouvre une chaîne ou une VOD sur twitch.tv, ou cherche une chaîne ci-dessus.");
    $("q").focus();
  }
})();
