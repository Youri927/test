import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Backdrop, Embers} from '../components/Atmosphere';
import {Baseline, Logo} from '../components/Logo';
import {FadeUp} from '../components/Type';
import {pop, prog} from '../lib/anim';
import {CameraRig, Place} from '../lib/camera';
import {ease} from '../lib/ease';
import {theme} from '../theme';

export const BRAND_LEN = 56;

/** 1,9–3,7 s : révélation de la marque, puis whip vers la droite. */
export const Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = 1 - prog(frame, 0, 10, ease.out);
  const logoIn = pop(frame, 0, 140, 16);
  return (
    <AbsoluteFill>
      <Backdrop glow={0.3} y="46%" />
      <Embers count={30} seed="brand" />
      <CameraRig
        keys={[
          {f: 0, x: 0, y: 40, s: 0.62, rz: 5},
          {f: 22, s: 1.08, rz: 0, ease: ease.out},
          {f: 44, x: 30, s: 1.14, rz: -0.6, ease: ease.sine},
          {f: BRAND_LEN, x: 1500, s: 0.95, ry: -12, ease: ease.in},
        ]}
      >
        <Place x={0} y={-60} w={900} h={430} style={{transform: `scale(${0.85 + 0.15 * logoIn})`}}>
          <Logo width={900} sweep={prog(frame, 8, 26, ease.inOut)} />
        </Place>
        <Place x={0} y={236} w={1000} h={60} style={{display: 'flex', justifyContent: 'center'}}>
          <FadeUp at={10}>
            <Baseline size={34} />
          </FadeUp>
        </Place>
      </CameraRig>
      <AbsoluteFill style={{background: `radial-gradient(circle, #FFF3DA 0%, ${theme.colors.accent} 70%)`, opacity: flash}} />
    </AbsoluteFill>
  );
};
