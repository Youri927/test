// Points de synchronisation partagés par les captures (capture/shots.mjs), l'image (Remotion) et le son (sound/*.mjs).
// Ce fichier n'importe rien : Node le lit directement.

/**
 * Un temps à 112,5 BPM, à 60 images/s : 32 images. Sur le site, les lignes de la liste de l'accueil se barrent toutes
 * les 270 ms ; calées sur les images, elles tombent toutes les 16 images : une croche de la musique.
 */
export const BEAT = 32;

/**
 * Les scènes du montage et leur durée, en temps de musique. La musique commence par une levée de deux temps (`PICKUP`) :
 * sa première mesure commence au temps 2 de l'ouverture, et chaque coupe suivante tombe sur un premier temps.
 */
export const SCENE_BEATS: [string, number][] = [
  ['Open', 18],
  ['Work', 16],
  ['Houses', 16],
  ['Judson', 16],
  ['Reviews', 12],
  ['Estimate', 20],
  ['Mobile', 16],
  ['End', 12],
];
export const PICKUP = 2;

/** Passage d'une scène à l'autre : un court fondu par le noir (opacité seule, rien ne bouge), en courbe douce */
export const LIGHT = {out: 12, in: 18} as const;

/**
 * Ouverture (images de la scène Open) :
 * - le plan d-open est lu à partir de son image `from` : la page telle qu'elle s'affiche, la liste entière, pas encore
 *   barrée ; cette image est tenue `delay` images ;
 * - puis l'ouverture du site joue telle quelle : les cinq lignes se barrent l'une après l'autre (images 96 à 160 de la
 *   scène, une croche d'écart : les temps 3 à 5), et « Consider it done. » s'écrit ; son premier trait paraît sur le
 *   premier temps de la deuxième mesure (temps 6, image 192) ;
 * - à `aside`, le navigateur se range de côté pour la légende, qui entre à `cap` (le premier temps de la troisième mesure).
 */
export const OPEN = {from: 6, delay: 64, aside: 272, cap: 320} as const;

/**
 * La fin, sur le ciel du site (images de la scène) : l'emblème paraît à `mark` ; « Consider it done. » s'écrit à `done`,
 * comme à l'accueil du site (0,85 s) ; puis l'adresse du site, à `url`.
 */
export const END = {mark: 10, done: 40, url: 128} as const;

/**
 * Les plans filmés (capture/shots.mjs, 60 i/s) : image du plan → image de la scène.
 * Toujours lus à vitesse 1 (aucune image sautée ni doublée : pas de saccade) ; `delay` images figées sur l'image `from`,
 * puis lecture à partir de celle-ci.
 */
export type ClipTiming = {rate: number; from: number; delay: number};
export const TIMING: Record<string, ClipTiming> = {
  Open: {rate: 1, from: OPEN.from, delay: OPEN.delay},
  Work: {rate: 1, from: 0, delay: 0},
  Houses: {rate: 1, from: 0, delay: 0},
  Judson: {rate: 1, from: 0, delay: 0},
  Reviews: {rate: 1, from: 0, delay: 0},
  Estimate: {rate: 1, from: 0, delay: 0},
};

/**
 * Téléphones : l'ouverture attend que son téléphone soit monté (ses lignes se barrent sur les temps 2 à 4 de la scène,
 * « Consider it done. » s'écrit sur le temps 5) ; les deux autres démarrent avec la scène
 */
export const PHONE_TIMING: Record<string, ClipTiming> = {
  mOpen: {rate: 1, from: 0, delay: 26},
  mMenu: {rate: 1, from: 0, delay: 0},
  mViewer: {rate: 1, from: 0, delay: 0},
};

/**
 * Ce qui se passe à l'écran, en temps de musique comptés depuis le début de chaque scène : la musique y pose ses accents.
 * - Houses : un clic sur la photo des débords blancs (la visionneuse s'ouvre depuis la vignette), « Next photo » (le
 *   panneau du chantier), puis « Close » (la photo retourne à sa place) ;
 * - Estimate : un clic dans « Your list » ; les trois lignes de la liste s'écrivent à partir de `lines` (une ligne tous
 *   les `every` temps) ; « Email my list » à `send` ;
 * - Mobile : les gestes se suivent d'un téléphone à l'autre. Au premier, la liste se barre (temps 2 à 4) et la phrase
 *   s'écrit (temps 5) ; au deuxième, le pouce ouvre le menu (`menu`) et choisit « What we do » (`link`) ; au troisième,
 *   il touche une photo (`photo`) et la fait glisser vers la suivante (`swipe`).
 * Les repères exacts (les traits de la liste, la phrase, la visionneuse qui s'ouvre et se referme, la demande prête)
 * viennent du relevé des plans (public/site/*.json).
 */
export const EVENTS = {
  houses: {open: 6, next: 9.5, close: 13},
  estimate: {list: 2, lines: 2.5, every: 3, send: 12},
  mobile: {menu: 6, link: 8, photo: 10, swipe: 13},
} as const;

/** images du plan correspondant à un temps de la scène (plans lus dès l'image 0 de la scène) */
export const beatFrame = (beats: number) => Math.round(beats * BEAT);
