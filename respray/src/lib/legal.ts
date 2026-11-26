/* Les informations légales de Respray, en un seul endroit. Les mentions entre crochets sont À COMPLÉTER dès que la
   société existe (statuts, Kbis, médiateur). Toutes les pages légales les reprennent d'ici. */
export const SOCIETE = {
  nom: 'SILENT',
  siege: '51 avenue des Champs-Élysées, 75008 Paris, France',
  directeur: 'SILENT (identifié ci-dessus)',
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
  ['Mondial Relay (France)', 'Livraison en point relais : nom et e-mail de l\'acheteur, point relais choisi ; nom, adresse et téléphone d\'expéditeur du vendeur', 'mondialrelay.fr'],
  ['Brevo (France)', 'Envoi des e-mails du site (adresse e-mail du destinataire)', 'brevo.com/fr/legal/privacypolicy'],
  ['Trustpilot A/S (Danemark)', 'Avis sur Respray : le module Trustpilot affiché sur le site, et l\'avis que vous choisissez d\'y laisser', 'fr.legal.trustpilot.com/for-reviewers/end-user-privacy-terms'],
  ['Google Ireland Limited', '« Continuer avec Google », si vous le choisissez (nom, prénom, adresse e-mail)', 'policies.google.com/privacy'],
];
