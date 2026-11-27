import {asc, eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import Link from 'next/link';
import {moi} from '@/lib/auth';
import {FormVendre, type Depart} from '@/components/FormVendre';
import {prixAuMl, demande} from '@/lib/marche';

export const metadata = {
  title: 'Vendre son parfum d\'occasion, vérifié et payé',
  description: 'Vendez un parfum entamé ou jamais porté : 6 photos, l\'équipe vérifie l\'annonce, et vous touchez votre prix moins 5 % de commission. Envoi en point relais, paiement sécurisé.',
};
export const dynamic = 'force-dynamic';

export default async function Vendre({searchParams}: {searchParams: Promise<{parfum?: string; ml?: string; niveau?: string}>}) {
  const q = await searchParams;
  const retour = '/vendre' + (q.parfum ? `?parfum=${Number(q.parfum)}&ml=${Number(q.ml) || ''}&niveau=${Number(q.niveau) || ''}` : '');
  const m = await moi();
  // sans compte : la page explique la vente (et Google peut la lire), puis invite à créer un compte
  if (!m) return <VendrePublic retour={retour} />;
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
      <p className="chapo">Mise en ligne gratuite, 5 % de commission à la vente. Plus votre annonce est précise, plus elle se vend vite, et moins l'acheteur a de questions.</p>
      <FormVendre maisons={maisons} pseudo={m.pseudo} prix={prix} occ={occ} demande={dem} depart={depart} credits={m.credits} fondateur={m.fondateur} />
    </div>
  );
}

const ETAPES: [string, string][] = [
  ['6 photos, depuis votre téléphone', 'Face, dessous avec le code lot, niveau, vue de dessus, tige, et votre pseudo sur un papier. Le formulaire vous guide.'],
  ['L\'équipe vérifie l\'annonce', 'Avant d\'être en ligne. C\'est ce qui rassure les acheteurs, et fait vendre plus vite.'],
  ['Vendu : envoi en point relais', 'Vous recevez l\'étiquette, vous déposez le colis bien emballé.'],
  ['Payé chaque lundi', 'Vous touchez le prix affiché moins 5 % de commission (0 % pour les vendeurs fondateurs), versé chaque lundi sur votre compte bancaire, une fois que l\'acheteur a vérifié le parfum.'],
];

function VendrePublic({retour}: {retour: string}) {
  const r = encodeURIComponent(retour);
  return (
    <div className="env page vendre">
      <p className="surtitre">Vendre</p>
      <h1 className="titre-page">Vendre son parfum d&apos;occasion</h1>
      <p className="chapo">Un flacon entamé, offert, porté deux fois : vendez-le à quelqu&apos;un qui le cherche. La mise en ligne est gratuite, et la commission de 5 % seulement.</p>
      <ol className="vendre-etapes">
        {ETAPES.map(([t, d], i) => <li key={t}><b>{i + 1}</b><span><strong>{t}</strong>{d}</span></li>)}
      </ol>
      <div className="vendre-actions">
        <Link className="btn btn-noir btn-large" href={`/inscription?retour=${r}`}>Créer un compte pour vendre</Link>
        <Link className="btn btn-large" href={`/connexion?retour=${r}`}>J&apos;ai déjà un compte</Link>
      </div>
      <p className="aide">Combien vaut votre parfum ? <Link className="lien-souligne" href="/cote">La cote</Link> · <Link className="lien-souligne" href="/guides/vendre-son-parfum-d-occasion">Le guide pour bien vendre</Link></p>
    </div>
  );
}
