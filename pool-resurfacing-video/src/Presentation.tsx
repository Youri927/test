import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import './fonts';
import {Finish} from './Bits';
import {PresSound} from './PresSound';
import {C} from './util';
import {AfterContact, AfterFaq, AfterFinishes, AfterHero, AfterMobile, AfterProcess, AfterReviews, AfterServices, AfterSigns} from './scenes/After';
import {Avant} from './scenes/Avant';
import {Fin} from './scenes/Fin';
import {Opening} from './scenes/Opening';
import {SCENES, START} from './timeline';

export {PRES_FRAMES} from './timeline';

const VIEW: Record<string, React.FC> = {
  'Opening': Opening,
  'Before': Avant,
  'The new site': AfterHero,
  '01 Signs': AfterSigns,
  '02 Finishes': AfterFinishes,
  '03 Services': AfterServices,
  '04 Process': AfterProcess,
  '05 Reviews': AfterReviews,
  '06 Offer & FAQ': AfterFaq,
  '07 Contact': AfterContact,
  'Mobile': AfterMobile,
  'End': Fin,
};

/** Présentation du nouveau site Scottsdale Pool Resurfacing, 16:9, 60 images/s */
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
