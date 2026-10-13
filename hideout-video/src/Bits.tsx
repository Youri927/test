import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {LIGHT} from './beats.ts';
import {LOGO_COMPACT, LOGO_FULL} from './logo';
import {BODY, C, E, H2, range} from './util';

/** Le logo du site (cadre or, nom en couleur du texte) : `compact` pour l'en-tête, `full` avec « BOUTIQUE & MED SPA » */
export const Logo: React.FC<{width: number; color?: string; full?: boolean; style?: React.CSSProperties}> = ({width, color = C.ink, full = false, style}) => (
  <div
    style={{width, color, lineHeight: 0, ...style}}
    // le SVG du site, tel quel : il prend toute la largeur du bloc
    dangerouslySetInnerHTML={{__html: (full ? LOGO_FULL : LOGO_COMPACT).replace('<svg ', '<svg style="display:block;width:100%;height:auto" ')}}
  />
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
  /** light : panneau blanc, titre à l'encre ; dark : panneau expresso, texte crème (scène de l'équipe) */
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
          padding: '40px 46px 44px',
          background: light ? C.white : C.espresso,
          boxShadow: light ? '0 22px 60px rgba(34, 26, 22, 0.13)' : '0 22px 60px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(244, 238, 233, 0.1)',
          clipPath: `inset(${((1 - open) * 100).toFixed(2)}% 0 0 0)`,
        }}
      >
        <div style={{opacity: content, transform: `translateY(${((1 - content) * 18).toFixed(2)}px)`}}>
          {brand ? <Logo width={230} color={light ? C.ink : C.cream} style={{marginBottom: 34}} /> : null}
          <div style={{...H2, fontSize: 50, color: light ? C.ink : C.cream, textWrap: 'balance'}}>{title}</div>
          <div style={{...BODY, marginTop: 18, fontSize: 24, lineHeight: 1.45, color: light ? C.ink2 : 'rgba(244, 238, 233, 0.82)'}}>{text}</div>
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
