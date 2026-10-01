import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop, Embers} from '../components/Atmosphere';
import {Star, Ticket, Users} from '../components/Icons';
import {Phone, PHONE_H, PHONE_TARGETS, PHONE_W, Tap} from '../components/Phone';
import {content} from '../content';
import {pop, prog} from '../lib/anim';
import {CameraRig, Place} from '../lib/camera';
import {ease} from '../lib/ease';
import {fonts} from '../lib/fonts';
import {theme} from '../theme';

export const BOOKING_LEN = 80;
const SLOT_AT = 32;
const PRESS_AT = 60;
const FINGER_DX = 240; // doigt posé sur la flèche du bouton, pas sur le texte
const ZOOM = 1.06;

const Callout: React.FC<{at: number; icon: React.ReactNode; title: string; sub?: string; out: number}> = ({at, icon, title, sub, out}) => {
  const frame = useCurrentFrame();
  const p = pop(frame, at, 230, 14);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 26,
        padding: '26px 46px 26px 26px',
        borderRadius: 999,
        background: 'rgba(39,30,25,0.92)',
        border: `2px solid ${theme.colors.line}`,
        boxShadow: '0 40px 80px rgba(0,0,0,0.55)',
        transform: `scale(${p})`,
        opacity: Math.min(1, p * 2) * (1 - out),
        whiteSpace: 'nowrap',
      }}
    >
      <div style={{width: 104, height: 104, borderRadius: 999, background: theme.colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {icon}
      </div>
      <div>
        <div style={{fontFamily: fonts.body, fontWeight: 800, fontSize: 58, color: theme.colors.text, lineHeight: 1}}>{title}</div>
        {sub ? <div style={{fontFamily: fonts.body, fontWeight: 600, fontSize: 30, color: theme.colors.muted, marginTop: 8, letterSpacing: 2}}>{sub}</div> : null}
      </div>
    </div>
  );
};

/** 9,7–12,3 s : réservation en ligne sur mobile + infos clés. */
export const Booking: React.FC = () => {
  const frame = useCurrentFrame();
  const btnY = PHONE_TARGETS.button.y - PHONE_H / 2;
  const out = prog(frame, 40, 12, ease.inOut);

  // trajet du doigt (repère téléphone)
  const tx = interpolate(frame, [20, SLOT_AT - 2, SLOT_AT + 9, PRESS_AT - 4], [860, PHONE_TARGETS.slot.x, PHONE_TARGETS.slot.x + 150, PHONE_TARGETS.button.x + FINGER_DX], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.inOut,
  });
  const ty = interpolate(frame, [20, SLOT_AT - 2, SLOT_AT + 9, PRESS_AT - 4], [1750, PHONE_TARGETS.slot.y, PHONE_TARGETS.slot.y + 120, PHONE_TARGETS.button.y], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.inOut,
  });
  const tapOpacity = prog(frame, 18, 6, ease.linear);
  const ripple = prog(frame, PRESS_AT + 1, 16, ease.in);

  return (
    <AbsoluteFill>
      <Backdrop glow={0.24} y="45%" />
      <Embers count={14} seed="booking" opacity={0.5} />
      <CameraRig
        keys={[
          {f: 0, x: 0, y: 1700, s: 0.56, rx: -14, ry: -26},
          {f: 14, y: 30, s: 0.66, rx: 6, ry: -16, ease: ease.out},
          {f: 40, x: 10, y: 0, s: 0.7, rx: 3, ry: -7, ease: ease.sine},
          {f: 56, x: 0, y: btnY, s: ZOOM, rx: 0, ry: 0, ease: ease.inOut},
          {f: BOOKING_LEN, y: btnY, s: ZOOM * 1.08, ease: ease.sine},
        ]}
      >
        <Place x={0} y={0} w={PHONE_W} h={PHONE_H}>
          <Phone slotAt={SLOT_AT} pressAt={PRESS_AT} />
          <Tap taps={[SLOT_AT, PRESS_AT]} x={tx} y={ty} opacity={tapOpacity} />
        </Place>
        <Place x={-290} y={330} w={0} h={0} z={260}>
          <div style={{position: 'absolute', transform: 'translate(-50%, -50%)'}}>
            <Callout at={20} out={out} icon={<Users size={60} color="#1A0F05" />} title={content.facts.players} />
          </div>
        </Place>
        <Place x={300} y={500} w={0} h={0} z={340}>
          <div style={{position: 'absolute', transform: 'translate(-50%, -50%)'}}>
            <Callout at={26} out={out} icon={<Ticket size={60} color="#1A0F05" />} title={content.facts.price} sub={content.facts.priceSub.toUpperCase()} />
          </div>
        </Place>
        <Place x={290} y={-800} w={0} h={0} z={220}>
          <div style={{position: 'absolute', transform: 'translate(-50%, -50%)'}}>
            <Callout at={14} out={out} icon={<Star size={64} color="#1A0F05" />} title={content.facts.rating} sub={content.facts.ratingSub.toUpperCase()} />
          </div>
        </Place>
      </CameraRig>

      {/* onde du tap final → remplit l'écran */}
      <AbsoluteFill>
        <div
          style={{
            position: 'absolute',
            left: 540 + FINGER_DX * ZOOM * 1.01 - 50,
            top: 960 - 50,
            width: 100,
            height: 100,
            borderRadius: 999,
            background: theme.colors.accent,
            transform: `scale(${ripple * 56})`,
            opacity: frame > PRESS_AT ? 1 : 0,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
