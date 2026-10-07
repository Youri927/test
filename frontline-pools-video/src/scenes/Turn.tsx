import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line, TileCover} from '../Bits';
import {BEAT, C, DISPLAY, E, range} from '../util';

export const TURN_LEN = 5 * BEAT;

/** La bascule : sur le bleu marine, l'idée du nouveau site. Puis les carreaux couvrent l'écran du gris du site. */
export const Turn: React.FC = () => {
  const f = useCurrentFrame();
  const shift = (at: number) => range(f, at, at + 44, 118, 0, E.out);
  return (
    <AbsoluteFill style={{background: C.navy}}>
      <div style={{position: 'absolute', left: 150, top: 400, ...DISPLAY, fontSize: 124, color: C.paper, transform: `scale(${range(f, 0, TURN_LEN, 1, 1.04)})`, transformOrigin: '0 50%'}}>
        <Line shift={shift(4)}>Keep the shell,</Line>
        <Line shift={shift(16)}><span style={{color: C.yellow}}>renew the rest</span></Line>
      </div>
      <TileCover level={range(f, TURN_LEN - 52, TURN_LEN, 0, 1)} color={C.bg} />
    </AbsoluteFill>
  );
};
