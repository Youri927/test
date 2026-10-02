import React from 'react';
import {Html5Audio, Sequence, staticFile} from 'remotion';

type Cue = [number, string, number];

// Départs des scènes (images à 60 i/s) : ouverture 0, avant 315, accueil 900, couches 1395,
// spécialités 2385, chirurgien 2970, résultats 3510, consultation 3960, mobile 4410, fin 4815 (→ 5175).
const CUES: Cue[] = [
  // ouverture : le visage se sépare en calques, puis la feuille monte
  [140, 'air', 0.22],
  [268, 'air', 0.34],
  // avant → après
  [850, 'air', 0.34],
  // changements de plan
  ...[1395, 2385, 2970, 3510, 3960, 4410].map((f): Cue => [f, 'air', 0.24]),
  // les cases cochées
  [2145, 'tap', 0.4],
  ...[4063, 4104, 4146, 4229, 4318].map((f): Cue => [f, 'tap', 0.36]),
  ...[4494, 4566, 4638].map((f): Cue => [f, 'tap', 0.2]),
  // fin
  [4768, 'air', 0.3],
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
