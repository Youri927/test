import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {LowerThird, Sheet, Wall} from '../Bits';
import {M} from '../clips';
import {CameraRig, CamKey} from '../lib/camera';
import {ease} from '../lib/ease';
import {BrowserAt, Box, PhoneAt, onSite} from '../Stage';
import {BEAT, C, E, F, range} from '../util';

const B: Box = {x: 960, y: 530, w: 1500};
const WIDE = {x: 960, y: 540, s: 1.0};
const WHIP = 1250;
const WHIP_LEN = 20;

/** Entrée en filé : la caméra arrive de la gauche, très vite, puis se pose */
const whipIn = (to: Partial<CamKey> = WIDE): CamKey[] => [
  {...to, x: (to.x ?? 960) - WHIP, rz: -0.6, f: 0},
  {...to, rz: 0, ease: ease.out, f: WHIP_LEN},
];
/** Sortie en filé vers la droite, à partir du dernier cadrage */
const whipOut = (len: number, from: Partial<CamKey>): CamKey[] => [
  {...from, f: len - WHIP_LEN},
  {...from, x: (from.x ?? 960) + WHIP, rz: 0.6, ease: ease.in, f: len},
];

/* ——— Après : l'accueil, le soleil qui se lève puis s'ouvre ——— */
export const HERO_LEN = 13 * BEAT;
export const AfterHero: React.FC = () => {
  const f = useCurrentFrame();
  const end = onSite(B, 560, 400, {f: 0, s: 1.12});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          {f: 0, ...WIDE, s: 0.94},
          {f: 120, ...WIDE, s: 1.0, ease: E.sine},
          onSite(B, 820, 560, {f: 250, s: 1.32, ease: E.soft}),
          onSite(B, 800, 520, {f: 300, s: 1.3, ease: E.sine}),
          {f: 430, ...WIDE, s: 1.0, ease: E.soft},
          {...end, f: HERO_LEN - WHIP_LEN, ease: E.soft},
          ...whipOut(HERO_LEN, end).slice(1),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dHero, from: 0}} />
      </CameraRig>
      <LowerThird tag="The new site" title="Where Scottsdale lives outside" text="A real project rises like the sun beside the title, then opens to fill the screen as you scroll." at={300} out={HERO_LEN - 24} right />
      <Sheet level={range(f, 0, 50, 1, 0, E.inOut)} />
    </AbsoluteFill>
  );
};

/* ——— 01 : trois métiers ——— */
export const DISC_LEN = 10 * BEAT;
export const AfterDisc: React.FC = () => {
  const last = onSite(B, 620, 470, {f: 0, s: 1.16});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          {f: 150, ...WIDE, ease: E.sine},
          onSite(B, 820, 470, {f: 230, s: 1.16, ease: E.soft}),
          onSite(B, 980, 470, {f: 320, s: 1.18, ease: E.soft}),
          {...last, f: DISC_LEN - WHIP_LEN, ease: E.soft},
          ...whipOut(DISC_LEN, last).slice(1),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dDisc, from: 60}} />
      </CameraRig>
      <LowerThird tag="01" title="Three trades, one backyard" text="Pools, landscapes and outdoor living: three photo panels that open as you hover them." at={30} out={200} />
    </AbsoluteFill>
  );
};

/* ——— 02 : les 25 prestations ——— */
export const ELEMENTS_LEN = 11 * BEAT;
export const AfterElements: React.FC = () => {
  const last = onSite(B, 620, 520, {f: 0, s: 1.28});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          {f: 110, ...WIDE, ease: E.sine},
          onSite(B, 560, 440, {f: 220, s: 1.3, ease: E.soft}),
          onSite(B, 600, 500, {f: 400, s: 1.32, ease: E.sine}),
          {...last, f: ELEMENTS_LEN - WHIP_LEN, ease: E.sine},
          ...whipOut(ELEMENTS_LEN, last).slice(1),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dElements, from: 60}} />
      </CameraRig>
      <LowerThird tag="02" title="All 25 services, one index" text="Grouped the way a backyard comes together. The photo of each element follows the cursor, under the text." at={24} out={190} right dark />
    </AbsoluteFill>
  );
};

/* ——— 03 : les formes de bassin ——— */
export const POOLS_LEN = 14 * BEAT;
export const AfterPools: React.FC = () => {
  const plan = (f: number, s = 1.5): CamKey => onSite(B, 445, 390, {f, s, ease: E.soft});
  const list = (f: number): CamKey => onSite(B, 760, 430, {f, s: 1.12, ease: E.soft});
  const last = onSite(B, 445, 390, {f: 0, s: 1.42});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          plan(140),
          plan(205, 1.54),
          list(250),
          plan(320),
          list(405),
          plan(470, 1.56),
          list(565),
          {...last, f: POOLS_LEN - WHIP_LEN, ease: E.soft},
          ...whipOut(POOLS_LEN, last).slice(1),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dPools, from: 60}} />
      </CameraRig>
      <LowerThird tag="03" title="Seven pool designs, drawn in plan" text="Like an architect’s sheet: coping, steps and labels draw themselves, and light moves on the water." at={24} out={205} right />
    </AbsoluteFill>
  );
};

