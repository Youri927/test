import {Easing, interpolate} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export {BEAT} from './beats.ts';

/**
 * La charte du nouveau site (styles.css) : le blanc des maisons, le bleu du logo, le noir bleuté des menuiseries,
 * le gris du bloc de béton, l'ardoise du texte secondaire.
 */
export const C = {
  white: '#FFFFFF',
  blue: '#0253A0',
  blueDeep: '#013F7A',
  frame: '#17212E',
  block: '#E9EAE6',
  joint: '#C9CBC5',
  slate: '#565D66',
  /** le texte clair sur le bleu du pied de page */
  onBlue: '#C8DBF2',
  /** fond des scènes : un ton plus soutenu que le gris du bloc */
  stage: '#E2E3DE',
} as const;

/** Les polices du site : Besley (Clarendon) pour les titres, Rethink Sans pour le texte */
export const F = {
  serif: '"Besley", Georgia, serif',
  sans: '"Rethink Sans", Arial, sans-serif',
} as const;

/** Les styles du site : titres en Besley 700 serré, texte en Rethink Sans */
export const H2 = {fontFamily: F.serif, fontWeight: 700, letterSpacing: '-0.016em', lineHeight: 1.04} as const;
export const BODY = {fontFamily: F.sans, fontWeight: 400, letterSpacing: '0', lineHeight: 1.5} as const;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const E = {
  linear: (t: number) => t,
  sine: Easing.bezier(0.37, 0, 0.63, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** la courbe des mouvements du site (cubic-bezier(.2, .7, .1, 1)) : entrées et légendes */
  out: Easing.bezier(0.2, 0.7, 0.1, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** courbe douce, pour la caméra : départ et arrivée sans à-coup */
  soft: Easing.bezier(0.45, 0, 0.25, 1),
};
export const range = (f: number, a: number, b: number, from = 0, to = 1, easing: (t: number) => number = E.linear) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});
