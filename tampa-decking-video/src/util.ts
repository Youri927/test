import {Easing, interpolate, spring} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export {BEAT} from './beats.ts';

/** La charte du nouveau site : les deux couleurs du logo, puis les bleus de plus en plus profonds */
export const C = {
  white: '#FFFFFF',
  ink: '#04426F',
  inkSoft: '#3D5C74',
  sun: '#F2D64B',
  water: '#EEF5F7',
  water2: '#DCEBF0',
  deep: '#062C48',
  abyss: '#031D31',
  line: '#D6E2E8',
  /** fond neutre du site actuel (scène « Today »), hors de la nouvelle charte */
  today: '#F1F3F4',
} as const;

export const F = {
  sans: '"Mona Sans", "Helvetica Neue", Arial, sans-serif',
} as const;

/** Les styles de titre du site (index.css) : Mona Sans élargie, interlignage serré */
export const DISPLAY = {fontFamily: F.sans, fontWeight: 650, fontStretch: '112%', letterSpacing: '-0.045em', lineHeight: 0.9} as const;
export const H2 = {fontFamily: F.sans, fontWeight: 640, fontStretch: '110%', letterSpacing: '-0.04em', lineHeight: 0.96} as const;
export const H3 = {fontFamily: F.sans, fontWeight: 620, fontStretch: '106%', letterSpacing: '-0.025em', lineHeight: 1.06} as const;
export const BODY = {fontFamily: F.sans, fontWeight: 420, fontStretch: '100%', letterSpacing: '-0.005em', lineHeight: 1.5} as const;

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

/** Mélange de deux couleurs #rrggbb */
export const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
