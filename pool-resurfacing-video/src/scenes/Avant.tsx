import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Sheet, Wall} from '../Bits';
import {CameraRig} from '../lib/camera';
import {BrowserAt, Box} from '../Stage';
import {BEAT, C, DISPLAY, E, F, MONO, range} from '../util';

export const AVANT_LEN = 12 * BEAT;

// la vraie page d'accueil actuelle, capturée en entier (1440 × 20 757 px)
const PAGE_W = 1440;
const B: Box = {x: 1260, y: 540, w: 1060};

const FINDINGS: [string, string, number][] = [
  ['A template, and a typo in the logo.', '“Pool Resuracing”, on every page.', 150],
  ['The finishes are buried.', 'Nine finishes, only described in long paragraphs.', 280],
  ['Twenty thousand pixels of text.', 'The same SEO paragraphs, again and again.', 400],
];

/** Avant : la page d'accueil actuelle défile dans un navigateur ; trois constats tirés de l'analyse */
export const Avant: React.FC = () => {
  const f = useCurrentFrame();
  const k = B.w / PAGE_W;
  // défilement de la page actuelle (px de la capture) : le logo, les services, puis les longs paragraphes
  const y = (() => {
    const keys: [number, number][] = [[0, 0], [90, 0], [200, 3200], [270, 3200], [370, 10350], [440, 10350], [535, 13300]];
    for (let i = 1; i < keys.length; i++) {
      const [fa, ya] = keys[i - 1];
      const [fb, yb] = keys[i];
      if (f <= fb) return ya + (yb - ya) * E.inOut(Math.max(0, (f - fa) / (fb - fa)));
    }
    return keys[keys.length - 1][1];
  })();
  const up = (at: number) => ({opacity: range(f, at, at + 30, 0, 1), transform: `translateY(${range(f, at, at + 40, 22, 0, E.out)}px)`});
  return (
    <AbsoluteFill>
      <Wall tint={C.paper} />
      <CameraRig
        blur={0.4}
        keys={[
          {f: 0, x: 960, y: 540, s: 1.0, ry: 0},
          {f: AVANT_LEN, x: 1000, y: 540, s: 1.05, ry: -3, ease: E.sine},
        ]}
      >
        <BrowserAt b={B} transform="rotateY(-6deg)">
          <Img src={staticFile('before/desktop.jpg')} style={{position: 'absolute', left: 0, top: -y * k, width: B.w}} />
        </BrowserAt>
      </CameraRig>

      <div style={{position: 'absolute', left: 110, top: 140, width: 600}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, ...MONO, fontSize: 17, color: C.accent, ...up(20)}}>
          Before<span style={{width: 30, height: 1.5, background: 'currentColor', opacity: 0.7}} />
        </div>
        <div style={{marginTop: 24, ...DISPLAY, fontWeight: 620, fontStretch: '82%', fontSize: 80, lineHeight: 0.94, color: C.ink, ...up(30)}}>
          Today, the site looks like many others.
        </div>
        <div style={{marginTop: 24, fontFamily: F.body, fontSize: 26, lineHeight: 1.5, color: C.grey, ...up(80)}}>
          The content is good. The page hides it.
        </div>
        <div style={{marginTop: 36, borderTop: `1px solid ${C.lineStrong}`}}>
          {FINDINGS.map(([h, p, at], i) => (
            <div key={h} style={{display: 'flex', gap: 20, padding: '18px 0', borderBottom: `1px solid ${C.lineStrong}`, ...up(at)}}>
              <span style={{...MONO, fontSize: 15, color: C.accent, paddingTop: 8}}>0{i + 1}</span>
              <div>
                <div style={{fontFamily: F.body, fontWeight: 620, fontStretch: '88%', fontSize: 34, lineHeight: 1.05, letterSpacing: '-0.015em', color: C.ink}}>{h}</div>
                <div style={{marginTop: 6, fontFamily: F.body, fontSize: 21, lineHeight: 1.45, color: C.grey}}>{p}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 110, bottom: 46, ...MONO, fontSize: 14, color: C.mist, ...up(60)}}>
        The current home page, poolresurfacingscottsdale.com, October 2026
      </div>
      <Sheet level={range(f, 0, 48, 1, 0, E.inOut)} />
      <Sheet level={range(f, AVANT_LEN - 52, AVANT_LEN, 0, 1, E.inOut)} />
    </AbsoluteFill>
  );
};
