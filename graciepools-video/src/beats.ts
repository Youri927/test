// Points de synchronisation partagés par l'image (Remotion) et le mixage (sound/mix.mjs).
// Ce fichier n'importe rien : Node le lit directement.

/** un temps à 100 BPM, à 60 images/s : les coupes et les gestes filmés tombent sur la musique */
export const BEAT = 36;

/** Les scènes du montage et leur durée, en temps de musique */
export const SCENE_BEATS: [string, number][] = [
  ['Opening', 10],
  ['Today', 24],
  ['Sheet', 18],
  ['Hero', 14],
  ['OnePiece', 13],
  ['Models', 13],
  ['Compare', 14],
  ['Gallery', 12],
  ['Service', 12],
  ['Request', 15],
  ['Mobile', 12],
  ['End', 14],
];

/**
 * La règle : chaque scène arrive entre les deux mâchoires d'une règle graduée en pieds,
 * comme les règles du comparateur du site. La règle se trace au milieu de l'image, puis s'ouvre.
 * Durée de l'ouverture (images) ; elle se termine sur le premier temps de la scène.
 */
export const CAL = 36;
export const CALIPERS: Record<string, number> = {
  Today: CAL,
  Sheet: CAL,
  Hero: CAL,
  OnePiece: CAL,
  Models: CAL,
  // la comparaison : pas de règle, le plan du comparateur continue (même prise)
  Gallery: CAL,
  Service: CAL,
  Request: CAL,
  Mobile: CAL,
  End: CAL,
};

/**
 * Les plans filmés (capture/shots.mjs, 60 i/s) et leurs repères relevés (node capture/shots.mjs --probe) :
 * image du plan → image de la scène. Chaque plan commence avec sa séquence (règle comprise) :
 * `delay` images figées sur la première, puis lecture à `rate` à partir de l'image `from`.
 */
export type ClipTiming = {rate: number; from: number; delay: number};
export const TIMING: Record<string, ClipTiming> = {
  // le passage au Laguna (image 415) tombe au temps 10,5 de la scène
  Hero: {rate: 1, from: 0, delay: 0},
  // la scène part en plein défilement (image 54), l'accueil déjà en train de sortir ; les étapes se dessinent à partir de l'image 283
  OnePiece: {rate: 1, from: 54, delay: 0},
  // Whitsunday Deep (image 150), le filtre (258), l'Escape (312), l'épingle (402)
  Models: {rate: 1, from: 0, delay: 0},
  // même prise : la scène reprend à l'image 504, là où le comparateur s'arrête ; trois coloris (618, 678, 738), le Billabong Cove (858)
  Compare: {rate: 1, from: 504, delay: 0},
  // le glissé (147 → 237), le nom cliqué (336), le comparateur atteint vers l'image 420
  Gallery: {rate: 1, from: 60, delay: 0},
  // le survol de « Text a photo » (180), « Resurfacing and tile » (324)
  Service: {rate: 1, from: 30, delay: 0},
  // « Ask about this pool » (78), la saisie, l'envoi (462)
  Request: {rate: 1, from: 0, delay: 0},
};

/** Repères des plans filmés (images du plan), relevés par --probe */
export const MARKS = {
  heroSwitch: 415,
  steps: 283,
  ghost: 516,
  cove: 336,
  tile: 324,
  sent: 462,
} as const;

/** Téléphones : les trois plans démarrent avec la séquence */
export const PHONE_TIMING: Record<string, ClipTiming> = {
  mHero: {rate: 1, from: 0, delay: 0},
  mPlanner: {rate: 1, from: 0, delay: 0},
  mMenu: {rate: 1, from: 0, delay: 0},
};

/** Saisies filmées (secondes du plan d-request) : [début, fin, nombre de caractères] */
export const TYPING: [number, number, number][] = [
  [4.2, 4.8, 11],
  [5.1, 5.9, 14],
  [6.4, 7.0, 11],
];

/**
 * Ouverture : la cote de la longueur se trace (le nombre compte jusqu'à 35′ 3⅛″), puis celle de la largeur,
 * le contour du Billabong Cove, l'eau qui le remplit sur le temps 4 ; la marque et le nom
 */
export const OPEN = {grid: 0, length: 8, width: 30, outline: 40, fill: 144, mark: 216, name: 232, line: 268} as const;

/** Aujourd'hui : images (dans la scène) des pages ouvertes, des trois constats et des preuves mesurées */
export const TODAY = {
  pages: [144, 396, 612, 756],
  findings: [180, 432, 648],
  marks: [252, 288, 504, 540, 684, 828],
} as const;

/** La fiche : la note « not to scale », puis les dessins qui se détachent et se rangent à l'échelle, et le titre */
export const SHEET = {note: 96, pull: 180, lift: 216, land0: 252, landStep: 6, title: 432} as const;

/** La fin : la gamme entière, le nom, le téléphone */
export const END = {lineup: 0, mark: 36, phone: 108} as const;
