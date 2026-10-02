import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CameraRig} from '../../lib/camera';
import {Caption, Wall} from '../Bits';
import {M} from '../clips';
import {BrowserAt, Box, onSite, whipIn, whipOut} from '../Stage';
import {BEAT, E} from '../util';

export const LOCK_LEN = 7 * BEAT;
const B: Box = {x: 1190, y: 540, w: 1240};
/** décalage dans le plan filmé : les clics sur « + » tombent à 120 et 180 */
export const LOCK_FROM = 0;

/** 05 · Le cadenas : deux clics, le prix par joueur descend */
export const Lock: React.FC = () => (
  <AbsoluteFill>
    <Wall gx={62} gy={50} strength={0.07} />
    <CameraRig
      blur={1.1}
      keys={[
        ...whipIn({f: 0, x: 960, y: 540, s: 1.0, rz: 0}, 22),
        {f: 94, x: 960, y: 540, s: 1.02, ease: E.sine},
        // le cadenas et le prix, pendant les clics
        onSite(B, 930, 390, {f: 122, s: 2.05, rz: 0.4, ease: E.inOut}),
        onSite(B, 950, 395, {f: LOCK_LEN - 16, s: 2.15, rz: 0, ease: E.sine}),
        ...whipOut(onSite(B, 955, 395, {f: 0, s: 2.15}), LOCK_LEN, 16),
      ]}
    >
      <BrowserAt b={B} clip={{meta: M.dPricing, from: LOCK_FROM}} />
      <div style={{position: 'absolute', left: 96, top: 360}}>
        <Caption num="05" title="Le cadenas" text="Les tarifs se lisent en tournant la molette d’un cadenas à code. Plus l’équipe est grande, moins c’est cher." at={10} width={430} />
      </div>
    </CameraRig>
  </AbsoluteFill>
);
