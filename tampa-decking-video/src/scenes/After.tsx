import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Caption} from '../Bits';
import {M} from '../clips';
import {CameraRig, CamKey} from '../lib/camera';
import {ease} from '../lib/ease';
import {BrowserAt, Box, PhoneAt, focus} from '../Stage';
import {LAYERS_CLIP, RATE} from '../beats.ts';
import {DIVE_LEN, LEN, RISE} from '../timeline';
import {C, E, H2, range} from '../util';

const B: Box = {x: 960, y: 548, w: 1480};
const WIDE = {x: 960, y: 548, s: 1.0};
const DIVE = 1180;

/** Entrée en plongée : la caméra descend, le navigateur arrive par le bas et se pose */
const diveIn = (to: Partial<CamKey> = WIDE): CamKey[] => [
  {...to, y: (to.y ?? WIDE.y) - DIVE, f: 0},
  {...to, ease: ease.out, f: DIVE_LEN},
];
/** Sortie : la caméra continue de descendre, le navigateur part par le haut */
const end = (len: number, last: CamKey): CamKey[] => [
  {...last, f: len - DIVE_LEN, ease: E.soft},
  {...last, y: (last.y ?? WIDE.y) + DIVE, ease: ease.in, f: len},
];

const Rig: React.FC<{keys: CamKey[]; children: React.ReactNode}> = ({keys, children}) => (
  <CameraRig blur={0.55} keys={keys}>
    {children}
  </CameraRig>
);

