import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Osd, Signal, Wall} from '../Bits';
import {MazeView} from '../lib/maze';
import {BEAT, C, E, F, FPS, range} from '../util';
import {Logo} from './Opening';

export const FIN_LEN = 9 * BEAT;

/** Fin : le labyrinthe, le nom, l'adresse, puis l'écran s'éteint sur un point */
export const Fin: React.FC = () => {
  const f = useCurrentFrame();
  const up = (at: number) => ({opacity: range(f, at, at + 30, 0, 1), transform: `translateY(${range(f, at, at + 40, 22, 0, E.out)}px)`});
  const t = 30 + f / FPS;
  return (
    <AbsoluteFill>
      <Wall />
      <div style={{position: 'absolute', left: 1240, top: 540, transform: `scale(${range(f, 0, FIN_LEN, 1.2, 1.08)})`}}>
        <MazeView id="fin" t={t} cell={70} opacity={0.5} />
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(12,11,10,.95) 0%, rgba(12,11,10,.75) 45%, rgba(12,11,10,.15) 80%)'}} />
      <Osd cam="CAM 04" zone="La salle du trésor" seconds={3540 + f / FPS} opacity={range(f, 20, 50) * 0.8} />
      <div style={{position: 'absolute', left: 150, top: 300, width: 900}}>
        <div style={up(24)}><Logo size={120} /></div>
        <div style={{marginTop: 30, fontFamily: F.show, fontWeight: 300, fontStretch: '62%', fontSize: 64, lineHeight: 1, textTransform: 'uppercase', color: C.bone, ...up(50)}}>Le Labyrinthe du Minotaure</div>
        <div style={{marginTop: 48, paddingTop: 22, borderTop: `1px solid ${C.line}`, fontFamily: F.body, fontSize: 27, lineHeight: 1.55, color: C.bone2, ...up(96)}}>
          297 rue Garibaldi, Lyon 7e
          <br />
          Refonte du site, concept d’octobre 2026
        </div>
      </div>
      <Signal level={Math.max(range(f, 0, 26, 1, 0, E.out), range(f, FIN_LEN - 44, FIN_LEN - 6, 0, 1, E.in))} />
      {f >= FIN_LEN - 6 ? <AbsoluteFill style={{background: '#000'}} /> : null}
    </AbsoluteFill>
  );
};
