import {Easing, interpolate} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export {BEAT} from './beats.ts';

/** La charte du nouveau site (styles.css) : l'enduit, l'encre, le grand bain, le fond du bassin, l'eau, le soleil */
export const C = {
  white: '#FFFFFF',
  plaster: '#f4f5f3',
  ink: '#11232d',
  deep: '#0f3446',
  floor: '#0a2530',
  shallow: '#5cc0e3',
  wet: '#9fdcef',
  sun: '#ffc431',
  muted: '#4c5d66',
  // la céramique beige de l'ancienne frise (main.js du site)
  ceramic: '#d8cab1',
  grout: '#bcae96',
  // noms repris par les cadres (Screen.tsx)
  navy: '#11232d',
  azure: '#5cc0e3',
  inkSoft: '#4c5d66',
  line: '#d9dfe1',
} as const;

/** Archivo, la police du site : variable en largeur (62 à 125 %) et en graisse (100 à 900) */
export const F = {
  sans: '"Archivo", "Helvetica Neue", Arial, sans-serif',
} as const;

/** Les styles du site : titres en Archivo étendue et grasse, texte en Archivo normale */
export const DISPLAY = {fontFamily: F.sans, fontStretch: '125%', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 0.94} as const;
export const H2 = {fontFamily: F.sans, fontStretch: '125%', fontWeight: 800, letterSpacing: '-0.032em', lineHeight: 0.98} as const;
export const H3 = {fontFamily: F.sans, fontStretch: '120%', fontWeight: 750, letterSpacing: '-0.022em', lineHeight: 1.04} as const;
export const BODY = {fontFamily: F.sans, fontStretch: '100%', fontWeight: 400, letterSpacing: '0', lineHeight: 1.5} as const;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const E = {
  linear: (t: number) => t,
  sine: Easing.bezier(0.37, 0, 0.63, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** la courbe des entrées du site (cubic-bezier(.16, 1, .3, 1)) */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  soft: Easing.bezier(0.45, 0, 0.25, 1),
};
export const range = (f: number, a: number, b: number, from = 0, to = 1, easing: (t: number) => number = E.linear) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});
