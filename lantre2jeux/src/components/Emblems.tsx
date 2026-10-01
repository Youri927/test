import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {fonts} from '../lib/fonts';
import {theme} from '../theme';

const Rays: React.FC<{color: string; count?: number; rot: number; opacity?: number}> = ({color, count = 18, rot, opacity = 0.18}) => (
  <svg width="1400" height="1400" viewBox="-700 -700 1400 1400" style={{position: 'absolute', left: -700, top: -700, opacity}}>
    <g transform={`rotate(${rot})`}>
      {new Array(count).fill(0).map((_, i) => (
        <path key={i} d="M0 0 L-60 -700 L60 -700 Z" fill={color} transform={`rotate(${(360 / count) * i})`} />
      ))}
    </g>
  </svg>
);

/** Route 66 : bouclier routier US + soleil rétro. */
export const Route66: React.FC<{t: number}> = ({t}) => {
  const frame = useCurrentFrame();
  const c = theme.rooms.route66;
  return (
    <div style={{position: 'relative', width: 0, height: 0}}>
      <Rays color={c.tint} rot={frame * 0.4} opacity={0.22} />
      <svg width="420" height="460" viewBox="0 0 210 230" style={{position: 'absolute', left: -210, top: -240, transform: `scale(${t})`, filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.55))'}}>
        <path
          d="M18 26 C60 8 80 22 105 6 C130 22 150 8 192 26 C196 60 194 92 186 120 C176 168 140 198 105 222 C70 198 34 168 24 120 C16 92 14 60 18 26 Z"
          fill="#F6F1E7"
          stroke="#111"
          strokeWidth="9"
        />
        <path d="M24 66 H186" stroke="#111" strokeWidth="7" />
        <text x="105" y="56" textAnchor="middle" fontFamily={fonts.display} fontSize="34" letterSpacing="5" fill="#111">
          ROUTE
        </text>
        <text x="105" y="178" textAnchor="middle" fontFamily={fonts.display} fontSize="118" fill="#111">
          66
        </text>
      </svg>
      <div
        style={{
          position: 'absolute',
          left: -300,
          width: 600,
          top: 196,
          textAlign: 'center',
          fontFamily: fonts.display,
          fontSize: 54,
          letterSpacing: 10,
          color: c.tint2,
          textShadow: `0 0 22px ${c.tint2}`,
          opacity: interpolate(Math.sin(frame * 0.9), [-1, 1], [0.75, 1]) * t,
        }}
      >
        ★ DINER · 1958 ★
      </div>
    </div>
  );
};

/** La Planque des Corleone : diamant facetté. */
export const Diamond: React.FC<{t: number}> = ({t}) => {
  const frame = useCurrentFrame();
  const c = theme.rooms.corleone;
  const glint = (i: number) => Math.max(0, Math.sin(frame / 7 + i * 2.1));
  return (
    <div style={{position: 'relative', width: 0, height: 0}}>
      <Rays color={c.tint} rot={-frame * 0.35} count={24} opacity={0.16} />
      <svg width="460" height="400" viewBox="0 0 200 174" style={{position: 'absolute', left: -230, top: -210, transform: `scale(${t}) rotate(${Math.sin(frame / 18) * 3}deg)`, filter: `drop-shadow(0 0 40px ${c.tint}88)`}}>
        <defs>
          <linearGradient id="dg1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFDF5" />
            <stop offset="0.5" stopColor="#F3D88E" />
            <stop offset="1" stopColor="#A67C2E" />
          </linearGradient>
          <linearGradient id="dg2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF7DC" />
            <stop offset="1" stopColor="#C89A3F" />
          </linearGradient>
        </defs>
        <polygon points="45,10 155,10 196,58 4,58" fill="url(#dg2)" />
        <polygon points="4,58 196,58 100,170" fill="url(#dg1)" />
        <g stroke="rgba(90,60,10,0.55)" strokeWidth="1.6" fill="none">
          <polyline points="45,10 70,58 100,10 130,58 155,10" />
          <polyline points="4,58 70,58 100,170 130,58 196,58" />
          <line x1="45" y1="10" x2="4" y2="58" />
          <line x1="155" y1="10" x2="196" y2="58" />
          <line x1="70" y1="58" x2="40" y2="80" />
        </g>
        <polygon points="70,58 100,10 130,58" fill="rgba(255,255,255,0.45)" />
        <polygon points="100,170 70,58 100,58" fill="rgba(255,255,255,0.25)" />
      </svg>
      {[
        [-170, -170, 46],
        [190, -120, 36],
        [150, 130, 30],
        [-190, 90, 26],
      ].map(([x, y, s], i) => (
        <svg key={i} width={s * 2} height={s * 2} viewBox="-10 -10 20 20" style={{position: 'absolute', left: x - s, top: y - s, opacity: glint(i) * t, transform: `scale(${0.4 + glint(i) * 0.8})`}}>
          <path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill="#FFF6D8" />
        </svg>
      ))}
    </div>
  );
};

