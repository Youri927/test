import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {LowerThird, Signal, Static, Wall} from '../Bits';
import {M} from '../clips';
import {CameraRig} from '../lib/camera';
import {BrowserAt, Box, PhoneAt, onSite} from '../Stage';
import {BEAT, C, E, F, range} from '../util';

const B: Box = {x: 960, y: 530, w: 1500};

/* ——— Après : l'accueil, la régie ——— */
export const HERO_LEN = 13 * BEAT;
export const AfterHero: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.5}
        keys={[
          {f: 0, x: 960, y: 540, s: 1.0},
          {f: 190, x: 960, y: 540, s: 1.0, ease: E.sine},
          onSite(B, 1040, 250, {f: 268, s: 2.0, ease: E.soft}),
          onSite(B, 1050, 255, {f: 330, s: 2.02, ease: E.sine}),
          onSite(B, 560, 600, {f: 420, s: 1.45, ease: E.soft}),
          onSite(B, 580, 610, {f: HERO_LEN, s: 1.43, ease: E.sine}),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dHero, from: 0}} />
      </CameraRig>
      <LowerThird tag="Après" title="La régie" text="Le site s’ouvre comme une émission en direct : le labyrinthe filmé par quatre caméras, et l’heure de jeu qui décompte." at={110} out={240} right />
      <Signal level={range(f, 0, 26, 1, 0, E.out)} />
    </AbsoluteFill>
  );
};

/* ——— 01 : le pitch, puis la fiche ——— */
export const PITCH_LEN = 12 * BEAT;
export const AfterPitch: React.FC = () => (
  <AbsoluteFill>
    <Wall />
    <CameraRig
      blur={0.5}
      keys={[
        {f: 0, x: 960, y: 540, s: 1.0},
        {f: 90, x: 960, y: 540, s: 1.0, ease: E.sine},
        onSite(B, 680, 430, {f: 200, s: 1.25, ease: E.soft}),
        onSite(B, 680, 280, {f: 300, s: 1.28, ease: E.sine}),
        onSite(B, 720, 450, {f: 440, s: 1.15, ease: E.soft}),
        onSite(B, 720, 455, {f: PITCH_LEN, s: 1.15, ease: E.sine}),
      ]}
    >
      <BrowserAt b={B} clip={{meta: M.dPitch, from: 30}} />
    </CameraRig>
    <LowerThird tag="01" title="Le pitch, puis la fiche" text="Les mots s’allument au fil du défilement. Les infos du jeu se lisent comme un générique de fin." at={24} out={200} />
    <Static len={12} />
  </AbsoluteFill>
);

/* ——— 02 : six genres, la grille des programmes ——— */
export const GRID_LEN = 13 * BEAT;
export const AfterGrid: React.FC = () => (
  <AbsoluteFill>
    <Wall />
    <CameraRig
      blur={0.5}
      keys={[
        {f: 0, x: 960, y: 540, s: 1.0},
        {f: 150, x: 960, y: 540, s: 1.0, ease: E.sine},
        onSite(B, 590, 560, {f: 250, s: 1.6, ease: E.soft}),
        onSite(B, 850, 560, {f: 500, s: 1.6, ease: E.sine}),
        onSite(B, 860, 560, {f: GRID_LEN, s: 1.58, ease: E.sine}),
      ]}
    >
      <BrowserAt b={B} clip={{meta: M.dGrid, from: 20}} />
    </CameraRig>
    <LowerThird tag="02" title="Six genres, une seule heure" text="Une page de magazine télé : six chaînes diffusées en même temps. Le programme à l’antenne passe en noir." at={30} out={210} right />
    <Static len={12} />
  </AbsoluteFill>
);

