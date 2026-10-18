import React from 'react';
import {Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, F, clamp} from './util';

/** Métadonnées d'un plan filmé (capture/shots.mjs) : souris, clics et point d'insertion image par image, repères relevés */
export type Meta = {
  name: string;
  fps: number;
  frames: number;
  width: number;
  height: number;
  mouse: ({x: number; y: number} | null)[];
  clicks: number[];
  caret?: ({x: number; y: number; h: number} | null)[];
  marks?: Record<string, number>;
  values?: Record<string, (number | null)[]>;
};

/** Plan joué à l'écran : `delay` images figées sur l'image `from`, puis lecture à `rate` à partir de celle-ci */
export type Clip = {meta: Meta; from?: number; rate?: number; delay?: number};

const ARROW = 'M1 1 L1 21.5 L6.6 16.4 L10.4 24.8 L14 23.2 L10.3 15 L17.6 15 Z';

/** Dernière position connue de la souris, et la dernière image où elle a bougé (ou cliqué) */
const lastMouse = (meta: Meta, src: number) => {
  let at = -1;
  for (let i = Math.min(src, meta.mouse.length - 1); i >= 0; i--) if (meta.mouse[i]) { at = i; break; }
  if (at < 0) return null;
  const m = meta.mouse[at]!;
  let i = at;
  while (i > 0) {
    const p = meta.mouse[i - 1];
    if (!p || Math.abs(p.x - m.x) > 0.5 || Math.abs(p.y - m.y) > 0.5 || meta.clicks.includes(i)) break;
    i--;
  }
  return {m, i};
};

const firstMouse = (meta: Meta) => meta.mouse.findIndex((m) => Boolean(m));

/** Image du plan filmé affichée à l'image `f` de la séquence */
export const srcFrame = (clip: Clip, f: number) =>
  Math.min(clip.meta.frames - 1, (clip.from ?? 0) + Math.floor(Math.max(0, f - (clip.delay ?? 0)) * (clip.rate ?? 1)));

/** Valeur relevée par --probe à l'image `f` de la séquence (la dernière connue) */
export const valueAt = (clip: Clip, key: string, f: number) => {
  const v = clip.meta.values?.[key];
  if (!v) return 0;
  for (let i = srcFrame(clip, f); i >= 0; i--) if (v[i] != null) return v[i] as number;
  return 0;
};

/**
 * Le point d'insertion du champ où l'on écrit, redessiné net : plein pendant la frappe, puis il clignote comme dans le
 * navigateur (une demi-seconde allumé, une demi-seconde éteint)
 */
const Caret: React.FC<{meta: Meta; src: number; k: number}> = ({meta, src, k}) => {
  const c = meta.caret?.[src];
  if (!c) return null;
  let moved = src;
  while (moved > 0) {
    const p = meta.caret?.[moved - 1];
    if (!p || p.x !== c.x || p.y !== c.y) break;
    moved--;
  }
  const idle = src - moved;
  if (idle >= 32 && (idle - 32) % 64 >= 32) return null;
  const w = 1.5 * k;
  return <div style={{position: 'absolute', left: c.x * k - w / 2, top: c.y * k, width: w, height: c.h * k, background: C.ink}} />;
};

/** Les appuis prolongés du doigt (glissés) : les repères hold/release, hold2/release2… */
const holds = (meta: Meta) => {
  const out: [number, number][] = [];
  for (const [key, at] of Object.entries(meta.marks ?? {})) {
    const m = /^hold(\d*)$/.exec(key);
    if (!m) continue;
    const rel = meta.marks?.[`release${m[1]}`];
    if (rel !== undefined) out.push([at, rel]);
  }
  return out;
};

/**
 * Écran : joue un plan filmé du site, à la bonne image, avec le curseur (ou le doigt sur mobile) et le point d'insertion
 * redessinés par-dessus, nets à tous les zooms.
 */
