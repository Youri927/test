import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, E, F, H, LABEL, W, range} from './util';

/** Le nom, comme dans l'en-tête du site : FRONTLINE en capitales larges, POOLS espacé derrière un trait jaune */
export const Logo: React.FC<{size: number; dark?: boolean}> = ({size, dark = false}) => (
  <div style={{display: 'inline-grid', lineHeight: 1, color: dark ? C.paper : C.ink}}>
    <span style={{fontFamily: F.display, fontStretch: '125%', fontWeight: 900, fontSize: size, letterSpacing: '-0.01em', textTransform: 'uppercase'}}>Frontline</span>
    <span style={{display: 'flex', alignItems: 'center', gap: size * 0.32, marginTop: size * 0.14, marginRight: -size * 0.29, fontFamily: F.display, fontStretch: '125%', fontWeight: 700, fontSize: size * 0.47, letterSpacing: '0.62em', textTransform: 'uppercase'}}>
      <span style={{flex: 1, height: Math.max(3, size * 0.13), background: C.yellow}} />
      Pools
    </span>
  </div>
);

/** Petit carré jaune : le carreau, repère de la marque */
export const Tile: React.FC<{size: number; color?: string}> = ({size, color = C.yellow}) => (
  <span style={{display: 'inline-block', flex: 'none', width: size, height: size, background: color}} />
);

/** Légende en bas : intitulé, titre, phrase. Elle reste fixe pendant les mouvements de caméra. */
export const LowerThird: React.FC<{tag?: string; title: string; text: string; at?: number; out: number; dark?: boolean; right?: boolean}> = ({tag, title, text, at = 18, out, dark = false, right = false}) => {
  const f = useCurrentFrame();
  const a = range(f, at, at + 30, 0, 1, E.out);
  const b = range(f, at + 12, at + 44, 0, 1, E.out);
  const gone = range(f, out - 22, out, 1, 0, E.inOut);
  return (
    <div
      style={{
        position: 'absolute', ...(right ? {right: 72} : {left: 72}), bottom: 64, maxWidth: 720,
        padding: '28px 34px 30px', borderRadius: 6,
        background: dark ? 'rgba(20, 36, 73, 0.97)' : 'rgba(255, 255, 255, 0.98)',
        boxShadow: dark ? '0 0 0 1px rgba(255,255,255,.1), 0 18px 50px rgba(0,0,0,.35)' : `0 0 0 1px ${C.line}, 0 18px 50px rgba(20, 36, 73, 0.18)`,
        color: dark ? C.paper : C.ink,
        opacity: a * gone,
        transform: `translateY(${(1 - a) * 22}px)`,
      }}
    >
      {tag ? (
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, ...LABEL, fontSize: 19}}>
          <Tile size={13} />
          <span style={{color: dark ? C.yellow : C.ink}}>{tag}</span>
        </div>
      ) : null}
      <div style={{fontFamily: F.display, fontStretch: '112%', fontWeight: 800, fontSize: 50, lineHeight: 1, letterSpacing: '-0.02em'}}>{title}</div>
      <div style={{marginTop: 14, fontFamily: F.body, fontSize: 23, lineHeight: 1.45, color: dark ? 'rgba(255,255,255,.76)' : C.grey, opacity: b}}>{text}</div>
    </div>
  );
};

/** Fond : le gris bleuté du site */
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
      <AbsoluteFill style={{background: 'radial-gradient(90% 90% at 50% 50%, transparent 66%, rgba(20, 36, 73, 0.1) 100%)'}} />
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

/* ——— La transition de la vidéo : des carreaux, comme l'ouverture du site ——— */
const TILE = 120;
const COLS = Math.ceil(W / TILE);
const ROWS = Math.ceil(H / TILE);
// en diagonale, du bas à gauche vers le haut à droite, avec un léger désordre reproductible
const DELAY = Array.from({length: COLS * ROWS}, (_, i) => {
  const c = i % COLS;
  const r = Math.floor(i / COLS);
  const jitter = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
  return (c / COLS) * 0.6 + ((ROWS - 1 - r) / ROWS) * 0.3 + jitter * 0.1;
});
const SPAN = 0.62;

const Tiles: React.FC<{k: (d: number) => number; color: string}> = ({k, color}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {DELAY.map((d, i) => {
      const s = k(d);
      if (s <= 0.001) return null;
      const c = i % COLS;
      const r = Math.floor(i / COLS);
      // joints de 4 px qui se referment quand le carreau est posé
      const g = 4 * (1 - range(s, 0.85, 1));
      return <div key={i} style={{position: 'absolute', left: c * TILE + g / 2, top: r * TILE + g / 2, width: TILE - g, height: TILE - g, background: color, transform: `scale(${Math.min(1, s * 1.02)})`, opacity: Math.min(1, s * 2)}} />;
    })}
  </AbsoluteFill>
);

/** Les carreaux se posent et couvrent l'écran de la couleur suivante (level 0 → 1) */
export const TileCover: React.FC<{level: number; color: string}> = ({level, color}) => {
  if (level <= 0.001) return null;
  if (level >= 0.999) return <AbsoluteFill style={{background: color}} />;
  return <Tiles color={color} k={(d) => E.out(range(level, d * (1 - SPAN), d * (1 - SPAN) + SPAN))} />;
};

/** Les carreaux se retirent dans le même ordre et découvrent la scène (level 0 → 1) */
export const TileReveal: React.FC<{level: number; color: string}> = ({level, color}) => {
  if (level >= 0.999) return null;
  if (level <= 0.001) return <AbsoluteFill style={{background: color}} />;
  return <Tiles color={color} k={(d) => 1 - E.inOut(range(level, d * (1 - SPAN), d * (1 - SPAN) + SPAN))} />;
};

/** Une ligne qui monte derrière son cache, comme les titres du site */
export const Line: React.FC<{shift: number; style?: React.CSSProperties; children: React.ReactNode}> = ({shift, style, children}) => (
  <div style={{overflow: 'hidden', padding: '0.04em 0.1em 0.12em 0', margin: '-0.04em -0.1em -0.12em 0'}}>
    <div style={{transform: `translateY(${shift}%)`, ...style}}>{children}</div>
  </div>
);

/** Une photo de chantier (photos réelles du site), découverte de bas en haut */
export const Photo: React.FC<{src: string; w: number; h: number; show?: number; pos?: string; style?: React.CSSProperties}> = ({src, w, h, show = 1, pos = '50% 50%', style}) => (
  <div style={{width: w, height: h, overflow: 'hidden', background: C.deep, ...style}}>
    <div style={{width: '100%', height: '100%', transform: `translateY(${(1 - show) * 100}%)`, overflow: 'hidden'}}>
      <Img src={staticFile(`img/${src}.webp`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `translateY(${(show - 1) * 100}%) scale(${1.12 - 0.12 * show})`}} />
    </div>
  </div>
);

export {DISPLAY};
