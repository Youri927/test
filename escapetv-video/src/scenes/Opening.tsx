import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Osd, Signal, Wall} from '../Bits';
import {MazeView} from '../lib/maze';
import {BEAT, C, E, F, FPS, range} from '../util';

export const OPEN_LEN = 8 * BEAT;

/** Le logo de l'émission : ESCAPE en très étroit, TV dans son cadre */
export const Logo: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: size * 0.18, fontFamily: F.show, fontWeight: 900, fontStretch: '56%', fontSize: size, lineHeight: 1, color: C.bone, ...style}}>
    ESCAPE
    <span style={{padding: `${size * 0.1}px ${size * 0.14}px ${size * 0.07}px`, border: `${Math.max(2, size * 0.07)}px solid currentColor`, borderRadius: size * 0.07, fontSize: size * 0.72, fontStretch: '78%'}}>TV</span>
  </div>
);

/** Ouverture : la régie s'allume sur le labyrinthe, puis le titre */
export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const up = (at: number) => ({opacity: range(f, at, at + 26, 0, 1), transform: `translateY(${range(f, at, at + 40, 26, 0, E.out)}px)`});
  const line = (at: number) => ({display: 'block', overflow: 'hidden', paddingTop: '0.14em', marginTop: '-0.14em'});
  const rise = (at: number) => ({display: 'block', transform: `translateY(${range(f, at, at + 46, 108, 0, E.out)}%)`});
  const on = range(f, 4, 44, 1, 0, E.inOut);
  const off = range(f, OPEN_LEN - 30, OPEN_LEN, 0, 1, E.in);
  const t = 6 + f / FPS;
  return (
    <AbsoluteFill>
      <Wall />
      {/* le plan vu d'en haut, qui dérive lentement */}
      <div style={{position: 'absolute', left: 1140 - f * 0.25, top: 560, transform: `scale(${range(f, 0, OPEN_LEN, 1.05, 1.16)})`}}>
        <MazeView id="op" t={t} cell={78} opacity={0.62} />
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(12,11,10,.94) 0%, rgba(12,11,10,.72) 42%, rgba(12,11,10,.1) 75%)'}} />
      <AbsoluteFill style={{background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,.16) 0 1px, transparent 1px 3px)'}} />
      <Osd seconds={f / FPS} opacity={range(f, 30, 50)} />

      <div style={{position: 'absolute', left: 150, top: 268, width: 1000}}>
        <div style={up(40)}><Logo size={58} /></div>
        <div style={{marginTop: 50, fontFamily: F.show, fontWeight: 900, fontStretch: '58%', fontSize: 172, lineHeight: 0.84, textTransform: 'uppercase', color: C.bone}}>
          <span style={line(56)}><span style={rise(56)}>Vous êtes</span></span>
          <span style={{...line(68), fontWeight: 250}}><span style={rise(68)}>le programme.</span></span>
        </div>
        <div style={{marginTop: 44, fontFamily: F.body, fontSize: 30, lineHeight: 1.45, color: C.bone2, ...up(110)}}>
          Le nouveau site d’Escape TV, à Lyon.
          <br />
          Concept de refonte, octobre 2026.
        </div>
      </div>
      <Signal level={Math.max(on, off)} />
    </AbsoluteFill>
  );
};
