import {Easing, interpolate, spring} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
/** un temps à 80 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 45;

/** La charte du nouveau site */
export const C = {
  bg: '#ECE5D8',
  paper: '#F5F1E9',
  panel: '#FBF8F2',
  ink: '#1B1915',
  grey: '#48433B',
  mist: '#7B7366',
  line: 'rgba(27, 25, 21, 0.14)',
  lineStrong: 'rgba(27, 25, 21, 0.26)',
  accent: '#9F4C2B',
  accentHi: '#E0A27F',
  dark: '#101316',
  cream: '#F1EADF',
  // clés reprises par Screen.tsx
  calcaire: '#ECE5D8',
  lagon: '#C9A27A',
  tungsten: '#9F4C2B',
} as const;

export const F = {
  display: '"Instrument Serif", "Iowan Old Style", Georgia, serif',
  body: '"Mona Sans", "Helvetica Neue", Arial, sans-serif',
} as const;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const E = {
  linear: (t: number) => t,
  sine: Easing.bezier(0.37, 0, 0.63, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  soft: Easing.bezier(0.45, 0, 0.25, 1),
};
export const range = (f: number, a: number, b: number, from = 0, to = 1, easing: (t: number) => number = E.linear) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});
export const pop = (f: number, start: number, stiffness = 160, damping = 20) =>
  spring({frame: f - start, fps: FPS, config: {stiffness, damping, mass: 1}});
