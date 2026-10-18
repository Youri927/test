import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {LIGHT} from './beats.ts';
import logo from './logo.json';
import {BODY, C, E, F, H2, range} from './util';

/**
 * L'emblème du site, redessiné en vecteurs (tools/logo.py du site) : la Floride dans l'anneau de la rose des vents. Deux
 * graisses : l'anneau fin pour les grandes tailles, l'anneau fort pour les petites (comme l'en-tête et la licence).
 */
export const Emblem: React.FC<{height: number; color: string; bold?: boolean; style?: React.CSSProperties}> = ({height, color, bold = false, style}) => (
  <svg width={(height * logo.w) / logo.h} height={height} viewBox={`0 0 ${logo.w} ${logo.h}`} style={{display: 'block', flex: 'none', ...style}}>
    <path d={bold ? logo.ringBold : logo.ring} fill={color} fillRule="evenodd" />
    <path d={bold ? logo.landBold : logo.land} fill={color} fillRule="evenodd" />
  </svg>
);

/** Le logo, comme l'en-tête du site : l'emblème, puis « Florida South » en Gloock et « Construction » dessous */
export const Brand: React.FC<{height: number; color?: string; mark?: string; style?: React.CSSProperties}> = ({height, color = C.ink, mark = C.sky, style}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: height * 0.26, ...style}}>
    <Emblem height={height} color={mark} bold />
    <div style={{display: 'flex', flexDirection: 'column', color}}>
      <span style={{fontFamily: F.serif, fontSize: height * 0.5, lineHeight: 1, whiteSpace: 'nowrap'}}>Florida South</span>
      <span style={{fontFamily: F.sans, fontWeight: 500, fontSize: height * 0.285, lineHeight: 1, letterSpacing: '0.04em', marginTop: height * 0.11, opacity: 0.86}}>Construction</span>
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

/**
 * Une ligne qui s'écrit de gauche à droite, comme « Consider it done. » sur le site : un masque qui découvre le texte
 * (`p` de 0 à 1), un peu plus haut et plus bas que la ligne pour ne couper ni les capitales ni les jambages.
 */
export const Write: React.FC<{p: number; style?: React.CSSProperties; children: React.ReactNode}> = ({p, style, children}) => (
  <div style={{clipPath: `inset(-0.2em ${((1 - p) * 100).toFixed(3)}% -0.3em 0)`, ...style}}>{children}</div>
);

/**
 * Légende, dans le mouvement du site : le panneau blanc se découvre de gauche à droite, comme le trait qui barre une
 * ligne de la liste (0,5 s) ; les lignes du titre s'écrivent ensuite dans le même sens, l'une après l'autre, comme
 * « Consider it done. » (0,85 s) ; le texte paraît après. Elle reste jusqu'au fondu de la scène.
 * `title` : un tableau de lignes, coupées à la main.
 */
export const Caption: React.FC<{
  title: string[];
  text: string;
  at: number;
  side?: 'left' | 'right';
  width?: number;
  bottom?: number;
  brand?: boolean;
}> = ({title, text, at, side = 'left', width = 600, bottom = 60, brand = false}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const panel = range(f, at, at + 30, 0, 1, E.inOut);
  const t0 = at + (brand ? 34 : 16);
  const line = (k: number) => range(f, t0 + k * 10, t0 + k * 10 + 51, 0, 1, E.inOut);
  const textIn = range(f, t0 + 30 + title.length * 10, t0 + 60 + title.length * 10, 0, 1, E.sine);
  const brandIn = range(f, at + 12, at + 36, 0, 1, E.sine);
  return (
    <div style={{position: 'absolute', [side]: 64, bottom, width}}>
      <div style={{padding: '44px 48px 48px', background: C.white, borderRadius: 2, clipPath: `inset(0 ${((1 - panel) * 100).toFixed(3)}% 0 0)`}}>
        {brand ? <Brand height={46} style={{marginBottom: 36, opacity: brandIn}} /> : null}
        <div style={{...H2, fontSize: 64, color: C.ink}}>
          {title.map((l, k) => (
            <Write key={k} p={line(k)}>
              {l}
            </Write>
          ))}
        </div>
        <div style={{...BODY, marginTop: 22, fontSize: 24, lineHeight: 1.5, color: C.slate, opacity: textIn}}>{text}</div>
      </div>
    </div>
  );
};
