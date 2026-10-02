import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import './fonts';
import {Finish} from './Bits';
import {PresSound} from './PresSound';
import {C} from './util';
import {AfterHero, AfterLayers, AfterMobile, AfterResults, AfterSignature, AfterSurgeon, AfterVisit, HERO_LEN, LAYERS_LEN, MOBILE_LEN, RESULTS_LEN, SIGNATURE_LEN, SURGEON_LEN, VISIT_LEN} from './scenes/After';
import {Avant, AVANT_LEN} from './scenes/Avant';
import {Fin, FIN_LEN} from './scenes/Fin';
import {Opening, OPEN_LEN} from './scenes/Opening';

export const PRES_SCENES: [string, React.FC, number][] = [
  ['Opening', Opening, OPEN_LEN],
  ['Before', Avant, AVANT_LEN],
  ['After: home', AfterHero, HERO_LEN],
  ['01 Five layers', AfterLayers, LAYERS_LEN],
  ['02 Signature procedures', AfterSignature, SIGNATURE_LEN],
  ['03 Dr. Lee', AfterSurgeon, SURGEON_LEN],
  ['04 Before & after', AfterResults, RESULTS_LEN],
  ['05 Consultation', AfterVisit, VISIT_LEN],
  ['Mobile', AfterMobile, MOBILE_LEN],
  ['End', Fin, FIN_LEN],
];

export const PRES_FRAMES = PRES_SCENES.reduce((n, [, , len]) => n + len, 0);

/** Présentation du nouveau site Enhance, 16:9, 60 images/s */
export const Presentation: React.FC<{sound: boolean; music?: boolean}> = ({sound, music = true}) => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: C.bg}}>
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
