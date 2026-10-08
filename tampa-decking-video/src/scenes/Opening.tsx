import React, {useId} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line, Logo, Photo} from '../Bits';
import {OPEN_MOVES} from '../beats.ts';
import {LEN} from '../timeline';
import {BODY, C, DISPLAY, E, F, mix, range} from '../util';

const LAYERS: [string, string, string][] = [
  ['Deck', 'layer-deck', '72% 60%'],
  ['Coping', 'layer-coping', '38% 50%'],
  ['Tile', 'layer-tile', '42% 50%'],
  ['Finish', 'layer-finish', '50% 50%'],
];
const WIN = {x: 1176, y: 96, w: 632, h: 800};

/** Position de la bande de photos (en nombre de couches descendues) et sa vitesse */
const depth = (f: number) => {
  let k = 0;
  for (const [a, b] of OPEN_MOVES) k += E.inOut(Math.max(0, Math.min(1, (f - a) / (b - a))));
  return k;
};

/** Ouverture : ce qu'ils font, en une phrase de leur site ; à droite, on descend de la plage jusqu'à l'enduit */
export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const id = 'ob' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const shift = (at: number) => range(f, at, at + 46, 118, 0, E.out);
  const up = (at: number) => ({opacity: range(f, at, at + 30, 0, 1), transform: `translateY(${range(f, at, at + 40, 20, 0, E.out)}px)`});
  const k = depth(f);
  const v = Math.abs(depth(f) - depth(f - 1)) * WIN.h;
  const blur = Math.min(v * 0.22, 26);
  // la fenêtre monte comme l'eau qui remplit un bassin (masque qui monte, photo qui se pose)
  const rise = range(f, 24, 80, 0, 1, E.out);
  return (
    <AbsoluteFill style={{background: C.white, transform: `scale(${range(f, 0, LEN.Opening, 1, 1.025)})`}}>
      <div style={{position: 'absolute', left: 112, top: 96, ...up(8)}}>
        <Logo height={86} />
      </div>
      <div style={{position: 'absolute', left: 104, top: 352, ...DISPLAY, fontSize: 96, color: C.ink}}>
        <Line shift={shift(14)}>Pool resurfacing,</Line>
        <Line shift={shift(24)}>tile, coping</Line>
        <Line shift={shift(34)}>and new decks</Line>
      </div>
      <div style={{position: 'absolute', left: 112, top: 668, width: 820, ...BODY, fontSize: 30, lineHeight: 1.42, color: C.inkSoft, ...up(78)}}>
        across Tampa Bay. Family and veteran owned, in Tampa for 30 years.
      </div>

      <svg width="0" height="0" style={{position: 'absolute'}}>
        <filter id={id} x="-5%" y="-10%" width="110%" height="120%">
          <feGaussianBlur stdDeviation={`0 ${blur.toFixed(2)}`} />
        </filter>
      </svg>
      <div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, overflow: 'hidden', borderRadius: 4, clipPath: `inset(${(1 - rise) * 100}% 0 0 0)`}}>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${1.16 - 0.16 * rise})`, transformOrigin: '50% 100%'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: WIN.w, transform: `translateY(${-k * WIN.h}px)`, filter: blur > 0.5 ? `url(#${id})` : undefined}}>
            {LAYERS.map(([name, src, pos], i) => (
              <Photo key={name} src={src} w={WIN.w} h={WIN.h} pos={pos} scale={1.08 - 0.08 * Math.max(0, Math.min(1, 1 - Math.abs(k - i)))} />
            ))}
          </div>
        </div>
      </div>
      {/* les onglets de la coupe du site : la couche en cours en bleu marine */}
      <div style={{position: 'absolute', left: WIN.x, top: WIN.y + WIN.h + 26, display: 'flex', gap: 6, ...up(70)}}>
        {LAYERS.map(([name], i) => {
          // l'onglet s'allume pendant que la bande arrive sur sa couche
          const on = Math.max(0, Math.min(1, 1 - Math.abs(k - i) * 2));
          return (
            <div
              key={name}
              style={{
                height: 58,
                padding: '0 26px',
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                fontFamily: F.sans,
                fontWeight: 560,
                fontSize: 22,
                background: `rgba(4, 66, 111, ${on})`,
                color: mix(C.ink, C.white, on),
              }}
            >
              {name}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
