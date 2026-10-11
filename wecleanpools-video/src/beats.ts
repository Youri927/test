// Points de synchronisation partagés par l'image (Remotion) et le son (sound/music.mjs, sound/mix.mjs).
// Ce fichier n'importe rien : Node le lit directement.

/** un temps à 100 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 36;

/** Les scènes du montage et leur durée, en temps de musique */
export const SCENE_BEATS: [string, number][] = [
  ['Open', 20],
  ['Weekly', 10],
  ['Prices', 9],
  ['Remodels', 12],
  ['Dallas', 8],
  ['Estimate', 8],
  ['Mobile', 10],
  ['End', 6],
];

/** Passage d'une scène à l'autre : un court fondu par le noir (opacité seule, rien ne bouge) */
export const LIGHT = {out: 10, in: 18} as const;

/**
 * Ouverture (images de la scène Open) :
 * - le site actuel seul ; de `murk` à `site`, l'eau verte le recouvre ;
 * - à `site`, le nouveau site, filmé : l'eau verte et la question ; l'eau s'éclaircit de `clearFrom` à `clearTo` ;
 * - à `aside`, le navigateur se range de côté pour la légende, qui entre à `cap`.
 */
export const OPEN = {murk: 144, site: 216, clearFrom: 288, clearTo: 552, aside: 576, cap: 588} as const;

/** La fin (images de la scène) : le logotype, puis la ligne sur ce qui a servi à faire le site */
export const END = {logo: 16, line: 62} as const;

/**
 * Les plans filmés (capture/shots.mjs, 60 i/s) : image du plan → image de la scène.
 * Toujours lus à vitesse 1 (aucune image sautée ni doublée : pas de saccade) ; `delay` images figées sur la première,
 * puis lecture à partir de l'image `from`.
 */
export type ClipTiming = {rate: number; from: number; delay: number};
export const TIMING: Record<string, ClipTiming> = {
  Open: {rate: 1, from: 0, delay: OPEN.site},
  Weekly: {rate: 1, from: 12, delay: 0},
  Prices: {rate: 1, from: 0, delay: 0},
  Remodels: {rate: 1, from: 0, delay: 0},
  Dallas: {rate: 1, from: 6, delay: 0},
  Estimate: {rate: 1, from: 0, delay: 0},
};

/** Téléphones : les trois plans démarrent avec la scène */
export const PHONE_TIMING: Record<string, ClipTiming> = {
  mOpen: {rate: 1, from: 0, delay: 0},
  mPrices: {rate: 1, from: 0, delay: 0},
  mViewer: {rate: 1, from: 0, delay: 0},
};

/**
 * Ce qui se passe à l'écran, en temps de musique comptés depuis le début de chaque scène : la musique y pose ses accents.
 * - Prices : la ligne de la vidange s'ouvre ; Remodels : le chantier 8 choisi, la photo maintenue (l'avant), lâchée ;
 * - Estimate : « A remodel », puis le champ du nom ; Mobile : la vidange ouverte, le chantier 8, la photo maintenue.
 */
export const EVENTS = {
  prices: {open: 3},
  remodels: {pick: 3, hold: 5, release: 8},
  estimate: [3, 5],
  mobile: {open: 3, pick: 2, hold: 4, release: 7},
} as const;
