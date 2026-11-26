import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {ouvrirSession} from '@/lib/auth';
import {COOKIE_DEMANDE, COOKIE_IDENTITE, emballer, identite} from '@/lib/google';

/* le retour de Google : un membre connu est connecté ; une adresse connue est rattachée à son compte ; sinon, on finit
   l'inscription (pseudo, conditions) sur /inscription/google */
export async function GET(req: Request) {
  const site = process.env.SITE_URL || new URL(req.url).origin;
  const vers = (p: string) => NextResponse.redirect(new URL(p, site));
  const jar = await cookies();
  const brut = jar.get(COOKIE_DEMANDE)?.value;
  jar.delete(COOKIE_DEMANDE);
  const q = new URL(req.url).searchParams;
  let d: {etat: string; verif: string; retour: string} | null = null;
  try { d = brut ? JSON.parse(brut) : null; } catch { d = null; }
  if (q.get('error') === 'access_denied') return vers('/connexion');
  if (!d || !q.get('code') || q.get('state') !== d.etat) return vers('/connexion?erreur=google');

  const i = await identite(q.get('code')!, d.verif);
  if (!i) return vers('/connexion?erreur=google');

  let m = await db.query.membres.findFirst({where: eq(schema.membres.googleId, i.sub)});
  if (!m) {
    m = await db.query.membres.findFirst({where: eq(schema.membres.email, i.email)});
    if (m) await db.update(schema.membres).set({googleId: i.sub}).where(eq(schema.membres.id, m.id));
  }
  if (m) {
    if (m.statut === 'exclu') return vers('/connexion?erreur=ferme');
    await ouvrirSession(m.id);
    return vers(d.retour);
  }
  const rep = vers(`/inscription/google?retour=${encodeURIComponent(d.retour)}`);
  rep.cookies.set(COOKIE_IDENTITE, emballer(i), {httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1800, path: '/'});
  return rep;
}
