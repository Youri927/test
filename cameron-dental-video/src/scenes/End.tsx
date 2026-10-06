import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Face, Line, Logo} from '../Bits';
import {BEAT, C, DISPLAY, E, F, range} from '../util';

export const END_LEN = 9 * BEAT;
const SWAP = 170;
const FACES = [1, 5, 3, 7, 13, 9, 2, 6, 12];

/** Fin : « Show the smiles. », puis le logo et un mur de vrais sourires ; fondu final */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const g = f - SWAP;
  const shift = (at: number) => range(f, at, at + 46, 118, 0, E.out);
  const first = range(f, SWAP - 30, SWAP, 1, 0, E.inOut);
  const up = (at: number) => ({opacity: range(g, at, at + 30, 0, 1), transform: `translateY(${range(g, at, at + 40, 22, 0, E.out)}px)`});
  const out = range(f, END_LEN - 36, END_LEN, 1, 0, E.inOut);
  const FW = 176;
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <AbsoluteFill style={{opacity: out}}>
        {first > 0 ? (
          <div style={{position: 'absolute', left: 150, top: 330, ...DISPLAY, fontSize: 210, color: C.paper, opacity: first}}>
            <Line shift={shift(36)}>Show the</Line>
            <Line shift={shift(60)}><span style={{color: C.light}}>smiles.</span></Line>
          </div>
        ) : null}
        {g >= 0 ? (
          <>
            <div style={{position: 'absolute', right: 150, top: 160, display: 'grid', gridTemplateColumns: `repeat(3, ${FW}px)`, gap: 10}}>
              {FACES.map((n, i) => {
                const d = (i % 3) + Math.floor(i / 3);
                return <Face key={n} n={n} w={FW} show={range(g, 8 + d * 9, 58 + d * 9, 0, 1, E.inOut)} />;
              })}
            </div>
            <div style={{position: 'absolute', left: 150, top: 230, width: 960}}>
              <div style={up(10)}><Logo size={120} dark /></div>
              <div style={{marginTop: 64, ...DISPLAY, fontSize: 96, lineHeight: 0.98, color: C.paper, ...up(34)}}>
                Every smile is<br />a work of <span style={{color: C.light}}>art.</span>
              </div>
              <div style={{marginTop: 26, fontFamily: F.body, fontSize: 28, color: 'rgba(255,255,255,.72)', ...up(56)}}>
                Now the website shows it.
              </div>
              <div style={{marginTop: 56, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.18)', fontFamily: F.body, fontSize: 22, lineHeight: 1.7, color: 'rgba(255,255,255,.7)', ...up(84)}}>
                (239) 422-7924 · camerondentalstudio.com · Naples, Florida
                <br />
                Website redesign concept, October 2026
              </div>
            </div>
          </>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
