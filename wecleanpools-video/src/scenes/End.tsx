import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {Line, Logo} from '../Bits';
import {END} from '../beats.ts';
import {LEN} from '../timeline';
import {BODY, C, E, H2, range} from '../util';

/**
 * Fin : sur le bleu du grand bain, la lumière du soleil glisse au fond (à vitesse constante, un calque composité :
 * aucun à-coup), le logotype, puis ce qui a servi à faire le site ; fondu au noir.
 */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.End;
  const up = (at: number) => ({opacity: range(f, at, at + 26, 0, 1), transform: `translateY(${range(f, at, at + 36, 18, 0, E.out).toFixed(2)}px)`});
  const fade = range(f, len - 46, len - 4, 1, 0, E.inOut);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: fade, background: C.deep, overflow: 'hidden'}}>
        <div
          style={{
            position: 'absolute',
            left: -1024,
            top: -1024,
            width: 1920 + 2048,
            height: 1080 + 2048,
            backgroundImage: `url(${staticFile('tex/caustics-a.webp')})`,
            backgroundSize: '1024px 1024px',
            opacity: 0.16,
            transform: `translate3d(${f}px, ${(f * 0.5).toFixed(1)}px, 0)`,
            willChange: 'transform',
          }}
        />
        <div style={{position: 'absolute', left: 124, top: 300}}>
          <Line shift={range(f, END.logo, END.logo + 50, 112, 0, E.out)}>
            <Logo size={96} color={C.white} />
          </Line>
          <div style={{...H2, marginTop: 52, fontSize: 52, maxWidth: 1100, lineHeight: 1.04, color: C.white, ...up(END.line)}}>Built with your question, your prices and your photos.</div>
          <div style={{...BODY, marginTop: 30, fontSize: 22, color: 'rgba(232,242,244,.72)', ...up(END.line + 40)}}>wecleanpools.com, website redesign concept, October 2026</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
