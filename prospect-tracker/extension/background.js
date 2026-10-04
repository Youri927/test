// Prospect Tracker : le service en arrière-plan. Tous les appels au serveur passent par ici
// (la page Gmail n'en fait aucun), avec une file d'attente pour ne perdre aucun « mail envoyé ».
// Il prévient aussi : ouverture, ré-ouverture, clic, mail lu plusieurs fois, vieux mail ré-ouvert,
// mail toujours pas ouvert (relance), et un récap chaque matin.
import {DEFAULTS, PREFS} from './config.js';

const POLL_MINUTES = 1;
const FETCH_THROTTLE_MS = 4000;
const SELF_THROTTLE_MS = 15000;
const HOUR = 3600e3;
const DAY = 24 * HOUR;
const HOT_OPENS = 3; // ouvertures en 24 h pour « lu plusieurs fois »
const REVIVAL_DAYS = 7; // silence avant un « ré-ouvert après longtemps »

const NOTIFY_KEYS = ['notifyOpen', 'notifyClick', 'notifyHot', 'notifyRevival', 'dailyReport'];

let cachedEmails = [];
let lastFetchAt = 0;
let fetchPromise = null;
const lastSelf = new Map();
const clickCache = new Map(); // id → clics par lien, tant que le nombre de clics ne change pas

async function getConfig() {
  const cfg = await chrome.storage.sync.get(['apiBase', 'apiToken', 'notificationsEnabled', ...Object.keys(PREFS)]);
  const out = {
    apiBase: (cfg.apiBase || DEFAULTS.apiBase).replace(/\/$/, ''),
    apiToken: cfg.apiToken || DEFAULTS.apiToken,
  };
  for (const [k, d] of Object.entries(PREFS)) out[k] = cfg[k] === undefined ? d : cfg[k];
  out.remindHours = Number(out.remindHours) || 0;
  // ancien interrupteur unique des notifications (v3.0)
  if (cfg.notificationsEnabled === false) for (const k of NOTIFY_KEYS) out[k] = false;
  return out;
}

async function api(action, {body, params = {}} = {}) {
  const {apiBase, apiToken} = await getConfig();
  if (!apiToken) throw new Error('Jeton manquant : ouvrez les réglages de Prospect Tracker');
  const qs = new URLSearchParams({action, ...params});
  const res = await fetch(`${apiBase}?${qs}`, {
    method: body ? 'POST' : 'GET',
    headers: {authorization: `Bearer ${apiToken}`, ...(body ? {'content-type': 'application/json'} : {})},
    body: body ? JSON.stringify(body) : undefined,
    keepalive: true,
  });
  if (!res.ok) throw new Error(`Serveur de suivi : erreur ${res.status}`);
  return res.json();
}

/* ——— Le pixel ne doit jamais se charger dans le Gmail de l'expéditeur ———
   Dans la fenêtre de rédaction, l'image du pixel se charge directement depuis mail.google.com : ce serait
   une fausse ouverture au moment de l'envoi. Chez le destinataire, Gmail passe par son propre proxy
   d'images (googleusercontent.com), que cette règle ne touche pas. */
async function installPixelGuard() {
  const {apiBase} = await getConfig();
  let filter;
  try {
    const u = new URL(apiBase);
    filter = `||${u.host}${u.pathname}?action=open`;
  } catch {
    return;
  }
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [{
      id: 1,
      priority: 1,
      action: {type: 'block'},
      condition: {urlFilter: filter, initiatorDomains: ['mail.google.com'], resourceTypes: ['image']},
    }],
  }).catch(() => {});
}

/* ——— Les mails envoyés : signalés au serveur, avec reprise si le réseau manque ——— */
async function flushSent() {
  const {pendingSent = []} = await chrome.storage.local.get('pendingSent');
  if (!pendingSent.length) return;
  const left = [];
  for (const item of pendingSent) {
    try {
      await api('update', {body: {id: item.id, sender: item.sender, recipient: item.recipient, subject: item.subject, sent: true}});
    } catch {
      if (Date.now() - item.queuedAt < 3 * DAY) left.push(item);
    }
  }
  await chrome.storage.local.set({pendingSent: left});
}

async function markSent(item) {
  // les liens du mail et les alertes choisies pour lui restent sur cet ordinateur
  if (item.links || item.prefs) await chrome.storage.local.set({[`meta:${item.id}`]: {links: item.links || [], prefs: item.prefs || {}, at: Date.now()}});
  const {pendingSent = []} = await chrome.storage.local.get('pendingSent');
  pendingSent.push({id: item.id, sender: item.sender, recipient: item.recipient, subject: item.subject, queuedAt: Date.now()});
  await chrome.storage.local.set({pendingSent});
  await flushSent();
  setTimeout(() => fetchEmails(true).catch(() => {}), 1500);
}

