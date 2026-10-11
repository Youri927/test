// Points de synchronisation partagés par l'image (Remotion) et le son (sound/music.mjs, sound/mix.mjs).
// Ce fichier n'importe rien : Node le lit directement.

/** un temps à 90 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 40;

/** Les scènes du montage et leur durée, en temps de musique */
export const SCENE_BEATS: [string, number][] = [
  ['Opening', 6],
  ['Hero', 9],
  ['Cards', 9],
  ['Build', 10],
  ['Reno', 8],
  ['Finish', 7],
  ['Leaks', 9],
  ['Contact', 6],
  ['Mobile', 9],
  ['End', 6],
];

/** Passage d'une scène à l'autre : un court fondu par le noir (images) */
export const LIGHT = {out: 10, in: 18} as const;

/** Ouverture (images de la scène) : la photo sort du noir, puis le logo, puis « Your new website » */
export const OPEN = {photo: 0, logo: 56, sub: 110} as const;

/** La fin (images de la scène) : le logo, puis la ligne sur ce qui a servi à construire le site */
export const END = {logo: 24, line: 84} as const;

/**
 * Les plans filmés (capture/shots.mjs, 60 i/s) : image du plan → image de la scène.
 * Chaque plan commence avec sa scène : `delay` images figées sur la première, puis lecture à `rate` à partir de l'image `from`.
 */
export type ClipTiming = {rate: number; from: number; delay: number};
export const TIMING: Record<string, ClipTiming> = {
  Hero: {rate: 1, from: 0, delay: 0},
  Cards: {rate: 1, from: 0, delay: 0},
  Build: {rate: 1, from: 0, delay: 0},
  Reno: {rate: 1, from: 0, delay: 0},
  Finish: {rate: 1, from: 0, delay: 0},
  Leaks: {rate: 1, from: 0, delay: 0},
  Contact: {rate: 1, from: 0, delay: 0},
};

/** Téléphones : les trois plans démarrent avec la scène */
export const PHONE_TIMING: Record<string, ClipTiming> = {
  mHero: {rate: 1, from: 0, delay: 0},
  mCards: {rate: 1, from: 0, delay: 0},
  mMenu: {rate: 1, from: 0, delay: 0},
};