/* ——— L'arrivée : le titre monte, la photo monte comme l'eau, survol du bouton, puis la page descend ——— */
export const AfterHero: React.FC = () => {
  const len = LEN.Hero + RISE;
  const last = {...WIDE, s: 1.02, ry: 1.5, f: 0};
  return (
    <AbsoluteFill>
      <Rig
        keys={[
          {f: 0, ...WIDE, s: 0.96},
          {f: RISE + 170, ...WIDE, s: 1.0, ry: -1.5, ease: E.sine},
          focus(B, 1180, 190, {f: RISE + 262, s: 1.78, ry: 0, ease: E.soft}),
          focus(B, 1170, 200, {f: RISE + 340, s: 1.82, ease: E.sine}),
          focus(B, 720, 560, {f: RISE + 430, s: 1.06, ry: 1.5, ease: E.soft}),
          ...end(len, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dHero, delay: RISE - 6}} />
      </Rig>
      <Caption title="Their work, first thing" text="One of their own stone spas fills the screen on arrival, rising like water filling a pool." at={RISE + 372} out={len - 30} right />
    </AbsoluteFill>
  );
};

/* ——— La coupe : le dessin se construit, chaque couche s'allume, le panneau change ——— */
export const AfterLayers: React.FC = () => {
  const len = LEN.Layers;
  const last = {...WIDE, s: 1.0, f: 0};
  return (
    <AbsoluteFill>
      <Rig
        keys={[
          ...diveIn({...WIDE, ry: -2}),
          {f: 96, ...WIDE, ry: -1, ease: E.sine},
          focus(B, 720, 450, {f: 170, s: 1.3, ry: 0, ease: E.soft}),
          focus(B, 720, 440, {f: 390, s: 1.33, ease: E.sine}),
          focus(B, 1110, 420, {f: 456, s: 1.6, ease: E.soft}),
          focus(B, 1110, 430, {f: 570, s: 1.64, ease: E.sine}),
          focus(B, 720, 450, {f: 634, s: 1.3, ease: E.soft}),
          focus(B, 720, 455, {f: 770, s: 1.32, ease: E.sine}),
          {f: 822, ...WIDE, ry: 1.5, ease: E.soft},
          ...end(len, {...last, ry: 1.5}),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dLayers, ...LAYERS_CLIP}} />
      </Rig>
      <Caption title="Every layer, in section" text="A drawing of a real pool edge. As you scroll, each layer lights up, with their photos and options." at={150} out={410} right />
    </AbsoluteFill>
  );
};

/* ——— Le travail : les colonnes glissent, puis la visionneuse ——— */
export const AfterWork: React.FC = () => {
  const len = LEN.Work;
  const last = {...WIDE, s: 1.04, ry: -1, f: 0};
  return (
    <AbsoluteFill>
      <Rig
        keys={[
          ...diveIn({...WIDE, ry: 2}),
          {f: 96, ...WIDE, ry: 1, ease: E.sine},
          focus(B, 720, 470, {f: 180, s: 1.3, ry: -1, ease: E.soft}),
          focus(B, 720, 430, {f: 320, s: 1.33, ry: 0, ease: E.sine}),
          {f: 370, ...WIDE, s: 1.0, ease: E.soft},
          ...end(len, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dWork, rate: RATE.Work}} />
      </Rig>
      <Caption title="15 photos of their work" text="Three columns glide at different speeds, and any photo opens full screen." at={60} out={330} right />
    </AbsoluteFill>
  );
};

/* ——— Les surfaces : l'échantillon survolé s'ouvre ——— */
export const AfterSurfaces: React.FC = () => {
  const len = LEN.Surfaces;
  const last = focus(B, 720, 430, {f: 0, s: 1.32});
  return (
    <AbsoluteFill>
      <Rig
        keys={[
          ...diveIn({...WIDE, ry: -2}),
          {f: 70, ...WIDE, ry: -1, ease: E.sine},
          focus(B, 720, 440, {f: 160, s: 1.3, ry: 0, ease: E.soft}),
          ...end(len, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dSurfaces, rate: RATE.Surfaces}} />
      </Rig>
      <Caption title="Their materials, up close" text="Eight samples cut from their own photos. Point at one and it opens." at={70} out={len - 34} right width={600} />
    </AbsoluteFill>
  );
};

/* ——— Les prix : les barres s'allongent, les montants comptent ——— */
export const AfterCost: React.FC = () => {
  const len = LEN.Cost;
  const last = focus(B, 720, 560, {f: 0, s: 1.32});
  return (
    <AbsoluteFill>
      <Rig
        keys={[
          ...diveIn({...WIDE, ry: 2}),
          {f: 50, ...WIDE, ry: 1, ease: E.sine},
          focus(B, 720, 560, {f: 150, s: 1.3, ry: 0, ease: E.soft}),
          ...end(len, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dCost, rate: RATE.Cost}} />
      </Rig>
      <Caption title="Prices, up front" text="The ranges from their own pricing page, on one scale: plaster, pebble, tile." at={40} out={len - 30} />
    </AbsoluteFill>
  );
};

/* ——— La famille : le titre se révèle mot à mot, Mark et sa femme, les avis ——— */
export const AfterAbout: React.FC = () => {
  const len = LEN.About;
  const last = focus(B, 720, 560, {f: 0, s: 1.3});
  return (
    <AbsoluteFill>
      <Rig
        keys={[
          ...diveIn({...WIDE, ry: -2}),
          {f: 110, ...WIDE, s: 1.02, ry: -1, ease: E.sine},
          focus(B, 720, 400, {f: 220, s: 1.3, ry: 0, ease: E.soft}),
          focus(B, 720, 430, {f: 300, s: 1.32, ease: E.sine}),
          focus(B, 720, 560, {f: 390, s: 1.3, ease: E.soft}),
          ...end(len, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dAbout, rate: RATE.About}} dark />
      </Rig>
      <Caption title="The family behind it" text="Mark Haskins and his wife, how they started out caring for pools, and two signed reviews." at={190} out={len - 30} tone="white" right />
    </AbsoluteFill>
  );
};

/* ——— Les villes : « Bra », puis « Brandon » : oui ——— */
export const AfterAreas: React.FC = () => {
  const len = LEN.Areas;
  const last = focus(B, 720, 400, {f: 0, s: 1.3});
  return (
    <AbsoluteFill>
      <Rig
        keys={[
          ...diveIn({...WIDE, ry: 2}),
          {f: 60, ...WIDE, ry: 1, ease: E.sine},
          focus(B, 720, 470, {f: 140, s: 1.32, ry: 0, ease: E.soft}),
          focus(B, 720, 480, {f: 236, s: 1.36, ease: E.sine}),
          focus(B, 720, 400, {f: 300, s: 1.3, ease: E.soft}),
          ...end(len, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dAreas, rate: RATE.Areas}} dark />
      </Rig>
      <Caption title="Do you work in my city?" text="Their 23 cities in Hillsborough, Pasco and Pinellas. Type yours, the answer is instant." at={40} out={len - 30} tone="white" right />
    </AbsoluteFill>
  );
};

/* ——— Le devis : le formulaire rempli, envoyé, le remerciement ——— */
export const AfterEstimate: React.FC = () => {
  const len = LEN.Estimate;
  const last = focus(B, 720, 120, {f: 0, s: 1.3});
  return (
    <AbsoluteFill>
      <Rig
        keys={[
          ...diveIn({...WIDE, ry: -2}),
          {f: 64, ...WIDE, ry: -1, ease: E.sine},
          focus(B, 720, 300, {f: 130, s: 1.3, ry: 0, ease: E.soft}),
          focus(B, 720, 420, {f: 250, s: 1.32, ease: E.sine}),
          focus(B, 720, 480, {f: 380, s: 1.32, ease: E.sine}),
          focus(B, 720, 560, {f: 480, s: 1.3, ease: E.sine}),
          focus(B, 720, 120, {f: 556, s: 1.3, ease: E.soft}),
          ...end(len, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dEstimate, rate: RATE.Estimate}} dark />
      </Rig>
      <Caption title="A form that works" text="Today’s form shows raw code. The new one checks every field and confirms the request." at={40} out={300} />
    </AbsoluteFill>
  );
};

/* ——— Sur téléphone ——— */
const PHONES = [
  {x: 520, w: 400, z: -40, clip: {meta: M.mHero}, at: 0},
  {x: 960, w: 440, z: 60, clip: {meta: M.mLayers}, at: 7},
  {x: 1400, w: 400, z: -40, clip: {meta: M.mMenu}, at: 14},
];
export const AfterMobile: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.Mobile;
  return (
    <AbsoluteFill>
      <CameraRig
        blur={0.5}
        keys={[
          {f: 0, x: 960, y: 600, s: 0.95, ry: 5},
          {f: len - DIVE_LEN, x: 960, y: 590, s: 1.0, ry: -5, ease: E.sine},
          {f: len, x: 960, y: 590 + DIVE, s: 1.0, ry: -5, ease: ease.in},
        ]}
      >
        {PHONES.map((p, i) => (
          <PhoneAt key={i} x={p.x} y={650 + Math.sin((f + i * 40) / 60) * 6 + range(f, p.at, p.at + DIVE_LEN + 16, 1100, 0, E.out)} w={p.w} z={p.z} clip={p.clip} transform={`rotateY(${(i - 1) * -5}deg)`} />
        ))}
      </CameraRig>
      <div style={{position: 'absolute', left: 0, right: 0, top: 52, textAlign: 'center', ...H2, fontSize: 56, color: C.white, opacity: range(f, 26, 56) * range(f, len - DIVE_LEN, len - 8, 1, 0)}}>
        Just as clear on a phone
      </div>
    </AbsoluteFill>
  );
};
