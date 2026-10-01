import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/** Vignettage + grain argentique, par-dessus toute la pub. */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(100% 70% at 50% 46%, transparent 52%, rgba(0, 0, 0, 0.58) 100%)'}} />
      <svg width="1080" height="1920" style={{position: 'absolute', opacity: 0.09, mixBlendMode: 'overlay'}}>
        <filter id="adgrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 8} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1080" height="1920" filter="url(#adgrain)" />
      </svg>
    </AbsoluteFill>
  );
};
