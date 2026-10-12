import {Easing, interpolate} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export {BEAT} from './beats.ts';

/** La charte du nouveau site (styles.css) : le blanc du bardage, le bleu des lettres de la façade, la haie de l'équipe */
export const C = {
  white: '#FFFFFF',
  mist: '#EEF2F6',
  /** fond des scènes claires : un ton plus soutenu que le brouillard du site */
  stage: '#DCE3EB',
  /** fond de la scène de l'équipe : un ton plus sombre que la haie du site */
  stageHedge: '#26301C',
  ink: '#0E1A37',
  ink2: '#3A4660',
  blue: '#22348C',
  blueDeep: '#17246A',
  path: '#6687B9',
  hedge: '#2F3B22',
  leaf: '#B5C77A',
  line: '#D6DDE7',
} as const;

/** La police du site pour tout le texte : Commissioner (l'axe FLAR donne l'évasement des lettres de l'enseigne) */
export const F = {
  sans: '"Commissioner", "Helvetica Neue", Arial, sans-serif',
} as const;

/** Les styles du site : titres en Commissioner 500 serrée, un peu évasée (FLAR 60), en bleu ; texte en Commissioner */
export const H2 = {fontFamily: F.sans, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.02, fontVariationSettings: '"FLAR" 60, "VOLM" 0'} as const;
export const BODY = {fontFamily: F.sans, fontWeight: 400, letterSpacing: '0', lineHeight: 1.5, fontVariationSettings: '"FLAR" 0, "VOLM" 0'} as const;
/** Le logotype et l'enseigne : Commissioner 700 en petites capitales, évasée au maximum (FLAR 100) */
export const MARK = {fontFamily: F.sans, fontWeight: 700, fontVariantCaps: 'small-caps', letterSpacing: '0.02em', lineHeight: 1, whiteSpace: 'nowrap', fontVariationSettings: '"FLAR" 100, "VOLM" 0'} as const;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const E = {
  linear: (t: number) => t,
  sine: Easing.bezier(0.37, 0, 0.63, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** la courbe des mouvements du site (cubic-bezier(.2, .7, .2, 1)) : entrées et légendes */
  out: Easing.bezier(0.2, 0.7, 0.2, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** courbe douce, pour la caméra : départ et arrivée sans à-coup */
  soft: Easing.bezier(0.45, 0, 0.25, 1),
};
export const range = (f: number, a: number, b: number, from = 0, to = 1, easing: (t: number) => number = E.linear) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});
