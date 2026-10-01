import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Room} from '../content';
import {pop, prog} from '../lib/anim';
import {ease} from '../lib/ease';
import {fonts} from '../lib/fonts';
import {theme} from '../theme';
import {BombTimer, Diamond, Route66} from './Emblems';
import {Star} from './Icons';
import {FadeUp, Reveal} from './Type';

export const CARD_W = 880;
export const CARD_H = 1100;

/** Carte "salle" façon site — `t0` = frame où la caméra arrive dessus. */
export const RoomCard: React.FC<{room: Room; index: number; t0: number}> = ({room, index, t0}) => {
  const frame = useCurrentFrame();
  const tint = theme.rooms[room.id].tint;
  const tint2 = theme.rooms[room.id].tint2;
  const em = pop(frame, t0 - 2, 170, 13);
  const lvl = prog(frame, t0 + 12, 16, ease.out);
  const rate = prog(frame, t0 + 12, 18, ease.out);
  const titleSize = room.title.length > 1 ? 112 : 150;
  const shown = 3.5 + rate * (room.rating - 3.5);

  const emblem =
    room.id === 'route66' ? <Route66 t={em} /> : room.id === 'corleone' ? <Diamond t={em} /> : <BombTimer t={em} start={t0} />;

  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        borderRadius: 48,
        overflow: 'hidden',
        background: theme.colors.surface,
        border: `2px solid ${theme.colors.line}`,
        boxShadow: `0 80px 140px rgba(0,0,0,0.65), 0 0 0 1px ${tint}33, 0 0 120px ${tint}22`,
        position: 'relative',
      }}
    >
      {/* visuel */}
      <div
        style={{
          position: 'relative',
          height: 540,
          overflow: 'hidden',
          background: `radial-gradient(80% 80% at 50% 45%, ${tint2}cc 0%, ${theme.colors.bg} 85%)`,
        }}
      >
        <div style={{position: 'absolute', left: '50%', top: '53%', transform: 'scale(0.8)'}}>{emblem}</div>
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: 40,
            fontFamily: fonts.display,
            fontSize: 64,
            color: theme.colors.text,
            opacity: 0.9,
            letterSpacing: 2,
          }}
        >
          0{index + 1}
          <span style={{color: theme.colors.muted, fontSize: 40}}> / 03</span>
        </div>
        <div
          style={{
            position: 'absolute',
            right: 40,
            top: 46,
            padding: '12px 26px',
            borderRadius: 999,
            background: tint,
            color: '#120C08',
            fontFamily: fonts.body,
            fontWeight: 800,
            fontSize: 30,
            letterSpacing: 4,
            transform: `scale(${pop(frame, t0 + 4)})`,
          }}
        >
          {room.tag}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 160, background: `linear-gradient(transparent, ${theme.colors.surface})`}} />
      </div>

      {/* texte */}
      <div style={{padding: '8px 56px 0'}}>
        {room.title.map((line, i) => (
          <Reveal key={line} at={t0 + i * 4} dur={14}>
            <div style={{fontFamily: fonts.display, fontSize: titleSize, lineHeight: 0.95, color: theme.colors.text, letterSpacing: 2}}>{line}</div>
          </Reveal>
        ))}
        <FadeUp at={t0 + 8} style={{marginTop: 14}}>
          <div style={{fontFamily: fonts.body, fontSize: 36, lineHeight: 1.3, color: theme.colors.muted, fontWeight: 400}}>{room.pitch}</div>
        </FadeUp>
      </div>

      {/* pied */}
      <div
        style={{
          position: 'absolute',
          left: 56,
          right: 56,
          bottom: 44,
          paddingTop: 30,
          borderTop: `2px solid ${theme.colors.line}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <div style={{fontFamily: fonts.body, fontWeight: 600, fontSize: 24, letterSpacing: 5, color: theme.colors.muted}}>NIVEAU</div>
          <div style={{display: 'flex', gap: 10, marginTop: 14}}>
            {[0, 1, 2, 3].map((i) => {
              const on = interpolate(lvl * 4, [i, i + 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              const active = i < room.levelN;
              return (
                <div key={i} style={{width: 66, height: 18, borderRadius: 9, background: 'rgba(255,255,255,0.12)', overflow: 'hidden'}}>
                  <div style={{width: `${active ? on * 100 : 0}%`, height: '100%', background: tint, boxShadow: `0 0 16px ${tint}`}} />
                </div>
              );
            })}
          </div>
          <div style={{fontFamily: fonts.body, fontWeight: 800, fontSize: 32, color: theme.colors.text, marginTop: 14, letterSpacing: 2}}>{room.level}</div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={{display: 'flex', gap: 4, justifyContent: 'flex-end'}}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} size={40} color={theme.colors.accent} fill={Math.max(0, Math.min(1, rate * room.rating - i))} />
            ))}
          </div>
          <div style={{fontFamily: fonts.display, fontSize: 96, lineHeight: 1, color: theme.colors.text, marginTop: 6, opacity: Math.min(1, rate * 4)}}>
            {shown.toFixed(1).replace('.', ',')}
            <span style={{fontSize: 48, color: theme.colors.muted}}>/5</span>
          </div>
        </div>
      </div>
    </div>
  );
};
