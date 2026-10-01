import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {content} from '../content';
import {fonts} from '../lib/fonts';
import {brandAssets} from '../brand';
import {theme} from '../theme';

/**
 * Logo : image officielle si `brandAssets.logo` est renseigné,
 * sinon lockup typographique provisoire.
 */
export const Logo: React.FC<{width?: number; sweep?: number}> = ({width = 900, sweep = -1}) => {
  const frame = useCurrentFrame();
  if (brandAssets.logo) {
    return <Img src={staticFile(brandAssets.logo)} style={{width, height: 'auto', display: 'block'}} />;
  }
  const k = width / 900;
  // reflet lumineux : sweep ∈ [0,1] traverse le lettrage
  const pos = sweep < 0 ? -50 : -40 + sweep * 180;
  const shine = `linear-gradient(105deg, ${theme.colors.text} 0%, ${theme.colors.text} ${pos - 8}%, #FFFFFF ${pos}%, ${theme.colors.accent} ${pos + 4}%, ${theme.colors.text} ${pos + 12}%, ${theme.colors.muted} 100%)`;
  return (
    <div style={{width, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div
        style={{
          fontFamily: fonts.display,
          fontSize: 300 * k,
          lineHeight: 0.86,
          letterSpacing: 10 * k,
          backgroundImage: shine,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          textShadow: 'none',
          filter: `drop-shadow(0 ${10 * k}px ${30 * k}px rgba(0,0,0,0.6))`,
        }}
      >
        {content.brand.line1}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 28 * k, marginTop: 6 * k}}>
        <div style={{width: 150 * k, height: 4 * k, background: `linear-gradient(90deg, transparent, ${theme.colors.accent})`}} />
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 132 * k,
            lineHeight: 1,
            letterSpacing: 8 * k,
            color: theme.colors.accent,
            textShadow: `0 0 ${40 * k}px ${theme.colors.accent}88`,
            transform: `scale(${1 + 0.015 * Math.sin(frame / 6)})`,
          }}
        >
          {content.brand.line2}
        </div>
        <div style={{width: 150 * k, height: 4 * k, background: `linear-gradient(270deg, transparent, ${theme.colors.accent})`}} />
      </div>
    </div>
  );
};

export const Baseline: React.FC<{size?: number}> = ({size = 34}) => (
  <div
    style={{
      fontFamily: fonts.body,
      fontWeight: 600,
      fontSize: size,
      letterSpacing: size * 0.32,
      color: theme.colors.muted,
      whiteSpace: 'nowrap',
    }}
  >
    {content.brand.baseline}
  </div>
);
