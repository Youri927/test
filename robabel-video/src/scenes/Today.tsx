import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Caption} from '../Bits';
import {CameraRig} from '../lib/camera';
import {BrowserAt, Box, focus} from '../Stage';
import {SITE_W} from '../Screen';
import marks from '../../public/before/marks.json';
import {TODAY} from '../beats.ts';
import {BG, LEN} from '../timeline';
import {E, range} from '../util';

const B: Box = {x: 960, y: 552, w: 1480};
// la page capturée fait un peu plus de 1440 px CSS de large (un élément du thème déborde) : on garde la même échelle
const PAGE_W = 3038 / 2;
const [first, , third] = marks.captions;

/** Aujourd'hui : la galerie du site actuel ; la caméra va lire les légendes, des noms de fichier */
export const Today: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.Today;
  const k = B.w / SITE_W;
  // la page descend doucement jusqu'à la grille de photos
  const scroll = range(f, 20, 150, 0, 520, E.inOut);
  return (
    <AbsoluteFill style={{background: BG.Today}}>
      <CameraRig
        blur={0.5}
        keys={[
          {f: 0, x: B.x, y: B.y, s: 0.98},
          {f: 120, x: B.x, y: B.y, s: 1.0, ease: E.sine},
          // les trois premières légendes entières : trois noms de fichier
          focus(B, (first.x + third.x + third.w) / 2, first.y - 520 + 40, {f: TODAY.caption, s: 1.62, ease: E.soft}),
          focus(B, (first.x + third.x + third.w) / 2 + 6, first.y - 520 + 44, {f: len, s: 1.68, ease: E.sine}),
        ]}
      >
        <BrowserAt b={B} path="/gallery/">
          <Img src={staticFile('before/gallery.jpg')} style={{position: 'absolute', left: 0, top: -scroll * k, width: PAGE_W * k}} />
        </BrowserAt>
      </CameraRig>
      <Caption
        title="Your gallery today"
        text="Five stock photos, four of them captioned with their file names. The photos of your own pools were in your media library: the new site is built on them."
        at={TODAY.caption + 20}
        out={len - 6}
        tone="dark"
        width={720}
        side="right"
      />
    </AbsoluteFill>
  );
};
