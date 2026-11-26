import {SOCIETE, HEBERGEUR, MAJ} from '@/lib/legal';

export const metadata = {title: 'Mentions légales'};

/* Le minimum légal, présenté simplement : ce qu'exige la loi pour la confiance dans l'économie numérique (art. 6) d'un
   site édité par une société, et l'hébergeur. Les valeurs viennent de src/lib/legal.ts. */
export default function MentionsLegales() {
  return (
    <div className="env page legal">
      <p className="surtitre">Légal</p>
      <h1 className="titre-page">Mentions légales</h1>
      <p className="aide">Dernière mise à jour : {MAJ}</p>
      <section className="legal-section">
        <h2 className="h2">Éditeur</h2>
        <ul className="legal-liste">
          <li>Nom : {SOCIETE.nom}, {SOCIETE.forme} au capital de {SOCIETE.capital}</li>
          <li>Adresse : {SOCIETE.siege}</li>
          <li>Immatriculation : RCS {SOCIETE.rcs}</li>
          <li>TVA intracommunautaire : {SOCIETE.tva}</li>
          <li>Directeur de la publication : {SOCIETE.directeur}</li>
          <li>Contact : <a className="lien-souligne" href={`mailto:${SOCIETE.email}`}>{SOCIETE.email}</a> · {SOCIETE.telephone}</li>
        </ul>
      </section>
      <section className="legal-section">
        <h2 className="h2">Hébergeur</h2>
        <ul className="legal-liste">
          <li>Nom : {HEBERGEUR.nom}</li>
          <li>Adresse : {HEBERGEUR.adresse}</li>
          <li>Site : {HEBERGEUR.site}</li>
        </ul>
      </section>
    </div>
  );
}
