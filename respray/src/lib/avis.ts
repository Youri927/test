import 'server-only';
/* Les avis et les chiffres publics d'un vendeur. Seuls comptent les avis visibles (non masqués par l'équipe). */
import {and, eq, inArray, sql} from 'drizzle-orm';
import {db, schema} from '@/db';
import {completer} from '@/lib/annonces';

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

/* tous les avis du site (les acheteurs qui ont reçu et vérifié leur commande), pour la page /avis et l'accueil */
export async function bilanGlobal() {
  const r = await db
    .select({note: schema.avis.note, n: sql<number>`count(*)::int`})
    .from(schema.avis)
    .where(eq(schema.avis.masque, false))
    .groupBy(schema.avis.note);
  const n = r.reduce((s, x) => s + x.n, 0);
  const moyenne = n ? Math.round((r.reduce((s, x) => s + x.note * x.n, 0) / n) * 10) / 10 : 0;
  const repartition = [5, 4, 3, 2, 1].map((k) => ({note: k, n: r.find((x) => x.note === k)?.n ?? 0}));
  return {n, moyenne, repartition};
}

/* les derniers avis visibles, avec l'acheteur, le vendeur et le parfum acheté ; avecTexte : seulement ceux qui ont un mot */
export async function derniersAvis(limite: number, avecTexte = false) {
  const liste = await db.query.avis.findMany({
    where: avecTexte ? and(eq(schema.avis.masque, false), sql`coalesce(${schema.avis.texte}, '') <> ''`) : eq(schema.avis.masque, false),
    orderBy: (a, {desc}) => [desc(a.creeLe)],
    limit: limite,
  });
  if (!liste.length) return [];
  const ids = [...new Set(liste.flatMap((a) => [a.acheteurId, a.vendeurId]))];
  const membres = await db.select({id: schema.membres.id, pseudo: schema.membres.pseudo}).from(schema.membres).where(inArray(schema.membres.id, ids));
  const annonces = (await completer(await db.select().from(schema.annonces).where(inArray(schema.annonces.id, [...new Set(liste.map((a) => a.annonceId))]))))
    .map((x) => ({id: x.id, parfumNom: x.parfumNom, maisonNom: x.maisonNom, ml: x.ml, photo: x.photos.face ?? null}));
  const pseudo = (id: number) => membres.find((m) => m.id === id)?.pseudo ?? null;
  return liste.map((a) => ({...a, acheteur: pseudo(a.acheteurId), vendeur: pseudo(a.vendeurId), achat: annonces.find((x) => x.id === a.annonceId) ?? null}));
}
export type AvisDetaille = Awaited<ReturnType<typeof derniersAvis>>[number];
