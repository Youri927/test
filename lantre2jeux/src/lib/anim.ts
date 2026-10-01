import {interpolate, spring} from 'remotion';
import {ease, EaseFn} from './ease';

export const FPS = 30;

/** 0 → 1 entre `start` et `start + dur`, avec easing. */
export const prog = (frame: number, start: number, dur: number, fn: EaseFn = ease.out) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: fn,
  });

/** Ressort "pop" (léger dépassement). */
export const pop = (frame: number, start: number, stiffness = 210, damping = 15) =>
  spring({frame: frame - start, fps: FPS, config: {stiffness, damping, mass: 0.9}});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
