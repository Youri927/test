import React, {useId, useMemo} from 'react';
import {staticFile} from 'remotion';
import DRAWINGS from './drawings.json';
import DATA from './data-pools.json';
import {C} from './util';

/* ——— Les modèles Barrier Reef et leurs dessins (les mêmes données que le site : src/lib/pools.ts, src/data/drawings.json) ——— */

type Region = {d: string; rule?: 'evenodd'; tone?: number; grad?: {x1: number; y1: number; x2: number; y2: number; stops: number[][]}};
type Drawing = {ratio: number; water: string; nocoping?: boolean; regions: Region[]};
export type Size = {l: number; w: number; drawing?: string};
export type Model = {id: string; name: string; families: string[]; drawing: string; sizes: Size[]};
export type FinishId = 'aquamarine' | 'arctic' | 'california' | 'evening-sky' | 'sandstone' | 'ocean';

export const MODELS = DATA.models as Model[];
export const POOLS = MODELS.filter((m) => !m.families.includes('spa'));
export const modelById = (id: string) => MODELS.find((m) => m.id === id) ?? MODELS[0];
export const drawingOf = (m: Model, s: Size) => (DRAWINGS as Record<string, Drawing>)[s.drawing ?? m.drawing];
/** Les dessins de la fiche, par identifiant (une même coque peut avoir plusieurs dessins : Coral Cay 30′ et 26′, Outback Dundee avec ou sans banquette) */
export const DRAWING = DRAWINGS as Record<string, Drawing>;

const NUM = /-?\d*\.?\d+(?:e-?\d+)?/g;
/** chemin du dessin (cadre de 1000 × 1000) → chemin en pixels, x et y mis à l'échelle séparément */
export const scalePath = (d: string, sx: number, sy: number) => {
  let k = 0;
  return d.replace(NUM, (n) => String(Math.round(parseFloat(n) * (k++ % 2 ? sy : sx) * 10) / 10));
};

/** clarté du dessin d'origine → gris de la carte de relief (0,5 = neutre), comme le site */
const gray = (t: number) => {
  const g = Math.round(255 * Math.max(0, Math.min(1, 0.5 + t * 0.4)));
  return `rgb(${g} ${g} ${g})`;
};

