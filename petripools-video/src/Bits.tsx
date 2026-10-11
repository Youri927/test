import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {LIGHT} from './beats.ts';
import {BODY, C, E, F, H, H2, W, range} from './util';

/* ——— Le logotype du nouveau site : le disque soleil, « Petri » en gras et « Pools », Archivo étendue ——— */
export const Logo: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({size, color = C.ink, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: size * 0.48, color, whiteSpace: 'nowrap', ...style}}>
    <span style={{flex: 'none', width: size * 0.86, height: size * 0.86, borderRadius: '50%', background: C.sun, boxShadow: 'inset 0 0 0 1px rgba(17, 35, 45, .08)'}} />
    <span style={{fontFamily: F.sans, fontStretch: '125%', fontWeight: 500, fontSize: size, letterSpacing: '-0.02em', lineHeight: 1}}>
      <b style={{fontWeight: 800}}>Petri</b> Pools
    </span>
  </div>
);

/**
 * Enveloppe d'une scène : elle sort du noir sur ses `LIGHT.in` premières images et y retourne sur les `LIGHT.out` dernières.
 * `on` / `off` à false : pas de fondu de ce côté (la fin s'y fond à sa façon).
 */
export const Lights: React.FC<{len: number; on?: boolean; off?: boolean; children: React.ReactNode}> = ({len, on = true, off = true, children}) => {
  const f = useCurrentFrame();
  const up = on ? E.out(range(f, 0, LIGHT.in)) : 1;
  const down = off ? 1 - E.in(range(f, len - LIGHT.out, len)) : 1;
  const k = Math.min(up, down);
  if (k >= 0.999) return <>{children}</>;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: k, transform: `scale(${(1 + 0.02 * (1 - up)).toFixed(4)})`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ——— Légende : le panneau se remplit depuis le bas comme l'eau du site, le texte monte ; elle repart dans l'autre sens ——— */
export const Caption: React.FC<{
  title: string;
  text: string;
  at: number;
  out: number;
  tone?: 'light' | 'dark';
  side?: 'left' | 'right';
  width?: number;
  bottom?: number;
  brand?: boolean;
}> = ({title, text, at, out, tone = 'light', side = 'left', width = 600, bottom = 60, brand = false}) => {
  const f = useCurrentFrame();
  if (f < at || f > out) return null;
  const open = range(f, at, at + 22, 0, 1, E.out) * (1 - range(f, out - 16, out, 0, 1, E.in));
  const content = range(f, at + 8, at + 34, 0, 1, E.out) * (1 - range(f, out - 22, out - 8));
  const light = tone === 'light';
  return (
    <div style={{position: 'absolute', [side]: 64, bottom, width}}>
      <div
        style={{
          padding: '34px 40px 38px',
          borderRadius: 14,
          background: light ? C.white : C.floor,
          boxShadow: light ? '0 22px 60px rgba(10, 37, 48, 0.16)' : '0 22px 60px rgba(0, 0, 0, 0.38)',
          clipPath: `inset(${((1 - open) * 100).toFixed(2)}% 0 0 0 round 14px)`,
        }}
      >
        <div style={{opacity: content, transform: `translateY(${((1 - content) * 18).toFixed(2)}px)`}}>
          {brand ? <Logo size={25} color={light ? C.ink : C.white} style={{marginBottom: 26}} /> : null}
          <div style={{...H2, fontSize: 46, lineHeight: 1.0, color: light ? C.ink : C.white, textWrap: 'balance'}}>{title}</div>
          <div style={{...BODY, marginTop: 16, fontSize: 23, lineHeight: 1.45, color: light ? C.muted : 'rgba(255,255,255,.8)'}}>{text}</div>
        </div>
      </div>
    </div>
  );
};

/** Une ligne qui monte derrière son cache, comme le titre du site */
export const Line: React.FC<{shift: number; style?: React.CSSProperties; children: React.ReactNode}> = ({shift, style, children}) => (
  <div style={{overflow: 'hidden', padding: '0.06em 0.14em 0.12em 0', margin: '-0.06em -0.14em -0.12em 0'}}>
    <div style={{transform: `translateY(${shift}%)`, ...style}}>{children}</div>
  </div>
);

/** Grain très léger, par-dessus toute la vidéo */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.03, mixBlendMode: 'overlay'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(f / 2) % 8} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/* ——— La surface de l'eau : une vague douce qui glisse, comme celle de la frise du site ——— */
/** Hauteur de la vague à l'abscisse x (px de l'image) : deux ondes lentes, crêtes de ±8 px */
export const waveY = (x: number, f: number, y0: number, amp = 1) =>
  y0 + amp * (6 * Math.sin((2 * Math.PI * x) / 560 + f * 0.035) + 2.4 * Math.sin((2 * Math.PI * x) / 230 - f * 0.05 + 1.3));

