import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {LIGHT} from './beats.ts';
import logo from './logo.json';
import {BODY, C, E, H2, range} from './util';

type Piece = 'emblem' | 'word' | 'line';
const P = logo as Record<Piece, {w: number; h: number; d: string}>;

/** Une pièce du logo, vectorisée depuis leurs fichiers publiés (tools/logo.py du site) : l'emblème, « ZYNDA », la ligne */
export const LogoPiece: React.FC<{piece: Piece; height: number; color?: string; style?: React.CSSProperties}> = ({piece, height, color = C.ink, style}) => (
  <svg width={(height * P[piece].w) / P[piece].h} height={height} viewBox={`0 0 ${P[piece].w} ${P[piece].h}`} style={{display: 'block', flex: 'none', ...style}}>
    <path d={P[piece].d} fill={color} fillRule="evenodd" />
  </svg>
);

/** Le logo, comme l'en-tête du site : l'emblème rond, puis le mot « ZYNDA » (98 px de large pour 40 px d'emblème) */
export const Brand: React.FC<{height: number; color?: string; style?: React.CSSProperties}> = ({height, color = C.ink, style}) => {
  const wordW = height * 2.45;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: height * 0.3, ...style}}>
      <LogoPiece piece="emblem" height={height} color={color} />
      <LogoPiece piece="word" height={(wordW * P.word.h) / P.word.w} color={color} />
    </div>
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

/**
 * Une ligne qui monte de son masque, comme les titres du site : le texte part de 108 % de sa hauteur sous la ligne
 * (`p` de 0 à 1, à mener sur la courbe --ease du site). Le masque déborde un peu en haut et en bas de la ligne, pour ne
 * couper ni les capitales ni les jambages une fois la ligne en place.
 */
export const Rise: React.FC<{p: number; style?: React.CSSProperties; children: React.ReactNode}> = ({p, style, children}) => (
  <div style={{overflow: 'hidden', paddingTop: '0.06em', marginTop: '-0.06em', paddingBottom: '0.1em', marginBottom: '-0.1em', ...style}}>
    <div style={{transform: `translate3d(0, ${((1 - p) * 108).toFixed(3)}%, 0)`}}>{children}</div>
  </div>
);

/** Progression d'une ligne qui monte à l'image `at` (1,1 s, la courbe --ease du site) */
export const rise = (f: number, at: number) => range(f, at, at + 66, 0, 1, E.out);

/**
 * Légende, dans le mouvement du site : le panneau blanc se découvre de bas en haut, comme ses photos (un volet de la
 * couleur du fond se retire vers le haut, 0,7 s) ; les lignes du titre montent ensuite de leur masque, l'une après
 * l'autre (90 ms d'écart, comme les titres du site) ; le texte paraît après. Elle reste jusqu'au fondu de la scène.
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
  const cover = range(f, at, at + 42, 1, 0, E.inOut);
  const t0 = at + (brand ? 30 : 16);
  const textIn = range(f, t0 + 26 + title.length * 6, t0 + 80 + title.length * 6, 0, 1, E.out);
  const brandIn = range(f, at + 16, at + 60, 0, 1, E.out);
  return (
    <div style={{position: 'absolute', [side]: 64, bottom, width}}>
      <div style={{position: 'relative', padding: '46px 50px 50px', background: C.paper}}>
        {brand ? <Brand height={50} style={{marginBottom: 36, opacity: brandIn}} /> : null}
        <div style={{...H2, fontSize: 66, color: C.ink}}>
          {title.map((l, k) => (
            <Rise key={k} p={rise(f, t0 + k * 6)}>
              {l}
            </Rise>
          ))}
        </div>
        <div style={{...BODY, marginTop: 24, fontSize: 24, lineHeight: 1.5, color: C.vein, opacity: textIn}}>{text}</div>
        <div style={{position: 'absolute', inset: 0, background: C.stage, transformOrigin: '50% 0', transform: `scaleY(${cover.toFixed(4)})`}} />
      </div>
    </div>
  );
};
