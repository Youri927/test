import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Caption, Ceramic, Surface, wavePoints} from '../Bits';
import {M} from '../clips';
import {CameraRig, CamKey, camAt} from '../lib/camera';
import {BrowserAt, Box, aside, asideBottom, asideWidth, focus} from '../Stage';
import {barH, browserH} from '../Screen';
import {OPEN, TIMING} from '../beats.ts';
import {LEN} from '../timeline';
import {C, E, F, H, W, range} from '../util';

const B: Box = {x: 960, y: 552, w: 1480};
/** accélère sur le premier quart, vitesse constante, ralentit sur le dernier quart */
const cruise = (t: number, a = 0.25, b = 0.25) => {
  const v = 1 / (1 - a / 2 - b / 2);
  if (t < a) return (v * t * t) / (2 * a);
  if (t > 1 - b) return 1 - (v * (1 - t) * (1 - t)) / (2 * b);
  return v * (t - a / 2);
};
const WIDE = {x: 960, y: 552, s: 1.0};
const SIDE = 0.8;

/** Étiquette « Before » / « After », comme celles de l'avant/après du site (en plus grand, pour la vidéo) */
const Tag: React.FC<{children: string; style: React.CSSProperties}> = ({children, style}) => (
  <div style={{position: 'absolute', padding: '9px 20px 10px', borderRadius: 999, background: 'rgba(10, 30, 40, .66)', color: '#fff', fontFamily: F.sans, fontWeight: 600, fontSize: 24, letterSpacing: '0.005em', ...style}}>
    {children}
  </div>
);

/**
 * Ouverture : le site actuel, puis l'eau monte sur toute l'image (la céramique beige du fond fait place au bleu du bassin)
 * et découvre le nouveau site, qui se charge : le titre monte, la frise beige se recarrelle en mosaïque de verre, le reflet passe.
 */
export const Open: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.Open;
  const keys: CamKey[] = [
    {...WIDE, f: 0, s: 0.86},
    {...WIDE, f: OPEN.site, s: 0.89, ease: E.sine},
    {...WIDE, f: OPEN.site + 56, s: 1.0, ease: E.soft},
    // la pose de la frise, de gauche à droite, puis le reflet
    focus(B, 520, 545, {f: OPEN.lay + 70, s: 1.3, ease: E.soft}),
    focus(B, 940, 545, {f: OPEN.set + 40, s: 1.34, ease: E.sine}),
    focus(B, 1040, 540, {f: OPEN.set + 110, s: 1.35, ease: E.sine}),
    aside(B, 'right', {f: OPEN.set + 172, s: SIDE, ease: E.soft}),
    aside(B, 'right', {f: len, s: SIDE + 0.014, ease: E.sine}),
  ];
  const cam = camAt(keys, f);

  // la ligne d'eau, en px de l'image : sous le bas de l'image au départ, au-dessus du haut à l'arrivée ; elle accélère,
  // monte à vitesse régulière, puis ralentit (on a le temps de voir l'ancien site disparaître)
  const rise = cruise(range(f, OPEN.water, OPEN.top));
  const y0 = H + 40 - rise * (H + 110);
  const wet = rise > 0;
  const pts = wavePoints(f, y0);
  const above = `polygon(-40px -40px, ${W + 40}px -40px, ${pts
    .slice()
    .reverse()
    .map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`)
    .join(', ')})`;

  // la même ligne dans le repère de la page du navigateur (pour couper l'ancien site au-dessus de l'eau)
  const left = B.x - B.w / 2;
  const top = B.y - browserH(B.w) / 2 + barH(B.w);
  const local = ([x, y]: [number, number]) => [(x - W / 2) / cam.s + cam.x - left, (y - H / 2) / cam.s + cam.y - top];
  const oldClip = `polygon(-40px -40px, ${B.w + 40}px -40px, ${pts
    .slice()
    .reverse()
    .map((p) => local(p).map((v) => `${v.toFixed(1)}px`).join(' '))
    .join(', ')})`;
  const ch = (B.w * 900) / 1440;
  const k = B.w / 1440;

  return (
    <AbsoluteFill style={{background: C.deep}}>
      {f <= OPEN.top + 2 ? (
        <AbsoluteFill style={{clipPath: wet ? above : undefined}}>
          <Ceramic />
        </AbsoluteFill>
      ) : null}
      <CameraRig blur={0.5} keys={keys}>
        <BrowserAt b={B} clip={{meta: M.dOpen, ...TIMING.Open}}>
          {/* « After » sur le nouveau site, découvert par l'eau ; l'ancien site par-dessus, coupé à la ligne d'eau */}
          <Tag style={{left: 24 * k, top: ch - 70 * k, opacity: range(f, OPEN.top + 20, OPEN.top + 44, 1, 0)}}>After</Tag>
          {f <= OPEN.top + 2 ? (
            <div style={{position: 'absolute', left: 0, top: 0, width: B.w, height: ch, clipPath: wet ? oldClip : undefined}}>
              <Img src={staticFile('old/home.jpg')} style={{position: 'absolute', left: 0, top: 0, width: B.w, height: ch}} />
              <Tag style={{left: 24 * k, top: 168 * k}}>Before</Tag>
            </div>
          ) : null}
        </BrowserAt>
      </CameraRig>
      {wet && y0 > -60 ? <Surface y0={y0} f={f} /> : null}
      <Caption
        brand
        title="Your new website"
        text="It opens on a 1980s beige waterline, then retiles it in glass mosaic, one tile at a time."
        at={OPEN.set + 150}
        out={len - 12}
        tone="dark"
        side="right"
        width={asideWidth(B, SIDE)}
        bottom={asideBottom(B, SIDE)}
      />
    </AbsoluteFill>
  );
};
