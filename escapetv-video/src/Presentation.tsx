import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import './fonts';
import {Finish} from './Bits';
import {PresSound} from './PresSound';
import {C} from './util';
import {AfterAudience, AfterBeast, AfterFilm, AfterGrid, AfterHero, AfterMobile, AfterPitch, AUDIENCE_LEN, BEAST_LEN, FILM_LEN, GRID_LEN, HERO_LEN, MOBILE_LEN, PITCH_LEN} from './scenes/After';
import {Avant, AVANT_LEN} from './scenes/Avant';
import {Fin, FIN_LEN} from './scenes/Fin';
import {Opening, OPEN_LEN} from './scenes/Opening';

export const PRES_SCENES: [string, React.FC, number][] = [
  ['Ouverture', Opening, OPEN_LEN],
  ['Avant', Avant, AVANT_LEN],
  ['Après : la régie', AfterHero, HERO_LEN],
  ['01 Le pitch', AfterPitch, PITCH_LEN],
  ['02 Six genres', AfterGrid, GRID_LEN],
  ['03 Le Minotaure', AfterBeast, BEAST_LEN],
  ['04 Votre film', AfterFilm, FILM_LEN],
  ['05 Audience et réservation', AfterAudience, AUDIENCE_LEN],
  ['Mobile', AfterMobile, MOBILE_LEN],
  ['Fin', Fin, FIN_LEN],
];

export const PRES_FRAMES = PRES_SCENES.reduce((n, [, , len]) => n + len, 0);

/** Présentation du nouveau site Escape TV, 16:9, 60 images/s */
export const Presentation: React.FC<{sound: boolean; music?: boolean}> = ({sound, music = true}) => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: C.night}}>
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
      {sound ? <PresSound music={music} /> : null}
    </AbsoluteFill>
  );
};
