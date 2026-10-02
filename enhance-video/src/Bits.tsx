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
        position: 'absolute', ...(right ? {right: 72} : {left: 72}), bottom: 64, maxWidth: 740,
        padding: '26px 32px 28px', borderRadius: 10,
        background: dark ? 'rgba(22, 21, 26, 0.88)' : 'rgba(255, 255, 255, 0.94)',
        boxShadow: dark ? '0 0 0 1px rgba(241,239,234,.12), 0 18px 50px rgba(0,0,0,.35)' : `0 0 0 1px ${C.line}, 0 18px 50px rgba(23, 22, 26, 0.14)`,
        backdropFilter: 'blur(10px)',
        color: dark ? '#F1EFEA' : C.ink,
        opacity: a * gone,
        transform: `translateY(${(1 - a) * 22}px)`,
      }}
    >
      {tag ? (
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, fontFamily: F.body, fontWeight: 500, fontSize: 21, color: dark ? C.accentHi : C.accent}}>
          <span style={{width: 28, height: 1.5, background: 'currentColor'}} />
          {tag}
        </div>
      ) : null}
      <div style={{fontFamily: F.display, fontWeight: 300, fontSize: 50, lineHeight: 1.04, letterSpacing: '-0.02em'}}>{title}</div>
      <div style={{marginTop: 12, fontFamily: F.body, fontSize: 24, lineHeight: 1.45, color: dark ? 'rgba(241,239,234,.74)' : C.grey, opacity: b}}>{text}</div>
    </div>
  );
};

/** Fond : le papier du site, un très léger halo */
export const Wall: React.FC<{tint?: string}> = ({tint = C.bg}) => (
  <AbsoluteFill style={{background: tint}}>
    <AbsoluteFill style={{background: 'radial-gradient(70% 80% at 50% 40%, rgba(255,255,255,.6), transparent 70%)'}} />
  </AbsoluteFill>
);

/** Vignette et grain très légers, par-dessus toute la vidéo */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(90% 90% at 50% 50%, transparent 64%, rgba(23, 22, 26, 0.12) 100%)'}} />
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.045, mixBlendMode: 'overlay'}}>
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
 * La transition de la vidéo : une feuille de papier qui monte (ou se retire) comme un calque,
 * bordée d'un filet bleu d'encre. level 0 = rien, 1 = l'écran est couvert.
 */
export const Sheet: React.FC<{level: number; tint?: string}> = ({level, tint = C.bg}) => {
  if (level <= 0.001) return null;
  const top = H * (1 - level);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top, bottom: 0, background: tint, boxShadow: '0 -30px 60px rgba(23, 22, 26, 0.12)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top, height: 2, background: C.accent, opacity: level < 0.999 ? 0.9 : 0}} />
    </AbsoluteFill>
  );
};
