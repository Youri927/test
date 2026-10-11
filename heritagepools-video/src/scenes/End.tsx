import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line, Logo, NightPool} from '../Bits';
import {END} from '../beats.ts';
import {LEN} from '../timeline';
import {BODY, C, E, H2, range} from '../util';

/** Fin, en miroir de l'ouverture : la piscine allumée, le logotype, ce qui a servi à construire le site ; fondu au noir */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.End;
  const up = (at: number) => ({opacity: range(f, at, at + 26, 0, 1), transform: `translateY(${range(f, at, at + 36, 18, 0, E.out)}px)`});
  const fade = range(f, len - 46, len - 4, 1, 0, E.inOut);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: fade, background: C.night}}>
        <NightPool lit={1} zoom={1.02 + 0.05 * E.sine(range(f, 0, len))} x={860} y={190} w={940} />
        <div style={{position: 'absolute', left: 124, top: 300}}>
          <Line shift={range(f, END.logo, END.logo + 50, 112, 0, E.out)}>
            <Logo size={128} stacked />
          </Line>
          <div style={{...H2, marginTop: 44, fontSize: 46, maxWidth: 640, color: C.white, ...up(END.line)}}>Built with your photos, your dates and your words.</div>
        </div>
        <div style={{position: 'absolute', left: 126, bottom: 84, ...BODY, fontSize: 22, color: 'rgba(255,255,255,.7)', ...up(END.line + 40)}}>
          heritagepoolstx.com, website redesign concept, October 2026
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
