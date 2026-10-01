import React from 'react';
import {Html5Audio, Sequence, staticFile} from 'remotion';

type Sfx = 'boom' | 'riser' | 'whoosh' | 'whip' | 'tap' | 'tick' | 'shimmer';

/** Habillage sonore — frames globales (30 fps). Sons synthétisés : voir README. */
const CUES: [number, Sfx, number][] = [
  // accroche
  [3, 'boom', 0.7],
  [11, 'boom', 0.55],
  [20, 'riser', 0.55],
  [44, 'whoosh', 0.8],
  // marque
  [56, 'boom', 0.9],
  [58, 'shimmer', 0.45],
  [103, 'whoosh', 0.85],
  // salles
  [164, 'whip', 0.8],
  [222, 'whip', 0.8],
  [233, 'tick', 0.5],
  [248, 'tick', 0.4],
  [263, 'tick', 0.5],
  [278, 'tick', 0.4],
  [284, 'whoosh', 0.8],
  // réservation
  [306, 'tap', 0.22],
  [312, 'tap', 0.22],
  [318, 'tap', 0.22],
  [324, 'tap', 0.8],
  [334, 'whoosh', 0.4],
  [352, 'tap', 0.9],
  [353, 'boom', 0.5],
  // CTA
  [372, 'whip', 0.55],
  [384, 'boom', 0.6],
  [389, 'boom', 0.5],
  [396, 'shimmer', 0.4],
];

export const Sound: React.FC = () => (
  <>
    {CUES.map(([from, sfx, volume], i) => (
      <Sequence key={i} from={from} name={`sfx ${sfx}`} layout="none">
        <Html5Audio src={staticFile(`sfx/${sfx}.wav`)} volume={volume} />
      </Sequence>
    ))}
  </>
);
