import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, E, F, H, W, range} from './util';

/** Légende en bas à gauche : étape, titre, phrase. Elle reste fixe pendant les mouvements de caméra. */
export const LowerThird: React.FC<{tag?: string; title: string; text: string; at?: number; out: number; dark?: boolean; right?: boolean}> = ({tag, title, text, at = 18, out, dark = false, right = false}) => {
  const f = useCurrentFrame();
  const a = range(f, at, at + 34, 0, 1, E.out);
  const b = range(f, at + 14, at + 50, 0, 1, E.out);
  const gone = range(f, out - 24, out, 1, 0, E.inOut);
  return (
    <div
      style={{
        position: 'absolute', ...(right ? {right: 72} : {left: 72}), bottom: 64, maxWidth: 760,
        padding: '26px 34px 28px',
        borderRadius: 14,
        background: dark ? 'rgba(8, 23, 28, 0.82)' : 'rgba(246, 248, 247, 0.9)',
        boxShadow: '0 18px 60px rgba(8, 23, 28, 0.18)',
        backdropFilter: 'blur(10px)',
        color: dark ? C.ecume : C.encre,
        opacity: a * gone,
        transform: `translateY(${(1 - a) * 24}px)`,
      }}
    >
      {tag ? (
        <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, fontFamily: F.body, fontWeight: 600, fontSize: 22, fontStretch: '100%', color: dark ? C.lagon : C.bassin}}>
          <span style={{width: 34, height: 2, background: 'currentColor'}} />
          {tag}
        </div>
      ) : null}
      <div style={{fontFamily: F.display, fontWeight: 300, fontStretch: '122%', fontSize: 52, lineHeight: 1.02, letterSpacing: '-0.02em'}}>{title}</div>
      <div style={{marginTop: 12, fontFamily: F.body, fontWeight: 400, fontSize: 25, lineHeight: 1.45, color: dark ? 'rgba(246,248,247,.8)' : C.gris, opacity: b}}>{text}</div>
    </div>
  );
};

/** Fond : la pierre, un très léger halo */
export const Wall: React.FC<{tint?: string}> = ({tint = C.calcaire}) => (
  <AbsoluteFill style={{background: tint}}>
    <AbsoluteFill style={{background: 'radial-gradient(70% 80% at 50% 40%, rgba(255,255,255,.45), transparent 70%)'}} />
  </AbsoluteFill>
);

/** Grain très léger, par-dessus toute la vidéo */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(90% 90% at 50% 50%, transparent 62%, rgba(8, 23, 28, 0.16) 100%)'}} />
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

/** Surface d'eau : un ruban ondulant (vu de profil) */
export const surfacePath = (w: number, f: number, amp = 6, period = 360) => {
  let d = '';
  for (let x = -40; x <= w + 40; x += 20) {
    const y = Math.sin(((x + f * 1.6) / period) * Math.PI * 2) * amp + Math.sin(((x - f * 1.1) / (period / 2.3)) * Math.PI * 2 + 1.2) * amp * 0.35;
    d += `${x === -40 ? 'M' : 'L'}${x} ${y.toFixed(2)}`;
  }
  return d;
};

/** L'eau qui monte (ou descend) sur tout l'écran : la transition de la vidéo. level 0 = vide, 1 = plein */
export const WaterWipe: React.FC<{level: number}> = ({level}) => {
  const f = useCurrentFrame();
  if (level <= 0.001) return null;
  const top = H * (1 - level);
  const d = surfacePath(W, f, 9, 420);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top, bottom: 0, background: 'linear-gradient(180deg, #0E7C86 0%, #0B6B74 25%, #08474F 75%, #063339 100%)'}} />
      <svg width={W} height={40} viewBox={`0 -20 ${W} 40`} style={{position: 'absolute', left: 0, top: top - 20, overflow: 'visible'}}>
        <path d={`${d}L${W + 40} 40L-40 40Z`} fill="#0E7C86" />
        <path d={d} fill="none" stroke="#E9FFFC" strokeWidth={2} opacity={0.85} />
      </svg>
    </AbsoluteFill>
  );
};
