import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Mark, Sheet, Wall} from '../Bits';
import {BEAT, C, E, F, H, W, range} from '../util';

export const OPEN_LEN = 8 * BEAT;
export const AVANT_BG = '#F2EDE4';

// le soleil : une vraie réalisation de l'entreprise dans un cercle, comme l'accroche du site
const CX = 1290;
const CY = 540;
const R0 = 390;
const RMAX = Math.hypot(CX, H - CY) + 20;
const FOCAL = {x: W * 0.52, y: H * 0.7};
const TITLE = {x: 150, y: 300};

const LINE: React.CSSProperties = {fontFamily: F.body, fontWeight: 640, fontSize: 150, lineHeight: 0.86, letterSpacing: '-0.02em', textTransform: 'uppercase', fontVariationSettings: '"wdth" 125'};

/** Une ligne qui monte derrière son cache, comme les titres du site */
const Line: React.FC<{style: React.CSSProperties; shift: number; children: React.ReactNode}> = ({style, shift, children}) => (
  <div style={{overflow: 'hidden', padding: '0.04em 0.12em 0.1em 0', margin: '-0.04em -0.12em -0.1em 0'}}>
    <div style={{...style, transform: `translateY(${shift}%)`}}>{children}</div>
  </div>
);

const Title: React.FC<{color: string; style?: React.CSSProperties; shift: (at: number) => number}> = ({color, style, shift}) => (
  <div style={{position: 'absolute', left: TITLE.x, top: TITLE.y, width: 1200, color, ...style}}>
    <Line style={LINE} shift={shift(14)}>A new</Line>
    <Line style={LINE} shift={shift(22)}>website</Line>
    <Line style={{fontFamily: F.display, fontStyle: 'italic', fontSize: 178, lineHeight: 1, letterSpacing: '-0.01em'}} shift={shift(30)}>for life outside.</Line>
  </div>
);

/** Ouverture : le soleil se lève à côté du titre, puis s'ouvre jusqu'à remplir l'écran */
export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const rise = range(f, 6, 120, 0, 1, E.soft);
  const open = range(f, 205, 300, 0, 1, E.inOut);
  const r = Math.max(0.01, R0 * rise + (RMAX - R0 * rise) * open);
  const cy = CY + (1 - rise) * 60 * (1 - open);
  // la photo est recadrée sur le spa dans le petit cercle, puis remise à plat en s'ouvrant
  const s = 1.25 + 0.08 * (1 - rise) + (1 - 1.25) * open;
  const tx = CX + (FOCAL.x - CX) * open - W / 2 - s * (FOCAL.x - W / 2);
  const ty = cy + (FOCAL.y - cy) * open - H / 2 - s * (FOCAL.y - H / 2);
  const shift = (at: number) => range(f, at, at + 50, 118, 0, E.out);
  const fade = (at: number) => ({opacity: range(f, at, at + 30, 0, 1), transform: `translateY(${range(f, at, at + 40, 18, 0, E.out)}px)`});
  const cxT = CX - TITLE.x;
  const cyT = cy - TITLE.y;
  const dark = range(f, 230, 300, 0, 0.42);
  return (
    <AbsoluteFill style={{transform: `scale(${range(f, 0, OPEN_LEN, 1, 1.035)})`}}>
      <Wall slats={1} />
      <div style={{position: 'absolute', left: TITLE.x, top: 170, display: 'flex', alignItems: 'center', gap: 18, fontFamily: F.body, fontWeight: 600, fontSize: 21, letterSpacing: '0.16em', textTransform: 'uppercase', fontVariationSettings: '"wdth" 118', color: C.grey, ...fade(40)}}>
        <Mark size={40} color={C.grey} />
        Scottsdale Pool Patio &amp; Landscape Design
      </div>
      <div style={{position: 'absolute', left: TITLE.x, top: 830, fontFamily: F.body, fontSize: 27, lineHeight: 1.5, color: C.grey, ...fade(80), opacity: range(f, 80, 110, 0, 1) * range(f, 200, 230, 1, 0)}}>
        Website redesign concept, October 2026
      </div>
      {/* la photo, dans le cercle */}
      <AbsoluteFill style={{clipPath: `circle(${r.toFixed(1)}px at ${CX}px ${cy.toFixed(1)}px)`}}>
        <Img src={staticFile('img/hero.webp')} style={{position: 'absolute', left: 0, top: 0, width: W, height: H, objectFit: 'cover', objectPosition: '50% 62%', transform: `translate(${tx}px, ${ty}px) scale(${s})`}} />
        <AbsoluteFill style={{background: `linear-gradient(100deg, rgba(10,12,14,${dark * 1.3}) 0%, rgba(10,12,14,${dark * 0.6}) 50%, rgba(10,12,14,${dark * 0.25}) 100%)`}} />
      </AbsoluteFill>
      {/* le titre : sombre hors du cercle, clair dedans */}
      <Title
        color={C.ink}
        shift={shift}
        style={{WebkitMaskImage: `radial-gradient(circle ${r}px at ${cxT}px ${cyT}px, transparent ${r - 0.5}px, #000 ${r + 0.5}px)`}}
      />
      <Title color={C.cream} shift={shift} style={{clipPath: `circle(${r}px at ${cxT}px ${cyT}px)`, textShadow: '0 2px 30px rgba(0,0,0,.2)'}} />
      <Sheet level={range(f, OPEN_LEN - 52, OPEN_LEN, 0, 1, E.inOut)} tint={AVANT_BG} />
    </AbsoluteFill>
  );
};
