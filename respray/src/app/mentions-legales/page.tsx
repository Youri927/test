import {SOCIETE, HEBERGEUR, MAJ} from '@/lib/legal';

export const metadata = {title: 'Mentions légales'};

/* Les mentions légales, au plus simple : l'éditeur, le directeur de la publication et l'hébergeur. Les valeurs viennent
   de src/lib/legal.ts. */
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
        <h2 className="h2">Directeur de la publication</h2>
        <p>{SOCIETE.directeur}.</p>
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
