import React from 'react';
import {Html5Audio, Sequence, staticFile} from 'remotion';

type Cue = [number, string, number];

// Départs des scènes (images à 60 i/s) : ouverture 0, avant 320, régie 880, pitch 1400, six genres 1880,
// Minotaure 2400, film 2960, audience 3400, mobile 3880, fin 4320 (→ 4680).
const CUES: Cue[] = [
  // l'écran s'allume, le titre monte, l'écran s'éteint
  [4, 'on', 0.4],
  [58, 'air', 0.18],
  [290, 'off', 0.34],
  // avant : la page claire, le surlignage, puis on éteint
  [320, 'on', 0.22],
  [470, 'tap', 0.22],
  [850, 'off', 0.34],
  // le nouveau site s'allume ; la régie change de caméra
  [880, 'on', 0.4],
  [1156, 'zap', 0.14],
  // on zappe d'une partie à l'autre
  ...[1400, 1880, 2400, 2960, 3400].map((f): Cue => [f, 'zap', 0.26]),
  // six genres : la souris passe d'une chaîne à l'autre
  ...[244, 298, 352, 406, 460, 514].map((f): Cue => [1880 + f, 'tap', 0.16]),
  // le Minotaure vous rattrape
  [2806, 'thud', 0.5],
  // votre film : pause, lecture
  [3196, 'tap', 0.32],
  [3292, 'tap', 0.32],
  // la FAQ s'ouvre
  [3730, 'tap', 0.28],
  // vers le mobile, puis la fin
  [3852, 'off', 0.3],
  [3880, 'on', 0.26],
  [4292, 'off', 0.3],
  [4320, 'on', 0.3],
  [4636, 'off', 0.42],
];

/** Musique originale + bruitages synchronisés sur l'image (music={false} : bruitages seuls) */
export const PresSound: React.FC<{music?: boolean}> = ({music = true}) => (
  <>
    {music ? <Html5Audio src={staticFile('sfx/music.wav')} volume={0.7} /> : null}
    {CUES.map(([at, name, vol], i) => (
      <Sequence key={i} from={at} name={`${name} ${at}`}>
        <Html5Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
      </Sequence>
    ))}
  </>
);
