import React from 'react';
import {AbsoluteFill, random, Sequence, useCurrentFrame} from 'remotion';
import {CameraRig, Place} from '../../lib/camera';
import {Slit} from '../Bits';
import {C, F, G} from '../theme';
import {E, pop, range} from '../util';

export const MONTAGE_LEN = 48;
const CARD = 16;

const WALL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1080' height='1920'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.012 .02' numOctaves='5' seed='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .6 0 0 0 0 .62 0 0 0 0 .68 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E\")";

const Verb: React.FC<{children: React.ReactNode; size: number}> = ({children, size}) => {
  const f = useCurrentFrame();
  const p = pop(f, 1, 320, 18);
  return (
    <div
      style={{
        position: 'absolute',
        left: G - 8,
        top: 1080,
        fontFamily: F.display,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 0.85,
        letterSpacing: '-0.01em',
        textTransform: 'uppercase',
        color: C.chalk,
        transformOrigin: 'left center',
        transform: `scale(${1.25 - 0.25 * p})`,
        opacity: Math.min(1, p * 3),
      }}
    >
      {children}
    </div>
  );
};

/** Plan avec punch-in caméra et flash d'entrée. */
const Shot: React.FC<{children: React.ReactNode; tilt: number}> = ({children, tilt}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <CameraRig keys={[{f: 0, x: 540, y: 900, s: 1.38, rz: tilt}, {f: 8, x: 540, y: 960, s: 1.0, rz: 0, ease: E.out}, {f: CARD, s: 1.05, rz: -tilt * 0.15, ease: E.sine}]} blur={0.4}>
        <Place x={540} y={960} w={1080} h={1920}>
          {children}
        </Place>
      </CameraRig>
      <AbsoluteFill style={{background: '#fff3dc', opacity: range(f, 0, 4, 0.6, 0)}} />
    </AbsoluteFill>
  );
};

