import {Easing, interpolate} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export {BEAT} from './beats.ts';

/**
 * La charte du nouveau site (styles.css) : le gris froid d'une membrane de toit, l'asphalte des bardeaux, l'or du logo,
 * l'ardoise du texte secondaire, le gris des solins.
 */
export const C = {
  white: '#FFFFFF',
  membrane: '#F4F5F2',
  asphalt: '#1C1E21',
  slate: '#596068',
  flash: '#CDD1D4',
  gold: '#C3A046',
  goldInk: '#7E6215',
  /** le texte clair sur l'asphalte (la tempête, le pied de page) */
  onDark: '#D9DDE1',
  onDark2: '#AEB5BC',
  /** fond des scènes : un ton plus soutenu que la membrane du site */
  stage: '#E4E6E2',
} as const;

/** Une seule famille, Saira (licence OFL), à largeur variable : étroite pour les titres, normale pour le texte */
export const F = {
  sans: '"Saira", Arial, sans-serif',
} as const;

/** Les styles du site : titres en Saira 760 à 70 % de largeur, texte en Saira 400 */
export const H2 = {fontFamily: F.sans, fontWeight: 760, fontStretch: '70%', letterSpacing: '-0.004em', lineHeight: 1.04} as const;
export const BODY = {fontFamily: F.sans, fontWeight: 400, fontStretch: '100%', letterSpacing: '0', lineHeight: 1.5} as const;

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
