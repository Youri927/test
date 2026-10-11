import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line, Logo, NightPool} from '../Bits';
import {OPEN} from '../beats.ts';
import {LEN} from '../timeline';
import {C, E, H2, range} from '../util';

/** Ouverture : sur la nuit, la piscine du jour 41 s'allume, le logotype monte, puis « Your new website » */
export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.Opening;
  const photo = range(f, OPEN.photo, OPEN.photo + 30, 0, 1, E.sine);
  const lit = range(f, 10, 70, 0, 1, E.inOut);
  const sub = range(f, OPEN.sub, OPEN.sub + 36, 0, 1, E.out);
  return (
    <AbsoluteFill style={{background: C.night}}>
      <div style={{opacity: photo}}>
        <NightPool lit={lit} zoom={1.08 - 0.06 * E.sine(range(f, 0, len))} x={860} y={190} w={940} />
      </div>
      <div style={{position: 'absolute', left: 124, top: 330}}>
        <Line shift={range(f, OPEN.logo, OPEN.logo + 50, 112, 0, E.out)}>
          <Logo size={128} stacked />
        </Line>
        <div style={{...H2, marginTop: 44, fontSize: 56, color: C.water, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)`}}>Your new website</div>
      </div>
    </AbsoluteFill>
  );
};
