import React from 'react';
import {Html5Audio, Sequence, staticFile} from 'remotion';
import {M} from './clips';
import {cues} from './cues';
import {LEN, START} from './timeline';

const CUES = cues(START, LEN, (clip) => M[clip].clicks);

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
