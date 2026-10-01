import React from 'react';
import {useCurrentFrame} from 'remotion';
import {theme} from '../theme';

/** Serrure lumineuse — le trou est centré sur (0,0) de son conteneur (cercle). */
export const Keyhole: React.FC<{light: number}> = ({light}) => {
  const frame = useCurrentFrame();
  const flick = 0.92 + 0.08 * Math.sin(frame * 1.7) * Math.sin(frame * 0.6);
  const l = light * flick;
  return (
    <div style={{position: 'absolute', left: -600, top: -700, width: 1200, height: 1600}}>
      {/* rayons volumétriques */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(38% 30% at 50% 50%, ${theme.colors.accent}55 0%, transparent 70%)`,
          opacity: l,
        }}
      />
      <svg width="1200" height="1600" viewBox="-600 -700 1200 1600" style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="kh-light" cx="0" cy="40" r="260" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFF6E2" />
            <stop offset="0.35" stopColor="#FFD58A" />
            <stop offset="1" stopColor={theme.colors.accent} />
          </radialGradient>
          <filter id="kh-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="38" />
          </filter>
          <linearGradient id="kh-plate" x1="0" y1="-260" x2="0" y2="420" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#3A2C22" />
            <stop offset="1" stopColor="#1A1310" />
          </linearGradient>
        </defs>
        {/* plaque de serrure */}
        <rect x="-170" y="-250" width="340" height="660" rx="170" fill="url(#kh-plate)" stroke="#5B4636" strokeWidth="6" />
        <rect x="-150" y="-230" width="300" height="620" rx="150" fill="none" stroke="rgba(255,220,180,0.10)" strokeWidth="3" />
        <circle cx="0" cy="-185" r="9" fill="#6B5442" />
        <circle cx="0" cy="345" r="9" fill="#6B5442" />
        {/* halo */}
        <g filter="url(#kh-glow)" opacity={l}>
          <circle cx="0" cy="0" r="78" fill={theme.colors.accent} />
          <path d="M-40 40 L-82 230 L82 230 L40 40 Z" fill={theme.colors.accent} />
        </g>
        {/* trou */}
        <g opacity={0.25 + 0.75 * l}>
          <circle cx="0" cy="0" r="70" fill="url(#kh-light)" />
          <path d="M-36 40 L-74 220 L74 220 L36 40 Z" fill="url(#kh-light)" />
        </g>
      </svg>
    </div>
  );
};
