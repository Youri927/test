import React from 'react';
import {Html5Audio, interpolate, Sequence, staticFile} from 'remotion';

type Cue = [number, string, number];

/* Battements de cœur qui accélèrent jusqu'à l'ouverture de la dernière porte (tension → délivrance). */
const HEARTBEATS: number[] = [];
for (let t = 24, gap = 18; t < 380; gap = Math.max(9, gap * 0.965), t += gap) HEARTBEATS.push(Math.round(t));

const every = (from: number, to: number, step: number, name: string, vol: number): Cue[] => {
  const out: Cue[] = [];
  for (let t = from; t <= to; t += step) out.push([t, name, vol]);
  return out;
};

// départs des séquences : accroche 0, montage 60, salles 108, preuve 288, cadenas 338, sortie 383
const CUES: Cue[] = [
  // accroche
  [0, 'boom', 0.8],
  [0, 'ad/click', 0.6],
  ...every(0, 46, 6, 'tick', 0.18),
  [7, 'boom', 0.55],
  [20, 'whoosh', 0.25],
  [50, 'whip', 0.7],
  // fouillez / réfléchissez / manipulez
  [60, 'boom', 0.55],
  [60, 'whoosh', 0.45],
  [76, 'boom', 0.55],
  ...every(79, 89, 2, 'tick', 0.25),
  [92, 'boom', 0.55],
  ...every(92, 95, 1, 'ad/ratchet', 0.45),
  [99, 'ad/click', 0.9],
  [99, 'boom', 0.4],
  [104, 'whoosh', 0.4],
  // les trois portes
  [110, 'whoosh', 0.6],
  [120, 'ad/buzz', 0.55],
  [158, 'whip', 0.8],
  [170, 'whoosh', 0.6],
  [176, 'shimmer', 0.45],
  [218, 'whip', 0.8],
  [230, 'whoosh', 0.6],
  [236, 'ad/beep', 0.5],
  [252, 'ad/beep', 0.4],
  ...every(242, 274, 6, 'tick', 0.22),
  [278, 'whip', 0.8],
  // preuve
  [288, 'whoosh', 0.4],
  ...every(290, 302, 4, 'tick', 0.3),
  [300, 'shimmer', 0.35],
  [302, 'tap', 0.18],
  [308, 'tap', 0.18],
  // cadenas
  [338, 'whoosh', 0.3],
  [344, 'ad/ratchet', 0.7],
  [351, 'ad/ratchet', 0.7],
  [358, 'ad/ratchet', 0.7],
  [360, 'boom', 0.3],
  // sortie
  [362, 'riser', 0.45],
  [386, 'whoosh', 0.5],
  [398, 'ad/chord', 0.9],
  [398, 'boom', 0.5],
  [405, 'shimmer', 0.4],
  [433, 'tap', 0.5],
  ...HEARTBEATS.map((t): Cue => [t, 'ad/heartbeat', 0.55]),
];

export const AdSound: React.FC = () => (
  <>
    <Sequence from={0} durationInFrames={390} name="nappe" layout="none">
      <Html5Audio src={staticFile('sfx/ad/drone.wav')} volume={(f) => interpolate(f, [0, 20, 362, 392], [0, 0.55, 0.55, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
    </Sequence>
    {CUES.map(([from, name, volume], i) => (
      <Sequence key={i} from={from} name={`sfx ${name}`} layout="none">
        <Html5Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
      </Sequence>
    ))}
  </>
);
