// Teste le service en arrière-plan (extension/background.js) avec un Chrome simulé.
// node --test tests/background.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';

const BASE = 'https://nhdetemdffwghujefffq.supabase.co/functions/v1/mail-tracker';
const store = {sync: {apiToken: 'tok', apiBase: BASE}, local: {}};
const listeners = {};
const calls = [];
const notes = [];
const tabMessages = [];
let rules = null;
let online = true;
let serverEmails = [];
let serverEvents = {};
let gmailTabs = [];

const area = (name) => ({
  async get(keys) {
    const src = store[name];
    if (typeof keys === 'string') return {[keys]: src[keys]};
    return Object.fromEntries((keys || Object.keys(src)).filter((k) => k in src).map((k) => [k, src[k]]));
  },
  async set(obj) { Object.assign(store[name], obj); },
  async remove(key) { delete store[name][key]; },
});
const ev = (name) => ({addListener: (fn) => { listeners[name] = fn; }});
globalThis.chrome = {
  storage: {sync: area('sync'), local: area('local'), onChanged: ev('storage')},
  runtime: {onInstalled: ev('installed'), onStartup: ev('startup'), onMessage: ev('message'), openOptionsPage: async () => {}},
  alarms: {create() {}, onAlarm: ev('alarm')},
  notifications: {create: (id, o) => notes.push({id, ...o}), clear() {}, onClicked: ev('notifClick')},
  tabs: {
    query: async () => gmailTabs,
    update: async () => {},
    create: async (o) => tabMessages.push({created: o.url}),
    sendMessage: async (id, msg) => { tabMessages.push({id, ...msg}); return {ok: true}; },
  },
  windows: {update: async () => {}},
  declarativeNetRequest: {updateDynamicRules: async (r) => { rules = r; }},
};
globalThis.fetch = async (url, opts = {}) => {
  calls.push({url, opts});
  if (!online) throw new Error('hors ligne');
  const u = new URL(url);
  const action = u.searchParams.get('action');
  const body = action === 'register' ? {id: 'NEW1'}
    : action === 'emails' ? {emails: serverEmails}
    : action === 'details' ? {email: serverEmails.find((e) => e.id === u.searchParams.get('id')), events: serverEvents[u.searchParams.get('id')] || []}
    : {ok: true};
  return {ok: true, status: 200, json: async () => body};
};

await import('../extension/background.js');
const send = (msg) => new Promise((ok) => listeners.message(msg, {}, ok));
const poll = () => listeners.alarm({name: 'poll-tracking'});
const iso = (agoMs) => new Date(Date.now() - agoMs).toISOString();
const H = 3600e3;
const titles = () => notes.map((n) => n.title);

test('installation : règle qui bloque le pixel dans le Gmail de l’expéditeur seulement', async () => {
  await listeners.installed();
  const rule = rules.addRules[0];
  assert.equal(rule.action.type, 'block');
  assert.equal(rule.condition.urlFilter, '||nhdetemdffwghujefffq.supabase.co/functions/v1/mail-tracker?action=open');
  assert.deepEqual(rule.condition.initiatorDomains, ['mail.google.com']);
  assert.deepEqual(rule.condition.resourceTypes, ['image']);
});

test('réglages : valeurs par défaut transmises à Gmail, jeton jamais transmis', async () => {
  const r = await send({type: 'config'});
  assert.equal(r.ok, true);
  assert.equal(r.hasToken, true);
  assert.equal(r.apiToken, undefined);
  assert.equal(r.trackLinks, true);
  assert.equal(r.remindHours, 72);
  store.sync.trackLinks = false;
  assert.equal((await send({type: 'config'})).trackLinks, false);
  delete store.sync.trackLinks;
});

test('enregistrement : jeton envoyé, identifiant renvoyé', async () => {
  const r = await send({type: 'register', sender: 'moi@gmail.com', recipient: 'a@b.fr', subject: 'Hello'});
  assert.equal(r.ok, true);
  assert.equal(r.id, 'NEW1');
  const c = calls.at(-1);
  assert.equal(c.opts.headers.authorization, 'Bearer tok');
  assert.equal(JSON.parse(c.opts.body).sender, 'moi@gmail.com');
});