/* ——— 04 : les réalisations ——— */
export const WORK_LEN = 13 * BEAT;
export const AfterWork: React.FC = () => {
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn({...WIDE, s: 1.06}),
          onSite(B, 820, 560, {f: 130, s: 1.24, ease: E.soft}),
          onSite(B, 620, 560, {f: 420, s: 1.26, ease: E.sine}),
          {f: 500, ...WIDE, ease: E.soft},
          {f: WORK_LEN, ...WIDE, s: 1.04, ease: E.sine},
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dWork, from: 50, rate: 1.12}} />
      </CameraRig>
      <LowerThird tag="04" title="Built around Scottsdale" text="Ten projects from the company’s galleries, in a horizontal gallery and a full-screen viewer." at={40} out={250} />
    </AbsoluteFill>
  );
};

/* ——— 05 : le déroulé d'un projet ——— */
export const PROCESS_LEN = 11 * BEAT;
export const AfterProcess: React.FC = () => {
  const f = useCurrentFrame();
  const last = onSite(B, 760, 470, {f: 0, s: 1.06});
  return (
    <AbsoluteFill style={{opacity: range(f, 0, 24, 0, 1, E.inOut)}}>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          {f: 0, ...WIDE},
          onSite(B, 900, 430, {f: 150, s: 1.3, ease: E.soft}),
          onSite(B, 880, 520, {f: 380, s: 1.3, ease: E.sine}),
          {...last, f: PROCESS_LEN - WHIP_LEN, ease: E.soft},
          ...whipOut(PROCESS_LEN, last).slice(1),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dProcess, from: 30}} />
      </CameraRig>
      <LowerThird tag="05" title="From the first sketch to the first swim" text="Five steps, and the real timelines: 12 to 16 weeks for an average project." at={30} out={230} />
    </AbsoluteFill>
  );
};

/* ——— 06 : les avis ——— */
export const PROOF_LEN = 9 * BEAT;
export const AfterProof: React.FC = () => {
  const last = onSite(B, 560, 470, {f: 0, s: 1.22});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          onSite(B, 1110, 390, {f: 110, s: 1.9, ease: E.soft}),
          onSite(B, 1110, 405, {f: 170, s: 1.92, ease: E.sine}),
          onSite(B, 520, 460, {f: 240, s: 1.24, ease: E.soft}),
          {...last, f: PROOF_LEN, ease: E.sine},
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dProof, from: 60}} />
      </CameraRig>
      <LowerThird tag="06" title="5.0 on Google" text="Client reviews quoted word for word, next to the licence and the 20+ years." at={200} out={PROOF_LEN - 10} right />
    </AbsoluteFill>
  );
};

/* ——— 07 : le devis ——— */
export const QUOTE_LEN = 14 * BEAT;
export const AfterQuote: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: range(f, 0, 24, 0, 1, E.inOut)}}>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          {f: 0, ...WIDE},
          {f: 60, ...WIDE, ease: E.sine},
          onSite(B, 1060, 410, {f: 170, s: 1.46, ease: E.soft}),
          onSite(B, 1060, 440, {f: 480, s: 1.48, ease: E.sine}),
          onSite(B, 1000, 400, {f: QUOTE_LEN, s: 1.3, ease: E.soft}),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dQuote, from: 100, rate: 1.1}} />
      </CameraRig>
      <LowerThird tag="07" title="A free quote, in three steps" text="The project, a budget range, then contact details." at={24} out={170} dark />
      <Sheet level={range(f, QUOTE_LEN - 50, QUOTE_LEN, 0, 1, E.inOut)} />
    </AbsoluteFill>
  );
};

/* ——— Sur mobile ——— */
export const MOBILE_LEN = 9 * BEAT;
const PHONES = [
  {x: 545, w: 390, z: -30, clip: {meta: M.mHero, from: 0, rate: 1.25}, at: 4},
  {x: 960, w: 430, z: 60, clip: {meta: M.mPools, from: 0, rate: 1.18}, at: 10},
  {x: 1375, w: 390, z: -30, clip: {meta: M.mWork, from: 0}, at: 16},
];
export const AfterMobile: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Wall slats={0.8} />
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
      <div style={{position: 'absolute', left: 0, right: 0, top: 44, textAlign: 'center', fontFamily: F.display, fontSize: 52, letterSpacing: '-0.01em', color: C.ink, opacity: range(f, 20, 50)}}>
        Designed for the phone, <em>too.</em>
      </div>
      <Sheet level={range(f, 0, 50, 1, 0, E.inOut)} />
      <Sheet level={range(f, MOBILE_LEN - 50, MOBILE_LEN, 0, 1, E.inOut)} />
    </AbsoluteFill>
  );
};
