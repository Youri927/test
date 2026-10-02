import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import './fonts';
import {AdSound} from './AdSound';
import {Bug} from './Bits';
import {Finish} from './Finish';
import {Cta, CTA_LEN} from './scenes/Cta';
import {Hook, HOOK_LEN} from './scenes/Hook';
import {Montage, MONTAGE_LEN} from './scenes/Montage';
import {Offer, OFFER_LEN} from './scenes/Offer';
import {Proof, PROOF_LEN} from './scenes/Proof';
import {Rooms, ROOMS_LEN} from './scenes/Rooms';
import {C} from './theme';

const SCENES = [
  {C: Hook, len: HOOK_LEN, name: 'Accroche : escape game à Soissons'},
  {C: Montage, len: MONTAGE_LEN, name: 'Fouillez, réfléchissez, manipulez'},
  {C: Rooms, len: ROOMS_LEN, name: 'Les trois portes'},
  {C: Proof, len: PROOF_LEN, name: 'Preuve sociale'},
  {C: Offer, len: OFFER_LEN, name: 'Le cadenas des prix'},
  {C: Cta, len: CTA_LEN, name: 'La porte est ouverte'},
];

export const AD_FRAMES = SCENES.reduce((a, s) => a + s.len, 0);
const BUG_FROM = HOOK_LEN;
const BUG_TO = AD_FRAMES - CTA_LEN;

const PersistentBug: React.FC = () => {
  const f = useCurrentFrame();
  const o = Math.min(Math.max((f - BUG_FROM) / 6, 0), 1) * Math.min(Math.max((BUG_TO - f) / 6, 0), 1);
  return o > 0 ? <Bug opacity={o} /> : null;
};

export const Ad: React.FC<{sound?: boolean}> = ({sound = true}) => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: C.ink}}>
      {SCENES.map(({C: Scene, len, name}) => {
        const seq = (
          <Sequence key={name} name={name} from={from} durationInFrames={len}>
            <Scene />
          </Sequence>
        );
        from += len;
        return seq;
      })}
      <PersistentBug />
      <Finish />
      {sound ? <AdSound /> : null}
    </AbsoluteFill>
  );
};
