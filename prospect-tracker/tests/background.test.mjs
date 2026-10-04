// Teste le service en arrière-plan (extension/background.js) avec un Chrome simulé.
// node --test tests/background.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';

const BASE = 'https://nhdetemdffwghujefffq.supabase.co/functions/v1/mail-tracker';
const store = {sync: {apiToken: 'tok', apiBase: BASE}, local: {}};
const listeners = {};
const calls = [];
const notes = [];
let rules = null;
let online = true;
let serverEmails = [];

const area = (name) => ({
  async get(keys) {
    const src = store[name];
    if (typeof keys === 'string') return {[keys]: src[keys]};
    return Object.fromEntries((keys || Object.keys(src)).filter((k) => k in src).map((k) => [k, src[k]]));
  },
  async set(obj) { Object.assign(store[name], obj); },
});
const ev = (name) => ({addListener: (fn) => { listeners[name] = fn; }});
globalThis.chrome = {
  storage: {sync: area('sync'), local: area('local'), onChanged: ev('storage')},
  runtime: {onInstalled: ev('installed'), onStartup: ev('startup'), onMessage: ev('message')},
  alarms: {create() {}, onAlarm: ev('alarm')},
  notifications: {create: (id, o) => notes.push({id, ...o})},
  declarativeNetRequest: {updateDynamicRules: async (r) => { rules = r; }},
};
globalThis.fetch = async (url, opts = {}) => {
  calls.push({url, opts});
  if (!online) throw new Error('hors ligne');
  const action = new URL(url).searchParams.get('action');
  const body = action === 'register' ? {id: 'NEW1'} : action === 'emails' ? {emails: serverEmails} : {ok: true};
  return {ok: true, status: 200, json: async () => body};
};

await import('../extension/background.js');
const send = (msg) => new Promise((ok) => listeners.message(msg, {}, ok));

test('installation : règle qui bloque le pixel dans le Gmail de l’expéditeur seulement', async () => {
  await listeners.installed();
  const rule = rules.addRules[0];
  assert.equal(rule.action.type, 'block');
  assert.equal(rule.condition.urlFilter, '||nhdetemdffwghujefffq.supabase.co/functions/v1/mail-tracker?action=open');
  assert.deepEqual(rule.condition.initiatorDomains, ['mail.google.com']);
  assert.deepEqual(rule.condition.resourceTypes, ['image']);
});

test('enregistrement : jeton envoyé, identifiant renvoyé', async () => {
  const r = await send({type: 'register', sender: 'moi@gmail.com', recipient: 'a@b.fr', subject: 'Hello'});
  assert.equal(r.ok, true);
  assert.equal(r.id, 'NEW1');
  const c = calls.at(-1);
  assert.equal(c.opts.headers.authorization, 'Bearer tok');
  assert.equal(JSON.parse(c.opts.body).sender, 'moi@gmail.com');
});

test('« envoyé » : gardé en file si le réseau manque, renvoyé ensuite', async () => {
  online = false;
  await send({type: 'mark-sent', id: 'NEW1', sender: 'moi@gmail.com', recipient: 'a@b.fr', subject: 'Hello'});
  assert.equal(store.local.pendingSent.length, 1);
  online = true;
  await listeners.alarm({name: 'poll-tracking'});
  assert.equal(store.local.pendingSent.length, 0);
  const update = calls.find((c) => c.url.includes('action=update') && c.opts.body && JSON.parse(c.opts.body).sent === true);
  assert.ok(update);
});

test('notifications : première ouverture, ré-ouverture, clic', async () => {
  serverEmails = [{id: 'E1', recipient: 'Jean', subject: 'Offre', open_count: 0, click_count: 0}];
  await listeners.alarm({name: 'poll-tracking'});
  serverEmails = [{id: 'E1', recipient: 'Jean', subject: 'Offre', open_count: 1, click_count: 0}];
  await listeners.alarm({name: 'poll-tracking'});
  serverEmails = [{id: 'E1', recipient: 'Jean', subject: 'Offre', open_count: 2, click_count: 0}];
  await listeners.alarm({name: 'poll-tracking'});
  serverEmails = [{id: 'E1', recipient: 'Jean', subject: 'Offre', open_count: 3, click_count: 1}];
  await listeners.alarm({name: 'poll-tracking'});
  assert.deepEqual(notes.map((n) => n.title), ['E-mail ouvert', 'E-mail ré-ouvert (2e fois)', 'Lien cliqué']);
});

test('sans jeton : message clair', async () => {
  store.sync.apiToken = '';
  const r = await send({type: 'refresh', force: true});
  assert.equal(r.ok, false);
  assert.match(r.error, /Jeton manquant/);
});
