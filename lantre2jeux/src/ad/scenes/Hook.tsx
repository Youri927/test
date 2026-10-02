import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {CameraRig, Place} from '../../lib/camera';
import {PinIcon, Wordmark} from '../Bits';
import {C, F, G} from '../theme';
import {clamp, E, pop, range} from '../util';

export const HOOK_LEN = 60;

const WALL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1080' height='1920'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.012 .02' numOctaves='5' seed='7' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .6 0 0 0 0 .62 0 0 0 0 .68 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E\")";

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const Big: React.FC<{color: string; glow?: boolean; opacity?: number}> = ({color, glow, opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: G - 10,
      top: 520,
      fontFamily: F.display,
      fontWeight: 900,
      fontSize: 300,
      lineHeight: 0.82,
      letterSpacing: '-0.01em',
      textTransform: 'uppercase',
      color,
      opacity,
      textShadow: glow ? '0 0 70px rgba(255, 198, 110, 0.4)' : undefined,
    }}
  >
    Escape
    <br />
    game
  </div>
);

/** 0 – 2 s : on sait tout de suite ce que c'est (escape game), où (Soissons), et le défi (le chrono). */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const R = 340;
  const tx = range(f, 0, 42, 140, 980, E.inOut);
  const ty = 760 + Math.sin(f / 7) * 40;
  const mask = `radial-gradient(circle ${R}px at ${tx.toFixed(1)}px ${ty.toFixed(1)}px, #000 0%, rgba(0,0,0,.9) 36%, rgba(0,0,0,.4) 66%, transparent 100%)`;
  const city = pop(f, 7, 300, 16);
  const ask = range(f, 20, 30, 0, 1, E.out);
  const secs = 3600 - Math.floor(f / 2);
  const impact = Math.max(range(f, 0, 7, 1, 0), f >= 7 ? range(f, 7, 13, 0.5, 0) : 0);
  const sx = (random(`hx${f}`) - 0.5) * 30 * impact;
  const sy = (random(`hy${f}`) - 0.5) * 30 * impact;
  const flash = range(f, 54, 60);
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>
        <CameraRig
          keys={[
            {f: 0, x: 440, y: 900, s: 1.22, rz: -2},
            {f: 10, x: 540, y: 960, s: 1.0, rz: 0, ease: E.out},
            {f: 46, x: 548, s: 1.07, rz: 0.8, ease: E.sine},
            {f: HOOK_LEN, x: 470, y: 900, s: 2.6, rz: 4, ease: E.in},
          ]}
          blur={0.5}
        >
          <Place x={540} y={960} w={1080} h={1920}>
            <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle ${R * 2.4}px at ${tx}px ${ty}px, rgba(255,198,110,.12), rgba(255,198,110,.03) 45%, transparent 70%)`}} />
            <div style={{position: 'absolute', left: G, top: 236}}>
              <Wordmark size={60} color={C.chalk} two={C.tungsten} />
            </div>
            <div
              style={{
                position: 'absolute',
                left: G,
                top: 330,
                fontFamily: F.display,
                fontWeight: 700,
                fontSize: 156,
                lineHeight: 1,
                letterSpacing: '0.02em',
                fontVariantNumeric: 'tabular-nums',
                color: '#ff5a4e',
                textShadow: '0 0 20px rgba(255,59,47,.85), 0 0 60px rgba(255,59,47,.4)',
              }}
            >
              {fmt(secs)}
            </div>
            {/* texte lisible d'emblée, la torche le fait briller */}
            <Big color={C.chalk} opacity={0.8} />
            <div style={{position: 'absolute', inset: 0, WebkitMaskImage: mask, maskImage: mask}}>
              <div style={{position: 'absolute', inset: 0, backgroundColor: '#1a2433', backgroundImage: WALL, backgroundSize: 'cover', opacity: 0.85}} />
              <Big color="#fff8ec" glow />
            </div>
            <div
              style={{
                position: 'absolute',
                left: G,
                top: 1050,
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                transformOrigin: 'left center',
                transform: `scale(${interpolate(city, [0, 1], [1.4, 1])})`,
                opacity: Math.min(1, city * 3),
              }}
            >
              <PinIcon size={104} color={C.tungsten} />
              <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 140, lineHeight: 1, textTransform: 'uppercase', color: C.tungsten, filter: 'drop-shadow(0 0 30px rgba(255,198,110,.35))'}}>Soissons</span>
            </div>
            <div style={{position: 'absolute', left: G, top: 1222, fontFamily: F.body, fontStyle: 'italic', fontSize: 56, color: C.chalk, opacity: ask, transform: `translateY(${(1 - ask) * 30}px)`}}>
              Saurez-vous sortir à temps&#8239;?
            </div>
          </Place>
        </CameraRig>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff3dc', opacity: flash * 0.85}} />
    </AbsoluteFill>
  );
};
