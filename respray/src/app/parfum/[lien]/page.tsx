import Link from 'next/link';
import {notFound} from 'next/navigation';
import {parfumParLien, annoncesDuParfum, tousLesParfums, lienParfum} from '@/lib/catalogue';
import {completer} from '@/lib/annonces';
import {Carte} from '@/components/Carte';
import {eur, eur2, lien} from '@/lib/regles';

export const revalidate = 600;
export async function generateStaticParams() {
  return (await tousLesParfums()).map((x) => ({lien: lienParfum(x.maison, x.p.nom)}));
}
export async function generateMetadata({params}: {params: Promise<{lien: string}>}) {
  const r = await parfumParLien((await params).lien);
  if (!r) return {};
  return {title: `${r.p.nom} de ${r.maison} d'occasion : prix et annonces vérifiées`, description: `${r.p.nom} (${r.maison}, ${r.p.conc}) de seconde main : annonces vérifiées par l'équipe, prix au millilitre comparé au neuf, 7 jours pour vérifier. Vendez le vôtre sans commission.`};
}

/* la page d'un parfum : sa fiche, ses annonces en ligne, son prix d'occasion comparé au neuf */
export default async function Parfum({params}: {params: Promise<{lien: string}>}) {
  const r = await parfumParLien((await params).lien);
  if (!r) notFound();
  const {p, maison} = r;
  const annonces = await completer(await annoncesDuParfum(p.id));
  const neufMl = p.formats.filter((f) => f.neuf).map((f) => f.neuf! / f.ml);
  const minNeufMl = neufMl.length ? Math.min(...neufMl) : null;
  const occMl = annonces.map((a) => a.prix / Math.max(1, (a.ml * a.niveau) / 100));
  const moyOcc = occMl.length ? occMl.reduce((x, y) => x + y, 0) / occMl.length : null;
  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: `${p.nom} ${maison}`, brand: {'@type': 'Brand', name: maison}, category: 'Parfum',
    ...(annonces.length ? {offers: {'@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: Math.min(...annonces.map((a) => a.prix)), highPrice: Math.max(...annonces.map((a) => a.prix)), offerCount: annonces.length, itemCondition: 'https://schema.org/UsedCondition'}} : {}),
  };
  return (
    <div className="env page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(ld).replace(/</g, '\\u003c')}} />
      <nav className="fil" aria-label="Fil d'Ariane"><Link href="/parfums">Parfums</Link><span aria-hidden="true">›</span><Link href={`/maison/${lien(maison)}`}>{maison}</Link><span aria-hidden="true">›</span><span>{p.nom}</span></nav>
      <p className="surtitre">{maison}</p>
      <h1 className="titre-page">{p.nom} d'occasion</h1>
      <p className="chapo">{p.conc}{p.annee ? `, ${p.annee}` : ''}{p.genre ? ` · ${p.genre}` : ''}{p.famille ? ` · ${p.famille}` : ''}{p.notes ? `. Notes : ${p.notes}.` : ''}</p>
      <div className="parfum-chiffres">
        <div><strong>{annonces.length}</strong><span>annonce{annonces.length > 1 ? 's' : ''} vérifiée{annonces.length > 1 ? 's' : ''} en ligne</span></div>
        {moyOcc ? <div><strong>{eur2(moyOcc)}</strong><span>le millilitre d'occasion, en moyenne</span></div> : null}
        {minNeufMl ? <div><strong>{eur2(minNeufMl)}</strong><span>le millilitre neuf (prix indicatif)</span></div> : null}
      </div>
      {annonces.length ? <div className="grille resultats">{annonces.map((a) => <Carte key={a.id} a={a} />)}</div> : (
        <div className="bientot"><h3>Aucune annonce de {p.nom} pour l'instant.</h3><p className="aide">Vous en avez un qui dort dans un placard ? Vendez-le sans commission : vous touchez 100 % du prix.</p></div>
      )}
      <section className="section">
        <h2 className="h2">Vous en avez un ?</h2>
        <p className="aide">Choisissez {maison}, puis {p.nom} : concentration, genre et famille sont remplis d'office.{p.formats.length ? ` Formats : ${p.formats.map((f) => `${f.ml} ml${f.neuf ? ` (${eur(f.neuf)} neuf)` : ''}`).join(', ')}.` : ''}</p>
        <Link className="btn btn-noir" href="/vendre">Vendre mon {p.nom}</Link>
      </section>
    </div>
  );
}
