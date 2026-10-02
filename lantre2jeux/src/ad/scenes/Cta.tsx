import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CameraRig, Place} from '../../lib/camera';
import {PinIcon, Tap, Wordmark} from '../Bits';
import {BOOKING_URL, C, F, G} from '../theme';
import {E, pop, range} from '../util';

export const CTA_LEN = 67;
const DOOR = {w: 560, h: 1180};
const BTN = {top: 930, h: 150};

/** 12,8 – 15 s : la caméra avance vers la dernière porte, elle s'ouvre, on traverse dans la lumière. */
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const open = range(f, 3, 15, 0, 1, E.door);
  const inset = (1 - open) * 49.6;
  const panel = range(f, 15, 21);
  const title = pop(f, 18, 220, 17);
  const btn = pop(f, 26, 240, 15);
  const pulse = f > 44 ? 1 + 0.03 * Math.max(0, Math.sin((f - 44) / 4)) : 1;
  const shine = range(f, 38, 54, -30, 130);
  return (
    <AbsoluteFill style={{background: C.ink}}>
      {/* travelling vers la porte et à travers elle */}
      <CameraRig keys={[{f: 0, x: 540, y: 960, s: 0.84}, {f: 5, s: 0.9, ease: E.sine}, {f: 21, s: 2.5, ease: E.in}]} blur={0.5}>
        <Place x={540} y={960} w={1080} h={1920}>
          <div style={{position: 'absolute', inset: -600, background: 'radial-gradient(50% 40% at 50% 50%, #142233 0%, #07101A 70%)'}} />
          <div
            style={{
              position: 'absolute',
              left: 540 - DOOR.w / 2 - 26,
              top: 960 - DOOR.h / 2 - 26,
              width: DOOR.w + 52,
              height: DOOR.h + 52,
              borderRadius: 10,
              background: '#0d1724',
              boxShadow: 'inset 0 0 0 2px rgba(242,234,223,.06), 0 0 120px rgba(255,198,110,.12)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 540 - DOOR.w / 2,
              top: 960 - DOOR.h / 2,
              width: DOOR.w,
              height: DOOR.h,
              background: '#05090f',
              boxShadow: `0 0 ${18 + 30 * open}px ${4 + 10 * open}px rgba(255,198,110,${0.55 + 0.4 * open})`,
            }}
          >
            <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${inset}% 0 ${inset}%)`, background: 'radial-gradient(70% 55% at 50% 45%, #fff1cf 0%, #FFC66E 60%, #f2ad48 100%)'}} />
            <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 4, marginLeft: -2, background: '#fff3d6', boxShadow: '0 0 20px 6px rgba(255,198,110,.9), 0 0 90px 20px rgba(255,198,110,.4)', opacity: 1 - open}} />
          </div>
        </Place>
      </CameraRig>

      {/* de l'autre côté : la lumière et l'appel à l'action */}
      <AbsoluteFill style={{opacity: panel}}>
        <CameraRig keys={[{f: 15, x: 540, y: 960, s: 1.08}, {f: 34, s: 1.0, ease: E.out}, {f: CTA_LEN, s: 1.025, ease: E.sine}]} blur={0}>
          <Place x={540} y={960} w={1080} h={1920}>
            <div style={{position: 'absolute', inset: -200, background: 'radial-gradient(70% 55% at 50% 45%, #ffdb99 0%, #FFC66E 55%, #f2ad48 100%)'}} />
            <div style={{position: 'absolute', left: G, top: 250, opacity: range(f, 20, 28)}}>
              <Wordmark size={66} color={C.ink} two="#9a5d00" />
            </div>
            <div
              style={{
                position: 'absolute',
                left: G - 8,
                top: 430,
                fontFamily: F.display,
                fontWeight: 900,
                fontSize: 198,
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
                fontSize: 50,
                color: C.tungsten,
                boxShadow: '0 24px 60px -20px rgba(7, 16, 26, 0.6)',
                transform: `scale(${btn * pulse})`,
                opacity: Math.min(1, btn * 2),
              }}
            >
              <div style={{position: 'absolute', top: 0, bottom: 0, width: 180, left: `${shine}%`, background: 'linear-gradient(100deg, transparent, rgba(255, 198, 110, 0.35), transparent)'}} />
              Réservez votre salle
            </div>
            <div style={{position: 'absolute', left: G, top: 1122, fontFamily: F.body, fontWeight: 700, fontSize: 44, color: C.ink, opacity: range(f, 30, 38)}}>{BOOKING_URL}</div>
            <div style={{position: 'absolute', left: G, top: 1190, display: 'flex', alignItems: 'center', gap: 12, fontFamily: F.body, fontWeight: 600, fontSize: 36, color: C.ink, opacity: range(f, 33, 41)}}>
              <PinIcon size={40} color={C.ink} />4 avenue de Château-Thierry, Soissons
            </div>
            <div style={{position: 'absolute', left: G, top: 1252, fontFamily: F.body, fontWeight: 500, fontSize: 34, color: 'rgba(7, 16, 26, 0.75)', opacity: range(f, 36, 44)}}>
              Dès 21&nbsp;€ par joueur, de 3 à 6 joueurs
            </div>
            <Tap at={50} x={G + (1080 - G * 2) * 0.74} y={BTN.top + BTN.h / 2} />
          </Place>
        </CameraRig>
        <AbsoluteFill style={{background: 'radial-gradient(45% 50% at 50% 50%, rgba(255,255,255,.95), transparent 70%)', opacity: range(f, 15, 18) * (1 - range(f, 18, 30)) * 0.8}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
