import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line, Logo, Photo, TileCover, Wall} from '../Bits';
import {BEAT, C, E, F, range} from '../util';

export const OPEN_LEN = 9 * BEAT;

/** Ouverture : la phrase d'un de leurs clients, Vincent ; à droite, leur travail se pose */
export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const shift = (at: number) => range(f, at, at + 50, 118, 0, E.out);
  const fade = (at: number) => ({opacity: range(f, at, at + 30, 0, 1), transform: `translateY(${range(f, at, at + 40, 18, 0, E.out)}px)`});
  const QUOTE = {fontFamily: F.display, fontWeight: 750, fontStretch: '108%', fontSize: 104, lineHeight: 1.0, letterSpacing: '-0.03em', color: C.ink} as const;
  return (
    <AbsoluteFill style={{transform: `scale(${range(f, 0, OPEN_LEN, 1, 1.03)})`}}>
      <Wall tint={C.paper} />
      <div style={{position: 'absolute', left: 150, top: 110, ...fade(16)}}>
        <Logo size={44} />
      </div>
      <div style={{position: 'absolute', left: 116, top: 290, ...QUOTE}}>
        <Line shift={shift(8)}>“You hear horror</Line>
        <Line shift={shift(18)}><span style={{paddingLeft: '0.36em'}}>stories about pool</span></Line>
        <Line shift={shift(28)}><span style={{paddingLeft: '0.36em'}}>contractors all</span></Line>
        <Line shift={shift(38)}><span style={{paddingLeft: '0.36em'}}>the time.”</span></Line>
      </div>
      <div style={{position: 'absolute', left: 156, top: 770, display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.body, fontWeight: 600, fontSize: 26, color: C.ink, ...fade(110)}}>
        <span style={{width: 34, height: 4, background: C.yellow}} />
        Vincent, Citrus Park, one of their customers
      </div>
      <div style={{position: 'absolute', left: 156, top: 860, width: 900, fontFamily: F.body, fontSize: 30, lineHeight: 1.42, color: C.grey, ...fade(170)}}>
        Before anyone lets a crew into their backyard, they look for proof: the work, and who does it.
      </div>
      <div style={{position: 'absolute', left: 1290, top: 150, display: 'grid', gap: 14}}>
        <Photo src="p-citrus" w={480} h={380} show={range(f, 60, 130, 0, 1, E.inOut)} />
        <div style={{display: 'flex', gap: 14}}>
          <Photo src="p-south" w={233} h={330} show={range(f, 84, 154, 0, 1, E.inOut)} />
          <Photo src="g-star" w={233} h={330} show={range(f, 104, 174, 0, 1, E.inOut)} />
        </div>
      </div>
      <TileCover level={range(f, OPEN_LEN - 52, OPEN_LEN, 0, 1)} color={C.navy} />
    </AbsoluteFill>
  );
};
