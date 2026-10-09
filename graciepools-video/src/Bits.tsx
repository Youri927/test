import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BODY, C, E, F, H, H3, TNUM, W, range} from './util';

/* ——— La marque : le rond azur à deux vagues (leur icône actuelle, redessinée sur le site) ——— */

const WAVES = ['M7.5 13.6c2.1-2.1 4.2-2.1 6.3 0s4.2 2.1 6.3 0 4.2-2.1 4.4-.2', 'M7.5 19.6c2.1-2.1 4.2-2.1 6.3 0s4.2 2.1 6.3 0 4.2-2.1 4.4-.2'];

/** Le rond, puis les deux vagues qui se tracent ; `p` de 0 à 1 */
export const Mark: React.FC<{size: number; p?: number; style?: React.CSSProperties}> = ({size, p = 1, style}) => {
  const disc = E.out(Math.max(0, Math.min(1, p / 0.45)));
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} style={{display: 'block', overflow: 'visible', ...style}}>
      <circle cx="16" cy="16" r={16 * disc} fill={C.azure} />
      <g fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
        {WAVES.map((d, i) => {
          const q = E.out(Math.max(0, Math.min(1, (p - 0.3 - i * 0.12) / 0.45)));
          return <path key={i} d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - q} opacity={q > 0.001 ? 1 : 0} />;
        })}
      </g>
    </svg>
  );
};

export const Wordmark: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({size, color = C.ink, style}) => (
  <span style={{fontFamily: F.sans, fontWeight: 700, fontSize: size, letterSpacing: '-0.03em', lineHeight: 1, color, whiteSpace: 'nowrap', ...style}}>Gracie Pools</span>
);

/* ——— Graduations : une règle en pieds, comme celles du comparateur du site ——— */

/**
 * Règle horizontale : un filet et ses graduations (un trait par pied, un plus long tous les 5 pieds, le chiffre tous les 10).
 * Les graduations restent fixes à l'écran : la règle commence en `x0` (px, dans le repère où `origin` est le 0′).
 * `dir` : 1 = graduations vers le bas, -1 = vers le haut.
 */
export const Ruler: React.FC<{w: number; ppf: number; x0?: number; origin?: number; dir?: 1 | -1; color?: string; labels?: boolean; style?: React.CSSProperties}> = ({
  w,
  ppf,
  x0 = 0,
  origin = 0,
  dir = 1,
  color = C.azure,
  labels = true,
  style,
}) => {
  const ticks: React.ReactNode[] = [];
  const k0 = Math.ceil((x0 - origin) / ppf);
  const k1 = Math.floor((x0 + w - origin) / ppf);
  for (let k = k0; k <= k1; k++) {
    const x = origin + k * ppf - x0;
    const major = k % 5 === 0;
    const len = k % 10 === 0 ? 18 : major ? 12 : 6;
    ticks.push(<line key={k} x1={x} x2={x} y1={0} y2={dir * len} stroke={color} strokeWidth={major ? 1.6 : 1.1} />);
    if (labels && k % 10 === 0 && k > 0 && x < w - 30)
      ticks.push(
        <text key={'t' + k} x={x + 5} y={dir * 32} fill={color} fontFamily={F.sans} fontSize={15} fontWeight={600} style={TNUM}>
          {k}′
        </text>,
      );
  }
  return (
    <svg width={Math.max(1, w)} height={40} viewBox={`0 ${dir < 0 ? -40 : 0} ${Math.max(1, w)} 40`} style={{position: 'absolute', overflow: 'visible', ...style}}>
      <line x1={0} x2={w} y1={0} y2={0} stroke={color} strokeWidth={2} />
      {ticks}
    </svg>
  );
};

/* ——— La règle qui ouvre chaque scène : elle se trace au milieu de l'image, puis ses deux mâchoires s'écartent ——— */

const JAW_PPF = 32;

