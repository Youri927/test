import Link from 'next/link';
import {publiees} from '@/lib/annonces';
import {Carte} from '@/components/Carte';
import {FormAttente} from '@/components/FormulairesCompte';

export const dynamic = 'force-dynamic';

/* L'accueil montre les vraies annonces publiées, les plus récentes d'abord. Tant qu'il y en a peu, il le dit, et
   propose d'être prévenu : jamais d'annonce inventée. */
const PEU = 8;

export default async function Accueil() {
  const annonces = await publiees(24);
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
    </>
  );
}
