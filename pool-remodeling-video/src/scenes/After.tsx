import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {ArchCover, ArchReveal, LowerThird, Wall} from '../Bits';
import {M} from '../clips';
import {CameraRig, CamKey} from '../lib/camera';
import {ease} from '../lib/ease';
import {BrowserAt, Box, PhoneAt, onSite} from '../Stage';
import {BEAT, C, DISPLAY, E, range} from '../util';

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
const end = (len: number, last: CamKey) => [{...last, f: len - WHIP_LEN, ease: E.soft}, ...whipOut(len, last).slice(1)];

/* ——— L'accueil : l'arche monte, puis s'ouvre en plein écran ——— */
export const HERO_LEN = 12 * BEAT;
export const AfterHero: React.FC = () => {
  const last = {...WIDE, s: 1.02, f: 0};
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          {f: 0, ...WIDE, s: 0.84},
          {f: 70, ...WIDE, s: 0.96, ease: E.out},
          onSite(B, 470, 420, {f: 150, s: 1.32, ease: E.soft}),
          onSite(B, 480, 430, {f: 200, s: 1.34, ease: E.sine}),
          {f: 280, ...WIDE, s: 1.0, ease: E.soft},
          ...end(HERO_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dHero, from: 0, rate: 1.2}} />
      </CameraRig>
      <LowerThird tag="First impression" title="Impossible to mistake for a template." text="A real backyard, framed in the arch of the WAVE logo. Scroll, and you step right into it." at={250} out={HERO_LEN - 24} right />
    </AbsoluteFill>
  );
};

/* ——— La confiance d'un coup d'œil ——— */
export const TRUST_LEN = 8 * BEAT;
export const AfterTrust: React.FC = () => {
  const last = onSite(B, 720, 620, {f: 0, s: 1.12});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          onSite(B, 560, 380, {f: 90, s: 1.22, ease: E.soft}),
          onSite(B, 560, 470, {f: 220, s: 1.24, ease: E.sine}),
          {...last, f: 290, ease: E.soft},
          ...end(TRUST_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dIntro, from: 40, rate: 1.2}} />
      </CameraRig>
      <LowerThird tag="Trust" title="Trust, at a glance." text="Family-owned, licensed, bonded and insured, 20+ years of combined experience: said once, clearly." at={26} out={TRUST_LEN - 30} right />
    </AbsoluteFill>
  );
};

/* ——— Les trois métiers ——— */
export const PATHS_LEN = 10 * BEAT;
export const AfterPaths: React.FC = () => {
  const last = onSite(B, 700, 470, {f: 0, s: 1.06});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          onSite(B, 720, 620, {f: 90, s: 1.18, ease: E.soft}),
          onSite(B, 720, 640, {f: 200, s: 1.2, ease: E.sine}),
          {f: 280, ...WIDE, ease: E.soft},
          {...last, f: 380, ease: E.sine},
          ...end(PATHS_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dPaths, from: 30, rate: 1.25}} />
      </CameraRig>
      <LowerThird tag="Services" title="Every client finds their case." text="Remodel, resurface or build: three starting points, in plain words. No more walls of keywords." at={30} out={250} />
    </AbsoluteFill>
  );
};

/* ——— Les prix ——— */
export const COST_LEN = 10 * BEAT;
export const AfterCost: React.FC = () => {
  const last = onSite(B, 720, 450, {f: 0, s: 1.04});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          {f: 70, ...WIDE, ease: E.sine},
          onSite(B, 700, 560, {f: 150, s: 1.2, ease: E.soft}),
          onSite(B, 700, 580, {f: 270, s: 1.22, ease: E.sine}),
          {...last, f: 340, ease: E.soft},
          ...end(COST_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dCost, from: 30, rate: 1.25}} />
      </CameraRig>
      <LowerThird tag="Prices" title="The first question, answered." text="“What will it cost?” WAVE’s own published starting points, right on the page, before anyone calls." at={30} out={260} right dark />
    </AbsoluteFill>
  );
};

/* ——— Les chantiers ——— */
export const WORK_LEN = 10 * BEAT;
export const AfterWork: React.FC = () => {
  const last = onSite(B, 880, 460, {f: 0, s: 1.16});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          {f: 90, ...WIDE, ease: E.sine},
          onSite(B, 900, 430, {f: 200, s: 1.22, ease: E.soft}),
          onSite(B, 900, 440, {f: 360, s: 1.24, ease: E.sine}),
          ...end(WORK_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dWork, from: 30, rate: 1.25}} />
      </CameraRig>
      <LowerThird tag="Work" title="Proof, not stock photos." text="Real finished pools rise one after another as you scroll, and open full screen." at={30} out={200} />
    </AbsoluteFill>
  );
};

