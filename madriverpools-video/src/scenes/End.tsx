import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line, Mark} from '../Bits';
import {END} from '../beats.ts';
import {LEN} from '../timeline';
import {BODY, C, E, F, H2, range} from '../util';

/**
 * Fin, à la nuit : le trait dessine le petit plan du logotype (le bassin, puis le spa en orange), le nom monte,
 * puis ce qui a servi à faire le site ; fondu au noir.
 */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.End;
  const up = (at: number) => ({opacity: range(f, at, at + 26, 0, 1), transform: `translateY(${range(f, at, at + 36, 18, 0, E.out).toFixed(2)}px)`});
  const fade = range(f, len - 46, len - 4, 1, 0, E.inOut);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: fade, background: C.night}}>
        <div style={{position: 'absolute', left: 124, top: 292}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 44}}>
            <Mark size={104} color={C.white} bg={C.night} draw={range(f, END.mark, END.mark + 64, 0, 1, E.inOut)} strokeWidth={1.5} />
            <Line shift={range(f, END.name, END.name + 46, 112, 0, E.out)}>
              <div style={{fontFamily: F.sans, fontWeight: 820, fontStretch: '125%', fontSize: 92, letterSpacing: '-0.035em', lineHeight: 1, color: C.white}}>Mad River Pools</div>
            </Line>
          </div>
          <div style={{...H2, marginTop: 64, fontSize: 52, maxWidth: 1180, lineHeight: 1.04, color: C.white, ...up(END.line)}}>Built from your shapes, your timelines and your photos.</div>
          <div style={{...BODY, marginTop: 30, fontSize: 22, color: 'rgba(244,245,241,.7)', ...up(END.line + 40)}}>madriverpools.com, website redesign concept, October 2026</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
