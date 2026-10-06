import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {ArchCover, ArchReveal, TemplateSite} from '../Bits';
import {CameraRig} from '../lib/camera';
import {Browser, browserH} from '../Screen';
import {BEAT, C, DISPLAY, E, F, range} from '../util';

export const SAME_LEN = 11 * BEAT;
const BG = '#E8E1D4';
const TW = 520;
const TH = browserH(TW);
const GAP = 44;
const ACCENTS = ['#2E7D32', '#1565C0', '#EF6C00', '#00838F', '', '#6A1B9A', '#C62828', '#3E7C59', '#455A64'];
const ZOOM = 300;

/** Un écran de la grille : un site gabarit dessiné, ou (au centre) la vraie page d'accueil actuelle de WAVE */
const Tile: React.FC<{i: number; f: number}> = ({i, f}) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = (col - 1) * (TW + GAP);
  const y = (row - 1) * (TH + GAP);
  const order = [4, 0, 2, 6, 8, 1, 5, 7, 3][i];
  const show = range(f, 20 + order * 11, 60 + order * 11, 0, 1, E.out);
  const dim = i === 4 ? 0 : range(f, ZOOM, ZOOM + 50, 0, 1, E.inOut);
  return (
    <div style={{position: 'absolute', left: x - TW / 2, top: y - TH / 2, width: TW, height: TH, opacity: show * (1 - dim * 0.72), transform: `translateY(${(1 - show) * 60}px)`, filter: dim ? `grayscale(${dim}) blur(${dim * 2}px)` : undefined}}>
      <Browser w={TW} glow="transparent">
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
          {i === 4 ? (
            <Img src={staticFile('before/top.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'}} />
          ) : (
            <div style={{position: 'absolute', left: 0, top: 0, width: 1440, height: 900, transformOrigin: '0 0', transform: `scale(${TW / 1440})`}}>
              <TemplateSite accent={ACCENTS[i]} v={i} />
            </div>
          )}
        </div>
      </Browser>
    </div>
  );
};

/** La mer des sites qui se ressemblent : huit gabarits dessinés, et la page actuelle de WAVE au milieu */
export const Same: React.FC = () => {
  const f = useCurrentFrame();
  const t1 = range(f, 40, 80, 0, 1, E.out) * range(f, ZOOM - 20, ZOOM + 10, 1, 0, E.inOut);
  const t2 = range(f, ZOOM + 20, ZOOM + 60, 0, 1, E.out);
  return (
    <AbsoluteFill style={{background: BG}}>
      <CameraRig
        blur={0.4}
        keys={[
          {f: 0, x: 0, y: -120, s: 0.66, rz: -1.2},
          {f: ZOOM, x: 0, y: -110, s: 0.71, rz: 0, ease: E.sine},
          {f: SAME_LEN - 20, x: 0, y: 0, s: 1.9, rz: 0, ease: E.inOut},
          {f: SAME_LEN, x: 0, y: 0, s: 2.1, ease: E.in},
        ]}
      >
        {Array.from({length: 9}, (_, i) => <Tile key={i} i={i} f={f} />)}
        <div style={{position: 'absolute', left: -TW / 2 - 8, top: -TH / 2 - 8, width: TW + 16, height: TH + 16, borderRadius: 14, boxShadow: `0 0 0 4px ${C.lime}`, opacity: range(f, ZOOM + 10, ZOOM + 40)}} />
      </CameraRig>
      <div style={{position: 'absolute', left: 0, right: 0, top: 56, textAlign: 'center', color: C.ink}}>
        <div style={{...DISPLAY, fontSize: 70, letterSpacing: '-0.035em', opacity: t1, transform: `translateY(${(1 - t1) * 20}px)`}}>
          Same template. Same stock photos. Same “CALL NOW”.
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, ...DISPLAY, fontSize: 70, letterSpacing: '-0.035em', opacity: t2, transform: `translateY(${(1 - t2) * 20}px)`}}>
          Which one gets the call?
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center', fontFamily: F.body, fontSize: 18, color: C.grey, opacity: range(f, 100, 130) * range(f, ZOOM - 20, ZOOM, 1, 0)}}>
        Illustration: generic contractor templates, and WAVE’s current homepage in the middle.
      </div>
      <ArchReveal level={range(f, 0, 50, 0, 1, E.inOut)} color={BG} />
      <ArchCover level={range(f, SAME_LEN - 40, SAME_LEN, 0, 1, E.inOut)} color={C.paper} />
    </AbsoluteFill>
  );
};
