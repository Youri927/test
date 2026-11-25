/* Les comptes : mot de passe haché (bcrypt), session dans un cookie httpOnly, gardée 30 jours en base. */
import 'server-only';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {randomBytes} from 'crypto';
import {eq, and, gt} from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import {db, schema} from '@/db';

const COOKIE = 'respray_session';
const DUREE = 30 * 24 * 3600 * 1000;

export type Membre = typeof schema.membres.$inferSelect;

export const hacher = (mdp: string) => bcrypt.hash(mdp, 10);
export const verifier = (mdp: string, hache: string) => bcrypt.compare(mdp, hache);

export async function ouvrirSession(membreId: number) {
  const id = randomBytes(32).toString('base64url');
  const expire = new Date(Date.now() + DUREE);
  await db.insert(schema.sessions).values({id, membreId, expire});
  (await cookies()).set(COOKIE, id, {httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', expires: expire, path: '/'});
}

export async function fermerSession() {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (id) await db.delete(schema.sessions).where(eq(schema.sessions.id, id));
  jar.delete(COOKIE);
}

/* la personne connectée, ou null */
export async function moi(): Promise<Membre | null> {
  const id = (await cookies()).get(COOKIE)?.value;
  if (!id) return null;
  const [r] = await db
    .select({m: schema.membres})
    .from(schema.sessions)
    .innerJoin(schema.membres, eq(schema.sessions.membreId, schema.membres.id))
    .where(and(eq(schema.sessions.id, id), gt(schema.sessions.expire, new Date())));
  return r && r.m.statut !== 'exclu' ? r.m : null;
}

export async function exigerMembre(retour = '/') {
  const m = await moi();
  if (!m) redirect(`/connexion?retour=${encodeURIComponent(retour)}`);
  return m;
}

export async function exigerEquipe() {
  const m = await moi();
  if (!m) redirect('/connexion?retour=/equipe');
  if (m.role !== 'equipe') redirect('/');
  return m;
}
