import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Compare, Mark, Sheet, Wall} from '../Bits';
import {M} from '../clips';
import {CameraRig} from '../lib/camera';
import {BrowserAt, Box, onSite} from '../Stage';
import {BEAT, C, DISPLAY, E, F, MONO, range} from '../util';

export const FIN_LEN = 9 * BEAT;
const B: Box = {x: 960, y: 530, w: 1500};
const CUT = 200;

/** Fin : le grand numéro du pied de page, puis le nom, et le bassin qui finit neuf */
export const Fin: React.FC = () => {
  const f = useCurrentFrame();
  const g = f - CUT;
  const out = range(f, FIN_LEN - 40, FIN_LEN, 1, 0, E.inOut);
  const up = (at: number) => ({opacity: range(g, at, at + 30, 0, 1), transform: `translateY(${range(g, at, at + 40, 22, 0, E.out)}px)`});
  return (
    <AbsoluteFill style={{opacity: out}}>
      {f < CUT + 50 ? (
        <AbsoluteFill>
          <Wall />
          <CameraRig
            blur={0.5}
            keys={[
              onSite(B, 560, 520, {f: 0, s: 1.4}),
              {f: CUT, x: 960, y: 540, s: 0.98, ease: E.soft},
            ]}
          >
            <BrowserAt b={B} clip={{meta: M.dFooter, from: 120}} />
          </CameraRig>
          <Sheet level={range(f, 0, 50, 1, 0, E.inOut)} />
        </AbsoluteFill>
      ) : null}
      <Sheet level={range(f, CUT - 50, CUT, 0, 1, E.inOut)} />
      {g >= 0 ? (
        <AbsoluteFill>
          <Wall />
          <div style={{position: 'absolute', left: 1210, top: 150, opacity: range(g, 0, 40, 0, 1), transform: `translateY(${range(g, 0, 50, 30, 0, E.out)}px)`}}>
            <Compare w={560} h={720} pos={range(g, 30, 150, 58, 0, E.inOut)} />
          </div>
          <div style={{position: 'absolute', left: 150, top: 230, width: 960}}>
            <div style={up(16)}><Mark size={92} /></div>
            <div style={{marginTop: 34, ...DISPLAY, fontSize: 120, lineHeight: 0.9, color: C.ink, ...up(30)}}>Scottsdale<br />Pool Resurfacing</div>
            <div style={{marginTop: 26, fontFamily: F.body, fontWeight: 500, fontSize: 40, letterSpacing: '-0.01em', color: C.ink, ...up(46)}}>Love your pool again.</div>
            <div style={{marginTop: 44, paddingTop: 22, borderTop: `1px solid ${C.lineStrong}`, ...MONO, fontSize: 18, lineHeight: 1.8, color: C.grey, ...up(90)}}>
              Scottsdale, Arizona · Since 2011 · 480-568-1704
              <br />
              Website redesign concept, October 2026
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
