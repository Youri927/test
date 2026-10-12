import React from 'react';
import {AbsoluteFill, interpolateColors, useCurrentFrame} from 'remotion';
import {Line} from '../Bits';
import {END} from '../beats.ts';
import {LEN} from '../timeline';
import {BODY, C, E, F, H2, range} from '../util';

/**
 * Fin, à la nuit : le point de lumière du logotype s'allume comme sur le site (du gris au bleu, avec son halo),
 * le nom monte, puis ce qui a servi à faire le site ; fondu au noir.
 */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.End;
  const up = (at: number) => ({opacity: range(f, at, at + 26, 0, 1), transform: `translateY(${range(f, at, at + 36, 18, 0, E.out).toFixed(2)}px)`});
  const fade = range(f, len - 46, len - 4, 1, 0, E.inOut);
  const on = range(f, END.dot, END.dot + 34, 0, 1, E.soft);
  const dot = 62;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: fade, background: C.night}}>
        <div style={{position: 'absolute', left: 124, top: 282}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 40}}>
            <div
              style={{
                width: dot,
                height: dot,
                borderRadius: '50%',
                flex: 'none',
                background: interpolateColors(on, [0, 1], ['#4A566C', C.lightNight]),
                boxShadow: `0 0 0 ${dot * 0.22}px rgba(53, 80, 255, ${(0.22 * on).toFixed(3)}), 0 0 ${(dot * 1.6 * on).toFixed(1)}px rgba(53, 80, 255, ${(0.9 * on).toFixed(3)})`,
              }}
            />
            <div>
              <Line shift={range(f, END.name, END.name + 46, 112, 0, E.out)}>
                <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 96, letterSpacing: '-0.025em', lineHeight: 1, color: C.moon}}>Prestige Pools</div>
              </Line>
              <Line shift={range(f, END.name + 8, END.name + 54, 112, 0, E.out)}>
                <div style={{fontFamily: F.sans, fontSize: 34, lineHeight: 1.1, marginTop: 10, color: C.moon2}}>of Wilmington</div>
              </Line>
            </div>
          </div>
          <div style={{...H2, marginTop: 70, fontSize: 54, maxWidth: 1240, lineHeight: 1.04, color: C.moon, ...up(END.line)}}>Built from your pools, your lights and your customers’ words.</div>
          <div style={{...BODY, marginTop: 30, fontSize: 22, color: C.moon2, ...up(END.line + 40)}}>prestigepoolsofwilmington.com, website redesign concept, October 2026</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
