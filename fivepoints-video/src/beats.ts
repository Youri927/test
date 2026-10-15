// Points de synchronisation partagés par les captures (capture/shots.mjs), l'image (Remotion) et le son (sound/*.mjs).
// Ce fichier n'importe rien : Node le lit directement.

/** un temps à 90 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 40;

/** Les scènes du montage et leur durée, en temps de musique */
export const SCENE_BEATS: [string, number][] = [
  ['Open', 12],
  ['Roofs', 16],
  ['Storm', 8],
  ['Job', 8],
  ['Warranty', 8],
  ['Family', 8],
  ['Estimate', 12],
  ['Mobile', 12],
  ['End', 10],
];

/** Passage d'une scène à l'autre : un court fondu par le noir (opacité seule, rien ne bouge), en courbe douce */
export const LIGHT = {out: 12, in: 18} as const;

/**
 * Ouverture (images de la scène Open) :
 * - la page telle qu'elle s'affiche, le titre déjà là sous un toit encore vide : la première image du plan d-open,
 *   tenue `hold` images (un temps) ;
 * - à `hold`, l'ouverture du site joue telle quelle : les rampants se tracent des avant-toits au faîte, les mots
 *   montent la pente, l'étoile du logo se pose au faîte en tournant d'une pointe (1,8 s en tout) ;
 * - à `aside`, le navigateur se range de côté pour la légende, qui entre à `cap`.
 */
export const OPEN = {hold: 40, aside: 200, cap: 240} as const;

/**
 * La fin, sur l'asphalte du pied de page (images de la scène) : le toit de l'accueil revient, aux mêmes temps que sur le
 * site : les rampants dorés se tracent à `rakes` (1 s), les mots montent la pente 0,3 s après, l'étoile se pose 0,75 s
 * après ; puis l'adresse du site, à `url`.
 */
export const END = {rakes: 16, url: 156} as const;

/**
 * Les plans filmés (capture/shots.mjs, 60 i/s) : image du plan → image de la scène.
 * Toujours lus à vitesse 1 (aucune image sautée ni doublée : pas de saccade) ; `delay` images figées sur la première,
 * puis lecture à partir de l'image `from`.
 */
export type ClipTiming = {rate: number; from: number; delay: number};
export const TIMING: Record<string, ClipTiming> = {
  Open: {rate: 1, from: 0, delay: OPEN.hold},
  Roofs: {rate: 1, from: 0, delay: 0},
  Storm: {rate: 1, from: 0, delay: 0},
  Job: {rate: 1, from: 0, delay: 0},
  Warranty: {rate: 1, from: 0, delay: 0},
  Family: {rate: 1, from: 0, delay: 0},
  Estimate: {rate: 1, from: 0, delay: 0},
};

/** Téléphones : l'ouverture attend que son téléphone soit presque monté ; les deux autres démarrent avec la scène */
export const PHONE_TIMING: Record<string, ClipTiming> = {
  mOpen: {rate: 1, from: 0, delay: 30},
  mRoofs: {rate: 1, from: 0, delay: 0},
  mJob: {rate: 1, from: 0, delay: 0},
};

/**
 * Ce qui se passe à l'écran, en temps de musique comptés depuis le début de chaque scène : la musique y pose ses accents.
 * - Roofs : un clic sur « Mobile homes », puis sur « Commercial » ; la ligne de toit s'aplatit à chaque fois ; puis la
 *   souris survole « Flashing… » dans la liste, et son repère s'allume sur le dessin (de `hover` à `leave`) ;
 * - Estimate : « A mobile home », « Repair », puis « Write my request » ;
 * - Mobile : au téléphone, le pouce choisit « Commercial » (`commercial`) ; dans le troisième, il fait défiler la rangée
 *   des photos de chantier (`swipe`).
 * Les repères exacts (le dessin qui se trace, les photos qui se découvrent, les barres des garanties, la ligne de la
 * famille, la demande prête) viennent du relevé des plans (public/site/*.json).
 */
export const EVENTS = {
  roofs: {mobile: 5, commercial: 9, hover: 11.5, leave: 14},
  estimate: {kind: 2, need: 3.5, go: 8},
  mobile: {commercial: 5.5, swipe: 8},
} as const;

/** images du plan correspondant à un temps de la scène (plans lus dès l'image 0 de la scène) */
export const beatFrame = (beats: number) => Math.round(beats * BEAT);
