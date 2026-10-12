import {Easing, interpolate, interpolateColors} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export {BEAT} from './beats.ts';

/** La charte du nouveau site (styles.css) : Haze, Night Sky, Pool Light, Moon, Lantern, Dusk */
export const C = {
  white: '#FFFFFF',
  haze: '#E4EBEF',
  /** fond des scènes de jour : un ton plus soutenu que le site */
  stage: '#D3DDE3',
  /** fond des scènes de nuit : un ton plus sombre que le site */
  stageNight: '#060D22',
  stageDusk: '#B7A6B4',
  ink: '#0C1838',
  ink2: '#46546B',
  light: '#2B47F5',
  lightNight: '#3550FF',
  link: '#A9B9FF',
  moon: '#EAF0F7',
  moon2: '#A8B6CC',
  night: '#0A1430',
  surfaceNight: '#101B3C',
  dusk: '#C9B6C4',
  lantern: '#FFC46B',
  line: 'rgba(12, 24, 56, .14)',
  // noms repris par les cadres (Screen.tsx)
  deep: '#0A1430',
  navy: '#0C1838',
  azure: '#3550FF',
  inkSoft: '#46546B',
} as const;

/** Les polices du site : Syne pour les titres, Onest pour le texte (licences OFL) */
export const F = {
  display: '"Syne", "Arial Black", sans-serif',
  sans: '"Onest", "Helvetica Neue", Arial, sans-serif',
} as const;

/** Les styles du site : titres en Syne 700 serrée, texte en Onest */
export const H2 = {fontFamily: F.display, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 0.98} as const;
export const BODY = {fontFamily: F.sans, fontWeight: 400, letterSpacing: '0', lineHeight: 1.5} as const;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const E = {
  linear: (t: number) => t,
  sine: Easing.bezier(0.37, 0, 0.63, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** la courbe des entrées du site (cubic-bezier(.22, 1, .36, 1)) */
  out: Easing.bezier(0.22, 1, 0.36, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** la courbe douce du site (cubic-bezier(.45, 0, .25, 1)) : l'allumage, et les déplacements de caméra */
  soft: Easing.bezier(0.45, 0, 0.25, 1),
};
export const range = (f: number, a: number, b: number, from = 0, to = 1, easing: (t: number) => number = E.linear) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});

/**
 * La couleur du ciel pendant l'allumage, à la progression p (0 à 1) : la même courbe que le site
 * (@keyframes sky-night : jour, crépuscule à 46 %, nuit, avec la courbe douce sur chaque segment).
 */
export const sky = (p: number, day: string, dusk: string, night: string) => {
  const t = Math.max(0, Math.min(1, p));
  if (t <= 0.46) return interpolateColors(E.soft(t / 0.46), [0, 1], [day, dusk]);
  return interpolateColors(E.soft((t - 0.46) / 0.54), [0, 1], [dusk, night]);
};
