import {Easing, interpolate, spring} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
/** un temps à 80 BPM, à 60 images/s : les coupes tombent sur la musique */
export const BEAT = 45;

/** La charte du nouveau site WAVE : sable du midi, marine de la marque, vert citron en accent */
export const C = {
  bg: '#F4EFE6',
  paper: '#FBF8F2',
  panel: '#FBF8F2',
  ink: '#0F1D3A',
  navy: '#1F396D',
  grey: '#4A5470',
  mist: '#7A8195',
  line: 'rgba(15, 29, 58, 0.13)',
  lineStrong: 'rgba(15, 29, 58, 0.24)',
  lime: '#90EE01',
  golden: '#ECD8BA',
  sunset: '#E8C8AD',
  dusk: '#262B52',
  night: '#0E1834',
  rust: '#B85632',
  sand: '#F4EFE6',
  // clés reprises par Screen.tsx
  calcaire: '#F4EFE6',
  lagon: '#9FB7FF',
  tungsten: '#90EE01',
} as const;

export const F = {
  display: '"Funnel Display", "Funnel Sans", "Helvetica Neue", Arial, sans-serif',
  body: '"Funnel Sans", "Helvetica Neue", Arial, sans-serif',
} as const;

/** Titres : Funnel Display serrée, comme sur le site */
export const DISPLAY = {fontFamily: F.display, fontWeight: 580, letterSpacing: '-0.045em', lineHeight: 0.9} as const;
/** Étiquettes : capitales espacées */
export const LABEL = {fontFamily: F.body, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase'} as const;

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
