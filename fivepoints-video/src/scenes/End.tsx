import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {StarPaths} from '../Bits';
import {END} from '../beats.ts';
import {LEN} from '../timeline';
import {BODY, C, E, F, range} from '../util';

/** la courbe par défaut des transitions CSS (ease), celle du fondu des mots et de l'étoile sur le site */
const CSS_EASE = Easing.bezier(0.25, 0.1, 0.25, 1);

/** Le toit de mots de l'accueil (src/index.html du site), dessiné en 1300 px de large : 1 unité du dessin = 13/12 px */
const GW = 1300;
const GK = GW / 1200;
const GTOP = 300;

/**
 * Fin, sur l'asphalte du pied de page du site : le toit de l'accueil revient, aux mêmes temps que sur le site. Les deux
 * rampants dorés se tracent des avant-toits au faîte (1 s) ; 0,3 s après, « Roofing is in our blood » monte les deux
 * pentes ; 0,75 s après, l'étoile du logo se pose au faîte en tournant d'une pointe. Sous le toit, l'adresse du site ;
 * fondu au noir.
 */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.End;
  const t0 = END.rakes;
  const up = (at: number) => ({opacity: range(f, at, at + 26, 0, 1), transform: `translateY(${range(f, at, at + 36, 18, 0, E.out).toFixed(2)}px)`});
  const fade = range(f, len - 46, len - 4, 1, 0, E.inOut);
  // les rampants : 1 s, courbe du site (--ease)
  const rake = range(f, t0, t0 + 60, 0, 1, E.out);
  // les mots : l'opacité en 0,6 s, la montée en 1,1 s, 0,3 s après les rampants
  const wordsOn = range(f, t0 + 18, t0 + 18 + 36, 0, 1, CSS_EASE);
  const wordsUp = range(f, t0 + 18, t0 + 18 + 66, 0, 1, E.out);
  // l'étoile : l'opacité en 0,4 s, le tour en 1 s, 0,75 s après les rampants
  const starOn = range(f, t0 + 45, t0 + 45 + 24, 0, 1, CSS_EASE);
  const starIn = range(f, t0 + 45, t0 + 45 + 60, 0, 1, E.out);
  const word = (dx: number): React.CSSProperties => ({opacity: wordsOn, transform: `translate(${(dx * (1 - wordsUp)).toFixed(3)}px, ${(20 * (1 - wordsUp)).toFixed(3)}px)`});
  const wordStyle: React.CSSProperties = {fontFamily: F.sans, fontSize: 119, fontWeight: 800, fontStretch: '62.5%', fill: C.membrane};
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: fade, background: C.asphalt}}>
        <svg width={GW} height={440 * GK} viewBox="0 0 1200 440" style={{position: 'absolute', left: (1920 - GW) / 2, top: GTOP, overflow: 'visible'}}>
          <defs>
            <path id="end-rake-l" d="M58 395 L548 150" />
            <path id="end-rake-r" d="M652 150 L1142 395" />
          </defs>
          {['M40 430 L600 150', 'M1160 430 L600 150'].map((d) => (
            <path key={d} d={d} fill="none" stroke={C.gold} strokeWidth={9} strokeDasharray={627} strokeDashoffset={(627 * (1 - rake)).toFixed(2)} />
          ))}
          <text style={{...wordStyle, ...word(-40)}}>
            <textPath href="#end-rake-l" startOffset="50%" textAnchor="middle">
              ROOFING IS IN
            </textPath>
          </text>
          <text style={{...wordStyle, ...word(40)}}>
            <textPath href="#end-rake-r" startOffset="50%" textAnchor="middle">
              OUR BLOOD.
            </textPath>
          </text>
          <g transform="translate(538 14) scale(1.24)">
            <g
              style={{
                transformBox: 'fill-box',
                transformOrigin: '50% 54%',
                opacity: starOn,
                transform: `rotate(${(-72 * (1 - starIn)).toFixed(3)}deg) scale(${(0.62 + 0.38 * starIn).toFixed(4)})`,
              }}
            >
              <StarPaths ink={C.membrane} bg={C.asphalt} />
            </g>
          </g>
        </svg>
        {/* sous le toit, comme le titre de l'accueil */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 628, textAlign: 'center'}}>
          <div style={{...BODY, fontWeight: 600, fontSize: 46, lineHeight: 1.1, color: C.membrane, letterSpacing: '0.005em', ...up(END.url)}}>fivepointsroofingfl.com</div>
          <div style={{...BODY, marginTop: 14, fontSize: 23, color: C.onDark2, ...up(END.url + 14)}}>Website redesign concept, October 2026</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