/** Points de la vague sur toute la largeur, toutes les `step` px */
export const wavePoints = (f: number, y0: number, from = -40, to = W + 40, step = 24, amp = 1) => {
  const pts: [number, number][] = [];
  for (let x = from; x <= to; x += step) pts.push([x, waveY(x, f, y0, amp)]);
  return pts;
};

/** Le trait de la surface (blanc, un léger halo) et la lumière bleutée juste dessous */
export const Surface: React.FC<{y0: number; f: number; opacity?: number}> = ({y0, f, opacity = 1}) => {
  const pts = wavePoints(f, y0);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const below = `${d} L${W + 40} ${y0 + 90} L-40 ${y0 + 90} Z`;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity, overflow: 'visible'}}>
      <defs>
        <linearGradient id="under" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.shallow} stopOpacity="0.34" />
          <stop offset="1" stopColor={C.shallow} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={below} fill="url(#under)" transform={`translate(0 0)`} />
      <path d={d} fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth={9} strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#ffffff" strokeOpacity="0.95" strokeWidth={2.6} strokeLinejoin="round" />
    </svg>
  );
};

/* ——— La céramique beige de 15 cm des vieilles piscines (la frise « avant » du site), en fond d'image ——— */
const OLD = ['#dccfb8', '#d5c6ab', '#e1d6c2', '#d0c0a4'];
const rand = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const Ceramic: React.FC<{size?: number}> = ({size = 196}) => {
  const r = rand(1980);
  const cols = Math.ceil(W / size) + 1;
  const rows = Math.ceil(H / size) + 1;
  const g = 5;
  const ox = (W - cols * size) / 2;
  const oy = (H - rows * size) / 2;
  const tiles: React.ReactNode[] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++)
      tiles.push(
        <div
          key={`${i}-${j}`}
          style={{
            position: 'absolute',
            left: ox + i * size + g / 2,
            top: oy + j * size + g / 2,
            width: size - g,
            height: size - g,
            background: `linear-gradient(135deg, rgba(255,255,255,.2), rgba(255,255,255,0) 60%, rgba(90,70,40,.1)), ${OLD[Math.floor(r() * OLD.length)]}`,
          }}
        />,
      );
  return <AbsoluteFill style={{background: C.grout}}>{tiles}</AbsoluteFill>;
};

/* ——— La mosaïque de verre du site (main.js) : gris, bleu-gris, quelques reflets turquoise ——— */
const GLASS: [string, number][] = [['#2f3a42', 3], ['#3b4b56', 8], ['#4a6272', 14], ['#56707f', 14], ['#67818f', 13], ['#7d95a3', 12], ['#93a9b5', 10], ['#aabdc7', 8], ['#c6d4db', 5], ['#e2e9ec', 2], ['#4f8ea6', 5], ['#6fb2c7', 3]];
const pick = (r: number) => {
  let x = r * GLASS.reduce((n, [, w]) => n + w, 0);
  for (const [c, w] of GLASS) if ((x -= w) <= 0) return c;
  return GLASS[GLASS.length - 1][0];
};
const out3 = (t: number) => 1 - Math.pow(1 - t, 3);

