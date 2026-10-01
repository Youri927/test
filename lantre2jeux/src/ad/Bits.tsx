import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, F} from './theme';
import {clamp, pop, range} from './util';

/** Pastille d'info (genre, durée, niveau). */
export const Chip: React.FC<{children: React.ReactNode; accent: string; at: number}> = ({children, accent, at}) => {
  const f = useCurrentFrame();
  const p = pop(f, at, 260, 15);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '14px 26px 12px',
        borderRadius: 999,
        border: `2px solid ${accent}`,
        background: 'rgba(7, 16, 26, 0.6)',
        color: C.chalk,
        fontFamily: F.body,
        fontWeight: 600,
        fontSize: 32,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        transform: `scale(${p})`,
        opacity: Math.min(1, p * 2),
      }}
    >
      {children}
    </span>
  );
};

/** Logotype L'ANTRE 2 JEUX (le 2 en pochoir). */
export const Wordmark: React.FC<{size: number; color: string; two: string}> = ({size, color, two}) => (
  <div style={{display: 'inline-flex', alignItems: 'baseline', gap: '0.16em', fontFamily: F.display, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: '0.02em', textTransform: 'uppercase', color}}>
    <span>L’Antre</span>
    <span style={{fontFamily: F.stencil, fontWeight: 900, color: two}}>2</span>
    <span>Jeux</span>
  </div>
);

const STAR = 'M12 1.8l3.1 6.6 7.1.9-5.2 4.9 1.4 7.1L12 17.8l-6.4 3.5 1.4-7.1L1.8 9.3l7.1-.9z';
/** Étoiles qui se remplissent jusqu'à `value` / 5. */
export const Stars: React.FC<{value: number; size: number; gap: number}> = ({value, size, gap}) => (
  <div style={{display: 'flex', gap}}>
    {[0, 1, 2, 3, 4].map((i) => {
      const fill = Math.max(0, Math.min(1, value - i));
      return (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <defs>
            <linearGradient id={`st${i}-${Math.round(fill * 100)}`}>
              <stop offset={fill} stopColor={C.tungsten} />
              <stop offset={fill} stopColor="rgba(242, 234, 223, 0.16)" />
            </linearGradient>
          </defs>
          <path d={STAR} fill={`url(#st${i}-${Math.round(fill * 100)})`} />
        </svg>
      );
    })}
  </div>
);

/** Barillet de cadenas à code : `sel` flottant (0 = 3 joueurs … 3 = 6 joueurs). */
export const LockDrum: React.FC<{sel: number; width: number; height: number}> = ({sel, width, height}) => {
  const step = 44;
  const radius = height * 0.36;
  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        borderRadius: 40,
        perspective: 900,
        overflow: 'hidden',
        background: 'linear-gradient(90deg, rgba(0,0,0,.55), transparent 22%, transparent 78%, rgba(0,0,0,.55)), linear-gradient(180deg, #02070c 0%, #1b2a3c 50%, #02070c 100%)',
        boxShadow: 'inset 0 0 0 2px rgba(242, 234, 223, 0.09), 0 40px 80px -24px rgba(0, 0, 0, 0.85)',
      }}
    >
      {[0, 1].map((side) => (
        <div
          key={side}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            [side ? 'right' : 'left']: 0,
            width: 18,
            zIndex: 2,
            background: 'repeating-linear-gradient(180deg, rgba(242,234,223,.14) 0 3px, transparent 3px 10px)',
            transform: `translateY(${(sel * 26) % 10}px)`,
          }}
        />
      ))}
      <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateX(${sel * step}deg)`}}>
        {[3, 4, 5, 6].map((n, i) => {
          const d = Math.abs(i - sel);
          return (
            <div
              key={n}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '50%',
                height: height * 0.42,
                marginTop: -height * 0.21,
                display: 'grid',
                placeItems: 'center',
                fontFamily: F.display,
                fontWeight: 900,
                fontSize: height * 0.44,
                lineHeight: 1,
                color: C.chalk,
                backfaceVisibility: 'hidden',
                opacity: interpolate(d, [0, 1, 2], [1, 0.22, 0.05], clamp),
                transform: `rotateX(${-i * step}deg) translateZ(${radius}px)`,
              }}
            >
              {n}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 22,
          right: 22,
          top: '50%',
          height: height * 0.44,
          transform: 'translateY(-50%)',
          borderTop: `3px solid rgba(255, 198, 110, 0.6)`,
          borderBottom: `3px solid rgba(255, 198, 110, 0.6)`,
          zIndex: 3,
        }}
      />
    </div>
  );
};

/** Doigt qui tape (cercle + onde). */
export const Tap: React.FC<{at: number; x: number; y: number}> = ({at, x, y}) => {
  const f = useCurrentFrame();
  const show = range(f, at - 10, at - 4);
  const press = interpolate(f, [at - 4, at, at + 6], [1, 0.72, 1], clamp);
  const ring = range(f, at, at + 18);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, opacity: show * (1 - range(f, at + 16, at + 26))}}>
      <div
        style={{
          position: 'absolute',
          left: -120,
          top: -120,
          width: 240,
          height: 240,
          borderRadius: 999,
          border: `7px solid rgba(7, 16, 26, ${0.8 * (1 - ring)})`,
          transform: `scale(${0.35 + ring * 1.2})`,
          opacity: f >= at ? 1 : 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -58,
          top: -58,
          width: 116,
          height: 116,
          borderRadius: 999,
          background: 'rgba(255, 255, 255, 0.82)',
          boxShadow: '0 14px 40px rgba(0, 0, 0, 0.35)',
          transform: `scale(${press})`,
        }}
      />
    </div>
  );
};

/** Fente de lumière d'une porte + reflet anamorphique horizontal. */
export const Slit: React.FC<{color: string; glow: string; opacity: number; grow?: number; streak?: number}> = ({color, glow, opacity, grow = 1, streak = 0}) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: 4,
        marginLeft: -2,
        background: color,
        boxShadow: `0 0 18px 5px ${glow}, 0 0 90px 26px ${glow.replace(/[\d.]+\)$/, '0.35)')}, 0 0 260px 80px ${glow.replace(/[\d.]+\)$/, '0.14)')}`,
        transform: `scaleY(${grow})`,
        opacity,
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: '-10%',
        right: '-10%',
        top: '50%',
        height: 6,
        marginTop: -3,
        background: `linear-gradient(90deg, transparent, ${glow} 30%, #ffffff 50%, ${glow} 70%, transparent)`,
        filter: 'blur(1.5px)',
        boxShadow: `0 0 30px 8px ${glow.replace(/[\d.]+\)$/, '0.4)')}`,
        opacity: streak,
      }}
    />
  </>
);
