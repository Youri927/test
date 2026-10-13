// Points de synchronisation partagés par les captures (capture/shots.mjs), l'image (Remotion) et le son (sound/*.mjs).
// Ce fichier n'importe rien : Node le lit directement.

/** un temps à 100 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 36;

/** Les scènes du montage et leur durée, en temps de musique */
export const SCENE_BEATS: [string, number][] = [
  ['Open', 16],
  ['Treatments', 12],
  ['Results', 10],
  ['Team', 10],
  ['Bank', 10],
  ['Visit', 8],
  ['Mobile', 12],
  ['End', 8],
];

/** Passage d'une scène à l'autre : un court fondu par le noir (opacité seule, rien ne bouge), en courbe douce */
export const LIGHT = {out: 12, in: 18} as const;

/**
 * Ouverture (images de la scène Open) :
 * - la page encore blanche dans le navigateur : la première image du plan d-open, tenue `hold` images ;
 * - à `hold`, l'ouverture du site joue telle quelle (2 s) : le logo se pose, son nom s'efface, la photo s'ouvre dans le
 *   cadre à `photo`, puis le cadre s'agrandit jusqu'à l'accueil et s'y pose à `land` (un temps entier) ;
 * - à `aside`, le navigateur se range de côté pour la légende, qui entre à `cap`.
 */
export const OPEN = {hold: 24, logo: 24, name: 60, photo: 84, land: 144, aside: 288, cap: 324} as const;

/** La fin (images de la scène) : le cadre du logo se trace, le nom se découvre, puis la ligne et l'adresse du site */
export const END = {frame: 10, name: 40, line: 96, url: 132} as const;

/**
 * Les plans filmés (capture/shots.mjs, 60 i/s) : image du plan → image de la scène.
 * Toujours lus à vitesse 1 (aucune image sautée ni doublée : pas de saccade) ; `delay` images figées sur la première,
 * puis lecture à partir de l'image `from`.
 */
export type ClipTiming = {rate: number; from: number; delay: number};
export const TIMING: Record<string, ClipTiming> = {
  Open: {rate: 1, from: 0, delay: OPEN.hold},
  Treatments: {rate: 1, from: 0, delay: 0},
  Results: {rate: 1, from: 0, delay: 0},
  Team: {rate: 1, from: 0, delay: 0},
  Bank: {rate: 1, from: 0, delay: 0},
  Visit: {rate: 1, from: 0, delay: 0},
};

/** Téléphones : l'ouverture attend que son téléphone soit presque monté ; les deux autres démarrent avec la scène */
export const PHONE_TIMING: Record<string, ClipTiming> = {
  mOpen: {rate: 1, from: 0, delay: 30},
  mSvc: {rate: 1, from: 0, delay: 0},
  mDock: {rate: 1, from: 0, delay: 0},
};

/**
 * Ce qui se passe à l'écran, en temps de musique comptés depuis le début de chaque scène : la musique y pose ses accents.
 * - Treatments : la souris passe sur « Injectables », puis « Lashes » (leur nom s'élargit, leur photo passe dans le cadre),
 *   puis ouvre « Skin and lasers » ;
 * - Results : le filtre « Permanent makeup » ;
 * - Bank : la souris prend le curseur du Beauty Bank, le tire jusqu'à 12 mois, le lâche ;
 * - Mobile : le doigt ouvre « Facials and body » (téléphone du milieu).
 * Les repères exacts (photo dans le cadre, cadre tracé, barre du téléphone) viennent du relevé des plans (public/site/*.json).
 */
export const EVENTS = {
  svc: {injectables: 2, lashes: 4.5, skin: 7.5},
  res: {pmu: 2},
  bank: {press: 2.5, release: 5.5},
  mobile: {facials: 3},
} as const;

/** images du plan correspondant à un temps de la scène (plans lus dès l'image 0 de la scène) */
export const beatFrame = (beats: number) => Math.round(beats * BEAT);
