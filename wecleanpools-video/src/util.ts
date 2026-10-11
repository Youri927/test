import {Easing, interpolate} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export {BEAT} from './beats.ts';

/** La charte du nouveau site (styles.css) : l'enduit, l'encre, l'eau, le grand bain, le rouge du « D's » */
export const C = {
  white: '#FFFFFF',
  plaster: '#F1F5F4',
  frame: '#E4EBEA',
  ink: '#0D2235',
  ink2: '#3D5163',
  water: '#1190BC',
  waterInk: '#0B6E93',
  deep: '#08324A',
  deeper: '#06263A',
  pale: '#DCEFEE',
  aqua: '#7FD6E4',
  red: '#D2282D',
  murk: '#425A22',
  line: 'rgba(13, 34, 53, .14)',
  // noms repris par les cadres (Screen.tsx)
  navy: '#0D2235',
  azure: '#1190BC',
  inkSoft: '#3D5163',
} as const;

/** Overpass, la police du site (héritière libre de Highway Gothic), variable en graisse (100 à 900) */
export const F = {
  sans: '"Overpass", "Helvetica Neue", Arial, sans-serif',
} as const;

/** Les styles du site : titres en ExtraBold, texte en Regular, citations et question en Light */
export const H2 = {fontFamily: F.sans, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.02} as const;
export const BODY = {fontFamily: F.sans, fontWeight: 400, letterSpacing: '0', lineHeight: 1.5} as const;
export const LIGHTW = {fontFamily: F.sans, fontWeight: 300, letterSpacing: '-0.025em', lineHeight: 1.1} as const;

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
