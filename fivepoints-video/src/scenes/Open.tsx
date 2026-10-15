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
 * Ouverture : le nouveau site, filmé dès sa première image. Le titre est déjà là, sous un toit encore vide ; les deux
 * rampants dorés se tracent des avant-toits au faîte, « Roofing is in our blood » monte les deux pentes, l'étoile du logo
 * se pose au faîte. Le navigateur se range ensuite de côté pour la légende de la vidéo. La caméra ne bouge qu'une fois,
 * d'un seul geste.
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
        text="It opens on your line, “Roofing is in our blood”, written on the two slopes of a roof, with the star of your logo at the ridge."
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
