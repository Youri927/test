import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line, Logo, Wall, WipeCover} from '../Bits';
import {BEAT, C, DISPLAY, E, F, range} from '../util';

export const OPEN_LEN = 8 * BEAT;
const QUERY = 'dentist naples fl';

/** Une ligne de résultat de recherche, schématique (aucun nom réel) */
const Result: React.FC<{show: number; i: number}> = ({show, i}) => (
  <div style={{display: 'flex', gap: 18, padding: '18px 0', borderTop: `1px solid ${C.line}`, opacity: show, transform: `translateY(${(1 - show) * 18}px)`}}>
    <div style={{width: 34, height: 34, borderRadius: '50%', background: ['#B7C6D2', '#C9D3DB', '#AFC2CF', '#C3CCD6', '#B9C8D6'][i % 5], flex: 'none'}} />
    <div style={{display: 'grid', gap: 9, flex: 1}}>
      <div style={{width: `${58 + ((i * 17) % 30)}%`, height: 15, borderRadius: 4, background: 'rgba(42, 115, 163, .55)'}} />
      <div style={{width: '34%', height: 10, borderRadius: 4, background: 'rgba(14, 34, 51, .2)'}} />
      <div style={{display: 'flex', gap: 4}}>{[0, 1, 2, 3, 4].map((s) => <div key={s} style={{width: 12, height: 12, borderRadius: 2, background: s < 4 + (i % 2) ? 'rgba(229, 162, 58, .75)' : 'rgba(14, 34, 51, .15)'}} />)}</div>
      <div style={{width: '92%', height: 9, borderRadius: 4, background: 'rgba(14, 34, 51, .1)'}} />
    </div>
  </div>
);

/** Ouverture : « Before they book, they look you up. » À côté, une recherche, et des résultats qui se ressemblent */
export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const shift = (at: number) => range(f, at, at + 52, 118, 0, E.out);
  const fade = (at: number) => ({opacity: range(f, at, at + 30, 0, 1), transform: `translateY(${range(f, at, at + 40, 18, 0, E.out)}px)`});
  const card = range(f, 24, 80, 0, 1, E.out);
  const typed = QUERY.slice(0, Math.floor(range(f, 70, 140, 0, QUERY.length)));
  const caret = f < 140 || Math.floor(f / 18) % 2 === 0;
  const mark = range(f, 96, 140, 0, 1, E.out);
  return (
    <AbsoluteFill style={{transform: `scale(${range(f, 0, OPEN_LEN, 1, 1.035)})`}}>
      <Wall tint={C.paper} />
      <div style={{position: 'absolute', left: 150, top: 116, ...fade(20)}}>
        <Logo size={64} />
      </div>
      <div style={{position: 'absolute', left: 140, top: 300, color: C.ink, ...DISPLAY, fontSize: 168}}>
        <Line shift={shift(10)}>Before they</Line>
        <Line shift={shift(20)}>book, they</Line>
        <Line shift={shift(30)}>
          <span style={{position: 'relative', display: 'inline-block', isolation: 'isolate'}}>
            <span style={{position: 'absolute', left: '-0.03em', right: '-0.05em', bottom: '0.08em', height: '0.28em', background: C.sky, transformOrigin: 'left', transform: `scaleX(${mark})`, zIndex: -1}} />
            look you up.
          </span>
        </Line>
      </div>
      <div style={{position: 'absolute', left: 150, top: 880, width: 880, fontFamily: F.body, fontSize: 30, lineHeight: 1.42, color: C.grey, ...fade(170)}}>
        New patients compare a few dentists online. They look for proof, warmth, and an easy way to book.
      </div>

      <div style={{position: 'absolute', left: 1110, top: 210, width: 670, padding: '30px 34px 14px', borderRadius: 24, background: C.paper, boxShadow: `0 0 0 1px ${C.line}, 0 40px 90px -30px rgba(14, 34, 51, .3)`, opacity: card, transform: `translateY(${(1 - card) * 40}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, height: 70, padding: '0 24px', borderRadius: 999, boxShadow: `inset 0 0 0 1.5px ${C.lineStrong}`, fontFamily: F.body, fontSize: 28, color: C.ink}}>
          <svg width={26} height={26} viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke={C.ink} strokeWidth="2.2" /><path d="M15.5 15.5 21 21" stroke={C.ink} strokeWidth="2.2" strokeLinecap="round" /></svg>
          <span>{typed}<span style={{display: 'inline-block', width: 2, height: 30, marginLeft: 3, verticalAlign: '-5px', background: C.ink, opacity: caret ? 1 : 0}} /></span>
        </div>
        <div style={{marginTop: 18}}>
          {[0, 1, 2, 3, 4, 5].map((i) => <Result key={i} i={i} show={range(f, 150 + i * 12, 180 + i * 12, 0, 1, E.out)} />)}
        </div>
      </div>
      <WipeCover level={range(f, OPEN_LEN - 50, OPEN_LEN, 0, 1, E.inOut)} color={C.bg} />
    </AbsoluteFill>
  );
};
