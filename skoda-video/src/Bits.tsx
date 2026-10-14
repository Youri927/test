import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {LIGHT} from './beats.ts';
import {BODY, C, E, F, H2, range} from './util';

/** La fenêtre en arc du logo, redessinée au trait comme sur le site : l'arc et ses trois rayons, quatre colonnes de carreaux */
export const Mark: React.FC<{size: number; color: string; stroke?: number; style?: React.CSSProperties}> = ({size, color, stroke = 2.6, style}) => (
  <svg width={size} height={(size * 48) / 40} viewBox="0 0 40 48" style={{display: 'block', flex: 'none', ...style}}>
    <g fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round">
      <path d="M3 46V21a17 17 0 0 1 34 0v25z" />
      <path d="M3 21h34M20 4v42M11.5 21v25M28.5 21v25M3 29.5h34M3 38h34M20 21 8 9M20 21 32 9" />
    </g>
  </svg>
);

/** La marque du site : la fenêtre en arc, puis « Skoda Construction » en Besley, comme l'en-tête. `dark` : en blanc. */
export const Brand: React.FC<{size: number; dark?: boolean; style?: React.CSSProperties}> = ({size, dark = false, style}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * 0.5, ...style}}>
    <Mark size={size * 1.05} color={dark ? C.white : C.blue} />
    <div style={{fontFamily: F.serif, fontWeight: 700, fontSize: size, lineHeight: 1, color: dark ? C.white : C.frame, whiteSpace: 'nowrap', letterSpacing: '-0.005em'}}>
      Skoda Construction
    </div>
  </div>
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

/** Une ligne qui monte derrière sa ligne de base, comme les lettres du nom sur l'accueil du site */
export const Line: React.FC<{shift: number; style?: React.CSSProperties; children: React.ReactNode}> = ({shift, style, children}) => (
  <div style={{overflow: 'hidden', padding: '0.08em 0.14em 0.16em 0', margin: '-0.08em -0.14em -0.16em 0'}}>
    <div style={{transform: `translateY(${shift.toFixed(3)}%)`, ...style}}>{children}</div>
  </div>
);

/**
 * Légende : le panneau blanc se découvre depuis le bas, comme les photos des étapes du site ; les lignes du titre montent
 * derrière leur ligne de base, une à une, comme les lettres du nom ; le texte suit. Elle repart dans l'autre sens.
 * `title` : un tableau de lignes, coupées à la main.
 */
export const Caption: React.FC<{
  title: string[];
  text: string;
  at: number;
  out: number;
  side?: 'left' | 'right';
  width?: number;
  bottom?: number;
  brand?: boolean;
}> = ({title, text, at, out, side = 'left', width = 600, bottom = 60, brand = false}) => {
  const f = useCurrentFrame();
  if (f < at || f > out) return null;
  const open = range(f, at, at + 24, 0, 1, E.out) * (1 - range(f, out - 16, out, 0, 1, E.in));
  const leave = 1 - range(f, out - 22, out - 8);
  const rise = (k: number) => range(f, at + 8 + k * 5, at + 8 + k * 5 + 40, 104, 0, E.out);
  const textIn = range(f, at + 22 + title.length * 5, at + 50 + title.length * 5, 0, 1, E.out) * leave;
  const brandIn = range(f, at + 4, at + 30, 0, 1, E.out) * leave;
  return (
    <div style={{position: 'absolute', [side]: 64, bottom, width}}>
      <div
        style={{
          padding: '44px 48px 48px',
          background: C.white,
          boxShadow: '0 22px 60px rgba(23, 33, 46, 0.12)',
          clipPath: `inset(${((1 - open) * 100).toFixed(2)}% 0 0 0)`,
        }}
      >
        {brand ? <Brand size={30} style={{marginBottom: 40, opacity: brandIn}} /> : null}
        <div style={{...H2, fontSize: 54, color: C.frame, opacity: leave}}>
          {title.map((line, k) => (
            <Line key={k} shift={rise(k)}>
              {line}
            </Line>
          ))}
        </div>
        <div style={{...BODY, marginTop: 20, fontSize: 24, lineHeight: 1.5, color: C.slate, opacity: textIn, transform: `translateY(${((1 - textIn) * 14).toFixed(2)}px)`}}>{text}</div>
      </div>
    </div>
  );
};
