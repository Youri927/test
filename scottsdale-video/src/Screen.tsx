import React from 'react';
import {OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {interpolate} from 'remotion';
import {C, F, clamp} from './util';

/** Métadonnées d'un plan filmé (capture/shots.mjs) : souris et clics, image par image */
export type Meta = {
  name: string;
  fps: number;
  frames: number;
  width: number;
  height: number;
  mouse: ({x: number; y: number} | null)[];
  clicks: number[];
};

export type Clip = {meta: Meta; from?: number; rate?: number};

const ARROW = 'M1 1 L1 21.5 L6.6 16.4 L10.4 24.8 L14 23.2 L10.3 15 L17.6 15 Z';

const lastMouse = (meta: Meta, src: number) => {
  for (let i = Math.min(src, meta.mouse.length - 1); i >= 0 && i > src - 900; i--) {
    const m = meta.mouse[i];
    if (m) return {m, i};
  }
  return null;
};

const firstMouse = (meta: Meta) => meta.mouse.findIndex((m) => Boolean(m));

/**
 * Écran : joue un plan filmé du site, à la bonne image, avec le curseur
 * (ou le doigt sur mobile) redessiné par-dessus, net à tous les zooms.
 */
export const Screen: React.FC<{clip: Clip; w: number; h: number; touch?: boolean}> = ({clip, w, h, touch = false}) => {
  const f = useCurrentFrame();
  const {meta, from = 0, rate = 1} = clip;
  const src = Math.min(meta.frames - 1, from + Math.floor(f * rate));
  const k = w / meta.width;
  const found = lastMouse(meta, src);
  const first = firstMouse(meta);

  let pointer: React.ReactNode = null;
  if (found && !touch) {
    const {m} = found;
    const appear = interpolate(src, [first, first + 10], [0, 1], clamp);
    const press = meta.clicks.reduce((acc, c) => (src >= c - 2 && src < c + 7 ? Math.min(acc, 0.82) : acc), 1);
    const s = 1.5 * k * press;
    pointer = (
      <>
        {meta.clicks.map((c) => {
          const t = src - c;
          if (t < 0 || t > 26) return null;
          const p = t / 26;
          return (
            <div
              key={c}
              style={{
                position: 'absolute',
                left: m.x * k,
                top: m.y * k,
                width: 70 * k * (0.3 + p),
                height: 70 * k * (0.3 + p),
                marginLeft: -35 * k * (0.3 + p),
                marginTop: -35 * k * (0.3 + p),
                borderRadius: '50%',
                border: `${3 * k}px solid ${C.tungsten}`,
                opacity: (1 - p) * 0.9,
              }}
            />
          );
        })}
        <svg
          width={20 * s}
          height={27 * s}
          viewBox="0 0 20 27"
          style={{position: 'absolute', left: m.x * k - s, top: m.y * k - s, opacity: appear, filter: `drop-shadow(0 ${2 * k}px ${4 * k}px rgba(0,0,0,.55))`}}
        >
          <path d={ARROW} fill="#fff" stroke="#05080c" strokeWidth={1.4} strokeLinejoin="round" />
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
      return (
        <React.Fragment key={c}>
          <div style={{position: 'absolute', left: m.x * k, top: m.y * k, width: 56 * k, height: 56 * k, marginLeft: -28 * k, marginTop: -28 * k, borderRadius: '50%', background: 'rgba(242, 234, 223, 0.42)', boxShadow: '0 0 0 1px rgba(255,255,255,.5)', opacity: press}} />
          <div style={{position: 'absolute', left: m.x * k, top: m.y * k, width: 56 * k * (1 + ring * 1.4), height: 56 * k * (1 + ring * 1.4), marginLeft: -28 * k * (1 + ring * 1.4), marginTop: -28 * k * (1 + ring * 1.4), borderRadius: '50%', border: `${2.5 * k}px solid rgba(255, 198, 110, .9)`, opacity: t >= 0 ? 1 - ring : 0}} />
        </React.Fragment>
      );
    });
  }

  return (
    <div style={{position: 'absolute', inset: 0, width: w, height: h, overflow: 'hidden', background: C.calcaire}}>
      <OffthreadVideo
        src={staticFile(`site/${meta.name}.mp4`)}
        trimBefore={from}
        playbackRate={rate}
        muted
        style={{position: 'absolute', left: 0, top: 0, width: w, height: h}}
      />
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

/** Fenêtre de navigateur sombre, l'adresse du site dans la barre */
export const Browser: React.FC<{clip?: Clip; w: number; glow?: string; children?: React.ReactNode}> = ({clip, w, glow = C.lagon, children}) => {
  const bh = barH(w);
  const ch = (w * SITE_H) / SITE_W;
  const r = w * 0.01;
  return (
    <div style={{position: 'relative', width: w, height: bh + ch}}>
      {/* la lumière du site déborde sur le mur */}
      <div style={{position: 'absolute', left: '-14%', right: '-14%', top: '-18%', bottom: '-18%', background: `radial-gradient(closest-side, ${glow}, transparent)`, opacity: 0.1, filter: `blur(${w * 0.03}px)`}} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: r,
          overflow: 'hidden',
          background: '#E7E0D2',
          boxShadow: `0 ${w * 0.025}px ${w * 0.08}px rgba(43, 32, 20, 0.26), 0 0 0 1px rgba(27, 25, 21, 0.1)`,
        }}
      >
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bh, background: 'linear-gradient(#F7F3EC, #EAE3D6)', borderBottom: '1px solid rgba(27, 25, 21, 0.1)'}}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
            <div key={c} style={{position: 'absolute', left: bh * (0.62 + i * 0.5), top: bh * 0.37, width: bh * 0.26, height: bh * 0.26, borderRadius: '50%', background: c, opacity: 0.85}} />
          ))}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: bh * 0.2,
              height: bh * 0.6,
              width: w * 0.34,
              marginLeft: -w * 0.17,
              borderRadius: 999,
              background: 'rgba(27, 25, 21, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: bh * 0.18,
              fontFamily: F.body,
              fontWeight: 500,
              fontSize: bh * 0.33,
              color: C.mist,
              letterSpacing: '0.01em',
            }}
          >
            <Lock size={bh * 0.36} color={C.mist} />
            scottsdalepoolpatiolandscape.com
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, top: bh, width: w, height: ch}}>
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

