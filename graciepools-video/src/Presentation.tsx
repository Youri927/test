import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import './fonts';
import {CaliperIn, Finish, PushBack} from './Bits';
import {PresSound} from './PresSound';
import {C} from './util';
import {AfterCompare, AfterGallery, AfterHero, AfterMobile, AfterModels, AfterOnePiece, AfterRequest, AfterService} from './scenes/After';
import {End} from './scenes/End';
import {Opening} from './scenes/Opening';
import {Sheet} from './scenes/Sheet';
import {Today} from './scenes/Today';
import {SCENES, START, pre} from './timeline';

export {PRES_FRAMES} from './timeline';

const VIEW: Record<string, React.FC> = {
  Opening,
  Today,
  Sheet,
  Hero: AfterHero,
  OnePiece: AfterOnePiece,
  Models: AfterModels,
  Compare: AfterCompare,
  Gallery: AfterGallery,
  Service: AfterService,
  Request: AfterRequest,
  Mobile: AfterMobile,
  End,
};

/** Présentation du nouveau site de Gracie Pools, 16:9, 60 images/s */
export const Presentation: React.FC<{sound: boolean; music?: boolean}> = ({sound, music = true}) => (
  <AbsoluteFill style={{background: C.white}}>
    {SCENES.map(([name, len], i) => {
      const Scene = VIEW[name];
      const p = pre(name);
      const next = SCENES[i + 1] ? pre(SCENES[i + 1][0]) : 0;
      return (
        <Sequence key={name} name={name} from={START[name] - p} durationInFrames={len + p}>
          <CaliperIn pre={p}>
            <PushBack len={len + p} next={next}>
              <Scene />
            </PushBack>
          </CaliperIn>
        </Sequence>
      );
    })}
    <Finish />
    {sound ? <PresSound music={music} /> : null}
  </AbsoluteFill>
);
