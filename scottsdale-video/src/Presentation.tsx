import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import './fonts';
import {Finish} from './Bits';
import {PresSound} from './PresSound';
import {C} from './util';
import {AfterDisc, AfterElements, AfterHero, AfterMobile, AfterPools, AfterProcess, AfterProof, AfterQuote, AfterWork} from './scenes/After';
import {Avant} from './scenes/Avant';
import {Fin} from './scenes/Fin';
import {Opening} from './scenes/Opening';
import {SCENES, START} from './timeline';

export {PRES_FRAMES} from './timeline';

const VIEW: Record<string, React.FC> = {
  'Opening': Opening,
  'Before': Avant,
  'The new site': AfterHero,
  '01 Three trades': AfterDisc,
  '02 25 services': AfterElements,
  '03 Pool designs': AfterPools,
  '04 Work': AfterWork,
  '05 Process': AfterProcess,
  '06 Reviews': AfterProof,
  '07 Free quote': AfterQuote,
  'Mobile': AfterMobile,
  'End': Fin,
};

/** Présentation du nouveau site Scottsdale Pool Patio & Landscape, 16:9, 60 images/s */
export const Presentation: React.FC<{sound: boolean; music?: boolean}> = ({sound, music = true}) => (
  <AbsoluteFill style={{background: C.bg}}>
    {SCENES.map(([name, len]) => {
      const Scene = VIEW[name];
      return (
        <Sequence key={name} name={name} from={START[name]} durationInFrames={len}>
          <Scene />
        </Sequence>
      );
    })}
    <Finish />
    {sound ? <PresSound music={music} /> : null}
  </AbsoluteFill>
);
