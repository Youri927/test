import {Easing, interpolate} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export {BEAT} from './beats.ts';

/** La charte du nouveau site (styles.css) : Kool Deck, Cage, Travertine, Shallow, Pool, Orange County, Night */
export const C = {
  white: '#FFFFFF',
  deck: '#F4F5F1',
  stage: '#E7E8E2',
  trav: '#E8E0D2',
  ink: '#17232B',
  ink2: '#4A5861',
  shallow: '#C9ECEF',
  pool: '#0A8EA3',
  poolInk: '#076A7B',
  orange: '#F57A1F',
  night: '#0A1A23',
  glow: '#3FD0E8',
  line: 'rgba(23, 35, 43, .16)',
  // noms repris par les cadres (Screen.tsx)
  deep: '#0A1A23',
  navy: '#17232B',
  azure: '#0A8EA3',
  inkSoft: '#4A5861',
} as const;

/** Mona Sans, la police du site : variable en graisse (200 à 900) et en largeur (75 à 125 %) */
export const F = {
  sans: '"Mona Sans", "Helvetica Neue", Arial, sans-serif',
} as const;

/** Les styles du site : titres larges et gras, texte en largeur normale */
export const H2 = {fontFamily: F.sans, fontWeight: 820, fontStretch: '125%', letterSpacing: '-0.035em', lineHeight: 0.98} as const;
export const BODY = {fontFamily: F.sans, fontWeight: 430, letterSpacing: '0', lineHeight: 1.5} as const;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const E = {
  linear: (t: number) => t,
  sine: Easing.bezier(0.37, 0, 0.63, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** la courbe des entrées du site (cubic-bezier(.22, 1, .36, 1)) */
  out: Easing.bezier(0.22, 1, 0.36, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** les déplacements de caméra : départ et arrivée en douceur, sans palier au milieu */
  soft: Easing.bezier(0.45, 0, 0.25, 1),
};
export const range = (f: number, a: number, b: number, from = 0, to = 1, easing: (t: number) => number = E.linear) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});
