import {Easing, interpolate, spring} from 'remotion';

export const FPS = 60;
export const W = 1920;
export const H = 1080;
export {BEAT} from './beats.ts';

/** La charte du nouveau site (index.css) : encre bleu nuit, l'azur de leur icône, l'eau du coloris California, la pierre des margelles */
export const C = {
  white: '#FFFFFF',
  ink: '#0A1A24',
  inkSoft: '#3D4F5A',
  azure: '#0894FC',
  azureInk: '#0067C4',
  deck: '#EEF2F4',
  stone: '#E6E1D8',
  line: '#D5DDE2',
  water: '#2F98CC',
  waterDeep: '#1A6E9A',
  /** le panneau sombre du comparateur et des piscines existantes */
  panel: '#0E2330',
  /** fond neutre du site actuel (scène « Today »), hors de la nouvelle charte */
  today: '#ECECEC',
  todayLine: '#D4D4D4',
  todaySoft: '#5A5F63',
} as const;

export const F = {
  sans: '"Familjen Grotesk", "Helvetica Neue", Arial, sans-serif',
} as const;

/** Les styles de titre du site (index.css) : Familjen Grotesk, graisses 640 à 680, interlignage serré */
export const DISPLAY = {fontFamily: F.sans, fontWeight: 680, letterSpacing: '-0.04em', lineHeight: 0.9} as const;
export const H2 = {fontFamily: F.sans, fontWeight: 660, letterSpacing: '-0.035em', lineHeight: 0.94} as const;
export const H3 = {fontFamily: F.sans, fontWeight: 640, letterSpacing: '-0.02em', lineHeight: 1.08} as const;
export const BODY = {fontFamily: F.sans, fontWeight: 420, letterSpacing: '-0.005em', lineHeight: 1.5} as const;
/** chiffres tabulaires, pour les cotes */
export const TNUM = {fontVariantNumeric: 'tabular-nums'} as const;

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const E = {
  linear: (t: number) => t,
  sine: Easing.bezier(0.37, 0, 0.63, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** expo.out, la courbe des animations du site */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  soft: Easing.bezier(0.45, 0, 0.25, 1),
  /** les mâchoires de la règle : départ franc, arrivée douce */
  jaw: Easing.bezier(0.76, 0, 0.18, 1),
};
export const range = (f: number, a: number, b: number, from = 0, to = 1, easing: (t: number) => number = E.linear) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});
export const pop = (f: number, start: number, stiffness = 160, damping = 20) =>
  spring({frame: f - start, fps: FPS, config: {stiffness, damping, mass: 1}});

/** Mélange de deux couleurs #rrggbb */
export const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
};

/** pouces → « 35′ 3⅛″ », comme le site (lib/pools.ts) */
export function feet(inches: number) {
  const f = Math.floor(inches / 12 + 1e-9);
  const rest = inches - f * 12;
  const whole = Math.floor(rest + 1e-9);
  const frac = rest - whole;
  const FR: [number, string][] = [[0.125, '⅛'], [0.25, '¼'], [0.375, '⅜'], [0.5, '½'], [0.625, '⅝'], [0.75, '¾'], [0.875, '⅞']];
  const fr = FR.find(([v]) => Math.abs(v - frac) < 0.02)?.[1] ?? '';
  if (!whole && !fr) return `${f}′`;
  return `${f}′ ${whole || ''}${fr}″`;
}
