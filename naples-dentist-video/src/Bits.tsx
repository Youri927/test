import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import L from './logo.json';
import {BODY, C, E, H, H3, W, mix, range} from './util';

/* ——— Le logo du cabinet, en vectoriel (tracé du site) : la racine, les sept filets de la vis, la couronne ——— */

/** Avancement de chaque pièce, de 0 (absente) à 1 (en place) ; filets dans l'ordre du tracé (le dernier est en bas) */
export type LogoBuild = {root: number; threads: number[]; crown: number};
export const BUILT: LogoBuild = {root: 1, threads: L.threads.map(() => 1), crown: 1};
export const LOGO_RATIO = L.w / L.h;

export const LogoMark: React.FC<{height: number; build?: LogoBuild; root?: string; thread?: string; crown?: string; style?: React.CSSProperties}> = ({
  height,
  build = BUILT,
  root = C.bone,
  thread = C.teal,
  crown = C.ink,
  style,
}) => (
  <svg viewBox={`0 0 ${L.w} ${L.h}`} width={height * LOGO_RATIO} height={height} style={{display: 'block', overflow: 'visible', ...style}}>
    <path d={L.root} fill={root} style={{opacity: build.root, transform: `translateY(${(1 - build.root) * 40}px)`}} />
    {L.threads.map((d, i) => {
      const p = build.threads[i] ?? 1;
      return (
        <path
          key={i}
          d={d}
          fill={thread}
          style={{opacity: p > 0.001 ? 1 : 0, transformBox: 'fill-box', transformOrigin: '0% 50%', transform: `translateX(${-(1 - p) * 24}px) scaleX(${Math.max(0.001, p)})`}}
        />
      );
    })}
    <path d={L.crown} fill={crown} style={{opacity: Math.min(1, build.crown * 2.5), transform: `translateY(${-(1 - build.crown) * 150}px)`}} />
  </svg>
);

/** La construction du logo comme dans la section Implants du site : la racine monte, les filets s'étirent du bas vers le haut, la couronne se pose */
export const buildAt = (f: number, o: {root: number; thread0: number; threadStep: number; crownFrom: number; crown: number}): LogoBuild => {
  const n = L.threads.length;
  return {
    root: range(f, o.root, o.root + 36, 0, 1, E.out),
    // le dernier filet du tracé est en bas : il entre le premier
    threads: L.threads.map((_, i) => {
      const at = o.thread0 + (n - 1 - i) * o.threadStep;
      return range(f, at, at + 18, 0, 1, E.out);
    }),
    // la couronne accélère puis se pose, avec un léger tassement
    crown: f < o.crown ? range(f, o.crownFrom, o.crown, 0, 1, E.in) : 1 + Math.sin(Math.min(1, (f - o.crown) / 14) * Math.PI) * 0.025,
  };
};

/* ——— Photos ——— */

export type Focus = {x: number; y: number; w: number; h: number};
/** Le portrait (2010 × 1500) et la zone du sourire montrée dans la pastille du titre du site */
export const PORTRAIT = {src: 'img/portrait.jpg', w: 2010, h: 1500};
export const SMILE: Focus = {x: 560, y: 572, w: 980, h: (980 * 0.78) / 2.12};

/** Une photo cadrée sur une zone (px de la photo) qui remplit la boîte, sans laisser de vide */
export const PhotoCrop: React.FC<{src: string; iw: number; ih: number; focus: Focus; w: number; h: number; style?: React.CSSProperties}> = ({src, iw, ih, focus, w, h, style}) => {
  const s = Math.max(w / focus.w, h / focus.h, w / iw, h / ih);
  const cx = focus.x + focus.w / 2;
  const cy = focus.y + focus.h / 2;
  const left = Math.min(0, Math.max(w - iw * s, w / 2 - cx * s));
  const top = Math.min(0, Math.max(h - ih * s, h / 2 - cy * s));
  return (
    <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', background: C.wall, ...style}}>
      <Img src={staticFile(src)} style={{position: 'absolute', left, top, width: iw * s, height: ih * s, maxWidth: 'none'}} />
    </div>
  );
};

/** Zone de la photo vue par une pastille de w × h qui s'agrandit autour du sourire, la photo gardant l'échelle qu'elle avait à la largeur w0 */
export const smileWindow = (w: number, h: number, w0: number): Focus => {
  const s0 = w0 / SMILE.w;
  const cx = SMILE.x + SMILE.w / 2;
  const cy = SMILE.y + SMILE.h / 2;
  return {x: cx - w / (2 * s0), y: cy - h / (2 * s0), w: w / s0, h: h / s0};
};

export const Smile: React.FC<{w: number; h: number; focus?: Focus; style?: React.CSSProperties}> = ({w, h, focus = SMILE, style}) => (
  <PhotoCrop src={PORTRAIT.src} iw={PORTRAIT.w} ih={PORTRAIT.h} focus={focus} w={w} h={h} style={style} />
);

/* ——— La pastille : la scène suivante s'ouvre dans une pastille qui grandit jusqu'à remplir l'image ——— */

