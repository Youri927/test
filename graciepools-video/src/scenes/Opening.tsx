import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DimLine, Line, Mark, Wordmark} from '../Bits';
import {FeetGrid, Pool, modelById} from '../Pool';
import {OPEN} from '../beats.ts';
import {LEN} from '../timeline';
import {BODY, C, E, W, feet, range} from '../util';

// le Billabong Cove du premier écran du site, à 26 px par pied
const PPF = 26;
const cove = modelById('billabong-cove');
const L = cove.sizes[0].l;
const Wd = cove.sizes[0].w;
const PW = (L / 12) * PPF;
const PH = (Wd / 12) * PPF;
const PX = (W - PW) / 2;
const PY = 236;

/**
 * Ouverture : sur la grille d'un pied, la cote de la longueur se trace et compte jusqu'à 35′ 3⅛″,
 * puis celle de la largeur ; le contour du Billabong Cove se dessine, l'eau le remplit sur le temps 4 ;
 * la marque et le nom de Gracie Pools.
 */
export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.Opening;
  const pl = range(f, OPEN.length, OPEN.length + 48, 0, 1, E.inOut);
  const pw = range(f, OPEN.width, OPEN.width + 40, 0, 1, E.inOut);
  // le nombre compte au huitième de pouce, comme la cote du site
  const shownL = Math.round(L * pl * 8) / 8;
  const shownW = Math.round(Wd * pw * 8) / 8;
  const draw = range(f, OPEN.outline, OPEN.outline + 100, 0, 1, E.inOut) + range(f, OPEN.fill + 30, OPEN.fill + 60, 0, 1);
  const fill = range(f, OPEN.fill, OPEN.fill + 56, 0, 1, E.inOut);
  const up = (at: number) => ({opacity: range(f, at, at + 30, 0, 1), transform: `translateY(${range(f, at, at + 40, 18, 0, E.out)}px)`});
  const shift = (at: number) => range(f, at, at + 46, 118, 0, E.out);
  // sortie : tout monte un peu et s'efface juste avant la coupe
  const leave = range(f, len - 30, len - 2, 0, 1, E.in);
  return (
    <AbsoluteFill style={{background: C.white}}>
      <AbsoluteFill style={{transform: `translateY(${-leave * 40}px) scale(${range(f, 0, len, 1, 1.025)})`, opacity: 1 - leave * 0.6}}>
        <FeetGrid w={W} h={1080} ppf={PPF} x0={PX} y0={PY} opacity={range(f, OPEN.grid, OPEN.grid + 40, 0, 0.9)} />
        <DimLine len={PW} p={pl} label={feet(Math.max(0, shownL))} size={24} style={{left: PX, top: PY - 46}} />
        <DimLine len={PH} p={pw} label={feet(Math.max(0, shownW))} size={24} vertical style={{left: PX - 44, top: PY}} />
        <div style={{position: 'absolute', left: PX, top: PY, width: PW, height: PH}}>
          <Pool drawing={cove.drawing} w={PW} h={PH} ppf={PPF} finish="california" draw={draw} fill={fill} drift={f * 0.12} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22}}>
          <Mark size={70} p={range(f, OPEN.mark, OPEN.mark + 40)} />
          <div style={{overflow: 'hidden', paddingBottom: 8}}>
            <Line shift={shift(OPEN.name)}>
              <Wordmark size={74} />
            </Line>
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 878, textAlign: 'center', ...BODY, fontSize: 30, color: C.inkSoft, ...up(OPEN.line)}}>
          Fiberglass and concrete pools for Central Florida backyards
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
