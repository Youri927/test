import {Easing, interpolate} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export {BEAT} from './beats.ts';

/**
 * La charte du nouveau site (styles.css) : le blanc des murs de leurs maisons, le noir de leur logo, la couleur de leur
 * piscine (relevée sur la photo de la maison neuve), seulement pour la saison et les gestes, le marbre blanc de leurs
 * salles de bain, le gris des légendes.
 */
export const C = {
  paper: '#FFFFFF',
  ink: '#000000',
  pool: '#89D0D4',
  poolDeep: '#2E8F96',
  stone: '#EEF0F0',
  vein: '#5C6366',
  line: 'rgba(0, 0, 0, 0.14)',
  /** fond des scènes : le marbre du site, un ton plus soutenu, pour que le navigateur et les légendes s'en détachent */
  stage: '#DFE3E3',
} as const;

/** Les deux familles du site (licence OFL) : Montagu Slab pour ce qui est grand, Reddit Sans pour le reste */
export const F = {
  serif: '"Montagu Slab", Georgia, serif',
  sans: '"Reddit Sans", Arial, sans-serif',
} as const;

/** Les styles du site : les titres en Montagu Slab très fine, serrée en grand ; le texte en Reddit Sans */
export const H2 = {fontFamily: F.serif, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.02, fontOpticalSizing: 'auto'} as const;
export const BODY = {fontFamily: F.sans, fontWeight: 400, letterSpacing: '0', lineHeight: 1.5} as const;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const E = {
  linear: (t: number) => t,
  sine: Easing.bezier(0.37, 0, 0.63, 1),
  /** --ease-io du site : le bandeau de l'accueil qui s'ouvre, le volet des photos */
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** --ease du site (cubic-bezier(.2, .7, .1, 1)) : les lignes qui montent de leur masque, les réponses aux gestes */
  out: Easing.bezier(0.2, 0.7, 0.1, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** courbe douce, pour la caméra : départ et arrivée sans à-coup */
  soft: Easing.bezier(0.45, 0, 0.25, 1),
};
export const range = (f: number, a: number, b: number, from = 0, to = 1, easing: (t: number) => number = E.linear) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});
