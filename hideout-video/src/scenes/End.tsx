import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Logo} from '../Bits';
import {END} from '../beats.ts';
import {LEN} from '../timeline';
import {BODY, C, E, H2, range} from '../util';

const LW = 920;

/**
 * Fin, sur l'expresso du pied de page du site : le cadre du logo se trace du milieu vers les coins, comme à l'ouverture,
 * puis le nom se découvre de gauche à droite ; viennent la ligne sur ce qui a servi et l'adresse du site ; fondu au noir.
 */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.End;
  const up = (at: number) => ({opacity: range(f, at, at + 26, 0, 1), transform: `translateY(${range(f, at, at + 36, 18, 0, E.out).toFixed(2)}px)`});
  const fade = range(f, len - 46, len - 4, 1, 0, E.inOut);
  // le cadre : découpé depuis le milieu, il s'ouvre vers les coins
  const open = range(f, END.frame, END.frame + 60, 50, -2, E.out);
  // le nom : un masque au bord adouci qui glisse de gauche à droite
  const wipe = range(f, END.name, END.name + 60, 100, 0, E.out);
  const mask = 'linear-gradient(90deg, #000 0 40%, transparent 60% 100%)';
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: fade, background: C.espresso}}>
        <style>{'.end-frame .logo__name, .end-frame .logo__sub { display: none } .end-name .logo__frame { display: none }'}</style>
        <div style={{position: 'absolute', left: (1920 - LW) / 2, top: 236, width: LW}}>
          <div className="end-frame" style={{position: 'absolute', inset: 0, clipPath: `inset(-4% ${open.toFixed(3)}% -4% ${open.toFixed(3)}%)`}}>
            <Logo full width={LW} color={C.cream} />
          </div>
          <div
            className="end-name"
            style={{maskImage: mask, WebkitMaskImage: mask, maskSize: '250% 100%', WebkitMaskSize: '250% 100%', maskPosition: `${wipe.toFixed(3)}% 0`, WebkitMaskPosition: `${wipe.toFixed(3)}% 0`}}
          >
            <Logo full width={LW} color={C.cream} />
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center'}}>
          <div style={{...H2, fontSize: 54, color: C.cream, maxWidth: 1500, margin: '0 auto', textWrap: 'balance', ...up(END.line)}}>Built from your logo, your team and your clients’ own results.</div>
          <div style={{...BODY, marginTop: 30, fontSize: 23, color: 'rgba(244, 238, 233, 0.66)', ...up(END.url)}}>hideoutboutique.com, website redesign concept, October 2026</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
