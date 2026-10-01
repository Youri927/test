import {Easing, interpolate, spring} from 'remotion';

export const FPS = 30;
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const E = {
  linear: (t: number) => t,
  sine: Easing.bezier(0.37, 0, 0.63, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  door: Easing.bezier(0.7, 0, 0.2, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  whip: Easing.bezier(0.83, 0, 0.17, 1),
};
/** valeur interpolée entre deux frames, bornée */
export const range = (f: number, a: number, b: number, from = 0, to = 1, easing: (t: number) => number = E.linear) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});
/** valeur en escalier : [[frame, valeur], …] */
export const steps = (f: number, keys: [number, number][]) => {
  let v = keys[0][1];
  for (const [k, val] of keys) if (f >= k) v = val;
  return v;
};
export const pop = (f: number, start: number, stiffness = 220, damping = 16) =>
  spring({frame: f - start, fps: FPS, config: {stiffness, damping, mass: 0.9}});
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
