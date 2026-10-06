import React from 'react';
import {Html5Audio, Sequence, staticFile} from 'remotion';
import {M} from './clips';
import {LEN, START} from './timeline';

type Cue = [number, string, number];

// Les clics filmés, replacés sur la ligne de temps du montage (scène, plan, image de départ, vitesse, volume)
export const CLICK_CLIPS: [string, string, number, number, number][] = [
  ['Contact', 'dContact', 60, 1.45, 0.32],
];
const clickCues = (): Cue[] =>
  CLICK_CLIPS.flatMap(([scene, clip, from, rate, vol]) => {
    const len = LEN[scene];
    return M[clip].clicks
      .map((c) => Math.round(START[scene] + (c - from) / rate))
      .filter((f) => f >= START[scene] && f < START[scene] + len)
      .map((f): Cue => [f, 'tap', vol]);
  });

// la recherche tapée dans l'ouverture : une touche sur deux, très doucement
const TYPING: Cue[] = Array.from({length: 13}, (_, i) => [70 + Math.round((i * 2 * 80) / 26), 'tap', 0.1]);
// les filés de caméra entre les chapitres, et les arches qui montent
const WHIPS = ['Trust', 'Services', 'Prices', 'Work', 'Local', 'Contact'].map((n) => START[n] - 12);
const CUES: Cue[] = [
  ...TYPING,
  [START['Look-alikes'] - 40, 'air', 0.3],
  [START['Today'] - 34, 'air', 0.28],
  [START['Turn'] - 40, 'air', 0.3],
  [START['First impression'] - 44, 'air', 0.36],
  ...WHIPS.map((f): Cue => [f, 'whoosh', 0.4]),
  [START['Local'] + 235 - 12, 'whoosh', 0.34],
  [START['Mobile'] - 40, 'air', 0.3],
  [START['End'] - 40, 'air', 0.3],
  [START['End'] + 175, 'air', 0.26],
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
