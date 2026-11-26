import {asc, eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {exigerMembre} from '@/lib/auth';
import {FormVendre, type Depart} from '@/components/FormVendre';
import {prixAuMl, demande} from '@/lib/marche';

export const metadata = {title: 'Vendre un parfum'};
export const dynamic = 'force-dynamic';

export default async function Vendre({searchParams}: {searchParams: Promise<{parfum?: string; ml?: string; niveau?: string}>}) {
  const q = await searchParams;
  const m = await exigerMembre('/vendre' + (q.parfum ? `?parfum=${Number(q.parfum)}&ml=${Number(q.ml) || ''}&niveau=${Number(q.niveau) || ''}` : ''));
  const ms = await db.select().from(schema.maisons).orderBy(asc(schema.maisons.nom));
  const ps = await db.select().from(schema.parfums).orderBy(asc(schema.parfums.nom));
  const enLigne = await db.select({parfumId: schema.annonces.parfumId, prix: schema.annonces.prix}).from(schema.annonces).where(eq(schema.annonces.statut, 'publiee'));
  const prix: Record<number, number[]> = {};
  enLigne.forEach((a) => a.parfumId && (prix[a.parfumId] ||= []).push(a.prix));
  // arrivé du placard : le parfum, la contenance et le niveau sont déjà choisis
  const choisi = q.parfum ? ps.find((p) => p.id === Number(q.parfum)) : null;
  const depart: Depart | undefined = choisi ? {maisonId: String(choisi.maisonId), parfumId: String(choisi.id), ml: q.ml ? String(Number(q.ml)) : '', niveau: Math.min(100, Math.max(5, Number(q.niveau) || 100))} : undefined;
  const [occ, dem] = await Promise.all([prixAuMl(), demande()]);
  const maisons = ms.map((x) => ({id: x.id, nom: x.nom, parfums: ps.filter((p) => p.maisonId === x.id).map((p) => ({id: p.id, nom: p.nom, conc: p.conc, genre: p.genre, famille: p.famille, notes: p.notes, formats: p.formats}))}));
  return (
    <div className="env page vendre">
      <h1 className="titre-page">Vendre un parfum</h1>
      <p className="chapo">Gratuit, sans commission. Plus votre annonce est précise, plus elle se vend vite, et moins l'acheteur a de questions.</p>
      <FormVendre maisons={maisons} pseudo={m.pseudo} prix={prix} occ={occ} demande={dem} depart={depart} credits={m.credits} />
    </div>
  );
}
