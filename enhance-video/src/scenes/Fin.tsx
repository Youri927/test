import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Sheet, Wall} from '../Bits';
import {BEAT, C, E, F, range} from '../util';
import {FaceStack} from './Stack';

export const FIN_LEN = 8 * BEAT;

/** Fin : la pile se referme sur le visage, le nom, puis tout s'éteint */
export const Fin: React.FC = () => {
  const f = useCurrentFrame();
  const out = range(f, FIN_LEN - 40, FIN_LEN, 1, 0, E.inOut);
  const up = (at: number) => ({opacity: range(f, at, at + 30, 0, 1), transform: `translateY(${range(f, at, at + 40, 22, 0, E.out)}px)`});
  const p = range(f, 20, 150, 1, 0, E.inOut);
  return (
    <AbsoluteFill style={{opacity: out, transform: `scale(${range(f, 0, FIN_LEN, 1.03, 1)})`}}>
      <Wall />
      <FaceStack id="fin" x={1380} y={560} scale={1.05} p={p} draw={0} labels={range(f, 0, 40, 1, 0)} />
      <div style={{position: 'absolute', left: 150, top: 300, width: 820}}>
        <div style={{fontFamily: F.display, fontSize: 96, lineHeight: 1, letterSpacing: '-0.03em', color: C.ink, ...up(30)}}>
          Enhance<sup style={{fontFamily: F.body, fontSize: 26, verticalAlign: 52, marginLeft: 4}}>®</sup>
        </div>
        <div style={{marginTop: 18, fontFamily: F.display, fontWeight: 300, fontSize: 44, lineHeight: 1.2, color: C.ink, ...up(60)}}>Medical Center, Beverly Hills</div>
        <div style={{marginTop: 52, paddingTop: 22, borderTop: `1px solid ${C.lineStrong}`, fontFamily: F.body, fontSize: 26, lineHeight: 1.55, color: C.grey, ...up(110)}}>
          Charles S. Lee, MD, FACS
          <br />
          Website redesign concept, October 2026
        </div>
      </div>
      <Sheet level={range(f, 0, 50, 1, 0, E.inOut)} />
    </AbsoluteFill>
  );
};
