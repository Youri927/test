import {Easing} from 'remotion';

export const ease = {
  linear: (t: number) => t,
  sine: Easing.bezier(0.37, 0, 0.63, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  whip: Easing.bezier(0.83, 0, 0.17, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  outBack: Easing.bezier(0.34, 1.56, 0.64, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  inQuad: Easing.bezier(0.5, 0, 0.75, 0),
};

export type EaseFn = (t: number) => number;
