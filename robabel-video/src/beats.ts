// Points de synchronisation partagés par l'image (Remotion) et le son (sound/music.mjs, sound/mix.mjs).
// Ce fichier n'importe rien : Node le lit directement.

/** un temps à 90 BPM, à 60 images/s : les coupes et les gestes filmés tombent sur la musique */
export const BEAT = 40;

/** Les scènes du montage et leur durée, en temps de musique */
export const SCENE_BEATS: [string, number][] = [
  ['Opening', 11],
  ['Today', 10],
  ['Hero', 15],
  ['Pools', 16],
  ['Water', 9],
  ['Pump', 21],
  ['Backyard', 10],
  ['How', 12],
  ['Salt', 10],
  ['Contact', 18],
  ['Mobile', 11],
  ['End', 12],
];

/**
 * « Lights on » : chaque scène s'éteint sur ses dernières images et la suivante s'allume,
 * comme les lumières de l'accueil du site. Durées en images ; le déclic tombe au début de l'allumage.
 */
export const LIGHT = {out: 12, in: 26, click: 2} as const;

/**
 * Les plans filmés (capture/shots.mjs, 60 i/s) : image du plan → image de la scène.
 * Chaque plan commence avec sa scène : `delay` images figées sur la première, puis lecture à `rate` à partir de l'image `from`.
 */
export type ClipTiming = {rate: number; from: number; delay: number};
export const TIMING: Record<string, ClipTiming> = {
  Hero: {rate: 1, from: 0, delay: 0},
  Pools: {rate: 1, from: 30, delay: 0},
  Water: {rate: 1, from: 0, delay: 30},
  Pump: {rate: 1, from: 0, delay: 0},
  Backyard: {rate: 1, from: 60, delay: 0},
  How: {rate: 1, from: 24, delay: 0},
  Salt: {rate: 1, from: 60, delay: 0},
  Contact: {rate: 1, from: 60, delay: 0},
};

/** Téléphones : les trois plans démarrent avec la scène */
export const PHONE_TIMING: Record<string, ClipTiming> = {
  mHero: {rate: 1, from: 0, delay: 0},
  mPump: {rate: 1, from: 0, delay: 0},
  mMenu: {rate: 1, from: 0, delay: 0},
};

/** Saisies filmées (secondes du plan d-contact) : [début, fin, nombre de caractères] */
export const TYPING: [number, number, number][] = [
  [6.2, 6.8, 12],
  [7.1, 7.8, 14],
];

/**
 * Ouverture (images de la scène) : la photo sort du noir lumières éteintes, puis la maison, les six palmiers un à un,
 * la piscine en violet ; le nom et « Your new website »
 */
export const OPEN = {photo: 0, house: 40, palms: 80, palmStep: 16, pool: 200, name: 270, sub: 320} as const;

/** Aujourd'hui : la page de la galerie, la caméra va lire une légende */
export const TODAY = {caption: 150} as const;

/** La fin (images de la scène) : la piscine, les palmiers puis la maison s'éteignent ; le nom, puis la ligne sur ce qui a servi à construire le site */
export const END = {pool: 40, palms: 120, palmStep: 20, house: 262, name: 40, line: 110} as const;
