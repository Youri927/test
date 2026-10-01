import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {Diamond} from './Diamond';
import {Road} from './Road';
import {C, F} from './theme';
import {steps} from './util';

const STARS = Array.from({length: 150}, (_, i) => ({
  x: random(`sx${i}`) * 1080,
  y: random(`sy${i}`) * 980,
  s: random(`ss${i}`) < 0.12 ? 3 : 2,
  a: 0.2 + random(`sa${i}`) * 0.65,
  p: random(`sp${i}`) * 6.28,
}));

/** Route 66 : nuit sur le désert du Nevada, enseigne du Jeff's Diner qui s'allume. */
export const Route66Art: React.FC<{t0: number}> = ({t0}) => {
  const f = useCurrentFrame();
  const on = t0 + 12;
  const lit = f < on ? 0.1 : steps(f - on, [[0, 1], [2, 0.18], [3, 1], [5, 0.3], [6, 1], [8, 0.55], [9, 1]]) * ((f - on) % 41 === 22 ? 0.6 : 1);
  const open = f >= on + 12 ? ((f - on) % 26 < 17 ? 1 : 0.25) : 0.15;
  return (
    <AbsoluteFill style={{background: '#040b12'}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(70% 12% at 50% 54%, rgba(255, 110, 120, 0.32), transparent 70%), linear-gradient(180deg, #01060b 0%, #04111d 26%, #0b2236 42%, #2a1a3d 49%, #5c234a 53.5%, #0b1622 55.5%, #07101A 70%)',
        }}
      />
      {STARS.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            width: s.s,
            height: s.s,
            borderRadius: 4,
            background: C.chalk,
            opacity: s.a * (0.6 + 0.4 * Math.sin(f / 7 + s.p)),
          }}
        />
      ))}
      <svg viewBox="0 0 1080 260" preserveAspectRatio="none" style={{position: 'absolute', left: 0, top: 860, width: 1080, height: 200}}>
        <path d="M0 260V150l90-14 50-50h110l34 44 120 8 70-84h150l40 70 160 14 54-46h96l66 54 40 8v156z" fill="#0a1d29" />
        <path d="M0 260V196l170-10 90-24 160 22 200-14 140 18 180-22 140 16v78z" fill="#071722" />
      </svg>
      <div style={{position: 'absolute', left: 0, top: 1046}}>
        <Road width={1080} height={874} />
      </div>
      {/* reflet du néon au sol */}
      <div style={{position: 'absolute', left: 140, top: 860, width: 800, height: 420, background: 'radial-gradient(closest-side, rgba(255, 75, 110, 0.22), transparent)', opacity: lit}} />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 500,
          transform: 'translateX(-50%) rotate(-3deg)',
          padding: '30px 56px 38px',
          border: '5px solid rgba(255, 75, 110, 0.95)',
          borderRadius: 42,
          boxShadow: '0 0 8px rgba(255,75,110,.95), 0 0 34px rgba(255,75,110,.6), inset 0 0 26px rgba(255,75,110,.45), 0 0 160px rgba(255,75,110,.28)',
          textAlign: 'center',
          fontFamily: F.display,
          textTransform: 'uppercase',
          lineHeight: 0.9,
          opacity: lit,
        }}
      >
        <div style={{fontWeight: 200, fontSize: 214, letterSpacing: '0.06em', color: '#eafffb', textShadow: `0 0 4px #fff, 0 0 14px ${C.neon}, 0 0 36px ${C.neon}, 0 0 80px ${C.neon}, 0 0 140px rgba(61,240,216,.6)`}}>
          Jeff’s
        </div>
        <div style={{fontWeight: 300, fontSize: 118, letterSpacing: '0.32em', marginRight: '-0.32em', color: '#ffe9ee', textShadow: `0 0 4px #fff, 0 0 14px ${C.cherry}, 0 0 36px ${C.cherry}, 0 0 90px ${C.cherry}`}}>
          Diner
        </div>
        <div
          style={{
            position: 'absolute',
            right: -70,
            bottom: -58,
            padding: '10px 14px 8px 20px',
            border: `3px solid ${C.cherry}`,
            borderRadius: 10,
            fontWeight: 500,
            fontSize: 40,
            letterSpacing: '0.2em',
            color: '#ffe9ee',
            textShadow: `0 0 10px ${C.cherry}, 0 0 24px ${C.cherry}`,
            boxShadow: '0 0 16px rgba(255,75,110,.7), inset 0 0 12px rgba(255,75,110,.5)',
            transform: 'rotate(7deg)',
            opacity: open,
          }}
        >
          Open
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** La Planque des Corleone : Chicago 1938, lumière dorée à travers les stores, le diamant. */
export const CorleoneArt: React.FC<{t0: number}> = ({t0}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#0b0806'}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(70% 40% at 52% 34%, rgba(226,174,82,.20), transparent 70%), repeating-linear-gradient(90deg, rgba(255,255,255,.02) 0 2px, transparent 2px 150px), linear-gradient(180deg, #140d08 0%, #0d0907 55%, #07101A 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '-25% -30%',
          background: 'repeating-linear-gradient(180deg, rgba(255, 205, 120, 0.30) 0 36px, transparent 36px 70px)',
          WebkitMaskImage: 'radial-gradient(40% 32% at 52% 40%, #000 25%, transparent 78%)',
          maskImage: 'radial-gradient(40% 32% at 52% 40%, #000 25%, transparent 78%)',
          transform: `rotate(-16deg) skewX(-22deg) translateY(${f * 0.5}px)`,
          filter: 'blur(1.3px)',
          mixBlendMode: 'screen',
        }}
      />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: [300, 520, 60][i] + Math.sin(f / 46 + i * 2) * 60,
            top: [140, 520, 420][i] + Math.cos(f / 52 + i) * 40,
            width: 640,
            height: 640,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(226, 190, 140, 0.13), transparent 65%)',
            filter: 'blur(30px)',
            mixBlendMode: 'screen',
          }}
        />
      ))}
      <div style={{position: 'absolute', left: 200, top: 300}}>
        <Diamond size={680} spinStart={t0 + 6} />
      </div>
    </AbsoluteFill>
  );
};

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/** Alerte Rouge : base militaire, radar, gyrophare, compte à rebours qui file. */
export const AlerteArt: React.FC<{t0: number}> = ({t0}) => {
  const f = useCurrentFrame();
  const secs = Math.max(0, 4500 - Math.max(0, f - (t0 + 12)) * 9);
  const sweep = f * 3.2;
  const BLIPS = [[60, 0.55], [200, 0.72], [300, 0.38]];
  return (
    <AbsoluteFill style={{background: 'radial-gradient(90% 60% at 50% 34%, #2c0606 0%, #120405 52%, #07101A 100%)'}}>
      <AbsoluteFill
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(255,59,47,.07) 0 1px, transparent 1px 72px), repeating-linear-gradient(90deg, rgba(255,59,47,.07) 0 1px, transparent 1px 72px)',
          WebkitMaskImage: 'radial-gradient(70% 50% at 50% 35%, #000, transparent 85%)',
          maskImage: 'radial-gradient(70% 50% at 50% 35%, #000, transparent 85%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 540 - 430,
          top: 660 - 430,
          width: 860,
          height: 860,
          borderRadius: '50%',
          overflow: 'hidden',
          background:
            'linear-gradient(90deg, transparent calc(50% - 1px), rgba(255,59,47,.32) calc(50% - 1px) calc(50% + 1px), transparent calc(50% + 1px)), linear-gradient(0deg, transparent calc(50% - 1px), rgba(255,59,47,.32) calc(50% - 1px) calc(50% + 1px), transparent calc(50% + 1px)), repeating-radial-gradient(circle, transparent 0 calc(12.5% - 1.5px), rgba(255,59,47,.3) calc(12.5% - 1.5px) 12.5%)',
          boxShadow: '0 0 0 2px rgba(255,59,47,.38), 0 0 110px rgba(255,59,47,.18)',
        }}
      >
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(from 0deg, rgba(255,59,47,.6), rgba(255,59,47,.14) 40deg, transparent 80deg)', transform: `rotate(${sweep}deg)`}} />
        {BLIPS.map(([deg, r], i) => {
          const diff = (((sweep - deg) % 360) + 360) % 360;
          const glow = Math.max(0, 1 - diff / 120);
          const a = ((deg - 90) * Math.PI) / 180;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 430 + Math.cos(a) * 430 * r - 9,
                top: 430 + Math.sin(a) * 430 * r - 9,
                width: 18,
                height: 18,
                borderRadius: 18,
                background: '#ff6a5e',
                boxShadow: '0 0 20px 6px rgba(255,59,47,.8)',
                opacity: 0.15 + glow * 0.85,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: -400,
          top: -700,
          width: 1900,
          height: 1900,
          background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255,59,47,.22) 16deg, transparent 38deg, transparent 180deg, rgba(255,59,47,.16) 196deg, transparent 218deg)',
          mixBlendMode: 'screen',
          transform: `rotate(${f * 4.6}deg)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 548,
          textAlign: 'center',
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: 226,
          lineHeight: 1,
          letterSpacing: '0.02em',
          fontVariantNumeric: 'tabular-nums',
          color: '#ff5a4e',
          textShadow: '0 0 22px rgba(255,59,47,.9), 0 0 70px rgba(255,59,47,.5)',
        }}
      >
        {fmt(secs)}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 640,
          top: 800,
          fontFamily: F.stencil,
          fontWeight: 800,
          fontSize: 40,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'rgba(255, 90, 78, 0.85)',
          padding: '14px 22px 12px',
          border: '4px solid rgba(255, 90, 78, 0.75)',
          transform: 'rotate(-8deg)',
        }}
      >
        Accès restreint
      </div>
      <AbsoluteFill style={{background: 'radial-gradient(80% 60% at 50% 45%, transparent 40%, rgba(255, 30, 20, 0.5) 100%)', opacity: 0.18 + 0.16 * (0.5 + 0.5 * Math.sin(f * 0.42))}} />
    </AbsoluteFill>
  );
};
