import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Frieze, Line, Logo} from '../Bits';
import {END} from '../beats.ts';
import {LEN} from '../timeline';
import {BODY, C, E, H2, W, range} from '../util';

/** Fin : sur le bleu du fond du bassin, la frise de verre se pose sous le logotype, puis ce qui a servi à faire le site ; fondu au noir */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.End;
  const up = (at: number) => ({opacity: range(f, at, at + 26, 0, 1), transform: `translateY(${range(f, at, at + 36, 18, 0, E.out)}px)`});
  const fade = range(f, len - 46, len - 4, 1, 0, E.inOut);
  const SIZE = 66;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: fade, background: C.floor}}>
        <div style={{position: 'absolute', left: 124, top: 196}}>
          <Line shift={range(f, END.logo, END.logo + 50, 112, 0, E.out)}>
            <Logo size={96} color={C.white} />
          </Line>
          <div style={{...H2, marginTop: 52, fontSize: 50, maxWidth: 980, lineHeight: 1.04, color: C.white, ...up(END.line)}}>Built with your photos, your tile and your customers’ words.</div>
          <div style={{...BODY, marginTop: 30, fontSize: 22, color: 'rgba(255,255,255,.7)', ...up(END.line + 40)}}>petripools.com, website redesign concept, October 2026</div>
        </div>
        <div style={{position: 'absolute', left: 0, top: 1080 - 4 * SIZE - 18 - 34, width: W}}>
          <div style={{height: 18, background: 'linear-gradient(#e7e3dd, #d6d0c7 70%, #c8c2ba)', boxShadow: '0 6px 10px -4px rgba(0, 0, 0, .45)', position: 'relative', zIndex: 1}} />
          <Frieze t={(f - END.frieze) / 60} width={W} size={SIZE} f={f} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
