import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import './fonts';
import {Finish, PillIn, PushBack, Smile, smileWindow} from './Bits';
import {PresSound} from './PresSound';
import {C} from './util';
import {AfterCrowns, AfterDoctor, AfterHero, AfterImplants, AfterMobile, AfterRequest, AfterSedation, AfterTreatments} from './scenes/After';
import {End} from './scenes/End';
import {Opening} from './scenes/Opening';
import {Today} from './scenes/Today';
import {TURN_PILL, Turn} from './scenes/Turn';
import {SCENES, START, pre} from './timeline';

export {PRES_FRAMES} from './timeline';

const VIEW: Record<string, React.FC> = {
  Opening,
  Today,
  Turn,
  Hero: AfterHero,
  Implants: AfterImplants,
  Crowns: AfterCrowns,
  Treatments: AfterTreatments,
  Sedation: AfterSedation,
  Doctor: AfterDoctor,
  Request: AfterRequest,
  Mobile: AfterMobile,
  End,
};

/** Présentation du nouveau site d'Implant and Comprehensive Dentistry of Naples, 16:9, 60 images/s */
export const Presentation: React.FC<{sound: boolean; music?: boolean}> = ({sound, music = true}) => (
  <AbsoluteFill style={{background: C.white}}>
    {SCENES.map(([name, len], i) => {
      const Scene = VIEW[name];
      const p = pre(name);
      const next = SCENES[i + 1] ? pre(SCENES[i + 1][0]) : 0;
      // l'accueil s'ouvre depuis la pastille du sourire de « Turn », qui garde d'abord la photo
      const hero = name === 'Hero';
      return (
        <Sequence key={name} name={name} from={START[name] - p} durationInFrames={len + p}>
          <PillIn pre={p} from={hero ? TURN_PILL : undefined} cover={hero ? (w, h) => <Smile w={w} h={h} focus={smileWindow(w, h, TURN_PILL.w)} /> : undefined}
            coverOut={hero ? [0.42, 0.9] : undefined}>
            <PushBack len={len + p} next={next}>
              <Scene />
            </PushBack>
          </PillIn>
        </Sequence>
      );
    })}
    <Finish />
    {sound ? <PresSound music={music} /> : null}
  </AbsoluteFill>
);
