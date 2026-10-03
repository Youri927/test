import {Easing, interpolate, spring} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
/** un temps à 90 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 40;

/** La charte du nouveau site Escape TV */
export const C = {
  night: '#0C0B0A',
  stone: '#161412',
  stone2: '#201D1A',
  bone: '#EDE6DA',
  bone2: 'rgba(237, 230, 218, .68)',
  bone3: 'rgba(237, 230, 218, .42)',
  line: 'rgba(237, 230, 218, .14)',
  gold: '#E2B55E',
  rec: '#FF3B30',
  // la partie « avant » : une page de résultats de recherche, claire
  paper: '#E9E6E1',
  ink: '#16151A',
  grey: '#67646D',
  mist: '#9C99A1',
  // clés reprises par Screen.tsx
  calcaire: '#0C0B0A',
  lagon: '#E2B55E',
  tungsten: '#E2B55E',
} as const;

export const F = {
  show: '"Anybody", "Arial Narrow", sans-serif',
  body: '"Instrument Sans", "Helvetica Neue", Arial, sans-serif',
  mono: '"Geist Mono", ui-monospace, monospace',
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
