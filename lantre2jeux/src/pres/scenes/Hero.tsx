import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CameraRig} from '../../lib/camera';
import {Caption, Wall} from '../Bits';
import {M} from '../clips';
import {BrowserAt, Box, onSite, whipOut} from '../Stage';
import {BEAT, E} from '../util';

export const HERO_LEN = 12 * BEAT;
const B: Box = {x: 1190, y: 540, w: 1240};

/** 01 · Le noir : la torche s'allume, balaie le titre, puis suit la souris */
export const Hero: React.FC = () => (
  <AbsoluteFill>
    <Wall gx={62} gy={50} strength={0.07} />
    <CameraRig
      blur={1.1}
      keys={[
        onSite(B, 250, 330, {f: 0, s: 1.85, rz: -1.2}),
        onSite(B, 300, 335, {f: 28, s: 1.7, rz: -0.6, ease: E.sine}),
        // la caméra suit le faisceau qui balaie « Entrez. »
        onSite(B, 960, 330, {f: 138, s: 1.5, rz: 0.4, ease: E.inOut}),
        // recul : le site entier et la légende
        {f: 206, x: 960, y: 540, s: 1.0, rz: 0, ease: E.inOut},
        // la souris fouille le mur : on s'approche des indices
        onSite(B, 980, 430, {f: 322, s: 1.2, rz: 0.3, ease: E.sine}),
        // « La sortie ? Le bouton Réserver »
        onSite(B, 975, 640, {f: 404, s: 2.05, rz: 0, ease: E.inOut}),
        ...whipOut(onSite(B, 990, 650, {f: 0, s: 2.07}), HERO_LEN, 18),
      ]}
    >
      <BrowserAt b={B} clip={{meta: M.dHero, from: 30}} />
      <div style={{position: 'absolute', left: 96, top: 360}}>
        <Caption num="01" title="Le noir" text="La page s’ouvre dans l’obscurité. Une lampe torche suit la souris et révèle des indices cachés sur le mur." at={150} width={430} />
      </div>
    </CameraRig>
  </AbsoluteFill>
);
