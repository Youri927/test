import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Caption, Tag} from '../Bits';
import {M} from '../clips';
import {CameraRig} from '../lib/camera';
import {BrowserAt, Box, aside, asideBottom, asideWidth} from '../Stage';
import {OPEN, TIMING} from '../beats.ts';
import {BG, LEN} from '../timeline';
import {E, range} from '../util';

/** Le navigateur, dessiné en grand (1850 px) : la caméra ne fait que réduire, l'image reste nette */
export const B: Box = {x: 960, y: 540, w: 1850};
export const WIDE = {x: 960, y: 540, s: 0.8};
/** échelle du navigateur rangé de côté pour laisser la place à une légende */
export const SIDE = 0.64;
const K = B.w / 1440;

/**
 * Ouverture : le site actuel, puis il s'efface en fondu sur le nouveau site, filmé dès sa première image : le slogan
 * s'élargit, le trait dessine le bassin et le spa, l'eau monte dans le bassin (la photo se dévoile du fond), le spa arrive.
 * Le navigateur se range ensuite de côté pour la légende.
 */
export const Open: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.Open;
  const old = 1 - range(f, OPEN.swap, OPEN.site, 0, 1, E.inOut);
  const tag = range(f, 12, 34, 0, 1, E.out) * (1 - range(f, OPEN.swap - 24, OPEN.swap + 6));
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
        <BrowserAt b={B} clip={{meta: M.dOpen, ...TIMING.Open}}>
          {old > 0.001 ? (
            <Img src={staticFile('old/home.jpg')} style={{position: 'absolute', left: 0, top: 0, width: B.w, height: (B.w * 900) / 1440, opacity: old}} />
          ) : null}
          {tag > 0.001 ? (
            <div style={{position: 'absolute', left: 40 * K, bottom: 40 * K}}>
              <Tag text="Your website today" dark opacity={tag} scale={K} />
            </div>
          ) : null}
        </BrowserAt>
      </CameraRig>
      <Caption
        title="Your new website"
        text="It opens like a pool plan: one line draws the pool and the spa, then your own photos fill them."
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