export type Rect = {x: number; y: number; w: number; h: number};
/** pastille de départ par défaut : au centre de l'image */
export const PILL_FROM: Rect = {x: W / 2, y: H / 2, w: 300, h: 120};

export const pillRect = (from: Rect, p: number) => {
  const w = from.w + (W - from.w) * p;
  const h = from.h + (H - from.h) * p;
  const x = from.x + (W / 2 - from.x) * p;
  const y = from.y + (H / 2 - from.y) * p;
  // une vraie pastille (rayon = demi-hauteur) qui ne s'équarrit qu'en arrivant
  const r = (h / 2) * (1 - range(p, 0.45, 1, 0, 1, E.sine));
  return {x, y, w, h, r};
};

export const PillIn: React.FC<{pre: number; from?: Rect; cover?: (w: number, h: number) => React.ReactNode; coverOut?: [number, number]; children: React.ReactNode}> = ({
  pre,
  from = PILL_FROM,
  cover,
  coverOut = [0.12, 0.5],
  children,
}) => {
  const f = useCurrentFrame();
  if (!pre || f >= pre) return <>{children}</>;
  const p = E.pill(Math.max(0, f / pre));
  const {x, y, w, h, r} = pillRect(from, p);
  const clip = `inset(${y - h / 2}px ${W - (x + w / 2)}px ${H - (y + h / 2)}px ${x - w / 2}px round ${r}px)`;
  const coverOpacity = cover ? 1 - range(p, coverOut[0], coverOut[1], 0, 1, E.sine) : 0;
  return (
    <AbsoluteFill style={{clipPath: clip}}>
      <AbsoluteFill style={{transform: `scale(${1.16 - 0.16 * p})`, transformOrigin: `${x}px ${y}px`}}>{children}</AbsoluteFill>
      {cover && coverOpacity > 0 ? <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: coverOpacity}}>{cover(w, h)}</div> : null}
    </AbsoluteFill>
  );
};

/** La scène qui s'efface : elle recule un peu et s'assombrit pendant que la pastille de la suivante s'ouvre */
export const PushBack: React.FC<{len: number; next: number; children: React.ReactNode}> = ({len, next, children}) => {
  const f = useCurrentFrame();
  const q = next ? E.inOut(range(f, len - next, len)) : 0;
  if (q <= 0) return <>{children}</>;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${1 - 0.07 * q})`}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{background: C.ink, opacity: 0.32 * q}} />
    </AbsoluteFill>
  );
};

/* ——— Légende : elle naît pastille, s'étire, puis s'ouvre en panneau ; elle repart par le même chemin ——— */

export const Caption: React.FC<{
  title: string;
  text: string;
  at: number;
  out: number;
  tone?: 'light' | 'dark';
  side?: 'left' | 'right';
  width?: number;
}> = ({title, text, at, out, tone = 'light', side = 'left', width = 620}) => {
  const f = useCurrentFrame();
  if (f < at || f > out) return null;
  const P = 64;
  // entrée : la pastille s'allonge, puis s'ouvre vers le haut ; sortie : l'inverse, plus vite
  const open = range(f, at, at + 22, 0, 1, E.out) * (1 - range(f, out - 10, out, 0, 1, E.in));
  const lift = range(f, at + 10, at + 40, 0, 1, E.out) * (1 - range(f, out - 18, out - 6, 0, 1, E.in));
  const content = range(f, at + 18, at + 46, 0, 1, E.out) * (1 - range(f, out - 22, out - 12));
  const light = tone === 'light';
  const sideIn = `calc(${1 - open} * (100% - ${P}px))`;
  const topIn = `calc(${1 - lift} * (100% - ${P}px))`;
  const r = P / 2 - 10 * lift;
  return (
    <div style={{position: 'absolute', [side]: 64, bottom: 58, width}}>
      <div
        style={{
          position: 'relative',
          padding: '30px 34px 32px',
          borderRadius: r,
          background: light ? C.white : C.ink,
          boxShadow: light ? '0 22px 60px rgba(11, 35, 38, 0.2)' : '0 22px 60px rgba(0, 0, 0, 0.35)',
          clipPath: side === 'left' ? `inset(${topIn} ${sideIn} 0 0 round ${r}px)` : `inset(${topIn} 0 0 ${sideIn} round ${r}px)`,
        }}
      >
        <div style={{opacity: content, transform: `translateY(${(1 - content) * 16}px)`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <span style={{flex: 'none', width: 30, height: 15, borderRadius: 99, background: C.teal}} />
            <span style={{...H3, fontSize: 40, color: light ? C.ink : C.white}}>{title}</span>
          </div>
          <div style={{...BODY, marginTop: 12, fontSize: 21.5, lineHeight: 1.46, color: light ? C.inkSoft : 'rgba(255,255,255,.78)'}}>{text}</div>
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

/** Couleur intermédiaire, pour les fonds qui suivent un plan (sédation) */
export const tint = mix;

/** Vignette et grain très légers, par-dessus toute la vidéo */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(90% 90% at 50% 50%, transparent 70%, rgba(11, 35, 38, 0.09) 100%)'}} />
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
