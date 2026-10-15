// Accès aux API publiques de Twitch : métadonnées (GQL), jeton de lecture,
// playlists HLS (usher) et analyse des fichiers m3u8.

// Client-ID public du lecteur web twitch.tv.
const CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";

// Jeton de session twitch.tv de l'utilisateur, s'il est connecté.
// Il ne sert qu'à obtenir ce que son propre compte peut déjà voir
// (VOD réservées aux abonnés, qualité 1440p).
async function getAuthToken() {
  try {
    const c = await chrome.cookies.get({ url: "https://www.twitch.tv", name: "auth-token" });
    return c ? c.value : null;
  } catch {
    return null;
  }
}

async function gql(query, variables = {}, { auth = true } = {}) {
  const headers = { "Client-ID": CLIENT_ID, "Content-Type": "application/json" };
  const token = auth ? await getAuthToken() : null;
  if (token) headers.Authorization = `OAuth ${token}`;
  const res = await fetch("https://gql.twitch.tv/gql", {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });
  if (res.status === 401 && token) return gql(query, variables, { auth: false });
  if (!res.ok) throw new Error(`Twitch GQL : HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(`Twitch GQL : ${json.errors[0].message}`);
  return json.data;
}

const VIDEO_FIELDS = `
  id title lengthSeconds createdAt broadcastType viewCount
  previewThumbnailURL(width: 320, height: 180)
  owner { login displayName }
  game { name }
`;

export async function getVideo(id) {
  const data = await gql(`query($id: ID!) { video(id: $id) { ${VIDEO_FIELDS} } }`, { id });
  if (!data.video) throw new Error("Vidéo introuvable (supprimée ou expirée).");
  return data.video;
}

// type : ARCHIVE (rediffusions), HIGHLIGHT, UPLOAD, ou null pour tout.
export async function getChannelVideos(login, type = "ARCHIVE", first = 30) {
  const data = await gql(
    `query($login: String!, $type: BroadcastType, $first: Int) {
      user(login: $login) {
        login displayName
        videos(first: $first, type: $type, sort: TIME) { edges { node { ${VIDEO_FIELDS} } } }
      }
    }`,
    { login: login.toLowerCase(), type, first }
  );
  if (!data.user) throw new Error(`Chaîne « ${login} » introuvable.`);
  return {
    login: data.user.login,
    displayName: data.user.displayName,
    videos: data.user.videos.edges.map((e) => e.node),
  };
}

async function getAccessToken(id) {
  const data = await gql(
    `query($id: ID!) {
      videoPlaybackAccessToken(id: $id, params: { platform: "web", playerBackend: "mediaplayer", playerType: "site" }) {
        value signature
      }
    }`,
    { id }
  );
  const t = data.videoPlaybackAccessToken;
  if (!t) throw new Error("Impossible d'obtenir le jeton de lecture.");
  const info = JSON.parse(t.value);
  if (info.authorization?.forbidden) {
    throw new Error(info.authorization.reason || "Lecture refusée par Twitch.");
  }
  return t;
}

// Renvoie la liste des qualités disponibles : [{ name, resolution, bandwidth, fps, url }]
export async function getQualities(id) {
  const t = await getAccessToken(id);
  const params = new URLSearchParams({
    token: t.value,
    sig: t.signature,
    allow_source: "true",
    allow_audio_only: "true",
    player: "twitchweb",
    playlist_include_framerate: "true",
    p: String(Math.floor(Math.random() * 1e6)),
  });
  const res = await fetch(`https://usher.ttvnw.net/vod/${id}.m3u8?${params}`);
  if (res.status === 403) {
    throw new Error("Accès refusé : VOD réservée aux abonnés (connecte-toi sur twitch.tv avec un compte abonné).");
  }
  if (!res.ok) throw new Error(`Playlist indisponible (HTTP ${res.status}).`);
  return parseMaster(await res.text());
}

export function parseMaster(text) {
  const lines = text.split(/\r?\n/);
  const names = {};
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("#EXT-X-MEDIA:")) {
      const a = parseAttrs(line);
      names[a["GROUP-ID"]] = a.NAME;
    } else if (line.startsWith("#EXT-X-STREAM-INF:")) {
      const a = parseAttrs(line);
      const url = lines[++i]?.trim();
      if (!url) continue;
      const group = a.VIDEO;
      let name = names[group] || group;
      if (group === "chunked") name += " (source)";
      out.push({
        name,
        group,
        resolution: a.RESOLUTION || null,
        bandwidth: Number(a.BANDWIDTH) || 0,
        fps: a["FRAME-RATE"] ? Math.round(Number(a["FRAME-RATE"])) : null,
        url,
      });
    }
  }
  return out.sort((x, y) => y.bandwidth - x.bandwidth);
}

