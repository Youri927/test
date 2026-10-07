import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line, Logo, Photo} from '../Bits';
import {BEAT, C, DISPLAY, E, F, range} from '../util';

export const END_LEN = 11 * BEAT;
const SWAP = 190;
const PHOTOS: [string, string][] = [['hero', '50% 40%'], ['p-davis', '50% 55%'], ['p-citrus', '60% 50%'], ['p-walden', '50% 50%'], ['g-spill', '50% 50%'], ['p-south', '50% 50%']];

/** Fin : la suite de la phrase de Vincent, puis le nom, leurs piscines et le contact ; fondu final */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const g = f - SWAP;
  const shift = (at: number) => range(f, at, at + 46, 118, 0, E.out);
  const first = range(f, SWAP - 30, SWAP, 1, 0, E.inOut);
  const up = (at: number) => ({opacity: range(g, at, at + 30, 0, 1), transform: `translateY(${range(g, at, at + 40, 22, 0, E.out)}px)`});
  const out = range(f, END_LEN - 36, END_LEN, 1, 0, E.inOut);
  const QUOTE = {fontFamily: F.display, fontWeight: 750, fontStretch: '108%', fontSize: 118, lineHeight: 1.0, letterSpacing: '-0.03em'} as const;
  const PW = 250;
  const PH = 300;
  return (
    <AbsoluteFill style={{background: C.navy}}>
      <AbsoluteFill style={{opacity: out}}>
        {first > 0 ? (
          <div style={{position: 'absolute', left: 116, top: 300, color: C.paper, opacity: first}}>
            <div style={QUOTE}>
              <Line shift={shift(30)}>“…but this is one team</Line>
              <Line shift={shift(44)}><span style={{paddingLeft: '0.36em'}}>who <span style={{color: C.yellow}}>won’t disappoint!!”</span></span></Line>
            </div>
            <div style={{marginTop: 46, marginLeft: 40, display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.body, fontWeight: 600, fontSize: 26, color: 'rgba(255,255,255,.8)', opacity: range(f, 90, 120, 0, 1)}}>
              <span style={{width: 34, height: 4, background: C.yellow}} />
              Vincent, Citrus Park
            </div>
          </div>
        ) : null}
        {g >= 0 ? (
          <>
            <div style={{position: 'absolute', right: 140, top: 170, display: 'grid', gridTemplateColumns: `repeat(3, ${PW}px)`, gap: 10}}>
              {PHOTOS.map(([src, pos], i) => {
                const d = (i % 3) + Math.floor(i / 3);
                return <Photo key={src} src={src} pos={pos} w={PW} h={PH} show={range(g, 8 + d * 9, 58 + d * 9, 0, 1, E.inOut)} />;
              })}
            </div>
            <div style={{position: 'absolute', left: 140, top: 210, width: 900}}>
              <div style={up(10)}><Logo size={96} dark /></div>
              <div style={{marginTop: 70, ...DISPLAY, fontSize: 86, color: C.paper, ...up(34)}}>
                Tampa Bay pools,<br /><span style={{color: C.yellow}}>rebuilt</span>
              </div>
              <div style={{marginTop: 30, fontFamily: F.body, fontSize: 28, color: 'rgba(255,255,255,.76)', ...up(56)}}>
                Now the website shows the work, and who does it.
              </div>
              <div style={{marginTop: 56, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.18)', fontFamily: F.body, fontSize: 22, lineHeight: 1.7, color: 'rgba(255,255,255,.72)', ...up(84)}}>
                (813) 606-2697 · frontlinepools.com · Tampa, Florida · License CPC1460668
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
