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

/** L'eau verte du site (sa couleur, sa profondeur, ses nuages d'algues et ses particules), sur l'écran du navigateur */
const Murk: React.FC<{opacity: number}> = ({opacity}) => (
  <div style={{position: 'absolute', inset: 0, opacity}}>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(110% 95% at 46% 38%, rgba(168,186,74,.3) 0%, rgba(168,186,74,0) 42%, rgba(14,22,6,.5) 100%), rgb(66 90 34)'}} />
    <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${staticFile('tex/murk.webp')})`, backgroundSize: `${768 * K}px ${768 * K}px`}} />
    <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${staticFile('tex/specks.webp')})`, backgroundSize: `${512 * K}px ${512 * K}px`, opacity: 0.9}} />
  </div>
);

/**
 * Ouverture : le site actuel, puis l'eau verte le recouvre ; le nouveau site apparaît sous cette eau, avec sa question,
 * et l'eau s'éclaircit au défilement jusqu'aux lettres du fond : « WE CLEAN POOLS. ». Le navigateur se range ensuite
 * de côté pour la légende.
 */
export const Open: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.Open;
  const murk = range(f, OPEN.murk, OPEN.site, 0, 1, E.inOut) * (1 - range(f, OPEN.site, OPEN.site + 26, 0, 1, E.inOut));
  const oldOn = f < OPEN.site;
  const tag = range(f, 12, 34, 0, 1, E.out) * (1 - range(f, OPEN.murk, OPEN.murk + 30));
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
          {oldOn ? <Img src={staticFile('old/home.jpg')} style={{position: 'absolute', left: 0, top: 0, width: B.w, height: (B.w * 900) / 1440}} /> : null}
          {murk > 0.001 ? <Murk opacity={murk} /> : null}
          {tag > 0.001 ? (
            <div style={{position: 'absolute', left: 40 * K, bottom: 40 * K}}>
              <Tag text="Your website today" dark opacity={tag} scale={K} />
            </div>
          ) : null}
        </BrowserAt>
      </CameraRig>
      <Caption
        title="Your new website"
        text="It starts with your own question. Scroll down, and the green water clears."
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
