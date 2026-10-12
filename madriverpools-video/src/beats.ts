// Points de synchronisation partagés par l'image (Remotion) et le son (sound/music.mjs, sound/mix.mjs).
// Ce fichier n'importe rien : Node le lit directement.

/** un temps à 100 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 36;

/** Les scènes du montage et leur durée, en temps de musique */
export const SCENE_BEATS: [string, number][] = [
  ['Open', 18],
  ['Pools', 10],
  ['Shapes', 10],
  ['OneCall', 8],
  ['Reno', 10],
  ['Visit', 8],
  ['Mobile', 10],
  ['End', 6],
];

/** Passage d'une scène à l'autre : un court fondu par le noir (opacité seule, rien ne bouge) */
export const LIGHT = {out: 10, in: 18} as const;

/**
 * Ouverture (images de la scène Open) :
 * - le site actuel seul ; de `swap` à `site`, il s'efface en fondu sur la première image du nouveau site ;
 * - à `site`, le nouveau site, filmé dès sa première image : le slogan s'élargit, le trait dessine le bassin et le spa ;
 *   l'eau monte (la photo se dévoile) vers `fillFrom` : la musique s'ouvre de `fillFrom` à `fillTo` (des temps entiers) ;
 * - à `aside`, le navigateur se range de côté pour la légende, qui entre à `cap`.
 */
export const OPEN = {swap: 144, site: 180, fillFrom: 216, fillTo: 360, aside: 432, cap: 444} as const;

/** La fin (images de la scène) : le trait dessine le petit plan du logotype, le nom, puis la ligne sur ce qui a servi */
export const END = {mark: 8, name: 44, line: 92} as const;

/**
 * Les plans filmés (capture/shots.mjs, 60 i/s) : image du plan → image de la scène.
 * Toujours lus à vitesse 1 (aucune image sautée ni doublée : pas de saccade) ; `delay` images figées sur la première,
 * puis lecture à partir de l'image `from`.
 */
export type ClipTiming = {rate: number; from: number; delay: number};
export const TIMING: Record<string, ClipTiming> = {
  Open: {rate: 1, from: 0, delay: OPEN.site},
  Pools: {rate: 1, from: 0, delay: 0},
  Shapes: {rate: 1, from: 0, delay: 0},
  OneCall: {rate: 1, from: 0, delay: 0},
  Reno: {rate: 1, from: 0, delay: 0},
  Visit: {rate: 1, from: 0, delay: 0},
};

/** Téléphones : l'ouverture attend que son téléphone soit monté ; les deux autres démarrent avec la scène */
export const PHONE_TIMING: Record<string, ClipTiming> = {
  mOpen: {rate: 1, from: 0, delay: 24},
  mShapes: {rate: 1, from: 0, delay: 0},
  mReno: {rate: 1, from: 0, delay: 0},
};

/**
 * Ce qui se passe à l'écran, en temps de musique comptés depuis le début de chaque scène : la musique y pose ses accents.
 * - Shapes : trois formes choisies ; Reno : l'onglet du béton, puis le projet 2 ; Visit : « New pool », puis le prénom ;
 * - Mobile : trois formes touchées (téléphone du milieu), l'onglet du béton (téléphone de droite).
 */
export const EVENTS = {
  shapes: [2, 5, 8],
  reno: {tab: 3, project: 6},
  visit: [3, 5],
  mobile: {shapes: [2, 5, 8], reno: 3},
} as const;
