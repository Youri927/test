import Link from 'next/link';
import {Galerie} from '@/components/Galerie';
import {notFound} from 'next/navigation';
import {and, desc, eq, inArray, gt} from 'drizzle-orm';
import {db, schema} from '@/db';
import {annonce} from '@/lib/annonces';
import {moi} from '@/lib/auth';
import {tousLesParfums, lienParfum} from '@/lib/catalogue';
import {PHOTOS, CONTROLES, protection, envoiPour, eur, eur2, lien} from '@/lib/regles';
import {remise} from '@/lib/cote';
import {proches} from '@/lib/odeur';
import {senteurDe} from '@/lib/scento';
import {Bouclier} from '@/components/Bouclier';
import {Odeur} from '@/components/Odeur';
import {FormOffre} from '@/components/Echanges';
import {basculerFavori} from '@/app/actions/favoris';
import {repondreContre} from '@/app/actions/marche';
import {protectionOfferte} from '@/lib/commandes';

export const dynamic = 'force-dynamic';

export async function generateMetadata({params}: {params: Promise<{id: string}>}) {
  const a = await annonce(Number((await params).id));
  if (!a || !['publiee', 'vendue', 'reservee'].includes(a.statut)) return {title: 'Annonce', robots: {index: false}};
  const titre = `${a.parfumNom} ${a.maisonNom} d'occasion, ${a.ml} ml à ${a.prix} €`;
  const description = `${a.parfumNom} de ${a.maisonNom} (${a.conc}, ${a.ml} ml, reste ~${a.niveau} %) à ${a.prix} € : annonce vérifiée par l'équipe Respray avant d'être en ligne, paiement bloqué, 7 jours pour vérifier.`;
  const images = a.photos.face ? [`/photos/${a.photos.face}`] : undefined;
  return {title: titre, description, openGraph: {type: 'website', locale: 'fr_FR', siteName: 'Respray', url: './', title: titre, description, images}};
}

const jour = new Intl.DateTimeFormat('fr-FR', {day: 'numeric', month: 'long'});
const heure = new Intl.DateTimeFormat('fr-FR', {weekday: 'long', hour: '2-digit', minute: '2-digit'});

/* une annonce publiée : les vraies photos du vendeur, ce qu'il a déclaré, le prix comparé au neuf, la protection,
   et ce qui aide à se décider (l'odeur, une offre, une question au vendeur) */
