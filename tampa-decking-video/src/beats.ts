// Points de synchronisation partagés par l'image (Remotion) et le mixage (sound/mix.mjs).
// Ce fichier n'importe rien : Node le lit directement.

/** un temps à 100 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 36;

/** Les scènes du montage et leur durée, en temps de musique */
export const SCENE_BEATS: [string, number][] = [
  ['Opening', 11],
  ['Today', 16],
  ['Turn', 6],
  ['Hero', 14],
  ['Layers', 24],
  ['Work', 15],
  ['Surfaces', 11],
  ['Cost', 9],
  ['About', 13],
  ['Areas', 11],
  ['Estimate', 17],
  ['Mobile', 13],
  ['End', 15],
];

/** Les chapitres qui montent par-dessus le précédent, derrière la ligne d'eau : durée de la montée (images) */
export const RISE = 44;
export const RISES: Record<string, number> = {Today: RISE, Turn: RISE, Hero: RISE};

/** Entre deux sections du nouveau site, la caméra plonge : durée de la sortie et de l'entrée (images) */
export const DIVE_LEN = 24;

/** Ouverture : la fenêtre descend d'une couche à l'autre [début, arrivée] ; les arrivées tombent sur les temps 4, 6 et 8 */
export const OPEN_MOVES: [number, number][] = [[110, 144], [182, 216], [254, 288]];

/** Aujourd'hui : image (dans la scène) où le surligneur passe sur le code brut, le temps 22 du montage */
export const MARK = 396;

/** La coupe : les couches s'allument aux images 159, 368, 571 et 775 du plan filmé (mesuré sur la vidéo).
 * Joué à 17/15 à partir de l'image 37, elles tombent sur les temps de la musique (une tous les cinq temps). */
export const LAYERS_CLIP = {rate: 17 / 15, from: 37};
export const LAYER_FRAMES = [108, 292, 471, 651];

/** Vitesse de lecture des autres plans filmés */
export const RATE = {Work: 1.25, Surfaces: 1.25, Cost: 1.2, About: 1.25, Areas: 1.25, Estimate: 1.35} as const;
/** Première image jouée : la galerie reprend la page là où la coupe l'a laissée (pas de retour en arrière pendant la plongée) */
export const FROM: Record<string, number> = {Work: 50};

/** Saisies filmées (secondes du plan) : [début, fin, nombre de caractères tapés] */
export const TYPING: Record<string, [number, number, number][]> = {
  Areas: [[3.0, 3.45, 3], [4.3, 4.85, 4]],
  Estimate: [[3.95, 4.5, 11], [5.05, 5.9, 14], [6.35, 7.2, 23], [8.55, 10.0, 67]],
};

/** Fin : image où l'on passe de « You have reached the deep end » au nom et au téléphone */
export const END_SWAP = 200;
