// Prospect Tracker : fonction « mail-tracker » en un seul fichier (assemblée par tools/bundle.mjs).
// Tableau de bord Supabase → Edge Functions → mail-tracker → coller ce fichier à la place de index.ts.
// Désactiver « Verify JWT », et ajouter le secret TRACKER_TOKEN.

// Prospect Tracker : les règles qui décident si un signal compte.
// Fichier sans dépendance, partagé par la fonction (handler.ts) et les tests (tests/server.test.ts).

export const WINDOWS = {
  /** deux chargements du pixel à moins d'une minute d'écart = une seule ouverture */
  dupOpenMs: 60_000,
  /** un clic sans ouverture dans les 10 minutes précédentes compte aussi comme une ouverture */
  impliedOpenMs: 10 * 60_000,
  /** quand l'expéditeur affiche son propre mail, ce qui arrive 30 s avant ou après est à lui */
  selfMs: 30_000,
  /** un clic moins de 10 s après l'envoi vient d'un antivirus qui inspecte les liens, pas d'un humain */
  earlyClickMs: 10_000,
  /** plusieurs liens différents cliqués en moins de 2 s = un robot qui les ouvre tous */
  burstClickMs: 2_000,
  /** le même lien cliqué deux fois en moins de 3 s = un seul clic */
  dupClickMs: 3_000,
};

export type Reason =
  // comptés
  | 'gmail' | 'apple' | 'outlook' | 'yahoo' | 'other' | 'implied' | 'human'
  // ignorés
  | 'self' | 'dup' | 'bot';

export type Verdict = {counted: boolean; reason: Reason};

export type SignalContext = {
  now: number;
  method: string;
  userAgent: string;
  referer: string;
  sentAt: number | null;
  selfUntil: number | null;
};

/** d'où vient le chargement du pixel (le logiciel de messagerie du destinataire) */
export function mailClient(ua: string): 'gmail' | 'apple' | 'outlook' | 'yahoo' | 'other' {
  if (/GoogleImageProxy/i.test(ua)) return 'gmail';
  if (/YahooMailProxy/i.test(ua)) return 'yahoo';
  if (/Microsoft Outlook|ms-office|Outlook-iOS|Outlook-Android|MSOffice/i.test(ua)) return 'outlook';
  // la protection de la vie privée d'Apple Mail charge les images avec un agent réduit à « Mozilla/5.0 »
  if (/^Mozilla\/5\.0$/.test(ua.trim())) return 'apple';
  return 'other';
}

const BOT_UA = /bot\b|crawler|spider|preview|scanner|python|curl|wget|libwww|java\/|go-http|okhttp|axios|node-fetch|undici|headless|phantom|barracuda|proofpoint|mimecast|symantec|trend ?micro|fortinet|forcepoint|ironport|zscaler|safelinks|microsoft office|existence discovery|googleimageproxy|yahoomailproxy|whatsapp|slackbot|facebookexternalhit|linkedinbot|skypeuripreview|discordbot|telegrambot/i;

function isSelf(c: SignalContext): boolean {
  if (c.selfUntil && c.now <= c.selfUntil) return true;
  // le pixel chargé directement depuis Gmail (brouillon, fenêtre de rédaction) : c'est l'expéditeur
  return /^https?:\/\/mail\.google\.com\//i.test(c.referer) && !/GoogleImageProxy/i.test(c.userAgent);
}

/** Une ouverture (chargement du pixel) : compte-t-elle ? */
export function judgeOpen(c: SignalContext & {lastCountedOpen: number | null}): Verdict {
  if (isSelf(c)) return {counted: false, reason: 'self'};
  if (c.lastCountedOpen !== null && c.now - c.lastCountedOpen < WINDOWS.dupOpenMs) return {counted: false, reason: 'dup'};
  return {counted: true, reason: mailClient(c.userAgent)};
}

/** plusieurs liens différents en moins de 2 s : un robot les ouvre tous (les clics précédents de la rafale aussi) */
export function isBurst(c: {now: number; url: string; recentClicks: {at: number; url: string}[]}): boolean {
  return c.recentClicks.some((k) => k.url !== c.url && c.now - k.at < WINDOWS.burstClickMs);
}

/** Un clic : compte-t-il ? `recentClicks` : les clics de ce mail des dernières secondes */
export function judgeClick(c: SignalContext & {url: string; recentClicks: {at: number; url: string}[]}): Verdict {
  if (isSelf(c)) return {counted: false, reason: 'self'};
  if (c.method === 'HEAD' || BOT_UA.test(c.userAgent) || !c.userAgent.trim()) return {counted: false, reason: 'bot'};
  if (c.sentAt !== null && c.now - c.sentAt < WINDOWS.earlyClickMs) return {counted: false, reason: 'bot'};
  if (isBurst(c)) return {counted: false, reason: 'bot'};
  if (c.recentClicks.some((k) => k.url === c.url && c.now - k.at < WINDOWS.dupClickMs)) return {counted: false, reason: 'dup'};
  return {counted: true, reason: 'human'};
}

