/* Les règles de Respray, en un seul endroit : les frais, les photos demandées, les listes du formulaire de vente. */

/* le vendeur ne paie rien ; l'acheteur paie 8 % + 0,90 € ; options : envoi assuré au-dessus de 150 €, mise en avant */
export const protection = (prix: number) => Math.round((prix * 0.08 + 0.9) * 100) / 100;
export const ENVOI = 4.9;
export const ASSURANCE = 2.9;
export const SEUIL_ASSURANCE = 150;
export const MISES_EN_AVANT = [
  {k: '', t: 'Non merci', prix: 0},
  {k: '3j', t: '3 jours en tête des résultats', prix: 1.99},
  {k: '7j', t: '7 jours, et sur l\'accueil', prix: 4.99},
];

export const PHOTOS = [
  {k: 'face', t: 'Le flacon de face', d: 'Bien droit, étiquette lisible.', obl: true},
  {k: 'dessous', t: 'Le dessous du flacon', d: 'Le code lot gravé ou imprimé doit se lire.', obl: true},
  {k: 'niveau', t: 'Le niveau', d: 'À hauteur des yeux. Flacon opaque : une lampe de téléphone collée derrière.', obl: true},
  {k: 'dessus', t: 'Sans le bouchon, vu de dessus', d: 'Le bouton spray en place, la bague bien visible.', obl: true},
  {k: 'tige', t: 'Sans le bouton spray', d: 'Retirez le petit bouton : la tige doit se voir.', obl: true},
  {k: 'preuve', t: 'Votre pseudo et la date', d: 'Le flacon à côté d\'un papier où vous les avez écrits.', obl: true},
  {k: 'boite', t: 'La boîte', d: 'Avec le code lot et le code-barres, si vous l\'avez.', obl: false},
  {k: 'ticket', t: 'Le ticket ou la facture', d: 'Facultatif, mais rassurant pour l\'acheteur.', obl: false},
] as const;

export const CONCENTRATIONS = ['Extrait de parfum', 'Eau de parfum', 'Eau de toilette', 'Eau de Cologne', 'Parfum pour cheveux', 'Brume parfumée'];
export const GROUPES_FAMILLES: [string, string, [string, string][]][] = [
  ['Fraîches', 'fam-fraiche', [['Hespéridée', 'citron, pamplemousse, néroli'], ['Aquatique', 'sel, air marin, melon'], ['Aromatique', 'menthe, basilic, sauge']]],
  ['Florales et fruitées', 'fam-florale', [['Florale', 'iris, fleur d\'oranger, muguet'], ['Fruitée', 'poire, figue, framboise']]],
  ['Chaudes', 'fam-chaude', [['Gourmande', 'café, cacao, amande'], ['Ambrée', 'benjoin, labdanum, cannelle'], ['Musquée', 'peau propre, coton, poudre']]],
  ['Boisées et sombres', 'fam-boisee', [['Boisée', 'oud, gaïac, vétiver'], ['Cuirée', 'daim, fumée, bouleau'], ['Chyprée', 'mousse, patchouli, agrumes'], ['Fougère', 'herbe coupée, coumarine']]],
];
export const FORMATS = [['flacon', 'Flacon'], ['voyage', 'Format voyage'], ['miniature', 'Miniature'], ['echantillon', 'Échantillon acheté'], ['coffret', 'Coffret']] as const;
/* pourquoi on le vend : la question que l'acheteur se pose sans la poser */
export const POURQUOI = ['Reçu en cadeau, pas mon style', 'J\'en ai trop, je fais tourner', 'Il ne tient pas sur ma peau', 'Je ne le porte plus', 'Acheté en double', 'Autre raison'];
export const LIEUX = ['Boutique de la maison', 'Parfumerie (Sephora, Nocibé, Marionnaud…)', 'Grand magasin', 'Site officiel ou parfumerie en ligne', 'Reçu en cadeau', 'Acheté d\'occasion'];
export const DEFAUTS = ['Bouchon marqué ou rayé', 'Étiquette usée', 'Flacon rayé', 'Vaporisateur un peu dur'];
export const BOITES = [['blister', 'Neuve, sous blister'], ['bon', 'En bon état'], ['abimee', 'Abîmée'], ['aucune', 'Pas de boîte']] as const;
export const annees = () => {
  const y = new Date().getFullYear();
  return [...Array.from({length: y - 2004}, (_, i) => String(y - i)), 'Avant 2005', 'Je ne sais plus'];
};
export const RAISONS_REFUS = ['La photo du dessous ne permet pas de lire le code lot', 'Il manque la photo de la tige sans le bouton spray', 'Il manque la photo avec le pseudo et la date', 'Le code lot ne correspond pas au format de la marque', 'Le prix est anormalement bas : merci de vérifier', 'Les photos ont déjà été vues sur une autre annonce', 'Contrefaçon probable'];
export const CONTROLES = ['Les 6 photos sont là et nettes', 'Code lot lisible et au format de la maison', 'Spray, bague et tige d\'origine', 'Flacon conforme aux modèles connus', 'Niveau conforme à l\'annonce', 'Papier avec le bon pseudo et une date récente'];

const nf = new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0});
const nf2 = new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'});
export const eur = (n: number) => (Number.isInteger(n) ? nf.format(n) : nf2.format(n));
export const eur2 = (n: number) => nf2.format(n);
export const normal = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
/* « parfum de marly » → « Parfum de Marly » */
export function proprement(s: string) {
  const petits = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'et', 'pour', 'à', 'au', 'aux', 'en', 'sur']);
  return s
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((m, i) => (i > 0 && petits.has(m) ? m : m.startsWith("d'") ? "d'" + m.slice(2, 3).toUpperCase() + m.slice(3) : m.charAt(0).toUpperCase() + m.slice(1)))
    .join(' ');
}

/* « Maison Francis Kurkdjian », « Baccarat Rouge 540 » → « maison-francis-kurkdjian-baccarat-rouge-540 » */
export const lien = (...mots: string[]) => normal(mots.join(' ')).replace(/&/g, ' et ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
