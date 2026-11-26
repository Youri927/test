import Link from 'next/link';
import {publiees} from '@/lib/annonces';
import {Carte} from '@/components/Carte';
import {FormAttente} from '@/components/FormulairesCompte';
import {Bouclier} from '@/components/Bouclier';
import {and, gt, inArray} from 'drizzle-orm';
import {db, schema} from '@/db';

export const dynamic = 'force-dynamic';

/* L'accueil montre les vraies annonces publiées, les plus récentes d'abord. Tant qu'il y en a peu, il le dit, et
   propose d'être prévenu : jamais d'annonce inventée. */
const PEU = 8;

export default async function Accueil() {
  const annonces = await publiees(24);
  const j = await db.select({action: schema.journal.action}).from(schema.journal).where(and(gt(schema.journal.creeLe, new Date(Date.now() - 30 * 864e5)), inArray(schema.journal.action, ['annonce_publiee', 'annonce_refusee'])));
  const pub = j.filter((x) => x.action === 'annonce_publiee').length;
  const ref = j.length - pub;
  return (
    <>
      <section className="env accueil-tete">
        <p className="surtitre">Parfums de seconde main</p>
        <h1 className="accueil-titre">Le parfum de seconde main, sans le doute.</h1>
        <p className="chapo">Chaque annonce est vérifiée par l'équipe avant d'être en ligne. Et vous avez 7 jours, flacon en main, pour vérifier à votre tour.</p>
        <div className="boutons">
          <Link className="btn btn-noir btn-large" href="/vendre">Vendre un parfum, sans commission</Link>
          <Link className="btn btn-large" href="/parfums">Voir les parfums</Link>
        </div>
      </section>
      <section className="env section">
        <div className="section-tete"><h2>En ce moment</h2>{annonces.length ? <Link className="lien" href="/parfums">Tout voir</Link> : null}</div>
        {annonces.length ? <div className="grille">{annonces.map((a) => <Carte key={a.id} a={a} />)}</div> : null}
        {annonces.length < PEU ? (
          <div className="bientot">
            <h3>{annonces.length ? 'D\'autres annonces arrivent chaque jour.' : 'Les premières annonces arrivent.'}</h3>
            <p className="aide">Chacune est vérifiée avant d'apparaître ici. Laissez votre adresse : on vous écrit dès qu'il y a du choix.</p>
            <FormAttente envie="acheter" />
          </div>
        ) : null}
      </section>
      <section className="env section accueil-duo">
        <Link className="tuile tuile-placard" href="/placard">
          <p className="surtitre">Le placard</p>
          <h2 className="h2">Combien valent les parfums qui dorment chez vous ?</h2>
          <p className="aide">Ajoutez ceux que vous avez, même entamés : on estime chacun d'après la cote. Vous vendez ensuite ceux que vous voulez, en un geste.</p>
          <span className="lien">Estimer mon placard</span>
        </Link>
        <Link className="tuile tuile-verif" href="/verification">
          <Bouclier taille={64} anime={false} />
          <p className="surtitre">Nos chiffres</p>
          <h2 className="h2">{j.length ? `${pub} annonces publiées, ${ref} refusées ces 30 derniers jours.` : 'Ce qu\'on publie, ce qu\'on refuse, et pourquoi.'}</h2>
          <p className="aide">Une vérification qui ne refuse rien ne prouve rien. Les nôtres sont publiques, raisons comprises.</p>
          <span className="lien">Voir les chiffres</span>
        </Link>
      </section>
    </>
  );
}
