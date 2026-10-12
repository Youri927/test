// Points de synchronisation partagés par les captures (capture/shots.mjs), l'image (Remotion) et le son (sound/*.mjs).
// Ce fichier n'importe rien : Node le lit directement.

/** un temps à 90 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 40;

/** Les scènes du montage et leur durée, en temps de musique */
export const SCENE_BEATS: [string, number][] = [
  ['Open', 16],
  ['Straight', 10],
  ['Care', 10],
  ['Team', 10],
  ['Reviews', 8],
  ['Visit', 8],
  ['Mobile', 10],
  ['End', 6],
];

/** Passage d'une scène à l'autre : un court fondu par le noir (opacité seule, rien ne bouge), en courbe douce */
export const LIGHT = {out: 12, in: 18} as const;

/**
 * Ouverture (images de la scène Open) :
 * - l'enseigne du site, en vraies lettres, seule sur le blanc : la première image du plan d-open, tenue `hold` images ;
 * - à `hold`, l'ouverture du site joue telle quelle (2,4 s) : la caméra du site recule, la photo apparaît autour
 *   des lettres, l'enseigne se pose sur la vraie à `land` (un temps entier) et tout est en place à `settle` ;
 * - à `scroll`, la page descend de quelques pixels pour montrer la façade entière et sa légende ;
 * - à `aside`, le navigateur se range de côté pour la légende, qui entre à `cap`.
 */
export const OPEN = {hold: 40, land: 160, settle: 184, scroll: 200, aside: 280, cap: 320} as const;

/** La fin (images de la scène) : l'enseigne monte, puis la ligne sur ce qui a servi, puis l'adresse du site */
export const END = {mark: 12, line: 66, url: 104} as const;

/**
 * Les plans filmés (capture/shots.mjs, 60 i/s) : image du plan → image de la scène.
 * Toujours lus à vitesse 1 (aucune image sautée ni doublée : pas de saccade) ; `delay` images figées sur la première,
 * puis lecture à partir de l'image `from`.
 */
export type ClipTiming = {rate: number; from: number; delay: number};
export const TIMING: Record<string, ClipTiming> = {
  Open: {rate: 1, from: 0, delay: OPEN.hold},
  Straight: {rate: 1, from: 0, delay: 0},
  Care: {rate: 1, from: 0, delay: 0},
  Team: {rate: 1, from: 0, delay: 0},
  Reviews: {rate: 1, from: 0, delay: 0},
  Visit: {rate: 1, from: 0, delay: 0},
};

/** Téléphones : l'ouverture attend que son téléphone soit presque monté ; les deux autres démarrent avec la scène */
export const PHONE_TIMING: Record<string, ClipTiming> = {
  mOpen: {rate: 1, from: 0, delay: 30},
  mTeam: {rate: 1, from: 0, delay: 0},
  mDock: {rate: 1, from: 0, delay: 0},
};

/**
 * Ce qui se passe à l'écran, en temps de musique comptés depuis le début de chaque scène : la musique y pose ses accents.
 * - Care : « Crowns and bridges » s'ouvre, puis la souris passe sur « crown », puis sur « bridge » (leur définition) ;
 * - Team : Denise, puis Amanda (leur biographie) ;
 * - Visit : « Something hurts » (la note renvoie au téléphone) ;
 * - Mobile : Denise puis Amanda (téléphone du milieu), le mot « lingual » touché (téléphone de droite).
 * Les repères exacts (étapes du cas, définitions, barre d'appel) viennent du relevé des plans (public/site/*.json).
 */
export const EVENTS = {
  care: {open: 2, crown: 4, bridge: 7},
  team: [2.5, 6],
  visit: 3,
  mobile: {denise: 3, amanda: 8.5, lingual: 6.5},
} as const;

/** images du plan correspondant à un temps de la scène (plans lus dès l'image 0 de la scène) */
export const beatFrame = (beats: number) => Math.round(beats * BEAT);
