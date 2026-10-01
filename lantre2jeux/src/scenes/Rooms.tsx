import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop, Embers} from '../components/Atmosphere';
import {CARD_H, CARD_W, RoomCard} from '../components/RoomCard';
import {content} from '../content';
import {prog} from '../lib/anim';
import {CameraRig, Place} from '../lib/camera';
import {ease} from '../lib/ease';
import {fonts} from '../lib/fonts';
import {theme} from '../theme';

export const ROOMS_LEN = 180;
const GAP = 1300;
/** frame d'arrivée de la caméra sur chaque carte */
const ARRIVALS = [8, 60, 120];

/** 3,7–9,7 s : les 3 salles, caméra qui file de carte en carte. */
export const Rooms: React.FC = () => {
  const frame = useCurrentFrame();
  const active = frame < 56 ? 0 : frame < 116 ? 1 : 2;
  const tint = theme.rooms[content.rooms[active].id].tint;
  const head = prog(frame, 2, 12, ease.out) * (1 - prog(frame, ROOMS_LEN - 12, 8, ease.in));
  return (
    <AbsoluteFill>
      <Backdrop tint={tint} glow={0.18} y="48%" />
      <Embers count={16} seed="rooms" opacity={0.6} />
      <CameraRig
        keys={[
          {f: 0, x: -1500, y: 0, s: 0.86, ry: 16},
          {f: 12, x: 0, s: 0.97, ry: -3, ease: ease.out},
          {f: 50, x: 22, s: 1.02, ry: -7, rz: 0, ease: ease.sine},
          {f: 62, x: GAP, s: 0.97, ry: 5, rz: 1.2, ease: ease.whip},
          {f: 108, x: GAP + 22, s: 1.03, ry: 8, rz: 0, ease: ease.sine},
          {f: 120, x: GAP * 2, s: 0.97, ry: -5, ease: ease.whip},
          {f: 166, x: GAP * 2, y: -20, s: 1.05, ry: -1, ease: ease.sine},
          {f: ROOMS_LEN, y: -2400, s: 0.9, rx: 14, ease: ease.in},
        ]}
      >
        {content.rooms.map((room, i) => (
          <Place key={room.id} x={GAP * i} y={30} w={CARD_W} h={CARD_H}>
            <RoomCard room={room} index={i} t0={ARRIVALS[i]} />
          </Place>
        ))}
      </CameraRig>

      {/* en-tête fixe (écran) */}
      <div
        style={{
          position: 'absolute',
          top: 168,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          opacity: head,
          transform: `translateY(${(1 - head) * -30}px)`,
        }}
      >
        <div style={{fontFamily: fonts.display, fontSize: 76, letterSpacing: 6, color: theme.colors.text}}>
          3 SALLES · <span style={{color: theme.colors.accent}}>3 UNIVERS</span>
        </div>
        <div style={{display: 'flex', gap: 12}}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: 10,
                borderRadius: 5,
                width: interpolate(i === active ? 1 : 0, [0, 1], [26, 90]),
                background: i === active ? theme.colors.accent : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
