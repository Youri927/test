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

import {impliesOpen, isBurst, judgeClick, judgeOpen, parseRoute, WINDOWS} from './logic.ts';
import type {Reason} from './logic.ts';

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
