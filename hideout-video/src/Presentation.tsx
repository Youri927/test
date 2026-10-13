import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, staticFile} from 'remotion';
import './fonts';
import {Lights} from './Bits';
import {AfterBank, AfterMobile, AfterResults, AfterTeam, AfterTreatments, AfterVisit} from './scenes/After';
import {End} from './scenes/End';
import {Open} from './scenes/Open';
import {SCENES, START} from './timeline';

export {PRES_FRAMES} from './timeline';

const VIEW: Record<string, React.FC> = {
  Open,
  Treatments: AfterTreatments,
  Results: AfterResults,
  Team: AfterTeam,
  Bank: AfterBank,
  Visit: AfterVisit,
  Mobile: AfterMobile,
  End,
};

/** Présentation du nouveau site de Hideout Boutique, 16:9, 60 images/s */
export const Presentation: React.FC<{sound: boolean}> = ({sound}) => (
  <AbsoluteFill style={{background: '#000'}}>
    {SCENES.map(([name, len]) => {
      const Scene = VIEW[name];
      return (
        <Sequence key={name} name={name} from={START[name]} durationInFrames={len}>
          {/* la fin se fond au noir à sa façon */}
          <Lights len={len} off={name !== 'End'}>
            <Scene />
          </Lights>
        </Sequence>
      );
    })}
    {sound ? <Html5Audio src={staticFile('sfx/music.wav')} volume={0.72} /> : null}
  </AbsoluteFill>
);
