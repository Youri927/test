import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop, Embers} from '../components/Atmosphere';
import {Keyhole} from '../components/Keyhole';
import {Slam} from '../components/Type';
import {content} from '../content';
import {prog} from '../lib/anim';
import {CameraRig, Place} from '../lib/camera';
import {ease} from '../lib/ease';
import {theme} from '../theme';

export const HOOK_LEN = 56;

/** 0–1,9 s : accroche + plongée dans la serrure. */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const light = interpolate(frame, [0, 2, 4, 5, 9], [0, 0.7, 0.2, 0.9, 1], {extrapolateRight: 'clamp'});
  const flash = prog(frame, HOOK_LEN - 9, 9, ease.in);
  return (
    <AbsoluteFill>
      <Backdrop glow={0.12 * light} y="50%" />
      <CameraRig
        keys={[
          {f: 0, x: 0, y: 70, s: 0.9, rz: -2.5},
          {f: 40, s: 1.0, rz: 0, ease: ease.sine},
          {f: HOOK_LEN, y: 40, s: 16, ease: ease.in},
        ]}
        blur={0.6}
      >
        <Place x={0} y={0} w={0} h={0}>
          <Keyhole light={light} />
        </Place>
        <Place x={0} y={-470} w={1000} h={170}>
          <Slam at={3} size={168}>
            {content.hook[0]}
          </Slam>
        </Place>
        <Place x={0} y={620} w={1000} h={170}>
          <Slam at={11} size={150}>
            VOUS <span style={{color: theme.colors.accent}}>ÉCHAPPER ?</span>
          </Slam>
        </Place>
      </CameraRig>
      <Embers count={18} opacity={light * 0.8} seed="hook" />
      <AbsoluteFill style={{background: `radial-gradient(circle, #FFF3DA 0%, ${theme.colors.accent} 70%)`, opacity: flash}} />
    </AbsoluteFill>
  );
};