/* 1. Fouillez : la torche révèle un code griffonné sur le mur */
const Search: React.FC = () => {
  const f = useCurrentFrame();
  const tx = range(f, 0, 14, 120, 960, E.inOut);
  const mask = `radial-gradient(circle 320px at ${tx}px 690px, #000 0%, rgba(0,0,0,.85) 40%, transparent 100%)`;
  return (
    <Shot tilt={-5}>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle 700px at ${tx}px 690px, rgba(255,198,110,.12), transparent 70%)`}} />
      <div style={{position: 'absolute', inset: 0, WebkitMaskImage: mask, maskImage: mask}}>
        <div style={{position: 'absolute', inset: 0, backgroundColor: '#1a2433', backgroundImage: WALL, backgroundSize: 'cover'}} />
        <div style={{position: 'absolute', left: 150, top: 560, fontFamily: F.stencil, fontWeight: 800, fontSize: 230, letterSpacing: '0.12em', color: 'rgba(255,198,110,.92)', transform: 'rotate(-6deg)'}}>4719</div>
        <svg viewBox="0 0 200 110" preserveAspectRatio="none" style={{position: 'absolute', left: 110, top: 520, width: 860, height: 330, transform: 'rotate(-6deg)'}}>
          <path d="M18 60C10 22 70 6 118 10s82 22 72 54-80 44-124 38S22 88 18 60z" fill="none" stroke="rgba(255,198,110,.6)" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <Verb size={250}>Fouillez.</Verb>
    </Shot>
  );
};

/* 2. Réfléchissez : un mot se décrypte lettre à lettre */
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const Think: React.FC = () => {
  const f = useCurrentFrame();
  const word = 'SORTIE';
  return (
    <Shot tilt={5}>
      <div style={{position: 'absolute', left: 40, right: 40, top: 300, display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', rowGap: 26, fontFamily: F.stencil, fontWeight: 700, fontSize: 64, color: 'rgba(152,164,179,.16)', textAlign: 'center'}}>
        {Array.from({length: 63}, (_, i) => (
          <span key={i}>{LETTERS[Math.floor(random(`g${i}-${Math.floor(f / 3)}`) * 26)]}</span>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', gap: 14}}>
        {[...word].map((ch, i) => {
          const lock = 3 + i * 2;
          const locked = f >= lock;
          const c = locked ? ch : LETTERS[Math.floor(random(`w${i}-${f}`) * 26)];
          return (
            <span
              key={i}
              style={{
                width: 140,
                height: 190,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 18,
                border: `3px solid ${locked ? C.tungsten : 'rgba(242,234,223,.2)'}`,
                background: locked ? 'rgba(255,198,110,.12)' : 'rgba(255,255,255,.03)',
                fontFamily: F.display,
                fontWeight: 800,
                fontSize: 150,
                lineHeight: 1,
                color: locked ? C.tungsten : C.mist,
                textShadow: locked ? '0 0 30px rgba(255,198,110,.6)' : undefined,
              }}
            >
              {c}
            </span>
          );
        })}
      </div>
      <Verb size={170}>Réfléchissez.</Verb>
    </Shot>
  );
};

/* 3. Manipulez : le cadenas à code s'ouvre */
const DIG = Array.from({length: 10}, (_, i) => i);
const Handle: React.FC = () => {
  const f = useCurrentFrame();
  const code = [1, 9, 5, 8];
  const open = pop(f, 7, 260, 12);
  return (
    <Shot tilt={-4}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(45% 30% at 50% 40%, rgba(255,198,110,.14), transparent 70%)'}} />
      <div style={{position: 'absolute', left: 540 - 230, top: 300, width: 460, height: 680}}>
        {/* anse */}
        <div
          style={{
            position: 'absolute',
            left: 70,
            top: 0,
            width: 320,
            height: 360,
            border: '44px solid #b9c2cc',
            borderBottom: 'none',
            borderRadius: '160px 160px 0 0',
            boxShadow: 'inset 0 6px 0 rgba(255,255,255,.35)',
            transformOrigin: '20% 100%',
            transform: `translateY(${-90 * open}px) rotate(${-14 * open}deg)`,
          }}
        />
        {/* corps */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 300,
            width: 460,
            height: 380,
            borderRadius: 46,
            background: 'linear-gradient(160deg, #ffd58a 0%, #e2a347 45%, #9c6a22 100%)',
            boxShadow: 'inset 0 0 0 6px rgba(255,255,255,.18), 0 40px 80px rgba(0,0,0,.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          {code.map((d, i) => {
            const v = d * pop(f, i, 240, 17);
            return (
              <span key={i} style={{width: 86, height: 130, borderRadius: 14, background: '#1a120a', overflow: 'hidden', display: 'inline-flex', justifyContent: 'center', boxShadow: 'inset 0 10px 20px rgba(0,0,0,.7)'}}>
                <span style={{display: 'flex', flexDirection: 'column', fontFamily: F.display, fontWeight: 800, fontSize: 110, lineHeight: '130px', color: C.chalk, transform: `translateY(${-v * 130}px)`}}>
                  {DIG.map((n) => (
                    <span key={n} style={{display: 'block', height: 130}}>
                      {n}
                    </span>
                  ))}
                </span>
              </span>
            );
          })}
        </div>
      </div>
      <Verb size={230}>Manipulez.</Verb>
    </Shot>
  );
};

/** 2 – 3,6 s : ce qu'on fait dans un escape game, en trois plans éclair. */
export const Montage: React.FC = () => {
  const f = useCurrentFrame();
  const slit = range(f, 44, 48, 0, 1, E.out);
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Sequence from={0} durationInFrames={CARD} layout="none">
        <Search />
      </Sequence>
      <Sequence from={CARD} durationInFrames={CARD} layout="none">
        <Think />
      </Sequence>
      <Sequence from={CARD * 2} durationInFrames={CARD} layout="none">
        <Handle />
      </Sequence>
      {/* le cadenas s'ouvre… et une porte apparaît */}
      <AbsoluteFill style={{background: C.ink, opacity: range(f, 43, 46)}} />
      <Slit color="#e8fffb" glow="rgba(61, 240, 216, 0.9)" opacity={slit > 0 ? 1 : 0} grow={slit} streak={range(f, 44, 48) * 0.9} />
    </AbsoluteFill>
  );
};
