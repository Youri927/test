import React from 'react';
import {Html5Audio, Sequence, staticFile} from 'remotion';
import {M} from './clips';
import {LEN, START} from './timeline';

type Cue = [number, string, number];

// Les clics filmés dans chaque plan, replacés sur la ligne de temps du montage (début de scène, image de départ, vitesse)
const CLICK_CLIPS: [string, string, number, number, number][] = [
  ['03 Pool designs', 'dPools', 60, 1.15, 0.34],
  ['04 Work', 'dWork', 50, 1.12, 0.3],
  ['06 Reviews', 'dProof', 60, 1, 0.3],
  ['07 Free quote', 'dQuote', 100, 1.18, 0.34],
];
const clickCues = (): Cue[] =>
  CLICK_CLIPS.flatMap(([scene, clip, from, rate, vol]) => {
    const len = LEN[scene];
    return M[clip].clicks
      .map((c) => Math.round(START[scene] + (c - from) / rate))
      .filter((f) => f >= START[scene] && f < START[scene] + len)
      .map((f): Cue => [f, 'tap', vol]);
  });

// les filés et les changements de chapitre
const WHIPS = ['01 Three trades', '02 25 services', '03 Pool designs', '04 Work', '06 Reviews'].map((n) => START[n] - 12);
const CUES: Cue[] = [
  [130, 'air', 0.2], // le soleil s'ouvre
  [START['Before'] - 40, 'air', 0.3],
  [START['The new site'] - 40, 'air', 0.32],
  ...WHIPS.map((f): Cue => [f, 'whoosh', 0.4]),
  [START['05 Process'] - 10, 'air', 0.22],
  [START['07 Free quote'] - 10, 'air', 0.22],
  [START['Mobile'] - 40, 'air', 0.3],
  [START['End'] - 40, 'air', 0.3],
  [START['End'] + 160, 'air', 0.26],
  ...clickCues(),
];

/** Musique originale + bruitages synchronisés sur l'image (music={false} : bruitages seuls) */
export const PresSound: React.FC<{music?: boolean}> = ({music = true}) => (
  <>
    {music ? <Html5Audio src={staticFile('sfx/music.wav')} volume={0.72} /> : null}
    {CUES.map(([at, name, vol], i) => (
      <Sequence key={i} from={Math.max(0, at)} name={`${name} ${at}`}>
        <Html5Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
      </Sequence>
    ))}
  </>
);
