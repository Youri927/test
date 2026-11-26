import Link from 'next/link';
import {notFound} from 'next/navigation';
import {parfumParLien, annoncesDuParfum, tousLesParfums, lienParfum} from '@/lib/catalogue';
import {completer} from '@/lib/annonces';
import {Carte} from '@/components/Carte';
import {eur, eur2, lien} from '@/lib/regles';
import {estimer} from '@/lib/cote';
import {proches} from '@/lib/odeur';
import {prixAuMl, demande} from '@/lib/marche';
import {moi} from '@/lib/auth';
import {db, schema} from '@/db';
import {and, eq} from 'drizzle-orm';
import {Odeur} from '@/components/Odeur';
import {senteurDe} from '@/lib/scento';
import {noteFr} from '@/lib/notes-fr';
import {FormEnvie} from '@/components/Envie';

export const dynamic = 'force-dynamic';
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
  const m = await moi();
  const [occ, dem] = await Promise.all([prixAuMl([p.id]), demande([p.id])]);
  const attendent = dem[p.id] || 0;
  const deja = m ? !!(await db.query.envies.findFirst({where: and(eq(schema.envies.membreId, m.id), eq(schema.envies.parfumId, p.id))})) : false;
  const grand = [...p.formats].filter((f) => f.neuf).sort((a, b) => b.ml - a.ml)[0];
  const coteNeuf = grand ? estimer({formats: p.formats, ml: grand.ml, niveau: 100, etat: 'neuf', occMl: occ[p.id]}) : null;
  const coteEntame = grand ? estimer({formats: p.formats, ml: grand.ml, niveau: 70, etat: 'entame', occMl: occ[p.id]}) : null;
  const catalogue = (await tousLesParfums()).map((x) => ({...x.p, maison: x.maison}));
  const voisins = proches(p, catalogue).map((x) => ({nom: x.nom, maison: x.maison, lien: lienParfum(x.maison, x.nom)}));
  const ici = `/parfum/${lienParfum(maison, p.nom)}`;
  const senteur = await senteurDe(p);
  const liens = Object.fromEntries(catalogue.map((x) => [`${x.maison}|${x.nom}`, `/parfum/${lienParfum(x.maison, x.nom)}`]));
  const vraiesNotes = senteur ? [...(senteur.tete ?? []), ...(senteur.coeur ?? []), ...(senteur.fond ?? []), ...(senteur.notes ?? [])].map(noteFr).join(', ') : '';
  const neufMl = p.formats.filter((f) => f.neuf).map((f) => f.neuf! / f.ml);
  const minNeufMl = neufMl.length ? Math.min(...neufMl) : null;
  const occMl = annonces.map((a) => a.prix / Math.max(1, (a.ml * a.niveau) / 100));
  const moyOcc = occMl.length ? occMl.reduce((x, y) => x + y, 0) / occMl.length : null;
  // les questions que les gens tapent vraiment sur Google, avec des réponses tirées des chiffres de la page
  const faq: [string, string][] = [
    [`Combien vaut un ${p.nom} d'occasion ?`, coteNeuf && coteEntame && grand
      ? `D'après la cote Respray, un ${p.nom} de ${maison} en ${grand.ml} ml vaut ${eur(coteNeuf.bas)} à ${eur(coteNeuf.haut)} jamais ouvert, et ${eur(coteEntame.bas)} à ${eur(coteEntame.haut)} entamé (reste 70 %).${coteNeuf.source === 'annonces' ? ' Ces chiffres suivent le prix réel des annonces.' : ' Ces chiffres partent du prix neuf, avec la décote habituelle de l\'occasion.'}`
      : `Un parfum entamé se vend en général 30 à 50 % moins cher que neuf au millilitre, selon ce qui reste dans le flacon, la boîte et la rareté.`],
    [`Comment savoir si un ${p.nom} d'occasion est authentique ?`, `Le code lot doit être lisible sous le flacon et identique sur la boîte ; le spray, la bague et la tige doivent être d'origine ; le niveau doit correspondre aux photos. Sur Respray, chaque annonce de ${p.nom} est vérifiée par l'équipe sur 6 photos imposées avant d'être en ligne.`],
    [`Où acheter un ${p.nom} d'occasion sans risque ?`, `Sur Respray, le paiement reste bloqué jusqu'à ce que vous ayez reçu et vérifié le flacon : 7 jours après la livraison. S'il n'est pas conforme à l'annonce, vous êtes remboursé en entier, livraison comprise.`],
    [`Comment vendre mon ${p.nom} ?`, `Sur Respray, la mise en ligne est gratuite et sans commission : 6 photos, l'équipe vérifie l'annonce, puis vous envoyez le colis en point relais avec une étiquette fournie. Le formulaire vous propose un prix d'après la cote.`],
  ];
  const ld = [{
    '@context': 'https://schema.org', '@type': 'Product', name: `${p.nom} ${maison}`, brand: {'@type': 'Brand', name: maison}, category: 'Parfum',
    ...(annonces.length ? {offers: {'@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: Math.min(...annonces.map((a) => a.prix)), highPrice: Math.max(...annonces.map((a) => a.prix)), offerCount: annonces.length, itemCondition: 'https://schema.org/UsedCondition'}} : {}),
  }, {
    '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, r]) => ({'@type': 'Question', name: q, acceptedAnswer: {'@type': 'Answer', text: r}})),
  }, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      {'@type': 'ListItem', position: 1, name: 'Parfums', item: `${process.env.SITE_URL || 'https://respray.fr'}/parfums`},
      {'@type': 'ListItem', position: 2, name: maison, item: `${process.env.SITE_URL || 'https://respray.fr'}/maison/${lien(maison)}`},
      {'@type': 'ListItem', position: 3, name: p.nom},
    ],
  }];
  return (
    <div className="env page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(ld).replace(/</g, '\\u003c')}} />
      <nav className="fil" aria-label="Fil d'Ariane"><Link href="/parfums">Parfums</Link><span aria-hidden="true">›</span><Link href={`/maison/${lien(maison)}`}>{maison}</Link><span aria-hidden="true">›</span><span>{p.nom}</span></nav>
      <p className="surtitre">{maison}</p>
      <h1 className="titre-page">{p.nom} d'occasion</h1>
      <p className="chapo">{p.conc}{p.annee ? `, ${p.annee}` : ''}{p.genre ? ` · ${p.genre}` : ''}{p.famille ? ` · ${p.famille}` : ''}{vraiesNotes || p.notes ? `. Notes : ${vraiesNotes || p.notes}.` : ''}</p>
      <div className="parfum-chiffres">
        <div><strong>{annonces.length}</strong><span>annonce{annonces.length > 1 ? 's' : ''} vérifiée{annonces.length > 1 ? 's' : ''} en ligne</span></div>
        {moyOcc ? <div><strong>{eur2(moyOcc)}</strong><span>le millilitre d'occasion, en moyenne</span></div> : null}
        {minNeufMl ? <div><strong>{eur2(minNeufMl)}</strong><span>le millilitre neuf (prix indicatif)</span></div> : null}
        {attendent ? <div><strong>{attendent}</strong><span>personne{attendent > 1 ? 's l\'attendent' : ' l\'attend'} dans {attendent > 1 ? 'leur' : 'sa'} liste d'envies</span></div> : null}
      </div>
      {coteNeuf && grand ? (
        <p className="cote-ligne"><span className="surtitre">La cote</span> {grand.ml} ml jamais ouvert : <strong>{eur(coteNeuf.bas)} à {eur(coteNeuf.haut)}</strong> · entamé, reste 70 % : <strong>{eur(coteEntame!.bas)} à {eur(coteEntame!.haut)}</strong> <span className="cote-neuf">(neuf : {eur(grand.neuf!)}) · <Link className="lien-souligne" href="/cote">la cote de tous les parfums</Link></span></p>
      ) : null}
      {annonces.length ? <div className="grille resultats">{annonces.map((a) => <Carte key={a.id} a={a} />)}</div> : (
        <div className="bientot"><h3>Aucune annonce de {p.nom} pour l'instant.</h3><p className="aide">{attendent ? `${attendent} personne${attendent > 1 ? 's l\'attendent' : ' l\'attend'} déjà. ` : ''}Laissez-le dans votre liste d'envies : on vous prévient dès qu'une annonce vérifiée arrive, au prix que vous voulez.</p></div>
      )}
      <div className="envie-bloc"><FormEnvie parfumId={p.id} retour={ici} connecte={!!m} deja={deja} /></div>
      <Odeur senteur={senteur} famille={p.famille} notes={p.notes} proches={voisins} liens={liens} />
      <section className="section">
        <h2 className="h2">Vous en avez un ?</h2>
        <p className="aide">Choisissez {maison}, puis {p.nom} : concentration, genre et famille sont remplis d'office.{p.formats.length ? ` Formats : ${p.formats.map((f) => `${f.ml} ml${f.neuf ? ` (${eur(f.neuf)} neuf)` : ''}`).join(', ')}.` : ''}</p>
        <Link className="btn btn-noir" href="/vendre">Vendre mon {p.nom}</Link>
      </section>
      <section className="section faq">
        <h2 className="h2">Questions fréquentes sur {p.nom} d'occasion</h2>
        {faq.map(([q, r]) => <details key={q}><summary>{q}</summary><p>{r}</p></details>)}
        <p className="aide">À lire aussi : <Link className="lien-souligne" href="/guides/reconnaitre-un-faux-parfum">reconnaître un faux parfum</Link> · <Link className="lien-souligne" href="/guides/acheter-un-parfum-d-occasion">acheter d'occasion sans se faire avoir</Link> · <Link className="lien-souligne" href="/cote">la cote des parfums</Link></p>
      </section>
    </div>
  );
}
