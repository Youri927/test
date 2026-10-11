import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {LIGHT} from './beats.ts';
import {BODY, C, E, H, H3, W, range} from './util';

/* ——— Leur logo (version pour fond sombre, sans son fond bleu nuit) ——— */
export const Logo: React.FC<{height: number; style?: React.CSSProperties}> = ({height, style}) => (
  <Img src={staticFile('hero/logo.png')} style={{height, width: 'auto', display: 'block', ...style}} />
);

/* ——— Leur photo de l'accueil, en plein cadre, avec un lent mouvement ——— */
export const Photo: React.FC<{zoom: number; shade: number}> = ({zoom, shade}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Img src={staticFile('hero/hero.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom.toFixed(4)})`}} />
    {/* un voile depuis la gauche : le logo et le texte se lisent sur les pavés */}
    <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(5,42,48,${(0.86 * shade).toFixed(3)}) 0%, rgba(5,42,48,${(0.55 * shade).toFixed(3)}) 48%, rgba(5,42,48,${(0.1 * shade).toFixed(3)}) 100%)`}} />
  </AbsoluteFill>
);

/**
 * Enveloppe d'une scène : elle sort du noir sur ses `LIGHT.in` premières images et y retourne sur les `LIGHT.out` dernières.
 * `on` / `off` à false : pas de fondu de ce côté (l'ouverture sort du noir à sa façon, la fin s'y fond).
 */
export const Lights: React.FC<{len: number; on?: boolean; off?: boolean; children: React.ReactNode}> = ({len, on = true, off = true, children}) => {
  const f = useCurrentFrame();
  const up = on ? E.out(range(f, 0, LIGHT.in)) : 1;
  const down = off ? 1 - E.in(range(f, len - LIGHT.out, len)) : 1;
  const k = Math.min(up, down);
  if (k >= 0.999) return <>{children}</>;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: k, transform: `scale(${(1 + 0.02 * (1 - up)).toFixed(4)})`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ——— Légende : le panneau se déplie depuis le bas, le texte monte ; elle repart dans l'autre sens ——— */
export const Caption: React.FC<{
  title: string;
  text: string;
  at: number;
  out: number;
  tone?: 'light' | 'dark';
  side?: 'left' | 'right';
  width?: number;
  bottom?: number;
}> = ({title, text, at, out, tone = 'light', side = 'left', width = 600, bottom = 60}) => {
  const f = useCurrentFrame();
  if (f < at || f > out) return null;
  const open = range(f, at, at + 22, 0, 1, E.out) * (1 - range(f, out - 16, out, 0, 1, E.in));
  const content = range(f, at + 8, at + 34, 0, 1, E.out) * (1 - range(f, out - 22, out - 8));
  const light = tone === 'light';
  return (
    <div style={{position: 'absolute', [side]: 64, bottom, width}}>
      <div
        style={{
          padding: '32px 38px 36px',
          borderRadius: 24,
          background: light ? C.white : C.ink,
          boxShadow: light ? '0 22px 60px rgba(5, 42, 48, 0.18)' : '0 22px 60px rgba(0, 0, 0, 0.4)',
          clipPath: `inset(${((1 - open) * 100).toFixed(2)}% 0 0 0 round 24px)`,
        }}
      >
        <div style={{opacity: content, transform: `translateY(${((1 - content) * 18).toFixed(2)}px)`}}>
          <div style={{...H3, fontSize: 40, color: light ? C.ink : C.white}}>{title}</div>
          <div style={{...BODY, marginTop: 14, fontSize: 23, lineHeight: 1.45, color: light ? C.muted : 'rgba(255,255,255,.8)'}}>{text}</div>
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

/** Captures fixes du site qui se succèdent en fondu : [fichier de public/stills, image de la scène où elle arrive] */
export const Stills: React.FC<{list: [string, number][]; fade?: number}> = ({list, fade = 18}) => {
  const f = useCurrentFrame();
  return (
    <>
      {list.map(([name, at], i) => {
        const o = i === 0 ? 1 : range(f, at, at + fade, 0, 1, E.sine);
        if (o <= 0) return null;
        return <Img key={name} src={staticFile(`stills/${name}.jpg`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: o}} />;
      })}
    </>
  );
};
