import React from 'react';
import {Html5Audio, Sequence, staticFile} from 'remotion';
import {M} from './clips';
import {LEN, START} from './timeline';

type Cue = [number, string, number];

// Les clics filmés dans chaque plan, replacés sur la ligne de temps du montage (scène, plan, image de départ, vitesse, volume)
export const CLICK_CLIPS: [string, string, number, number, number][] = [
  ['The new site', 'dHero', 0, 1, 0.28],
  ['01 Signs', 'dSigns', 60, 1.2, 0.32],
  ['02 Finishes', 'dFinishes', 60, 1.2, 0.34],
  ['06 Offer & FAQ', 'dFaq', 60, 1.3, 0.3],
  ['07 Contact', 'dContact', 60, 1.28, 0.32],
];
const clickCues = (): Cue[] =>
  CLICK_CLIPS.flatMap(([scene, clip, from, rate, vol]) => {
    const len = LEN[scene];
    return M[clip].clicks
      .map((c) => Math.round(START[scene] + (c - from) / rate))
      .filter((f) => f >= START[scene] && f < START[scene] + len)
      .map((f): Cue => [f, 'tap', vol]);
  });

// les filés de caméra et les montées d'eau entre les chapitres
const WHIPS = ['01 Signs', '02 Finishes', '03 Services', '04 Process', '05 Reviews'].map((n) => START[n] - 12);
const CUES: Cue[] = [
  [100, 'air', 0.22], // la passe de lisseuse de l'ouverture
  [START['Before'] - 40, 'air', 0.3],
  [START['The new site'] - 40, 'air', 0.32],
  ...WHIPS.map((f): Cue => [f, 'whoosh', 0.4]),
  [START['06 Offer & FAQ'] - 10, 'air', 0.22],
  [START['07 Contact'] - 10, 'air', 0.22],
  [START['Mobile'] - 40, 'air', 0.3],
  [START['End'] - 40, 'air', 0.3],
  [START['End'] + 150, 'air', 0.26],
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
