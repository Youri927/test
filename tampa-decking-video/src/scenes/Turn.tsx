import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line} from '../Bits';
import {LEN, RISE} from '../timeline';
import {C, DISPLAY, E, range} from '../util';

/** La bascule : sur le bleu du grand bain, l'idée du nouveau site */
export const Turn: React.FC = () => {
  const t = useCurrentFrame() - RISE;
  const shift = (at: number) => range(t, at, at + 46, 118, 0, E.out);
  return (
    <AbsoluteFill style={{background: C.deep}}>
      <div style={{position: 'absolute', left: 150, top: 300, ...DISPLAY, fontSize: 132, color: C.white, transform: `scale(${range(t, 0, LEN.Turn, 1, 1.035)})`, transformOrigin: '0 50%'}}>
        <Line shift={shift(2)}>One page,</Line>
        <Line shift={shift(12)}>from the deck</Line>
        {/* la dernière ligne s'enfonce doucement, comme la seconde ligne du titre du site sous la ligne d'eau */}
        <div style={{transform: `translateY(${range(t, 40, LEN.Turn, 0, 16, E.sine)}px)`}}>
          <Line shift={shift(22)}><span style={{color: C.sun}}>to the deep end</span></Line>
        </div>
      </div>
    </AbsoluteFill>
  );
};
