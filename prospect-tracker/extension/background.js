// Prospect Tracker : le service en arrière-plan. Tous les appels au serveur passent par ici
// (la page Gmail n'en fait aucun), avec une file d'attente pour ne perdre aucun « mail envoyé ».
import {DEFAULTS} from './config.js';

const POLL_MINUTES = 1;
const FETCH_THROTTLE_MS = 4000;
const SELF_THROTTLE_MS = 15000;

let cachedEmails = [];
let lastFetchAt = 0;
let fetchPromise = null;
const lastSelf = new Map();

async function getConfig() {
  const cfg = await chrome.storage.sync.get(['apiBase', 'apiToken', 'notificationsEnabled', 'trackingDefault']);
  return {
    apiBase: (cfg.apiBase || DEFAULTS.apiBase).replace(/\/$/, ''),
    apiToken: cfg.apiToken || DEFAULTS.apiToken,
    notificationsEnabled: cfg.notificationsEnabled !== false,
    trackingDefault: cfg.trackingDefault !== false,
  };
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
      await api('update', {body: {...item, sent: true}});
    } catch {
      if (Date.now() - item.queuedAt < 3 * 86400_000) left.push(item);
    }
  }
  await chrome.storage.local.set({pendingSent: left});
}

async function markSent(item) {
  const {pendingSent = []} = await chrome.storage.local.get('pendingSent');
  pendingSent.push({...item, queuedAt: Date.now()});
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

/* ——— Notifications : première ouverture, ré-ouverture, clic ——— */
function host(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

async function poll() {
  await flushSent().catch(() => {});
  const {notificationsEnabled} = await getConfig();
  let emails = [];
  try {
    emails = await fetchEmails(true);
  } catch {
    return;
  }
  const {seen = {}} = await chrome.storage.local.get('seen');
  const next = {};
  for (const e of emails) {
    const before = seen[e.id];
    next[e.id] = {open_count: e.open_count || 0, click_count: e.click_count || 0};
    if (!before || !notificationsEnabled) continue;
    const who = e.recipient || 'Votre contact';
    const subject = e.subject || '(sans objet)';
    if ((e.click_count || 0) > before.click_count) {
      chrome.notifications.create(`click-${e.id}-${e.click_count}`, {
        type: 'basic', iconUrl: 'icons/icon128.png', title: 'Lien cliqué',
        message: `${who} a cliqué sur un lien de « ${subject} »`,
      });
    } else if ((e.open_count || 0) > before.open_count) {
      const n = e.open_count || 0;
      chrome.notifications.create(`open-${e.id}-${n}`, {
        type: 'basic', iconUrl: 'icons/icon128.png',
        title: before.open_count === 0 ? 'E-mail ouvert' : `E-mail ré-ouvert (${n}e fois)`,
        message: `${who} a ${before.open_count === 0 ? 'ouvert' : 'ré-ouvert'} « ${subject} »`,
      });
    }
  }
  await chrome.storage.local.set({seen: next});
}

/* ——— Mise en place ——— */
async function setup() {
  const current = await chrome.storage.sync.get(['apiBase', 'apiToken', 'notificationsEnabled', 'trackingDefault']);
  await chrome.storage.sync.set({
    apiBase: current.apiBase || DEFAULTS.apiBase,
    apiToken: current.apiToken || DEFAULTS.apiToken,
    notificationsEnabled: current.notificationsEnabled !== false,
    trackingDefault: current.trackingDefault !== false,
  });
  chrome.alarms.create('poll-tracking', {periodInMinutes: POLL_MINUTES});
  await installPixelGuard();
}
chrome.runtime.onInstalled.addListener(() => setup().catch(() => {}));
chrome.runtime.onStartup.addListener(() => installPixelGuard().catch(() => {}));
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.apiBase) installPixelGuard().catch(() => {});
  if (area === 'sync' && (changes.apiBase || changes.apiToken)) { cachedEmails = []; lastFetchAt = 0; }
});
chrome.alarms.onAlarm.addListener((alarm) => (alarm.name === 'poll-tracking' ? poll().catch(() => {}) : undefined));

/* ——— Messages de la page Gmail et du menu de l'extension ——— */
const handlers = {
  async config() {
    const {apiBase, trackingDefault, apiToken} = await getConfig();
    return {apiBase, trackingDefault, hasToken: Boolean(apiToken)};
  },
  async register(msg) {
    const data = await api('register', {body: {sender: msg.sender, recipient: msg.recipient, subject: msg.subject, source: 'gmail-extension-v3'}});
    return {id: data.id};
  },
  async 'mark-sent'(msg) {
    await markSent({id: msg.id, sender: msg.sender, recipient: msg.recipient, subject: msg.subject});
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
};

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  const fn = handlers[msg?.type];
  if (!fn) return false;
  fn(msg)
    .then((data) => sendResponse({ok: true, ...data}))
    .catch((error) => sendResponse({ok: false, error: error.message}));
  return true;
});
