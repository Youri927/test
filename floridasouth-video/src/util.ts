import {Easing, interpolate} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export {BEAT} from './beats.ts';

/**
 * La charte du nouveau site (styles.css) : le ciel de leurs photos (relevé sur la première rangée de pixels de la photo de
 * l'accueil), le blanc des débords, le stuc vert d'eau des colonnes, l'encre du texte, l'ardoise du texte secondaire.
 */
export const C = {
  white: '#FFFFFF',
  sky: '#2E5AB2',
  skyDeep: '#254EA8',
  stucco: '#DDE4E2',
  ink: '#18213A',
  slate: '#4E5A6C',
  line: 'rgba(24, 33, 58, 0.16)',
  /** le texte clair sur le ciel */
  onSky: 'rgba(255, 255, 255, 0.86)',
  /** fond des scènes : le stuc du site, un ton plus soutenu */
  stage: '#D3DCDA',
} as const;

/** Le ciel du site : son dégradé de gauche à droite, onze relevés */
export const SKY_GRAD =
  'linear-gradient(90deg, #254ea8 0%, #2550aa 10%, #2652ac 20%, #2853ad 30%, #2b56af 40%, #2d5ab0 50%, #305cb2 60%, #345fb3 70%, #3962b5 80%, #3e65b6 90%, #4268b7 100%)';

/** Les deux familles du site (licence OFL) : Gloock pour la liste, les titres et les citations, Albert Sans pour le reste */
export const F = {
  serif: '"Gloock", "Times New Roman", serif',
  sans: '"Albert Sans", Arial, sans-serif',
} as const;

/** Les styles du site : titres en Gloock 400, texte en Albert Sans */
export const H2 = {fontFamily: F.serif, fontWeight: 400, letterSpacing: '-0.012em', lineHeight: 1.04} as const;
export const BODY = {fontFamily: F.sans, fontWeight: 400, letterSpacing: '0', lineHeight: 1.5} as const;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const E = {
  linear: (t: number) => t,
  sine: Easing.bezier(0.37, 0, 0.63, 1),
  /** --ease-io du site : les traits de la liste, « Consider it done. » */
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** --ease du site (cubic-bezier(.2, .7, .1, 1)) : les réponses aux gestes, les légendes */
  out: Easing.bezier(0.2, 0.7, 0.1, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** courbe douce, pour la caméra : départ et arrivée sans à-coup */
  soft: Easing.bezier(0.45, 0, 0.25, 1),
};
export const range = (f: number, a: number, b: number, from = 0, to = 1, easing: (t: number) => number = E.linear) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});
