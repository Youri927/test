import React from 'react';
import {Html5Audio, Sequence, staticFile} from 'remotion';

type Cue = [number, string, number];

// Départs des scènes (images à 60 i/s) : ouverture 0, avant 315, ligne d'eau 900, coupe 1395,
// bord de l'eau 2340, références 2925, métier 3285, projet 3960, mobile 4365, fin 4770 (→ 5130).
const CUES: Cue[] = [
  // ouverture : l'eau monte, deux ondes, puis elle remplit l'écran
  [40, 'wash', 0.3],
  [176, 'drop', 0.5],
  [232, 'drop', 0.3],
  [262, 'wash', 0.5],
  // avant → après : l'eau revient et se retire sur le nouveau site
  [838, 'wash', 0.5],
  // la ligne d'eau : la souris effleure la surface, puis un clic
  [1150, 'drop', 0.2],
  [1346, 'drop', 0.42],
  // changements de plan
  ...[1395, 2340, 2925, 3285, 3960, 4365].map((f): Cue => [f, 'air', 0.28]),
  // le formulaire : trois réponses
  ...[4006, 4090, 4162, 4246].map((f): Cue => [f, 'tap', 0.42]),
  ...[4419, 4503, 4587, 4671].map((f): Cue => [f, 'tap', 0.22]),
  // fin : l'eau redescend sur la ligne
  [4770, 'wash', 0.36],
  [4842, 'drop', 0.42],
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
