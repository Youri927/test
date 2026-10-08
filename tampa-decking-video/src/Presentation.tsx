import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import './fonts';
import {Finish, Riser} from './Bits';
import {PresSound} from './PresSound';
import {C} from './util';
import {AfterAbout, AfterAreas, AfterCost, AfterEstimate, AfterHero, AfterLayers, AfterMobile, AfterSurfaces, AfterWork} from './scenes/After';
import {Before} from './scenes/Before';
import {End} from './scenes/End';
import {Opening} from './scenes/Opening';
import {Turn} from './scenes/Turn';
import {DEPTH, RISES, SCENES, START, depthAt} from './timeline';

export {PRES_FRAMES} from './timeline';

const VIEW: Record<string, React.FC> = {
  Opening,
  Today: Before,
  Turn,
  Hero: AfterHero,
  Layers: AfterLayers,
  Work: AfterWork,
  Surfaces: AfterSurfaces,
  Cost: AfterCost,
  About: AfterAbout,
  Areas: AfterAreas,
  Estimate: AfterEstimate,
  Mobile: AfterMobile,
  End,
};

/** Le fond des sections du nouveau site : il s'assombrit d'une section à l'autre, de la plage au grand bain */
const Depth: React.FC = () => {
  const f = useCurrentFrame();
  if (f < START.Hero) return null;
  return <AbsoluteFill style={{background: depthAt(f)}} />;
};

/** Présentation du nouveau site de Tampa Decking & Pools, 16:9, 60 images/s */
export const Presentation: React.FC<{sound: boolean; music?: boolean}> = ({sound, music = true}) => (
  <AbsoluteFill style={{background: C.white}}>
    <Depth />
    {SCENES.map(([name, len]) => {
      const Scene = VIEW[name];
      const pre = RISES[name] ?? 0;
      return (
        <Sequence key={name} name={name} from={START[name] - pre} durationInFrames={len + pre}>
          <Riser pre={pre} bg={DEPTH[name]}>
            <Scene />
          </Riser>
        </Sequence>
      );
    })}
    <Finish />
    {sound ? <PresSound music={music} /> : null}
  </AbsoluteFill>
);
