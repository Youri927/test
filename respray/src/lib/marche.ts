import 'server-only';
/* Le marché, vu de la base : les prix au millilitre de chaque parfum (annonces en ligne et vendues, sans les décants),
   et la demande (combien de personnes l'ont dans leur liste d'envies). */
import {and, inArray, ne, sql, isNotNull} from 'drizzle-orm';
import {db, schema} from '@/db';
import {mlRestants} from '@/lib/cote';

export async function prixAuMl(parfumIds?: number[]) {
  const conds = [inArray(schema.annonces.statut, ['publiee', 'vendue']), isNotNull(schema.annonces.parfumId), ne(sql`${schema.annonces.details}->>'format'`, 'Décant')];
  if (parfumIds) conds.push(inArray(schema.annonces.parfumId, parfumIds.length ? parfumIds : [-1]));
  const l = await db.select({p: schema.annonces.parfumId, prix: schema.annonces.prix, ml: schema.annonces.ml, niveau: schema.annonces.niveau}).from(schema.annonces).where(and(...conds));
  const r: Record<number, number[]> = {};
  l.forEach((a) => (r[a.p!] ||= []).push(a.prix / mlRestants(a.ml, a.niveau)));
  return r;
}

export async function demande(parfumIds?: number[]) {
  const l = await db
    .select({p: schema.envies.parfumId, n: sql<number>`count(*)::int`})
    .from(schema.envies)
    .where(parfumIds ? inArray(schema.envies.parfumId, parfumIds.length ? parfumIds : [-1]) : isNotNull(schema.envies.parfumId))
    .groupBy(schema.envies.parfumId);
  return Object.fromEntries(l.map((x) => [x.p!, x.n])) as Record<number, number>;
}
