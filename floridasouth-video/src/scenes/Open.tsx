import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Caption} from '../Bits';
import {M} from '../clips';
import {CameraRig} from '../lib/camera';
import {BrowserAt, Box, aside, asideBottom, asideWidth} from '../Stage';
import {OPEN, TIMING} from '../beats.ts';
import {BG, LEN} from '../timeline';
import {E} from '../util';

/** Le navigateur, dessiné en grand (1850 px) : la caméra ne fait que réduire, l'image reste nette */
export const B: Box = {x: 960, y: 540, w: 1850};
export const WIDE = {x: 960, y: 540, s: 0.8};
/** échelle du navigateur rangé de côté pour laisser la place à une légende */
export const SIDE = 0.64;

/**
 * Ouverture : le nouveau site, filmé dès sa première image. « Give us your list. » et la liste, du trou à reboucher à la
 * maison à construire ; les cinq lignes se barrent l'une après l'autre, en croches, puis « Consider it done. » s'écrit
 * sur le premier temps de la mesure. Le navigateur se range ensuite de côté pour la légende de la vidéo. La caméra ne
 * bouge qu'une fois, d'un seul geste.
 */
export const Open: React.FC = () => {
  const len = LEN.Open;
  return (
    <AbsoluteFill style={{background: BG.Open}}>
      <CameraRig
        keys={[
          {...WIDE, f: 0},
          {...WIDE, f: OPEN.aside},
          aside(B, 'right', {f: OPEN.aside + 54, s: SIDE, ease: E.soft}),
          aside(B, 'right', {f: len, s: SIDE}),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dOpen, ...TIMING.Open}} />
      </CameraRig>
      <Caption
        title={['Your new', 'website']}
        text="It opens on your own words, on the blue of your own sky: five jobs, from patching a hole to building the house, crossed off one by one. Then, consider it done."
        at={OPEN.cap}
        side="right"
        brand
        width={asideWidth(B, SIDE)}
        bottom={asideBottom(B, SIDE)}
      />
    </AbsoluteFill>
  );
};
