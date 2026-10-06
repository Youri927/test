import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import './fonts';
import {Finish} from './Bits';
import {PresSound} from './PresSound';
import {C} from './util';
import {AfterContact, AfterCost, AfterHero, AfterLocal, AfterMobile, AfterPaths, AfterTrust, AfterWork} from './scenes/After';
import {Before} from './scenes/Before';
import {End} from './scenes/End';
import {Opening} from './scenes/Opening';
import {Same} from './scenes/Same';
import {Turn} from './scenes/Turn';
import {SCENES, START} from './timeline';

export {PRES_FRAMES} from './timeline';

const VIEW: Record<string, React.FC> = {
  'Opening': Opening,
  'Look-alikes': Same,
  'Today': Before,
  'Turn': Turn,
  'First impression': AfterHero,
  'Trust': AfterTrust,
  'Services': AfterPaths,
  'Prices': AfterCost,
  'Work': AfterWork,
  'Local': AfterLocal,
  'Contact': AfterContact,
  'Mobile': AfterMobile,
  'End': End,
};

/** Présentation du nouveau site WAVE Pool Remodeling, 16:9, 60 images/s */
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
