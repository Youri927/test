import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, E, F, H, W, range} from './util';

/** Légende en bas : intitulé, titre, phrase. Elle reste fixe pendant les mouvements de caméra. */
export const LowerThird: React.FC<{tag?: string; title: string; text: string; at?: number; out: number; dark?: boolean; right?: boolean}> = ({tag, title, text, at = 18, out, dark = false, right = false}) => {
  const f = useCurrentFrame();
  const a = range(f, at, at + 34, 0, 1, E.out);
  const b = range(f, at + 14, at + 50, 0, 1, E.out);
  const gone = range(f, out - 24, out, 1, 0, E.inOut);
  return (
    <div
      style={{
        position: 'absolute', ...(right ? {right: 72} : {left: 72}), bottom: 64, maxWidth: 720,
        padding: '26px 32px 28px', borderRadius: 6,
        background: dark ? 'rgba(16, 19, 22, 0.9)' : 'rgba(251, 248, 242, 0.95)',
        boxShadow: dark ? '0 0 0 1px rgba(241,234,223,.12), 0 18px 50px rgba(0,0,0,.35)' : `0 0 0 1px ${C.line}, 0 18px 50px rgba(27, 25, 21, 0.16)`,
        color: dark ? C.cream : C.ink,
        opacity: a * gone,
        transform: `translateY(${(1 - a) * 22}px)`,
      }}
    >
      {tag ? (
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, fontFamily: F.body, fontWeight: 600, fontSize: 17, letterSpacing: '0.16em', textTransform: 'uppercase', fontVariationSettings: '"wdth" 118', color: dark ? C.accentHi : C.accent}}>
          <span style={{width: 28, height: 1.5, background: 'currentColor'}} />
          {tag}
        </div>
      ) : null}
      <div style={{fontFamily: F.display, fontWeight: 400, fontSize: 54, lineHeight: 1, letterSpacing: '-0.012em'}}>{title}</div>
      <div style={{marginTop: 14, fontFamily: F.body, fontSize: 23, lineHeight: 1.45, color: dark ? 'rgba(241,234,223,.74)' : C.grey, opacity: b}}>{text}</div>
    </div>
  );
};

/** Fond : le sable du site, avec (au choix) les ombres de pergola qui glissent lentement */
export const Wall: React.FC<{tint?: string; slats?: number}> = ({tint = C.bg, slats = 0}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: tint}}>
      <AbsoluteFill style={{background: 'radial-gradient(70% 80% at 50% 40%, rgba(255,255,255,.35), transparent 70%)'}} />
      {slats > 0 ? (
        <div
          style={{
            position: 'absolute', inset: '-20% -10%', opacity: 0.42 * slats, mixBlendMode: 'multiply',
            background: 'repeating-linear-gradient(104deg, transparent 0 26px, rgba(96, 70, 40, .06) 40px, rgba(96, 70, 40, .18) 54px, rgba(96, 70, 40, .26) 66px, rgba(96, 70, 40, .18) 78px, rgba(96, 70, 40, .06) 92px, transparent 106px)',
            backgroundPosition: `${f * 0.35}px 0`,
            WebkitMaskImage: 'radial-gradient(120% 80% at 70% 35%, #000 20%, transparent 72%)',
            transform: 'skewY(-4deg)',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/** Vignette et grain très légers, par-dessus toute la vidéo */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(90% 90% at 50% 50%, transparent 64%, rgba(27, 25, 21, 0.13) 100%)'}} />
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.05, mixBlendMode: 'overlay'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(f / 2) % 8} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * La transition de la vidéo : un pan de sable qui monte comme un store, bordé d'un filet de terre cuite.
 * level 0 = rien, 1 = l'écran est couvert.
 */
export const Sheet: React.FC<{level: number; tint?: string}> = ({level, tint = C.bg}) => {
  if (level <= 0.001) return null;
  const top = H * (1 - level);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top, bottom: 0, background: tint, boxShadow: '0 -30px 60px rgba(27, 25, 21, 0.14)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top, height: 2, background: C.accent, opacity: level < 0.999 ? 0.9 : 0}} />
    </AbsoluteFill>
  );
};

/** Le monogramme du site : un soleil posé sur l'horizon */
export const Mark: React.FC<{size: number; color?: string}> = ({size, color = C.ink}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{display: 'block'}}>
    <circle cx="20" cy="17" r="10.5" fill="none" stroke={color} strokeWidth={1.4} />
    <path d="M4 28.5h32M9.5 33.5h21" fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
  </svg>
);