/* ——— 03 : le Minotaure, en caméra thermique ——— */
export const BEAST_LEN = 14 * BEAT;
export const AfterBeast: React.FC = () => (
  <AbsoluteFill>
    <Wall />
    <CameraRig
      blur={0.5}
      keys={[
        {f: 0, x: 960, y: 540, s: 1.0},
        {f: 120, x: 960, y: 540, s: 1.0, ease: E.sine},
        onSite(B, 960, 470, {f: 230, s: 1.35, ease: E.soft}),
        onSite(B, 950, 560, {f: 385, s: 1.38, ease: E.sine}),
        onSite(B, 720, 560, {f: 470, s: 1.08, ease: E.soft}),
        onSite(B, 720, 560, {f: BEAST_LEN, s: 1.07, ease: E.sine}),
      ]}
    >
      <BrowserAt b={B} clip={{meta: M.dBeast, from: 0}} glow="#9B3BFF" />
    </CameraRig>
    <LowerThird tag="03" title="Le Minotaure, en caméra thermique" text="Sa chaleur suit la souris, ou le doigt sur mobile. Quand il vous rattrape, l’image tremble." at={24} out={170} />
    <Static len={12} />
  </AbsoluteFill>
);

/* ——— 04 : votre film ——— */
export const FILM_LEN = 11 * BEAT;
export const AfterFilm: React.FC = () => (
  <AbsoluteFill>
    <Wall />
    <CameraRig
      blur={0.5}
      keys={[
        {f: 0, x: 960, y: 540, s: 1.0},
        {f: 130, x: 960, y: 540, s: 1.0, ease: E.sine},
        onSite(B, 560, 470, {f: 230, s: 1.28, ease: E.soft}),
        onSite(B, 580, 480, {f: 330, s: 1.3, ease: E.sine}),
        onSite(B, 1050, 460, {f: 410, s: 1.22, ease: E.soft}),
        onSite(B, 1060, 460, {f: FILM_LEN, s: 1.22, ease: E.sine}),
      ]}
    >
      <BrowserAt b={B} clip={{meta: M.dFilm, from: 40}} />
    </CameraRig>
    <LowerThird tag="04" title="Votre film" text="Les deux vidéos souvenirs dans de vrais lecteurs : 2 minutes en 16:9, 30 secondes en vertical." at={24} out={190} right />
    <Static len={12} />
  </AbsoluteFill>
);

/* ——— 05 : l'audience, puis la réservation ——— */
export const AUDIENCE_LEN = 12 * BEAT;
export const AfterAudience: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.5}
        keys={[
          {f: 0, x: 960, y: 540, s: 1.0},
          onSite(B, 620, 600, {f: 120, s: 1.5, ease: E.soft}),
          onSite(B, 640, 610, {f: 230, s: 1.5, ease: E.sine}),
          onSite(B, 900, 380, {f: 320, s: 1.3, ease: E.soft}),
          onSite(B, 900, 390, {f: 380, s: 1.3, ease: E.sine}),
          onSite(B, 720, 520, {f: AUDIENCE_LEN, s: 1.12, ease: E.soft}),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dAudience, from: 40, rate: 1.15}} />
      </CameraRig>
      <LowerThird tag="05" title="L’audience, puis la réservation" text="Les vraies notes en applaudimètres, la FAQ, puis un seul bouton pour réserver." at={24} out={150} right />
      <Static len={12} />
      <Signal level={range(f, AUDIENCE_LEN - 28, AUDIENCE_LEN, 0, 1, E.in)} />
    </AbsoluteFill>
  );
};

/* ——— Sur mobile ——— */
export const MOBILE_LEN = 11 * BEAT;
const PHONES = [
  {x: 545, w: 390, z: -30, clip: {meta: M.mHero, from: 0}, at: 4},
  {x: 960, w: 430, z: 60, clip: {meta: M.mGrid, from: 0}, at: 10},
  {x: 1375, w: 390, z: -30, clip: {meta: M.mBeast, from: 0}, at: 16},
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
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', fontFamily: F.show, fontWeight: 900, fontStretch: '60%', fontSize: 58, textTransform: 'uppercase', color: C.bone, opacity: range(f, 20, 50)}}>
        Pensé aussi pour le mobile.
      </div>
      <Signal level={Math.max(range(f, 0, 26, 1, 0, E.out), range(f, MOBILE_LEN - 28, MOBILE_LEN, 0, 1, E.in))} />
    </AbsoluteFill>
  );
};
