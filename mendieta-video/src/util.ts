import {Easing, interpolate} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export {BEAT} from './beats.ts';

/** La charte du nouveau site (styles.css) : l'encre du blason, son texte secondaire, le ciel, le soleil */
export const C = {
  white: '#FFFFFF',
  ink: '#0B1B4D',
  ink2: '#3D4B6E',
  inkSoft: '#C9D5EE',
  sky: '#EAF1FA',
  sky2: '#D6E4F5',
  sun: '#FFC93C',
  line: '#D3DCEA',
  /** fond des scènes : un ton plus soutenu que le ciel du site */
  stage: '#DCE7F5',
} as const;

/** La police du site pour tout le texte : Encode Sans, variable en chasse (75 à 125 %) et en graisse */
export const F = {
  sans: '"Encode Sans", "Helvetica Neue", Arial, sans-serif',
} as const;

/** Les styles du site : titres en chasse large (125 %) et graisse 790, texte en chasse normale */
export const H2 = {fontFamily: F.sans, fontWeight: 790, fontStretch: '125%', letterSpacing: '-0.02em', lineHeight: 1.02} as const;
export const BODY = {fontFamily: F.sans, fontWeight: 400, fontStretch: '100%', letterSpacing: '0', lineHeight: 1.5} as const;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const E = {
  linear: (t: number) => t,
  sine: Easing.bezier(0.37, 0, 0.63, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** la courbe des mouvements du site (cubic-bezier(.2, .7, .1, 1)) : entrées et légendes */
  out: Easing.bezier(0.2, 0.7, 0.1, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** courbe douce, pour la caméra : départ et arrivée sans à-coup */
  soft: Easing.bezier(0.45, 0, 0.25, 1),
};
export const range = (f: number, a: number, b: number, from = 0, to = 1, easing: (t: number) => number = E.linear) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});
