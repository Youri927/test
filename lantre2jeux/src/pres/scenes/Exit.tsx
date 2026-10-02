import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {CameraRig} from '../../lib/camera';
import {Wall, Wordmark} from '../Bits';
import {M} from '../clips';
import {BrowserAt, Box, onSite, whipIn} from '../Stage';
import {BEAT, C, E, F, range} from '../util';

export const EXIT_LEN = 10 * BEAT;
const B: Box = {x: 960, y: 540, w: 1400};
/** l'éclair de lumière qui mène au carton final */
export const FLASH = 5 * BEAT;

const PILLS = ['Du mobile au grand écran', 'Accessible au clavier', 'Un seul fichier, hors ligne'];

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const up = (at: number) => {
    const p = range(f, at, at + 30, 0, 1, E.out);
    return {opacity: p, transform: `translateY(${(1 - p) * 40}px)`};
  };
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 120% at 30% 40%, #FFE2AE 0%, ${C.tungsten} 45%, #F2A949 100%)`}}>
      <CameraRig keys={[{f: 0, x: 960, y: 540, s: 1.0}, {f: EXIT_LEN - FLASH, x: 960, y: 540, s: 1.035, ease: E.sine}]} blur={0}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}}>
        <div style={{position: 'absolute', left: 150, top: 262}}>
          <div style={up(12)}>
            <Wordmark size={50} color={C.ink} two="rgba(7, 16, 26, 0.55)" />
          </div>
          <div style={{marginTop: 46, fontFamily: F.display, fontWeight: 800, fontSize: 286, lineHeight: 0.82, textTransform: 'uppercase', color: C.ink, ...up(20)}}>
            Le nouveau
            <br />
            site.
          </div>
          <div style={{marginTop: 44, fontFamily: F.body, fontWeight: 500, fontSize: 36, color: C.ink, ...up(34)}}>
            Escape game à Soissons · concept de refonte, octobre 2026
          </div>
          <div style={{display: 'flex', gap: 16, marginTop: 40}}>
            {PILLS.map((p, i) => (
              <span key={p} style={{padding: '14px 24px 13px', borderRadius: 999, border: `2px solid ${C.ink}`, fontFamily: F.body, fontWeight: 600, fontSize: 25, color: C.ink, ...up(48 + i * 7)}}>
                {p}
              </span>
            ))}
          </div>
        </div>
        </div>
      </CameraRig>
    </AbsoluteFill>
  );
};

/** 06 · La sortie : la dernière porte s'ouvre sur la lumière, puis le carton final */
export const Exit: React.FC = () => {
  const f = useCurrentFrame();
  const flash = range(f, FLASH - 22, FLASH, 0, 1, E.in);
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={FLASH + 2}>
        <Wall gx={50} gy={50} strength={0.08} />
        <CameraRig
          blur={1.1}
          keys={[
            ...whipIn({f: 0, x: 960, y: 540, s: 1.0, rz: 0}, 22),
            {f: 56, x: 960, y: 540, s: 1.0, ease: E.sine},
            // « La porte est ouverte. »
            onSite(B, 430, 330, {f: 132, s: 1.32, rz: -0.5, ease: E.inOut}),
            // on traverse la lumière
            onSite(B, 560, 300, {f: FLASH, s: 4.4, rz: 1, ease: E.in}),
          ]}
        >
          <BrowserAt b={B} clip={{meta: M.dExit, from: 18}} />
        </CameraRig>
      </Sequence>
      <AbsoluteFill style={{background: '#FFE7BC', opacity: flash * range(f, FLASH, FLASH + 26, 1, 0)}} />
      <Sequence from={FLASH}>
        <EndCard />
        <AbsoluteFill style={{background: '#FFF1D6', opacity: range(f - FLASH, 0, 26, 1, 0, E.out)}} />
      </Sequence>
    </AbsoluteFill>
  );
};
