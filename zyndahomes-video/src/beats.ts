// Points de synchronisation partagés par les captures (capture/shots.mjs), l'image (Remotion) et le son (sound/*.mjs).
// Ce fichier n'importe rien : Node le lit directement.

/** Un temps à 100 BPM, à 60 images/s : 36 images. */
export const BEAT = 36;

/**
 * Les scènes du montage et leur durée, en temps de musique. La musique commence par une levée de deux temps (`PICKUP`) :
 * sa première mesure commence au temps 2 de l'ouverture, et chaque coupe suivante tombe sur un premier temps.
 */
export const SCENE_BEATS: [string, number][] = [
  ['Open', 18],
  ['Year', 20],
  ['Work', 12],
  ['Details', 12],
  ['Services', 12],
  ['Contact', 16],
  ['Mobile', 16],
  ['End', 12],
];
export const PICKUP = 2;

/** Passage d'une scène à l'autre : un court fondu par le noir (opacité seule, rien ne bouge), en courbe douce */
export const LIGHT = {out: 12, in: 18} as const;

/**
 * Ouverture (images de la scène Open) :
 * - le plan d-open est lu à partir de son image `from`, celle où l'ouverture du site part (la page blanche, l'en-tête
 *   seul) ; cette image est tenue `delay` images, pendant la sortie du noir ;
 * - puis l'ouverture du site joue telle quelle : la première ligne monte (0,05 s), le bandeau s'ouvre depuis sa ligne
 *   d'horizon (0,25 s), « Every single day. » monte (0,85 s), le texte et le bouton paraissent (1,25 s). « Every single
 *   day. » monte sur le premier temps de la première mesure (temps 2, image 72) ;
 * - à `aside`, le navigateur se range de côté pour la légende, qui entre à `cap` (le premier temps de la deuxième mesure).
 */
export const OPEN = {from: 1, delay: 21, aside: 168, cap: 216} as const;

/**
 * La fin, sur le blanc du site : le Z de l'accueil, rejoué en grand. La première ligne monte à `l1`, le bandeau s'ouvre
 * 15 images après, « Every single day. » monte 51 images après (sur le premier temps de la mesure, image 72), puis le
 * logo et l'adresse du site paraissent (75 images après `l1`), comme le texte et le bouton de l'accueil.
 */
export const END = {l1: 21} as const;

/**
 * Les plans filmés (capture/shots.mjs, 60 i/s) : image du plan → image de la scène.
 * Toujours lus à vitesse 1 (aucune image sautée ni doublée : pas de saccade) ; `delay` images figées sur l'image `from`,
 * puis lecture à partir de celle-ci.
 */
export type ClipTiming = {rate: number; from: number; delay: number};
export const TIMING: Record<string, ClipTiming> = {
  Open: {rate: 1, from: OPEN.from, delay: OPEN.delay},
  Year: {rate: 1, from: 0, delay: 0},
  Work: {rate: 1, from: 0, delay: 0},
  Details: {rate: 1, from: 0, delay: 0},
  Services: {rate: 1, from: 0, delay: 0},
  Contact: {rate: 1, from: 0, delay: 0},
};

/**
 * Téléphones : l'ouverture attend que son téléphone soit monté (« Every single day. » monte sur le temps 3 de la scène) ;
 * les deux autres démarrent avec la scène
 */
export const PHONE_TIMING: Record<string, ClipTiming> = {
  mOpen: {rate: 1, from: 1, delay: 57},
  mMenu: {rate: 1, from: 0, delay: 0},
  mSwatch: {rate: 1, from: 0, delay: 0},
};

/**
 * Ce qui se passe à l'écran, en temps de musique comptés depuis le début de chaque scène : la musique y pose ses accents.
 * - Details : un clic sur le gros plan de la pierre bleue (la pièce entière s'ouvre dans la visionneuse), puis « Close » ;
 * - Services : la souris passe sur quatre lignes, l'une après l'autre ; chacune découvre sa photo ;
 * - Contact : « I leave in » (mai), « I'm back in » (octobre) : la fenêtre se dessine sur la saison ; un clic dans « About
 *   the project », la phrase s'écrit à partir de `type` ; « Email my request » à `send` ;
 * - Mobile : les gestes se suivent d'un téléphone à l'autre. Au premier, l'ouverture ; au deuxième, le pouce ouvre le menu
 *   (`menu`) et choisit « Your year » (`link`) ; au troisième, il fait glisser les gros plans deux fois (`swipe`) et en
 *   touche un (`tap`).
 * Les repères exacts (les photos qui s'ouvrent, le cadran, la visionneuse, la demande prête) viennent du relevé des plans
 * (public/site/*.json).
 */
export const EVENTS = {
  details: {click: 7.5, close: 10.5},
  services: {hover: [1.5, 4, 6.5, 9]},
  contact: {leave: 3, back: 5, msg: 7, type: 7.5, send: 12.5},
  mobile: {menu: 5, link: 7, swipe: [9, 11], tap: 13},
} as const;

/** images du plan correspondant à un temps de la scène (plans lus dès l'image 0 de la scène) */
export const beatFrame = (beats: number) => Math.round(beats * BEAT);
