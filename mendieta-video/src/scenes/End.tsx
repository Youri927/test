import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Line} from '../Bits';
import {END} from '../beats.ts';
import {LEN} from '../timeline';
import {BODY, C, E, F, H2, range} from '../util';

/**
 * Fin, sur l'encre du pied de page du site : le blason se pose, le nom monte derrière son cache comme le titre de
 * l'accueil, un trait jaune se tend ; viennent la ligne sur ce qui a servi et l'adresse du site ; fondu au noir.
 */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.End;
  const up = (at: number) => ({opacity: range(f, at, at + 26, 0, 1), transform: `translateY(${range(f, at, at + 36, 18, 0, E.out).toFixed(2)}px)`});
  const fade = range(f, len - 46, len - 4, 1, 0, E.inOut);
  const crest = range(f, END.crest, END.crest + 40, 0, 1, E.out);
  const rise = (at: number) => range(f, at, at + 42, 104, 0, E.out);
  const bar = range(f, END.line - 22, END.line + 6, 0, 1, E.out);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: fade, background: C.ink}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 190, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <Img
            src={staticFile('img/crest-rev.png')}
            style={{width: 230, height: 'auto', opacity: crest, transform: `translateY(${((1 - crest) * 22).toFixed(2)}px)`}}
          />
          <div style={{marginTop: 46, display: 'flex', gap: '0.28em', fontFamily: F.sans, fontSize: 96, lineHeight: 1, color: C.white, whiteSpace: 'nowrap'}}>
            <Line shift={rise(END.name)}>
              <span style={{fontWeight: 790, fontStretch: '125%', letterSpacing: '-0.02em'}}>Mendieta</span>
            </Line>
            <Line shift={rise(END.name + 6)}>
              <span style={{fontWeight: 420, fontStretch: '100%'}}>Roofing Corp.</span>
            </Line>
          </div>
          <div style={{marginTop: 54, width: 72 * bar, height: 6, background: C.sun}} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center'}}>
          <div style={{...H2, fontSize: 48, color: C.white, maxWidth: 1500, margin: '0 auto', textWrap: 'balance', ...up(END.line)}}>Built from your jobs, your license and your 25 cities.</div>
          <div style={{...BODY, marginTop: 30, fontSize: 23, color: C.inkSoft, ...up(END.url)}}>mendietaroofingcorp.com, website redesign concept, October 2026</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
