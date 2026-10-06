import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ArchCover, Line, Mark, Wall, Word} from '../Bits';
import {BEAT, C, DISPLAY, E, F, LABEL, range} from '../util';

export const OPEN_LEN = 8 * BEAT;
const QUERY = 'pool remodeling scottsdale';

/** Une ligne de résultat de recherche, schématique (aucun nom réel) */
const Result: React.FC<{show: number; i: number}> = ({show, i}) => (
  <div style={{display: 'flex', gap: 18, padding: '18px 0', borderTop: `1px solid ${C.line}`, opacity: show, transform: `translateY(${(1 - show) * 18}px)`}}>
    <div style={{width: 34, height: 34, borderRadius: '50%', background: ['#B7C2CC', '#C7BBAA', '#AFC4B6', '#C2B4C8', '#B9C6D6'][i % 5], flex: 'none'}} />
    <div style={{display: 'grid', gap: 9, flex: 1}}>
      <div style={{width: `${58 + ((i * 17) % 30)}%`, height: 15, borderRadius: 4, background: 'rgba(31, 57, 109, .55)'}} />
      <div style={{width: '34%', height: 10, borderRadius: 4, background: 'rgba(15, 29, 58, .22)'}} />
      <div style={{width: '92%', height: 9, borderRadius: 4, background: 'rgba(15, 29, 58, .12)'}} />
      <div style={{width: '76%', height: 9, borderRadius: 4, background: 'rgba(15, 29, 58, .12)'}} />
    </div>
  </div>
);

/** Ouverture : « They’re comparing you. » À côté, une recherche, et des résultats qui se ressemblent tous */
export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const shift = (at: number) => range(f, at, at + 52, 118, 0, E.out);
  const fade = (at: number) => ({opacity: range(f, at, at + 30, 0, 1), transform: `translateY(${range(f, at, at + 40, 18, 0, E.out)}px)`});
  const card = range(f, 24, 80, 0, 1, E.out);
  const typed = QUERY.slice(0, Math.floor(range(f, 70, 150, 0, QUERY.length)));
  const caret = f < 150 || Math.floor(f / 18) % 2 === 0;
  const mark = range(f, 96, 140, 0, 1, E.out);
  return (
    <AbsoluteFill style={{transform: `scale(${range(f, 0, OPEN_LEN, 1, 1.035)})`}}>
      <Wall />
      <div style={{position: 'absolute', left: 150, top: 120, display: 'flex', alignItems: 'center', gap: 18, ...fade(20)}}>
        <Mark size={58} />
        <Word width={128} tone="ink" />
        <span style={{...LABEL, fontSize: 13, color: C.grey, paddingLeft: 18, borderLeft: `1px solid ${C.lineStrong}`, lineHeight: 1.35}}>Pool Remodeling<br />Scottsdale AZ</span>
      </div>
      <div style={{position: 'absolute', left: 140, top: 300, color: C.ink, ...DISPLAY, fontSize: 186}}>
        <Line shift={shift(10)}>They’re</Line>
        <Line shift={shift(20)}>comparing</Line>
        <Line shift={shift(30)}>
          <span style={{position: 'relative', display: 'inline-block', isolation: 'isolate'}}>
            <span style={{position: 'absolute', left: '-0.04em', right: '-0.06em', bottom: '0.1em', height: '0.32em', background: C.lime, transformOrigin: 'left', transform: `scaleX(${mark})`, zIndex: -1}} />
            you.
          </span>
        </Line>
      </div>
      <div style={{position: 'absolute', left: 150, top: 900, width: 860, fontFamily: F.body, fontSize: 30, lineHeight: 1.42, color: C.grey, ...fade(170)}}>
        Before a homeowner calls a pool company, they look at a few websites. The best one gets the call.
      </div>

      <div style={{position: 'absolute', left: 1110, top: 210, width: 670, padding: '30px 34px 14px', borderRadius: 30, background: C.paper, boxShadow: `0 0 0 1px ${C.line}, 0 40px 90px -30px rgba(15, 29, 58, .35)`, opacity: card, transform: `translateY(${(1 - card) * 40}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, height: 70, padding: '0 24px', borderRadius: 999, boxShadow: `inset 0 0 0 1.5px ${C.lineStrong}`, fontFamily: F.body, fontSize: 28, color: C.ink}}>
          <svg width={26} height={26} viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke={C.ink} strokeWidth="2.2" /><path d="M15.5 15.5 21 21" stroke={C.ink} strokeWidth="2.2" strokeLinecap="round" /></svg>
          <span>{typed}<span style={{display: 'inline-block', width: 2, height: 30, marginLeft: 3, verticalAlign: '-5px', background: C.ink, opacity: caret ? 1 : 0}} /></span>
        </div>
        <div style={{marginTop: 18}}>
          {[0, 1, 2, 3, 4, 5].map((i) => <Result key={i} i={i} show={range(f, 160 + i * 12, 190 + i * 12, 0, 1, E.out)} />)}
        </div>
      </div>
      <ArchCover level={range(f, OPEN_LEN - 50, OPEN_LEN, 0, 1, E.inOut)} color="#E8E1D4" />
    </AbsoluteFill>
  );
};
