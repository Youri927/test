import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, E, F, H, MONO, W, range} from './util';

/** Légende en bas : intitulé, titre, phrase. Elle reste fixe pendant les mouvements de caméra. */
export const LowerThird: React.FC<{tag?: string; title: string; text: string; at?: number; out: number; dark?: boolean; right?: boolean}> = ({tag, title, text, at = 18, out, dark = false, right = false}) => {
  const f = useCurrentFrame();
  const a = range(f, at, at + 34, 0, 1, E.out);
  const b = range(f, at + 14, at + 50, 0, 1, E.out);
  const gone = range(f, out - 24, out, 1, 0, E.inOut);
  return (
    <div
      style={{
        position: 'absolute', ...(right ? {right: 72} : {left: 72}), bottom: 64, maxWidth: 700,
        padding: '26px 32px 28px', borderRadius: 18,
        background: dark ? 'rgba(10, 42, 53, 0.94)' : 'rgba(251, 251, 249, 0.96)',
        boxShadow: dark ? '0 0 0 1px rgba(242,243,239,.12), 0 18px 50px rgba(0,0,0,.35)' : `0 0 0 1px ${C.line}, 0 18px 50px rgba(8, 40, 52, 0.16)`,
        color: dark ? C.cream : C.ink,
        opacity: a * gone,
        transform: `translateY(${(1 - a) * 22}px)`,
      }}
    >
      {tag ? (
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, ...MONO, fontSize: 16, color: dark ? C.aqua : C.accent}}>
          {tag}
          <span style={{width: 28, height: 1.5, background: 'currentColor', opacity: 0.7}} />
        </div>
      ) : null}
      <div style={{...DISPLAY, fontWeight: 620, fontStretch: '82%', fontSize: 56, lineHeight: 0.98, letterSpacing: '-0.026em'}}>{title}</div>
      <div style={{marginTop: 14, fontFamily: F.body, fontSize: 23, lineHeight: 1.45, color: dark ? 'rgba(242,243,239,.74)' : C.grey, opacity: b}}>{text}</div>
    </div>
  );
};

/** Fond : le blanc d'enduit du site, avec une lumière douce */
export const Wall: React.FC<{tint?: string}> = ({tint = C.bg}) => (
  <AbsoluteFill style={{background: tint}}>
    <AbsoluteFill style={{background: 'radial-gradient(70% 80% at 50% 40%, rgba(255,255,255,.55), transparent 70%)'}} />
  </AbsoluteFill>
);

/** Vignette et grain très légers, par-dessus toute la vidéo */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(90% 90% at 50% 50%, transparent 66%, rgba(8, 40, 52, 0.12) 100%)'}} />
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
 * La transition de la vidéo : l'eau monte et couvre l'écran, avec une ligne d'eau qui ondule,
 * puis redescend sur la scène suivante. level 0 = rien, 1 = l'écran est couvert.
 */
export const Sheet: React.FC<{level: number}> = ({level}) => {
  const f = useCurrentFrame();
  if (level <= 0.001) return null;
  const top = H * (1 - level) - 24 * (1 - level);
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 24) {
    const y = top + 7 * Math.sin(x / 150 + f / 9) + 3.5 * Math.sin(x / 61 - f / 6);
    pts.push(`${x},${y.toFixed(1)}`);
  }
  const crest = `M${pts.join(' L')}`;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="sheet-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9EDCDE" />
            <stop offset="1" stopColor="#4FB7C2" />
          </linearGradient>
        </defs>
        <path d={`${crest} L${W},${H + 40} L0,${H + 40} Z`} fill="url(#sheet-water)" />
        {level < 0.999 ? <path d={crest} fill="none" stroke="rgba(255,255,255,.9)" strokeWidth={2.5} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

/** Le logo redessiné du site : le bassin et le soleil */
export const Mark: React.FC<{size: number; dark?: boolean}> = ({size, dark = false}) => (
  <svg width={size} height={(size * 30) / 40} viewBox="0 0 40 30" style={{display: 'block'}}>
    <path d="M3 18.5c0-4.6 3.4-7.6 7.8-7.6 2.6 0 3.6 1.3 5.4 1.3 1.9 0 3-1.6 5.8-1.6 4.4 0 7 3.2 7 7.3 0 4.3-3.2 7.3-7.6 7.3-3 0-4.2-1.4-6.4-1.4-2.3 0-3.6 1.6-7.4 1.6C5.7 25.4 3 22.6 3 18.5z" fill={C.aqua} stroke={dark ? C.cream : C.ink} strokeWidth={1.6} />
    <circle cx="9.5" cy="9.5" r="5" fill={C.accent} />
  </svg>
);

/** Le même bassin avant et après, comparé par un trait (pos : 0 à 100, part de l'ancien fond à gauche) */
export const Compare: React.FC<{w: number; h: number; pos: number; radius?: number; knob?: boolean}> = ({w, h, pos, radius = 26, knob = true}) => (
  <div style={{position: 'relative', width: w, height: h, borderRadius: radius, overflow: 'hidden', boxShadow: '0 30px 80px -30px rgba(8, 40, 52, 0.45)'}}>
    <Img src={staticFile('img/hero-after.webp')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
    <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - pos}% 0 0)`}}>
      <Img src={staticFile('img/hero-before.webp')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
    <div style={{position: 'absolute', top: 0, bottom: 0, left: `${pos}%`, width: 2.5, marginLeft: -1.25, background: C.paper, boxShadow: '0 0 20px rgba(8,40,52,.35)'}} />
    {knob ? (
      <div style={{position: 'absolute', top: '50%', left: `${pos}%`, width: 64, height: 64, margin: '-32px 0 0 -32px', borderRadius: '50%', background: C.paper, display: 'grid', placeItems: 'center', boxShadow: '0 12px 30px -10px rgba(8,40,52,.55)'}}>
        <svg width={26} height={26} viewBox="0 0 24 24"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" fill="none" stroke={C.ink} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    ) : null}
    <div style={{position: 'absolute', left: 20, bottom: 20, padding: '9px 14px', borderRadius: 999, background: 'rgba(242,243,239,.92)', ...MONO, fontSize: 13, color: C.ink, opacity: Math.min(1, (pos - 12) / 10)}}>Before</div>
    <div style={{position: 'absolute', right: 20, bottom: 20, padding: '9px 14px', borderRadius: 999, background: C.ink, ...MONO, fontSize: 13, color: C.paper, opacity: Math.min(1, (88 - pos) / 10)}}>After</div>
  </div>
);
