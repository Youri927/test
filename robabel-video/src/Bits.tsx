import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {LIGHT} from './beats.ts';
import {BODY, C, E, F, H, H3, W, range} from './util';

/* ——— La marque : le bloc-nom du site, « Custom Pools » en très serré, « by Rob Abel » dessous ——— */

export const Lockup: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({size, color = C.white, style}) => (
  <div style={{display: 'inline-flex', flexDirection: 'column', lineHeight: 1, color, ...style}}>
    <span style={{fontFamily: F.display, fontWeight: 780, fontSize: size, letterSpacing: '0.002em', whiteSpace: 'nowrap'}}>Custom Pools</span>
    <span style={{fontFamily: F.sans, fontWeight: 600, fontSize: size * 0.42, letterSpacing: '0.01em', marginTop: size * 0.07, opacity: 0.86, whiteSpace: 'nowrap'}}>by Rob Abel</span>
  </div>
);

/* ——— « Lights on » : la scène s'allume en arrivant et s'éteint en partant, comme les lumières de l'accueil du site ——— */

/**
 * Enveloppe d'une scène : allumage sur les `LIGHT.in` premières images (le déclic tombe à `LIGHT.click`),
 * extinction sur les `LIGHT.out` dernières. `on` / `off` à false : la scène s'enchaîne sans passer par le noir.
 */
export const Lights: React.FC<{len: number; on?: boolean; off?: boolean; children: React.ReactNode}> = ({len, on = true, off = true, children}) => {
  const f = useCurrentFrame();
  // allumage : très sombre jusqu'au déclic, puis la lumière monte vite et se pose (comme un spot qui chauffe)
  const up = on ? (f < LIGHT.click ? 0 : E.out(range(f, LIGHT.click, LIGHT.in))) : 1;
  const down = off ? 1 - E.in(range(f, len - LIGHT.out, len)) : 1;
  const k = Math.min(up, down);
  if (k >= 0.999) return <>{children}</>;
  const bright = 0.08 + 0.92 * k;
  const sat = 0.5 + 0.5 * k;
  const scale = 1 + 0.025 * (1 - up);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{filter: `brightness(${bright.toFixed(3)}) saturate(${sat.toFixed(3)})`, transform: `scale(${scale.toFixed(4)})`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ——— Le tuyau : un tube arrondi où l'eau avance (rayures azur qui défilent), comme le circuit du local technique ——— */

export const Pipe: React.FC<{w: number; h?: number; fill: number; tone?: 'light' | 'dark'; style?: React.CSSProperties}> = ({w, h = 12, fill, tone = 'light', style}) => {
  const f = useCurrentFrame();
  const light = tone === 'light';
  return (
    <div
      style={{
        position: 'absolute',
        width: w,
        height: h,
        borderRadius: h,
        overflow: 'hidden',
        background: light ? 'rgba(12, 36, 72, 0.06)' : 'rgba(255, 255, 255, 0.07)',
        boxShadow: light ? 'inset 0 0 0 1.5px rgba(12, 36, 72, 0.22)' : 'inset 0 0 0 1.5px rgba(255, 255, 255, 0.42)',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 2,
          top: 2,
          bottom: 2,
          width: Math.max(0, (w - 4) * fill),
          borderRadius: h,
          backgroundImage: `repeating-linear-gradient(90deg, ${C.azure} 0 18px, rgba(0, 156, 204, 0.42) 18px 30px)`,
          backgroundSize: '60px 100%',
          backgroundPosition: `${(f * 1.6) % 60}px 0`,
        }}
      />
      <div style={{position: 'absolute', left: 6, right: 6, top: 2, height: 2, borderRadius: 2, background: light ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.3)'}} />
    </div>
  );
};

/* ——— Légende : l'eau remplit le tuyau, le panneau se déplie dessous ; elle repart en vidant le tuyau ——— */

export const Caption: React.FC<{
  title: string;
  text: string;
  at: number;
  out: number;
  tone?: 'light' | 'dark';
  side?: 'left' | 'right';
  width?: number;
  bottom?: number;
  /** placée en haut de l'image (distance au bord) au lieu d'en bas */
  top?: number;
}> = ({title, text, at, out, tone = 'light', side = 'left', width = 660, bottom = 60, top}) => {
  const f = useCurrentFrame();
  if (f < at || f > out) return null;
  // entrée : l'eau remplit le tuyau (gauche → droite), puis le panneau se déplie vers le bas, puis le texte monte ;
  // sortie : le texte s'efface, le panneau remonte, l'eau se retire
  const fill = range(f, at, at + 24, 0, 1, E.out) * (1 - range(f, out - 14, out, 0, 1, E.in));
  const open = range(f, at + 12, at + 36, 0, 1, E.out) * (1 - range(f, out - 24, out - 10, 0, 1, E.in));
  const content = range(f, at + 22, at + 48, 0, 1, E.out) * (1 - range(f, out - 28, out - 18));
  const pipeIn = range(f, at - 2, at + 8) * (1 - range(f, out - 6, out));
  const light = tone === 'light';
  return (
    <div style={{position: 'absolute', [side]: 64, ...(top !== undefined ? {top: top + 24} : {bottom}), width}}>
      <div style={{position: 'absolute', left: 0, top: -24, width, height: 12, opacity: pipeIn}}>
        <Pipe w={width} fill={fill} tone={light ? 'light' : 'dark'} />
      </div>
      <div
        style={{
          position: 'relative',
          padding: '26px 34px 30px',
          borderRadius: 14,
          background: light ? C.white : C.navy,
          boxShadow: light ? '0 22px 60px rgba(7, 24, 51, 0.2)' : '0 22px 60px rgba(0, 0, 0, 0.4)',
          clipPath: `inset(0 0 ${(1 - open) * 100}% 0 round 14px)`,
        }}
      >
        <div style={{opacity: content, transform: `translateY(${(1 - content) * 16}px)`}}>
          <div style={{...H3, fontSize: 50, color: light ? C.navy : C.white}}>{title}</div>
          <div style={{...BODY, marginTop: 10, fontSize: 22, lineHeight: 1.45, color: light ? C.inkSoft : 'rgba(255,255,255,.78)'}}>{text}</div>
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
