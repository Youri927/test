import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import './fonts';
import {Finish} from './Bits';
import {PresSound} from './PresSound';
import {C} from './util';
import {AfterBassins, AfterContact, AfterCoupe, AfterHero, AfterMetier, AfterMobile, AfterRefs, BASSINS_LEN, CONTACT_LEN, COUPE_LEN, HERO_LEN, METIER_LEN, MOBILE_LEN, REFS_LEN} from './scenes/After';
import {Avant, AVANT_LEN} from './scenes/Avant';
import {Fin, FIN_LEN} from './scenes/Fin';
import {Opening, OPEN_LEN} from './scenes/Opening';

export const PRES_SCENES: [string, React.FC, number][] = [
  ['Ouverture', Opening, OPEN_LEN],
  ['Avant', Avant, AVANT_LEN],
  ['01 La ligne d’eau', AfterHero, HERO_LEN],
  ['02 Paris, en coupe', AfterCoupe, COUPE_LEN],
  ['03 Le bord de l’eau', AfterBassins, BASSINS_LEN],
  ['04 Les références', AfterRefs, REFS_LEN],
  ['05 Le métier', AfterMetier, METIER_LEN],
  ['06 Votre projet', AfterContact, CONTACT_LEN],
  ['Mobile', AfterMobile, MOBILE_LEN],
  ['Fin', Fin, FIN_LEN],
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

/** Présentation du nouveau site Idoine, 16:9, 60 images/s */
export const Presentation: React.FC<{sound: boolean; music?: boolean}> = ({sound, music = true}) => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: C.calcaire}}>
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
