import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {CameraRig} from '../../lib/camera';
import {Caption, Wall} from '../Bits';
import {M} from '../clips';
import {BrowserAt, Box, onSite, whipIn, whipOut} from '../Stage';
import {BEAT, E} from '../util';

export const POSTER_LEN = 8 * BEAT;
const B: Box = {x: 735, y: 540, w: 1240};
const A_LEN = 194;
const B_LEN = POSTER_LEN - A_LEN;
// le cadran des époques (px du site, page arrêtée sous l'affiche)
const DIAL = {x: 1205, y: 372};

/** 02 · L'affiche : les lignes se balaient de lumière, l'année voyage dans le temps */
export const Poster: React.FC = () => (
  <AbsoluteFill>
    <Wall gx={38} gy={50} strength={0.07} />
    <Sequence durationInFrames={A_LEN}>
      <CameraRig
        blur={1.1}
        keys={[
          ...whipIn({f: 0, x: 960, y: 540, s: 1.0, rz: 0}, 24),
          {f: A_LEN, x: 975, y: 548, s: 1.05, rz: 0.4, ease: E.sine},
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dTeaser, from: 34}} />
        <div style={{position: 'absolute', left: 1430, top: 300}}>
          <Caption num="02" title="L’affiche" text="Trois lignes géantes qu’un trait de lumière balaie au scroll. L’année voyage de 1958 à 1938, puis vers une date classée secrète." at={30} width={420} />
        </div>
      </CameraRig>
    </Sequence>
    {/* gros plan : la date passe en « classée secrète » */}
    <Sequence from={A_LEN} durationInFrames={B_LEN}>
      <CameraRig
        blur={1.1}
        keys={[
          onSite(B, DIAL.x - 40, DIAL.y, {f: 0, s: 2.05, rz: -1.2}),
          onSite(B, DIAL.x - 10, DIAL.y + 4, {f: 76, s: 2.3, rz: 0.2, ease: E.sine}),
          ...whipOut(onSite(B, DIAL.x - 8, DIAL.y + 4, {f: 0, s: 2.32, rz: 0.2}), B_LEN, 16),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dTeaser, from: 410}} />
      </CameraRig>
    </Sequence>
  </AbsoluteFill>
);