export default async function Annonce({params}: {params: Promise<{id: string}>}) {
  const a = await annonce(Number((await params).id));
  const m = await moi();
  // visible par tous une fois publiée ; avant, seulement par son vendeur et l'équipe
  if (!a || (!['publiee', 'vendue', 'reservee'].includes(a.statut) && m?.id !== a.vendeurId && m?.role !== 'equipe')) notFound();
  // pour Google : un produit d'occasion avec son prix et sa disponibilité, et le fil d'Ariane
  const site = process.env.SITE_URL || 'https://respray.fr';
  const ld = [
    {'@context': 'https://schema.org', '@type': 'Product', name: `${a.parfumNom} ${a.conc} ${a.ml} ml`, brand: {'@type': 'Brand', name: a.maisonNom}, category: 'Parfum', image: ['face', 'dessous', 'niveau', 'dessus'].map((k) => a.photos[k]).filter(Boolean).map((f) => `${site}/photos/${f}`),
      description: `${a.parfumNom} de ${a.maisonNom}, ${a.ml} ml, reste environ ${a.niveau} %. Annonce vérifiée par l'équipe Respray.`,
      offers: {'@type': 'Offer', url: `${site}/annonces/${a.id}`, price: a.prix, priceCurrency: 'EUR', itemCondition: 'https://schema.org/UsedCondition', availability: a.statut === 'publiee' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut', seller: {'@type': 'Person', name: a.vendeur.pseudo}}},
    {'@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      {'@type': 'ListItem', position: 1, name: 'Parfums', item: `${site}/parfums`},
      {'@type': 'ListItem', position: 2, name: a.maisonNom, item: `${site}/maison/${lien(a.maisonNom)}`},
      {'@type': 'ListItem', position: 3, name: a.parfumNom},
    ]},
  ];
  const d = a.details;
  const moiVendeur = m?.id === a.vendeurId;

  // le prix pour cette personne : une offre acceptée (ou proposée par le vendeur) encore valable le remplace
  const offres = m && !moiVendeur ? await db.select().from(schema.offres).where(and(eq(schema.offres.annonceId, a.id), eq(schema.offres.acheteurId, m.id), inArray(schema.offres.statut, ['attente', 'acceptee', 'contre']), gt(schema.offres.expire, new Date()))).orderBy(desc(schema.offres.creeLe)) : [];
  // plusieurs prix valables (offre acceptée, prix proposé aux favoris) : le plus bas
  const acceptee = offres.filter((o) => o.statut === 'acceptee').sort((x, y) => x.montant - y.montant)[0];
  const contre = offres.find((o) => o.statut === 'contre');
  const attente = offres.find((o) => o.statut === 'attente');
  const prix = acceptee ? acceptee.montant : a.prix;
  const pr = protection(prix);
  const offerte = m ? await protectionOfferte(m) : false; // parrainage : la protection est offerte au filleul sur son premier achat
  const r = a.parfum ? remise(a.parfum.formats, {prix: a.prix, ml: a.ml, niveau: a.niveau}) : null;

  const favori = m ? !!(await db.query.favoris.findFirst({where: and(eq(schema.favoris.membreId, m.id), eq(schema.favoris.annonceId, a.id))})) : false;
  const nFavoris = await db.$count(schema.favoris, eq(schema.favoris.annonceId, a.id));
  const ventes = await db.$count(schema.annonces, and(eq(schema.annonces.vendeurId, a.vendeurId), inArray(schema.annonces.statut, ['publiee', 'vendue'])));
  const catalogue = a.parfum ? (await tousLesParfums()).map((x) => ({...x.p, maison: x.maison})) : [];
  const voisins = a.parfum ? proches(a.parfum, catalogue).map((p) => ({nom: p.nom, maison: p.maison, lien: lienParfum(p.maison, p.nom)})) : [];
  const senteur = a.parfum ? await senteurDe(a.parfum) : null;
  const liens = Object.fromEntries(catalogue.map((p) => [`${p.maison}|${p.nom}`, `/parfum/${lienParfum(p.maison, p.nom)}`]));

  const lignes: [string, string][] = [
    ['Concentration', a.conc],
    ['Format', `${d.format}, ${a.ml} ml`],
    ['État', a.etat === 'neuf' ? 'Neuf, jamais ouvert' : `Reste environ ${a.niveau} % (≈ ${Math.round((a.ml * a.niveau) / 100)} ml)`],
    ['Boîte', d.boite],
    ['Code lot', a.lot || 'Illisible'],
    ['Acheté', `${d.annee}, ${d.lieu.charAt(0).toLowerCase() + d.lieu.slice(1)}`],
    ['Conservation', `${d.lumiere === 'abri' ? 'à l\'abri de' : 'exposé à'} la lumière, ${d.chaleur === 'abri' ? 'à l\'abri de' : 'exposé à'} la chaleur`],
    ['Pourquoi il le vend', d.pourquoi || ''],
    ['Petits défauts', d.defauts.join(', ')],
  ];
  return (
    <div className="env page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(ld).replace(/</g, '\\u003c')}} />
      <nav className="fil" aria-label="Fil d'Ariane"><Link href="/parfums">Parfums</Link><span aria-hidden="true">›</span><Link href={`/maison/${lien(a.maisonNom)}`}>{a.maisonNom}</Link><span aria-hidden="true">›</span>{a.parfumId ? <Link href={`/parfum/${lien(a.maisonNom, a.parfumNom)}`}>{a.parfumNom}</Link> : <span>{a.parfumNom}</span>}</nav>
      {a.statut !== 'publiee' ? <p className="p-alerte">{a.statut === 'vendue' ? 'Ce parfum est vendu.' : `Aperçu : cette annonce n'est pas en ligne (${a.statut}).`}</p> : null}
      <div className="annonce">
        <Galerie photos={PHOTOS.filter((p) => a.photos[p.k]).map((p) => ({src: `/photos/${a.photos[p.k]}`, alt: `${a.parfumNom} : ${p.t.toLowerCase()}`, legende: p.t}))} />
        <div className="fiche">
          <div className="fiche-tete">
            <div>
              <p className="fiche-maison">{a.maisonNom}</p>
              <h1>{a.parfumNom}</h1>
              <p className="fiche-sous">{a.conc} · {a.ml} ml</p>
            </div>
            {m && !moiVendeur ? (
              <form action={basculerFavori}>
                <input type="hidden" name="id" value={a.id} />
                <button className="coeur coeur-fiche" type="submit" aria-pressed={favori} aria-label={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
                </button>
              </form>
            ) : null}
          </div>
          <p className="fiche-prix">{acceptee ? <><s>{eur(a.prix)}</s> {eur(prix)}</> : eur(a.prix)}</p>
          {acceptee ? <p className="offre-ok">{acceptee.deVendeur ? 'Prix proposé par le vendeur' : 'Votre offre est acceptée'} : {eur(prix)} pour vous, jusqu'à {heure.format(acceptee.expire)}.</p> : null}
          {r ? (
            <p className="cote-ligne"><span className="cote-remise">−{r.pct} %</span> au millilitre par rapport au neuf : {eur2(r.occMl)} le ml au lieu de {eur2(r.neufMl)} <span className="cote-neuf">(neuf : <s>{eur(r.neuf)}</s> les {a.ml} ml, prix indicatif)</span></p>
          ) : null}
          {a.publieeLe ? (
            <div className="verifie-bloc">
              <Bouclier taille={84} />
              <div><strong>Vérifiée par l'équipe Respray</strong><small>le {jour.format(a.publieeLe)}, avant d'être en ligne. Et vous avez 7 jours, flacon en main, pour vérifier à votre tour.</small></div>
              <details><summary>Ce qu'on a vérifié</summary><ul className="verifie-liste">{CONTROLES.map((c) => <li key={c}>{c}</li>)}</ul><p className="aide"><Link className="lien-souligne" href="/verification">Nos chiffres : ce qu'on publie, ce qu'on refuse, et pourquoi</Link></p></details>
            </div>
          ) : null}
          <dl className="details">{lignes.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          {a.description ? <p className="fiche-desc">{a.description}</p> : null}
          <dl className="total">
            <div><dt>Parfum</dt><dd>{eur2(prix)}</dd></div>
            <div><dt>Protection acheteur</dt><dd>{offerte ? <><s>{eur2(pr)}</s> offerte</> : eur2(pr)}</dd></div>
            <div><dt>Livraison en point relais</dt><dd>{eur2(envoiPour(a))}</dd></div>
            <div className="total-ligne"><dt>Total</dt><dd>{eur2(prix + (offerte ? 0 : pr) + envoiPour(a))}</dd></div>
          </dl>
          {offerte ? <p className="aide">Vous êtes venu par un parrainage : la protection est offerte sur votre premier achat.</p> : null}
          {a.statut === 'publiee' && !moiVendeur ? (
            <Link className="btn btn-noir btn-large" href={m ? `/acheter/${a.id}` : `/connexion?retour=/acheter/${a.id}`}>Acheter · {eur2(prix + (offerte ? 0 : pr) + envoiPour(a))}</Link>
          ) : a.statut === 'reservee' ? <p className="offre-envoyee">Un acheteur est en train de payer. Si le paiement n'aboutit pas, l'annonce revient dans quelques minutes.</p> : null}
          {moiVendeur ? (
            <p className="aide">C'est votre annonce · {nFavoris} favori{nFavoris > 1 ? 's' : ''}. <Link className="lien-souligne" href="/messages">Vos messages</Link> · <Link className="lien-souligne" href="/compte">proposer un prix aux personnes intéressées</Link></p>
          ) : a.statut === 'publiee' ? (
            <div className="echanges">
              {contre ? (
                <div className="offre-contre">
                  <p><strong>Contre-offre du vendeur : {eur(contre.contre!)}</strong> (vous proposiez {eur(contre.montant)}), jusqu'à {heure.format(contre.expire)}.</p>
                  <div className="boutons">
                    <form action={repondreContre}><input type="hidden" name="id" value={contre.id} /><input type="hidden" name="choix" value="accepter" /><button className="btn btn-noir btn-petit" type="submit">Accepter {eur(contre.contre!)}</button></form>
                    <form action={repondreContre}><input type="hidden" name="id" value={contre.id} /><input type="hidden" name="choix" value="refuser" /><button className="btn btn-petit" type="submit">Non merci</button></form>
                  </div>
                </div>
              ) : attente ? (
                <p className="offre-envoyee">Votre offre de {eur(attente.montant)} attend la réponse du vendeur (jusqu'à {heure.format(attente.expire)}).</p>
              ) : !acceptee ? (
                m ? <FormOffre annonceId={a.id} prix={a.prix} /> : <Link className="lien-souligne" href={`/connexion?retour=/annonces/${a.id}`}>Connectez-vous pour faire une offre</Link>
              ) : null}
              <Link className="btn btn-large" href={m ? `/messages/${a.id}` : `/connexion?retour=/messages/${a.id}`}>Poser une question au vendeur</Link>
            </div>
          ) : null}
          <div className="protection"><h2>Protection acheteur</h2><p>Votre paiement reste bloqué jusqu'à ce que vous ayez vérifié le parfum. Vous avez <strong>7 jours après la livraison</strong> : s'il n'est pas conforme à l'annonce, vous êtes remboursé.</p></div>
          <p className="aide">Vendu par <Link className="lien-souligne" href={`/vendeur/${a.vendeur.pseudo}`}>@{a.vendeur.pseudo}</Link>{a.vendeur.note ? <> · <span className="etoiles" aria-hidden="true">★</span> {a.vendeur.note.moyenne.toLocaleString('fr-FR')} ({a.vendeur.note.n} avis)</> : ''}{a.vendeur.fondateur ? ' · vendeur fondateur' : ''} · membre depuis {new Intl.DateTimeFormat('fr-FR', {month: 'long', year: 'numeric'}).format(a.vendeur.creeLe)} · {ventes} annonce{ventes > 1 ? 's' : ''} vérifiée{ventes > 1 ? 's' : ''}{a.mainPropre ? ` · remise en main propre possible à ${a.ville}` : ''}</p>
          {a.parfum ? <Odeur senteur={senteur} famille={a.parfum.famille} notes={a.parfum.notes} proches={voisins} liens={liens} /> : null}
        </div>
      </div>
    </div>
  );
}
