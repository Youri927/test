import 'server-only';
/* Les avis et les chiffres publics d'un vendeur. Seuls comptent les avis visibles (non masqués par l'équipe). */
import {and, eq, inArray, sql} from 'drizzle-orm';
import {db, schema} from '@/db';

export type Note = {moyenne: number; n: number};

/* la note de plusieurs vendeurs d'un coup (cartes, recherche) */
export async function notesDe(vendeurs: number[]): Promise<Record<number, Note>> {
  const ids = [...new Set(vendeurs)];
  if (!ids.length) return {};
  const r = await db
    .select({v: schema.avis.vendeurId, moyenne: sql<number>`avg(${schema.avis.note})::float`, n: sql<number>`count(*)::int`})
    .from(schema.avis)
    .where(and(inArray(schema.avis.vendeurId, ids), eq(schema.avis.masque, false)))
    .groupBy(schema.avis.vendeurId);
  return Object.fromEntries(r.map((x) => [x.v, {moyenne: Math.round(x.moyenne * 10) / 10, n: x.n}]));
}

/* les chiffres du profil : ventes terminées, délai d'envoi, ventes sans litige */
export async function chiffres(vendeurId: number) {
  const cs = await db.select().from(schema.commandes).where(eq(schema.commandes.vendeurId, vendeurId));
  const finies = cs.filter((c) => ['confirmee', 'versee', 'remboursee'].includes(c.statut));
  const reussies = finies.filter((c) => c.statut !== 'remboursee');
  const delais = cs.filter((c) => c.payeeLe && c.expedieeLe && c.mode === 'relais').map((c) => (c.expedieeLe!.getTime() - c.payeeLe!.getTime()) / 36e5);
  return {
    ventes: reussies.length,
    // à partir de 3 envois, le délai moyen veut dire quelque chose
    delaiHeures: delais.length >= 3 ? delais.reduce((s, x) => s + x, 0) / delais.length : null,
    sansLitige: finies.length >= 3 ? Math.round((finies.filter((c) => !c.litige).length / finies.length) * 100) : null,
  };
}

export const etoiles = (n: number) => '★★★★★'.slice(0, Math.round(n)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(n));
