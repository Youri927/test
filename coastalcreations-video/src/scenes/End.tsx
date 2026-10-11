import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line, Logo, Photo} from '../Bits';
import {END} from '../beats.ts';
import {LEN} from '../timeline';
import {BODY, C, E, H2, range} from '../util';

/** Fin, en miroir de l'ouverture : la photo, le logo, ce sur quoi le site est construit ; fondu au noir */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.End;
  const up = (at: number) => ({opacity: range(f, at, at + 30, 0, 1), transform: `translateY(${range(f, at, at + 40, 18, 0, E.out)}px)`});
  const fade = range(f, len - 50, len - 4, 1, 0, E.inOut);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: fade}}>
        <Photo zoom={1.02 + 0.06 * E.sine(range(f, 0, len))} shade={1} />
        <div style={{position: 'absolute', left: 132, top: 250}}>
          <Line shift={range(f, END.logo, END.logo + 56, 112, 0, E.out)}>
            <Logo height={300} />
          </Line>
          <div style={{...H2, marginTop: 40, fontSize: 52, maxWidth: 1000, color: C.white, ...up(END.line)}}>Built with your photos, your prices and your pages.</div>
        </div>
        <div style={{position: 'absolute', left: 134, bottom: 86, ...BODY, fontSize: 22, color: 'rgba(255,255,255,.7)', ...up(END.line + 50)}}>
          coastalcreationspoolsandlagoons.com, website redesign concept, October 2026
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
