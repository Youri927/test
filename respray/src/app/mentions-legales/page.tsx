import {PageLegale} from '@/components/PageLegale';
import {SOCIETE, HEBERGEUR, MEDIATEUR} from '@/lib/legal';

export const metadata = {title: 'Mentions légales'};

export default function MentionsLegales() {
  return (
    <PageLegale
      surtitre="Informations légales"
      titre="Mentions légales"
      intro={<p>Les informations sur l'éditeur et l'hébergeur du site {SOCIETE.site}, conformément à la loi pour la confiance dans l'économie numérique.</p>}
      sections={[
        {id: 'editeur', t: 'Éditeur du site', c: <p>Le site {SOCIETE.site} est édité par {SOCIETE.nom}, {SOCIETE.forme} au capital de {SOCIETE.capital}, dont le siège est situé {SOCIETE.siege}, immatriculée au RCS de {SOCIETE.rcs}, TVA intracommunautaire {SOCIETE.tva}.<br />Contact : <a className="lien-souligne" href={`mailto:${SOCIETE.email}`}>{SOCIETE.email}</a>.</p>},
        {id: 'publication', t: 'Directeur de la publication', c: <p>{SOCIETE.directeur}.</p>},
        {id: 'hebergeur', t: 'Hébergeur', c: <p>{HEBERGEUR.nom}, {HEBERGEUR.adresse} ({HEBERGEUR.site}). Les serveurs du site sont situés à Paris, en France.</p>},
        {id: 'plateforme', t: 'Nature du service', c: <p>Respray est une plateforme en ligne de mise en relation entre particuliers pour la vente de parfums de seconde main. Respray n'est ni le vendeur ni l'acheteur des parfums proposés : la vente est conclue directement entre les membres. Les paiements sont traités par Stripe Payments Europe, Ltd, établissement de monnaie électronique agréé.</p>},
        {id: 'mediation', t: 'Médiation de la consommation', c: <p>En cas de litige avec Respray non résolu par notre service client ({SOCIETE.email}), vous pouvez recourir gratuitement au médiateur de la consommation : {MEDIATEUR.nom} ({MEDIATEUR.site}).</p>},
        {id: 'propriete', t: 'Propriété intellectuelle', c: <p>La marque Respray, le logo, la charte graphique et les contenus éditoriaux du site sont la propriété de l'éditeur. Les photos des annonces appartiennent à leurs auteurs, qui en accordent l'usage à Respray dans les conditions prévues par les conditions d'utilisation. Les noms et marques des maisons de parfum appartiennent à leurs titulaires et ne sont cités que pour désigner les produits ; Respray n'est affilié à aucune maison.</p>},
      ]}
    />
  );
}
