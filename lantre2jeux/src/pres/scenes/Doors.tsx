import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {CameraRig} from '../../lib/camera';
import {Caption, Wall} from '../Bits';
import {M} from '../clips';
import {BrowserAt, Box, onSite, whipIn, whipOut} from '../Stage';
import {BEAT, C, E, F, range} from '../util';

const R66_LEN = 5 * BEAT;
const CO_LEN = 5 * BEAT;
const AL_LEN = 6 * BEAT;
export const DOORS_LEN = R66_LEN + CO_LEN + AL_LEN;

/** Étiquette de salle, en haut à droite de l'écran */
const Tag: React.FC<{name: string; text: string; color: string; at: number}> = ({name, text, color, at}) => {
  const f = useCurrentFrame();
  const p = range(f, at, at + 22, 0, 1, E.out);
  return (
    <div
      style={{
        position: 'absolute',
        right: 64,
        top: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 26px 15px',
        borderRadius: 999,
        background: 'rgba(7, 16, 26, 0.72)',
        border: `1.5px solid ${color}`,
        boxShadow: `0 0 30px ${color}55`,
        opacity: p,
        transform: `translateY(${(1 - p) * -16}px)`,
      }}
    >
      <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 34, lineHeight: 1, textTransform: 'uppercase', color}}>{name}</span>
      <span style={{fontFamily: F.body, fontSize: 24, lineHeight: 1, color: C.chalk}}>{text}</span>
    </div>
  );
};

const BIG: Box = {x: 960, y: 540, w: 1500};
const LEFT: Box = {x: 1190, y: 540, w: 1240};

/** 03 · Trois portes : chaque salle s'ouvre au scroll, sur sa propre lumière */
export const Doors: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={R66_LEN}>
      <Wall glow={C.neon} gx={62} gy={50} strength={0.06} />
      <CameraRig
        blur={1.1}
        keys={[
          ...whipIn(onSite(LEFT, 720, 450, {f: 0, s: 1.75, rz: 0}), 20),
          onSite(LEFT, 720, 440, {f: 34, s: 1.62, ease: E.sine}),
          // la porte s'ouvre : recul
          {f: 100, x: 960, y: 540, s: 1.0, rz: 0, ease: E.inOut},
          {f: R66_LEN - 14, x: 975, y: 532, s: 1.06, rz: 0.3, ease: E.sine},
          ...whipOut({f: 0, x: 978, y: 532, s: 1.065, rz: 0.3}, R66_LEN, 14),
        ]}
      >
        <BrowserAt b={LEFT} clip={{meta: M.dR66, from: 66}} glow={C.neon} />
        <div style={{position: 'absolute', left: 96, top: 360}}>
          <Caption num="03" title="Trois portes" text="Chaque salle s’ouvre comme une porte, avec sa propre lumière : néon, or, alarme." at={56} width={430} />
        </div>
      </CameraRig>
      <Tag name="Route 66" text="le néon s’allume lettre à lettre" color={C.neon} at={96} />
    </Sequence>

    <Sequence from={R66_LEN} durationInFrames={CO_LEN}>
      <Wall glow={C.gold} strength={0.07} />
      <CameraRig
        blur={1.1}
        keys={[
          ...whipIn(onSite(BIG, 720, 450, {f: 0, s: 1.5, rz: 0, ry: 0}), 20),
          {f: 96, x: 960, y: 540, s: 0.94, ry: -7, rz: 0, ease: E.inOut},
          // le diamant, dessiné en 3D
          onSite(BIG, 1110, 340, {f: CO_LEN - 14, s: 1.6, ry: 3, ease: E.sine}),
          ...whipOut(onSite(BIG, 1120, 340, {f: 0, s: 1.62, ry: 3}), CO_LEN, 14),
        ]}
      >
        <BrowserAt b={BIG} clip={{meta: M.dCorleone, from: 66}} glow={C.gold} />
      </CameraRig>
      <Tag name="La Planque des Corleone" text="un diamant taillé en 3D" color={C.gold} at={70} />
    </Sequence>

    <Sequence from={R66_LEN + CO_LEN} durationInFrames={AL_LEN}>
      <Wall glow={C.alarm} strength={0.08} />
      <CameraRig
        blur={1.1}
        keys={[
          ...whipIn(onSite(BIG, 720, 450, {f: 0, s: 1.55, rz: 2}), 20),
          onSite(BIG, 720, 450, {f: 60, s: 1.45, rz: 1.5, ease: E.sine}),
          {f: 120, x: 960, y: 540, s: 0.96, rz: 0, ease: E.inOut},
          // le compte à rebours
          onSite(BIG, 300, 280, {f: AL_LEN - 14, s: 1.8, rz: -1, ease: E.sine}),
          ...whipOut(onSite(BIG, 310, 280, {f: 0, s: 1.82, rz: -1}), AL_LEN, 14),
        ]}
      >
        <BrowserAt b={BIG} clip={{meta: M.dAlerte, from: 40}} glow={C.alarm} />
      </CameraRig>
      <Tag name="Alerte Rouge" text="radar, gyrophare et compte à rebours" color={C.alarm} at={108} />
    </Sequence>
  </AbsoluteFill>
);
