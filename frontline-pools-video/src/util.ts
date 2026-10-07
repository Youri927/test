import {Easing, interpolate, spring} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
/** un temps à 90 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 40;

/** La charte du nouveau site Frontline Pools : le bleu marine et le jaune de leur logo, du blanc, un gris bleuté */
export const C = {
  bg: '#EEF2F7',
  paper: '#FFFFFF',
  ink: '#1D305D',
  navy: '#1D305D',
  deep: '#142449',
  yellow: '#FEBC11',
  grey: '#5A6886',
  mist: '#8A97B0',
  line: 'rgba(29, 48, 93, 0.12)',
  lineStrong: 'rgba(29, 48, 93, 0.22)',
  rust: '#C2410C',
  // clés reprises par Screen.tsx
  calcaire: '#FFFFFF',
  lagon: '#3C6FB4',
  tungsten: '#1D305D',
} as const;

export const F = {
  display: 'Archivo, "Helvetica Neue", Arial, sans-serif',
  body: 'Archivo, "Helvetica Neue", Arial, sans-serif',
} as const;

/** Titres : Archivo extra-large et extra-grasse, en capitales, comme sur le site */
export const DISPLAY = {fontFamily: F.display, fontWeight: 850, fontStretch: '125%', letterSpacing: '-0.02em', lineHeight: 0.9, textTransform: 'uppercase'} as const;
/** Étiquettes */
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
