// Points de synchronisation partagés par l'image (Remotion) et le mixage (sound/mix.mjs).
// Ce fichier n'importe rien : Node le lit directement.

/** un temps à 90 BPM, à 60 images/s : les coupes et les gestes filmés tombent sur la musique */
export const BEAT = 40;

/** Les scènes du montage et leur durée, en temps de musique */
export const SCENE_BEATS: [string, number][] = [
  ['Opening', 10],
  ['Today', 22],
  ['Turn', 5],
  ['Hero', 17],
  ['Implants', 12],
  ['Crowns', 14],
  ['Treatments', 15],
  ['Sedation', 13],
  ['Doctor', 12],
  ['Request', 16],
  ['Mobile', 12],
  ['End', 14],
];

/**
 * La pastille : chaque scène qui suit arrive dans une pastille qui s'ouvre jusqu'à remplir l'image,
 * comme le sourire du titre du site qui s'ouvre sur le portrait. Durée de l'ouverture (images) ;
 * elle se termine sur le premier temps de la scène. Celle de l'accueil part de la pastille de « Turn ».
 */
export const PILL = 36;
export const PILLS: Record<string, number> = {
  Turn: PILL,
  Hero: 64,
  // les implants : pas de pastille, le plan reprend exactement là où l'accueil s'arrête (défilement continu)
  Crowns: PILL,
  Treatments: PILL,
  Sedation: PILL,
  Doctor: PILL,
  Request: PILL,
  Mobile: PILL,
  End: PILL,
};

/**
 * Les plans filmés (capture/shots.mjs, 60 i/s) et leurs repères relevés (node capture/shots.mjs --probe) :
 * image du plan → image de la scène. Chaque plan commence avec sa séquence (pastille comprise) :
 * `delay` images figées sur la première, puis lecture à `rate` à partir de l'image `from`.
 */
export type ClipTiming = {rate: number; from: number; delay: number};
export const TIMING: Record<string, ClipTiming> = {
  // le défilement (la pastille du titre qui grandit) part au temps 5 ; le nom apparaît vers le temps 8,8
  Hero: {rate: 1, from: 0, delay: 30},
  // raccord avec l'accueil (même position de défilement), une demi-seconde d'arrêt, puis les filets en croches
  // du temps 5 au temps 8 et la couronne qui se pose sur le temps 9
  Implants: {rate: 1, from: 0, delay: 30},
  // E4D finit à l'image 237 (temps 4), la méthode habituelle à l'image 497 (temps 10)
  Crowns: {rate: 13 / 12, from: 25, delay: 0},
  // le clic sur « A tooth is missing » (image 354) au temps 8
  Treatments: {rate: 1, from: 0, delay: 2},
  // sédation consciente à l'image 241 (temps 4), intraveineuse à l'image 416 (temps 9) : lecture ralentie, la lumière baisse avec la musique
  Sedation: {rate: 0.875, from: 70, delay: 0},
  // New York à l'image 170 (temps 3), Naples à l'image 403 (temps 9)
  Doctor: {rate: 233 / 240, from: 19, delay: 0},
  // l'envoi du formulaire (image 570) au temps 11
  Request: {rate: 1.2, from: 0, delay: 1},
};

/** Repères des plans filmés (images du plan), relevés par --probe */
export const MARKS = {
  heroScroll: 234,
  implantThreads: [170, 190, 209, 228, 248, 267, 286],
  implantCrown: 330,
  implantLabels: [383, 421, 438],
  e4d: 237,
  usual: 497,
  sheet: 354,
  level1: 241,
  level2: 416,
  stops: [35, 170, 403],
  sent: 570,
  mE4d: 171,
  mUsual: 375,
  mTap: 90,
} as const;

/** Téléphones : les trois plans démarrent avec la séquence ; la course E4D tombe au temps 3, le toucher au temps 6 */
export const PHONE_TIMING: Record<string, ClipTiming> = {
  mHero: {rate: 1, from: 0, delay: 0},
  mCrowns: {rate: 1, from: 15, delay: 0},
  mSheet: {rate: 1, from: 0, delay: 186},
};

/** Saisies filmées (secondes du plan d-request) : [début, fin, nombre de caractères] */
export const TYPING: [number, number, number][] = [
  [4.55, 5.1, 11],
  [5.65, 6.4, 14],
  [6.75, 7.6, 23],
];

/** Ouverture : le logo se construit (la racine, les sept filets en doubles croches, la couronne qui se pose au temps 4) */
export const OPEN = {root: 8, thread0: 40, threadStep: 10, crownFrom: 128, crown: 160, name: 168, line: 236} as const;

/** Aujourd'hui : images (dans la scène) des trois constats, de la navigation vers chaque page et des surlignages */
export const TODAY = {
  findings: [160, 400, 640],
  pages: [150, 390, 630],
  marks: [240, 260, 280, 480, 720, 760],
} as const;

/** La fin : la pastille du sourire s'ouvre, le téléphone apparaît */
export const END = {pill: 40, phone: 120, logo: {root: 4, thread0: 30, threadStep: 5, crownFrom: 60, crown: 80}} as const;
