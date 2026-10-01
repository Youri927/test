import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {theme} from '../theme';

/** Fond : dégradé chaud + halo teinté. */
export const Backdrop: React.FC<{tint?: string; glow?: number; y?: string}> = ({
  tint = theme.colors.accent,
  glow = 0.22,
  y = '42%',
}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 75% at 50% ${y}, ${theme.colors.bg2} 0%, ${theme.colors.bg} 62%)`,
    }}
  >
    <AbsoluteFill
      style={{
        background: `radial-gradient(55% 32% at 50% ${y}, ${tint} 0%, transparent 70%)`,
        opacity: glow,
      }}
    />
  </AbsoluteFill>
);

/** Braises qui montent (écran). */
export const Embers: React.FC<{count?: number; color?: string; seed?: string; opacity?: number}> = ({
  count = 26,
  color = theme.colors.accent,
  seed = 'embers',
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity}}>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const size = 3 + r('s') * 7;
        const speed = 1.2 + r('v') * 3.2;
        const x0 = r('x') * 1080;
        const y = ((r('y') * 2100 - frame * speed) % 2100 + 2100) % 2100 - 90;
        const x = x0 + Math.sin(frame / (14 + r('w') * 20) + i) * (10 + r('a') * 26);
        const flicker = 0.35 + 0.65 * Math.abs(Math.sin(frame / (5 + r('f') * 9) + i * 3));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: size,
              background: color,
              opacity: flicker * (0.35 + r('o') * 0.6),
              boxShadow: `0 0 ${size * 3}px ${size}px ${color}`,
              filter: r('b') > 0.6 ? 'blur(2px)' : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Grain + vignette globaux. */
export const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(90% 60% at 50% 48%, transparent 45%, rgba(0,0,0,0.62) 100%)',
        }}
      />
      <svg width="1080" height="1920" style={{position: 'absolute', opacity: 0.09, mixBlendMode: 'overlay'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 7} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1080" height="1920" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