/** Alerte Rouge : minuteur de bombe + gyrophare. */
export const BombTimer: React.FC<{t: number; start: number}> = ({t, start}) => {
  const frame = useCurrentFrame();
  const c = theme.rooms.alerte;
  const elapsed = Math.max(0, frame - start);
  const total = 59.99 - elapsed / 30;
  const ss = Math.floor(total);
  const cs = Math.floor((total - ss) * 100);
  const blink = Math.floor(frame / 6) % 2 === 0;
  return (
    <div style={{position: 'relative', width: 0, height: 0}}>
      {/* gyrophare */}
      <div
        style={{
          position: 'absolute',
          left: -700,
          top: -700,
          width: 1400,
          height: 1400,
          background: `conic-gradient(from ${frame * 9}deg, transparent 0deg, ${c.tint}66 30deg, transparent 70deg, transparent 180deg, ${c.tint}66 210deg, transparent 250deg)`,
          opacity: 0.8,
        }}
      />
      <div style={{position: 'absolute', left: -300, top: -170, width: 600, height: 340, transform: `scale(${t})`}}>
        {/* bâtons */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 40 + i * 180,
              top: 24,
              width: 160,
              height: 300,
              borderRadius: 26,
              background: 'linear-gradient(90deg, #6E1512, #C7362D 45%, #7D1814)',
              boxShadow: 'inset 0 0 0 4px rgba(0,0,0,0.25)',
            }}
          />
        ))}
        <div style={{position: 'absolute', left: 20, right: 20, top: 120, height: 26, background: '#1a1a1a'}} />
        <div style={{position: 'absolute', left: 20, right: 20, top: 250, height: 26, background: '#1a1a1a'}} />
        {/* écran */}
        <div
          style={{
            position: 'absolute',
            left: 70,
            top: 92,
            width: 460,
            height: 160,
            borderRadius: 22,
            background: '#120707',
            border: '8px solid #2A2A2A',
            boxShadow: `0 0 60px ${c.tint}66, inset 0 0 30px rgba(226,49,43,0.25)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: fonts.display,
            fontSize: 132,
            letterSpacing: 6,
            color: '#FF3B30',
            textShadow: '0 0 18px #FF3B30',
          }}
        >
          00:{String(ss).padStart(2, '0')}
          <span style={{fontSize: 70, marginLeft: 6, marginTop: 34}}>.{String(cs).padStart(2, '0')}</span>
        </div>
        {/* LED */}
        <div
          style={{
            position: 'absolute',
            left: 510,
            top: 64,
            width: 36,
            height: 36,
            borderRadius: 40,
            background: blink ? '#FF3B30' : '#3A0C0A',
            boxShadow: blink ? '0 0 30px 8px #FF3B30' : 'none',
          }}
        />
        {/* fils */}
        <svg width="600" height="340" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <path d="M90 250 C 40 330, 160 360, 200 300" stroke="#E2312B" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M300 252 C 300 340, 420 360, 430 290" stroke="#2F7DE1" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M510 250 C 590 320, 560 380, 470 330" stroke="#F2C230" strokeWidth="10" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};
