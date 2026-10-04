import {DEFAULTS, PREFS} from './config.js';

const $ = (id) => document.getElementById(id);
const fmtDay = new Intl.DateTimeFormat('fr-FR', {day: 'numeric', month: 'short'});
const fmtTime = new Intl.DateTimeFormat('fr-FR', {hour: '2-digit', minute: '2-digit'});
const esc = (s) => String(s ?? '').replace(/[&<>'"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[c]));
const opened = (e) => (e.open_count || 0) > 0 || (e.click_count || 0) > 0;
const clicked = (e) => (e.click_count || 0) > 0;
const ts = (iso) => (iso ? Date.parse(iso) || 0 : 0);
const times = (n) => (n === 1 ? '1 fois' : `${n} fois`);
const ICON = {
  tick: '<path d="M4.5 12.5l4.5 4.5L19.5 6.5"/>',
  ticks: '<path d="M1.5 12.5L6 17 16.5 6.5"/><path d="M10 15.5l1.5 1.5L22 6.5"/>',
  link: '<path d="M10 13.5a3.75 3.75 0 0 0 5.3.2l2.9-2.9a3.75 3.75 0 0 0-5.3-5.3l-1.2 1.2"/><path d="M14 10.5a3.75 3.75 0 0 0-5.3-.2l-2.9 2.9a3.75 3.75 0 0 0 5.3 5.3l1.2-1.2"/>',
  inbox: '<path d="M3.5 13.5l2.6-7.2A2 2 0 0 1 8 5h8a2 2 0 0 1 1.9 1.3l2.6 7.2V18a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18z"/><path d="M3.5 13.5h4.5l1.5 2.5h5l1.5-2.5h4.5"/>',
};
const icon = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;

function ago(iso) {
  if (!iso) return '';
  const min = Math.max(0, Math.round((Date.now() - ts(iso)) / 60000));
  if (min < 1) return 'à l’instant';
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  return `le ${fmtDay.format(new Date(iso))}`;
}
const shortWhen = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toDateString() === new Date().toDateString() ? fmtTime.format(d) : fmtDay.format(d);
};
const lastActivity = (e) => Math.max(ts(e.last_click_at), ts(e.last_open_at), ts(e.sent_at || e.created_at));

let names = {};

function setConn(kind, text) {
  $('conn').className = `conn ${kind}`;
  $('conn').querySelector('span').textContent = text;
}

const prefInputs = () => [...document.querySelectorAll('[data-pref]')];

async function loadConfig() {
  const cfg = await chrome.storage.sync.get(['apiBase', 'apiToken', 'notificationsEnabled', ...Object.keys(PREFS)]);
  $('apiBase').value = cfg.apiBase || DEFAULTS.apiBase;
  $('apiToken').value = cfg.apiToken || DEFAULTS.apiToken;
  const mute = cfg.notificationsEnabled === false; // ancien interrupteur unique (v3.0)
  for (const el of prefInputs()) {
    const k = el.dataset.pref;
    let v = cfg[k] === undefined ? PREFS[k] : cfg[k];
    if (mute && /^notify|^dailyReport$/.test(k)) v = false;
    if (el.type === 'checkbox') el.checked = v !== false;
    else el.value = String(v);
  }
  if (!$('apiToken').value) $('settings').querySelector('.advanced').open = true;
  return cfg;
}

async function saveConfig() {
  const prefs = Object.fromEntries(prefInputs().map((el) => [el.dataset.pref, el.type === 'checkbox' ? el.checked : Number(el.value) || 0]));
  await chrome.storage.sync.set({
    apiBase: $('apiBase').value.trim().replace(/\/$/, ''),
    apiToken: $('apiToken').value.trim(),
    notificationsEnabled: true,
    ...prefs,
  });
  $('saved').hidden = false;
  setTimeout(() => { $('saved').hidden = true; if (!asPage) show('dashboard'); refresh(); }, 1200);
}

function show(view) {
  $('settings').hidden = view !== 'settings';
  $('dashboard').hidden = view !== 'dashboard';
  document.body.dataset.view = view;
}

function row(e) {
  const email = String(e.recipient || '').split(',')[0].trim().toLowerCase();
  const more = String(e.recipient || '').split(',').filter((s) => s.trim()).length - 1;
  const name = names[email] || email || 'Destinataire inconnu';
  const state = clicked(e) ? 'clicked' : opened(e) ? 'opened' : 'sent';
  const meta = (e.open_count || 0) > 0 ? `Ouvert ${times(e.open_count)} · ${ago(e.last_open_at)}` : clicked(e) ? 'Ouvert' : 'Pas encore ouvert';
  const q = `in:sent subject:"${String(e.subject || '').replace(/"/g, '')}"${email ? ` to:${email}` : ''}`;
  return `
    <button class="email" data-q="${esc(q)}" title="Retrouver ce mail dans Gmail">
      <span class="status s-${state}">${icon(opened(e) ? 'ticks' : 'tick')}</span>
      <span class="main">
        <span class="top"><b>${esc(name)}${more > 0 ? ` <em>+${more}</em>` : ''}</b><time>${esc(shortWhen(e.sent_at || e.created_at))}</time></span>
        <span class="subject">${esc(e.subject || '(sans objet)')}</span>
        <span class="meta"><span class="${opened(e) ? 'm-open' : 'm-sent'}">${esc(meta)}</span>${clicked(e) ? `<span class="m-click">${icon('link')}${e.click_count === 1 ? '1 clic' : `${e.click_count} clics`}</span>` : ''}</span>
      </span>
    </button>`;
}

function render(emails) {
  const total = emails.length;
  const nOpen = emails.filter(opened).length;
  const rate = total ? Math.round((nOpen / total) * 100) : 0;
  $('sentCount').textContent = total;
  $('openCount').textContent = nOpen;
  $('clickCount').textContent = emails.filter(clicked).length;
  $('rate').textContent = `${rate} %`;
  $('rateBar').style.width = `${rate}%`;
  if (!total) {
    $('emails').innerHTML = `<div class="empty"><span>${icon('inbox')}</span><b>Aucun mail suivi pour l’instant</b>Le suivi s’active à côté du bouton Envoyer de Gmail.</div>`;
    return;
  }
  // les mails qui viennent de bouger d'abord
  $('emails').innerHTML = [...emails].sort((a, b) => lastActivity(b) - lastActivity(a)).slice(0, 30).map(row).join('');
}

let busy = false;
async function refresh() {
  if (busy) return;
  busy = true;
  $('refreshBtn').classList.add('spin');
  chrome.runtime.sendMessage({type: 'refresh', force: true}, (r) => {
    busy = false;
    $('refreshBtn').classList.remove('spin');
    if (chrome.runtime.lastError || !r?.ok) {
      const err = r?.error || 'Service de l’extension injoignable';
      setConn('ko', /jeton/i.test(err) ? 'Jeton manquant (réglages)' : err);
      render([]);
      return;
    }
    setConn('ok', 'Connecté · suivi actif');
    render(r.emails || []);
  });
}

$('settingsBtn').addEventListener('click', async () => { await loadConfig(); show(document.body.dataset.view === 'settings' ? 'dashboard' : 'settings'); });
$('backBtn').addEventListener('click', () => show('dashboard'));
$('saveBtn').addEventListener('click', saveConfig);
$('refreshBtn').addEventListener('click', refresh);
$('gmailBtn').addEventListener('click', () => chrome.tabs.create({url: 'https://mail.google.com/mail/'}));
$('emails').addEventListener('click', (e) => {
  const b = e.target.closest('[data-q]');
  if (b) chrome.tabs.create({url: `https://mail.google.com/mail/#search/${encodeURIComponent(b.dataset.q)}`});
});

// ouvert comme page de réglages (lien « Réglages par défaut » de Gmail) plutôt que comme menu de l'extension
const asPage = new URLSearchParams(location.search).has('page') || Boolean(chrome.extension?.getViews && !chrome.extension.getViews({type: 'popup'}).includes(window));
if (asPage) document.body.classList.add('page');
show(asPage ? 'settings' : 'dashboard');
Promise.all([loadConfig(), chrome.storage.local.get('ptNames').catch(() => ({}))]).then(([, local]) => {
  names = local?.ptNames || {};
  refresh();
});
