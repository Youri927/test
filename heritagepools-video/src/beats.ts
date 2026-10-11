// Points de synchronisation partagés par l'image (Remotion) et le son (sound/music.mjs, sound/mix.mjs).
// Ce fichier n'importe rien : Node le lit directement.

/** un temps à 90 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 40;

/** Les scènes du montage et leur durée, en temps de musique */
export const SCENE_BEATS: [string, number][] = [
  ['Opening', 5],
  ['Build', 20],
  ['Drag', 8],
  ['Services', 8],
  ['Pools', 9],
  ['Night', 8],
  ['Values', 6],
  ['Contact', 8],
  ['Mobile', 9],
  ['End', 5],
];

/** Passage d'une scène à l'autre : un court fondu par le noir (images) */
export const LIGHT = {out: 10, in: 18} as const;

/** Ouverture (images de la scène) : la piscine s'allume, puis le logotype, puis « Your new website » */
export const OPEN = {photo: 0, logo: 44, sub: 100} as const;

/** L'ouverture du site (images de la scène Build, d'après la capture d-open) : la vague d'eau monte, puis la piscine s'allume */
export const BUILD = {water: 584, lit: 664} as const;

/** La fin (images de la scène) : le logotype, puis la ligne sur ce qui a servi à construire le site */
export const END = {logo: 20, line: 70} as const;

/**
 * Les plans filmés (capture/shots.mjs, 60 i/s) : image du plan → image de la scène.
 * Chaque plan commence avec sa scène : `delay` images figées sur la première, puis lecture à `rate` à partir de l'image `from`.
 */
export type ClipTiming = {rate: number; from: number; delay: number};
export const TIMING: Record<string, ClipTiming> = {
  Build: {rate: 1, from: 0, delay: 0},
  Drag: {rate: 1, from: 24, delay: 0},
  Services: {rate: 1, from: 30, delay: 0},
  Pools: {rate: 1.08, from: 0, delay: 0},
  Night: {rate: 1, from: 0, delay: 0},
  Values: {rate: 1.15, from: 0, delay: 0},
  Contact: {rate: 1.15, from: 0, delay: 0},
};

/** Téléphones : les trois plans démarrent avec la scène */
export const PHONE_TIMING: Record<string, ClipTiming> = {
  mOpen: {rate: 1.1, from: 50, delay: 0},
  mServices: {rate: 1, from: 0, delay: 0},
  mMenu: {rate: 1, from: 20, delay: 0},
};
