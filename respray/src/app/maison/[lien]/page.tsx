import Link from 'next/link';
import {notFound} from 'next/navigation';
import {and, eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {maisonParLien, lienParfum} from '@/lib/catalogue';
import {completer} from '@/lib/annonces';
import {Carte} from '@/components/Carte';

export const revalidate = 600;
export async function generateMetadata({params}: {params: Promise<{lien: string}>}) {
  const m = await maisonParLien((await params).lien);
  return m ? {title: `Parfums ${m.nom} d'occasion`, description: `Les parfums ${m.nom} de seconde main sur Respray : annonces vérifiées par l'équipe avant d'être en ligne, 7 jours pour vérifier.`} : {};
}

export default async function Maison({params}: {params: Promise<{lien: string}>}) {
  const m = await maisonParLien((await params).lien);
  if (!m) notFound();
  const parfums = await db.select().from(schema.parfums).where(eq(schema.parfums.maisonId, m.id));
  const annonces = await completer(await db.select().from(schema.annonces).where(and(eq(schema.annonces.maisonNom, m.nom), eq(schema.annonces.statut, 'publiee'))));
  return (
    <div className="env page">
      <nav className="fil" aria-label="Fil d'Ariane"><Link href="/parfums">Parfums</Link><span aria-hidden="true">›</span><span>{m.nom}</span></nav>
      <h1 className="titre-page">Parfums {m.nom} d'occasion</h1>
      {parfums.length ? <p className="parfums-maison">{parfums.map((p) => <Link key={p.id} className="filtre" href={`/parfum/${lienParfum(m.nom, p.nom)}`}>{p.nom}</Link>)}</p> : null}
      {annonces.length ? <div className="grille resultats">{annonces.map((a) => <Carte key={a.id} a={a} />)}</div> : <div className="bientot"><h3>Aucune annonce {m.nom} pour l'instant.</h3><p className="aide">Soyez le premier à en vendre un, sans commission.</p><Link className="btn btn-noir" href="/vendre">Vendre un parfum</Link></div>}
    </div>
  );
}
