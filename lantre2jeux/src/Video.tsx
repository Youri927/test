import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Finish} from './components/Atmosphere';
import {Booking, BOOKING_LEN} from './scenes/Booking';
import {Brand, BRAND_LEN} from './scenes/Brand';
import {Cta, CTA_LEN} from './scenes/Cta';
import {Hook, HOOK_LEN} from './scenes/Hook';
import {Rooms, ROOMS_LEN} from './scenes/Rooms';
import {Sound} from './Sound';
import {theme} from './theme';

const SCENES = [
  {C: Hook, len: HOOK_LEN, name: 'Accroche'},
  {C: Brand, len: BRAND_LEN, name: 'Marque'},
  {C: Rooms, len: ROOMS_LEN, name: 'Salles'},
  {C: Booking, len: BOOKING_LEN, name: 'Réservation'},
  {C: Cta, len: CTA_LEN, name: 'CTA'},
];

export const TOTAL_FRAMES = SCENES.reduce((a, s) => a + s.len, 0);

export const Video: React.FC<{sound?: boolean}> = ({sound = true}) => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: theme.colors.bg}}>
      {SCENES.map(({C, len, name}) => {
        const seq = (
          <Sequence key={name} name={name} from={from} durationInFrames={len}>
            <C />
          </Sequence>
        );
        from += len;
        return seq;
      })}
      <Finish />
      {sound ? <Sound /> : null}
    </AbsoluteFill>
  );
};