export const Phone: React.FC<{clip: Clip; w: number; glow?: string}> = ({clip, w, glow = C.lagon}) => {
  const {b, sw, sh, h} = phoneDims(w);
  const R = w * 0.17;
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <div style={{position: 'absolute', left: '-30%', right: '-30%', top: '-12%', bottom: '-12%', background: `radial-gradient(closest-side, ${glow}, transparent)`, opacity: 0.14, filter: `blur(${w * 0.08}px)`}} />
      {/* boutons latéraux */}
      <div style={{position: 'absolute', left: -w * 0.012, top: h * 0.2, width: w * 0.014, height: h * 0.06, borderRadius: 4, background: '#1E2836'}} />
      <div style={{position: 'absolute', left: -w * 0.012, top: h * 0.29, width: w * 0.014, height: h * 0.1, borderRadius: 4, background: '#1E2836'}} />
      <div style={{position: 'absolute', right: -w * 0.012, top: h * 0.25, width: w * 0.014, height: h * 0.13, borderRadius: 4, background: '#1E2836'}} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: R,
          background: 'linear-gradient(140deg, #2A3646 0%, #121A25 40%, #0A1018 70%, #263242 100%)',
          boxShadow: `0 ${w * 0.08}px ${w * 0.22}px rgba(0, 0, 0, 0.65), inset 0 0 0 ${w * 0.006}px rgba(242, 234, 223, 0.16)`,
        }}
      />
      <div style={{position: 'absolute', left: b, top: b, width: sw, height: sh, borderRadius: R - b, overflow: 'hidden', background: '#000'}}>
        <Screen clip={clip} w={sw} h={sh} touch />
        <div style={{position: 'absolute', left: '50%', top: sw * 0.03, width: sw * 0.3, height: sw * 0.085, marginLeft: -sw * 0.15, borderRadius: 999, background: '#000'}} />
        {/* reflet sur la vitre */}
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,0) 32%)'}} />
      </div>
    </div>
  );
};
