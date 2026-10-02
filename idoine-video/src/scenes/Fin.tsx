import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Wall} from '../Bits';
import {BEAT, C, E, F, range} from '../util';
import {Ring, Submerged, WaterPlane} from './Water';

export const FIN_LEN = 8 * BEAT;
const SIZE = 168;
const TOP = 300;
const WL = TOP + SIZE * 0.96 + SIZE * 0.96 * 0.58;
const PILLS = ['Pensé d’abord pour le mobile', 'Navigable au clavier', 'Un seul fichier, léger'];

/** Fin : l'eau redescend sur la ligne, le titre se repose, puis tout s'éteint */
export const Fin: React.FC = () => {
  const f = useCurrentFrame();
  const wl = range(f, 0, 70, -80, WL, E.out);
  const out = range(f, FIN_LEN - 40, FIN_LEN, 1, 0, E.inOut);
  const up = (at: number) => ({opacity: range(f, at, at + 30, 0, 1), transform: `translateY(${range(f, at, at + 40, 22, 0, E.out)}px)`});
  return (
    <AbsoluteFill style={{opacity: out, transform: `scale(${range(f, 0, FIN_LEN, 1.02, 1)})`}}>
      <Wall />
      <div style={{position: 'absolute', left: 150, top: TOP - 92, fontFamily: F.display, fontWeight: 500, fontStretch: '125%', fontSize: 42, color: C.encre, ...up(40)}}>
        Idoine <span style={{fontWeight: 400, fontStretch: '80%', fontSize: 28, color: C.gris, marginLeft: 8}}>Piscines &amp; spas</span>
      </div>
      <WaterPlane wl={wl} />
      <Submerged lines={['Le nouveau', 'site.']} x={146} y={TOP} size={SIZE} wl={wl} />
      <div style={{position: 'absolute', left: 150, top: WL + 70, display: 'flex', gap: 14}}>
        {PILLS.map((p, i) => (
          <div
            key={p}
            style={{
              padding: '12px 22px', borderRadius: 999, border: '1.5px solid rgba(233, 255, 252, .45)',
              fontFamily: F.body, fontSize: 25, color: 'rgba(246,248,247,.92)', ...up(110 + i * 12),
            }}
          >
            {p}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 150, top: WL + 170, fontFamily: F.body, fontSize: 28, color: 'rgba(246,248,247,.7)', ...up(160)}}>
        Concept de refonte, octobre 2026
      </div>
      <Ring x={1320} y={wl} at={72} big />
    </AbsoluteFill>
  );
};