/** Après un clic compté : faut-il aussi noter une ouverture (le pixel a pu être bloqué) ? */
export function impliesOpen(now: number, lastCountedOpen: number | null): boolean {
  return lastCountedOpen === null || now - lastCountedOpen > WINDOWS.impliedOpenMs;
}

/** Seules les adresses web sont suivies et redirigées */
export function safeTarget(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
  } catch {
    return null;
  }
}

/** Lit l'action et l'identifiant, au format actuel (?action=open&id=…) comme aux anciens formats (…/open/ID.gif) */
export function parseRoute(url: URL): {action: string; id: string; target: string | null} {
  const q = url.searchParams;
  let action = (q.get('action') || '').toLowerCase();
  let id = q.get('id') || q.get('t') || '';
  if (!action) {
    const parts = url.pathname.split('/').filter(Boolean);
    const at = parts.findIndex((p) => p === 'mail-tracker');
    const rest = at >= 0 ? parts.slice(at + 1) : parts;
    if (rest.length >= 1) {
      const head = rest[0].toLowerCase();
      action = ({o: 'open', open: 'open', pixel: 'open', p: 'open', c: 'click', click: 'click', r: 'click', redirect: 'click'} as Record<string, string>)[head] || head;
      if (rest[1]) id = decodeURIComponent(rest[1]).replace(/\.(gif|png|jpe?g)$/i, '');
    }
  }
  const target = safeTarget(q.get('u') || q.get('url') || q.get('to'));
  return {action, id, target};
}

// Prospect Tracker : les routes de la fonction, indépendantes de la base (voir index.ts pour Supabase).
//
//  GET  ?action=open&id=…            pixel 1×1, jamais mis en cache
//  GET  ?action=click&id=…&u=…       note le clic puis redirige vers u
//  POST ?action=register             {sender, recipient, subject, source} → {id}
//  POST ?action=update               {id, recipient?, subject?, sender?, sent?}
//  POST ?action=self                 {id, viewer, kind: 'view' | 'click'} : l'expéditeur regarde son propre mail
//  GET  ?action=emails&limit=…&ids=… {emails: [...]}
//  GET  ?action=details&id=…         {email, events}
//
// Les routes register/update/self/emails/details demandent « Authorization: Bearer <TRACKER_TOKEN> ».


export type EmailRow = {
  id: string;
  sender: string | null;
  recipient: string | null;
  subject: string | null;
  source: string | null;
  created_at: string;
  sent_at: string | null;
  self_until: string | null;
};

export type EventRow = {
  email_id: string;
  type: 'open' | 'click';
  counted: boolean;
  reason: Reason;
  url: string | null;
  user_agent: string | null;
  created_at: string;
};

export type EmailStats = EmailRow & {
  open_count: number;
  click_count: number;
  first_open_at: string | null;
  last_open_at: string | null;
  last_click_at: string | null;
};

export interface Store {
  getEmail(id: string): Promise<EmailRow | null>;
  createEmail(row: EmailRow): Promise<void>;
  updateEmail(id: string, patch: Partial<EmailRow>): Promise<void>;
  addEvent(ev: EventRow): Promise<void>;
  /** les évènements d'un mail, du plus récent au plus ancien */
  events(id: string): Promise<EventRow[]>;
  /** l'expéditeur regardait : les signaux comptés depuis `since` deviennent les siens */
  markSelf(id: string, since: string, types: ('open' | 'click')[]): Promise<void>;
  /** une rafale de robot : les clics comptés depuis `since` (et les ouvertures qu'ils avaient déduites) ne comptent plus */
  markBot(id: string, since: string): Promise<void>;
  listStats(limit: number, ids: string[] | null): Promise<EmailStats[]>;
  getStats(id: string): Promise<EmailStats | null>;
  /** ménage : les brouillons enregistrés mais jamais envoyés */
  dropUnsent(olderThan: string): Promise<void>;
}

const GIF = Uint8Array.from(atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), (c) => c.charCodeAt(0));
const NO_CACHE = {
  'cache-control': 'no-store, no-cache, must-revalidate, private, max-age=0',
  pragma: 'no-cache',
  expires: '0',
};
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, content-type',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {status, headers: {'content-type': 'application/json; charset=utf-8', ...NO_CACHE, ...CORS}});

