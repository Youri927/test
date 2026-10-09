import {Easing, interpolate, spring} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export {BEAT} from './beats.ts';

/** La charte du nouveau site (index.css) : les deux couleurs du logo, le bleu presque noir de la nuit, le gris bleuté des fonds */
export const C = {
  white: '#FFFFFF',
  navy: '#0C2448',
  night: '#071833',
  azure: '#009CCC',
  azureInk: '#00739A',
  salt: '#F2F5F8',
  inkSoft: '#3D5170',
  line: '#D6DEE7',
  /** fond neutre du site actuel (scène « Today »), hors de la nouvelle charte */
  today: '#ECEEF1',
} as const;

export const F = {
  sans: '"Sofia Sans", "Helvetica Neue", Arial, sans-serif',
  display: '"Sofia Sans Extra Condensed", "Sofia Sans", "Helvetica Neue", Arial, sans-serif',
} as const;

/** Les styles du site (index.css) : grands titres en Sofia Sans Extra Condensed, texte en Sofia Sans */
export const DISPLAY = {fontFamily: F.display, fontWeight: 780, letterSpacing: '-0.012em', lineHeight: 0.86} as const;
export const H2 = {fontFamily: F.display, fontWeight: 750, letterSpacing: '-0.01em', lineHeight: 0.9} as const;
export const H3 = {fontFamily: F.display, fontWeight: 720, letterSpacing: '-0.004em', lineHeight: 0.98} as const;
export const BODY = {fontFamily: F.sans, fontWeight: 430, letterSpacing: '0', lineHeight: 1.5} as const;
export const TNUM = {fontVariantNumeric: 'tabular-nums'} as const;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const E = {
  linear: (t: number) => t,
  sine: Easing.bezier(0.37, 0, 0.63, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** expo.out, la courbe des animations du site */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  soft: Easing.bezier(0.45, 0, 0.25, 1),
};
export const range = (f: number, a: number, b: number, from = 0, to = 1, easing: (t: number) => number = E.linear) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});
export const pop = (f: number, start: number, stiffness = 160, damping = 20) =>
  spring({frame: f - start, fps: FPS, config: {stiffness, damping, mass: 1}});
