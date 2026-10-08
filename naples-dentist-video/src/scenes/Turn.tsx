import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line, Smile, type Rect} from '../Bits';
import {pre} from '../timeline';
import {C, DISPLAY, E, range} from '../util';

const FS = 172;
const LEFT = 150;
const TOP = 250;
const LH = FS * 0.88;
// la pastille du sourire, au début de la deuxième ligne, comme dans le titre du site (2,12 × 0,78 em)
const PW = 2.12 * FS;
const PH = 0.78 * FS;
const GAP = 0.24 * FS;
const PILL_TOP = TOP + LH + 0.16 * FS;

/** Position de la pastille à l'écran : l'accueil s'ouvre depuis elle */
export const TURN_PILL: Rect = {x: LEFT + PW / 2, y: PILL_TOP + PH / 2, w: PW, h: PH};

/** La bascule : sur le turquoise du cabinet, le nouveau site commence par le sourire du Dr. Fakhoury */
export const Turn: React.FC = () => {
  const t = useCurrentFrame() - pre('Turn');
  const shift = (at: number) => range(t, at, at + 46, 118, 0, E.out);
  // la pastille s'ouvre depuis son centre, comme sur le site (inset 46 % → 0)
  const open = range(t, 22, 22 + 80, 0, 1, E.out);
  const rise = range(t, 8, 8 + 50, 108, 0, E.out);
  return (
    <AbsoluteFill style={{background: C.teal}}>
      <div style={{position: 'absolute', left: LEFT, top: TOP, ...DISPLAY, fontSize: FS, color: C.ink}}>
        <Line shift={shift(0)}>The new site</Line>
        <Line shift={shift(8)}>
          <span style={{display: 'inline-block', width: PW + GAP}} />
          starts with
        </Line>
        <Line shift={shift(16)}>his smile</Line>
      </div>
      <div style={{position: 'absolute', left: LEFT, top: PILL_TOP, width: PW, height: PH, overflow: 'hidden', clipPath: `inset(0 ${(1 - open) * 46}% round ${PH}px)`}}>
        <div style={{transform: `translateY(${rise}%)`}}>
          <Smile w={PW} h={PH} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
