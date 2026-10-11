// Points de synchronisation partagés par l'image (Remotion) et le son (sound/music.mjs, sound/mix.mjs).
// Ce fichier n'importe rien : Node le lit directement.

/** un temps à 90 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 40;

/** Les scènes du montage et leur durée, en temps de musique */
export const SCENE_BEATS: [string, number][] = [
  ['Opening', 6],
  ['Hero', 6],
  ['Cards', 7],
  ['Build', 7],
  ['Reno', 7],
  ['Finish', 6],
  ['Leaks', 7],
  ['Contact', 5],
  ['Mobile', 7],
  ['End', 6],
];

/** Passage d'une scène à l'autre : un court fondu par le noir (images) */
export const LIGHT = {out: 10, in: 18} as const;

/** Ouverture (images de la scène) : la photo sort du noir, puis le logo, puis « Your new website » */
export const OPEN = {photo: 0, logo: 56, sub: 110} as const;

/** La fin (images de la scène) : le logo, puis la ligne sur ce qui a servi à construire le site */
export const END = {logo: 24, line: 84} as const;
