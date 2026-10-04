// Tests de la fonction serveur, avec une base en mémoire.
// node --experimental-strip-types --test tests/server.test.ts
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeHandler} from '../supabase/functions/mail-tracker/handler.ts';
import type {EmailRow, EmailStats, EventRow, Store} from '../supabase/functions/mail-tracker/handler.ts';

const BASE = 'https://demo.supabase.co/functions/v1/mail-tracker';
const TOKEN = 'secret';
const GMAIL = 'Mozilla/5.0 (Windows NT 5.1; rv:11.0) Gecko Firefox/11.0 (via ggpht.com GoogleImageProxy)';
const CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

function memoryStore() {
  const emails = new Map<string, EmailRow>();
  const events: EventRow[] = [];
  const stats = (e: EmailRow): EmailStats => {
    const evs = events.filter((v) => v.email_id === e.id && v.counted);
    const opens = evs.filter((v) => v.type === 'open').map((v) => v.created_at).sort();
    const clicks = evs.filter((v) => v.type === 'click').map((v) => v.created_at).sort();
    return {...e, open_count: opens.length, click_count: clicks.length, first_open_at: opens[0] ?? null, last_open_at: opens.at(-1) ?? null, last_click_at: clicks.at(-1) ?? null};
  };
  const store: Store = {
    async getEmail(id) { return emails.get(id) ?? null; },
    async createEmail(row) { emails.set(row.id, {...row}); },
    async updateEmail(id, patch) { const e = emails.get(id); if (e) emails.set(id, {...e, ...patch}); },
    async addEvent(ev) { events.push({...ev}); },
    async events(id) { return events.filter((v) => v.email_id === id).sort((a, b) => b.created_at.localeCompare(a.created_at)); },
    async markSelf(id, since, types) { for (const v of events) if (v.email_id === id && v.counted && v.created_at >= since && types.includes(v.type)) { v.counted = false; v.reason = 'self'; } },
    async markBot(id, since) { for (const v of events) if (v.email_id === id && v.counted && v.created_at >= since && (v.type === 'click' || v.reason === 'implied')) { v.counted = false; v.reason = 'bot'; } },
    async listStats(limit, ids) { return [...emails.values()].filter((e) => e.sent_at && (!ids || ids.includes(e.id))).map(stats).slice(0, limit); },
    async getStats(id) { const e = emails.get(id); return e ? stats(e) : null; },
    async dropUnsent() {},
  };
  return {store, emails, events};
}