export const CaliperIn: React.FC<{pre: number; color?: string; children: React.ReactNode}> = ({pre, color = C.azure, children}) => {
  const f = useCurrentFrame();
  if (!pre || f >= pre) return <>{children}</>;
  const p = f / pre;
  // 1. le filet se trace depuis le centre, avec ses graduations
  const a = E.out(range(p, 0, 0.4));
  // 2. les mâchoires s'écartent jusqu'aux bords de l'image
  const b = E.jaw(range(p, 0.28, 1));
  const half = (H / 2 + 60) * b;
  const top = H / 2 - half;
  const bottom = H / 2 + half;
  const reveal = `inset(${Math.max(0, top)}px 0 ${Math.max(0, H - bottom)}px 0)`;
  const lineW = W * a;
  const fade = 1 - range(p, 0.82, 1);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: reveal}}>
        <AbsoluteFill style={{transform: `scale(${1.07 - 0.07 * b})`, transformOrigin: '50% 50%'}}>{children}</AbsoluteFill>
      </AbsoluteFill>
      {/* les deux mâchoires, graduées vers l'intérieur ; tant qu'elles sont fermées, une seule règle */}
      <div style={{position: 'absolute', left: (W - lineW) / 2, top: top, width: lineW, height: 0, overflow: 'visible', opacity: fade}}>
        <Ruler w={lineW} ppf={JAW_PPF} x0={(W - lineW) / 2} dir={1} color={color} labels={b > 0.05} style={{left: 0, top: 0}} />
      </div>
      {b > 0.001 ? (
        <div style={{position: 'absolute', left: 0, top: bottom, width: W, height: 0, overflow: 'visible', opacity: fade}}>
          <Ruler w={W} ppf={JAW_PPF} dir={-1} color={color} labels={false} style={{left: 0, top: 0}} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** La scène qui s'efface : elle recule un peu et s'assombrit pendant que la règle de la suivante s'ouvre */
export const PushBack: React.FC<{len: number; next: number; children: React.ReactNode}> = ({len, next, children}) => {
  const f = useCurrentFrame();
  const q = next ? E.inOut(range(f, len - next, len)) : 0;
  if (q <= 0) return <>{children}</>;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${1 - 0.05 * q})`}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{background: C.ink, opacity: 0.3 * q}} />
    </AbsoluteFill>
  );
};

/* ——— Une cote : le filet et ses deux butées, l'étiquette au milieu ——— */

export const DimLine: React.FC<{
  len: number;
  /** avancement du tracé, de 0 à 1 */
  p: number;
  label?: string;
  vertical?: boolean;
  color?: string;
  labelColor?: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({len, p, label, vertical = false, color = 'rgba(10, 26, 36, 0.45)', labelColor = C.ink, size = 22, style}) => {
  const shown = len * Math.max(0, Math.min(1, p));
  const tick = 12;
  const lab = label ? (
    <div
      style={{
        position: 'absolute',
        left: vertical ? -size * 2.4 : len / 2,
        top: vertical ? len / 2 : -size * 1.55,
        transform: vertical ? 'translate(-50%, -50%) rotate(-90deg)' : 'translateX(-50%)',
        fontFamily: F.sans,
        fontWeight: 600,
        fontSize: size,
        color: labelColor,
        whiteSpace: 'nowrap',
        opacity: range(p, 0.15, 0.5),
        ...TNUM,
      }}
    >
      {label}
    </div>
  ) : null;
  return (
    <div style={{position: 'absolute', ...style}}>
      <svg width={vertical ? 1 : len} height={vertical ? len : 1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {vertical ? (
          <>
            <line x1={-tick / 2} x2={tick / 2} y1={0} y2={0} stroke={color} strokeWidth={1.5} opacity={p > 0 ? 1 : 0} />
            <line x1={0} x2={0} y1={0} y2={shown} stroke={color} strokeWidth={1.5} />
            <line x1={-tick / 2} x2={tick / 2} y1={len} y2={len} stroke={color} strokeWidth={1.5} opacity={p >= 1 ? 1 : 0} />
          </>
        ) : (
          <>
            <line x1={0} x2={0} y1={-tick / 2} y2={tick / 2} stroke={color} strokeWidth={1.5} opacity={p > 0 ? 1 : 0} />
            <line x1={0} x2={shown} y1={0} y2={0} stroke={color} strokeWidth={1.5} />
            <line x1={len} x2={len} y1={-tick / 2} y2={tick / 2} stroke={color} strokeWidth={1.5} opacity={p >= 1 ? 1 : 0} />
          </>
        )}
      </svg>
      {lab}
    </div>
  );
};

/* ——— Légende : sa cote se trace d'abord, le panneau se déplie dessous ; elle repart par le même chemin ——— */

export const Caption: React.FC<{
  title: string;
  text: string;
  at: number;
  out: number;
  tone?: 'light' | 'dark';
  side?: 'left' | 'right';
  width?: number;
  bottom?: number;
}> = ({title, text, at, out, tone = 'light', side = 'left', width = 640, bottom = 58}) => {
  const f = useCurrentFrame();
  if (f < at || f > out) return null;
  // entrée : la cote se trace (gauche → droite), puis le panneau se déplie vers le bas, puis le texte monte ;
  // sortie : le texte s'efface, le panneau remonte dans sa cote, la cote se replie
  const line = range(f, at, at + 20, 0, 1, E.out) * (1 - range(f, out - 12, out, 0, 1, E.in));
  const open = range(f, at + 10, at + 34, 0, 1, E.out) * (1 - range(f, out - 22, out - 8, 0, 1, E.in));
  const content = range(f, at + 20, at + 46, 0, 1, E.out) * (1 - range(f, out - 26, out - 16));
  const light = tone === 'light';
  const tick = 14;
  return (
    <div style={{position: 'absolute', [side]: 64, bottom, width}}>
      <svg width={width} height={tick} style={{position: 'absolute', left: 0, top: -tick - 10, overflow: 'visible'}}>
        <line x1={0} x2={width * line} y1={tick / 2} y2={tick / 2} stroke={C.azure} strokeWidth={2} />
        <line x1={0} x2={0} y1={0} y2={tick} stroke={C.azure} strokeWidth={2} opacity={line > 0 ? 1 : 0} />
        <line x1={width} x2={width} y1={0} y2={tick} stroke={C.azure} strokeWidth={2} opacity={line > 0.98 ? 1 : 0} />
      </svg>
      <div
        style={{
          position: 'relative',
          padding: '28px 34px 30px',
          borderRadius: 18,
          background: light ? C.white : C.ink,
          boxShadow: light ? '0 22px 60px rgba(10, 26, 36, 0.18)' : '0 22px 60px rgba(0, 0, 0, 0.35)',
          clipPath: `inset(0 0 ${(1 - open) * 100}% 0 round 18px)`,
        }}
      >
        <div style={{opacity: content, transform: `translateY(${(1 - content) * 16}px)`}}>
          <div style={{...H3, fontSize: 38, color: light ? C.ink : C.white}}>{title}</div>
          <div style={{...BODY, marginTop: 10, fontSize: 21.5, lineHeight: 1.45, color: light ? C.inkSoft : 'rgba(255,255,255,.76)'}}>{text}</div>
        </div>
      </div>
    </div>
  );
};

/** Une ligne qui monte derrière son cache, comme les titres du site */
export const Line: React.FC<{shift: number; style?: React.CSSProperties; children: React.ReactNode}> = ({shift, style, children}) => (
  <div style={{overflow: 'hidden', padding: '0.06em 0.14em 0.16em 0', margin: '-0.06em -0.14em -0.16em 0'}}>
    <div style={{transform: `translateY(${shift}%)`, ...style}}>{children}</div>
  </div>
);

/** Vignette et grain très légers, par-dessus toute la vidéo */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(90% 90% at 50% 50%, transparent 70%, rgba(10, 26, 36, 0.08) 100%)'}} />
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
