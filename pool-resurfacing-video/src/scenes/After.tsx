import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {LowerThird, Sheet, Wall} from '../Bits';
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

/* ——— L'accueil : la passe de lisseuse, puis on compare ——— */
export const HERO_LEN = 13 * BEAT;
export const AfterHero: React.FC = () => {
  const f = useCurrentFrame();
  const last = onSite(B, 820, 470, {f: 0, s: 1.1});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          {f: 0, ...WIDE, s: 0.94},
          {f: 120, ...WIDE, s: 1.0, ease: E.sine},
          onSite(B, 1060, 470, {f: 230, s: 1.34, ease: E.soft}),
          onSite(B, 1060, 490, {f: 500, s: 1.37, ease: E.sine}),
          ...end(HERO_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dHero, from: 0}} />
      </CameraRig>
      <LowerThird tag="The new site" title="Love your pool again." text="The same pool, before and after. A trowel pass wipes away the old surface, then you drag to compare." at={40} out={215} />
      <Sheet level={range(f, 0, 50, 1, 0, E.inOut)} />
    </AbsoluteFill>
  );
};

/* ——— 01 : les signes ——— */
export const SIGNS_LEN = 11 * BEAT;
export const AfterSigns: React.FC = () => {
  const last = onSite(B, 760, 450, {f: 0, s: 1.1});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          {f: 100, ...WIDE, ease: E.sine},
          onSite(B, 420, 470, {f: 165, s: 1.42, ease: E.soft}),
          onSite(B, 420, 500, {f: 300, s: 1.44, ease: E.sine}),
          onSite(B, 1060, 360, {f: 360, s: 1.5, ease: E.soft}),
          onSite(B, 1060, 370, {f: 430, s: 1.52, ease: E.sine}),
          ...end(SIGNS_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dSigns, from: 60, rate: 1.2}} />
      </CameraRig>
      <LowerThird tag="01" title="Is it time?" text="The six signs from their FAQ. Tick one and it lights up in a technical section of the pool." at={24} out={150} right />
    </AbsoluteFill>
  );
};

/* ——— 02 : les finitions ——— */
export const FIN_LEN = 12 * BEAT;
export const AfterFinishes: React.FC = () => {
  const last = onSite(B, 1170, 600, {f: 0, s: 1.45});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          {f: 90, ...WIDE, ease: E.sine},
          onSite(B, 500, 440, {f: 150, s: 1.3, ease: E.soft}),
          onSite(B, 500, 450, {f: 235, s: 1.31, ease: E.sine}),
          onSite(B, 720, 440, {f: 285, s: 1.08, ease: E.soft}),
          onSite(B, 500, 440, {f: 360, s: 1.32, ease: E.soft}),
          onSite(B, 500, 450, {f: 430, s: 1.33, ease: E.sine}),
          {...last, f: 490, ease: E.soft},
          ...end(FIN_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dFinishes, from: 60, rate: 1.2}} />
      </CameraRig>
      <LowerThird tag="02" title="Nine finishes, under water" text="Every finish named on the current site, rendered at real scale. Pick one and it opens across the floor." at={24} out={135} right dark />
    </AbsoluteFill>
  );
};

/* ——— 03 : les services ——— */
export const SERV_LEN = 10 * BEAT;
export const AfterServices: React.FC = () => (
  <AbsoluteFill>
    <Wall />
    <CameraRig
      blur={0.6}
      keys={[
        ...whipIn({...WIDE, s: 1.04}),
        {f: 130, ...WIDE, s: 1.04, ease: E.sine},
        onSite(B, 720, 460, {f: 300, s: 1.12, ease: E.soft}),
        ...end(SERV_LEN, onSite(B, 720, 460, {f: 0, s: 1.1})),
      ]}
    >
      <BrowserAt b={B} clip={{meta: M.dServices, from: 30, rate: 1.25}} />
    </CameraRig>
    <LowerThird tag="03" title="Five trades, stacked" text="Resurfacing, remodeling, plastering, equipment and decks, with the job-site photos, in cards that stack as you scroll." at={30} out={230} />
  </AbsoluteFill>
);

