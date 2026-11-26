import type {MetadataRoute} from 'next';
import {eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {tousLesParfums, lienParfum} from '@/lib/catalogue';
import {GUIDES} from '@/lib/guides';
import {lien} from '@/lib/regles';

/* recalculé au plus toutes les heures : les nouvelles annonces y entrent sans attendre une mise à jour du site */
export const revalidate = 3600;

/* le plan du site pour Google : l'accueil, les guides, chaque maison, chaque parfum, chaque annonce en ligne */
export default async function plan(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || 'https://respray.fr';
  const ps = await tousLesParfums();
  const ms = await db.select().from(schema.maisons);
  const as = await db.select({id: schema.annonces.id, le: schema.annonces.publieeLe}).from(schema.annonces).where(eq(schema.annonces.statut, 'publiee'));
  return [
    {url: base, changeFrequency: 'daily', priority: 1},
    {url: `${base}/parfums`, changeFrequency: 'daily'},
    {url: `${base}/fondateurs`},
    {url: `${base}/cote`, changeFrequency: 'weekly'},
    {url: `${base}/comment-ca-marche`},
    {url: `${base}/placard`},
    {url: `${base}/verification`, changeFrequency: 'daily'},
    ...['/regles', '/cgu', '/confidentialite', '/obligations-fiscales', '/mentions-legales'].map((p) => ({url: base + p})),
    {url: `${base}/guides`},
    ...GUIDES.map((g) => ({url: `${base}/guides/${g.lien}`})),
    ...ms.map((m) => ({url: `${base}/maison/${lien(m.nom)}`})),
    ...ps.map((x) => ({url: `${base}/parfum/${lienParfum(x.maison, x.p.nom)}`})),
    ...as.map((a) => ({url: `${base}/annonces/${a.id}`, lastModified: a.le ?? undefined})),
  ];
}
