import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {LowerThird, Wall, WaterWipe} from '../Bits';
import {M} from '../clips';
import {CameraRig} from '../lib/camera';
import {BrowserAt, Box, PhoneAt, onSite} from '../Stage';
import {BEAT, C, E, F, range} from '../util';

const B: Box = {x: 960, y: 530, w: 1500};
const fadeIn = (f: number) => range(f, 0, 26, 0, 1, E.inOut);

/* ——— Après · la ligne d'eau ——— */
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
          {f: 160, x: 960, y: 540, s: 1.0, ease: E.sine},
          onSite(B, 560, 580, {f: 300, s: 1.6, ease: E.soft}),
          onSite(B, 620, 575, {f: HERO_LEN, s: 1.7, ease: E.sine}),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dHero, from: 10}} />
      </CameraRig>
      <LowerThird tag="Après" title="La ligne d’eau" text="Le titre est à moitié immergé : la pierre au-dessus, l’eau en dessous. La souris fait naître de petites ondes." at={150} out={HERO_LEN - 10} right />
      <WaterWipe level={range(f, 0, 50, 1, 0, E.inOut)} />
    </AbsoluteFill>
  );
};

/* ——— 02 · Paris, en coupe ——— */
export const COUPE_LEN = 21 * BEAT;
export const AfterCoupe: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fadeIn(f)}}>
      <Wall />
      <CameraRig
        blur={0.5}
        keys={[
          {f: 0, x: 960, y: 540, s: 0.98},
          onSite(B, 720, 480, {f: 250, s: 1.1, ease: E.soft}),
          onSite(B, 950, 480, {f: 400, s: 1.7, ease: E.soft}),
          onSite(B, 1000, 455, {f: 570, s: 1.75, ease: E.sine}),
          onSite(B, 700, 450, {f: 710, s: 1.12, ease: E.soft}),
          onSite(B, 700, 450, {f: 790, s: 1.14, ease: E.sine}),
          onSite(B, 1000, 400, {f: 900, s: 1.55, ease: E.soft}),
          onSite(B, 980, 410, {f: COUPE_LEN, s: 1.5, ease: E.sine}),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dCoupe, from: 60}} />
      </CameraRig>
      <LowerThird tag="02" title="Paris, en coupe" text="Au scroll, la caméra descend du toit à la cave et s’arrête sur chaque bassin caché, avec ce que le lieu exige." at={24} out={300} />
    </AbsoluteFill>
  );
};

/* ——— 03 · Le bord de l'eau ——— */
export const BASSINS_LEN = 13 * BEAT;
export const AfterBassins: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fadeIn(f)}}>
      <Wall />
      <CameraRig
        blur={0.5}
        keys={[
          {f: 0, x: 960, y: 540, s: 1.0},
          onSite(B, 540, 600, {f: 130, s: 1.75, ease: E.soft}),
          onSite(B, 920, 600, {f: 236, s: 1.75, ease: E.sine}),
          onSite(B, 900, 470, {f: 330, s: 1.15, ease: E.soft}),
          onSite(B, 760, 470, {f: 440, s: 1.36, ease: E.soft}),
          onSite(B, 770, 475, {f: BASSINS_LEN, s: 1.42, ease: E.sine}),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dBassins, from: 40}} />
      </CameraRig>
      <LowerThird tag="03" title="Le bord de l’eau" text="Débordement, goulotte ou reprise classique, en coupes animées. Le fond mobile monte jusqu’à refermer le bassin." at={24} out={200} />
    </AbsoluteFill>
  );
};

/* ——— 04 · Les références ——— */
export const REFS_LEN = 8 * BEAT;
export const AfterRefs: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fadeIn(f)}}>
      <Wall />
      <CameraRig
        blur={0.5}
        keys={[
          {f: 0, x: 960, y: 540, s: 1.0},
          onSite(B, 600, 560, {f: 200, s: 1.45, ease: E.soft}),
          onSite(B, 640, 545, {f: REFS_LEN, s: 1.5, ease: E.sine}),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dRefs, from: 20}} />
      </CameraRig>
      <LowerThird tag="04" title="Les références" text="Les palaces et les grands hôtels, enfin mis en avant." at={24} out={230} right />
    </AbsoluteFill>
  );
};

/* ——— 05 · Le métier ——— */
export const METIER_LEN = 15 * BEAT;
export const AfterMetier: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fadeIn(f)}}>
      <Wall />
      <CameraRig
        blur={0.5}
        keys={[
          {f: 0, x: 960, y: 540, s: 1.0},
          {f: METIER_LEN, x: 975, y: 540, s: 1.07, ease: E.sine},
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dMetier, from: 20, rate: 1.2}} />
      </CameraRig>
      <LowerThird tag="05" title="Le métier" text="Spas et hammams, le bureau d’étude en quatre étapes, et 1966 : l’histoire enfin racontée." at={24} out={260} />
    </AbsoluteFill>
  );
};

/* ——— 06 · Votre projet ——— */
export const CONTACT_LEN = 9 * BEAT;
export const AfterContact: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fadeIn(f)}}>
      <Wall />
      <CameraRig
        blur={0.5}
        keys={[
          {f: 0, x: 960, y: 540, s: 1.0},
          onSite(B, 1040, 400, {f: 110, s: 1.6, ease: E.soft}),
          onSite(B, 1045, 430, {f: 200, s: 1.62, ease: E.sine}),
          onSite(B, 1060, 700, {f: 330, s: 1.75, ease: E.soft}),
          onSite(B, 1050, 705, {f: CONTACT_LEN, s: 1.78, ease: E.sine}),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dContact, from: 50}} />
      </CameraRig>
      <LowerThird tag="06" title="Votre projet" text="Trois questions, et un e-mail prêt à envoyer à Idoine." at={24} out={220} />
    </AbsoluteFill>
  );
};

/* ——— Sur mobile ——— */
export const MOBILE_LEN = 9 * BEAT;
const PHONES = [
  {x: 545, w: 390, z: -30, clip: {meta: M.mHero, from: 0}, at: 4},
  {x: 960, w: 430, z: 60, clip: {meta: M.mCoupe, from: 0, rate: 1.4}, at: 10},
  {x: 1375, w: 390, z: -30, clip: {meta: M.mContact, from: 30}, at: 16},
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
      <div style={{position: 'absolute', left: 0, right: 0, top: 46, textAlign: 'center', fontFamily: F.display, fontWeight: 300, fontStretch: '122%', fontSize: 44, color: C.encre, opacity: range(f, 20, 50)}}>
        Sur mobile, la même eau.
      </div>
      <WaterWipe level={range(f, MOBILE_LEN - 50, MOBILE_LEN, 0, 1, E.in)} />
    </AbsoluteFill>
  );
};