/** La vieille céramique de la frise (main.js du site) : des carreaux beiges de 15 cm et un liseré brun en pied */
const OldBand: React.FC<{width: number; h: number; size: number}> = ({width, h, size}) => {
  const r = rand(1981);
  const trim = size * 0.9;
  const big = h - trim;
  const gb = Math.max(2, size * 0.1);
  const items: React.ReactNode[] = [];
  for (let i = 0; i * big < width + big; i++)
    items.push(
      <div
        key={`b${i}`}
        style={{
          position: 'absolute',
          left: i * big + gb / 2,
          top: gb / 2,
          width: big - gb,
          height: big - gb,
          background: `linear-gradient(135deg, rgba(255,255,255,.2), rgba(255,255,255,0) 60%, rgba(90,70,40,.1)), ${OLD[Math.floor(r() * OLD.length)]}`,
        }}
      />,
    );
  for (let i = 0; i * trim < width + trim; i++)
    items.push(<div key={`t${i}`} style={{position: 'absolute', left: i * trim + gb / 2, top: big + gb / 2, width: trim - gb, height: trim - gb, background: i % 2 ? '#7a6650' : '#6b5844'}} />);
  return <div style={{position: 'absolute', left: 0, top: 0, width: width + big, height: h, background: '#bcae96'}}>{items}</div>;
};

/**
 * Une frise de mosaïque de verre posée carreau par carreau sur la vieille céramique beige, de gauche à droite
 * (`t` : secondes depuis le début de la pose ; même règle que le site : 0,34 s par carreau), avec l'eau sur le bas :
 * réfraction, vague et lumière bleutée.
 */
export const Frieze: React.FC<{t: number; width: number; rows?: number; size: number; f: number; water?: number}> = ({t, width, rows = 4, size, f, water = 0.56}) => {
  const r = rand(2000);
  const cols = Math.ceil(width / size) + 1;
  const g = Math.max(1.5, size * 0.075);
  const h = rows * size;
  const wy = h * water;
  // sous la ligne d'eau, tout paraît décalé (la réfraction)
  const shift = -size * 0.3;
  // un seul tirage (couleur, moment de pose) par carreau, partagé par les deux moitiés
  const table: {i: number; j: number; color: string; at: number}[] = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) table.push({i, j, color: pick(r()), at: ((i * size) / width) * 1.5 + r() * 0.3});
  const cells = (below: boolean) => {
    const out: React.ReactNode[] = [];
    for (const {i, j, color, at} of table) {
      {
        const p = Math.max(0, Math.min(1, (t - at) / 0.34));
        if (p <= 0) continue;
        if (below ? (j + 1) * size <= wy : j * size >= wy) continue;
        const k = 0.7 + 0.3 * out3(p);
        const c = size * k;
        out.push(
          <div key={`${i}-${j}`} style={{position: 'absolute', left: i * size + (size - c) / 2, top: j * size + (size - c) / 2, width: c, height: c, opacity: Math.min(1, p * 1.7), background: '#c0c9cd'}}>
            <div
              style={{
                position: 'absolute',
                inset: (g / 2) * k,
                borderRadius: size * 0.09 * k,
                background: `linear-gradient(160deg, rgba(255,255,255,.24), rgba(255,255,255,.03) 50%, rgba(0,0,0,.14)), ${color}`,
              }}
            >
              <div style={{position: 'absolute', left: c * 0.1, top: c * 0.08, width: c * 0.22, height: Math.max(1, c * 0.05), background: 'rgba(255,255,255,.28)'}} />
            </div>
          </div>,
        );
      }
    }
    return out;
  };
  const pts = wavePoints(f, wy, -40, width + 40, 20, 0.7);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  // les deux moitiés : au-dessus de la ligne d'eau telle quelle, en dessous décalée
  const half = (below: boolean) => (
    <div style={{position: 'absolute', inset: 0, clipPath: below ? `inset(${wy}px 0 0 0)` : `inset(0 0 ${h - wy}px 0)`}}>
      <div style={{position: 'absolute', left: below ? shift : 0, top: 0, width: width + size, height: h}}>
        <OldBand width={width} h={h} size={size} />
        {cells(below)}
      </div>
    </div>
  );
  return (
    <div style={{position: 'relative', width, height: h, overflow: 'hidden'}}>
      {half(false)}
      {half(true)}
      <svg width={width} height={h} style={{position: 'absolute', inset: 0}}>
        <path d={`${d} L${width + 40} ${h} L-40 ${h} Z`} fill="rgba(92, 192, 227, .42)" />
        <path d={d} fill="none" stroke="#ffffff" strokeOpacity="0.9" strokeWidth={2.2} />
      </svg>
    </div>
  );
};
