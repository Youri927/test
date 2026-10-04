import {DEFAULTS} from './config.js';

const $ = (id) => document.getElementById(id);
const fmt = new Intl.DateTimeFormat('fr-FR', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});
const when = (v) => (v ? fmt.format(new Date(v)) : '—');
const esc = (s) => String(s ?? '').replace(/[&<>'"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[c]));
const opened = (e) => (e.open_count || 0) > 0 || (e.click_count || 0) > 0;

async function loadConfig() {
  const cfg = await chrome.storage.sync.get(['apiBase', 'apiToken', 'notificationsEnabled', 'trackingDefault']);
  $('apiBase').value = cfg.apiBase || DEFAULTS.apiBase;
  $('apiToken').value = cfg.apiToken || DEFAULTS.apiToken;
  $('notificationsEnabled').checked = cfg.notificationsEnabled !== false;
  $('trackingDefault').checked = cfg.trackingDefault !== false;
  return cfg;
}

async function saveConfig() {
  await chrome.storage.sync.set({
    apiBase: $('apiBase').value.trim().replace(/\/$/, ''),
    apiToken: $('apiToken').value.trim(),
    notificationsEnabled: $('notificationsEnabled').checked,
    trackingDefault: $('trackingDefault').checked,
  });
  $('settings').hidden = true;
  $('dashboard').hidden = false;
  refresh();
}

function render(emails) {
  $('sentCount').textContent = emails.length;
  $('openCount').textContent = emails.filter(opened).length;
  $('clickCount').textContent = emails.filter((e) => e.click_count > 0).length;
  $('status').textContent = `${emails.length} mail${emails.length > 1 ? 's' : ''} suivi${emails.length > 1 ? 's' : ''}`;
  if (!emails.length) {
    $('emails').innerHTML = '<div class="empty">Aucun mail suivi pour l’instant.<br>Le suivi s’active à côté du bouton Envoyer de Gmail.</div>';
    return;
  }
  $('emails').innerHTML = emails.slice(0, 40).map((e) => `
    <article class="email">
      <div class="email-top">
        <div class="recipient">${esc(e.recipient || 'Destinataire inconnu')}</div>
        <div class="time">${when(e.sent_at || e.created_at)}</div>
      </div>
      <div class="subject">${esc(e.subject || '(sans objet)')}</div>
      <div class="metrics">
        <span class="badge ${e.open_count ? 'on' : ''}">Ouvert ${e.open_count || 0}×</span>
        <span class="badge ${e.click_count ? 'click' : ''}">${e.click_count || 0} clic${e.click_count > 1 ? 's' : ''}</span>
        <span class="badge">Dernier signal : ${when([e.last_click_at, e.last_open_at].filter(Boolean).sort().at(-1))}</span>
      </div>
    </article>`).join('');
}

let busy = false;
async function refresh() {
  if (busy) return;
  busy = true;
  $('refreshBtn').disabled = true;
  $('status').textContent = 'Chargement…';
  chrome.runtime.sendMessage({type: 'refresh', force: true}, (r) => {
    busy = false;
    $('refreshBtn').disabled = false;
    if (chrome.runtime.lastError || !r?.ok) {
      $('status').textContent = r?.error || 'Service de l’extension injoignable';
      render([]);
      return;
    }
    render(r.emails || []);
  });
}

$('settingsBtn').addEventListener('click', async () => { await loadConfig(); $('dashboard').hidden = true; $('settings').hidden = false; });
$('backBtn').addEventListener('click', () => { $('settings').hidden = true; $('dashboard').hidden = false; });
$('saveBtn').addEventListener('click', saveConfig);
$('refreshBtn').addEventListener('click', refresh);
loadConfig().then(refresh);
