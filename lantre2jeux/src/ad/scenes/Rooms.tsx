import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {CameraRig, Place} from '../../lib/camera';
import {AlerteArt, CorleoneArt, Route66Art} from '../Arts';
import {Chip, Handheld, Slit} from '../Bits';
import {C, F, G} from '../theme';
import {E, lerp, range, steps} from '../util';
import {Year} from '../Year';

export const ROOMS_LEN = 180;
const LEN = 60;
const STEP = 1300;

type Room = {
  id: string;
  t0: number;
  accent: string;
  glow: string;
  core: string;
  from: number[];
  to: number[];
  secret?: boolean;
  place: string;
  tagline: string;
  focus: number;
  title: string[];
  size: number;
  chips: string[];
  fx: 'neon' | 'gold' | 'alarm';
  Art: React.FC<{t0: number}>;
};

const ROOMS: Room[] = [
  {id: 'r66', t0: 0, tagline: 'Enquêtez sur les disparitions du Jeff’s Diner.', focus: 700, accent: C.neon, glow: 'rgba(61, 240, 216, 0.9)', core: '#e8fffb', from: [2, 0, 2, 6], to: [1, 9, 5, 8], place: 'Crystal Springs, Nevada', title: ['Route 66'], size: 236, chips: ['Enquête', '60 min', 'Intermédiaire'], fx: 'neon', Art: Route66Art},
  {id: 'corleone', t0: LEN, tagline: 'Trouvez le diamant avant le retour du clan.', focus: 640, accent: C.gold, glow: 'rgba(226, 174, 82, 0.9)', core: '#fff3d6', from: [1, 9, 5, 8], to: [1, 9, 3, 8], place: 'Chicago', title: ['La Planque', 'des Corleone'], size: 170, chips: ['Casse', '60 min', 'Avancé'], fx: 'gold', Art: CorleoneArt},
  {id: 'alerte', t0: LEN * 2, tagline: 'Sortez. Et désamorcez la bombe.', focus: 660, accent: C.alarm, glow: 'rgba(255, 59, 47, 0.9)', core: '#ffe1dc', from: [1, 9, 3, 8], to: [1, 9, 3, 8], secret: true, place: 'Kaliningrad, date classée secrète', title: ['Alerte', 'Rouge'], size: 236, chips: ['Mission', '75 min', 'Expert'], fx: 'alarm', Art: AlerteArt},
];

const NEON_ON: [number, number][] = [[0, 1], [1, 0.25], [2, 1], [4, 0.45], [5, 1]];

