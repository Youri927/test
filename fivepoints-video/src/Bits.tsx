import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {LIGHT} from './beats.ts';
import logo from './logo.json';
import {BODY, C, E, H2, range} from './util';

/**
 * L'étoile du logo, redessinée en vecteurs pour le site (tools/logo.py du site) : le chevron du haut (un toit) et la
 * branche de droite à l'encre, la barre, la branche de gauche et le « 5 » en or, le « 5 » détouré de la couleur du fond.
 * Ses chemins, dans une boîte de 100 × 88 (y de 6 à 94).
 */
export const StarPaths: React.FC<{ink: string; bg: string}> = ({ink, bg}) => (
  <>
    <path d={logo.mark.roof} fill={ink} fillRule="evenodd" />
    <path d={logo.mark.bar} fill={C.gold} />
    <path d={logo.mark.right} fill={ink} fillRule="evenodd" />
    <path d={logo.mark.left} fill={C.gold} fillRule="evenodd" />
    <path d={logo.mark.five} fill={C.gold} stroke={bg} strokeWidth={2.2} paintOrder="stroke" strokeLinejoin="round" />
  </>
);

/** Le logo complet, comme l'en-tête du site : l'étoile, puis « FIVE POINTS ROOFING » (POINTS en or). `dark` : sur l'asphalte. */
export const Brand: React.FC<{height: number; dark?: boolean; style?: React.CSSProperties}> = ({height, dark = false, style}) => {
  const w = logo.word;
  const ink = dark ? C.membrane : C.asphalt;
  const bg = dark ? C.asphalt : C.white;
  const vw = 114 + w.w;
  return (
    <svg width={(height * vw) / 88} height={height} viewBox={`0 6 ${vw.toFixed(1)} 88`} style={{display: 'block', flex: 'none', ...style}}>
      <StarPaths ink={ink} bg={bg} />
      <g transform={`translate(114 ${(50 - w.h / 2).toFixed(2)})`}>
        <path d={w.five} fill={ink} />
        <path d={w.points} fill={C.gold} />
        <path d={w.roofing} fill={ink} />
      </g>
    </svg>
  );
};

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

/** Une ligne qui monte derrière sa ligne de base */
export const Line: React.FC<{shift: number; style?: React.CSSProperties; children: React.ReactNode}> = ({shift, style, children}) => (
  <div style={{overflow: 'hidden', padding: '0.08em 0.14em 0.16em 0', margin: '-0.08em -0.14em -0.16em 0'}}>
    <div style={{transform: `translateY(${shift.toFixed(3)}%)`, ...style}}>{children}</div>
  </div>
);

/**
 * Découverte à la pente d'un toit, comme les photos du site : un bord en biais à 6/12 (il descend de la moitié de la
 * largeur `w`, en px) qui monte du bas de la boîte jusqu'au-dessus de son haut. `p` de 0 (rien) à 1 (tout).
 */
export const slope = (p: number, w: number) => {
  const k = w / 2;
  return `polygon(0 calc((100% + ${k}px) * ${(1 - p).toFixed(4)}), 100% calc(100% - (100% + ${k}px) * ${p.toFixed(4)}), 100% 100%, 0 100%)`;
};

/**
 * Légende : le panneau blanc se découvre à la pente d'un toit, comme les photos du site ; les lignes du titre montent
 * derrière leur ligne de base, une à une ; le texte suit. Elle repart dans l'autre sens.
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
  const open = range(f, at, at + 40, 0, 1, E.out) * (1 - range(f, out - 18, out, 0, 1, E.in));
  const leave = 1 - range(f, out - 22, out - 8);
  const rise = (k: number) => range(f, at + 12 + k * 5, at + 12 + k * 5 + 40, 104, 0, E.out);
  const textIn = range(f, at + 26 + title.length * 5, at + 54 + title.length * 5, 0, 1, E.out) * leave;
  const brandIn = range(f, at + 8, at + 34, 0, 1, E.out) * leave;
  return (
    <div style={{position: 'absolute', [side]: 64, bottom, width}}>
      <div style={{padding: '44px 48px 48px', background: C.white, clipPath: slope(open, width)}}>
        {brand ? <Brand height={44} style={{marginBottom: 38, opacity: brandIn}} /> : null}
        <div style={{...H2, fontSize: 62, color: C.asphalt, opacity: leave}}>
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
