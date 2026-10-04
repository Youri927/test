import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Mark, Sheet, Wall} from '../Bits';
import {M} from '../clips';
import {CameraRig} from '../lib/camera';
import {BrowserAt, Box, onSite} from '../Stage';
import {BEAT, C, E, F, H, W, range} from '../util';

export const FIN_LEN = 9 * BEAT;
const B: Box = {x: 960, y: 530, w: 1500};
const CUT = 205;

/** Fin : le grand mot du pied de page se remplit, puis le nom, et le soleil qui se couche */
export const Fin: React.FC = () => {
  const f = useCurrentFrame();
  const g = f - CUT;
  const out = range(f, FIN_LEN - 40, FIN_LEN, 1, 0, E.inOut);
  const up = (at: number) => ({opacity: range(g, at, at + 30, 0, 1), transform: `translateY(${range(g, at, at + 40, 22, 0, E.out)}px)`});
  // le soleil : la photo dans un cercle qui descend doucement vers l'horizon
  const r = range(g, 0, 90, 0, 300, E.soft);
  const cy = 520 + range(g, 0, FIN_LEN - CUT, 0, 40, E.sine);
  return (
    <AbsoluteFill style={{opacity: out}}>
      {f < CUT + 50 ? (
        <AbsoluteFill>
          <Wall />
          <CameraRig
            blur={0.5}
            keys={[
              onSite(B, 560, 600, {f: 0, s: 1.5}),
              {f: CUT, x: 960, y: 540, s: 0.98, ease: E.soft},
            ]}
          >
            <BrowserAt b={B} clip={{meta: M.dFooter, from: 0, rate: 1.6}} />
          </CameraRig>
          <Sheet level={range(f, 0, 50, 1, 0, E.inOut)} />
        </AbsoluteFill>
      ) : null}
      <Sheet level={range(f, CUT - 50, CUT, 0, 1, E.inOut)} />
      {g >= 0 ? (
        <AbsoluteFill>
          <Wall slats={1} />
          <AbsoluteFill style={{clipPath: `circle(${Math.max(0.01, r)}px at 1350px ${cy}px)`}}>
            <Img src={staticFile('img/hero.webp')} style={{position: 'absolute', left: 0, top: 0, width: W, height: H, objectFit: 'cover', objectPosition: '50% 62%', transform: `translate(${1350 - W * 0.52 * 1.15}px, ${cy - H * 0.7 * 1.15}px) scale(1.15)`, transformOrigin: '0 0'}} />
          </AbsoluteFill>
          <div style={{position: 'absolute', left: 150, top: 300, width: 900}}>
            <div style={up(20)}><Mark size={72} /></div>
            <div style={{marginTop: 30, fontFamily: F.body, fontWeight: 640, fontSize: 84, lineHeight: 0.9, letterSpacing: '-0.015em', textTransform: 'uppercase', fontVariationSettings: '"wdth" 125', color: C.ink, ...up(34)}}>Scottsdale</div>
            <div style={{marginTop: 12, fontFamily: F.display, fontStyle: 'italic', fontSize: 64, lineHeight: 1, color: C.ink, ...up(48)}}>Pool, Patio &amp; Landscape Design</div>
            <div style={{marginTop: 50, paddingTop: 22, borderTop: `1px solid ${C.lineStrong}`, fontFamily: F.body, fontSize: 26, lineHeight: 1.55, color: C.grey, ...up(90)}}>
              Scottsdale, Arizona · ROC #329650
              <br />
              Website redesign concept, October 2026
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
