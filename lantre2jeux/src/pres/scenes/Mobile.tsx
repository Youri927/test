import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CameraRig} from '../../lib/camera';
import {Caption, Wall} from '../Bits';
import {M} from '../clips';
import {PhoneAt, whipIn, whipOut} from '../Stage';
import {BEAT, C, E, range} from '../util';

export const MOBILE_LEN = 8 * BEAT;

const PHONES = [
  {x: 840, w: 318, z: -40, clip: {meta: M.mHero, from: 0}, glow: C.tungsten, phase: 0, at: 6},
  {x: 1205, w: 352, z: 70, clip: {meta: M.mAlerte, from: 30}, glow: C.alarm, phase: 40, at: 12},
  {x: 1570, w: 318, z: -40, clip: {meta: M.mPricing, from: 0}, glow: C.tungsten, phase: 80, at: 18},
];

/** Sur mobile : trois écrans, trois gestes */
export const Mobile: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Wall gx={66} gy={52} strength={0.08} />
      <CameraRig
        blur={1.1}
        keys={[
          ...whipIn({f: 0, x: 1000, y: 540, s: 1.0, ry: 9, rz: 0}, 24),
          {f: MOBILE_LEN - 16, x: 1040, y: 532, s: 1.05, ry: -7, rz: 0, ease: E.sine},
          ...whipOut({f: 0, x: 1040, y: 532, s: 1.05, ry: -7}, MOBILE_LEN, 16),
        ]}
      >
        {PHONES.map((p, i) => {
          const rise = range(f, p.at, p.at + 30, 1, 0, E.out);
          return (
            <PhoneAt
              key={i}
              x={p.x}
              y={548 + Math.sin((f + p.phase) / 46) * 9 + rise * 160}
              w={p.w}
              z={p.z}
              clip={p.clip}
              glow={p.glow}
              transform={`rotateY(${(i - 1) * -6}deg)`}
            />
          );
        })}
        <div style={{position: 'absolute', left: 96, top: 350}}>
          <Caption kicker="Sur mobile" title="Au bout du doigt" text="La torche erre seule sur l’écran, les portes s’ouvrent au fil du doigt et le cadenas se règle d’une pression." at={20} width={470} />
        </div>
      </CameraRig>
    </AbsoluteFill>
  );
};
