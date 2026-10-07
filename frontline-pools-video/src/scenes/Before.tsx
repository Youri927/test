import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Tile, TileCover, TileReveal, Wall} from '../Bits';
import {CameraRig} from '../lib/camera';
import {BrowserAt, Box} from '../Stage';
import {BEAT, C, DISPLAY, E, F, LABEL, range} from '../util';

export const BEFORE_LEN = 12 * BEAT;

// la vraie page d'accueil actuelle, capturée en entier (1440 × 9 865 px)
const PAGE_W = 1440;
const B: Box = {x: 1270, y: 540, w: 1040};

const FINDINGS: [string, string, number][] = [
  ['A form before anything else.', 'Six fields and a reCAPTCHA greet every visitor. The headline is small yellow italics.', 120],
  ['Their best work, in thumbnails.', 'Four real renovations shown at 250 px, with six lines of fine print each.', 220],
  ['The people are missing.', 'Matt and Jacob are named in 19 of 33 reviews. The homepage shows one review at a time.', 330],
];

/** Avant : la page d'accueil actuelle défile ; trois constats tirés de l'analyse */
export const Before: React.FC = () => {
  const f = useCurrentFrame();
  const k = B.w / PAGE_W;
  const y = (() => {
    const keys: [number, number][] = [[0, 0], [90, 0], [180, 2330], [270, 2330], [350, 7180], [420, 7180], [480, 7300]];
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

      <div style={{position: 'absolute', left: 110, top: 112, width: 590}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, ...LABEL, fontSize: 21, color: C.rust, ...up(16)}}>
          <Tile size={14} color={C.rust} />Today
        </div>
        <div style={{marginTop: 24, ...DISPLAY, fontSize: 70, color: C.ink, ...up(26)}}>
          Today, the work is hidden
        </div>
        <div style={{marginTop: 22, fontFamily: F.body, fontSize: 26, lineHeight: 1.5, color: C.grey, ...up(70)}}>
          Real renovations, a licensed crew, glowing reviews. The homepage barely shows them.
        </div>
        <div style={{marginTop: 30, borderTop: `1px solid ${C.lineStrong}`}}>
          {FINDINGS.map(([h, p, at], i) => (
            <div key={h} style={{display: 'flex', gap: 20, padding: '18px 0', borderBottom: `1px solid ${C.lineStrong}`, ...up(at)}}>
              <span style={{...LABEL, fontSize: 18, color: C.rust, paddingTop: 8}}>{i + 1}</span>
              <div>
                <div style={{fontFamily: F.display, fontStretch: '112%', fontWeight: 750, fontSize: 34, lineHeight: 1.05, letterSpacing: '-0.02em', color: C.ink}}>{h}</div>
                <div style={{marginTop: 6, fontFamily: F.body, fontSize: 21, lineHeight: 1.45, color: C.grey}}>{p}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 110, bottom: 40, fontFamily: F.body, fontSize: 17, color: C.mist, ...up(60)}}>
        The current homepage, frontlinepools.com, October 2026
      </div>
      <TileReveal level={range(f, 0, 50, 0, 1)} color={C.navy} />
      <TileCover level={range(f, BEFORE_LEN - 52, BEFORE_LEN, 0, 1)} color={C.navy} />
    </AbsoluteFill>
  );
};
