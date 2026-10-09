import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line, Mark, Wordmark} from '../Bits';
import {Pool} from '../Pool';
import {lineup} from '../lineup';
import {END} from '../beats.ts';
import {LEN, pre} from '../timeline';
import {BODY, C, DISPLAY, E, F, TNUM, range} from '../util';

// la gamme entière à droite, à la même échelle, comme le pied de page du site
const LINE = lineup({left: 930, top: 150, width: 860, rows: 6, gap: 3, rowGap: 34});

/** Fin : la gamme entière à la même échelle, sur l'encre du pied de page ; le nom, le téléphone, le SMS, la licence ; fondu */
export const End: React.FC = () => {
  const t = useCurrentFrame() - pre('End');
  const len = LEN.End;
  const shift = (at: number) => range(t, at, at + 50, 118, 0, E.out);
  const up = (at: number) => ({opacity: range(t, at, at + 30, 0, 1), transform: `translateY(${range(t, at, at + 40, 20, 0, E.out)}px)`});
  const out = range(t, len - 44, len - 4, 1, 0, E.inOut);
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <AbsoluteFill style={{opacity: out}}>
        {/* la gamme : les bassins se posent rangée par rangée */}
        {LINE.placed.map((it) => {
          const at = END.lineup + it.row * 7 + (it.k % 4) * 2;
          const q = range(t, at, at + 40, 0, 1, E.out);
          if (q <= 0) return null;
          return (
            <div key={it.model.id} style={{position: 'absolute', left: it.x, top: it.y + (1 - q) * 18, width: it.w, height: it.h, opacity: q}}>
              <Pool drawing={it.drawing} w={it.w} h={it.h} ppf={LINE.ppf} lines={false} drift={t * 0.06} />
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 930, top: 150 + LINE.height + 26, width: 860, fontFamily: F.sans, fontSize: 18, color: 'rgba(255,255,255,.55)', ...up(END.lineup + 50)}}>
          Every Barrier Reef pool on the new site, side by side at the same scale.
        </div>

        <div style={{position: 'absolute', left: 140, top: 150, display: 'flex', alignItems: 'center', gap: 18}}>
          <Mark size={62} p={range(t, END.mark, END.mark + 40)} />
          <div style={{overflow: 'hidden', paddingBottom: 6}}>
            <Line shift={shift(END.mark + 14)}>
              <Wordmark size={60} color={C.white} />
            </Line>
          </div>
        </div>
        <div style={{position: 'absolute', left: 142, top: 330, ...BODY, fontSize: 26, color: 'rgba(255,255,255,.7)', ...up(END.phone - 16)}}>Call, or text a photo of your pool for a free estimate</div>
        <div style={{position: 'absolute', left: 136, top: 372, ...DISPLAY, fontSize: 124, color: C.white, ...TNUM, ...up(END.phone)}}>(407) 866-7486</div>
        <div style={{position: 'absolute', left: 142, top: 520, width: 140, height: 6, borderRadius: 3, background: C.azure, transformOrigin: '0 50%', transform: `scaleX(${range(t, END.phone + 16, END.phone + 56, 0, 1, E.out)})`}} />
        <div style={{position: 'absolute', left: 142, top: 566, width: 700, fontFamily: F.sans, fontSize: 23, lineHeight: 1.65, color: 'rgba(255,255,255,.68)', ...up(END.phone + 30)}}>
          Florida State licensed pool contractor CPC1458515
          <br />
          817 Walnut Pl, Altamonte Springs, FL 32701
          <br />
          Seminole, Orange and Volusia counties
        </div>
        <div style={{position: 'absolute', left: 142, bottom: 92, fontFamily: F.sans, fontSize: 19, color: 'rgba(255,255,255,.5)', ...up(END.phone + 60)}}>graciepools.com · Website redesign concept, October 2026</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
