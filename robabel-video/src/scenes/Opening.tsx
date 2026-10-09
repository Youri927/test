import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line, Lockup} from '../Bits';
import {HeroScene, PALMS} from '../HeroScene';
import {OPEN} from '../beats.ts';
import {LEN} from '../timeline';
import {BODY, C, E, range} from '../util';

/**
 * Ouverture : la photo de l'accueil sort du noir, lumières éteintes ; la maison s'allume, puis chaque palmier,
 * puis la piscine en violet ; le nom de l'entreprise monte, puis « Your new website ».
 */
export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.Opening;
  const lit = {
    house: E.out(range(f, OPEN.house, OPEN.house + 30)),
    palms: Array.from({length: PALMS}, (_, k) => E.out(range(f, OPEN.palms + k * OPEN.palmStep, OPEN.palms + k * OPEN.palmStep + 24))),
    pool: E.inOut(range(f, OPEN.pool, OPEN.pool + 70)),
  };
  const photo = range(f, OPEN.photo, OPEN.photo + 36, 0, 1, E.sine);
  const zoom = 1.0 + 0.06 * E.sine(range(f, 0, len));
  const name = (at: number) => range(f, at, at + 56, 112, 0, E.out);
  const sub = range(f, OPEN.sub, OPEN.sub + 40, 0, 1, E.out);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: photo}}>
        <HeroScene lit={lit} zoom={zoom} />
      </AbsoluteFill>
      {/* un voile uni, pour que le nom se lise sur le ciel */}
      <AbsoluteFill style={{background: C.night, opacity: 0.32 * range(f, OPEN.name - 30, OPEN.name + 30, 0, 1, E.sine)}} />
      <div style={{position: 'absolute', left: 132, top: 300}}>
        <Line shift={name(OPEN.name)}>
          <Lockup size={168} />
        </Line>
        <div style={{...BODY, marginTop: 34, fontSize: 44, fontWeight: 500, color: 'rgba(255,255,255,.92)', opacity: sub, transform: `translateY(${(1 - sub) * 18}px)`}}>
          Your new website
        </div>
        <div style={{width: 120, height: 5, borderRadius: 3, marginTop: 26, background: C.azure, transformOrigin: '0 50%', transform: `scaleX(${E.out(range(f, OPEN.sub + 12, OPEN.sub + 52))})`}} />
      </div>
    </AbsoluteFill>
  );
};
