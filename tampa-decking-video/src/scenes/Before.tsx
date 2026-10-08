import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import before from '../../public/before/desktop.json';
import {Line} from '../Bits';
import {BrowserAt, Box} from '../Stage';
import {barH, browserH} from '../Screen';
import {MARK} from '../beats.ts';
import {RISE} from '../timeline';
import {BODY, C, E, F, H2, H3, range} from '../util';

// la vraie page d'accueil actuelle, capturée en entier en 2× (1440 × 2635 px CSS)
const PAGE_W = 1440;
const PAGE_H = before.height;
const B: Box = {x: 1296, y: 548, w: 1064};
const VW = B.w;
const VH = browserH(B.w) - barH(B.w);
const CODE = before.wpforms[0];

/** Cadrages de la page dans le navigateur : point du document au centre de la fenêtre, et grossissement */
type View = {t: number; cx: number; cy: number; z: number};
const VIEWS: View[] = [
  {t: 0, cx: 720, cy: 450, z: 1},
  {t: 66, cx: 720, cy: 450, z: 1},
  {t: 140, cx: 500, cy: 300, z: 1.32},
  {t: 176, cx: 520, cy: 300, z: 1.34},
  {t: 238, cx: 960, cy: 330, z: 1.2},
  {t: 268, cx: 955, cy: 332, z: 1.21},
  {t: 340, cx: CODE.x + CODE.w / 2, cy: CODE.y + CODE.h / 2, z: 2.6},
  {t: 410, cx: CODE.x + CODE.w / 2 + 6, cy: CODE.y + CODE.h / 2, z: 2.68},
  {t: 470, cx: 790, cy: 780, z: 1.6},
];
const viewAt = (t: number) => {
  if (t <= VIEWS[0].t) return VIEWS[0];
  for (let i = 1; i < VIEWS.length; i++) {
    const a = VIEWS[i - 1];
    const b = VIEWS[i];
    if (t <= b.t) {
      const u = E.inOut((t - a.t) / (b.t - a.t));
      const z = Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * u);
      return {t, cx: a.cx + (b.cx - a.cx) * u, cy: a.cy + (b.cy - a.cy) * u, z};
    }
  }
  return VIEWS[VIEWS.length - 1];
};

const FINDINGS: [string, string, number][] = [
  ['No menu', 'No header, no navigation. Most of their 43 pages can only be found through Google.', 74],
  ['A stock photo up top', 'A pergola with no pool, under a dark veil. Their own pools get four small thumbnails.', 180],
  ['The estimate form is broken', 'Where the form should be, every page shows a line of raw code.', 290],
];

/** Aujourd'hui : la page actuelle dans un navigateur ; trois constats tirés de l'analyse, la caméra va chercher chaque preuve */
export const Before: React.FC = () => {
  const t = useCurrentFrame() - RISE;
  const v = viewAt(t);
  const k = (VW / PAGE_W) * v.z;
  // la page ne laisse jamais voir de vide autour d'elle
  const left = Math.min(0, Math.max(VW - PAGE_W * k, VW / 2 - v.cx * k));
  const top = Math.min(0, Math.max(VH - PAGE_H * k, VH / 2 - v.cy * k));
  const shift = (at: number) => range(t, at, at + 44, 118, 0, E.out);
  const up = (at: number) => ({opacity: range(t, at, at + 30, 0, 1), transform: `translateY(${range(t, at, at + 40, 18, 0, E.out)}px)`});
  // le surligneur passe sur un temps de la musique (temps 22 du montage)
  const mark = range(t, MARK, MARK + 30, 0, 1, E.out);
  const current = FINDINGS.reduce((acc, [, , at], i) => (t >= at ? i : acc), -1);
  return (
    <AbsoluteFill style={{background: C.today}}>
      <BrowserAt b={B}>
        <div style={{position: 'absolute', left, top, width: PAGE_W * k, height: PAGE_H * k}}>
          <Img src={staticFile('before/desktop.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
          {/* le surligneur : le code brut à la place du formulaire */}
          <div
            style={{
              position: 'absolute',
              left: (CODE.x - 12) * k,
              top: (CODE.y - 9) * k,
              width: (CODE.w + 24) * k * mark,
              height: (CODE.h + 18) * k,
              background: 'rgba(242, 214, 75, 0.42)',
              mixBlendMode: 'multiply',
              borderRadius: 3 * k,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: (CODE.x - 12) * k,
              top: (CODE.y - 9) * k,
              width: (CODE.w + 24) * k,
              height: (CODE.h + 18) * k,
              border: `${Math.max(2, 1.6 * k)}px solid ${C.sun}`,
              borderRadius: 4 * k,
              opacity: mark,
              transform: `scale(${1.25 - 0.25 * mark})`,
            }}
          />
        </div>
      </BrowserAt>

      <div style={{position: 'absolute', left: 112, top: 150, width: 600}}>
        <div style={{...H2, fontSize: 70, color: C.ink}}>
          <Line shift={shift(6)}>Today, visitors</Line>
          <Line shift={shift(16)}>get stuck</Line>
        </div>
        <div style={{...BODY, marginTop: 26, fontSize: 25, lineHeight: 1.45, color: C.inkSoft, ...up(40)}}>
          No menu, a broken estimate form, and a stock photo where their pools should be.
        </div>
        <div style={{marginTop: 38, borderTop: `1.5px solid ${C.line}`}}>
          {FINDINGS.map(([h, p, at], i) => (
            <div key={h} style={{position: 'relative', padding: '20px 0 20px 26px', borderBottom: `1.5px solid ${C.line}`, ...up(at), opacity: range(t, at, at + 30, 0, 1) * (i === current ? 1 : 0.5)}}>
              <span style={{position: 'absolute', left: 0, top: 26, width: 6, height: 30, borderRadius: 3, background: i === current ? C.sun : C.line}} />
              <div style={{...H3, fontSize: 33, color: C.ink}}>{h}</div>
              <div style={{...BODY, marginTop: 6, fontSize: 20, lineHeight: 1.45, color: C.inkSoft}}>{p}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 112, bottom: 44, fontFamily: F.sans, fontSize: 17, color: C.inkSoft, opacity: 0.8 * range(t, 60, 90)}}>
        The current homepage, tampadeckingandpools.com, captured on October 8, 2026
      </div>
    </AbsoluteFill>
  );
};
