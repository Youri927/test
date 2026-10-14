import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line, Mark} from '../Bits';
import {END} from '../beats.ts';
import {LEN} from '../timeline';
import {BODY, C, E, F, H2, range} from '../util';

/**
 * Fin, sur le bleu du pied de page du site : la fenêtre en arc se pose ; les cinq lettres du nom montent une à une
 * derrière leur ligne de base, comme à l'ouverture du site ; viennent la ligne sur ce qui a servi et l'adresse du site ;
 * fondu au noir.
 */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.End;
  const up = (at: number) => ({opacity: range(f, at, at + 26, 0, 1), transform: `translateY(${range(f, at, at + 36, 18, 0, E.out).toFixed(2)}px)`});
  const fade = range(f, len - 46, len - 4, 1, 0, E.inOut);
  const mark = range(f, END.mark, END.mark + 40, 0, 1, E.out);
  // chaque lettre 4 images (0,067 s) après la précédente, comme sur l'accueil du site (0,06 s)
  const rise = (k: number) => range(f, END.name + k * 4, END.name + k * 4 + 60, 104, 0, E.out);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: fade, background: C.blue}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{opacity: mark, transform: `translateY(${((1 - mark) * 20).toFixed(2)}px)`}}>
            <Mark size={64} color={C.white} stroke={2.4} />
          </div>
          <div style={{marginTop: 28, display: 'flex', fontFamily: F.serif, fontWeight: 900, fontSize: 290, lineHeight: 1, letterSpacing: '-0.02em', color: C.white, whiteSpace: 'nowrap'}}>
            {[...'Skoda'].map((ch, k) => (
              <Line key={k} shift={rise(k)}>
                {ch}
              </Line>
            ))}
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 712, textAlign: 'center'}}>
          <div style={{...H2, fontSize: 46, color: C.white, maxWidth: 1500, margin: '0 auto', textWrap: 'balance', ...up(END.line)}}>Built from your job sites, your family and your license.</div>
          <div style={{...BODY, marginTop: 28, fontSize: 23, color: C.onBlue, ...up(END.url)}}>skodaconstructionflorida.com, website redesign concept, October 2026</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
