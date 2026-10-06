import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {TOOTH_D, TOOTH_VIEWBOX} from './tooth';
import {C, DISPLAY, E, F, H, LABEL, W, range} from './util';

/** La dent du logo Cameron (tracé fidèle de leur fichier) */
export const Tooth: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({size, color = C.azure, style}) => (
  <svg width={(size * 269) / 372} height={size} viewBox={TOOTH_VIEWBOX} style={{flex: 'none', display: 'block', ...style}}>
    <path d={TOOTH_D} fill={color} fillRule="evenodd" />
  </svg>
);

/** Le logo : la dent et le nom sur deux lignes, comme dans l'en-tête du site */
export const Logo: React.FC<{size: number; dark?: boolean}> = ({size, dark = false}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * 0.26}}>
    <Tooth size={size} color={dark ? C.light : C.azure} />
    <div style={{...DISPLAY, fontSize: size * 0.42, lineHeight: 0.98, letterSpacing: '-0.02em', color: dark ? C.paper : C.ink}}>
      Cameron<br />Dental Studio
    </div>
  </div>
);

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
        padding: '28px 34px 30px', borderRadius: 14,
        background: dark ? 'rgba(14, 34, 51, 0.96)' : 'rgba(255, 255, 255, 0.97)',
        boxShadow: dark ? '0 0 0 1px rgba(255,255,255,.12), 0 18px 50px rgba(0,0,0,.35)' : `0 0 0 1px ${C.line}, 0 18px 50px rgba(14, 34, 51, 0.16)`,
        color: dark ? C.paper : C.ink,
        opacity: a * gone,
        transform: `translateY(${(1 - a) * 22}px)`,
      }}
    >
      {tag ? (
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, ...LABEL, fontSize: 19}}>
          <Tooth size={24} color={dark ? C.light : C.azure} />
          <span style={{color: dark ? C.light : C.blue}}>{tag}</span>
        </div>
      ) : null}
      <div style={{...DISPLAY, fontSize: 54, lineHeight: 0.98}}>{title}</div>
      <div style={{marginTop: 14, fontFamily: F.body, fontSize: 23, lineHeight: 1.45, color: dark ? 'rgba(255,255,255,.74)' : C.grey, opacity: b}}>{text}</div>
    </div>
  );
};

/** Fond : un blanc bleuté très doux */
export const Wall: React.FC<{tint?: string}> = ({tint = C.bg}) => (
  <AbsoluteFill style={{background: tint}}>
    <AbsoluteFill style={{background: 'radial-gradient(70% 80% at 50% 40%, rgba(255,255,255,.65), transparent 70%)'}} />
  </AbsoluteFill>
);

/** Vignette et grain très légers, par-dessus toute la vidéo */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(90% 90% at 50% 50%, transparent 66%, rgba(14, 34, 51, 0.1) 100%)'}} />
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.04, mixBlendMode: 'overlay'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(f / 2) % 8} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/* ——— La transition de la vidéo : la ligne avant / après du site ——— */
const Handle: React.FC<{x: number; edge: string}> = ({x, edge}) => (
  <>
    <div style={{position: 'absolute', left: x - 2, top: 0, width: 4, height: H, background: edge, boxShadow: '0 0 0 1px rgba(14,34,51,.06)'}} />
    <div style={{position: 'absolute', left: x - 34, top: H / 2 - 34, width: 68, height: 68, borderRadius: '50%', background: edge, boxShadow: '0 8px 26px rgba(14, 34, 51, .28)', display: 'grid', placeItems: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 24, color: C.ink, letterSpacing: '0.14em'}}>
      ‹ ›
    </div>
  </>
);

/** La ligne balaie l'écran de gauche à droite et le couvre de la couleur suivante (level 0 → 1) */
export const WipeCover: React.FC<{level: number; color: string; edge?: string}> = ({level, color, edge = C.paper}) => {
  if (level <= 0.001) return null;
  const x = W * level;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: x, height: H, background: color}} />
      {level < 0.995 ? <Handle x={x} edge={edge} /> : null}
    </AbsoluteFill>
  );
};

/** La couleur se retire derrière la ligne, qui file vers la droite et découvre la scène (level 0 → 1) */
export const WipeReveal: React.FC<{level: number; color: string; edge?: string}> = ({level, color, edge = C.paper}) => {
  if (level >= 0.999) return null;
  const x = W * level;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: x, top: 0, width: W - x, height: H, background: color}} />
      {level > 0.005 ? <Handle x={x} edge={edge} /> : null}
    </AbsoluteFill>
  );
};

/** Une ligne qui monte derrière son cache, comme les titres du site */
export const Line: React.FC<{shift: number; style?: React.CSSProperties; children: React.ReactNode}> = ({shift, style, children}) => (
  <div style={{overflow: 'hidden', padding: '0.04em 0.1em 0.14em 0', margin: '-0.04em -0.1em -0.14em 0'}}>
    <div style={{transform: `translateY(${shift}%) rotate(${shift * 0.025}deg)`, transformOrigin: '0 100%', ...style}}>{children}</div>
  </div>
);

/** Un visage du mur (photo réelle « après » de leur galerie) */
export const Face: React.FC<{n: number; w: number; show?: number; style?: React.CSSProperties}> = ({n, w, show = 1, style}) => (
  <div style={{width: w, height: w * 1.25, borderRadius: 6, overflow: 'hidden', background: C.bg, clipPath: `inset(${(1 - show) * 100}% 0 0 0 round 6px)`, ...style}}>
    <Img src={staticFile(`img/case${String(n).padStart(2, '0')}-fa.webp`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.12 - 0.12 * show})`}} />
  </div>
);
