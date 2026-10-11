import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {LIGHT} from './beats.ts';
import {BODY, C, E, F, H, H3, W, range} from './util';

/* ——— Le logotype du nouveau site : « Heritage » en Ultra, « Pools Texas » en Libre Franklin (empilés ou sur une ligne) ——— */
export const Logo: React.FC<{size: number; stacked?: boolean; color?: string; style?: React.CSSProperties}> = ({size, stacked = false, color = C.white, style}) => (
  <div style={{display: 'flex', flexDirection: stacked ? 'column' : 'row', alignItems: stacked ? 'flex-start' : 'baseline', gap: stacked ? size * 0.06 : size * 0.28, color, whiteSpace: 'nowrap', ...style}}>
    <span style={{fontFamily: F.display, fontSize: size, lineHeight: 1, letterSpacing: '-0.01em'}}>Heritage</span>
    <span style={{fontFamily: F.sans, fontWeight: 600, fontSize: size * (stacked ? 0.34 : 0.36), lineHeight: 1.1, marginLeft: stacked ? size * 0.04 : 0}}>Pools Texas</span>
  </div>
);

/* ——— La piscine du jour 41, lumières allumées, dans son cadre, avec sa lueur turquoise (comme à la fin de l'ouverture du site) ——— */
export const NightPool: React.FC<{lit: number; zoom: number; x: number; y: number; w: number}> = ({lit, zoom, x, y, w}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: w * 0.75}}>
    <div style={{position: 'absolute', inset: '-26% -18%', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(42, 209, 223, 0.55), rgba(42, 209, 223, 0))', opacity: lit}} />
    <div style={{position: 'absolute', inset: 0, borderRadius: w * 0.018, overflow: 'hidden', background: '#000'}}>
      <Img src={staticFile('hero/night.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom.toFixed(4)})`, filter: `brightness(${(0.25 + 0.75 * lit).toFixed(3)})`}} />
    </div>
  </div>
);

/**
 * Enveloppe d'une scène : elle sort du noir sur ses `LIGHT.in` premières images et y retourne sur les `LIGHT.out` dernières.
 * `on` / `off` à false : pas de fondu de ce côté (l'ouverture sort du noir à sa façon, la fin s'y fond).
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

/* ——— Légende : le panneau se déplie depuis le bas, le texte monte ; elle repart dans l'autre sens ——— */
export const Caption: React.FC<{
  title: string;
  text: string;
  at: number;
  out: number;
  tone?: 'light' | 'dark';
  side?: 'left' | 'right';
  width?: number;
  bottom?: number;
}> = ({title, text, at, out, tone = 'light', side = 'left', width = 600, bottom = 60}) => {
  const f = useCurrentFrame();
  if (f < at || f > out) return null;
  const open = range(f, at, at + 22, 0, 1, E.out) * (1 - range(f, out - 16, out, 0, 1, E.in));
  const content = range(f, at + 8, at + 34, 0, 1, E.out) * (1 - range(f, out - 22, out - 8));
  const light = tone === 'light';
  return (
    <div style={{position: 'absolute', [side]: 64, bottom, width}}>
      <div
        style={{
          padding: '32px 38px 36px',
          borderRadius: 24,
          background: light ? C.white : C.ink,
          boxShadow: light ? '0 22px 60px rgba(5, 42, 48, 0.18)' : '0 22px 60px rgba(0, 0, 0, 0.4)',
          clipPath: `inset(${((1 - open) * 100).toFixed(2)}% 0 0 0 round 24px)`,
        }}
      >
        <div style={{opacity: content, transform: `translateY(${((1 - content) * 18).toFixed(2)}px)`}}>
          <div style={{...H3, fontSize: 40, color: light ? C.ink : C.white}}>{title}</div>
          <div style={{...BODY, marginTop: 14, fontSize: 23, lineHeight: 1.45, color: light ? C.muted : 'rgba(255,255,255,.8)'}}>{text}</div>
        </div>
      </div>
    </div>
  );
};

/** Une ligne qui monte derrière son cache, comme les titres du site */
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
