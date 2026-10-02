import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {LowerThird, Sheet, Wall} from '../Bits';
import {M} from '../clips';
import {CameraRig} from '../lib/camera';
import {BrowserAt, Box, PhoneAt, onSite} from '../Stage';
import {BEAT, C, E, F, range} from '../util';

const B: Box = {x: 960, y: 530, w: 1500};
const fadeIn = (f: number) => range(f, 0, 26, 0, 1, E.inOut);

/* ——— Après : l'accueil ——— */
export const HERO_LEN = 11 * BEAT;
export const AfterHero: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.5}
        keys={[
          {f: 0, x: 960, y: 540, s: 1.0},
          {f: 170, x: 960, y: 540, s: 1.0, ease: E.sine},
          onSite(B, 660, 560, {f: 300, s: 1.5, ease: E.soft}),
          onSite(B, 690, 550, {f: HERO_LEN, s: 1.46, ease: E.sine}),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dHero, from: 0}} />
      </CameraRig>
      <LowerThird tag="After" title="The face, layer by layer" text="Treatments are organised by the layer of the face they work on. Hover a layer, and it appears on the face." at={170} out={HERO_LEN - 10} right />
      <Sheet level={range(f, 0, 50, 1, 0, E.inOut)} />
    </AbsoluteFill>
  );
};

/* ——— 01 : les cinq couches ——— */
export const LAYERS_LEN = 22 * BEAT;
export const AfterLayers: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fadeIn(f)}}>
      <Wall />
      <CameraRig
        blur={0.5}
        keys={[
          {f: 0, x: 960, y: 540, s: 1.0},
          onSite(B, 1080, 470, {f: 200, s: 1.32, ease: E.soft}),
          onSite(B, 1080, 470, {f: 300, s: 1.34, ease: E.sine}),
          onSite(B, 600, 450, {f: 420, s: 1.22, ease: E.soft}),
          onSite(B, 620, 470, {f: 760, s: 1.25, ease: E.sine}),
          onSite(B, 700, 500, {f: 860, s: 1.4, ease: E.soft}),
          onSite(B, 760, 480, {f: LAYERS_LEN, s: 1.3, ease: E.sine}),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dLayers, from: 30}} />
      </CameraRig>
      <LowerThird tag="01" title="Five layers, from skin to bone" text="As you scroll, the face separates into five drawn layers. Every treatment sits in its layer, and can be ticked for the consultation." at={30} out={320} />
    </AbsoluteFill>
  );
};

/* ——— 02 : les spécialités ——— */
export const SIGNATURE_LEN = 13 * BEAT;
export const AfterSignature: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fadeIn(f)}}>
      <Wall />
      <CameraRig
        blur={0.5}
        keys={[
          {f: 0, x: 960, y: 540, s: 1.0},
          {f: 120, x: 960, y: 540, s: 1.0, ease: E.sine},
          onSite(B, 700, 440, {f: 250, s: 1.22, ease: E.soft}),
          onSite(B, 720, 450, {f: SIGNATURE_LEN, s: 1.27, ease: E.sine}),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dSignature, from: 20}} />
      </CameraRig>
      <LowerThird tag="02" title="Signature procedures" text="Jaw contouring, eyelid surgery, rhinoplasty and the endoscopic facelift, each drawn as you scroll." at={30} out={220} dark />
    </AbsoluteFill>
  );
};

/* ——— 03 : le chirurgien ——— */
export const SURGEON_LEN = 12 * BEAT;
export const AfterSurgeon: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fadeIn(f)}}>
      <Wall />
      <CameraRig
        blur={0.5}
        keys={[
          {f: 0, x: 960, y: 540, s: 1.0},
          onSite(B, 560, 300, {f: 140, s: 1.3, ease: E.soft}),
          onSite(B, 980, 420, {f: 300, s: 1.32, ease: E.soft}),
          onSite(B, 1000, 460, {f: SURGEON_LEN, s: 1.36, ease: E.sine}),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dSurgeon, from: 20}} />
      </CameraRig>
      <LowerThird tag="03" title="Dr. Charles S. Lee" text="His two board certifications, up front. His training reads as a path that fills in as you scroll." at={150} out={SURGEON_LEN - 10} />
    </AbsoluteFill>
  );
};

/* ——— 04 : les résultats ——— */
export const RESULTS_LEN = 10 * BEAT;
export const AfterResults: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fadeIn(f)}}>
      <Wall />
      <CameraRig
        blur={0.5}
        keys={[
          {f: 0, x: 960, y: 540, s: 1.0},
          onSite(B, 560, 420, {f: 200, s: 1.3, ease: E.soft}),
          onSite(B, 620, 430, {f: 330, s: 1.32, ease: E.sine}),
          onSite(B, 700, 460, {f: RESULTS_LEN, s: 1.2, ease: E.soft}),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dResults, from: 30}} />
      </CameraRig>
      <LowerThird tag="04" title="Before & after" text="The practice’s real photo galleries, the 4.4 rating and patient reviews." at={24} out={240} right />
    </AbsoluteFill>
  );
};

/* ——— 05 : la consultation ——— */
export const VISIT_LEN = 10 * BEAT;
export const AfterVisit: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fadeIn(f)}}>
      <Wall />
      <CameraRig
        blur={0.5}
        keys={[
          {f: 0, x: 960, y: 540, s: 1.0},
          onSite(B, 520, 420, {f: 130, s: 1.42, ease: E.soft}),
          onSite(B, 520, 470, {f: 330, s: 1.44, ease: E.sine}),
          onSite(B, 520, 440, {f: VISIT_LEN, s: 1.4, ease: E.soft}),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dVisit, from: 80, rate: 1.15}} />
      </CameraRig>
      <LowerThird tag="05" title="A complimentary consultation" text="Ticked treatments, a name and a phone number: the message to the practice writes itself." at={24} out={210} right />
    </AbsoluteFill>
  );
};

/* ——— Sur mobile ——— */
export const MOBILE_LEN = 9 * BEAT;
const PHONES = [
  {x: 545, w: 390, z: -30, clip: {meta: M.mHero, from: 0}, at: 4},
  {x: 960, w: 430, z: 60, clip: {meta: M.mLayers, from: 0, rate: 1.25}, at: 10},
  {x: 1375, w: 390, z: -30, clip: {meta: M.mVisit, from: 0}, at: 16},
];
export const AfterMobile: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fadeIn(f)}}>
      <Wall />
      <CameraRig
        blur={0.5}
        keys={[
          {f: 0, x: 960, y: 580, s: 0.96, ry: 6},
          {f: MOBILE_LEN, x: 960, y: 572, s: 1.0, ry: -6, ease: E.sine},
        ]}
      >
        {PHONES.map((p, i) => (
          <PhoneAt key={i} x={p.x} y={600 + Math.sin((f + i * 40) / 60) * 7 + range(f, p.at, p.at + 40, 140, 0, E.out)} w={p.w} z={p.z} clip={p.clip} transform={`rotateY(${(i - 1) * -5}deg)`} />
        ))}
      </CameraRig>
      <div style={{position: 'absolute', left: 0, right: 0, top: 46, textAlign: 'center', fontFamily: F.display, fontWeight: 300, fontSize: 46, letterSpacing: '-0.02em', color: C.ink, opacity: range(f, 20, 50)}}>
        Designed for mobile, too.
      </div>
      <Sheet level={range(f, MOBILE_LEN - 50, MOBILE_LEN, 0, 1, E.inOut)} />
    </AbsoluteFill>
  );
};
