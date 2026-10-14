// Points de synchronisation partagés par les captures (capture/shots.mjs), l'image (Remotion) et le son (sound/*.mjs).
// Ce fichier n'importe rien : Node le lit directement.

/** un temps à 112,5 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 32;

/** Les scènes du montage et leur durée, en temps de musique */
export const SCENE_BEATS: [string, number][] = [
  ['Open', 16],
  ['Layers', 20],
  ['Photos', 10],
  ['Proof', 12],
  ['Area', 12],
  ['Estimate', 12],
  ['Mobile', 12],
  ['End', 10],
];

/** Passage d'une scène à l'autre : un court fondu par le noir (opacité seule, rien ne bouge), en courbe douce */
export const LIGHT = {out: 12, in: 18} as const;

/**
 * Ouverture (images de la scène Open) :
 * - la page encore blanche dans le navigateur : la première image du plan d-open, tenue `hold` images ;
 * - à `hold` (un temps), l'ouverture du site joue telle quelle (1,9 s) : le titre monte ligne par ligne, la photo se
 *   découvre du bas vers le haut et finit à `photo`, puis le texte et la légende ;
 * - à `aside`, le navigateur se range de côté pour la légende, qui entre à `cap`.
 */
export const OPEN = {hold: 32, photo: 119, caption: 146, aside: 256, cap: 292} as const;

/** La fin (images de la scène) : le blason, le nom qui monte, la ligne, puis l'adresse du site */
export const END = {crest: 12, name: 34, line: 104, url: 144} as const;

/**
 * Les plans filmés (capture/shots.mjs, 60 i/s) : image du plan → image de la scène.
 * Toujours lus à vitesse 1 (aucune image sautée ni doublée : pas de saccade) ; `delay` images figées sur la première,
 * puis lecture à partir de l'image `from`.
 */
export type ClipTiming = {rate: number; from: number; delay: number};
export const TIMING: Record<string, ClipTiming> = {
  Open: {rate: 1, from: 0, delay: OPEN.hold},
  Layers: {rate: 1, from: 0, delay: 0},
  Photos: {rate: 1, from: 0, delay: 0},
  Proof: {rate: 1, from: 0, delay: 0},
  Area: {rate: 1, from: 0, delay: 0},
  Estimate: {rate: 1, from: 0, delay: 0},
};

/** Téléphones : l'ouverture attend que son téléphone soit presque monté ; les deux autres démarrent avec la scène */
export const PHONE_TIMING: Record<string, ClipTiming> = {
  mOpen: {rate: 1, from: 0, delay: 30},
  mLayers: {rate: 1, from: 0, delay: 0},
  mPhotos: {rate: 1, from: 0, delay: 0},
};

/**
 * Ce qui se passe à l'écran, en temps de musique comptés depuis le début de chaque scène : la musique y pose ses accents.
 * - Layers : la coupe passe à l'étape 2 sur le temps `first`, puis toutes les quatre mesures environ (défilement régulier) ;
 * - Photos : le filtre « Tile » ;
 * - Area : la souris clique dans « Check your city », tape « Boca Raton », puis « Check » ;
 * - Estimate : les choix « Tile » et « A leak fixed », puis « Write my text to Mendieta ».
 * Les repères exacts (étapes de la coupe, tuiles posées, carte, ville trouvée, message prêt) viennent du relevé des plans
 * (public/site/*.json).
 */
export const EVENTS = {
  layers: {first: 5},
  photos: {tile: 6},
  area: {focus: 6, check: 9},
  estimate: {tile: 2, leak: 3.5, go: 8},
} as const;

/** images du plan correspondant à un temps de la scène (plans lus dès l'image 0 de la scène) */
export const beatFrame = (beats: number) => Math.round(beats * BEAT);
