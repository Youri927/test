import 'server-only';
import {eq, and, desc, inArray} from 'drizzle-orm';
import {db, schema} from '@/db';

export type AnnonceAvecPhotos = typeof schema.annonces.$inferSelect & {photos: Record<string, string>; vendeur: {pseudo: string; ville: string; creeLe: Date; fondateur: boolean}};

/* des annonces, avec leurs photos (par vue) et leur vendeur */
export async function completer(liste: (typeof schema.annonces.$inferSelect)[]): Promise<AnnonceAvecPhotos[]> {
  if (!liste.length) return [];
  const ids = liste.map((a) => a.id);
  const ph = await db.select().from(schema.photos).where(inArray(schema.photos.annonceId, ids));
  const vend = await db.select({id: schema.membres.id, pseudo: schema.membres.pseudo, ville: schema.membres.ville, creeLe: schema.membres.creeLe, fondateur: schema.membres.fondateur}).from(schema.membres).where(inArray(schema.membres.id, [...new Set(liste.map((a) => a.vendeurId))]));
  return liste.map((a) => ({
    ...a,
    photos: Object.fromEntries(ph.filter((p) => p.annonceId === a.id).map((p) => [p.vue, p.fichier])),
    vendeur: vend.find((v) => v.id === a.vendeurId)!,
  }));
}

export async function publiees(limite = 60) {
  const liste = await db.select().from(schema.annonces).where(eq(schema.annonces.statut, 'publiee')).orderBy(desc(schema.annonces.publieeLe)).limit(limite);
  return completer(liste);
}

export async function annonce(id: number) {
  const a = await db.query.annonces.findFirst({where: eq(schema.annonces.id, id)});
  return a ? (await completer([a]))[0] : null;
}

export async function deVendeur(vendeurId: number) {
  return completer(await db.select().from(schema.annonces).where(eq(schema.annonces.vendeurId, vendeurId)).orderBy(desc(schema.annonces.creeLe)));
}

export async function aVerifier() {
  return completer(await db.select().from(schema.annonces).where(and(eq(schema.annonces.statut, 'attente'))).orderBy(schema.annonces.creeLe));
}
