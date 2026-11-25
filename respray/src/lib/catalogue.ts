import 'server-only';
import {asc, eq, and} from 'drizzle-orm';
import {db, schema} from '@/db';
import {lien} from '@/lib/regles';

/* les pages publiques du catalogue : une par parfum (/parfum/maison-nom), une par maison (/maison/nom) */
export async function tousLesParfums() {
  return db.select({p: schema.parfums, maison: schema.maisons.nom}).from(schema.parfums).innerJoin(schema.maisons, eq(schema.parfums.maisonId, schema.maisons.id)).orderBy(asc(schema.maisons.nom), asc(schema.parfums.nom));
}
export const lienParfum = (maison: string, nom: string) => lien(maison, nom);
export async function parfumParLien(l: string) {
  return (await tousLesParfums()).find((x) => lienParfum(x.maison, x.p.nom) === l) ?? null;
}
export async function maisonParLien(l: string) {
  return (await db.select().from(schema.maisons)).find((m) => lien(m.nom) === l) ?? null;
}
export async function annoncesDuParfum(parfumId: number) {
  return db.select().from(schema.annonces).where(and(eq(schema.annonces.parfumId, parfumId), eq(schema.annonces.statut, 'publiee')));
}
