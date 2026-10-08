import React from 'react';
import {Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, F, clamp} from './util';

/** Métadonnées d'un plan filmé (capture/shots.mjs) : souris et clics image par image, repères relevés */
export type Meta = {
  name: string;
  fps: number;
  frames: number;
  width: number;
  height: number;
  mouse: ({x: number; y: number} | null)[];
  clicks: number[];
  marks?: Record<string, number>;
  values?: Record<string, (number | null)[]>;
};

/** Plan joué à l'écran : `delay` images figées sur la première, puis lecture à `rate` à partir de l'image `from` */
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
 * Écran : joue un plan filmé du site, à la bonne image, avec le curseur
 * (ou le doigt sur mobile) redessiné par-dessus, net à tous les zooms.
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
              style={{position: 'absolute', left: m.x * k - d / 2, top: m.y * k - d / 2, width: d, height: d, borderRadius: '50%', border: `${3 * k}px solid ${C.teal}`, opacity: (1 - p) * 0.95}}
            />
          );
        })}
        <svg
          width={20 * s}
          height={27 * s}
          viewBox="0 0 20 27"
          style={{position: 'absolute', left: m.x * k - s, top: m.y * k - s, opacity: appear, filter: `drop-shadow(0 ${2 * k}px ${4 * k}px rgba(11, 35, 38, .45))`}}
        >
          <path d={ARROW} fill="#fff" stroke={C.ink} strokeWidth={1.4} strokeLinejoin="round" />
        </svg>
      </>
    );
  }
  if (touch) {
    pointer = meta.clicks.map((c) => {
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
          <div style={{position: 'absolute', left: m.x * k - d / 2, top: m.y * k - d / 2, width: d, height: d, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.55)', boxShadow: '0 0 0 1px rgba(11, 35, 38, .22)', opacity: press}} />
          <div style={{position: 'absolute', left: m.x * k - dr / 2, top: m.y * k - dr / 2, width: dr, height: dr, borderRadius: '50%', border: `${2.5 * k}px solid ${C.teal}`, opacity: t >= 0 ? 1 - ring : 0}} />
        </React.Fragment>
      );
    });
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
    <div style={{position: 'absolute', inset: 0, width: w, height: h, overflow: 'hidden', background: C.white}}>
      {shown}
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

export const DOMAIN = 'naplescomprehensivedentist.com';

/** Fenêtre de navigateur claire, l'adresse du site dans la barre (chemin éventuel en plus clair) */
export const Browser: React.FC<{clip?: Clip; w: number; path?: string; dark?: boolean; children?: React.ReactNode}> = ({clip, w, path = '', dark = false, children}) => {
  const bh = barH(w);
  const ch = (w * SITE_H) / SITE_W;
  const r = w * 0.009;
  return (
    <div style={{position: 'relative', width: w, height: bh + ch}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: r,
          overflow: 'hidden',
          background: C.white,
          boxShadow: dark
            ? `0 ${w * 0.03}px ${w * 0.08}px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(255, 255, 255, 0.08)`
            : `0 ${w * 0.024}px ${w * 0.07}px rgba(11, 35, 38, 0.18), 0 0 0 1px rgba(11, 35, 38, 0.08)`,
        }}
      >
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bh, background: '#F6F8F8', borderBottom: '1px solid rgba(11, 35, 38, 0.08)'}}>
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
              background: 'rgba(11, 35, 38, 0.055)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: bh * 0.18,
              fontFamily: F.sans,
              fontWeight: 500,
              fontSize: bh * 0.33,
              color: C.inkSoft,
              letterSpacing: '0.005em',
              whiteSpace: 'nowrap',
            }}
          >
            <Lock size={bh * 0.36} color={C.inkSoft} />
            <span>
              {DOMAIN}
              <span style={{opacity: 0.6}}>{path}</span>
            </span>
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
export const phoneDims = (w: number) => {
  const b = w * 0.042;
  const sw = w - 2 * b;
  const sh = (sw * 844) / 390;
  return {b, sw, sh, h: sh + 2 * b};
};

export const Phone: React.FC<{clip: Clip; w: number}> = ({clip, w}) => {
  const {b, sw, sh, h} = phoneDims(w);
  const R = w * 0.17;
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      {/* boutons latéraux */}
      <div style={{position: 'absolute', left: -w * 0.012, top: h * 0.2, width: w * 0.014, height: h * 0.06, borderRadius: 4, background: '#1D2A2C'}} />
      <div style={{position: 'absolute', left: -w * 0.012, top: h * 0.29, width: w * 0.014, height: h * 0.1, borderRadius: 4, background: '#1D2A2C'}} />
      <div style={{position: 'absolute', right: -w * 0.012, top: h * 0.25, width: w * 0.014, height: h * 0.13, borderRadius: 4, background: '#1D2A2C'}} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: R,
          background: '#122022',
          boxShadow: `0 ${w * 0.08}px ${w * 0.2}px rgba(11, 35, 38, 0.35), inset 0 0 0 ${w * 0.006}px rgba(255, 255, 255, 0.16)`,
        }}
      />
      <div style={{position: 'absolute', left: b, top: b, width: sw, height: sh, borderRadius: R - b, overflow: 'hidden', background: '#000'}}>
        <Screen clip={clip} w={sw} h={sh} touch />
        <div style={{position: 'absolute', left: '50%', top: sw * 0.03, width: sw * 0.3, height: sw * 0.085, marginLeft: -sw * 0.15, borderRadius: 999, background: '#000'}} />
      </div>
    </div>
  );
};
