import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import './fonts';
import {AdSound} from './AdSound';
import {Finish} from './Finish';
import {Cta, CTA_LEN} from './scenes/Cta';
import {Hook, HOOK_LEN} from './scenes/Hook';
import {Offer, OFFER_LEN} from './scenes/Offer';
import {Proof, PROOF_LEN} from './scenes/Proof';
import {Rooms, ROOMS_LEN} from './scenes/Rooms';
import {C} from './theme';

const SCENES = [
  {C: Hook, len: HOOK_LEN, name: 'Accroche : la torche'},
  {C: Rooms, len: ROOMS_LEN, name: 'Les trois portes'},
  {C: Proof, len: PROOF_LEN, name: 'Preuve sociale'},
  {C: Offer, len: OFFER_LEN, name: 'Le cadenas des prix'},
  {C: Cta, len: CTA_LEN, name: 'La porte est ouverte'},
];

export const AD_FRAMES = SCENES.reduce((a, s) => a + s.len, 0);

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
      <Finish />
      {sound ? <AdSound /> : null}
    </AbsoluteFill>
  );
};
