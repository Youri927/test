import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Wall} from '../Bits';
import {BEAT, C, E, F, H, range} from '../util';
import {Ring, Submerged, WaterPlane} from './Water';

export const OPEN_LEN = 7 * BEAT;
const SIZE = 200;
const TOP = 372;
// la ligne d'eau coupe la seconde ligne du titre, un peu sous sa moitié
const WL = TOP + SIZE * 0.96 + SIZE * 0.96 * 0.58;

/** Ouverture : l'eau monte et immerge « site. », comme sur la page d'accueil */
export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const rise = range(f, 40, 170, H + 40, WL, E.out);
  const fill = range(f, OPEN_LEN - 60, OPEN_LEN, 0, 1, E.in);
  const wl = rise - fill * (WL + 60);
  const up = (at: number) => ({opacity: range(f, at, at + 30, 0, 1), transform: `translateY(${range(f, at, at + 40, 24, 0, E.out)}px)`});
  return (
    <AbsoluteFill style={{transform: `scale(${range(f, 0, OPEN_LEN, 1, 1.045)})`}}>
      <Wall />
      <div style={{position: 'absolute', left: 150, top: TOP - 92, fontFamily: F.display, fontWeight: 500, fontStretch: '125%', fontSize: 42, color: C.encre, ...up(8)}}>
        Idoine <span style={{fontWeight: 400, fontStretch: '80%', fontSize: 28, color: C.gris, marginLeft: 8}}>Piscines &amp; spas</span>
      </div>
      <div style={up(0)}>
        <WaterPlane wl={wl} />
        <Submerged lines={['Le nouveau', 'site.']} x={146} y={TOP} size={SIZE} wl={wl} />
      </div>
      <div style={{position: 'absolute', left: 150, top: WL + 150, fontFamily: F.body, fontSize: 32, color: 'rgba(246,248,247,.86)', opacity: range(f, 150, 190) * (1 - fill)}}>
        Concept de refonte, octobre 2026
      </div>
      <Ring x={1280} y={wl} at={176} big />
      <Ring x={760} y={wl} at={232} />
    </AbsoluteFill>
  );
};
