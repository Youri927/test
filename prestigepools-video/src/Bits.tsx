import React from 'react';
import {AbsoluteFill, interpolateColors, useCurrentFrame} from 'remotion';
import {LIGHT} from './beats.ts';
import {BODY, C, E, F, H2, range} from './util';

/**
 * Le logotype du nouveau site : un point de lumière, puis « Prestige Pools » en Syne 800 et « of Wilmington » dessous.
 * `on` (0 à 1) : le point s'allume en bleu, avec son halo, comme sur le site la nuit.
 */
export const Logo: React.FC<{size: number; on?: number; dark?: boolean; style?: React.CSSProperties}> = ({size, on = 0, dark = false, style}) => {
  const dot = size * 0.72;
  const fill = interpolateColors(on, [0, 1], ['#9AA6B8', C.lightNight]);
  const halo = `0 0 0 ${size * 0.2}px rgba(${on > 0 ? '53, 80, 255' : '154, 166, 184'}, ${(0.22 + 0.06 * on).toFixed(3)}), 0 0 ${size * 1.1 * on}px rgba(53, 80, 255, ${(0.85 * on).toFixed(3)})`;
  return (
    <div style={{display: 'inline-grid', gridTemplateColumns: 'auto auto', columnGap: size * 0.5, alignItems: 'center', whiteSpace: 'nowrap', ...style}}>
      <div style={{gridRow: 'span 2', width: dot, height: dot, borderRadius: '50%', background: fill, boxShadow: halo}} />
      <div style={{fontFamily: F.display, fontWeight: 800, fontSize: size, letterSpacing: '-0.02em', lineHeight: 1, color: dark ? C.moon : C.ink}}>Prestige Pools</div>
      <div style={{fontFamily: F.sans, fontWeight: 400, fontSize: size * 0.62, lineHeight: 1, marginTop: size * 0.2, color: dark ? C.moon2 : C.ink2}}>of Wilmington</div>
    </div>
  );
};

/**
 * Enveloppe d'une scène : elle sort du noir sur ses `LIGHT.in` premières images et y retourne sur les `LIGHT.out` dernières.
 * Seule l'opacité change (pas de zoom pendant le fondu : rien ne bouge d'un pixel à l'autre).
 * `on` / `off` à false : pas de fondu de ce côté.
 */
export const Lights: React.FC<{len: number; on?: boolean; off?: boolean; children: React.ReactNode}> = ({len, on = true, off = true, children}) => {
  const f = useCurrentFrame();
  const up = on ? E.out(range(f, 0, LIGHT.in)) : 1;
  const down = off ? 1 - E.in(range(f, len - LIGHT.out, len)) : 1;
  const k = Math.min(up, down);
  if (k >= 0.999) return <>{children}</>;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: k}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ——— Légende : le panneau se découvre depuis le bas, le texte monte ; elle repart dans l'autre sens ——— */
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
          padding: '38px 44px 42px',
          borderRadius: 24,
          background: light ? C.white : C.surfaceNight,
          boxShadow: light ? '0 22px 60px rgba(12, 24, 56, 0.14)' : '0 22px 60px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(234, 240, 247, 0.08)',
          clipPath: `inset(${((1 - open) * 100).toFixed(2)}% 0 0 0 round 24px)`,
        }}
      >
        <div style={{opacity: content, transform: `translateY(${((1 - content) * 18).toFixed(2)}px)`}}>
          {brand ? <Logo size={27} on={light ? 0 : 1} dark={!light} style={{marginBottom: 30}} /> : null}
          <div style={{...H2, fontSize: 48, lineHeight: 1.02, color: light ? C.ink : C.moon, textWrap: 'balance'}}>{title}</div>
          <div style={{...BODY, marginTop: 18, fontSize: 24, lineHeight: 1.45, color: light ? C.ink2 : C.moon2}}>{text}</div>
        </div>
      </div>
    </div>
  );
};

/** Une ligne qui monte derrière son cache */
export const Line: React.FC<{shift: number; style?: React.CSSProperties; children: React.ReactNode}> = ({shift, style, children}) => (
  <div style={{overflow: 'hidden', padding: '0.08em 0.14em 0.14em 0', margin: '-0.08em -0.14em -0.14em 0'}}>
    <div style={{transform: `translateY(${shift}%)`, ...style}}>{children}</div>
  </div>
);

/** Étiquette posée sur le navigateur (« Your website today ») */
export const Tag: React.FC<{text: string; dark?: boolean; opacity?: number; scale?: number}> = ({text, dark = false, opacity = 1, scale = 1}) => (
  <div
    style={{
      display: 'inline-block',
      padding: `${0.42 * scale}em ${0.9 * scale}em ${0.36 * scale}em`,
      borderRadius: 999,
      background: dark ? 'rgba(12, 24, 56, .9)' : 'rgba(255, 255, 255, .95)',
      color: dark ? C.white : C.ink,
      fontFamily: F.display,
      fontWeight: 700,
      fontSize: 30 * scale,
      letterSpacing: '-0.015em',
      lineHeight: 1.2,
      boxShadow: '0 10px 30px rgba(12, 24, 56, .25)',
      opacity,
    }}
  >
    {text}
  </div>
);
