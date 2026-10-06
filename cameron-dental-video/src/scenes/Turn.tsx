import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line, WipeCover} from '../Bits';
import {BEAT, C, DISPLAY, E, range} from '../util';

export const TURN_LEN = 5 * BEAT;

/** La bascule : sur le bleu marine, la phrase de la vidéo. Puis la ligne balaie vers le blanc du nouveau site. */
export const Turn: React.FC = () => {
  const f = useCurrentFrame();
  const shift = (at: number) => range(f, at, at + 46, 118, 0, E.out);
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <div style={{position: 'absolute', left: 150, top: 260, ...DISPLAY, fontSize: 158, color: C.paper, transform: `scale(${range(f, 0, TURN_LEN, 1, 1.04)})`, transformOrigin: '0 50%'}}>
        <Line shift={shift(4)}>Your best proof?</Line>
        <Line shift={shift(14)}>Your patients’</Line>
        <Line shift={shift(24)}><span style={{color: C.light}}>smiles.</span></Line>
      </div>
      <WipeCover level={range(f, TURN_LEN - 50, TURN_LEN, 0, 1, E.inOut)} color={C.paper} />
    </AbsoluteFill>
  );
};
