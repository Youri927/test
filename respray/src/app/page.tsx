import Link from 'next/link';
import {preload} from 'react-dom';
import {and, gt, inArray} from 'drizzle-orm';
import {db, schema} from '@/db';
import {publiees} from '@/lib/annonces';
import {moi} from '@/lib/auth';
import {remise} from '@/lib/cote';
import {Carte} from '@/components/Carte';
import {FormAttente} from '@/components/FormulairesCompte';
import {Bouclier} from '@/components/Bouclier';
import {Vaporise, Ico} from '@/components/Visuels';
import {Direct, Ruban, Anatomie, Reception} from '@/components/Accueil';
import {BlocTrustpilot} from '@/components/Trustpilot';

export const dynamic = 'force-dynamic';

/* pour Google : qui est Respray, et la recherche du site (boîte de recherche dans les résultats) */
const SITE = process.env.SITE_URL || 'https://respray.fr';
const LD = [
  {'@context': 'https://schema.org', '@type': 'Organization', name: 'Respray', url: SITE, logo: `${SITE}/bimi/respray-512.png`, email: 'contact@respray.fr', description: 'Plateforme française de parfum de seconde main entre particuliers : annonces vérifiées avant d\'être en ligne, paiement bloqué, 7 jours pour vérifier.'},
  {'@context': 'https://schema.org', '@type': 'WebSite', name: 'Respray', url: SITE, inLanguage: 'fr-FR', potentialAction: {'@type': 'SearchAction', target: {'@type': 'EntryPoint', urlTemplate: `${SITE}/parfums?q={q}`}, 'query-input': 'required name=q'}},
];

const il = (d: Date | null) => {
  if (!d) return '';
  const m = Math.max(1, Math.round((Date.now() - d.getTime()) / 6e4));
  return m < 60 ? `il y a ${m} min` : m < 1440 ? `il y a ${Math.round(m / 60)} h` : `il y a ${Math.round(m / 1440)} j`;
};

/* L'accueil, repris du prototype : deux portes (acheter, vendre), le ruban des vraies annonces, une annonce
   décortiquée (un exemple, présenté comme tel), le guide de réception, puis le placard et nos chiffres. Jamais
   d'annonce inventée : tant qu'il y en a peu, l'accueil le dit et propose d'être prévenu. */
