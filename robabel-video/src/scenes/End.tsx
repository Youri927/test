import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line, Lockup} from '../Bits';
import {HeroScene, PALMS} from '../HeroScene';
import {END} from '../beats.ts';
import {LEN} from '../timeline';
import {BODY, C, E, F, range} from '../util';

/**
 * Fin, en miroir de l'ouverture : la photo de l'accueil, allumée ; la piscine s'éteint, puis les palmiers un à un,
 * puis la maison, pendant que le nom revient, avec ce sur quoi le site est construit ; fondu au noir.
 */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.End;
  const off = (at: number, d = 30) => 1 - E.inOut(range(f, at, at + d));
  const lit = {
    pool: off(END.pool, 60),
    palms: Array.from({length: PALMS}, (_, k) => off(END.palms + (PALMS - 1 - k) * END.palmStep, 24)),
    house: off(END.house, 34),
  };
  const up = (at: number) => ({opacity: range(f, at, at + 30, 0, 1), transform: `translateY(${range(f, at, at + 40, 18, 0, E.out)}px)`});
  const fade = range(f, len - 50, len - 4, 1, 0, E.inOut);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: fade}}>
        <HeroScene lit={lit} zoom={1.06 - 0.04 * E.sine(range(f, 0, len))} />
        <AbsoluteFill style={{background: C.night, opacity: 0.5 * range(f, END.name - 20, END.name + 60, 0, 1, E.sine)}} />
        <div style={{position: 'absolute', left: 132, top: 300}}>
          <Line shift={range(f, END.name, END.name + 56, 112, 0, E.out)}>
            <Lockup size={168} />
          </Line>
          <div style={{...BODY, marginTop: 34, fontSize: 44, fontWeight: 500, color: 'rgba(255,255,255,.92)', ...up(END.line)}}>
            Built with your photos, your film and your pages.
          </div>
          <div style={{width: 120, height: 5, borderRadius: 3, marginTop: 26, background: C.azure, transformOrigin: '0 50%', transform: `scaleX(${E.out(range(f, END.line + 12, END.line + 52))})`}} />
        </div>
        <div style={{position: 'absolute', left: 134, bottom: 86, fontFamily: F.sans, fontSize: 22, color: 'rgba(255,255,255,.6)', ...up(END.line + 50)}}>
          custompoolsbyrobabel.com, website redesign concept, October 2026
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
