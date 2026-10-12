import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {LIGHT} from './beats.ts';
import {BODY, C, E, H2, MARK, range} from './util';

/** Le logotype du site : « Castor Dental Associates » en petites capitales évasées, comme les lettres de la façade */
export const Mark: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({size, color = C.blue, style}) => (
  <div style={{...MARK, fontSize: size, color, ...style}}>Castor Dental Associates</div>
);

/**
 * Enveloppe d'une scène : elle sort du noir sur ses `LIGHT.in` premières images et y retourne sur les `LIGHT.out` dernières.
 * Seule l'opacité change (pas de zoom pendant le fondu : rien ne bouge d'un pixel à l'autre). Sa première et sa dernière
 * image sont entièrement noires : d'une scène à l'autre, la coupe se fait dans le noir, sans saut de lumière.
 * `on` / `off` à false : pas de fondu de ce côté.
 */
export const Lights: React.FC<{len: number; on?: boolean; off?: boolean; children: React.ReactNode}> = ({len, on = true, off = true, children}) => {
  const f = useCurrentFrame();
  // courbe douce dans les deux sens : la lumière ne fait aucune marche, ni en entrant dans le noir ni en en sortant
  const up = on ? E.sine(range(f, 0, LIGHT.in)) : 1;
  const down = off ? 1 - E.sine(range(f, len - 1 - LIGHT.out, len - 1)) : 1;
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
  /** light : panneau blanc, titre bleu ; hedge : panneau vert de la haie, texte blanc (scène de l'équipe) */
  tone?: 'light' | 'hedge';
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
          borderRadius: 18,
          background: light ? C.white : C.hedge,
          boxShadow: light ? '0 22px 60px rgba(14, 26, 55, 0.14)' : '0 22px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          clipPath: `inset(${((1 - open) * 100).toFixed(2)}% 0 0 0 round 18px)`,
        }}
      >
        <div style={{opacity: content, transform: `translateY(${((1 - content) * 18).toFixed(2)}px)`}}>
          {brand ? <Mark size={27} color={light ? C.blue : C.white} style={{marginBottom: 30}} /> : null}
          <div style={{...H2, fontSize: 48, color: light ? C.blue : C.white, textWrap: 'balance'}}>{title}</div>
          <div style={{...BODY, marginTop: 18, fontSize: 24, lineHeight: 1.45, color: light ? C.ink2 : 'rgba(255, 255, 255, 0.84)'}}>{text}</div>
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
