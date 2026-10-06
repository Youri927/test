import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {LowerThird, Wall, WipeCover, WipeReveal} from '../Bits';
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

/* ——— Le chargement : les visages arrivent « avant », puis basculent en vague ——— */
export const HERO_LEN = 10 * BEAT;
export const AfterHero: React.FC = () => {
  const last = {...WIDE, s: 1.02, f: 0};
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          {f: 0, ...WIDE, s: 0.9},
          {f: 60, ...WIDE, s: 0.97, ease: E.out},
          onSite(B, 990, 460, {f: 150, s: 1.3, ease: E.soft}),
          onSite(B, 960, 470, {f: 260, s: 1.34, ease: E.sine}),
          {f: 330, ...WIDE, s: 1.0, ease: E.soft},
          ...end(HERO_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dHero, from: 0, rate: 1}} />
      </CameraRig>
      <LowerThird tag="First impression" title="Real patients, first." text="Twelve smiles from their own gallery greet every visitor: before, then after, in one wave." at={232} out={HERO_LEN - 24} right />
    </AbsoluteFill>
  );
};

/* ——— Le mur : l'interrupteur, puis un cas ouvert ——— */
export const WALL_LEN = 11 * BEAT;
export const AfterWall: React.FC = () => {
  const last = {...WIDE, s: 1.04, f: 0};
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          onSite(B, 1060, 520, {f: 80, s: 1.22, ease: E.soft}),
          onSite(B, 1040, 500, {f: 190, s: 1.24, ease: E.sine}),
          {f: 270, ...WIDE, s: 1.0, ease: E.soft},
          onSite(B, 720, 380, {f: 380, s: 1.12, ease: E.soft}),
          ...end(WALL_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dWall, from: 30, rate: 1}} />
      </CameraRig>
      <LowerThird tag="Before & after" title="One tap shows the change." text="Hover a smile, flip the whole wall, or open any of the 18 cases up close." at={26} out={250} />
    </AbsoluteFill>
  );
};

/* ——— Le cas de Donald : le balayage ——— */
export const STORY_LEN = 10 * BEAT;
export const AfterStory: React.FC = () => {
  const last = onSite(B, 720, 450, {f: 0, s: 1.02});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          onSite(B, 500, 460, {f: 90, s: 1.28, ease: E.soft}),
          onSite(B, 520, 470, {f: 300, s: 1.32, ease: E.sine}),
          {...last, f: 390, ease: E.soft},
          ...end(STORY_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dStory, from: 20, rate: 1.15}} />
      </CameraRig>
      <LowerThird tag="Feature case" title="The new smile, revealed." text="The page holds still while a wipe uncovers Donald’s result, next to his own review." at={40} out={STORY_LEN - 30} right dark />
    </AbsoluteFill>
  );
};

/* ——— Le bandeau des soins, puis la Dr. Cameron ——— */
export const DOCTOR_LEN = 8 * BEAT;
export const AfterDoctor: React.FC = () => {
  const last = onSite(B, 900, 470, {f: 0, s: 1.1});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          onSite(B, 720, 330, {f: 70, s: 1.12, ease: E.soft}),
          onSite(B, 820, 440, {f: 220, s: 1.14, ease: E.soft}),
          ...end(DOCTOR_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dDoctor, from: 20, rate: 1.25}} />
      </CameraRig>
      <LowerThird tag="The artist" title="Meet Dr. Cameron." text="“Every smile is a work of art”: her story, her credentials, and a patient’s words." at={130} out={DOCTOR_LEN - 26} />
    </AbsoluteFill>
  );
};

/* ——— Les soins, puis le confort ——— */
export const CARE_LEN = 11 * BEAT;
const CARE_CUT = 245;
export const AfterCare: React.FC = () => {
  const last = onSite(B, 720, 520, {f: 0, s: 1.06});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          onSite(B, 560, 420, {f: 90, s: 1.18, ease: E.soft}),
          onSite(B, 620, 470, {f: 200, s: 1.2, ease: E.sine}),
          {f: 290, ...WIDE, s: 1.02, ease: E.soft},
          onSite(B, 720, 560, {f: 420, s: 1.14, ease: E.soft}),
          ...end(CARE_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dCare, from: 20, rate: 1.4}} />
      </CameraRig>
      <LowerThird tag="Treatments" title="Eight treatments, in plain words." text="From a single bonded tooth to implants, each with a link to book." at={30} out={CARE_CUT - 6} right />
      <Sequence from={CARE_CUT} layout="none">
        <LowerThird tag="Comfort" title="Nervous? There’s a plan." text="Gentle care, nitrous oxide or oral sedation, explained from their own pages." at={20} out={CARE_LEN - CARE_CUT - 26} right dark />
      </Sequence>
    </AbsoluteFill>
  );
};