test('« envoyé » : gardé en file si le réseau manque, renvoyé ensuite ; liens et alertes gardés ici', async () => {
  online = false;
  const links = [{url: 'https://monsite.fr/offre', text: 'notre offre', tracked: true}, {url: 'https://agenda.fr', text: 'agenda', tracked: false}];
  await send({type: 'mark-sent', id: 'NEW1', sender: 'moi@gmail.com', recipient: 'a@b.fr', subject: 'Hello', links, prefs: {open: true, click: false, remind: 24}});
  assert.equal(store.local.pendingSent.length, 1);
  assert.deepEqual(store.local['meta:NEW1'].links, links);
  assert.equal(store.local['meta:NEW1'].prefs.remind, 24);
  online = true;
  await poll();
  assert.equal(store.local.pendingSent.length, 0);
  const update = calls.find((c) => c.url.includes('action=update') && c.opts.body && JSON.parse(c.opts.body).sent === true);
  assert.ok(update);
  assert.equal(JSON.parse(update.opts.body).links, undefined, 'les liens ne partent pas au serveur');
});

test('notifications : ouverture, ré-ouverture, clic (avec le lien), lu plusieurs fois', async () => {
  store.local.ptNames = {'jean@acme.fr': 'Jean Dupont'};
  const mail = (o, c) => [{id: 'E1', recipient: 'jean@acme.fr', subject: 'Offre', sent_at: iso(2 * H), open_count: o, click_count: c, last_open_at: o ? iso(0) : null, last_click_at: c ? iso(0) : null}];
  serverEmails = mail(0, 0);
  await poll();
  serverEmails = mail(1, 0);
  await poll();
  serverEmails = mail(2, 0);
  await poll();
  serverEvents.E1 = [{type: 'click', counted: true, url: 'https://monsite.fr/offre', created_at: iso(0)}];
  serverEmails = mail(3, 1);
  await poll();
  assert.deepEqual(titles(), ['E-mail ouvert', 'E-mail ré-ouvert (2e fois)', 'Lien cliqué', 'Lu plusieurs fois']);
  assert.equal(notes[0].message, 'Jean Dupont a ouvert « Offre »');
  assert.equal(notes[2].message, 'Jean Dupont a cliqué « monsite.fr/offre » dans « Offre »');
  assert.match(notes[3].message, /3 fois en 24 h/);
  assert.ok(notes.every((n) => n.id.split('|')[1] === 'E1'), 'chaque notification sait de quel mail elle parle');
});

test('alertes du mail respectées : pas de notification de clic si on l’a coupée pour ce mail', async () => {
  notes.length = 0;
  store.local['meta:E2'] = {prefs: {click: false}};
  const m = (c) => [{id: 'E2', recipient: 'x@y.fr', subject: 'Devis', sent_at: iso(H), open_count: 1, click_count: c, last_open_at: iso(H), last_click_at: c ? iso(0) : null}];
  serverEmails = m(0);
  await poll();
  serverEmails = m(1);
  await poll();
  assert.deepEqual(titles(), []);
});

test('vieux mail ré-ouvert après une semaine : « Ré-ouvert après N jours »', async () => {
  notes.length = 0;
  const m = (o, last) => [{id: 'E3', recipient: 'x@y.fr', subject: 'Site', sent_at: iso(20 * 24 * H), open_count: o, click_count: 0, last_open_at: last}];
  serverEmails = m(1, iso(12 * 24 * H));
  await poll();
  serverEmails = m(2, iso(0));
  await poll();
  assert.deepEqual(titles(), ['Ré-ouvert après 12 jours']);
});

