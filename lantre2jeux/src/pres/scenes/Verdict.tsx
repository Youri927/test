import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CameraRig} from '../../lib/camera';
import {Caption, Wall} from '../Bits';
import {M} from '../clips';
import {BrowserAt, Box, onSite, whipIn, whipOut} from '../Stage';
import {BEAT, E} from '../util';

export const VERDICT_LEN = 5 * BEAT;
const B: Box = {x: 735, y: 540, w: 1240};

/** 04 · Le verdict : la note roule, les avis s'affichent */
export const Verdict: React.FC = () => (
  <AbsoluteFill>
    <Wall gx={38} gy={50} strength={0.07} />
    <CameraRig
      blur={1.1}
      keys={[
        ...whipIn({f: 0, x: 960, y: 540, s: 1.0, rz: 0}, 22),
        {f: 116, x: 960, y: 540, s: 1.03, ease: E.sine},
        // la note, en grand
        onSite(B, 330, 440, {f: VERDICT_LEN - 14, s: 1.85, rz: -0.6, ease: E.inOut}),
        ...whipOut(onSite(B, 340, 440, {f: 0, s: 1.87, rz: -0.6}), VERDICT_LEN, 14),
      ]}
    >
      <BrowserAt b={B} clip={{meta: M.dVerdict, from: 50}} />
      <div style={{position: 'absolute', left: 1430, top: 330}}>
        <Caption num="04" title="Le verdict" text="4,6/5 sur 62 avis : les vraies notes des joueurs, mises en scène comme une preuve." at={16} width={420} />
      </div>
    </CameraRig>
  </AbsoluteFill>
);
