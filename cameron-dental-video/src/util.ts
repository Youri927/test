import {Easing, interpolate, spring} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
/** un temps à 80 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 45;

/** La charte du nouveau site Cameron : blanc, bleu marine, et le bleu de leur logo */
export const C = {
  bg: '#F2F6F9',
  paper: '#FFFFFF',
  panel: '#FFFFFF',
  ink: '#0E2233',
  navy: '#2A73A3',
  blue: '#2A73A3',
  azure: '#458EB7',
  sky: '#E1EEF6',
  light: '#8CC3E6',
  grey: '#556675',
  mist: '#8796A3',
  line: 'rgba(14, 34, 51, 0.12)',
  lineStrong: 'rgba(14, 34, 51, 0.22)',
  star: '#E5A23A',
  rust: '#C2412D',
  // clés reprises par Screen.tsx
  calcaire: '#FFFFFF',
  lagon: '#458EB7',
  tungsten: '#2A73A3',
} as const;

export const F = {
  display: '"Bricolage Grotesque", "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif',
  body: '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif',
} as const;

/** Titres : Bricolage Grotesque légèrement condensée, comme sur le site */
export const DISPLAY = {fontFamily: F.display, fontWeight: 600, fontStretch: '90%', letterSpacing: '-0.025em', lineHeight: 0.95} as const;
/** Petites étiquettes, en casse normale comme sur le site */
export const LABEL = {fontFamily: F.body, fontWeight: 700, letterSpacing: '0.01em'} as const;

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
