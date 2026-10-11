import {Easing, interpolate} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export {BEAT} from './beats.ts';

/** La charte du nouveau site (styles.css) : le bleu roi, l'encre, la nuit, l'eau, la brume */
export const C = {
  white: '#FFFFFF',
  blue: '#0b2fb3',
  ink: '#0a1238',
  night: '#081033',
  water: '#2ad1df',
  mist: '#eef2fb',
  muted: '#4a5578',
  // noms repris par les cadres (Screen.tsx)
  navy: '#0a1238',
  azure: '#2ad1df',
  inkSoft: '#4a5578',
  line: '#d7ddea',
} as const;

export const F = {
  sans: '"Libre Franklin", "Helvetica Neue", Arial, sans-serif',
  display: '"Ultra", Georgia, serif',
} as const;

/** Les styles du site : titres en Ultra (une seule graisse), texte en Libre Franklin */
export const DISPLAY = {fontFamily: F.display, fontWeight: 400, letterSpacing: '-0.012em', lineHeight: 1.02} as const;
export const H2 = {fontFamily: F.display, fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.04} as const;
export const H3 = {fontFamily: F.display, fontWeight: 400, letterSpacing: '-0.005em', lineHeight: 1.1} as const;
export const BODY = {fontFamily: F.sans, fontWeight: 400, letterSpacing: '0', lineHeight: 1.5} as const;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const E = {
  linear: (t: number) => t,
  sine: Easing.bezier(0.37, 0, 0.63, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** power3.out, la courbe des animations du site */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  soft: Easing.bezier(0.45, 0, 0.25, 1),
};
export const range = (f: number, a: number, b: number, from = 0, to = 1, easing: (t: number) => number = E.linear) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});
