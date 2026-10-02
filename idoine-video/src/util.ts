import {Easing, interpolate, spring} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
/** un temps à 80 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 45;

export const C = {
  calcaire: '#E7EBE8',
  ecume: '#F6F8F7',
  encre: '#0F2229',
  gris: '#4E6168',
  brume: '#C3CFCD',
  bassin: '#0B6B74',
  lagon: '#36CFC9',
  nuit: '#08171C',
  // repris pour le composant Screen (curseur)
  tungsten: '#36CFC9',
  ink: '#08171C',
  mist: '#4E6168',
} as const;

export const F = {
  display: '"Archivo", "Helvetica Neue", Arial, sans-serif',
  body: '"Archivo", "Helvetica Neue", Arial, sans-serif',
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
