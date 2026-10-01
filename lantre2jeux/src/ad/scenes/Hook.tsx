import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {CameraRig, Place} from '../../lib/camera';
import {Slit} from '../Bits';
import {C, F, G} from '../theme';
import {clamp, E, pop, range, steps} from '../util';

export const HOOK_LEN = 54;

const WALL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1080' height='1920'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.012 .02' numOctaves='5' seed='7' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .6 0 0 0 0 .62 0 0 0 0 .68 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E\")";

const MOTES = Array.from({length: 70}, (_, i) => ({
  x: random(`mx${i}`) * 1080,
  y: random(`my${i}`) * 1920,
  v: 0.6 + random(`mv${i}`) * 1.6,
  s: 1.5 + random(`ms${i}`) * 3,
  a: 0.35 + random(`ma${i}`) * 0.55,
  p: random(`mp${i}`) * 6.28,
}));

const TitleText: React.FC<{color: string; glow?: boolean}> = ({color, glow}) => (
  <div
    style={{
      position: 'absolute',
      left: G - 8,
      top: 682,
      fontFamily: F.display,
      fontWeight: 900,
      fontSize: 306,
      lineHeight: 0.8,
      letterSpacing: '-0.01em',
      textTransform: 'uppercase',
      color,
      textShadow: glow ? '0 0 60px rgba(255, 198, 110, 0.35)' : undefined,
    }}
  >
    Entrez.
  </div>
);

/** 0 – 1,8 s : le noir, la torche révèle « Entrez. », la porte claque, la lumière meurt. */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const flicker = steps(f, [[0, 0.9], [2, 0.12], [3, 0.85], [5, 0.35], [6, 1]]);
  const dies = interpolate(f, [43, 45, 46, 48, 50], [1, 0.3, 0.7, 0.12, 0], clamp);
  const R = 300 * flicker * dies;
  const tx = range(f, 0, 40, 170, 960, E.inOut);
  const ty = 822 + Math.sin(f / 8) * 24;
  const mask = `radial-gradient(circle ${R.toFixed(1)}px at ${tx.toFixed(1)}px ${ty.toFixed(1)}px, #000 0%, rgba(0,0,0,.92) 34%, rgba(0,0,0,.45) 64%, transparent 100%)`;

  const l2 = pop(f, 22, 280, 18);
  const fadeOut = 1 - range(f, 45, 51);
  const shake = f >= 44 ? range(f, 44, 54, 1, 0) : 0;
  const sx = (random(`shx${f}`) - 0.5) * 34 * shake;
  const sy = (random(`shy${f}`) - 0.5) * 34 * shake;
  const slit = range(f, 47, 54, 0, 1, E.out);

  return (
    <AbsoluteFill style={{background: C.ink}}>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>
        <CameraRig keys={[{f: 0, x: 540, y: 960, s: 1.0}, {f: 44, s: 1.075, ease: E.sine}, {f: HOOK_LEN, s: 1.1}]} blur={0.3}>
          <Place x={540} y={960} w={1080} h={1920}>
            {/* lueur chaude de la torche */}
            <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle ${(R * 2.6).toFixed(0)}px at ${tx}px ${ty}px, rgba(255,198,110,.10), rgba(255,198,110,.03) 45%, transparent 70%)`}} />
            <div
              style={{position: 'absolute', left: G, top: 380, fontFamily: F.body, fontWeight: 500, fontSize: 36, color: C.mist, opacity: range(f, 8, 18) * fadeOut}}
            >
              Escape game à Soissons
            </div>
            {/* texte dans la pénombre */}
            <TitleText color={C.shade} />
            {/* ce que révèle la torche */}
            <div style={{position: 'absolute', inset: 0, WebkitMaskImage: mask, maskImage: mask}}>
              <div style={{position: 'absolute', inset: 0, backgroundColor: '#182230', backgroundImage: WALL, backgroundSize: 'cover'}} />
              <TitleText color={C.chalk} glow />
              <div style={{position: 'absolute', left: 110, top: 537, fontFamily: F.display, fontWeight: 800, fontSize: 70, color: 'rgba(255,198,110,.88)', transform: 'rotate(-5deg)'}}>
                75:00
                <svg viewBox="0 0 200 110" preserveAspectRatio="none" style={{position: 'absolute', left: -38, top: -22, width: 240, height: 120}}>
                  <path d="M18 60C10 22 70 6 118 10s82 22 72 54-80 44-124 38S22 88 18 60z" fill="none" stroke="rgba(255,198,110,.65)" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{position: 'absolute', right: 92, top: 552, textAlign: 'right', fontFamily: F.stencil, fontWeight: 700, fontSize: 46, lineHeight: 1, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(61,240,216,.8)', transform: 'rotate(4deg)'}}>
                Jeff’s Diner
                <br />
                1958
              </div>
              <div style={{position: 'absolute', right: 30, top: 962, writingMode: 'vertical-rl', fontFamily: F.stencil, fontWeight: 700, fontSize: 34, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(255,59,47,.8)'}}>
                Kaliningrad
              </div>
              <div style={{position: 'absolute', left: 600, top: 1000, fontFamily: F.body, fontSize: 64, color: 'rgba(255,75,110,.75)', transform: 'rotate(8deg)'}}>✕</div>
              {MOTES.map((m, i) => {
                const y = (((m.y - f * m.v) % 1920) + 1920) % 1920;
                const x = m.x + Math.sin(f / 20 + m.p) * 14;
                const d = Math.hypot(x - tx, y - ty) / Math.max(R, 1);
                if (d >= 1) return null;
                return (
                  <div
                    key={i}
                    style={{position: 'absolute', left: x, top: y, width: m.s, height: m.s, borderRadius: 9, background: '#ffe2b2', opacity: m.a * (1 - d) * (1 - d), boxShadow: `0 0 ${m.s * 3}px ${m.s}px rgba(255,226,178,.5)`}}
                  />
                );
              })}
            </div>
            {/* la phrase qui claque */}
            <div
              style={{
                position: 'absolute',
                left: G,
                top: 987,
                fontFamily: F.display,
                fontWeight: 300,
                fontSize: 122,
                lineHeight: 0.92,
                textTransform: 'uppercase',
                color: C.chalk,
                transformOrigin: 'left center',
                transform: `scale(${interpolate(l2, [0, 1], [1.35, 1])})`,
                opacity: Math.min(1, l2 * 3) * fadeOut,
                filter: `blur(${interpolate(l2, [0, 0.7], [10, 0], clamp).toFixed(1)}px)`,
              }}
            >
              On ferme
              <br />
              derrière vous.
            </div>
          </Place>
        </CameraRig>
      </AbsoluteFill>
      {/* une fente de lumière apparaît : la porte de la première salle */}
      <Slit color="#e8fffb" glow="rgba(61, 240, 216, 0.9)" opacity={slit > 0 ? 1 : 0} grow={slit} streak={range(f, 48, 54) * 0.9} />
    </AbsoluteFill>
  );
};