function setup() {
  let clock = Date.parse('2026-10-04T09:00:00Z');
  const mem = memoryStore();
  const handle = makeHandler(mem.store, {token: TOKEN, now: () => clock});
  const at = (ms: number) => { clock += ms; };
  const api = async (action: string, body?: unknown, params = '') => {
    const res = await handle(new Request(`${BASE}?action=${action}${params}`, {method: body ? 'POST' : 'GET', headers: {authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json'}, body: body ? JSON.stringify(body) : undefined}));
    return res.json() as Promise<any>;
  };
  const open = (id: string, ua = GMAIL, extra: Record<string, string> = {}) => handle(new Request(`${BASE}?action=open&id=${id}&v=1`, {headers: {'user-agent': ua, ...extra}}));
  const click = (id: string, u: string, ua = CHROME, method = 'GET') => handle(new Request(`${BASE}?action=click&id=${id}&u=${encodeURIComponent(u)}`, {method, headers: {'user-agent': ua}}));
  const send = async (sender = 'moi@gmail.com') => {
    const {id} = await api('register', {sender, recipient: 'prospect@acme.fr', subject: 'Votre site'});
    await api('update', {id, sent: true});
    return id as string;
  };
  return {mem, handle, at, api, open, click, send};
}

test('le pixel répond toujours, sans cache, même pour un mail inconnu', async () => {
  const s = setup();
  const res = await s.open('inconnu');
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'image/gif');
  assert.match(res.headers.get('cache-control') || '', /no-store/);
  assert.equal(s.mem.events.length, 1);
});

test('ouverture, doublon, puis ré-ouverture', async () => {
  const s = setup();
  const id = await s.send();
  s.at(5 * 60_000);
  await s.open(id);
  s.at(20_000);
  await s.open(id); // même ouverture (Gmail recharge l'image)
  s.at(2 * 3600_000);
  await s.open(id); // le lendemain matin, il relit
  const {email, events} = await s.api('details', undefined, `&id=${id}`);
  assert.equal(email.open_count, 2);
  assert.deepEqual(events.map((e: EventRow) => `${e.type}:${e.counted}:${e.reason}`).reverse(), ['open:true:gmail', 'open:false:dup', 'open:true:gmail']);
});

test('un clic sans ouverture détectée compte comme une ouverture', async () => {
  const s = setup();
  const id = await s.send();
  s.at(3600_000);
  const res = await s.click(id, 'https://monsite.fr/offre');
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('location'), 'https://monsite.fr/offre');
  const {email} = await s.api('details', undefined, `&id=${id}`);
  assert.equal(email.open_count, 1);
  assert.equal(email.click_count, 1);
});

test('un clic juste après une ouverture ne crée pas d’ouverture en plus', async () => {
  const s = setup();
  const id = await s.send();
  s.at(3600_000);
  await s.open(id);
  s.at(40_000);
  await s.click(id, 'https://monsite.fr/offre');
  const {email} = await s.api('details', undefined, `&id=${id}`);
  assert.equal(email.open_count, 1);
  assert.equal(email.click_count, 1);
});

test('les robots ne comptent pas : antivirus juste après l’envoi, HEAD, agents connus, rafales', async () => {
  const s = setup();
  const id = await s.send();
  s.at(3000);
  await s.click(id, 'https://monsite.fr/a'); // 3 s après l'envoi : un scanner
  s.at(60_000);
  await s.click(id, 'https://monsite.fr/a', CHROME, 'HEAD');
  await s.click(id, 'https://monsite.fr/a', 'python-requests/2.31');
  s.at(60_000);
  await s.click(id, 'https://monsite.fr/a'); // rafale : trois liens en une seconde
  s.at(300);
  await s.click(id, 'https://monsite.fr/b');
  s.at(300);
  await s.click(id, 'https://monsite.fr/c');
  const {email} = await s.api('details', undefined, `&id=${id}`);
  assert.equal(email.click_count, 0);
  assert.equal(email.open_count, 0);
});

test('un vrai clic, puis un double-clic sur le même lien', async () => {
  const s = setup();
  const id = await s.send();
  s.at(600_000);
  await s.click(id, 'https://monsite.fr/a');
  s.at(800);
  await s.click(id, 'https://monsite.fr/a');
  const {email} = await s.api('details', undefined, `&id=${id}`);
  assert.equal(email.click_count, 1);
});

test('l’expéditeur qui relit son propre mail n’est pas compté, un autre compte si', async () => {
  const s = setup();
  const id = await s.send('moi@gmail.com');
  s.at(3600_000);
  await s.open(id); // l'image passe par le proxy de Gmail : on ne sait pas encore qui c'est
  s.at(2000);
  await s.api('self', {id, viewer: 'Moi@Gmail.com', kind: 'view'}); // l'extension signale que c'est l'expéditeur
  s.at(5000);
  await s.open(id); // pendant qu'il le regarde
  let d = await s.api('details', undefined, `&id=${id}`);
  assert.equal(d.email.open_count, 0);
  s.at(3600_000);
  const r = await s.api('self', {id, viewer: 'test@autre.fr', kind: 'view'}); // test envoyé à soi-même sur un autre compte
  assert.equal(r.ignored, 'pas-expediteur');
  await s.open(id);
  d = await s.api('details', undefined, `&id=${id}`);
  assert.equal(d.email.open_count, 1);
});

test('le pixel chargé depuis Gmail lui-même (fenêtre de rédaction) est à l’expéditeur', async () => {
  const s = setup();
  const id = await s.send();
  await s.open(id, CHROME, {referer: 'https://mail.google.com/'});
  const d = await s.api('details', undefined, `&id=${id}`);
  assert.equal(d.email.open_count, 0);
  assert.equal(d.events[0].reason, 'self');
});

test('le propre clic de l’expéditeur ne compte pas', async () => {
  const s = setup();
  const id = await s.send('moi@gmail.com');
  s.at(3600_000);
  await s.api('self', {id, viewer: 'moi@gmail.com', kind: 'click'});
  s.at(500);
  const res = await s.click(id, 'https://monsite.fr/a');
  assert.equal(res.status, 302);
  const d = await s.api('details', undefined, `&id=${id}`);
  assert.equal(d.email.click_count, 0);
  assert.equal(d.email.open_count, 0);
});

test('anciens formats d’adresse, lien invalide, accès protégé', async () => {
  const s = setup();
  const id = await s.send();
  s.at(3600_000);
  await s.handle(new Request(`${BASE}/open/${id}.gif`, {headers: {'user-agent': GMAIL}}));
  const d = await s.api('details', undefined, `&id=${id}`);
  assert.equal(d.email.open_count, 1);
  const bad = await s.handle(new Request(`${BASE}?action=click&id=${id}&u=javascript:alert(1)`));
  assert.equal(bad.status, 400);
  const noAuth = await s.handle(new Request(`${BASE}?action=emails`));
  assert.equal(noAuth.status, 401);
});

test('la liste ne montre que les mails partis ; une première ouverture vaut envoi', async () => {
  const s = setup();
  const {id: draft} = await s.api('register', {sender: 'moi@gmail.com', subject: 'Brouillon'});
  const {id: lost} = await s.api('register', {sender: 'moi@gmail.com', subject: 'Envoi non signalé'});
  let list = await s.api('emails');
  assert.equal(list.emails.length, 0);
  s.at(3600_000);
  await s.open(lost);
  list = await s.api('emails');
  assert.deepEqual(list.emails.map((e: EmailStats) => e.id), [lost]);
  assert.ok(draft);
});
