import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop, Embers} from '../components/Atmosphere';
import {Arrow, Globe, Pin} from '../components/Icons';
import {Logo} from '../components/Logo';
import {FadeUp, Slam} from '../components/Type';
import {content} from '../content';
import {pop, prog} from '../lib/anim';
import {CameraRig, Place} from '../lib/camera';
import {ease} from '../lib/ease';
import {fonts} from '../lib/fonts';
import {theme} from '../theme';

export const CTA_LEN = 78;
const BTN = {w: 800, h: 170, y: 1100};

/** 12,3–15 s : appel à l'action. Le remplissage ambre se rétracte en bouton. */
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const m = prog(frame, 0, 16, ease.whip);
  const w = interpolate(m, [0, 1], [1080 * 1.2, BTN.w]);
  const h = interpolate(m, [0, 1], [1920 * 1.2, BTN.h]);
  const top = interpolate(m, [0, 1], [960, BTN.y]);
  const radius = interpolate(m, [0, 1], [0, BTN.h / 2]);
  const label = prog(frame, 12, 8, ease.out);
  const pulse = frame > 26 ? 1 + 0.035 * Math.max(0, Math.sin((frame - 26) / 4.2)) : 1;
  const shine = ((frame - 24) % 30) / 30;
  const logo = pop(frame, 9, 170, 15);

  return (
    <AbsoluteFill>
      <Backdrop glow={0.3} y="55%" />
      <Embers count={28} seed="cta" />
      <CameraRig
        keys={[
          {f: 0, x: 540, y: 960, s: 1.0},
          {f: CTA_LEN, y: 975, s: 1.035, ease: ease.sine},
        ]}
        blur={0}
      >
        <Place x={540} y={420} w={600} h={260} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: Math.min(1, logo * 1.5), transform: `scale(${0.6 + 0.4 * logo})`}}>
          <Logo width={560} sweep={prog(frame, 20, 24, ease.inOut)} />
        </Place>
        <Place x={540} y={710} w={1000} h={150}>
          <Slam at={12} size={136}>
            {content.cta.title[0]}
          </Slam>
        </Place>
        <Place x={540} y={856} w={1000} h={170}>
          <Slam at={17} size={176} color={theme.colors.accent}>
            {content.cta.title[1]}
          </Slam>
        </Place>
        <Place x={540} y={1300} w={1000} h={80} style={{display: 'flex', justifyContent: 'center'}}>
          <FadeUp at={22}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '18px 34px',
                borderRadius: 999,
                border: `2px solid ${theme.colors.line}`,
                background: 'rgba(255,255,255,0.04)',
                fontFamily: fonts.body,
                fontWeight: 600,
                fontSize: 40,
                color: theme.colors.text,
              }}
            >
              <Globe size={40} color={theme.colors.accent} />
              {content.cta.url}
            </div>
          </FadeUp>
        </Place>
        <Place x={540} y={1392} w={1000} h={60} style={{display: 'flex', justifyContent: 'center'}}>
          <FadeUp at={27}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: fonts.body, fontSize: 34, color: theme.colors.muted}}>
              <Pin size={34} color={theme.colors.muted} />
              {content.cta.address}
            </div>
          </FadeUp>
        </Place>
      </CameraRig>

      {/* remplissage → bouton (écran, pour raccorder avec l'onde de la scène précédente) */}
      <div
        style={{
          position: 'absolute',
          left: 540 - w / 2,
          top: top - h / 2,
          width: w,
          height: h,
          borderRadius: radius,
          overflow: 'hidden',
          background: m < 1 ? theme.colors.accent : `linear-gradient(180deg, #FFC062, ${theme.colors.accent} 55%, ${theme.colors.accentDeep})`,
          boxShadow: `0 24px 80px ${theme.colors.accent}77`,
          transform: `scale(${pulse})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 140,
            left: `${-30 + shine * 160}%`,
            background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent)',
            opacity: frame > 24 ? 1 : 0,
          }}
        />
        <span style={{fontFamily: fonts.body, fontWeight: 800, fontSize: 46, letterSpacing: 3, color: '#1A0F05', opacity: label, whiteSpace: 'nowrap'}}>
          {content.cta.button}
        </span>
        <Arrow size={50} color="#1A0F05" style={{opacity: label, transform: `translateX(${Math.max(0, Math.sin(frame / 4)) * 8}px)`}} />
      </div>
    </AbsoluteFill>
  );
};
