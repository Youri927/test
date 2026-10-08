import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line, LogoMark, buildAt} from '../Bits';
import {OPEN} from '../beats.ts';
import {LEN} from '../timeline';
import {BODY, C, E, H2, range} from '../util';

/**
 * Ouverture : leur logo se construit comme dans la section Implants du site
 * (la racine, les sept filets de la vis en doubles croches, la couronne qui se pose sur le temps 4),
 * puis le nom du cabinet et la phrase du pied de page du site.
 */
export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.Opening;
  const shift = (at: number) => range(f, at, at + 46, 118, 0, E.out);
  const up = (at: number) => ({opacity: range(f, at, at + 30, 0, 1), transform: `translateY(${range(f, at, at + 40, 18, 0, E.out)}px)`});
  // sortie : tout monte et s'efface juste avant la coupe
  const leave = range(f, len - 30, len - 2, 0, 1, E.in);
  return (
    <AbsoluteFill style={{background: C.white}}>
      <AbsoluteFill style={{transform: `translateY(${-leave * 60}px) scale(${range(f, 0, len, 1, 1.03)})`, opacity: 1 - leave}}>
        <div style={{position: 'absolute', left: 292, top: 330}}>
          <LogoMark height={420} build={buildAt(f, OPEN)} />
        </div>
        <div style={{position: 'absolute', left: 720, top: 408, ...H2, fontSize: 104, color: C.ink}}>
          <Line shift={shift(OPEN.name)}>Implant and Comprehensive</Line>
          <Line shift={shift(OPEN.name + 10)}>Dentistry of Naples</Line>
        </div>
        <div style={{position: 'absolute', left: 726, top: 640, width: 900, ...BODY, fontSize: 30, lineHeight: 1.42, color: C.inkSoft, ...up(OPEN.line)}}>
          Implants, same-day crowns and everything in between, with Dr.&nbsp;Fady Fakhoury, DDS.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
