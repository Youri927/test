import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {LIGHT} from './beats.ts';
import {BODY, C, E, F, H2, range} from './util';

/* ——— Le logotype du nouveau site : le plus petit plan possible (un bassin et son spa), puis le nom en Mona Sans large ——— */
export const Mark: React.FC<{size: number; color?: string; bg?: string; draw?: number; strokeWidth?: number}> = ({size, color = C.ink, bg = C.white, draw = 1, strokeWidth = 1.7}) => {
  // draw : de 0 à 1, le trait se dessine (le rectangle d'abord, puis le cercle)
  const r = Math.min(1, draw / 0.62);
  const c = Math.max(0, Math.min(1, (draw - 0.38) / 0.62));
  return (
    <svg width={size * (44 / 30)} height={size} viewBox="-1 -1 46 32" style={{overflow: 'visible', display: 'block'}}>
      <rect x="12" y="2" width="30" height="20" rx="5" pathLength={1} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray="1.01" strokeDashoffset={(1.01 * (1 - r)).toFixed(4)} />
      <circle cx="12" cy="20" r="8" pathLength={1} transform="rotate(180 12 20)" fill={bg} fillOpacity={c > 0 ? 1 : 0} stroke={C.orange} strokeWidth={strokeWidth} strokeDasharray="1.01" strokeDashoffset={(1.01 * (1 - c)).toFixed(4)} />
    </svg>
  );
};

export const Logo: React.FC<{size: number; color?: string; bg?: string; style?: React.CSSProperties}> = ({size, color = C.ink, bg = C.white, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: size * 0.5, color, whiteSpace: 'nowrap', ...style}}>
    <Mark size={size * 1.15} color={color} bg={bg} />
    <span style={{fontFamily: F.sans, fontWeight: 820, fontStretch: '125%', fontSize: size, letterSpacing: '-0.03em', lineHeight: 1}}>Mad River Pools</span>
  </div>
);

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
          padding: '36px 42px 40px',
          borderRadius: 12,
          background: light ? C.white : '#0F2531',
          boxShadow: light ? '0 22px 60px rgba(23, 35, 43, 0.14)' : '0 22px 60px rgba(0, 0, 0, 0.42)',
          clipPath: `inset(${((1 - open) * 100).toFixed(2)}% 0 0 0 round 12px)`,
        }}
      >
        <div style={{opacity: content, transform: `translateY(${((1 - content) * 18).toFixed(2)}px)`}}>
          {brand ? <Logo size={27} color={light ? C.ink : C.white} bg={light ? C.white : '#0F2531'} style={{marginBottom: 26}} /> : null}
          <div style={{...H2, fontSize: 46, lineHeight: 1.0, color: light ? C.ink : C.white, textWrap: 'balance'}}>{title}</div>
          <div style={{...BODY, marginTop: 18, fontSize: 24, lineHeight: 1.45, color: light ? C.ink2 : 'rgba(244,245,241,.8)'}}>{text}</div>
        </div>
      </div>
    </div>
  );
};

/** Une ligne qui monte derrière son cache */
export const Line: React.FC<{shift: number; style?: React.CSSProperties; children: React.ReactNode}> = ({shift, style, children}) => (
  <div style={{overflow: 'hidden', padding: '0.08em 0.14em 0.12em 0', margin: '-0.08em -0.14em -0.12em 0'}}>
    <div style={{transform: `translateY(${shift}%)`, ...style}}>{children}</div>
  </div>
);

/** Étiquette posée sur le navigateur (« Your website today ») */
export const Tag: React.FC<{text: string; dark?: boolean; opacity?: number; scale?: number}> = ({text, dark = false, opacity = 1, scale = 1}) => (
  <div
    style={{
      display: 'inline-block',
      padding: `${0.42 * scale}em ${0.9 * scale}em ${0.24 * scale}em`,
      borderRadius: 999,
      background: dark ? 'rgba(23, 35, 43, .88)' : 'rgba(255, 255, 255, .95)',
      color: dark ? C.white : C.ink,
      fontFamily: F.sans,
      fontWeight: 760,
      fontStretch: '112%',
      fontSize: 30 * scale,
      letterSpacing: '-0.01em',
      lineHeight: 1.2,
      boxShadow: '0 10px 30px rgba(23, 35, 43, .25)',
      opacity,
    }}
  >
    {text}
  </div>
);
