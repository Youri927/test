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
 * Ouverture : le nouveau site, filmé dès sa première image. Le logo se pose au centre de la page blanche, son nom
 * s'efface, une vraie photo du cabinet s'ouvre dans le cadre resté seul, puis le cadre s'agrandit jusqu'à l'accueil et
 * s'y pose sur un temps. Le navigateur se range ensuite de côté pour la légende. La caméra de la vidéo ne bouge qu'une
 * fois, d'un seul geste, pour cette mise de côté.
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
        title="Your new website"
        text="It opens on your logo. The name fades, a real photo of your treatment room opens inside the frame, and the frame grows into the page."
        at={OPEN.cap}
        out={len - 2}
        side="right"
        brand
        width={asideWidth(B, SIDE)}
        bottom={asideBottom(B, SIDE)}
      />
    </AbsoluteFill>
  );
};
