import React from 'react';
import {Html5Audio, Sequence, staticFile} from 'remotion';
import {M} from './clips';
import {LEN, START} from './timeline';

type Cue = [number, string, number];

// Les clics filmés, replacés sur la ligne de temps du montage (scène, plan, image de départ, vitesse, volume)
export const CLICK_CLIPS: [string, string, number, number, number][] = [
  ['Before & after', 'dWall', 30, 1, 0.3],
  ['Care', 'dCare', 20, 1.4, 0.3],
  ['Booking', 'dBook', 20, 1.5, 0.3],
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
const TYPING: Cue[] = Array.from({length: 9}, (_, i) => [70 + Math.round((i * 2 * 70) / 17), 'tap', 0.1]);
// les filés de caméra entre les chapitres, et les balayages
const WHIPS = ['Before & after', 'Feature case', 'The artist', 'Care', 'Team & reviews', 'Booking'].map((n) => START[n] - 12);
const CUES: Cue[] = [
  ...TYPING,
  [START['Today'] - 40, 'air', 0.3],
  [START['Turn'] - 40, 'air', 0.3],
  [START['First impression'] - 44, 'air', 0.36],
  // la vague des visages, à l'ouverture du site
  [START['First impression'] + 112, 'air', 0.2],
  ...WHIPS.map((f): Cue => [f, 'whoosh', 0.4]),
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
