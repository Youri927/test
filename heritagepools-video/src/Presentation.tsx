import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, staticFile} from 'remotion';
import './fonts';
import {Finish, Lights} from './Bits';
import {AfterBuild, AfterContact, AfterDrag, AfterMobile, AfterNight, AfterPools, AfterServices, AfterValues} from './scenes/After';
import {End} from './scenes/End';
import {Opening} from './scenes/Opening';
import {SCENES, START} from './timeline';

export {PRES_FRAMES} from './timeline';

const VIEW: Record<string, React.FC> = {
  Opening,
  Build: AfterBuild,
  Drag: AfterDrag,
  Services: AfterServices,
  Pools: AfterPools,
  Night: AfterNight,
  Values: AfterValues,
  Contact: AfterContact,
  Mobile: AfterMobile,
  End,
};

/** Présentation du nouveau site de Heritage Pools Texas, 16:9, 60 images/s */
export const Presentation: React.FC<{sound: boolean}> = ({sound}) => (
  <AbsoluteFill style={{background: '#000'}}>
    {SCENES.map(([name, len]) => {
      const Scene = VIEW[name];
      return (
        <Sequence key={name} name={name} from={START[name]} durationInFrames={len}>
          {/* l'ouverture sort du noir à sa façon, et la fin s'y fond */}
          <Lights len={len} on={name !== 'Opening'} off={name !== 'End'}>
            <Scene />
          </Lights>
        </Sequence>
      );
    })}
    <Finish />
    {sound ? <Html5Audio src={staticFile('sfx/music.wav')} volume={0.72} /> : null}
  </AbsoluteFill>
);
