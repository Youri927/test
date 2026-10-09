import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import './fonts';
import {Finish, Lights} from './Bits';
import {PresSound} from './PresSound';
import {AfterBackyard, AfterContact, AfterHero, AfterHow, AfterMobile, AfterPools, AfterPump, AfterSalt, AfterWater} from './scenes/After';
import {End} from './scenes/End';
import {Opening} from './scenes/Opening';
import {Today} from './scenes/Today';
import {SCENES, START} from './timeline';

export {PRES_FRAMES} from './timeline';

const VIEW: Record<string, React.FC> = {
  Opening,
  Today,
  Hero: AfterHero,
  Pools: AfterPools,
  Water: AfterWater,
  Pump: AfterPump,
  Backyard: AfterBackyard,
  How: AfterHow,
  Salt: AfterSalt,
  Contact: AfterContact,
  Mobile: AfterMobile,
  End,
};

/** Présentation du nouveau site de Custom Pools by Rob Abel, 16:9, 60 images/s */
export const Presentation: React.FC<{sound: boolean; music?: boolean}> = ({sound, music = true}) => (
  <AbsoluteFill style={{background: '#000'}}>
    {SCENES.map(([name, len]) => {
      const Scene = VIEW[name];
      return (
        <Sequence key={name} name={name} from={START[name]} durationInFrames={len}>
          {/* l'ouverture sort du noir à sa façon, et la fin s'y fond : pas d'allumage pour l'une, pas d'extinction pour l'autre */}
          <Lights len={len} on={name !== 'Opening'} off={name !== 'End'}>
            <Scene />
          </Lights>
        </Sequence>
      );
    })}
    <Finish />
    {sound ? <PresSound music={music} /> : null}
  </AbsoluteFill>
);