const Title: React.FC<{room: Room}> = ({room}) => {
  const f = useCurrentFrame();
  const {t0, fx, size} = room;
  const base: React.CSSProperties = {
    fontFamily: F.display,
    fontWeight: 900,
    fontSize: size,
    lineHeight: 0.84,
    letterSpacing: '-0.006em',
    textTransform: 'uppercase',
    paddingTop: '0.08em',
    marginTop: '-0.08em',
  };
  if (fx === 'neon') {
    const chars = [...room.title[0]];
    return (
      <div style={{...base, color: C.chalk, textShadow: f > t0 + 22 ? '0 0 50px rgba(61, 240, 216, 0.35)' : undefined}}>
        {chars.map((c, i) => {
          const start = t0 + 12 + Math.floor(random(`n${i}`) * 8);
          const o = f < start ? 0.12 : steps(f - start, NEON_ON);
          return (
            <span key={i} style={{opacity: o}}>
              {c}
            </span>
          );
        })}
      </div>
    );
  }
  const gold = fx === 'gold';
  const pos = gold ? range(f, t0 + 10, t0 + 36, 100, 0, E.inOut) : range(f, t0 + 14, t0 + 38, 100, 0, E.inOut);
  const glowK = gold ? 0 : Math.max(0, 1 - Math.abs(f - (t0 + 24)) / 12);
  const bg = gold
    ? 'linear-gradient(100deg, #F2EADF 0 38%, #fff7e0 45%, #ffd27a 49%, #2a1f14 56% 100%)'
    : 'linear-gradient(100deg, #F2EADF 0 42%, #ff8a6e 47.5%, #ff3b2f 50%, #ff8a6e 52.5%, #F2EADF 58% 100%)';
  return (
    <div style={{filter: glowK > 0 ? `drop-shadow(0 0 ${(30 * glowK).toFixed(1)}px rgba(255, 59, 47, ${0.6 * glowK}))` : undefined}}>
      {room.title.map((line) => (
        <div
          key={line}
          style={{
            ...base,
            backgroundImage: bg,
            backgroundSize: gold ? '280% 100%' : '320% 100%',
            backgroundPosition: `${pos}% 0`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

const Door: React.FC<{room: Room}> = ({room}) => {
  const f = useCurrentFrame();
  const {t0, Art} = room;
  const open = range(f, t0 + 2, t0 + 16, 0, 1, E.door);
  const inset = (1 - open) * 49.8;
  const artScale = range(f, t0 + 2, t0 + 50, 1.15, 1, E.out);
  const yp = range(f, t0 + 6, t0 + 20, 0, 1, E.inOut);
  const cols = room.from.map((a, i) => lerp(a, room.to[i], yp));
  const secret = room.secret ? range(f, t0 + 8, t0 + 15) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, background: C.ink}}>
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden', clipPath: `inset(0 ${inset}% 0 ${inset}%)`}}>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${artScale})`, transformOrigin: '50% 38%'}}>
          <Art t0={t0} />
        </div>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(7,16,26,.55) 0%, transparent 18%, transparent 42%, rgba(7,16,26,.78) 60%, rgba(7,16,26,.95) 78%, rgba(7,16,26,.98) 100%)'}} />
        <div style={{position: 'absolute', left: G, top: 250}}>
          <Year cols={cols} size={150} color={C.tungsten} secret={secret} />
          <div style={{marginTop: 12, fontFamily: F.body, fontWeight: 500, fontSize: 36, color: room.accent, opacity: range(f, t0 + 12, t0 + 20)}}>{room.place}</div>
        </div>
        <div style={{position: 'absolute', left: G - 6, right: G, bottom: 630}}>
          <Title room={room} />
        </div>
        <div style={{position: 'absolute', left: G, right: G, top: 1306, fontFamily: F.body, fontWeight: 500, fontSize: 42, lineHeight: 1.2, color: C.chalk, opacity: range(f, t0 + 16, t0 + 24), transform: `translateY(${range(f, t0 + 16, t0 + 26, 24, 0, E.out)}px)`}}>
          {room.tagline}
        </div>
        <div style={{position: 'absolute', left: G, top: 1376, display: 'flex', gap: 14}}>
          {room.chips.map((c, i) => (
            <Chip key={c} accent={room.accent} at={t0 + 20 + i * 3}>
              {c}
            </Chip>
          ))}
        </div>
      </div>
      <Slit color={room.core} glow={room.glow} opacity={1 - range(f, t0 + 5, t0 + 12)} streak={range(f, t0 - 3, t0 + 2) * (1 - range(f, t0 + 5, t0 + 14)) * 0.9} />
    </div>
  );
};

/** 1,8 – 8,4 s : un couloir de trois portes ; chacune s'ouvre sur sa salle, la caméra file de l'une à l'autre. */
const X = (i: number) => 540 + STEP * i;
const cam = ROOMS.flatMap((r, i) => {
  const t = r.t0;
  const dir = i % 2 ? 1 : -1;
  return [
    {f: t, x: X(i), y: r.focus, s: 1.6, rz: 2.5 * dir, ...(i ? {ease: E.whip} : {})},
    {f: t + 24, x: X(i), y: 960, s: 1.0, rz: 0, ease: E.inOut},
    {f: t + LEN - 10, x: X(i) - 12 * dir, y: 948, s: 1.07, rz: -0.9 * dir, ease: E.sine},
  ];
});

/** 3,6 – 9,6 s : un couloir de trois portes ; gros plan sur le détail, recul, puis la caméra file vers la suivante. */
export const Rooms: React.FC = () => (
  <AbsoluteFill style={{background: C.ink}}>
    <Handheld amp={1.2}>
      <CameraRig keys={[...cam, {f: ROOMS_LEN, x: X(2) + 1900, y: 800, s: 0.95, rz: 3, ease: E.in}]}>
        {ROOMS.map((room, i) => (
          <Place key={room.id} x={X(i)} y={960} w={1080} h={1920}>
            <Door room={room} />
          </Place>
        ))}
      </CameraRig>
    </Handheld>
  </AbsoluteFill>
);
