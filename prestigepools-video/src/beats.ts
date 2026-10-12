// Points de synchronisation partagés par l'image (Remotion) et le son (sound/music.mjs, sound/mix.mjs).
// Ce fichier n'importe rien : Node le lit directement.

/** un temps à 100 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 36;

/** Les scènes du montage et leur durée, en temps de musique */
export const SCENE_BEATS: [string, number][] = [
  ['Open', 23],
  ['Build', 10],
  ['Work', 10],
  ['Dark', 10],
  ['Reviews', 8],
  ['Plan', 8],
  ['Mobile', 10],
  ['End', 6],
];

/** Passage d'une scène à l'autre : un court fondu par le noir (opacité seule, rien ne bouge) */
export const LIGHT = {out: 10, in: 18} as const;

/**
 * Ouverture (images de la scène Open) :
 * - le site actuel seul ; de `swap` à `site`, il s'efface en fondu sur la première image du nouveau site ;
 * - à `site`, le nouveau site, filmé dès sa première image : le titre monte, l'interrupteur de la photo s'éclaire ;
 * - à `click` (un temps entier), la souris allume la piscine : la page passe du jour à la nuit en `sky` images
 *   (la même courbe que le site : crépuscule à 46 %), et le fond de la scène la suit ;
 * - à `aside`, le navigateur se range de côté pour la légende, qui entre à `cap`.
 */
export const OPEN = {swap: 144, site: 180, click: 396, sky: 75, aside: 504, cap: 546} as const;
/** image du plan d-open où la souris clique (OPEN.click − OPEN.site) */
export const OPEN_CLICK = OPEN.click - OPEN.site;

/** La fin (images de la scène) : le point de lumière s'allume, le nom monte, puis la ligne sur ce qui a servi */
export const END = {dot: 10, name: 30, line: 86} as const;

/**
 * Les plans filmés (capture/shots.mjs, 60 i/s) : image du plan → image de la scène.
 * Toujours lus à vitesse 1 (aucune image sautée ni doublée : pas de saccade) ; `delay` images figées sur la première,
 * puis lecture à partir de l'image `from`.
 */
export type ClipTiming = {rate: number; from: number; delay: number};
export const TIMING: Record<string, ClipTiming> = {
  Open: {rate: 1, from: 0, delay: OPEN.site},
  Build: {rate: 1, from: 0, delay: 0},
  Work: {rate: 1, from: 0, delay: 0},
  Dark: {rate: 1, from: 0, delay: 0},
  Reviews: {rate: 1, from: 0, delay: 0},
  Plan: {rate: 1, from: 0, delay: 0},
};

/** Téléphones : l'allumage attend que son téléphone soit monté ; les deux autres démarrent avec la scène */
export const PHONE_TIMING: Record<string, ClipTiming> = {
  mOpen: {rate: 1, from: 0, delay: 24},
  mWork: {rate: 1, from: 0, delay: 0},
  mHues: {rate: 1, from: 0, delay: 0},
};

/**
 * Ce qui se passe à l'écran, en temps de musique comptés depuis le début de chaque scène : la musique y pose ses accents.
 * - Work : le filtre « By the water », puis une photo ouverte en grand ;
 * - Dark : les projecteurs en bleu, puis en rouge ;
 * - Plan : le sujet « A spa or hot tub », puis « Service for my Prestige pool » (la note change d'adresse) ;
 * - Mobile : l'interrupteur touché (téléphone de gauche), les projecteurs en bleu puis en rouge (téléphone de droite).
 * Les étapes de la pose s'allument au défilement : leurs images viennent du relevé du plan (public/site/d-build.json).
 */
export const EVENTS = {
  work: {filter: 2, photo: 6},
  dark: [3, 6],
  plan: [3, 5],
  mobile: {lights: 6, hues: [3, 8]},
} as const;

/** images du plan correspondant à un temps de la scène (plans lus dès l'image 0 de la scène) */
export const beatFrame = (beats: number) => Math.round(beats * BEAT);