test('relance : pas ouvert au bout du délai, une seule fois ; délai propre au mail respecté', async () => {
  notes.length = 0;
  store.local['meta:E5'] = {prefs: {remind: 24}};
  serverEmails = [
    {id: 'E4', recipient: 'a@a.fr', subject: 'Trois jours', sent_at: iso(73 * H), open_count: 0, click_count: 0},
    {id: 'E5', recipient: 'b@b.fr', subject: 'Un jour', sent_at: iso(25 * H), open_count: 0, click_count: 0},
    {id: 'E6', recipient: 'c@c.fr', subject: 'Trop tôt', sent_at: iso(30 * H), open_count: 0, click_count: 0},
    {id: 'E7', recipient: 'd@d.fr', subject: 'Trop vieux', sent_at: iso(30 * 24 * H), open_count: 0, click_count: 0},
  ];
  await poll();
  assert.deepEqual(titles(), ['2 mails pas encore ouverts']);
  assert.match(notes[0].message, /Trois jours/);
  assert.match(notes[0].message, /Un jour/);
  assert.doesNotMatch(notes[0].message, /Trop/);
  await poll();
  assert.equal(notes.length, 1, 'pas de seconde relance');
});

test('clic sur une notification : Gmail au premier plan, détail du mail ouvert', async () => {
  gmailTabs = [{id: 7, windowId: 1, active: false}];
  await listeners.notifClick('open|E1|1');
  await new Promise((r) => setTimeout(r, 20));
  assert.deepEqual(tabMessages.at(-1), {id: 7, type: 'open-panel', id: 'E1'});
  gmailTabs = [];
  await listeners.notifClick('daily||x');
  await new Promise((r) => setTimeout(r, 20));
  assert.match(tabMessages.at(-1).created, /mail\.google\.com/);
});

test('rapport des clics : chaque lien cliqué, combien de fois, dernier clic', async () => {
  serverEmails = [{id: 'E8', recipient: 'jean@acme.fr', subject: 'Offre', open_count: 2, click_count: 3, last_click_at: iso(0)}];
  serverEvents.E8 = [
    {type: 'click', counted: true, url: 'https://monsite.fr/offre', created_at: iso(3 * H)},
    {type: 'click', counted: true, url: 'https://monsite.fr/offre', created_at: iso(H)},
    {type: 'click', counted: false, reason: 'bot', url: 'https://monsite.fr/offre', created_at: iso(5 * H)},
    {type: 'click', counted: true, url: 'https://monsite.fr/rdv', created_at: iso(0)},
  ];
  const r = await send({type: 'refresh', force: true}).then(() => send({type: 'clicks'}));
  assert.equal(r.ok, true);
  assert.deepEqual(r.rows.map((x) => `${x.url} ${x.count}`), ['https://monsite.fr/rdv 1', 'https://monsite.fr/offre 2']);
  assert.equal(r.rows[0].recipient, 'jean@acme.fr');
});

test('récap du matin : une fois par jour, à partir de 9 h, seulement s’il y a quelque chose', async () => {
  const realNow = Date.now;
  const morning = new Date();
  morning.setHours(10, 0, 0, 0);
  Date.now = () => morning.getTime();
  try {
    notes.length = 0;
    store.local.lastDaily = 'hier';
    serverEmails = [
      {id: 'R1', recipient: 'a@a.fr', subject: 'A', sent_at: iso(30 * H), open_count: 1, click_count: 1, last_open_at: iso(2 * H), last_click_at: iso(2 * H)},
      {id: 'R2', recipient: 'b@b.fr', subject: 'B', sent_at: iso(5 * 24 * H), open_count: 0, click_count: 0},
    ];
    store.local.reminded = {R2: Date.now()};
    await poll();
    const daily = notes.filter((n) => n.title === 'Votre récap du jour');
    assert.equal(daily.length, 1);
    assert.equal(daily[0].message, '1 mail ouvert depuis hier · 1 lien cliqué · 1 à relancer');
    await poll();
    assert.equal(notes.filter((n) => n.title === 'Votre récap du jour').length, 1, 'une seule fois par jour');
  } finally {
    Date.now = realNow;
  }
});

test('sans jeton : message clair', async () => {
  store.sync.apiToken = '';
  const r = await send({type: 'refresh', force: true});
  assert.equal(r.ok, false);
  assert.match(r.error, /Jeton manquant/);
});
