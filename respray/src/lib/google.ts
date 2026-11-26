/* « Continuer avec Google » : OAuth 2.0 / OpenID Connect, code d'autorisation avec PKCE, sans bibliothèque.
   Le jeton d'identité vient directement de Google, en HTTPS, en échange du code : on peut lire ses champs sans vérifier
   la signature (OpenID Connect Core, 3.1.3.7). On contrôle quand même l'émetteur, le destinataire et l'expiration. */
import 'server-only';
import {createHash, createHmac, randomBytes, timingSafeEqual} from 'crypto';

export const googleActif = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const site = () => process.env.SITE_URL || 'https://respray.fr';
export const urlRetour = () => `${site()}/api/auth/google/retour`;

export const COOKIE_DEMANDE = 'respray_oauth';
export const COOKIE_IDENTITE = 'respray_google';

const b64 = (b: Buffer) => b.toString('base64url');

/* le lien vers Google, et ce qu'il faut garder en cookie pour vérifier le retour */
export function demande() {
  const etat = b64(randomBytes(24));
  const verif = b64(randomBytes(48));
  const defi = b64(createHash('sha256').update(verif).digest());
  const q = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: urlRetour(),
    response_type: 'code',
    scope: 'openid email profile',
    state: etat,
    code_challenge: defi,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  });
  return {url: `https://accounts.google.com/o/oauth2/v2/auth?${q}`, etat, verif};
}

export type Identite = {sub: string; email: string; prenom: string; nom: string};

/* échange le code contre l'identité Google ; null si quoi que ce soit cloche */
export async function identite(code: string, verif: string): Promise<Identite | null> {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: urlRetour(),
      grant_type: 'authorization_code',
      code_verifier: verif,
    }),
  }).catch(() => null);
  if (!r?.ok) return null;
  const {id_token} = (await r.json()) as {id_token?: string};
  const charge = id_token?.split('.')[1];
  if (!charge) return null;
  const t = JSON.parse(Buffer.from(charge, 'base64url').toString()) as Record<string, unknown>;
  const ok =
    (t.iss === 'https://accounts.google.com' || t.iss === 'accounts.google.com') &&
    t.aud === process.env.GOOGLE_CLIENT_ID &&
    typeof t.exp === 'number' && t.exp * 1000 > Date.now() &&
    typeof t.sub === 'string' && typeof t.email === 'string' &&
    t.email_verified === true; // une adresse que Google a vérifiée : on peut la rattacher à un compte existant
  if (!ok) return null;
  return {sub: t.sub as string, email: (t.email as string).toLowerCase(), prenom: String(t.given_name || ''), nom: String(t.family_name || '')};
}

/* l'identité Google gardée le temps de finir l'inscription (pseudo, conditions), signée pour qu'on ne la fabrique pas */
const signe = (s: string) => b64(createHmac('sha256', process.env.GOOGLE_CLIENT_SECRET!).update(s).digest());
export const emballer = (i: Identite) => {
  const s = b64(Buffer.from(JSON.stringify({...i, exp: Date.now() + 30 * 6e4})));
  return `${s}.${signe(s)}`;
};
export function deballer(v?: string): Identite | null {
  if (!v || !googleActif()) return null;
  const [s, sig] = v.split('.');
  if (!s || !sig) return null;
  const a = Buffer.from(sig), b = Buffer.from(signe(s));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const i = JSON.parse(Buffer.from(s, 'base64url').toString()) as Identite & {exp: number};
  return i.exp > Date.now() ? i : null;
}