const newId = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(15));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const ms = (iso: string | null) => (iso ? Date.parse(iso) : null);
const lastCounted = (evs: EventRow[], type: 'open' | 'click') => {
  const e = evs.find((x) => x.type === type && x.counted);
  return e ? Date.parse(e.created_at) : null;
};
const clean = (v: unknown, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : null);

export function makeHandler(store: Store, opts: {token: string; now?: () => number}) {
  const now = opts.now ?? (() => Date.now());

  const authorized = (req: Request) => {
    const h = req.headers.get('authorization') || '';
    return Boolean(opts.token) && h === `Bearer ${opts.token}`;
  };

  async function open(req: Request, id: string) {
    try {
      if (id) {
        const t = now();
        const [email, evs] = await Promise.all([store.getEmail(id), store.events(id)]);
        const verdict = judgeOpen({
          now: t,
          method: req.method,
          userAgent: req.headers.get('user-agent') || '',
          referer: req.headers.get('referer') || '',
          sentAt: ms(email?.sent_at ?? null),
          selfUntil: ms(email?.self_until ?? null),
          lastCountedOpen: lastCounted(evs, 'open'),
        });
        await store.addEvent({email_id: id, type: 'open', counted: verdict.counted, reason: verdict.reason, url: null, user_agent: (req.headers.get('user-agent') || '').slice(0, 300), created_at: new Date(t).toISOString()});
        // si l'envoi n'a pas pu être signalé, la première ouverture vaut envoi
        if (email && !email.sent_at && verdict.counted) await store.updateEmail(id, {sent_at: new Date(t).toISOString()});
      }
    } catch (err) {
      console.error('open', err);
    }
    // le pixel répond toujours, même en cas d'erreur
    return new Response(req.method === 'HEAD' ? null : GIF, {headers: {'content-type': 'image/gif', 'content-length': String(GIF.length), ...NO_CACHE}});
  }

  async function click(req: Request, id: string, target: string | null) {
    if (!target) return new Response('Lien invalide', {status: 400, headers: NO_CACHE});
    try {
      if (id) {
        const t = now();
        const [email, evs] = await Promise.all([store.getEmail(id), store.events(id)]);
        const ua = req.headers.get('user-agent') || '';
        const recentClicks = evs.filter((e) => e.type === 'click' && t - Date.parse(e.created_at) < 10_000).map((e) => ({at: Date.parse(e.created_at), url: e.url || ''}));
        const ctx = {now: t, method: req.method, userAgent: ua, referer: req.headers.get('referer') || '', sentAt: ms(email?.sent_at ?? null), selfUntil: ms(email?.self_until ?? null)};
        const verdict = judgeClick({...ctx, url: target, recentClicks});
        const at = new Date(t).toISOString();
        if (verdict.reason === 'bot' && isBurst({now: t, url: target, recentClicks})) await store.markBot(id, new Date(t - WINDOWS.burstClickMs).toISOString());
        await store.addEvent({email_id: id, type: 'click', counted: verdict.counted, reason: verdict.reason, url: target, user_agent: ua.slice(0, 300), created_at: at});
        if (verdict.counted && impliesOpen(t, lastCounted(evs, 'open'))) {
          // le pixel a pu être bloqué : un clic prouve que le mail a été ouvert
          await store.addEvent({email_id: id, type: 'open', counted: true, reason: 'implied', url: null, user_agent: ua.slice(0, 300), created_at: at});
        }
        if (email && !email.sent_at && verdict.counted) await store.updateEmail(id, {sent_at: at});
      }
    } catch (err) {
      console.error('click', err);
    }
    // le lien marche toujours, même en cas d'erreur
    return new Response(null, {status: 302, headers: {location: target, 'referrer-policy': 'no-referrer', ...NO_CACHE}});
  }

  async function body(req: Request): Promise<Record<string, unknown>> {
    try {
      return (await req.json()) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  return async function handle(req: Request): Promise<Response> {
    if (req.method === 'OPTIONS') return new Response(null, {status: 204, headers: CORS});
    const url = new URL(req.url);
    const {action, id, target} = parseRoute(url);

    if (action === 'open') return open(req, id);
    if (action === 'click') return click(req, id, target);

    if (!authorized(req)) return json({error: 'unauthorized'}, 401);

    if (action === 'register' && req.method === 'POST') {
      const b = await body(req);
      const row: EmailRow = {
        id: newId(),
        sender: clean(b.sender, 200)?.toLowerCase() || null,
        recipient: clean(b.recipient),
        subject: clean(b.subject),
        source: clean(b.source, 60),
        created_at: new Date(now()).toISOString(),
        sent_at: null,
        self_until: null,
      };
      await store.createEmail(row);
      store.dropUnsent(new Date(now() - 30 * 86400_000).toISOString()).catch(() => {});
      return json({id: row.id});
    }

    if (action === 'update' && req.method === 'POST') {
      const b = await body(req);
      const target = clean(b.id, 80);
      if (!target) return json({error: 'id manquant'}, 400);
      const patch: Partial<EmailRow> = {};
      if (typeof b.recipient === 'string') patch.recipient = clean(b.recipient);
      if (typeof b.subject === 'string') patch.subject = clean(b.subject);
      if (typeof b.sender === 'string' && b.sender) patch.sender = clean(b.sender, 200)!.toLowerCase();
      if (b.sent) patch.sent_at = new Date(now()).toISOString();
      if (Object.keys(patch).length) await store.updateEmail(target, patch);
      return json({ok: true});
    }

    if (action === 'self' && req.method === 'POST') {
      const b = await body(req);
      const target = clean(b.id, 80);
      const viewer = (clean(b.viewer, 200) || '').toLowerCase();
      const email = target ? await store.getEmail(target) : null;
      if (!email) return json({ok: true, ignored: 'inconnu'});
      // un autre compte qui affiche le mail (un test vers soi-même, par exemple) n'est pas l'expéditeur
      if (email.sender && viewer && email.sender !== viewer) return json({ok: true, ignored: 'pas-expediteur'});
      const t = now();
      const types: ('open' | 'click')[] = b.kind === 'click' ? ['click', 'open'] : ['open'];
      await store.updateEmail(email.id, {self_until: new Date(t + WINDOWS.selfMs).toISOString()});
      await store.markSelf(email.id, new Date(t - WINDOWS.selfMs).toISOString(), types);
      return json({ok: true});
    }

    if (action === 'emails') {
      const limit = Math.max(1, Math.min(500, Number(url.searchParams.get('limit')) || 100));
      const ids = url.searchParams.get('ids');
      const emails = await store.listStats(limit, ids ? ids.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 200) : null);
      return json({emails});
    }

    if (action === 'details') {
      if (!id) return json({error: 'id manquant'}, 400);
      const [email, events] = await Promise.all([store.getStats(id), store.events(id)]);
      if (!email) return json({error: 'introuvable'}, 404);
      return json({email, events: events.map((e) => ({...e, event_type: e.type}))});
    }

    return json({error: 'action inconnue'}, 400);
  };
}

// Prospect Tracker : la fonction Supabase « mail-tracker » (Deno).
// Déploiement : supabase functions deploy mail-tracker --no-verify-jwt
// Secret      : supabase secrets set TRACKER_TOKEN=<le jeton saisi dans l'extension>
// Tables      : supabase/migrations/20261004120000_prospect_tracker_v3.sql

import {createClient} from 'npm:@supabase/supabase-js@2';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: {persistSession: false, autoRefreshToken: false},
});

