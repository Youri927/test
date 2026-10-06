import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {ArchCover, ArchGlyph, ArchReveal, Wall} from '../Bits';
import {CameraRig} from '../lib/camera';
import {BrowserAt, Box} from '../Stage';
import {BEAT, C, DISPLAY, E, F, LABEL, range} from '../util';

export const BEFORE_LEN = 10 * BEAT;

// la vraie page d'accueil actuelle, capturée en entier (1440 × 7 822 px)
const PAGE_W = 1440;
const B: Box = {x: 1270, y: 540, w: 1040};

const FINDINGS: [string, string, number][] = [
  ['Stock photos up front.', 'The big hero photo and the family in the pool come from photo banks.', 120],
  ['One paragraph, over and over.', '“Pool remodel Scottsdale”, in capitals, section after section.', 225],
  ['The best answers, hidden.', 'Prices, timing, how long finishes last: in 20 articles the homepage never links to.', 330],
];

/** Avant : la page d'accueil actuelle défile ; trois constats tirés de l'analyse */
export const Before: React.FC = () => {
  const f = useCurrentFrame();
  const k = B.w / PAGE_W;
  const y = (() => {
    const keys: [number, number][] = [[0, 0], [70, 0], [170, 1250], [230, 1250], [320, 3500], [370, 3500], [450, 5500]];
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
          {f: BEFORE_LEN, x: 1000, y: 540, s: 1.05, ry: -3, ease: E.sine},
        ]}
      >
        <BrowserAt b={B} transform="rotateY(-6deg)">
          <Img src={staticFile('before/desktop.jpg')} style={{position: 'absolute', left: 0, top: -y * k, width: B.w}} />
        </BrowserAt>
      </CameraRig>

      <div style={{position: 'absolute', left: 110, top: 130, width: 620}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, ...LABEL, fontSize: 16, color: C.rust, ...up(16)}}>
          <ArchGlyph size={22} color={C.rust} />Today
        </div>
        <div style={{marginTop: 24, ...DISPLAY, fontSize: 92, lineHeight: 0.94, color: C.ink, ...up(26)}}>
          Today, WAVE blends in.
        </div>
        <div style={{marginTop: 22, fontFamily: F.body, fontSize: 26, lineHeight: 1.5, color: C.grey, ...up(70)}}>
          Good company, good content. The website hides both.
        </div>
        <div style={{marginTop: 34, borderTop: `1px solid ${C.lineStrong}`}}>
          {FINDINGS.map(([h, p, at], i) => (
            <div key={h} style={{display: 'flex', gap: 20, padding: '18px 0', borderBottom: `1px solid ${C.lineStrong}`, ...up(at)}}>
              <span style={{...LABEL, fontSize: 14, color: C.rust, paddingTop: 9}}>0{i + 1}</span>
              <div>
                <div style={{fontFamily: F.display, fontWeight: 560, fontSize: 36, lineHeight: 1.05, letterSpacing: '-0.025em', color: C.ink}}>{h}</div>
                <div style={{marginTop: 6, fontFamily: F.body, fontSize: 21, lineHeight: 1.45, color: C.grey}}>{p}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 110, bottom: 44, fontFamily: F.body, fontSize: 16, color: C.mist, ...up(60)}}>
        The current homepage, poolremodelingscottsdaleaz.com, October 2026
      </div>
      <ArchReveal level={range(f, 0, 48, 0, 1, E.inOut)} color={C.paper} />
      <ArchCover level={range(f, BEFORE_LEN - 50, BEFORE_LEN, 0, 1, E.inOut)} color={C.night} />
    </AbsoluteFill>
  );
};