/* ——— Le local : la saison, puis la carte ——— */
export const LOCAL_LEN = 11 * BEAT;
const CUT = 235;
export const AfterLocal: React.FC = () => {
  const last = onSite(B, 900, 480, {f: 0, s: 1.18});
  const mid = onSite(B, 700, 520, {f: 0, s: 1.12});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          onSite(B, 620, 420, {f: 90, s: 1.1, ease: E.soft}),
          {...mid, f: 200, ease: E.sine},
          {...mid, x: (mid.x ?? 960) + WHIP, rz: 0.6, f: CUT, ease: ease.in},
          {...WIDE, x: 960 - WHIP, rz: -0.6, f: CUT + 1, ease: ease.linear},
          {...WIDE, rz: 0, f: CUT + WHIP_LEN, ease: ease.out},
          onSite(B, 900, 470, {f: CUT + 120, s: 1.18, ease: E.soft}),
          ...end(LOCAL_LEN, last),
        ]}
      >
        <Sequence durationInFrames={CUT} layout="none"><BrowserAt b={B} clip={{meta: M.dSeason, from: 40, rate: 1.3}} /></Sequence>
        <Sequence from={CUT} layout="none"><BrowserAt b={B} clip={{meta: M.dAreas, from: 70, rate: 1.3}} /></Sequence>
      </CameraRig>
      <LowerThird tag="Local" title="Local, down to the degree." text="Scottsdale’s real temperatures, from NOAA, with the best season to build. No template has that." at={30} out={CUT - 8} />
      <Sequence from={CUT} layout="none">
        <LowerThird tag="Local" title="Every town they serve, mapped." text="Drawn from US Census maps, with rings every five miles around the WAVE address." at={40} out={LOCAL_LEN - CUT - 26} right />
      </Sequence>
    </AbsoluteFill>
  );
};

/* ——— Le contact ——— */
export const CONTACT_LEN = 11 * BEAT;
export const AfterContact: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          onSite(B, 380, 470, {f: 80, s: 1.38, ease: E.soft}),
          onSite(B, 390, 490, {f: 150, s: 1.4, ease: E.sine}),
          onSite(B, 1060, 440, {f: 220, s: 1.36, ease: E.soft}),
          onSite(B, 1060, 520, {f: 400, s: 1.38, ease: E.sine}),
          {f: CONTACT_LEN, ...WIDE, s: 1.04, ease: E.soft},
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dContact, from: 60, rate: 1.45}} />
      </CameraRig>
      <LowerThird tag="Contact" title="From visit to phone call." text="“Open now”, live in Arizona time. One tap to call, and a free-estimate form that takes a minute." at={26} out={190} right dark />
      <ArchCover level={range(f, CONTACT_LEN - 50, CONTACT_LEN, 0, 1, E.inOut)} color={C.golden} />
    </AbsoluteFill>
  );
};

/* ——— Sur téléphone ——— */
export const MOBILE_LEN = 8 * BEAT;
const PHONES = [
  {x: 545, w: 390, z: -30, clip: {meta: M.mHero, from: 90, rate: 1.1}, at: 4},
  {x: 960, w: 430, z: 60, clip: {meta: M.mWork, from: 20, rate: 1.1}, at: 10},
  {x: 1375, w: 390, z: -30, clip: {meta: M.mCost, from: 30, rate: 1.1}, at: 16},
];
export const AfterMobile: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Wall tint={C.golden} />
      <CameraRig
        blur={0.5}
        keys={[
          {f: 0, x: 960, y: 590, s: 0.95, ry: 6},
          {f: MOBILE_LEN, x: 960, y: 580, s: 1.0, ry: -6, ease: E.sine},
        ]}
      >
        {PHONES.map((p, i) => (
          <PhoneAt key={i} x={p.x} y={610 + Math.sin((f + i * 40) / 60) * 7 + range(f, p.at, p.at + 40, 140, 0, E.out)} w={p.w} z={p.z} clip={p.clip} transform={`rotateY(${(i - 1) * -5}deg)`} />
        ))}
      </CameraRig>
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', ...DISPLAY, fontSize: 60, letterSpacing: '-0.035em', color: C.ink, opacity: range(f, 20, 50)}}>
        Built for the phone in their hand.
      </div>
      <ArchReveal level={range(f, 0, 50, 0, 1, E.inOut)} color={C.golden} />
      <ArchCover level={range(f, MOBILE_LEN - 50, MOBILE_LEN, 0, 1, E.inOut)} color={C.night} />
    </AbsoluteFill>
  );
};