async function fetchEmails(force = false) {
  const now = Date.now();
  if (!force && cachedEmails.length && now - lastFetchAt < FETCH_THROTTLE_MS) return cachedEmails;
  if (fetchPromise) return fetchPromise;
  fetchPromise = (async () => {
    const data = await api('emails', {params: {limit: '200'}});
    cachedEmails = data.emails || [];
    lastFetchAt = Date.now();
    return cachedEmails;
  })();
  try {
    return await fetchPromise;
  } finally {
    fetchPromise = null;
  }
}

/* ——— Clics par lien (onglet « Clics » du volet) ——— */
function linkLabel(url) {
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./, '')}${u.pathname !== '/' ? u.pathname : ''}`;
  } catch {
    return url || '';
  }
}
async function clicksOf(e) {
  const key = `${e.click_count}|${e.last_click_at}`;
  const hit = clickCache.get(e.id);
  if (hit && hit.key === key) return hit.links;
  const d = await api('details', {params: {id: e.id}});
  const per = new Map();
  for (const ev of d.events || []) {
    if (ev.type !== 'click' || !ev.counted || !ev.url) continue;
    const p = per.get(ev.url) || {url: ev.url, count: 0, last: ''};
    p.count++;
    if (ev.created_at > p.last) p.last = ev.created_at;
    per.set(ev.url, p);
  }
  const links = [...per.values()];
  clickCache.set(e.id, {key, links});
  return links;
}
async function clickReport() {
  const clicked = (await fetchEmails()).filter((e) => (e.click_count || 0) > 0).slice(0, 40);
  const rows = [];
  for (let i = 0; i < clicked.length; i += 4) {
    const part = await Promise.all(clicked.slice(i, i + 4).map((e) => clicksOf(e).catch(() => [])));
    part.forEach((links, j) => {
      const e = clicked[i + j];
      for (const l of links) rows.push({id: e.id, recipient: e.recipient, subject: e.subject, ...l});
    });
  }
  return rows.sort((a, b) => b.last.localeCompare(a.last));
}

/* ——— Notifications ——— */
const ts = (iso) => (iso ? Date.parse(iso) || 0 : 0);
const opened = (e) => (e.open_count || 0) > 0 || (e.click_count || 0) > 0;
const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;
const delay = (h) => (h < 48 ? `${h} h` : `${Math.round(h / 24)} jours`);
function nameOf(e, names) {
  const first = String(e.recipient || '').split(',')[0].trim().toLowerCase();
  return names[first] || first || 'Votre contact';
}
async function metasOf(ids) {
  const keys = ids.map((id) => `meta:${id}`);
  const got = keys.length ? await chrome.storage.local.get(keys) : {};
  return Object.fromEntries(ids.map((id) => [id, got[`meta:${id}`] || null]));
}

async function poll() {
  await flushSent().catch(() => {});
  const cfg = await getConfig();
  let emails = [];
  try {
    emails = await fetchEmails(true);
  } catch {
    return;
  }
  const now = Date.now();
  const local = await chrome.storage.local.get(['seen', 'reminded', 'ptNames', 'lastDaily']);
  const seen = local.seen || {};
  const names = local.ptNames || {};
  const reminded = Object.fromEntries(Object.entries(local.reminded || {}).filter(([, t]) => now - t < 45 * DAY));
  const metas = await metasOf(emails.map((e) => e.id));
  const notes = [];
  const next = {};

  for (const e of emails) {
    const before = seen[e.id];
    const st = {
      open_count: e.open_count || 0,
      click_count: e.click_count || 0,
      last_open_at: e.last_open_at || null,
      hist: (before?.hist || []).filter((t) => now - t < DAY), // ouvertures vues ces dernières 24 h
      hot: before?.hot || 0,
    };
    next[e.id] = st;
    if (!before) continue; // premier passage : on prend la photo, sans rien annoncer
    const prefs = metas[e.id]?.prefs || {};
    const who = nameOf(e, names);
    const subject = e.subject || '(sans objet)';
    const newOpens = st.open_count - (before.open_count || 0);
    const newClicks = st.click_count - (before.click_count || 0);
    for (let i = 0; i < Math.min(Math.max(newOpens, 0), HOT_OPENS); i++) st.hist.push(now);

    if (newClicks > 0) {
      if (cfg.notifyClick && prefs.click !== false) {
        let what = 'un lien';
        try {
          const last = (await clicksOf(e)).sort((a, b) => b.last.localeCompare(a.last))[0];
          if (last) what = `« ${linkLabel(last.url)} »`;
        } catch {
          // le détail du lien n'est pas indispensable
        }
        notes.push({id: `click|${e.id}|${st.click_count}`, title: 'Lien cliqué', message: `${who} a cliqué ${what} dans « ${subject} »`});
      }
    } else if (newOpens > 0) {
      const silence = before.last_open_at ? now - ts(before.last_open_at) : 0;
      if (before.open_count > 0 && silence > REVIVAL_DAYS * DAY && cfg.notifyRevival) {
        notes.push({id: `revival|${e.id}|${st.open_count}`, title: `Ré-ouvert après ${Math.round(silence / DAY)} jours`, message: `${who} a ré-ouvert « ${subject} »`});
      } else if (cfg.notifyOpen && prefs.open !== false) {
        const n = st.open_count;
        notes.push({
          id: `open|${e.id}|${n}`,
          title: before.open_count === 0 ? 'E-mail ouvert' : `E-mail ré-ouvert (${n}e fois)`,
          message: `${who} a ${before.open_count === 0 ? 'ouvert' : 'ré-ouvert'} « ${subject} »`,
        });
      }
    }
    if (newOpens > 0 && cfg.notifyHot && st.hist.length >= HOT_OPENS && now - st.hot > DAY) {
      st.hot = now;
      notes.push({id: `hot|${e.id}|${st.open_count}`, title: 'Lu plusieurs fois', message: `${who} a ouvert « ${subject} » ${st.hist.length} fois en 24 h : bon moment pour relancer`});
    }
  }

  // relances : pas encore ouvert au bout du délai choisi (pour ce mail, sinon le délai par défaut)
  const due = emails.filter((e) => {
    if (opened(e) || reminded[e.id]) return false;
    const pref = metas[e.id]?.prefs?.remind;
    const h = Number(pref === undefined ? cfg.remindHours : pref) || 0;
    if (!h) return false;
    const at = ts(e.sent_at || e.created_at) + h * HOUR;
    return now >= at && now - at < DAY;
  });
  for (const e of due) reminded[e.id] = now;
  if (due.length === 1) {
    const e = due[0];
    const h = Number(metas[e.id]?.prefs?.remind ?? cfg.remindHours);
    notes.push({id: `remind|${e.id}|0`, title: 'Pas encore ouvert', message: `${nameOf(e, names)} n’a pas ouvert « ${e.subject || '(sans objet)'} », envoyé il y a ${delay(h)}. Pensez à relancer.`});
  } else if (due.length > 1) {
    notes.push({id: `remind||${now}`, title: `${due.length} mails pas encore ouverts`, message: due.slice(0, 3).map((e) => `${nameOf(e, names)} · ${e.subject || '(sans objet)'}`).join('\n') + (due.length > 3 ? `\n+ ${due.length - 3} autres` : '')});
  }

  // le récap du matin, une fois par jour
  const today = new Date(now).toDateString();
  let lastDaily = local.lastDaily;
  if (cfg.dailyReport && lastDaily !== today && new Date(now).getHours() >= 9) {
    lastDaily = today;
    const since = now - DAY;
    const nOpen = emails.filter((e) => ts(e.last_open_at) > since).length;
    const nClick = emails.filter((e) => ts(e.last_click_at) > since).length;
    const h = cfg.remindHours || 72;
    const nFollow = emails.filter((e) => !opened(e) && now - ts(e.sent_at || e.created_at) > h * HOUR && now - ts(e.sent_at || e.created_at) < 30 * DAY).length;
    const parts = [nOpen && `${plural(nOpen, 'mail')} ouvert${nOpen > 1 ? 's' : ''} depuis hier`, nClick && `${plural(nClick, 'lien')} cliqué${nClick > 1 ? 's' : ''}`, nFollow && `${nFollow} à relancer`].filter(Boolean);
    if (parts.length) notes.push({id: `daily||${today}`, title: 'Votre récap du jour', message: parts.join(' · ')});
  }

  for (const n of notes) chrome.notifications.create(n.id, {type: 'basic', iconUrl: 'icons/icon128.png', title: n.title, message: n.message, priority: 1});
  await chrome.storage.local.set({seen: next, reminded, lastDaily});
}

/* ——— Clic sur une notification : Gmail au premier plan, détail du mail ouvert ——— */
async function openInGmail(id) {
  if (id) await chrome.storage.local.set({pendingOpen: {id, at: Date.now()}});
  const tabs = await chrome.tabs.query({url: 'https://mail.google.com/*'}).catch(() => []);
  const tab = tabs.find((t) => t.active) || tabs[0];
  if (!tab) {
    await chrome.tabs.create({url: 'https://mail.google.com/mail/'});
    return;
  }
  await chrome.tabs.update(tab.id, {active: true});
  await chrome.windows.update(tab.windowId, {focused: true}).catch(() => {});
  const r = await chrome.tabs.sendMessage(tab.id, {type: 'open-panel', id}).catch(() => null);
  if (r?.ok) await chrome.storage.local.remove('pendingOpen');
}
chrome.notifications.onClicked?.addListener((nid) => {
  const id = nid.split('|')[1] || null;
  chrome.notifications.clear(nid);
  openInGmail(id).catch(() => {});
});

/* ——— Mise en place ——— */
async function setup() {
  const current = await chrome.storage.sync.get(['apiBase', 'apiToken']);
  await chrome.storage.sync.set({apiBase: current.apiBase || DEFAULTS.apiBase, apiToken: current.apiToken || DEFAULTS.apiToken});
  const {lastDaily} = await chrome.storage.local.get('lastDaily');
  if (!lastDaily) await chrome.storage.local.set({lastDaily: new Date().toDateString()});
  chrome.alarms.create('poll-tracking', {periodInMinutes: POLL_MINUTES});
  await installPixelGuard();
}
chrome.runtime.onInstalled.addListener(() => setup().catch(() => {}));
/** les liens notés à l'envoi sont gardés six mois */
async function pruneMeta() {
  const all = await chrome.storage.local.get(null);
  const old = Object.keys(all).filter((k) => k.startsWith('meta:') && Date.now() - (all[k]?.at || 0) > 180 * DAY);
  if (old.length) await chrome.storage.local.remove(old);
}
chrome.runtime.onStartup.addListener(() => {
  installPixelGuard().catch(() => {});
  pruneMeta().catch(() => {});
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.apiBase) installPixelGuard().catch(() => {});
  if (area === 'sync' && (changes.apiBase || changes.apiToken)) { cachedEmails = []; lastFetchAt = 0; clickCache.clear(); }
});
chrome.alarms.onAlarm.addListener((alarm) => (alarm.name === 'poll-tracking' ? poll().catch(() => {}) : undefined));

/* ——— Messages de la page Gmail et du menu de l'extension ——— */
const handlers = {
  async config() {
    const cfg = await getConfig();
    const {apiToken, ...rest} = cfg;
    return {...rest, hasToken: Boolean(apiToken)};
  },
  async register(msg) {
    const data = await api('register', {body: {sender: msg.sender, recipient: msg.recipient, subject: msg.subject, source: 'gmail-extension-v3'}});
    return {id: data.id};
  },
  async 'mark-sent'(msg) {
    await markSent({id: msg.id, sender: msg.sender, recipient: msg.recipient, subject: msg.subject, links: msg.links, prefs: msg.prefs});
    return {};
  },
  async self(msg) {
    const key = `${msg.id}:${msg.kind}`;
    if (Date.now() - (lastSelf.get(key) || 0) < SELF_THROTTLE_MS) return {throttled: true};
    lastSelf.set(key, Date.now());
    await api('self', {body: {id: msg.id, viewer: msg.viewer, kind: msg.kind}});
    return {};
  },
  async refresh(msg) {
    return {emails: await fetchEmails(Boolean(msg.force))};
  },
  async stats(msg) {
    const ids = (msg.ids || []).filter(Boolean).slice(0, 100);
    if (!ids.length) return {emails: []};
    const data = await api('emails', {params: {limit: String(ids.length), ids: ids.join(',')}});
    return {emails: data.emails || []};
  },
  async details(msg) {
    return api('details', {params: {id: msg.id}});
  },
  async clicks() {
    return {rows: await clickReport()};
  },
  async 'open-settings'() {
    await chrome.runtime.openOptionsPage();
    return {};
  },
};

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  const fn = handlers[msg?.type];
  if (!fn) return false;
  fn(msg)
    .then((data) => sendResponse({ok: true, ...data}))
    .catch((error) => sendResponse({ok: false, error: error.message}));
  return true;
});
