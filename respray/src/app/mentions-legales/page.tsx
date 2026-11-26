import {SOCIETE, HEBERGEUR, MAJ} from '@/lib/legal';

export const metadata = {title: 'Mentions légales'};

/* Le minimum légal : qui édite le site, et qui l'héberge (loi pour la confiance dans l'économie numérique). */
export default function MentionsLegales() {
  return (
    <div className="env page legal">
      <p className="surtitre">Légal</p>
      <h1 className="titre-page">Mentions légales</h1>
      <p className="aide">Dernière mise à jour : {MAJ}</p>
      <section className="legal-section">
        <h2 className="h2">Éditeur</h2>
        <ul className="legal-liste">
          <li>Nom : {SOCIETE.nom}</li>
          <li>Adresse : {SOCIETE.siege}</li>
          <li>Contact : <a className="lien-souligne" href={`mailto:${SOCIETE.email}`}>{SOCIETE.email}</a></li>
        </ul>
      </section>
      <section className="legal-section">
        <h2 className="h2">Hébergeur</h2>
        <ul className="legal-liste">
          <li>{HEBERGEUR.nom}</li>
          <li>{HEBERGEUR.adresse}</li>
        </ul>
      </section>
    </div>
  );
}