/* ——— L'équipe, puis les avis ——— */
export const TEAM_LEN = 10 * BEAT;
const TEAM_CUT = 250;
export const AfterTeam: React.FC = () => {
  const last = onSite(B, 720, 470, {f: 0, s: 1.04});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          {f: 120, ...WIDE, s: 1.04, ease: E.sine},
          onSite(B, 720, 560, {f: 230, s: 1.12, ease: E.soft}),
          {f: 330, ...WIDE, s: 1.0, ease: E.soft},
          ...end(TEAM_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dTeam, from: 10, rate: 1.3}} />
      </CameraRig>
      <LowerThird tag="The team" title="Five doctors, one studio." text="The team photo widens to the edges; every doctor has a face, a role and a short bio." at={30} out={TEAM_CUT - 6} right />
      <Sequence from={TEAM_CUT} layout="none">
        <LowerThird tag="Reviews" title="Patients say it best." text="Real, signed reviews, and nearly five stars from 150+ Google reviews." at={20} out={TEAM_LEN - TEAM_CUT - 26} right dark />
      </Sequence>
    </AbsoluteFill>
  );
};

/* ——— L'assurance, puis le rendez-vous ——— */
export const BOOK_LEN = 13 * BEAT;
const BOOK_CUT = 220;
export const AfterBook: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          onSite(B, 1030, 420, {f: 70, s: 1.34, ease: E.soft}),
          onSite(B, 1030, 470, {f: 160, s: 1.36, ease: E.sine}),
          {f: BOOK_CUT + 20, ...WIDE, s: 1.04, ease: E.soft},
          onSite(B, 1030, 460, {f: BOOK_CUT + 110, s: 1.3, ease: E.soft}),
          onSite(B, 1030, 520, {f: BOOK_LEN - 70, s: 1.32, ease: E.sine}),
          {f: BOOK_LEN, ...WIDE, s: 1.06, ease: E.soft},
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dBook, from: 20, rate: 1.5}} />
      </CameraRig>
      <LowerThird tag="Insurance" title="“Do you take my insurance?”" text="Type the plan, and their list of 25 PPO and 6 discount plans answers on the spot." at={30} out={BOOK_CUT - 4} />
      <Sequence from={BOOK_CUT} layout="none">
        <LowerThird tag="Booking" title="From visit to appointment." text="“Open now”, live in Naples time. One tap to call, or a form that takes a minute." at={60} out={BOOK_LEN - BOOK_CUT - 60} />
      </Sequence>
      <WipeCover level={range(f, BOOK_LEN - 50, BOOK_LEN, 0, 1, E.inOut)} color={C.sky} />
    </AbsoluteFill>
  );
};

/* ——— Sur téléphone ——— */
export const MOBILE_LEN = 8 * BEAT;
const PHONES = [
  {x: 545, w: 390, z: -30, clip: {meta: M.mHero, from: 10, rate: 1.1}, at: 4},
  {x: 960, w: 430, z: 60, clip: {meta: M.mStory, from: 0, rate: 1}, at: 10},
  {x: 1375, w: 390, z: -30, clip: {meta: M.mMenu, from: 0, rate: 1}, at: 16},
];
export const AfterMobile: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Wall tint={C.sky} />
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
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', ...DISPLAY, fontSize: 60, color: C.ink, opacity: range(f, 20, 50)}}>
        Made for the phone in their hand.
      </div>
      <WipeReveal level={range(f, 0, 50, 0, 1, E.inOut)} color={C.sky} />
      <WipeCover level={range(f, MOBILE_LEN - 50, MOBILE_LEN, 0, 1, E.inOut)} color={C.ink} />
    </AbsoluteFill>
  );
};
