import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import '../ad/fonts';
import {Finish} from './Bits';
import {PresSound} from './PresSound';
import {C} from './util';
import {Concept, CONCEPT_LEN} from './scenes/Concept';
import {Doors, DOORS_LEN} from './scenes/Doors';
import {Exit, EXIT_LEN} from './scenes/Exit';
import {Hero, HERO_LEN} from './scenes/Hero';
import {Identity, IDENTITY_LEN} from './scenes/Identity';
import {Lock, LOCK_LEN} from './scenes/Lock';
import {Mobile, MOBILE_LEN} from './scenes/Mobile';
import {Opening, OPEN_LEN} from './scenes/Opening';
import {Poster, POSTER_LEN} from './scenes/Poster';
import {Verdict, VERDICT_LEN} from './scenes/Verdict';

export const PRES_SCENES: [string, React.FC, number][] = [
  ['Ouverture', Opening, OPEN_LEN],
  ['Concept', Concept, CONCEPT_LEN],
  ['01 Le noir', Hero, HERO_LEN],
  ['02 L’affiche', Poster, POSTER_LEN],
  ['03 Trois portes', Doors, DOORS_LEN],
  ['04 Le verdict', Verdict, VERDICT_LEN],
  ['05 Le cadenas', Lock, LOCK_LEN],
  ['Mobile', Mobile, MOBILE_LEN],
  ['Identité', Identity, IDENTITY_LEN],
  ['06 La sortie', Exit, EXIT_LEN],
];

export const PRES_FRAMES = PRES_SCENES.reduce((n, [, , len]) => n + len, 0);

/** Début de chaque scène, en images */
export const sceneStart = (name: string) => {
  let t = 0;
  for (const [n, , len] of PRES_SCENES) {
    if (n === name) return t;
    t += len;
  }
  throw new Error(name);
};

/** Vidéo de présentation du nouveau site, 16:9, 60 images/s */
export const Presentation: React.FC<{sound: boolean}> = ({sound}) => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: C.ink}}>
      {PRES_SCENES.map(([name, Scene, len]) => {
        const s = (
          <Sequence key={name} name={name} from={from} durationInFrames={len}>
            <Scene />
          </Sequence>
        );
        from += len;
        return s;
      })}
      <Finish />
      {sound ? <PresSound /> : null}
    </AbsoluteFill>
  );
};