export default async function Accueil() {
  const m = await moi();
  const annonces = await publiees(24);
  const j = await db.select({action: schema.journal.action}).from(schema.journal).where(and(gt(schema.journal.creeLe, new Date(Date.now() - 30 * 864e5)), inArray(schema.journal.action, ['annonce_publiee', 'annonce_refusee'])));
  const pub = j.filter((x) => x.action === 'annonce_publiee').length;
  const ref = j.length - pub;
  const favs = m && annonces.length ? new Set((await db.select().from(schema.favoris).where(inArray(schema.favoris.annonceId, annonces.map((a) => a.id)))).filter((f) => f.membreId === m.id).map((f) => f.annonceId)) : new Set<number>();
  const maisons = [...new Set(annonces.map((a) => a.maisonNom))].sort((x, y) => x.localeCompare(y, 'fr'));
  const remises = annonces.map((a) => (a.parfum ? remise(a.parfum.formats, a)?.pct : undefined)).filter((x): x is number => x !== undefined);
  const moyenne = remises.length >= 3 ? Math.round(remises.reduce((s, x) => s + x, 0) / remises.length) : null;
  const pile = annonces.filter((a) => a.photos.face).slice(0, 3);
  const pileSrc = pile.length === 3 ? pile.map((a) => `/photos/${a.photos.face}`) : ['/demo/pile-amouage.webp', '/demo/pile-kurkdjian.webp', '/demo/pile-vuitton.webp']; // tant qu'il y a moins de 3 annonces avec photo

  // les images du haut de l'accueil sont demandées en premier, avant le reste de la page
  for (const src of [...pileSrc, '/demo/vendre.webp', '/demo/vendre-sombre.webp']) preload(src, {as: 'image', fetchPriority: 'high'});

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(LD).replace(/</g, '\\u003c')}} />
      <section className="portes env">
        <div className="portes-in">
          <div className="porte porte-acheter">
            <div className="porte-texte">
              <p className="surtitre">Acheter</p>
              <h1>Le parfum de seconde main, sans le doute.</h1>
              <p className="porte-sous">Chaque annonce est vérifiée par l&apos;équipe avant d&apos;être en ligne. Et vous avez 7 jours, flacon en main, pour vérifier à votre tour.</p>
              <form className="cherche-grand" action="/parfums" role="search">
                <label className="vh" htmlFor="q-hero">Rechercher un parfum ou une maison</label>
                <Ico n="loupe" />
                <input id="q-hero" name="q" type="search" placeholder="Un parfum, une maison…" autoComplete="off" />
                <button className="btn btn-noir" type="submit">Rechercher</button>
              </form>
              <Direct items={annonces.slice(0, 6).map((a) => ({id: a.id, nom: a.parfumNom, prix: a.prix, il: il(a.publieeLe)}))} />
            </div>
            <div className="pile" aria-hidden="true">{pileSrc.map((s, i) => <span key={i} className="pile-photo" style={{'--i': i} as React.CSSProperties}><img className="visuel" src={s} alt="" width={600} height={750} fetchPriority="high" /></span>)}</div>
          </div>
          <Link className="porte porte-vendre" href="/vendre">
            <div className="porte-texte">
              <p className="surtitre">Vendre</p>
              <h2>Il dort dans un placard ? Vendez‑le, sans commission.</h2>
              <p>Vous touchez 100 % du prix. Six photos, une vérification, et il est en ligne.</p>
              <span className="btn btn-noir">Vendre un parfum <Ico n="fleche" /></span>
            </div>
            <div className="porte-visuel"><Vaporise /></div>
          </Link>
        </div>
      </section>

      <section className="ruban-section">
        {annonces.length ? (
          <Ruban maisons={maisons} total={annonces.length} aide={`${moyenne ? `En moyenne ${moyenne} % moins cher que neuf, au millilitre. ` : ''}Chaque annonce a été vérifiée avant d'apparaître ici.`}>
            {annonces.map((a) => <Carte key={a.id} a={a} favori={favs.has(a.id)} connecte={!!m} />)}
          </Ruban>
        ) : (
          <div className="env">
            <h2 className="grand-titre">En ce moment</h2>
            <div className="bientot">
              <h3>Les premières annonces arrivent.</h3>
              <p className="aide">Chacune est vérifiée avant d&apos;apparaître ici. Laissez votre adresse : on vous écrit dès qu&apos;il y a du choix.</p>
              <FormAttente envie="acheter" />
            </div>
          </div>
        )}
        {annonces.length && annonces.length < 8 ? (
          <div className="env"><p className="aide">D&apos;autres annonces arrivent chaque jour. <Link className="lien-souligne" href="/parfums">Préviens-moi pour un parfum précis</Link></p></div>
        ) : null}
      </section>

      <Anatomie />
      <Reception />

      <section className="env avis-accueil" data-revele>
        <h2 className="h2">Ce qu&apos;en disent nos clients</h2>
        <BlocTrustpilot />
      </section>

      <section className="env section accueil-duo">
        <Link className="tuile tuile-placard" href="/placard" data-revele>
          <p className="surtitre">Le placard</p>
          <h2 className="h2">Combien valent les parfums qui dorment chez vous&nbsp;?</h2>
          <p className="aide">Ajoutez ceux que vous avez, même entamés : on estime chacun d&apos;après la cote. Vous vendez ensuite ceux que vous voulez, en un geste.</p>
          <span className="lien">Estimer mon placard</span>
        </Link>
        <Link className="tuile tuile-verif" href="/verification" data-revele>
          <Bouclier taille={64} anime={false} />
          <p className="surtitre">Nos chiffres</p>
          <h2 className="h2">{j.length ? `${pub} annonce${pub > 1 ? 's' : ''} publiée${pub > 1 ? 's' : ''}, ${ref} refusée${ref > 1 ? 's' : ''} ces 30 derniers jours.` : 'Ce qu\'on publie, ce qu\'on refuse, et pourquoi.'}</h2>
          <p className="aide">Une vérification qui ne refuse rien ne prouve rien. Les nôtres sont publiques, raisons comprises.</p>
          <span className="lien">Voir les chiffres</span>
        </Link>
      </section>
    </>
  );
}
