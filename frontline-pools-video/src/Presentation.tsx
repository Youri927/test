import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import './fonts';
import {Finish} from './Bits';
import {PresSound} from './PresSound';
import {C} from './util';
import {AfterAreas, AfterEquip, AfterEstimate, AfterHero, AfterLicense, AfterMobile, AfterReviews, AfterTour, AfterWork} from './scenes/After';
import {Before} from './scenes/Before';
import {End} from './scenes/End';
import {Opening} from './scenes/Opening';
import {Turn} from './scenes/Turn';
import {SCENES, START} from './timeline';

export {PRES_FRAMES} from './timeline';

const VIEW: Record<string, React.FC> = {
  'Opening': Opening,
  'Today': Before,
  'Turn': Turn,
  'First impression': AfterHero,
  'What we rebuild': AfterTour,
  'Recent work': AfterWork,
  'Equipment': AfterEquip,
  'Reviews': AfterReviews,
  'License & financing': AfterLicense,
  'Service area': AfterAreas,
  'Free estimate': AfterEstimate,
  'Mobile': AfterMobile,
  'End': End,
};

/** Présentation du nouveau site de Frontline Pools, 16:9, 60 images/s */
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
