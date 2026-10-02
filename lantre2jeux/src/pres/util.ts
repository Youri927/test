import {spring} from 'remotion';

export {E, range, steps, lerp, clamp} from '../ad/util';
export {C, F} from '../ad/theme';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
/** un temps à 100 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 36;

export const pop = (f: number, start: number, stiffness = 200, damping = 18) =>
  spring({frame: f - start, fps: FPS, config: {stiffness, damping, mass: 0.9}});
