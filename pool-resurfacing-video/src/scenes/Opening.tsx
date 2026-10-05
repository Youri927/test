import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Compare, Mark, Sheet, Wall} from '../Bits';
import {BEAT, C, DISPLAY, E, F, MONO, range} from '../util';

export const OPEN_LEN = 8 * BEAT;

/** Une ligne qui monte derrière son cache, comme les titres du site */
const Line: React.FC<{shift: number; style?: React.CSSProperties; children: React.ReactNode}> = ({shift, style, children}) => (
  <div style={{overflow: 'hidden', padding: '0.04em 0.1em 0.1em 0', margin: '-0.04em -0.1em -0.1em 0'}}>
    <div style={{transform: `translateY(${shift}%)`, ...style}}>{children}</div>
  </div>
);

/** Ouverture : le titre du site monte, et la passe de lisseuse efface l'ancien fond */
export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const shift = (at: number) => range(f, at, at + 52, 118, 0, E.out);
  const fade = (at: number) => ({opacity: range(f, at, at + 30, 0, 1), transform: `translateY(${range(f, at, at + 40, 18, 0, E.out)}px)`});
  const frame = range(f, 10, 80, 0, 1, E.out);
  const pos = range(f, 100, 250, 100, 6, E.inOut);
  return (
    <AbsoluteFill style={{transform: `scale(${range(f, 0, OPEN_LEN, 1, 1.03)})`}}>
      <Wall />
      <div style={{position: 'absolute', left: 150, top: 170, display: 'flex', alignItems: 'center', gap: 18, ...fade(30)}}>
        <Mark size={52} />
        <div style={{display: 'grid', gap: 4}}>
          <span style={{fontFamily: F.body, fontWeight: 680, fontStretch: '88%', fontSize: 28, letterSpacing: '-0.01em', color: C.ink}}>Scottsdale</span>
          <span style={{...MONO, fontSize: 15, letterSpacing: '0.12em', color: C.ink}}>Pool Resurfacing</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 140, top: 390, color: C.ink, ...DISPLAY, fontSize: 200}}>
        <Line shift={shift(14)}>Love your</Line>
        <Line shift={shift(24)} style={{paddingLeft: '0.5em'}}>pool again.</Line>
      </div>
      <div style={{position: 'absolute', left: 150, top: 850, fontFamily: F.body, fontSize: 28, lineHeight: 1.45, color: C.grey, ...fade(90)}}>
        A new website for Scottsdale’s pool resurfacing contractor.
        <div style={{...MONO, fontSize: 15, color: C.mist, marginTop: 10}}>Website redesign concept · October 2026</div>
      </div>
      <div style={{position: 'absolute', left: 1180, top: 150, opacity: frame, transform: `translateY(${(1 - frame) * 40}px) scale(${1.04 - 0.04 * frame})`, transformOrigin: '50% 50%'}}>
        <Compare w={600} h={760} pos={pos} />
      </div>
      <Sheet level={range(f, OPEN_LEN - 52, OPEN_LEN, 0, 1, E.inOut)} />
    </AbsoluteFill>
  );
};
