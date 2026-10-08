import React from 'react';
import {AbsoluteFill, Easing, Img, staticFile, useCurrentFrame} from 'remotion';
import {BODY, C, E, H, H3, W, range} from './util';

/** Leur logo (palmiers et soleil), en bleu marine ; sur fond sombre, posé sur une plaque blanche comme dans le pied de page du site */
export const Logo: React.FC<{height: number; plate?: boolean}> = ({height, plate = false}) => {
  const img = <Img src={staticFile('brand/logo-navy.png')} style={{height, width: (height * 464) / 226, display: 'block'}} />;
  if (!plate) return img;
  return <div style={{display: 'inline-block', padding: `${height * 0.16}px ${height * 0.22}px`, background: C.white, borderRadius: 6}}>{img}</div>;
};

/**
 * Légende : une plaque pleine dont le bord supérieur porte une ligne jaune, la ligne d'eau.
 * Elle monte comme l'eau à l'entrée et redescend à la sortie ; elle reste fixe pendant les mouvements de caméra.
 */
export const Caption: React.FC<{title: string; text: string; at?: number; out: number; tone?: 'ink' | 'white'; right?: boolean; width?: number}> = ({
  title,
  text,
  at = 20,
  out,
  tone = 'ink',
  right = false,
  width = 640,
}) => {
  const f = useCurrentFrame();
  const a = range(f, at, at + 34, 0, 1, E.out);
  const b = range(f, at + 8, at + 44, 0, 1, E.out);
  const gone = range(f, out - 26, out, 0, 1, E.inOut);
  const cut = Math.min(1, 1 - a + gone);
  if (cut >= 1) return null;
  const ink = tone === 'ink';
  return (
    <div style={{position: 'absolute', ...(right ? {right: 64} : {left: 64}), bottom: 60, width}}>
      <div
        style={{
          position: 'relative',
          padding: '30px 34px 32px',
          borderRadius: 4,
          background: ink ? C.ink : C.white,
          boxShadow: '0 24px 64px rgba(3, 29, 49, 0.3)',
          clipPath: `inset(${cut * 100}% 0 0 0)`,
        }}
      >
        <div style={{transform: `translateY(${(1 - a) * 26}px)`}}>
          <div style={{...H3, fontSize: 44, color: ink ? C.white : C.ink}}>{title}</div>
          <div style={{...BODY, marginTop: 12, fontSize: 22, lineHeight: 1.45, color: ink ? 'rgba(255,255,255,.82)' : C.inkSoft, opacity: b}}>{text}</div>
        </div>
      </div>
      {/* la ligne d'eau suit le bord de la plaque */}
      <div style={{position: 'absolute', left: 0, right: 0, top: `calc(${cut * 100}% - 2px)`, height: 5, background: C.sun, borderRadius: '4px 4px 0 0', opacity: 1 - range(gone, 0.55, 1)}} />
    </div>
  );
};

const riseEase = Easing.bezier(0.55, 0, 0.12, 1);

/**
 * Entrée d'un chapitre : la scène monte par le bas derrière une ligne d'eau jaune,
 * comme la photo d'ouverture du site qui monte à l'arrivée. `pre` = durée de la montée (images).
 */
export const Riser: React.FC<{pre: number; bg?: string; children: React.ReactNode}> = ({pre, bg, children}) => {
  const f = useCurrentFrame();
  if (!pre) return <>{children}</>;
  const p = riseEase(Math.min(1, Math.max(0, f / pre)));
  const y = (1 - p) * H;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: p < 1 ? `inset(${y}px 0 0 0)` : undefined, background: bg}}>
        <AbsoluteFill style={{transform: p < 1 ? `translateY(${-(1 - p) * 90}px) scale(${1 + (1 - p) * 0.05})` : undefined}}>{children}</AbsoluteFill>
      </AbsoluteFill>
      {p > 0 && p < 1 ? <div style={{position: 'absolute', left: 0, width: W, top: y - 4, height: 8, background: C.sun}} /> : null}
    </AbsoluteFill>
  );
};

/** Une ligne qui monte derrière son cache, comme les titres du site */
export const Line: React.FC<{shift: number; style?: React.CSSProperties; children: React.ReactNode}> = ({shift, style, children}) => (
  <div style={{overflow: 'hidden', padding: '0.06em 0.12em 0.14em 0', margin: '-0.06em -0.12em -0.14em 0'}}>
    <div style={{transform: `translateY(${shift}%)`, ...style}}>{children}</div>
  </div>
);

/** Une de leurs photos (public/img), en plein cadre */
export const Photo: React.FC<{src: string; w: number; h: number; pos?: string; scale?: number; style?: React.CSSProperties}> = ({src, w, h, pos = '50% 50%', scale = 1, style}) => (
  <div style={{width: w, height: h, overflow: 'hidden', background: C.deep, ...style}}>
    <Img src={staticFile(`img/${src}.webp`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${scale})`}} />
  </div>
);

/** Vignette et grain très légers, par-dessus toute la vidéo */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(90% 90% at 50% 50%, transparent 68%, rgba(3, 29, 49, 0.1) 100%)'}} />
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.035, mixBlendMode: 'overlay'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(f / 2) % 8} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
