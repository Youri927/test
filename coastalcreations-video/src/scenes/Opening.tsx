import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line, Logo, Photo} from '../Bits';
import {OPEN} from '../beats.ts';
import {LEN} from '../timeline';
import {C, E, H2, range} from '../util';

/** Ouverture : leur photo de l'accueil sort du noir, le logo monte, puis « Your new website » */
export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.Opening;
  const photo = range(f, OPEN.photo, OPEN.photo + 40, 0, 1, E.sine);
  const sub = range(f, OPEN.sub, OPEN.sub + 40, 0, 1, E.out);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: photo}}>
        <Photo zoom={1.1 - 0.08 * E.sine(range(f, 0, len))} shade={range(f, OPEN.logo - 30, OPEN.logo + 20, 0.25, 1, E.sine)} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 132, top: 250}}>
        <Line shift={range(f, OPEN.logo, OPEN.logo + 56, 112, 0, E.out)}>
          <Logo height={300} />
        </Line>
        <div style={{...H2, marginTop: 40, fontSize: 64, color: C.white, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)`}}>Your new website</div>
      </div>
    </AbsoluteFill>
  );
};
