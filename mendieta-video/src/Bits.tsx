import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {LIGHT} from './beats.ts';
import {BODY, C, E, F, H2, range} from './util';

/**
 * La marque du site : le blason (l'image du site), puis « Mendieta » en gras et « Roofing Corp. » en maigre, comme
 * l'en-tête. `dark` : le blason inversé et le nom en blanc, comme le pied de page.
 */
export const Brand: React.FC<{size: number; dark?: boolean; style?: React.CSSProperties}> = ({size, dark = false, style}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * 0.5, ...style}}>
    <Img src={staticFile(`img/${dark ? 'crest-rev' : 'crest'}.png`)} style={{width: size * 2.35, height: 'auto', display: 'block'}} />
    <div style={{fontFamily: F.sans, fontSize: size, lineHeight: 1, color: dark ? C.white : C.ink, whiteSpace: 'nowrap'}}>
      <span style={{fontWeight: 780, fontStretch: '112%'}}>Mendieta</span>
      <span style={{fontWeight: 420, fontStretch: '100%'}}> Roofing Corp.</span>
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
 * Légende : le panneau blanc se découvre depuis le bas (comme la photo de l'accueil du site), le texte monte ;
 * elle repart dans l'autre sens. Un court trait jaune au-dessus du titre, comme sur l'image de partage du site.
 */
export const Caption: React.FC<{
  title: string;
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
  const open = range(f, at, at + 22, 0, 1, E.out) * (1 - range(f, out - 16, out, 0, 1, E.in));
  const content = range(f, at + 8, at + 34, 0, 1, E.out) * (1 - range(f, out - 22, out - 8));
  const bar = range(f, at + 14, at + 40, 0, 1, E.out);
  return (
    <div style={{position: 'absolute', [side]: 64, bottom, width}}>
      <div
        style={{
          padding: '42px 46px 46px',
          background: C.white,
          boxShadow: '0 22px 60px rgba(11, 27, 77, 0.14)',
          clipPath: `inset(${((1 - open) * 100).toFixed(2)}% 0 0 0)`,
        }}
      >
        <div style={{opacity: content, transform: `translateY(${((1 - content) * 18).toFixed(2)}px)`}}>
          {brand ? <Brand size={30} style={{marginBottom: 36}} /> : null}
          <div style={{width: 64 * bar, height: 6, background: C.sun, marginBottom: 26}} />
          <div style={{...H2, fontSize: 50, color: C.ink, textWrap: 'balance'}}>{title}</div>
          <div style={{...BODY, marginTop: 18, fontSize: 24, lineHeight: 1.45, color: C.ink2}}>{text}</div>
        </div>
      </div>
    </div>
  );
};

/** Une ligne qui monte derrière son cache, comme le titre de l'accueil du site */
export const Line: React.FC<{shift: number; style?: React.CSSProperties; children: React.ReactNode}> = ({shift, style, children}) => (
  <div style={{overflow: 'hidden', padding: '0.08em 0.14em 0.14em 0', margin: '-0.08em -0.14em -0.14em 0'}}>
    <div style={{transform: `translateY(${shift}%)`, ...style}}>{children}</div>
  </div>
);