// Renvoie { init, segments: [{ url, start, duration }], total, ext }
export async function getSegments(playlistUrl) {
  const res = await fetch(playlistUrl);
  if (!res.ok) throw new Error(`Playlist de qualité indisponible (HTTP ${res.status}).`);
  return parseMedia(await res.text(), playlistUrl);
}

export function parseMedia(text, baseUrl) {
  const lines = text.split(/\r?\n/);
  const segments = [];
  let init = null;
  let duration = 0;
  let t = 0;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#EXT-X-MAP:")) {
      const uri = parseAttrs(line).URI;
      if (uri && !init) init = new URL(uri, baseUrl).href;
    } else if (line.startsWith("#EXTINF:")) {
      duration = parseFloat(line.slice(8));
    } else if (!line.startsWith("#")) {
      segments.push({ url: new URL(line, baseUrl).href, start: t, duration });
      t += duration;
    }
  }
  const ext = init || /\.mp4(\?|$)/.test(segments[0]?.url || "") ? "mp4" : "ts";
  return { init, segments, total: t, ext };
}

function parseAttrs(line) {
  const attrs = {};
  const body = line.slice(line.indexOf(":") + 1);
  const re = /([A-Z0-9-]+)=("([^"]*)"|[^,]*)/g;
  let m;
  while ((m = re.exec(body))) attrs[m[1]] = m[3] !== undefined ? m[3] : m[2];
  return attrs;
}

// --- Utilitaires partagés -------------------------------------------------

// Reconnaît une URL de VOD, une URL de chaîne ou un simple identifiant.
export function parseInput(input) {
  const s = (input || "").trim();
  if (!s) return null;
  if (/^\d{6,}$/.test(s)) return { type: "video", id: s };
  let url;
  try {
    url = new URL(/^https?:\/\//.test(s) ? s : `https://${s}`);
  } catch {
    return null;
  }
  if (!/(^|\.)twitch\.tv$/.test(url.hostname)) {
    return /^[a-zA-Z0-9_]{2,25}$/.test(s) ? { type: "channel", login: s } : null;
  }
  const parts = url.pathname.split("/").filter(Boolean);
  const vi = parts.indexOf("videos");
  if (vi !== -1 && /^\d+$/.test(parts[vi + 1] || "")) return { type: "video", id: parts[vi + 1] };
  const reserved = new Set(["directory", "settings", "subscriptions", "inventory", "wallet", "downloads", "search", "p", "u", "following", "drops", "turbo", "jobs", "store"]);
  if (parts[0] && !reserved.has(parts[0]) && /^[a-zA-Z0-9_]{2,25}$/.test(parts[0])) {
    return { type: "channel", login: parts[0] };
  }
  return null;
}

export function fmtDuration(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// « 1:02:03 », « 62:03 », « 3723 » → secondes. Renvoie NaN si invalide.
export function parseTime(str) {
  const s = (str || "").trim();
  if (!s) return NaN;
  const parts = s.split(":").map(Number);
  if (parts.some((n) => !Number.isFinite(n) || n < 0)) return NaN;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

export function fmtBytes(n) {
  if (n < 1024) return `${n} o`;
  const u = ["Ko", "Mo", "Go", "To"];
  let i = -1;
  do {
    n /= 1024;
    i++;
  } while (n >= 1024 && i < u.length - 1);
  return `${n.toFixed(n < 10 ? 2 : 1)} ${u[i]}`;
}

export function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function safeFilename(s) {
  return s.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 150);
}
