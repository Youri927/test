import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {content} from '../content';
import {prog} from '../lib/anim';
import {ease} from '../lib/ease';
import {fonts} from '../lib/fonts';
import {theme} from '../theme';
import {Arrow} from './Icons';

export const PHONE_W = 1000;
export const PHONE_H = 2060;
const BEZEL = 26;
const PAD = 64;
const INNER_W = PHONE_W - BEZEL * 2 - PAD * 2;

/** Mise en page de l'écran (repère écran, px) — positions fixes pour viser les taps. */
const L = {
  header: 140,
  title: 262,
  roomLabel: 486,
  rooms: 536,
  dateLabel: 690,
  days: 740,
  slotLabel: 950,
  slots: 1000,
  slotH: 112,
  gap: 16,
  players: 1290,
  summary: 1470,
  button: 1640,
  buttonH: 170,
};
const COL_W = (INNER_W - L.gap * 2) / 3;
const SELECTED_SLOT = 4;

/** Positions (repère téléphone, origine = coin haut-gauche) des éléments tapés. */
export const PHONE_TARGETS = {
  slot: {
    x: BEZEL + PAD + (SELECTED_SLOT % 3) * (COL_W + L.gap) + COL_W / 2,
    y: BEZEL + L.slots + Math.floor(SELECTED_SLOT / 3) * (L.slotH + L.gap) + L.slotH / 2,
  },
  button: {x: PHONE_W / 2, y: BEZEL + L.button + L.buttonH / 2},
};

const label: React.CSSProperties = {
  position: 'absolute',
  left: PAD,
  fontFamily: fonts.body,
  fontWeight: 600,
  fontSize: 30,
  letterSpacing: 5,
  color: theme.colors.muted,
};

const row = (top: number): React.CSSProperties => ({position: 'absolute', left: PAD, width: INNER_W, top});