export const Screen: React.FC<{clip: Clip; w: number; h: number; touch?: boolean}> = ({clip, w, h, touch = false}) => {
  const f = useCurrentFrame();
  const {meta, from = 0, rate = 1, delay = 0} = clip;
  const src = srcFrame(clip, f);
  const k = w / meta.width;
  const found = lastMouse(meta, src);
  const first = firstMouse(meta);

  let pointer: React.ReactNode = null;
  if (found && !touch) {
    const {m} = found;
    // le curseur s'efface quand la souris ne bouge plus (fin d'un geste filmé)
    const idle = interpolate(src - found.i, [90, 120], [1, 0], clamp);
    const appear = interpolate(src, [first, first + 10], [0, 1], clamp) * idle;
    const press = meta.clicks.reduce((acc, c) => (src >= c - 2 && src < c + 7 ? Math.min(acc, 0.82) : acc), 1);
    const s = 1.5 * k * press;
    pointer = (
      <>
        {meta.clicks.map((c) => {
          const t = src - c;
          if (t < 0 || t > 26) return null;
          const p = t / 26;
          const d = 70 * k * (0.3 + p);
          return (
            <div
              key={c}
              style={{position: 'absolute', left: m.x * k - d / 2, top: m.y * k - d / 2, width: d, height: d, borderRadius: '50%', border: `${3.5 * k}px solid ${C.poolDeep}`, boxShadow: `0 0 0 ${1.5 * k}px rgba(255, 255, 255, .8)`, opacity: (1 - p) * 0.95}}
            />
          );
        })}
        <svg
          width={20 * s}
          height={27 * s}
          viewBox="0 0 20 27"
          style={{position: 'absolute', left: m.x * k - s, top: m.y * k - s, opacity: appear, filter: `drop-shadow(0 ${2 * k}px ${4 * k}px rgba(0, 0, 0, .35))`}}
        >
          <path d={ARROW} fill="#fff" stroke={C.ink} strokeWidth={1.4} strokeLinejoin="round" />
        </svg>
      </>
    );
  }
  if (touch) {
    // le doigt posé (un glissé) : il suit son trajet de l'appui au lever
    const holdDots = holds(meta).map(([hold, release]) => {
      if (src < hold - 8 || src >= release + 18 || !meta.mouse[hold]) return null;
      const m = meta.mouse[Math.max(hold, Math.min(src, release))] ?? meta.mouse[hold]!;
      const press = src < hold ? (src - hold + 8) / 8 : src < release ? 1 : 1 - (src - release) / 18;
      const d = 60 * k;
      return <div key={`hold${hold}`} style={{position: 'absolute', left: m.x * k - d / 2, top: m.y * k - d / 2, width: d, height: d, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.6)', boxShadow: `0 0 0 ${2.5 * k}px ${C.poolDeep}, 0 0 0 ${4 * k}px rgba(255, 255, 255, .7)`, opacity: press}} />;
    });
    pointer = [...holdDots, ...meta.clicks.map((c) => {
      const t = src - c;
      if (t < -8 || t > 24) return null;
      const m = meta.mouse[c];
      if (!m) return null;
      const press = t < 0 ? (t + 8) / 8 : 1 - t / 24;
      const ring = Math.max(0, t) / 24;
      const d = 56 * k;
      const dr = d * (1 + ring * 1.4);
      return (
        <React.Fragment key={c}>
          <div style={{position: 'absolute', left: m.x * k - d / 2, top: m.y * k - d / 2, width: d, height: d, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.55)', boxShadow: '0 0 0 1px rgba(0, 0, 0, .22)', opacity: press}} />
          <div style={{position: 'absolute', left: m.x * k - dr / 2, top: m.y * k - dr / 2, width: dr, height: dr, borderRadius: '50%', border: `${2.5 * k}px solid ${C.poolDeep}`, boxShadow: `0 0 0 ${1.5 * k}px rgba(255, 255, 255, .7)`, opacity: t >= 0 ? 1 - ring : 0}} />
        </React.Fragment>
      );
    })];
  }

  // au-delà de la fin du plan, la dernière image reste à l'écran
  const end = delay + Math.floor((meta.frames - 1 - from) / rate);
  const video = (
    <OffthreadVideo
      src={staticFile(`site/${meta.name}.mp4`)}
      trimBefore={from}
      playbackRate={rate}
      muted
      style={{position: 'absolute', left: 0, top: 0, width: w, height: h}}
    />
  );
  let shown: React.ReactNode;
  if (delay > 0 && f < delay) shown = <Freeze frame={0}>{video}</Freeze>;
  else if (f > end) shown = <Freeze frame={end - delay}>{video}</Freeze>;
  else shown = delay > 0 ? <Sequence from={delay} layout="none">{video}</Sequence> : video;
  return (
    <div style={{position: 'absolute', inset: 0, width: w, height: h, overflow: 'hidden', background: C.paper}}>
      {shown}
      <Caret meta={meta} src={src} k={k} />
      {pointer}
    </div>
  );
};

/* ——— Navigateur ——— */
export const SITE_W = 1440;
export const SITE_H = 900;
export const barH = (w: number) => Math.round(w * 0.036);
export const browserH = (w: number) => barH(w) + (w * SITE_H) / SITE_W;

/** Position monde d'un point du site (px CSS du viewport 1440×900), navigateur centré en (x, y) */
export const sitePoint = (b: {x: number; y: number; w: number}, sx: number, sy: number) => {
  const k = b.w / SITE_W;
  return {x: b.x - b.w / 2 + sx * k, y: b.y - browserH(b.w) / 2 + barH(b.w) + sy * k};
};

const Lock: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{flex: 'none'}}>
    <rect x="5" y="10.5" width="14" height="10" rx="2.2" fill={color} />
    <path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" fill="none" stroke={color} strokeWidth="2.2" />
  </svg>
);

export const DOMAIN = 'zyndahomes.com';

