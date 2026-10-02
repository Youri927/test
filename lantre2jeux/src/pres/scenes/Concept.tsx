import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CameraRig} from '../../lib/camera';
import {BEAT, C, E, F, range} from '../util';

export const CONCEPT_LEN = 5 * BEAT;

export const STEPS = ['Le noir', 'L’affiche', 'Trois portes', 'Le verdict', 'Le cadenas', 'La sortie'];
const X0 = 230;
const GAP = 292;
const LINE_Y = 760;

/** Le concept : une partie d'escape game, de l'enfermement à la sortie */
export const Concept: React.FC = () => {
  const f = useCurrentFrame();
  const dot = range(f, 46, 150, 0, 1, E.inOut);
  const dx = X0 + dot * GAP * (STEPS.length - 1);
  const head = range(f, 0, 22, 0, 1, E.out);
  const sub = range(f, 10, 36, 0, 1, E.out);
  const rowIn = range(f, 30, 52, 0, 1, E.out);
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <AbsoluteFill style={{background: `radial-gradient(50% 60% at ${(dx / 1920) * 100}% 70%, ${C.tungsten}, transparent 70%)`, opacity: 0.07 + 0.05 * dot}} />
      <CameraRig
        blur={1.1}
        keys={[
          {f: 0, x: 960, y: 540, s: 1.3, rz: -1.5},
          {f: 26, x: 960, y: 540, s: 1.0, rz: 0, ease: E.out},
          {f: 150, x: 960, y: 548, s: 1.04, ease: E.sine},
          {f: CONCEPT_LEN, x: X0, y: LINE_Y - 30, s: 2.6, rz: -2, ease: E.in},
        ]}
      >
        <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 214, textAlign: 'center', fontFamily: F.body, fontWeight: 600, fontSize: 24, letterSpacing: '0.24em', textTransform: 'uppercase', color: C.tungsten, opacity: head}}>
            Le concept
          </div>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 268,
              textAlign: 'center',
              fontFamily: F.display,
              fontWeight: 800,
              fontSize: 124,
              lineHeight: 0.9,
              textTransform: 'uppercase',
              color: C.chalk,
              opacity: head,
              transform: `translateY(${(1 - head) * 40}px)`,
            }}
          >
            Une pièce plongée dans le noir.
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 432, textAlign: 'center', fontFamily: F.body, fontSize: 36, color: C.mist, opacity: sub}}>
            Le site raconte une partie d’escape game, de l’enfermement à la sortie.
          </div>

          {/* le parcours */}
          <div style={{position: 'absolute', left: X0, top: LINE_Y - 1, width: GAP * (STEPS.length - 1) * rowIn, height: 2, background: 'rgba(242, 234, 223, 0.16)'}} />
          <div style={{position: 'absolute', left: X0, top: LINE_Y - 1.5, width: Math.max(0, dx - X0), height: 3, background: `linear-gradient(90deg, rgba(255,198,110,.2), ${C.tungsten})`, boxShadow: `0 0 18px ${C.tungsten}`}} />
          {STEPS.map((s, i) => {
            const x = X0 + i * GAP;
            const lit = range(dx, x - 30, x + 10, 0, 1);
            const last = i === STEPS.length - 1;
            const show = range(f, 30 + i * 4, 50 + i * 4, 0, 1, E.out);
            return (
              <div key={s} style={{position: 'absolute', left: x, top: LINE_Y, opacity: show}}>
                <div style={{position: 'absolute', left: -9, top: -9, width: 18, height: 18, borderRadius: '50%', background: lit > 0.5 ? (last ? C.tungsten : C.chalk) : C.ink, border: `2px solid ${lit > 0.5 ? C.tungsten : 'rgba(242,234,223,.35)'}`, boxShadow: lit > 0.5 ? `0 0 ${last ? 40 : 16}px ${C.tungsten}` : 'none'}} />
                <div style={{position: 'absolute', left: -150, width: 300, top: -78, textAlign: 'center', fontFamily: F.stencil, fontWeight: 800, fontSize: 36, color: lit > 0.5 ? C.tungsten : C.shade}}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    left: -150,
                    width: 300,
                    top: 34,
                    textAlign: 'center',
                    fontFamily: F.display,
                    fontWeight: 800,
                    fontSize: 50,
                    lineHeight: 1,
                    textTransform: 'uppercase',
                    color: last && lit > 0.5 ? C.tungsten : C.chalk,
                    opacity: 0.3 + 0.7 * lit,
                    textShadow: last && lit > 0.5 ? `0 0 30px rgba(255,198,110,.6)` : 'none',
                  }}
                >
                  {s}
                </div>
              </div>
            );
          })}
          <div style={{position: 'absolute', left: dx - 14, top: LINE_Y - 14, width: 28, height: 28, borderRadius: '50%', background: '#fff6e4', boxShadow: `0 0 30px 8px ${C.tungsten}, 0 0 90px 20px rgba(255,198,110,.45)`, opacity: range(f, 40, 50) * range(f, 150, 166, 1, 0)}} />
        </div>
      </CameraRig>
    </AbsoluteFill>
  );
};
