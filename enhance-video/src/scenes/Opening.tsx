import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Sheet, Wall} from '../Bits';
import {BEAT, C, E, F, range} from '../util';
import {FaceStack} from './Stack';

export const OPEN_LEN = 7 * BEAT;
export const AVANT_BG = '#ECEAE6';

/** Ouverture : le visage se dessine, puis se sépare en cinq calques, comme sur le site */
export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const up = (at: number) => ({opacity: range(f, at, at + 30, 0, 1), transform: `translateY(${range(f, at, at + 40, 22, 0, E.out)}px)`});
  const draw = range(f, 30, 120, 1, 0, E.inOut);
  const p = range(f, 130, 250, 0, 1, E.inOut);
  return (
    <AbsoluteFill style={{transform: `scale(${range(f, 0, OPEN_LEN, 1, 1.04)})`}}>
      <Wall />
      <div style={{position: 'absolute', left: 150, top: 250, width: 820}}>
        <div style={{fontFamily: F.display, fontSize: 40, letterSpacing: '-0.02em', color: C.ink, ...up(6)}}>
          Enhance<sup style={{fontFamily: F.body, fontSize: 14, verticalAlign: 20, marginLeft: 2}}>®</sup>
          <span style={{marginLeft: 16, fontFamily: F.body, fontSize: 22, color: C.grey}}>Medical Center, Beverly Hills</span>
        </div>
        <div style={{marginTop: 46, fontFamily: F.display, fontWeight: 300, fontSize: 132, lineHeight: 0.98, letterSpacing: '-0.035em', color: C.ink, ...up(20)}}>
          The face,
          <br />
          layer by layer.
        </div>
        <div style={{marginTop: 44, fontFamily: F.body, fontSize: 28, lineHeight: 1.45, color: C.grey, ...up(70)}}>
          A new website for Dr. Charles S. Lee’s practice.
          <br />
          Redesign concept, October 2026.
        </div>
      </div>
      <div style={{opacity: range(f, 0, 30, 0, 1)}}>
        <FaceStack id="op" x={1420} y={560} scale={1.4} p={p} draw={draw} labels={range(f, 220, 260)} />
      </div>
      <Sheet level={range(f, OPEN_LEN - 50, OPEN_LEN, 0, 1, E.inOut)} tint={AVANT_BG} />
    </AbsoluteFill>
  );
};