/* ——— 04 : le déroulé ——— */
export const PROC_LEN = 12 * BEAT;
export const AfterProcess: React.FC = () => {
  const last = onSite(B, 760, 460, {f: 0, s: 1.04});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          {f: 80, ...WIDE, ease: E.sine},
          onSite(B, 1000, 450, {f: 150, s: 1.22, ease: E.soft}),
          onSite(B, 960, 460, {f: 430, s: 1.24, ease: E.sine}),
          {...last, f: 500, ease: E.soft},
          ...end(PROC_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dProcess, from: 30, rate: 1.38}} />
      </CameraRig>
      <LowerThird tag="04" title="From drain to first swim" text="Their seven real steps: the water drains, the shell is sandblasted, the new finish goes on, the pool refills." at={30} out={140} />
    </AbsoluteFill>
  );
};

/* ——— 05 : les avis ——— */
export const REV_LEN = 9 * BEAT;
export const AfterReviews: React.FC = () => (
  <AbsoluteFill>
    <Wall />
    <CameraRig
      blur={0.6}
      keys={[
        ...whipIn(),
        onSite(B, 380, 320, {f: 90, s: 1.6, ease: E.soft}),
        onSite(B, 390, 330, {f: 130, s: 1.62, ease: E.sine}),
        onSite(B, 1060, 330, {f: 190, s: 1.45, ease: E.soft}),
        {f: 260, ...WIDE, ease: E.soft},
        {f: REV_LEN, ...WIDE, s: 1.04, ease: E.sine},
      ]}
    >
      <BrowserAt b={B} clip={{meta: M.dReviews, from: 60, rate: 1.15}} />
    </CameraRig>
    <LowerThird tag="05" title="Excellent on Google" text="27 reviews. Ten of them quoted word for word, in columns that scroll by." at={235} out={REV_LEN - 8} right />
  </AbsoluteFill>
);

/* ——— 06 : l'offre et la FAQ ——— */
export const FAQ_LEN = 9 * BEAT;
export const AfterFaq: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: range(f, 0, 24, 0, 1, E.inOut)}}>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          {f: 0, ...WIDE},
          onSite(B, 560, 380, {f: 110, s: 1.22, ease: E.soft}),
          onSite(B, 570, 390, {f: 160, s: 1.23, ease: E.sine}),
          {f: 225, ...WIDE, ease: E.soft},
          onSite(B, 960, 420, {f: 300, s: 1.32, ease: E.soft}),
          onSite(B, 960, 440, {f: FAQ_LEN, s: 1.34, ease: E.sine}),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dFaq, from: 60, rate: 1.3}} />
      </CameraRig>
      <LowerThird tag="06" title="Their offer, then straight answers" text="“We try to beat any licensed competitor’s written estimate.” Then eight questions from their FAQ." at={20} out={105} right dark />
    </AbsoluteFill>
  );
};

/* ——— 07 : le contact ——— */
export const CON_LEN = 13 * BEAT;
export const AfterContact: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: range(f, 0, 24, 0, 1, E.inOut)}}>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          {f: 0, ...WIDE},
          onSite(B, 1110, 420, {f: 85, s: 1.42, ease: E.soft}),
          onSite(B, 1110, 560, {f: 330, s: 1.44, ease: E.sine}),
          onSite(B, 1110, 600, {f: 470, s: 1.4, ease: E.sine}),
          {f: CON_LEN, ...WIDE, s: 1.02, ease: E.soft},
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dContact, from: 60, rate: 1.28}} />
      </CameraRig>
      <LowerThird tag="07" title="A call back from the owner" text="Their promise, kept on the page: four fields, the services, and the 1-2-3 of how it works." at={20} out={190} />
      <Sheet level={range(f, CON_LEN - 52, CON_LEN, 0, 1, E.inOut)} />
    </AbsoluteFill>
  );
};

/* ——— Sur mobile ——— */
export const MOBILE_LEN = 9 * BEAT;
const PHONES = [
  {x: 545, w: 390, z: -30, clip: {meta: M.mHero, from: 150, rate: 1.1}, at: 4},
  {x: 960, w: 430, z: 60, clip: {meta: M.mFinishes, from: 20, rate: 1.1}, at: 10},
  {x: 1375, w: 390, z: -30, clip: {meta: M.mProcess, from: 0, rate: 1.15}, at: 16},
];
export const AfterMobile: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
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
      <div style={{position: 'absolute', left: 0, right: 0, top: 44, textAlign: 'center', ...DISPLAY, fontWeight: 620, fontStretch: '82%', fontSize: 56, color: C.ink, opacity: range(f, 20, 50)}}>
        Designed for the phone, too.
      </div>
      <Sheet level={range(f, 0, 50, 1, 0, E.inOut)} />
      <Sheet level={range(f, MOBILE_LEN - 50, MOBILE_LEN, 0, 1, E.inOut)} />
    </AbsoluteFill>
  );
};