/** clarté du dessin d'origine → le bleu de la fiche Barrier Reef (L* = 68 + 40 t, teinte et saturation de la fiche) */
const sheetBlue = (t: number) => {
  const L = Math.max(22, Math.min(92, 68 + 40 * t));
  const Cc = 44 - Math.max(0, L - 70) * 0.8;
  const h = (226 * Math.PI) / 180;
  const a = Cc * Math.cos(h);
  const b = Cc * Math.sin(h);
  // Lab → XYZ (D65) → sRGB
  const fy = (L + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;
  const inv = (v: number) => (v ** 3 > 216 / 24389 ? v ** 3 : (116 * v - 16) / (24389 / 27));
  const X = 0.95047 * inv(fx);
  const Y = inv(fy);
  const Z = 1.08883 * inv(fz);
  const lin = [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z];
  const g = lin.map((v) => Math.round(255 * Math.max(0, Math.min(1, v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055))));
  return `rgb(${g[0]} ${g[1]} ${g[2]})`;
};

export type PoolProps = {
  drawing: string;
  /** taille affichée, en pixels */
  w: number;
  h: number;
  /** pixels par pied : garde la même échelle réelle de la texture d'un bassin à l'autre */
  ppf: number;
  finish?: FinishId;
  /** 0 = les bleus à plat de la fiche, 1 = la vraie eau du coloris, la margelle en pierre */
  water?: number;
  /** contour tracé (0 → 1) ; au-delà de 1, le dessin est entier */
  draw?: number;
  /** l'eau se dévoile de gauche à droite (0 → 1) */
  fill?: number;
  /** dérive de la texture (px) */
  drift?: number;
  lines?: boolean;
  outlineColor?: string;
};

/** Un bassin vu de dessus, à l'échelle : le dessin de la fiche Barrier Reef 2025, rempli avec la vraie texture d'eau du coloris */
export const Pool: React.FC<PoolProps> = ({drawing, w, h, ppf, finish = 'california', water = 1, draw = 2, fill = 1, drift = 0, lines = true, outlineColor = C.azure}) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const dr = DRAWING[drawing];
  const paths = useMemo(() => dr.regions.map((r) => scalePath(r.d, w / 1000, h / 1000)), [dr, w, h]);
  const inner = useMemo(() => scalePath(dr.water, w / 1000, h / 1000), [dr, w, h]);
  // la texture garde la même échelle réelle d'un bassin à l'autre : 26 pieds de large au minimum (comme le site)
  const tw = Math.max(w * 1.16, 26 * ppf);
  const th = Math.max((tw * 900) / 1600, h * 1.16);
  const twide = Math.max(tw, (th * 1600) / 900);
  const shown = Math.max(0, Math.min(1, draw));
  const sheet = 1 - water;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <clipPath id={`${uid}w`}>
          <path d={inner} />
        </clipPath>
        <clipPath id={`${uid}f`}>
          <rect x={-w * 0.1} y={-h * 0.1} width={w * 1.2 * fill} height={h * 1.2} />
        </clipPath>
        {dr.regions.map((r, i) =>
          r.grad ? (
            <linearGradient key={i} id={`${uid}g${i}`} gradientUnits="userSpaceOnUse" x1={(r.grad.x1 * w) / 1000} y1={(r.grad.y1 * h) / 1000} x2={(r.grad.x2 * w) / 1000} y2={(r.grad.y2 * h) / 1000}>
              {r.grad.stops.map(([o, t]) => (
                <stop key={o} offset={o} stopColor={gray(t)} />
              ))}
            </linearGradient>
          ) : null,
        )}
        {dr.regions.map((r, i) =>
          r.grad ? (
            <linearGradient key={'s' + i} id={`${uid}s${i}`} gradientUnits="userSpaceOnUse" x1={(r.grad.x1 * w) / 1000} y1={(r.grad.y1 * h) / 1000} x2={(r.grad.x2 * w) / 1000} y2={(r.grad.y2 * h) / 1000}>
              {r.grad.stops.map(([o, t]) => (
                <stop key={o} offset={o} stopColor={sheetBlue(t)} />
              ))}
            </linearGradient>
          ) : null,
        )}
      </defs>
      {fill > 0 ? (
        <g clipPath={`url(#${uid}f)`}>
          {/* les bleus à plat de la fiche */}
          {sheet > 0.001 ? (
            <g opacity={sheet}>
              {paths.map((d, i) => (
                <path key={i} d={d} fillRule={dr.regions[i].rule ?? 'nonzero'} fill={dr.regions[i].grad ? `url(#${uid}s${i})` : sheetBlue(dr.regions[i].tone ?? 0)} />
              ))}
            </g>
          ) : null}
          {/* la margelle en pierre, l'eau, puis le relief du dessin par-dessus (en lumière douce) */}
          {water > 0.001 ? (
            <g opacity={water}>
              <path d={paths[0]} fill={C.stone} fillRule={dr.regions[0].rule ?? 'nonzero'} />
              <g clipPath={`url(#${uid}w)`} style={{isolation: 'isolate'}}>
                <image href={staticFile(`img/water-${finish}.jpg`)} x={w / 2 - twide / 2 + drift} y={h / 2 - th / 2} width={twide} height={th} preserveAspectRatio="xMidYMid slice" />
                <g style={{mixBlendMode: 'soft-light'}}>
                  {paths.map((d, i) => (
                    <path key={i} d={d} fillRule={dr.regions[i].rule ?? 'nonzero'} fill={dr.regions[i].grad ? `url(#${uid}g${i})` : gray(dr.regions[i].tone ?? 0)} />
                  ))}
                </g>
              </g>
              {lines ? (
                <g fill="none" stroke="#fff" strokeOpacity={0.3} strokeWidth={Math.max(0.75, ppf / 22)}>
                  {paths.slice(1).map((d, i) => (
                    <path key={i} d={d} />
                  ))}
                </g>
              ) : null}
              <path d={paths[0]} fill="none" stroke="rgba(10, 26, 36, 0.16)" strokeWidth={1} />
            </g>
          ) : null}
        </g>
      ) : null}
      {/* le contour qui se trace, avant que l'eau n'arrive */}
      {draw < 1.999 ? (
        <path d={paths[0]} fill="none" stroke={outlineColor} strokeWidth={2.5} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - shown} opacity={Math.max(0, Math.min(1, 2 - draw))} />
      ) : null}
    </svg>
  );
};

/** Une grille d'un pied, qui s'efface vers les bords (comme le fond du bassin de l'accueil du site) */
export const FeetGrid: React.FC<{w: number; h: number; ppf: number; opacity?: number; color?: string; x0?: number; y0?: number}> = ({w, h, ppf, opacity = 1, color = 'rgba(10, 26, 36, 0.07)', x0 = 0, y0 = 0}) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, opacity}}>
      <defs>
        <pattern id={`${id}p`} width={ppf} height={ppf} patternUnits="userSpaceOnUse" x={x0} y={y0}>
          <path d={`M ${ppf} 0 L 0 0 0 ${ppf}`} fill="none" stroke={color} strokeWidth={1} />
        </pattern>
        <pattern id={`${id}P`} width={ppf * 5} height={ppf * 5} patternUnits="userSpaceOnUse" x={x0} y={y0}>
          <path d={`M ${ppf * 5} 0 L 0 0 0 ${ppf * 5}`} fill="none" stroke={color} strokeWidth={1.6} />
        </pattern>
        <radialGradient id={`${id}g`} cx="50%" cy="50%" r="60%">
          <stop offset="0.45" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <mask id={`${id}m`}>
          <rect width={w} height={h} fill={`url(#${id}g)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}m)`}>
        <rect width={w} height={h} fill={`url(#${id}p)`} />
        <rect width={w} height={h} fill={`url(#${id}P)`} />
      </g>
    </svg>
  );
};
