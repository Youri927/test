import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Line, Logo} from '../Bits';
import {END_SWAP} from '../beats.ts';
import {DIVE_LEN, LEN} from '../timeline';
import {BODY, C, DISPLAY, E, F, range} from '../util';

const SWAP = END_SWAP;
const WIN = {x: 1176, y: 120, w: 632, h: 840};
const POOLS: [string, string][] = [['hero', '50% 45%'], ['w-1179', '50% 50%'], ['w-0993', '55% 50%'], ['w-1196', '50% 50%'], ['w-1175', '50% 50%'], ['w-8916', '50% 50%']];
const TILE_H = 420;

/** Fin : la phrase du pied de page du site, puis le nom, le téléphone et leurs bassins qui défilent ; fondu final */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.End;
  const g = f - SWAP;
  // arrivée en plongée depuis les téléphones
  const arrive = range(f, 0, DIVE_LEN + 12, 760, 0, E.out);
  const shift = (at: number) => range(f, at, at + 50, 118, 0, E.out);
  const leave = (at: number) => range(f, at, at + 34, 0, -118, E.in);
  const up = (at: number) => ({opacity: range(g, at, at + 30, 0, 1), transform: `translateY(${range(g, at, at + 40, 20, 0, E.out)}px)`});
  const out = range(f, len - 40, len, 1, 0, E.inOut);
  // la fenêtre de photos monte comme l'eau, puis les bassins défilent lentement
  const rise = range(g, 20, 76, 0, 1, E.out);
  const drift = range(g, 20, len - SWAP, 0, TILE_H * 2.4, E.linear);
  return (
    <AbsoluteFill style={{background: C.abyss}}>
      <AbsoluteFill style={{opacity: out}}>
        {f < SWAP + 40 ? (
          <div style={{position: 'absolute', left: 150, top: 330, ...DISPLAY, fontSize: 132, color: C.white, transform: `translateY(${arrive}px)`}}>
            <Line shift={f < SWAP ? shift(14) : leave(SWAP)}>You have reached</Line>
            <Line shift={f < SWAP ? shift(26) : leave(SWAP + 6)}><span style={{color: C.sun}}>the deep end</span></Line>
          </div>
        ) : null}
        {g >= 0 ? (
          <>
            <div style={{position: 'absolute', left: 150, top: 176}}>
              <div style={up(14)}><Logo height={128} plate /></div>
              <div style={{marginTop: 76, ...BODY, fontSize: 28, color: 'rgba(255,255,255,.72)', ...up(34)}}>Free, up-front estimates across Tampa Bay</div>
              <div style={{marginTop: 14, ...DISPLAY, fontSize: 116, letterSpacing: '-0.04em', color: C.white, ...up(44)}}>813-695-1458</div>
              <div style={{marginTop: 22, width: 128, height: 5, borderRadius: 3, background: C.sun, transformOrigin: '0 50%', transform: `scaleX(${range(g, 60, 100, 0, 1, E.out)})`}} />
              <div style={{marginTop: 34, fontFamily: F.sans, fontSize: 22, lineHeight: 1.7, color: 'rgba(255,255,255,.66)', ...up(70)}}>
                tampadeckingandpools.com · Tampa, Florida
                <br />
                Website redesign concept, October 2026
              </div>
            </div>
            <div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, overflow: 'hidden', borderRadius: 4, clipPath: `inset(${(1 - rise) * 100}% 0 0 0)`}}>
              <div style={{position: 'absolute', left: 0, top: 0, width: WIN.w, transform: `translateY(${-drift - (1 - rise) * 120}px)`}}>
                {POOLS.map(([src, pos]) => (
                  <div key={src} style={{width: WIN.w, height: TILE_H, overflow: 'hidden', borderBottom: `6px solid ${C.abyss}`}}>
                    <Img src={staticFile(`img/${src}.webp`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos}} />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