/** Fenêtre de navigateur claire, l'adresse du site dans la barre */
export const Browser: React.FC<{clip?: Clip; w: number; children?: React.ReactNode}> = ({clip, w, children}) => {
  const bh = barH(w);
  const ch = (w * SITE_H) / SITE_W;
  const r = w * 0.006;
  return (
    <div style={{position: 'relative', width: w, height: bh + ch}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: r,
          overflow: 'hidden',
          background: C.paper,
          boxShadow: `0 ${w * 0.024}px ${w * 0.07}px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.07)`,
        }}
      >
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bh, background: '#F5F6F6', borderBottom: '1px solid rgba(0, 0, 0, 0.08)'}}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
            <div key={c} style={{position: 'absolute', left: bh * (0.62 + i * 0.5), top: bh * 0.37, width: bh * 0.26, height: bh * 0.26, borderRadius: '50%', background: c, opacity: 0.85}} />
          ))}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: bh * 0.2,
              height: bh * 0.6,
              width: w * 0.42,
              marginLeft: -w * 0.21,
              borderRadius: 999,
              background: 'rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: bh * 0.18,
              fontFamily: F.sans,
              fontWeight: 500,
              fontSize: bh * 0.33,
              color: C.vein,
              letterSpacing: '0.005em',
              whiteSpace: 'nowrap',
            }}
          >
            <Lock size={bh * 0.36} color={C.vein} />
            <span>{DOMAIN}</span>
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, top: bh, width: w, height: ch, overflow: 'hidden'}}>
          {clip ? <Screen clip={clip} w={w} h={ch} /> : null}
          {children}
        </div>
      </div>
    </div>
  );
};

/* ——— Téléphone ——— */
/** Le téléphone filmé : 390 × 844 px, dont 47 px de barre d'état ; la page (390 × 797, capture/shots.mjs) est dessous */
export const PHONE = {w: 390, h: 844, bar: 47} as const;
export const phoneDims = (w: number) => {
  const b = w * 0.042;
  const sw = w - 2 * b;
  const sh = (sw * PHONE.h) / PHONE.w;
  return {b, sw, sh, h: sh + 2 * b, bar: (sh * PHONE.bar) / PHONE.h};
};

/** Barre d'état d'iPhone : l'heure (10 h), le réseau et la batterie, en noir sur le blanc de l'en-tête du site */
const StatusBar: React.FC<{w: number; h: number}> = ({w, h}) => {
  const u = w / PHONE.w;
  const fg = C.ink;
  const dim = 'rgba(0, 0, 0, .4)';
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, background: C.paper, color: fg}}>
      <div style={{position: 'absolute', left: 0, width: w * 0.35, top: 0, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.sans, fontWeight: 650, fontSize: 16.5 * u, letterSpacing: '0.01em'}}>
        10:00
      </div>
      <div style={{position: 'absolute', right: 0, width: w * 0.35, top: 0, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 * u}}>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 1.6 * u, height: 11 * u}}>
          {[0.4, 0.6, 0.8, 1].map((k) => (
            <div key={k} style={{width: 3 * u, height: 11 * u * k, borderRadius: 1 * u, background: fg}} />
          ))}
        </div>
        <div style={{position: 'relative', width: 24 * u, height: 11.5 * u, borderRadius: 3.5 * u, border: `${1 * u}px solid ${dim}`, padding: 1.6 * u, boxSizing: 'border-box'}}>
          <div style={{width: '78%', height: '100%', borderRadius: 2 * u, background: fg}} />
          <div style={{position: 'absolute', right: -3 * u, top: 3.4 * u, width: 1.6 * u, height: 3.6 * u, borderRadius: 1 * u, background: dim}} />
        </div>
      </div>
    </div>
  );
};

/** Téléphone : la barre d'état, puis la page filmée, entière */
export const Phone: React.FC<{clip?: Clip; w: number}> = ({clip, w}) => {
  const {b, sw, sh, h, bar} = phoneDims(w);
  const R = w * 0.17;
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      {/* boutons latéraux */}
      <div style={{position: 'absolute', left: -w * 0.012, top: h * 0.2, width: w * 0.014, height: h * 0.06, borderRadius: 4, background: '#22252B'}} />
      <div style={{position: 'absolute', left: -w * 0.012, top: h * 0.29, width: w * 0.014, height: h * 0.1, borderRadius: 4, background: '#22252B'}} />
      <div style={{position: 'absolute', right: -w * 0.012, top: h * 0.25, width: w * 0.014, height: h * 0.13, borderRadius: 4, background: '#22252B'}} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: R,
          background: '#141619',
          boxShadow: `0 ${w * 0.08}px ${w * 0.2}px rgba(0, 0, 0, 0.26), inset 0 0 0 ${w * 0.006}px rgba(255, 255, 255, 0.16)`,
        }}
      />
      <div style={{position: 'absolute', left: b, top: b, width: sw, height: sh, borderRadius: R - b, overflow: 'hidden', background: C.paper}}>
        <StatusBar w={sw} h={bar} />
        <div style={{position: 'absolute', left: 0, top: bar, width: sw, height: sh - bar, overflow: 'hidden'}}>
          {clip ? <Screen clip={clip} w={sw} h={sh - bar} touch /> : null}
        </div>
        <div style={{position: 'absolute', left: '50%', top: sw * 0.03, width: sw * 0.3, height: sw * 0.085, marginLeft: -sw * 0.15, borderRadius: 999, background: '#000'}} />
      </div>
    </div>
  );
};
