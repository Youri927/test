import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Tooth, Wall, WipeCover, WipeReveal} from '../Bits';
import {CameraRig} from '../lib/camera';
import {BrowserAt, Box} from '../Stage';
import {BEAT, C, DISPLAY, E, F, LABEL, range} from '../util';

export const BEFORE_LEN = 10 * BEAT;

// la vraie page d'accueil actuelle, capturée en entier (1440 × 8 851 px)
const PAGE_W = 1440;
const B: Box = {x: 1270, y: 540, w: 1040};

const FINDINGS: [string, string, number][] = [
  ['Stock photos, not their patients.', 'The service tiles use photo-bank images: a couple on a sofa, a woman with a toothache.', 120],
  ['The best proof, behind a button.', '18 real before-and-after cases live in a gallery. The homepage shows one face.', 225],
  ['Magazine covers next to movie posters.', 'The “celebrity smiles” wall mixes patients’ real covers with film posters and an old ad.', 330],
];

/** Avant : la page d'accueil actuelle défile ; trois constats tirés de l'analyse */
export const Before: React.FC = () => {
  const f = useCurrentFrame();
  const k = B.w / PAGE_W;
  const y = (() => {
    const keys: [number, number][] = [[0, 0], [70, 0], [160, 1300], [230, 1300], [300, 2980], [350, 2980], [420, 4300], [450, 4380]];
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
      <Wall tint={C.bg} />
      <CameraRig
        blur={0.4}
        keys={[
          {f: 0, x: 960, y: 540, s: 1.0, ry: 0},
          {f: BEFORE_LEN, x: 1000, y: 540, s: 1.05, ry: -3, ease: E.sine},
        ]}
      >
        <BrowserAt b={B} transform="rotateY(-6deg)">
          <Img src={staticFile('before/desktop.jpg')} style={{position: 'absolute', left: 0, top: -y * k, width: B.w}} />
        </BrowserAt>
      </CameraRig>

      <div style={{position: 'absolute', left: 110, top: 120, width: 640}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, ...LABEL, fontSize: 21, color: C.rust, ...up(16)}}>
          <Tooth size={26} color={C.rust} />Today
        </div>
        <div style={{marginTop: 22, ...DISPLAY, fontSize: 92, lineHeight: 0.94, color: C.ink, ...up(26)}}>
          Today, the proof is hidden.
        </div>
        <div style={{marginTop: 22, fontFamily: F.body, fontSize: 26, lineHeight: 1.5, color: C.grey, ...up(70)}}>
          Real results, gentle care, a top-rated team. The homepage barely shows them.
        </div>
        <div style={{marginTop: 30, borderTop: `1px solid ${C.lineStrong}`}}>
          {FINDINGS.map(([h, p, at], i) => (
            <div key={h} style={{display: 'flex', gap: 20, padding: '18px 0', borderBottom: `1px solid ${C.lineStrong}`, ...up(at)}}>
              <span style={{...LABEL, fontSize: 18, color: C.rust, paddingTop: 8}}>{i + 1}</span>
              <div>
                <div style={{fontFamily: F.display, fontStretch: '90%', fontWeight: 600, fontSize: 36, lineHeight: 1.05, letterSpacing: '-0.02em', color: C.ink}}>{h}</div>
                <div style={{marginTop: 6, fontFamily: F.body, fontSize: 21, lineHeight: 1.45, color: C.grey}}>{p}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 110, bottom: 40, fontFamily: F.body, fontSize: 17, color: C.mist, ...up(60)}}>
        The current homepage, camerondentalstudio.com, October 2026
      </div>
      <WipeReveal level={range(f, 0, 48, 0, 1, E.inOut)} color={C.bg} />
      <WipeCover level={range(f, BEFORE_LEN - 50, BEFORE_LEN, 0, 1, E.inOut)} color={C.ink} />
    </AbsoluteFill>
  );
};
