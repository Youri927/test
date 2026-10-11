// Points de synchronisation partagés par l'image (Remotion) et le son (sound/music.mjs, sound/mix.mjs).
// Ce fichier n'importe rien : Node le lit directement.

/** un temps à 100 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 36;

/** Les scènes du montage et leur durée, en temps de musique */
export const SCENE_BEATS: [string, number][] = [
  ['Open', 18],
  ['Refill', 12],
  ['Changes', 8],
  ['Pad', 12],
  ['Process', 8],
  ['Reviews', 12],
  ['Close', 12],
  ['Mobile', 10],
  ['End', 6],
];

/** Passage d'une scène à l'autre : un court fondu par le noir (images) */
export const LIGHT = {out: 10, in: 18} as const;

/**
 * Ouverture (images de la scène Open) : l'ancien site seul, puis la ligne d'eau monte de `water` à `top` et le découvre ;
 * le nouveau site se charge à partir de `site` (le titre monte, la frise se recarrelle de `lay` à `set`, puis le reflet).
 */
export const OPEN = {water: 36, top: 144, site: 144, lay: 167, set: 298} as const;

/** La fin (images de la scène) : la frise se pose, le logotype, puis la ligne sur ce qui a servi à faire le site */
export const END = {frieze: 0, logo: 30, line: 80} as const;

/**
 * Les plans filmés (capture/shots.mjs, 60 i/s) : image du plan → image de la scène.
 * Chaque plan commence avec sa scène : `delay` images figées sur la première, puis lecture à `rate` à partir de l'image `from`.
 * Les gestes des plans sont placés pour tomber sur des temps de la musique (voir EVENTS).
 */
export type ClipTiming = {rate: number; from: number; delay: number};
export const TIMING: Record<string, ClipTiming> = {
  Open: {rate: 1, from: 0, delay: OPEN.site},
  Refill: {rate: 1, from: 60, delay: 0},
  Changes: {rate: 1, from: 30, delay: 0},
  Pad: {rate: 1, from: 48, delay: 0},
  Process: {rate: 1.3, from: 30, delay: 0},
  Reviews: {rate: 1.25, from: 30, delay: 0},
  Close: {rate: 1.3, from: 12, delay: 0},
};

/** Téléphones : les trois plans démarrent avec la scène (le menu attend 54 images avant de se lancer) */
export const PHONE_TIMING: Record<string, ClipTiming> = {
  mOpen: {rate: 1.25, from: 0, delay: 0},
  mTowns: {rate: 1, from: 24, delay: 0},
  mMenu: {rate: 1, from: 0, delay: 54},
};

/**
 * Ce qui se passe à l'écran, en temps de musique comptés depuis le début de chaque scène : la musique y pose ses accents.
 * - Refill : la souris prend la ligne d'eau, la monte, la descend, la remonte, la lâche ;
 * - Changes : la photo change ; Pad, Reviews : les clics ; Close : la pose de « PETRI » commence ;
 * - Mobile : le pouce choisit Dallas puis Plano (puces), le menu s'ouvre.
 */
export const EVENTS = {
  refill: {grab: 4, top: 5.5, bottom: 8, back: 9.5, release: 10},
  changes: [2, 4, 6],
  pad: [3, 7, 11],
  reviews: [5, 8.5],
  close: {inlay: 8},
  mobile: {towns: [2, 6], menu: 4},
} as const;
