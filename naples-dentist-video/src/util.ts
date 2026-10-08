import {Easing, interpolate, spring} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export {BEAT} from './beats.ts';

/** La charte du nouveau site (index.css) : le turquoise du cabinet, le vert-noir du texte, le gris du logo */
export const C = {
  white: '#FFFFFF',
  ink: '#0B2326',
  inkSoft: '#3A5356',
  teal: '#23ACAC',
  tealInk: '#0D7778',
  tealDeep: '#0F4C50',
  mist: '#EDF3F2',
  wall: '#CCD0D1',
  bone: '#C0C0C0',
  line: '#D3DEDD',
  /** fond neutre du site actuel (scène « Today »), hors de la nouvelle charte */
  today: '#ECEEEE',
  todayLine: '#D5D9D9',
  todaySoft: '#5B6466',
} as const;

export const F = {
  sans: '"Instrument Sans", "Helvetica Neue", Arial, sans-serif',
} as const;

/** Les styles de titre du site (index.css) : Instrument Sans resserrée, interlignage serré */
export const DISPLAY = {fontFamily: F.sans, fontWeight: 560, fontStretch: '84%', letterSpacing: '-0.047em', lineHeight: 0.88} as const;
export const H2 = {fontFamily: F.sans, fontWeight: 560, fontStretch: '86%', letterSpacing: '-0.044em', lineHeight: 0.92} as const;
export const H3 = {fontFamily: F.sans, fontWeight: 560, fontStretch: '90%', letterSpacing: '-0.025em', lineHeight: 1.04} as const;
export const BODY = {fontFamily: F.sans, fontWeight: 420, fontStretch: '100%', letterSpacing: '-0.004em', lineHeight: 1.48} as const;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const E = {
  linear: (t: number) => t,
  sine: Easing.bezier(0.37, 0, 0.63, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** expo.out, la courbe des animations du site */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  soft: Easing.bezier(0.45, 0, 0.25, 1),
  /** l'ouverture de la pastille : départ franc, arrivée très douce */
  pill: Easing.bezier(0.7, 0, 0.12, 1),
};
export const range = (f: number, a: number, b: number, from = 0, to = 1, easing: (t: number) => number = E.linear) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});
export const pop = (f: number, start: number, stiffness = 160, damping = 20) =>
  spring({frame: f - start, fps: FPS, config: {stiffness, damping, mass: 1}});

/** Mélange de deux couleurs #rrggbb */
export const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
