import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CameraRig, Place} from '../../lib/camera';
import {Slit, Tap, Wordmark} from '../Bits';
import {BOOKING_URL, C, F, G} from '../theme';
import {clamp, E, pop, range} from '../util';

export const CTA_LEN = 72;
const BTN = {top: 1046, h: 150};

/** 12,6 – 15 s : la dernière porte s'ouvre sur la lumière. Appel à l'action. */
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const open = range(f, 3, 18, 0, 1, E.door);
  const inset = (1 - open) * 49.8;
  const bloom = range(f, 4, 10) * (1 - range(f, 10, 24));
  const title = pop(f, 8, 200, 17);
  const btn = pop(f, 22, 240, 15);
  const pulse = f > 42 ? 1 + 0.03 * Math.max(0, Math.sin((f - 42) / 4)) : 1;
  const shine = range(f, 40, 58, -30, 130);
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${inset}% 0 ${inset}%)`}}>
        <CameraRig keys={[{f: 0, x: 540, y: 960, s: 1.06}, {f: 20, s: 1.0, ease: E.out}, {f: CTA_LEN, s: 1.03, ease: E.sine}]} blur={0}>
          <Place x={540} y={960} w={1080} h={1920}>
            <div style={{position: 'absolute', inset: -200, background: 'radial-gradient(70% 55% at 50% 45%, #ffdb99 0%, #FFC66E 55%, #f2ad48 100%)'}} />
            <div style={{position: 'absolute', left: G, top: 250, opacity: range(f, 12, 20)}}>
              <Wordmark size={66} color={C.ink} two="#9a5d00" />
            </div>
            <div
              style={{
                position: 'absolute',
                left: G - 8,
                top: 450,
                fontFamily: F.display,
                fontWeight: 900,
                fontSize: 200,
                lineHeight: 0.86,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                color: C.ink,
                opacity: Math.min(1, title * 2),
                transformOrigin: 'left center',
                transform: `scale(${interpolate(title, [0, 1], [1.12, 1])})`,
              }}
            >
              La porte
              <br />
              est ouverte.
            </div>
            <div style={{position: 'absolute', left: G, top: 880, fontFamily: F.body, fontWeight: 500, fontSize: 44, lineHeight: 1.3, color: C.ink, opacity: range(f, 18, 28), transform: `translateY(${range(f, 18, 30, 24, 0, E.out)}px)`}}>
              Choisissez votre salle
              <br />
              et votre créneau en ligne.
            </div>
            <div
              style={{
                position: 'absolute',
                left: G,
                top: BTN.top,
                width: 1080 - G * 2,
                height: BTN.h,
                borderRadius: BTN.h / 2,
                background: C.ink,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: F.body,
                fontWeight: 800,
                fontSize: 48,
                letterSpacing: '0.01em',
                color: C.tungsten,
                boxShadow: '0 24px 60px -20px rgba(7, 16, 26, 0.6)',
                transform: `scale(${btn * pulse})`,
                opacity: Math.min(1, btn * 2),
              }}
            >
              <div style={{position: 'absolute', top: 0, bottom: 0, width: 180, left: `${shine}%`, background: 'linear-gradient(100deg, transparent, rgba(255, 198, 110, 0.35), transparent)'}} />
              Réservez votre salle
            </div>
            <div style={{position: 'absolute', left: G, top: 1236, fontFamily: F.body, fontWeight: 700, fontSize: 42, color: C.ink, opacity: range(f, 28, 36)}}>{BOOKING_URL}</div>
            <div style={{position: 'absolute', left: G, top: 1296, fontFamily: F.body, fontWeight: 500, fontSize: 34, color: 'rgba(7, 16, 26, 0.72)', opacity: range(f, 32, 40)}}>
              Escape game à Soissons, dès 21&nbsp;€ par joueur
            </div>
            <Tap at={52} x={G + (1080 - G * 2) * 0.74} y={BTN.top + BTN.h / 2} />
            <div style={{position: 'absolute', inset: -200, background: 'radial-gradient(40% 50% at 50% 50%, rgba(255, 255, 255, 0.95), transparent 70%)', opacity: bloom * 0.8}} />
          </Place>
        </CameraRig>
      </div>
      <Slit color="#fff3d6" glow="rgba(255, 198, 110, 0.95)" opacity={interpolate(f, [0, 6, 14], [1, 1, 0], clamp)} streak={range(f, 0, 3) * (1 - range(f, 6, 16))} />
    </AbsoluteFill>
  );
};
