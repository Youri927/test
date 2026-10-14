// Points de synchronisation partagés par les captures (capture/shots.mjs), l'image (Remotion) et le son (sound/*.mjs).
// Ce fichier n'importe rien : Node le lit directement.

/** un temps à 100 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 36;

/** Les scènes du montage et leur durée, en temps de musique */
export const SCENE_BEATS: [string, number][] = [
  ['Open', 12],
  ['Name', 16],
  ['Homes', 8],
  ['Rooms', 10],
  ['Story', 16],
  ['Family', 8],
  ['Consult', 12],
  ['Mobile', 10],
  ['End', 10],
];

/** Passage d'une scène à l'autre : un court fondu par le noir (opacité seule, rien ne bouge), en courbe douce */
export const LIGHT = {out: 12, in: 18} as const;

/**
 * Ouverture (images de la scène Open) :
 * - la page telle qu'elle s'affiche, le titre déjà là et le nom encore caché : la première image du plan d-open,
 *   tenue `hold` images ;
 * - à `hold` (un temps), l'ouverture du site joue telle quelle : les cinq lettres du nom montent une à une derrière
 *   leur ligne de base, puis la première photo, le terrain nu, entre par le bas (1,65 s en tout) ;
 * - à `aside`, le navigateur se range de côté pour la légende, qui entre à `cap`.
 */
export const OPEN = {hold: 36, aside: 216, cap: 270} as const;

/** La fin (images de la scène) : la fenêtre en arc, le nom qui monte lettre par lettre, la ligne, puis l'adresse du site */
export const END = {mark: 12, name: 36, line: 126, url: 168} as const;

/**
 * Les plans filmés (capture/shots.mjs, 60 i/s) : image du plan → image de la scène.
 * Toujours lus à vitesse 1 (aucune image sautée ni doublée : pas de saccade) ; `delay` images figées sur la première,
 * puis lecture à partir de l'image `from`.
 */
export type ClipTiming = {rate: number; from: number; delay: number};
export const TIMING: Record<string, ClipTiming> = {
  Open: {rate: 1, from: 0, delay: OPEN.hold},
  Name: {rate: 1, from: 0, delay: 0},
  Homes: {rate: 1, from: 0, delay: 0},
  Rooms: {rate: 1, from: 0, delay: 0},
  Story: {rate: 1, from: 0, delay: 0},
  Family: {rate: 1, from: 0, delay: 0},
  Consult: {rate: 1, from: 0, delay: 0},
};

/** Téléphones : l'ouverture attend que son téléphone soit presque monté ; les deux autres démarrent avec la scène */
export const PHONE_TIMING: Record<string, ClipTiming> = {
  mOpen: {rate: 1, from: 0, delay: 30},
  mName: {rate: 1, from: 0, delay: 0},
  mStory: {rate: 1, from: 0, delay: 0},
};

/**
 * Ce qui se passe à l'écran, en temps de musique comptés depuis le début de chaque scène : la musique y pose ses accents.
 * - Story : la maison restaurée passe au séchage sur le temps `second` (défilement régulier : décembre 2023 suit) ;
 * - Rooms : un clic sur la cuisine à l'îlot de pierre ouvre la visionneuse, puis « Next photo », deux fois ;
 * - Consult : « A new home » (les fourchettes de budget apparaissent), « $1 million to $5 million », puis
 *   « Write my email to Skoda ».
 * Les repères exacts (photos qui passent devant le nom, étapes qui se découvrent, ligne de la famille, demande prête)
 * viennent du relevé des plans (public/site/*.json).
 */
export const EVENTS = {
  story: {second: 7},
  rooms: {open: 5, next: 7, next2: 8.5},
  consult: {home: 2, budget: 3.5, go: 8},
} as const;

/** images du plan correspondant à un temps de la scène (plans lus dès l'image 0 de la scène) */
export const beatFrame = (beats: number) => Math.round(beats * BEAT);
