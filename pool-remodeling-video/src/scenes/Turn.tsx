import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ArchCover, Line} from '../Bits';
import {BEAT, C, DISPLAY, E, range} from '../util';

export const TURN_LEN = 5 * BEAT;

/** La bascule : sur la nuit de la marque, la phrase de la vidéo. Puis le sable du midi monte comme un soleil. */
export const Turn: React.FC = () => {
  const f = useCurrentFrame();
  const shift = (at: number) => range(f, at, at + 46, 118, 0, E.out);
  return (
    <AbsoluteFill style={{background: C.night}}>
      <div style={{position: 'absolute', left: 150, top: 250, ...DISPLAY, fontSize: 150, color: C.sand, transform: `scale(${range(f, 0, TURN_LEN, 1, 1.04)})`, transformOrigin: '0 50%'}}>
        <Line shift={shift(4)}>In a crowded market,</Line>
        <Line shift={shift(14)}>the best website</Line>
        <Line shift={shift(24)}><span style={{color: C.lime}}>wins the call.</span></Line>
      </div>
      <ArchCover level={range(f, TURN_LEN - 50, TURN_LEN, 0, 1, E.inOut)} color={C.bg} />
    </AbsoluteFill>
  );
};
