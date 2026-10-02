import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CameraRig} from '../../lib/camera';
import {Caption, Wall} from '../Bits';
import {whipIn, whipOut} from '../Stage';
import {BEAT, C, E, F, pop, range} from '../util';

export const IDENTITY_LEN = 6 * BEAT;

const SWATCHES = [
  {name: 'Bleu encre', hex: '#07101A', use: 'l’obscurité', c: C.ink},
  {name: 'Tungstène', hex: '#FFC66E', use: 'la lumière', c: C.tungsten},
  {name: 'Néon', hex: '#3DF0D8', use: 'Route 66', c: C.neon},
  {name: 'Cerise', hex: '#FF4B6E', use: 'Route 66', c: C.cherry},
  {name: 'Or', hex: '#E2AE52', use: 'Corleone', c: C.gold},
  {name: 'Alarme', hex: '#FF3B2F', use: 'Alerte Rouge', c: C.alarm},
];
const X0 = 668;
const TILE = 176;
const GAP = 22;

/** L'identité : couleurs de lumière et typographies */
export const Identity: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Wall gx={70} gy={45} strength={0.07} />
      <CameraRig
        blur={1.1}
        keys={[
          ...whipIn({f: 0, x: 960, y: 540, s: 1.0, rz: 0}, 22),
          {f: IDENTITY_LEN - 16, x: 985, y: 536, s: 1.045, rz: 0.3, ease: E.sine},
          ...whipOut({f: 0, x: 985, y: 536, s: 1.045, rz: 0.3}, IDENTITY_LEN, 16),
        ]}
      >
        <div style={{position: 'absolute', left: 96, top: 330}}>
          <Caption title="L’identité" text="Bleu encre plutôt que noir, la lumière tungstène pour seule couleur de marque, et une couleur de lumière par salle." at={2} width={470} />
        </div>
        {SWATCHES.map((s, i) => {
          const p = pop(f, 2 + i * 4, 180, 17);
          const lightOn = range(f, 10 + i * 4, 26 + i * 4, 0, 1);
          return (
            <div key={s.name} style={{position: 'absolute', left: X0 + i * (TILE + GAP), top: 196, width: TILE, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 60}px)`}}>
              <div
                style={{
                  height: 184,
                  borderRadius: 18,
                  background: s.c,
                  border: i === 0 ? '1.5px solid rgba(242,234,223,.22)' : 'none',
                  boxShadow: i === 0 ? 'inset 0 0 40px rgba(0,0,0,.5)' : `0 0 ${60 * lightOn}px ${s.c}88, 0 0 ${16 * lightOn}px ${s.c}`,
                }}
              />
              <div style={{marginTop: 18, fontFamily: F.display, fontWeight: 800, fontSize: 34, lineHeight: 1, textTransform: 'uppercase', color: C.chalk}}>{s.name}</div>
              <div style={{marginTop: 8, fontFamily: F.body, fontSize: 19, color: C.mist}}>{s.use}</div>
              <div style={{marginTop: 4, fontFamily: F.body, fontSize: 17, color: C.shade, letterSpacing: '0.04em'}}>{s.hex}</div>
            </div>
          );
        })}
        {[
          {x: X0, font: F.display, weight: 800, name: 'Big Shoulders', use: 'Titres d’affiche, dessinée pour Chicago', at: 26, upper: true},
          {x: X0 + 3 * (TILE + GAP), font: F.body, weight: 500, name: 'Epilogue', use: 'Textes, une linéale contemporaine', at: 36, upper: false},
        ].map((t) => {
          const p = range(f, t.at, t.at + 30, 0, 1, E.out);
          return (
            <div key={t.name} style={{position: 'absolute', left: t.x, top: 560, width: 3 * TILE + 2 * GAP, opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
              <div style={{height: 1.5, background: 'rgba(242,234,223,.18)', marginBottom: 26}} />
              <div style={{display: 'flex', alignItems: 'flex-end', gap: 26}}>
                <span style={{fontFamily: t.font, fontWeight: t.weight, fontSize: 210, lineHeight: 0.8, color: C.chalk}}>Aa</span>
                {t.upper ? (
                  <span style={{fontFamily: F.stencil, fontWeight: 900, fontSize: 210, lineHeight: 0.8, color: C.tungsten}}>2</span>
                ) : null}
              </div>
              <div style={{marginTop: 30, fontFamily: F.display, fontWeight: 800, fontSize: 40, lineHeight: 1, textTransform: 'uppercase', color: C.chalk}}>{t.name}</div>
              <div style={{marginTop: 10, fontFamily: F.body, fontSize: 22, color: C.mist}}>{t.use}</div>
            </div>
          );
        })}
      </CameraRig>
    </AbsoluteFill>
  );
};
