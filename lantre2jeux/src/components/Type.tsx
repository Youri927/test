import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {pop, prog} from '../lib/anim';
import {ease} from '../lib/ease';
import {fonts} from '../lib/fonts';
import {theme} from '../theme';

/** Mot qui "claque" : arrive grand + flou, se pose avec un léger rebond. */
export const Slam: React.FC<{
  children: React.ReactNode;
  at: number;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  from?: number;
}> = ({children, at, size = 150, color = theme.colors.text, style, from = 1.9}) => {
  const frame = useCurrentFrame();
  const s = pop(frame, at, 260, 17);
  const o = prog(frame, at, 4, ease.linear);
  const scale = interpolate(s, [0, 1], [from, 1]);
  const blur = interpolate(s, [0, 0.7], [14, 0], {extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        fontFamily: fonts.display,
        fontSize: size,
        lineHeight: 0.92,
        color,
        letterSpacing: size * 0.02,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        opacity: o,
        transform: `scale(${scale})`,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Ligne révélée par masque (glisse de bas en haut). */
export const Reveal: React.FC<{
  children: React.ReactNode;
  at: number;
  dur?: number;
  style?: React.CSSProperties;
  dir?: 1 | -1;
}> = ({children, at, dur = 14, style, dir = 1}) => {
  const frame = useCurrentFrame();
  const t = prog(frame, at, dur, ease.out);
  return (
    <div style={{overflow: 'hidden', paddingBottom: '0.06em', ...style}}>
      <div style={{transform: `translateY(${(1 - t) * 105 * dir}%)`, opacity: t > 0 ? 1 : 0}}>{children}</div>
    </div>
  );
};

/** Apparition douce vers le haut. */
export const FadeUp: React.FC<{children: React.ReactNode; at: number; dist?: number; style?: React.CSSProperties}> = ({
  children,
  at,
  dist = 30,
  style,
}) => {
  const frame = useCurrentFrame();
  const t = prog(frame, at, 14, ease.out);
  return <div style={{opacity: t, transform: `translateY(${(1 - t) * dist}px)`, ...style}}>{children}</div>;
};
