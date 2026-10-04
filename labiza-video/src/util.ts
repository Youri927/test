import {Easing, interpolate} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export const sec = (s: number) => Math.round(s * FPS);

export const F = {
  display: '"Bodoni Moda", Didot, "Times New Roman", serif',
  body: '"Schibsted Grotesk", "Helvetica Neue", Arial, sans-serif',
} as const;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const E = {
  linear: (t: number) => t,
  sine: Easing.bezier(0.37, 0, 0.63, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  soft: Easing.bezier(0.45, 0, 0.25, 1),
};
export const range = (f: number, a: number, b: number, from = 0, to = 1, easing: (t: number) => number = E.linear) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});
