import React from 'react';
import {Html5Audio, interpolate, Sequence, staticFile} from 'remotion';

type Cue = [number, string, number];

/* Battements de cœur qui accélèrent jusqu'à l'ouverture de la dernière porte (tension → délivrance). */
const HEARTBEATS: number[] = [];
for (let t = 20, gap = 18; t < 368; gap = Math.max(9, gap * 0.965), t += gap) HEARTBEATS.push(Math.round(t));

const CUES: Cue[] = [
  // accroche
  [0, 'ad/click', 0.9],
  [22, 'boom', 0.45],
  [44, 'boom', 0.95],
  [46, 'ad/click', 0.6],
  [48, 'whoosh', 0.35],
  // portes
  [57, 'whoosh', 0.6],
  [68, 'ad/buzz', 0.55],
  [111, 'whip', 0.8],
  [123, 'whoosh', 0.6],
  [131, 'shimmer', 0.45],
  [177, 'whip', 0.8],
  [189, 'whoosh', 0.6],
  [199, 'ad/beep', 0.5],
  [215, 'ad/beep', 0.4],
  ...[201, 206, 211, 216, 221, 226, 231, 236, 241].map((t): Cue => [t, 'tick', 0.22]),
  [243, 'whip', 0.8],
  // preuve
  ...[260, 264, 268, 272].map((t): Cue => [t, 'tick', 0.3]),
  [270, 'shimmer', 0.35],
  [274, 'tap', 0.18],
  [282, 'tap', 0.18],
  // cadenas
  [318, 'whoosh', 0.3],
  [328, 'ad/ratchet', 0.7],
  [338, 'ad/ratchet', 0.7],
  [348, 'ad/ratchet', 0.7],
  [350, 'boom', 0.3],
  // sortie
  [352, 'riser', 0.45],
  [381, 'ad/chord', 0.9],
  [381, 'boom', 0.5],
  [392, 'shimmer', 0.4],
  [430, 'tap', 0.5],
  ...HEARTBEATS.map((t): Cue => [t, 'ad/heartbeat', 0.55]),
];

export const AdSound: React.FC = () => (
  <>
    <Sequence from={0} durationInFrames={390} name="nappe" layout="none">
      <Html5Audio src={staticFile('sfx/ad/drone.wav')} volume={(f) => interpolate(f, [0, 20, 352, 380], [0, 0.55, 0.55, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
    </Sequence>
    {CUES.map(([from, name, volume], i) => (
      <Sequence key={i} from={from} name={`sfx ${name}`} layout="none">
        <Html5Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
      </Sequence>
    ))}
  </>
);