const must = <T>({data, error}: {data: T; error: unknown}): T => {
  if (error) throw error;
  return data;
};

const store: Store = {
  async getEmail(id) {
    return must(await db.from('pt_emails').select('*').eq('id', id).maybeSingle()) as EmailRow | null;
  },
  async createEmail(row) {
    must(await db.from('pt_emails').insert(row));
  },
  async updateEmail(id, patch) {
    must(await db.from('pt_emails').update(patch).eq('id', id));
  },
  async addEvent(ev) {
    must(await db.from('pt_events').insert(ev));
  },
  async events(id) {
    return must(await db.from('pt_events').select('email_id,type,counted,reason,url,user_agent,created_at').eq('email_id', id).order('created_at', {ascending: false}).limit(500)) as EventRow[];
  },
  async markSelf(id, since, types) {
    must(await db.from('pt_events').update({counted: false, reason: 'self'}).eq('email_id', id).eq('counted', true).gte('created_at', since).in('type', types));
  },
  async markBot(id, since) {
    must(await db.from('pt_events').update({counted: false, reason: 'bot'}).eq('email_id', id).eq('counted', true).gte('created_at', since).or('type.eq.click,reason.eq.implied'));
  },
  async listStats(limit, ids) {
    let q = db.from('pt_email_stats').select('*').not('sent_at', 'is', null).order('sent_at', {ascending: false}).limit(limit);
    if (ids) q = q.in('id', ids);
    return must(await q) as EmailStats[];
  },
  async getStats(id) {
    return must(await db.from('pt_email_stats').select('*').eq('id', id).maybeSingle()) as EmailStats | null;
  },
  async dropUnsent(olderThan) {
    must(await db.from('pt_emails').delete().is('sent_at', null).lt('created_at', olderThan));
  },
};

Deno.serve(makeHandler(store, {token: Deno.env.get('TRACKER_TOKEN') ?? ''}));
