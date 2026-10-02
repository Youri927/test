import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, E, F, H, W, range} from './util';

/** Légende d'une étape : numéro, titre d'affiche balayé de lumière, phrase */
export const Caption: React.FC<{
  num?: string;
  kicker?: string;
  title: string;
  text?: string;
  at: number;
  out?: number;
  width: number;
  accent?: string;
  size?: number;
  align?: 'left' | 'right';
}> = ({num, kicker, title, text, at, out = 1e6, width, accent = C.tungsten, size = 96, align = 'left'}) => {
  const f = useCurrentFrame();
  const line = range(f, at, at + 26, 0, 1, E.out);
  const rise = range(f, at + 4, at + 34, 1, 0, E.out);
  const sweep = range(f, at + 10, at + 64, 120, -40, E.inOut);
  const body = range(f, at + 20, at + 48, 0, 1, E.out);
  const gone = range(f, out, out + 18, 1, 0, E.inOut);
  return (
    <div style={{width, opacity: gone, textAlign: align}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, flexDirection: align === 'right' ? 'row-reverse' : 'row', marginBottom: 22}}>
        {num ? (
          <span style={{fontFamily: F.stencil, fontWeight: 800, fontSize: 40, lineHeight: 1, color: accent, opacity: line}}>{num}</span>
        ) : null}
        <span style={{height: 2, width: 120, background: accent, transform: `scaleX(${line})`, transformOrigin: align === 'right' ? 'right' : 'left', boxShadow: `0 0 14px ${accent}`}} />
        {kicker ? (
          <span style={{fontFamily: F.body, fontWeight: 600, fontSize: 22, letterSpacing: '0.16em', textTransform: 'uppercase', color: accent, opacity: line}}>{kicker}</span>
        ) : null}
      </div>
      <div style={{overflow: 'hidden', paddingTop: '0.08em', marginTop: '-0.08em'}}>
        <div
          style={{
            fontFamily: F.display,
            fontWeight: 800,
            fontSize: size,
            lineHeight: 0.92,
            textTransform: 'uppercase',
            letterSpacing: '0.005em',
            transform: `translateY(${rise * 105}%)`,
            backgroundImage: `linear-gradient(100deg, ${C.chalk} 0%, ${C.chalk} 40%, ${accent} 50%, ${C.chalk} 60%, ${C.chalk} 100%)`,
            backgroundSize: '250% 100%',
            backgroundPosition: `${sweep}% 0`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            whiteSpace: 'pre-line',
          }}
        >
          {title}
        </div>
      </div>
      {text ? (
        <p
          style={{
            margin: '26px 0 0',
            fontFamily: F.body,
            fontWeight: 400,
            fontSize: 29,
            lineHeight: 1.45,
            color: C.mist,
            opacity: body,
            transform: `translateY(${(1 - body) * 18}px)`,
          }}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
};

/** Mur d'encre : léger relief et halo de lumière */
export const Wall: React.FC<{glow?: string; gx?: number; gy?: number; strength?: number}> = ({glow = C.tungsten, gx = 50, gy = 50, strength = 0.1}) => (
  <AbsoluteFill style={{background: C.ink}}>
    <AbsoluteFill style={{background: `radial-gradient(60% 70% at ${gx}% ${gy}%, ${glow}, transparent 70%)`, opacity: strength}} />
    <svg width={W} height={H} style={{position: 'absolute', opacity: 0.18, mixBlendMode: 'soft-light'}}>
      <filter id="wallnoise">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves={4} seed={7} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={W} height={H} filter="url(#wallnoise)" />
    </svg>
  </AbsoluteFill>
);

/** Vignettage + grain, par-dessus toute la vidéo */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(85% 85% at 50% 50%, transparent 58%, rgba(0, 0, 0, 0.5) 100%)'}} />
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.075, mixBlendMode: 'overlay'}}>
        <filter id="presgrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(f / 2) % 8} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter="url(#presgrain)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Logotype L'ANTRE 2 JEUX (le 2 en pochoir) */
export const Wordmark: React.FC<{size: number; color?: string; two?: string}> = ({size, color = C.chalk, two = C.tungsten}) => (
  <div style={{display: 'inline-flex', alignItems: 'baseline', gap: '0.16em', fontFamily: F.display, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: '0.02em', textTransform: 'uppercase', color}}>
    <span>L’Antre</span>
    <span style={{fontFamily: F.stencil, fontWeight: 900, color: two}}>2</span>
    <span>Jeux</span>
  </div>
);

/** Fente de lumière verticale (une porte entrouverte) */
export const Slit: React.FC<{x: number; y: number; h: number; open: number; color?: string; opacity?: number}> = ({x, y, h, open, color = C.tungsten, opacity = 1}) => (
  <div style={{position: 'absolute', left: x, top: y - h / 2, width: 0, height: h, opacity}}>
    <div style={{position: 'absolute', left: -2 - open / 2, width: 4 + open, top: 0, bottom: 0, background: color, boxShadow: `0 0 40px ${color}, 0 0 120px ${color}`}} />
  </div>
);
