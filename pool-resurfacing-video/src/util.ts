import {Easing, interpolate, spring} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
/** un temps à 80 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 45;

/** La charte du nouveau site */
export const C = {
  bg: '#ECEEEA',
  paper: '#F2F3EF',
  panel: '#FBFBF9',
  ink: '#0C2530',
  grey: '#3D5560',
  mist: '#6E828A',
  line: 'rgba(12, 37, 48, 0.13)',
  lineStrong: 'rgba(12, 37, 48, 0.24)',
  accent: '#F0642D',
  aqua: '#86D3D6',
  aquaSoft: '#CDEDEC',
  deep: '#0A2A35',
  cream: '#F2F3EF',
  // clés reprises par Screen.tsx
  calcaire: '#F2F3EF',
  lagon: '#86D3D6',
  tungsten: '#F0642D',
} as const;

export const F = {
  display: '"Bricolage Grotesque", "Helvetica Neue", Arial, sans-serif',
  body: '"Bricolage Grotesque", "Helvetica Neue", Arial, sans-serif',
  mono: '"DM Mono", ui-monospace, monospace',
} as const;

/** Titres : Bricolage étroite, comme sur le site */
export const DISPLAY = {fontFamily: F.display, fontWeight: 640, fontStretch: '79%', letterSpacing: '-0.032em', lineHeight: 0.88} as const;
export const MONO = {fontFamily: F.mono, fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase'} as const;

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
