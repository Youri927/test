import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {ArchReveal, Line, Mark, Word} from '../Bits';
import {BEAT, C, DISPLAY, E, F, LABEL, range} from '../util';

export const END_LEN = 9 * BEAT;
const SWAP = 170;

/** Fin : « Don’t blend in. Stand out. », puis le logo, et la photo de midi dans l'arche ; fondu final vers la nuit */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const g = f - SWAP;
  const shift = (at: number) => range(f, at, at + 46, 118, 0, E.out);
  const first = range(f, SWAP - 30, SWAP, 1, 0, E.inOut);
  const up = (at: number) => ({opacity: range(g, at, at + 30, 0, 1), transform: `translateY(${range(g, at, at + 40, 22, 0, E.out)}px)`});
  // l'arche de la photo monte comme un dôme
  const q = range(g, 10, 90, 0, 1, E.out);
  const AW = 560;
  const AH = 760;
  const vis = AH * q;
  const ry = Math.min(vis, AW / 2);
  const out = range(f, END_LEN - 36, END_LEN, 1, 0, E.inOut);
  return (
    <AbsoluteFill style={{background: C.night}}>
      <AbsoluteFill style={{opacity: out}}>
        {first > 0 ? (
          <div style={{position: 'absolute', left: 150, top: 300, ...DISPLAY, fontSize: 200, color: C.sand, opacity: first}}>
            <Line shift={shift(40)}>Don’t blend in.</Line>
            <Line shift={shift(70)}><span style={{color: C.lime}}>Stand out.</span></Line>
          </div>
        ) : null}
        {g >= 0 ? (
          <>
            <div style={{position: 'absolute', right: 150, top: 160, width: AW, height: AH, clipPath: `inset(${AH - vis}px 0 0 0 round ${AW / 2}px ${AW / 2}px 0 0 / ${ry}px ${ry}px 0 0)`}}>
              <Img src={staticFile('img/noon.webp')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '72% 60%', transform: `scale(${1.14 - 0.14 * q})`}} />
            </div>
            <div style={{position: 'absolute', left: 150, top: 250, width: 980}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 30, ...up(10)}}>
                <Mark size={128} sand />
                <Word width={400} tone="sand" />
              </div>
              <div style={{marginTop: 30, ...LABEL, fontSize: 22, color: 'rgba(244,239,230,.7)', ...up(22)}}>Pool Remodeling · Scottsdale AZ</div>
              <div style={{marginTop: 60, ...DISPLAY, fontSize: 96, lineHeight: 0.96, color: C.sand, ...up(40)}}>
                Your pool, <span style={{color: C.lime}}>remade.</span>
                <br />Your website, too.
              </div>
              <div style={{marginTop: 54, paddingTop: 24, borderTop: '1px solid rgba(244,239,230,.2)', fontFamily: F.body, fontSize: 22, lineHeight: 1.7, color: 'rgba(244,239,230,.72)', ...up(80)}}>
                (480) 571-3969 · poolremodelingscottsdaleaz.com
                <br />
                Website redesign concept, October 2026
              </div>
            </div>
          </>
        ) : null}
      </AbsoluteFill>
      <ArchReveal level={range(f, 0, 50, 0, 1, E.inOut)} color={C.night} />
    </AbsoluteFill>
  );
};
