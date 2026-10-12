import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Caption, Tag} from '../Bits';
import {M} from '../clips';
import {CameraRig} from '../lib/camera';
import {BrowserAt, Box, aside, asideBottom, asideWidth} from '../Stage';
import {OPEN, TIMING} from '../beats.ts';
import {LEN} from '../timeline';
import {C, E, range, sky} from '../util';

/** Le navigateur, dessiné en grand (1850 px) : la caméra ne fait que réduire, l'image reste nette */
export const B: Box = {x: 960, y: 540, w: 1850};
export const WIDE = {x: 960, y: 540, s: 0.8};
/** échelle du navigateur rangé de côté pour laisser la place à une légende */
export const SIDE = 0.64;
const K = B.w / 1440;

/**
 * Ouverture : le site actuel, puis il s'efface en fondu sur le nouveau site, filmé dès sa première image : le titre monte,
 * l'interrupteur de la photo s'éclaire. La souris allume la piscine : le site passe du jour à la nuit par le crépuscule,
 * et le fond de la scène suit le même ciel, sur la même courbe. Le navigateur se range ensuite de côté pour la légende.
 */
export const Open: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.Open;
  const old = 1 - range(f, OPEN.swap, OPEN.site, 0, 1, E.inOut);
  const tag = range(f, 12, 34, 0, 1, E.out) * (1 - range(f, OPEN.swap - 24, OPEN.swap + 6));
  const p = (f - OPEN.click) / OPEN.sky;
  const bg = p > 0 ? sky(p, C.stage, C.stageDusk, C.stageNight) : C.stage;
  return (
    <AbsoluteFill style={{background: bg}}>
      <CameraRig
        keys={[
          {...WIDE, f: 0},
          {...WIDE, f: OPEN.aside},
          aside(B, 'right', {f: OPEN.aside + 54, s: SIDE, ease: E.soft}),
          aside(B, 'right', {f: len, s: SIDE}),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dOpen, ...TIMING.Open}} dark={p > 0.5}>
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
        text="One switch lights your pool and turns the whole site to night. After sunset in Wilmington, it happens on its own."
        at={OPEN.cap}
        out={len - 2}
        side="right"
        tone="dark"
        brand
        width={asideWidth(B, SIDE)}
        bottom={asideBottom(B, SIDE)}
      />
    </AbsoluteFill>
  );
};
