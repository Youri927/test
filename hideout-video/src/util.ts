import {Easing, interpolate} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export {BEAT} from './beats.ts';

/** La charte du nouveau site (styles.css) : le blanc de studio, l'encre, l'or du logo, l'expresso, la crème, le pétale */
export const C = {
  white: '#FFFFFF',
  ink: '#221A16',
  ink2: '#6B5F58',
  gold: '#C4A42C',
  espresso: '#231B17',
  cream: '#F4EEE9',
  petal: '#F6ECE8',
  /** fond des scènes claires : un ton plus soutenu que la crème du site */
  stage: '#ECE2DA',
  /** fond de la scène de l'équipe : un ton plus sombre que l'expresso du site */
  stageDark: '#16110E',
  line: '#E2D8D1',
} as const;

/** La police du site pour tout le texte : Archivo, variable en largeur (62 à 125) et en graisse (100 à 900) */
export const F = {
  sans: '"Archivo", "Helvetica Neue", Arial, sans-serif',
} as const;

/** Les styles du site : titres en Archivo 300 à la largeur maximale (comme le nom espacé du logo), texte à la largeur normale */
export const H2 = {fontFamily: F.sans, fontWeight: 300, fontStretch: '125%', letterSpacing: '-0.01em', lineHeight: 1.04} as const;
export const BODY = {fontFamily: F.sans, fontWeight: 400, fontStretch: '100%', letterSpacing: '0', lineHeight: 1.5} as const;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const E = {
  linear: (t: number) => t,
  sine: Easing.bezier(0.37, 0, 0.63, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** la courbe des mouvements du site (cubic-bezier(.2, .7, .2, 1)) : entrées et légendes */
  out: Easing.bezier(0.2, 0.7, 0.2, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** la courbe de l'agrandissement du cadre à l'ouverture du site : lente au départ, franche au milieu, posée à l'arrivée */
  open: Easing.bezier(0.72, 0, 0.18, 1),
  /** courbe douce, pour la caméra : départ et arrivée sans à-coup */
  soft: Easing.bezier(0.45, 0, 0.25, 1),
};
export const range = (f: number, a: number, b: number, from = 0, to = 1, easing: (t: number) => number = E.linear) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});
