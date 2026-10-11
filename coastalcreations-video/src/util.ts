import {Easing, interpolate} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export {BEAT} from './beats.ts';

/** La charte du nouveau site (styles.css) : l'encre, le bleu profond, l'aqua, le sable, le corail */
export const C = {
  white: '#FFFFFF',
  ink: '#052a30',
  deep: '#0a3c44',
  aqua: '#35c4cc',
  sand: '#f4eee4',
  coral: '#ff6a4c',
  muted: '#3f5a5e',
  // noms repris par les cadres (Screen.tsx)
  navy: '#052a30',
  night: '#052a30',
  azure: '#35c4cc',
  inkSoft: '#3f5a5e',
  line: '#d6d0c4',
} as const;

export const F = {
  sans: '"Figtree", "Helvetica Neue", Arial, sans-serif',
  display: '"Unbounded", "Figtree", "Helvetica Neue", Arial, sans-serif',
} as const;

/** Les styles du site : titres en Unbounded, texte en Figtree */
export const DISPLAY = {fontFamily: F.display, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.96} as const;
export const H2 = {fontFamily: F.display, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 0.98} as const;
export const H3 = {fontFamily: F.display, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.04} as const;
export const BODY = {fontFamily: F.sans, fontWeight: 450, letterSpacing: '0', lineHeight: 1.5} as const;

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
