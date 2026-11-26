/* Les informations légales de Respray, en un seul endroit. Les mentions entre crochets sont À COMPLÉTER dès que la
   société existe (statuts, Kbis, médiateur). Toutes les pages légales les reprennent d'ici. */
export const SOCIETE = {
  nom: 'SILENT',
  forme: '[Forme juridique, ex. SAS]',
  capital: '[Capital social]',
  siege: '51 avenue des Champs-Élysées, 75008 Paris, France',
  rcs: '[Ville et numéro RCS]',
  tva: '[Numéro de TVA intracommunautaire]',
  directeur: '[Nom du directeur de la publication]',
  email: 'contact@respray.fr',
  site: 'respray.fr',
};

/* l'hébergeur du site (le VPS) */
export const HEBERGEUR = {
  nom: 'Hostinger International Ltd',
  adresse: '61 Lordou Vironos Street, 6023 Larnaca, Chypre',
  site: 'www.hostinger.fr',
};

/* le médiateur de la consommation (obligatoire avant d'ouvrir au public : adhésion à un médiateur agréé) */
export const MEDIATEUR = {
  nom: '[Nom du médiateur de la consommation]',
  site: '[Site du médiateur]',
};

export const MAJ = '26 novembre 2026';

/* les prestataires qui traitent des données pour Respray */
export const PRESTATAIRES: [string, string, string][] = [
  ['Stripe Payments Europe, Ltd (Irlande)', 'Paiements, vérification d\'identité et versements aux vendeurs', 'stripe.com/fr/privacy'],
  ['Hostinger International Ltd (Chypre ; serveur à Paris)', 'Hébergement du site, de la base de données et des photos', 'hostinger.fr/politique-de-confidentialite'],
  ['Mondial Relay (France)', 'Livraison en point relais (nom de l\'acheteur et point relais choisi)', 'mondialrelay.fr'],
];
