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
