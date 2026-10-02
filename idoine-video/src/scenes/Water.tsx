import React from 'react';
import {useCurrentFrame} from 'remotion';
import {surfacePath} from '../Bits';
import {C, F, W, range} from '../util';

/** Une onde qui s'ouvre à la surface, en (x, y), née à l'image `at` */
export const Ring: React.FC<{x: number; y: number; at: number; big?: boolean}> = ({x, y, at, big}) => {
  const f = useCurrentFrame();
  const t = range(f, at, at + 120, 0, 1, (k) => 1 - Math.pow(1 - k, 2.4));
  if (f < at || t >= 1) return null;
  const w = (big ? 420 : 220) * (0.08 + t * 0.92);
  return (
    <div
      style={{
        position: 'absolute', left: x - w / 2, top: y - w * 0.06, width: w, height: w * 0.12,
        borderRadius: '50%', border: '2px solid rgba(233, 255, 252, .9)', opacity: (1 - t) * 0.95,
      }}
    />
  );
};

/** Le plan d'eau vu de profil : pierre au-dessus, eau en dessous, ligne qui ondule */
export const WaterPlane: React.FC<{wl: number}> = ({wl}) => {
  const f = useCurrentFrame();
  const d = surfacePath(W, f, 4, 380);
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: wl, height: 3000, background: 'linear-gradient(180deg, #0E7C86 0%, #0B6B74 14%, #08474F 45%, #063339 70%)'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 160, background: 'linear-gradient(rgba(233,255,252,.2), transparent)'}} />
      </div>
      <svg width={W} height={30} viewBox={`0 -15 ${W} 30`} style={{position: 'absolute', left: 0, top: wl - 15, overflow: 'visible'}}>
        <path d={`${d}L${W + 40} 30L-40 30Z`} fill="#0E7C86" />
        <path d={d} fill="none" stroke="#E9FFFC" strokeWidth={2} opacity={0.85} />
      </svg>
    </>
  );
};

/** Un titre à moitié immergé : au-dessus en encre, sous la surface éclairci et dévié */
export const Submerged: React.FC<{lines: string[]; x: number; y: number; size: number; wl: number; color?: string}> = ({lines, x, y, size, wl, color = C.encre}) => {
  const f = useCurrentFrame();
  const local = wl - y;
  const style: React.CSSProperties = {
    position: 'absolute', left: x, top: y, margin: 0, whiteSpace: 'nowrap',
    fontFamily: F.display, fontWeight: 300, fontStretch: '125%', fontSize: size, lineHeight: 0.96, letterSpacing: '-0.03em',
  };
  const wobble = Math.sin(f / 50) * size * 0.012;
  return (
    <>
      <div style={{...style, color, clipPath: `inset(0 0 calc(100% - ${local}px) 0)`}}>
        {lines.map((l) => <div key={l}>{l}</div>)}
      </div>
      <div
        style={{
          ...style, color: 'rgba(233, 255, 252, .9)', clipPath: `inset(${local}px 0 0 0)`,
          transformOrigin: `0 ${local}px`, transform: `translateX(${size * 0.03 + wobble}px) scaleY(1.06)`,
        }}
      >
        {lines.map((l) => <div key={l}>{l}</div>)}
      </div>
    </>
  );
};