/** Mockup de téléphone avec le parcours de réservation. */
export const Phone: React.FC<{slotAt: number; pressAt: number}> = ({slotAt, pressAt}) => {
  const frame = useCurrentFrame();
  const slotOn = prog(frame, slotAt, 6, ease.out);
  const press = interpolate(frame, [pressAt - 3, pressAt, pressAt + 6], [1, 0.94, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const btnGlow = 0.5 + 0.5 * Math.sin(frame / 4);

  return (
    <div
      style={{
        width: PHONE_W,
        height: PHONE_H,
        borderRadius: 140,
        padding: BEZEL,
        boxSizing: 'border-box',
        background: 'linear-gradient(140deg, #3B342F, #0E0C0B 40%, #26211D)',
        boxShadow: '0 120px 200px rgba(0,0,0,0.7), inset 0 0 0 4px rgba(255,255,255,0.08)',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 116,
          overflow: 'hidden',
          position: 'relative',
          background: `linear-gradient(180deg, ${theme.colors.bg2}, ${theme.colors.bg})`,
        }}
      >
        {/* status bar + dynamic island */}
        <div style={{...row(0), height: 120, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: fonts.body, fontWeight: 600, fontSize: 36, color: theme.colors.text}}>
          <span>18:12</span>
          <div style={{width: 250, height: 70, borderRadius: 40, background: '#000'}} />
          <span style={{letterSpacing: 4}}>●●●</span>
        </div>

        {/* header site */}
        <div style={{...row(L.header), display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{fontFamily: fonts.display, fontSize: 64, lineHeight: 1, color: theme.colors.text, letterSpacing: 2}}>
            L'ANTRE <span style={{color: theme.colors.accent}}>2 JEUX</span>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{width: 54, height: 6, borderRadius: 3, background: theme.colors.text}} />
            ))}
          </div>
        </div>

        <div style={{...row(L.title), fontFamily: fonts.body, fontWeight: 800, fontSize: 78, lineHeight: 1.05, color: theme.colors.text}}>
          Réservez votre
          <br />
          session
        </div>

        {/* salle */}
        <div style={{...label, top: L.roomLabel}}>SALLE</div>
        <div style={{...row(L.rooms), display: 'flex', gap: 16}}>
          {['Route 66', 'Corleone', 'Alerte Rouge'].map((r, i) => (
            <div
              key={r}
              style={{
                padding: '24px 26px',
                borderRadius: 26,
                fontFamily: fonts.body,
                fontWeight: 800,
                fontSize: 32,
                whiteSpace: 'nowrap',
                background: i === 2 ? theme.colors.accent : theme.colors.surface2,
                color: i === 2 ? '#1A0F05' : theme.colors.text,
                border: `2px solid ${i === 2 ? theme.colors.accent : theme.colors.line}`,
              }}
            >
              {r}
            </div>
          ))}
        </div>

        {/* date */}
        <div style={{...label, top: L.dateLabel}}>DATE</div>
        <div style={{...row(L.days), display: 'flex', gap: 16}}>
          {content.booking.days.map((d, i) => (
            <div
              key={d.n}
              style={{
                flex: 1,
                height: 156,
                borderRadius: 28,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                background: i === 1 ? theme.colors.text : theme.colors.surface2,
                color: i === 1 ? theme.colors.bg : theme.colors.text,
                border: `2px solid ${theme.colors.line}`,
              }}
            >
              <span style={{fontFamily: fonts.body, fontWeight: 600, fontSize: 26, letterSpacing: 3, opacity: 0.75}}>{d.d}</span>
              <span style={{fontFamily: fonts.display, fontSize: 72, lineHeight: 1}}>{d.n}</span>
            </div>
          ))}
        </div>

        {/* horaires */}
        <div style={{...label, top: L.slotLabel}}>HORAIRE</div>
        <div style={{...row(L.slots), display: 'grid', gridTemplateColumns: `repeat(3, ${COL_W}px)`, gap: L.gap}}>
          {content.booking.slots.map((s, i) => {
            const on = i === SELECTED_SLOT ? slotOn : 0;
            const taken = i === 0 || i === 2;
            return (
              <div
                key={s}
                style={{
                  height: L.slotH,
                  boxSizing: 'border-box',
                  borderRadius: 26,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: fonts.body,
                  fontWeight: 800,
                  fontSize: 42,
                  color: on > 0.5 ? '#1A0F05' : taken ? 'rgba(247,239,230,0.28)' : theme.colors.text,
                  textDecoration: taken ? 'line-through' : 'none',
                  background: on > 0 ? `rgba(242,162,58,${on})` : theme.colors.surface2,
                  border: `2px solid ${on > 0 ? theme.colors.accent : theme.colors.line}`,
                  transform: `scale(${1 + 0.08 * Math.sin(on * Math.PI)})`,
                  boxShadow: on > 0 ? `0 0 40px ${theme.colors.accent}88` : 'none',
                }}
              >
                {s}
              </div>
            );
          })}
        </div>

        {/* joueurs */}
        <div style={{...label, top: L.players - 50}}>JOUEURS</div>
        <div
          style={{
            ...row(L.players),
            height: 120,
            borderRadius: 28,
            border: `2px solid ${theme.colors.line}`,
            background: theme.colors.surface2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 36px',
            boxSizing: 'border-box',
            fontFamily: fonts.body,
            fontWeight: 800,
            fontSize: 48,
            color: theme.colors.text,
          }}
        >
          <span style={{color: theme.colors.muted}}>–</span>
          <span>4</span>
          <span style={{color: theme.colors.accent}}>+</span>
        </div>

        {/* récap */}
        <div style={{...row(L.summary), display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: fonts.body, color: theme.colors.text}}>
          <span style={{fontSize: 36, fontWeight: 600, color: theme.colors.muted}}>{content.booking.summary}</span>
          <span style={{fontSize: 56, fontWeight: 800}}>100 €</span>
        </div>

        {/* bouton */}
        <div
          style={{
            ...row(L.button),
            height: L.buttonH,
            borderRadius: L.buttonH / 2,
            background: `linear-gradient(180deg, #FFC062, ${theme.colors.accent} 55%, ${theme.colors.accentDeep})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 22,
            fontFamily: fonts.body,
            fontWeight: 800,
            fontSize: 54,
            letterSpacing: 4,
            color: '#1A0F05',
            transform: `scale(${press})`,
            boxShadow: `0 20px 60px ${theme.colors.accent}${Math.round(60 + btnGlow * 80).toString(16)}`,
          }}
        >
          RÉSERVER
          <Arrow size={56} color="#1A0F05" />
        </div>

        {/* barre home */}
        <div style={{position: 'absolute', bottom: 22, left: '50%', width: 300, height: 10, marginLeft: -150, borderRadius: 5, background: 'rgba(255,255,255,0.5)'}} />
      </div>
    </div>
  );
};

/** Doigt / indicateur de tap (cercle + onde) — `taps` = frames des appuis. */
export const Tap: React.FC<{taps: number[]; x: number; y: number; opacity?: number}> = ({taps, x, y, opacity = 1}) => {
  const frame = useCurrentFrame();
  const down = Math.min(
    ...taps.map((at) => interpolate(frame, [at - 4, at, at + 5], [1, 0.72, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})),
  );
  const last = [...taps].reverse().find((at) => frame >= at);
  const ring = last === undefined ? 0 : prog(frame, last, 16, ease.out);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, opacity}}>
      <div
        style={{
          position: 'absolute',
          left: -110,
          top: -110,
          width: 220,
          height: 220,
          borderRadius: 999,
          border: `8px solid rgba(255,255,255,${0.9 * (1 - ring)})`,
          transform: `scale(${0.4 + ring * 1.3})`,
          opacity: last === undefined ? 0 : 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -62,
          top: -62,
          width: 124,
          height: 124,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.85)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.45)',
          border: '6px solid rgba(0,0,0,0.12)',
          transform: `scale(${down})`,
        }}
      />
    </div>
  );
};
