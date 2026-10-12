import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line} from '../Bits';
import {END} from '../beats.ts';
import {LEN} from '../timeline';
import {BODY, C, E, H2, MARK, range} from '../util';

/** Le bardage blanc de la façade, comme sous l'enseigne de la section visite du site : des planches, l'ombre sous chaque recouvrement */
const CLAPBOARD = 'repeating-linear-gradient(180deg, #FCFDFE 0, #F4F7FA 40px, #E4E9EF 50px, #C9D1DB 51.5px, #FCFDFE 54px)';

/**
 * Fin : leur enseigne, recomposée sur le bardage comme sur le porche (le 785, le poteau, le nom, le téléphone, le docteur),
 * monte ligne à ligne ; puis ce qui a servi à faire le site, et l'adresse du site ; fondu au noir.
 */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.End;
  const up = (at: number) => ({opacity: range(f, at, at + 26, 0, 1), transform: `translateY(${range(f, at, at + 36, 18, 0, E.out).toFixed(2)}px)`});
  const rise = (at: number) => range(f, at, at + 46, 112, 0, E.out);
  const fade = range(f, len - 46, len - 4, 1, 0, E.inOut);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: fade, background: CLAPBOARD}}>
        <div style={{position: 'absolute', left: 124, top: 330}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 52, color: C.blue}}>
            <Line shift={rise(END.mark)}>
              <div style={{...MARK, fontVariantCaps: 'normal', fontWeight: 800, fontSize: 132, fontVariationSettings: '"FLAR" 100, "VOLM" 100'}}>785</div>
            </Line>
            {/* le poteau du porche */}
            <div
              style={{
                alignSelf: 'stretch',
                width: 22,
                margin: '-26px 0',
                background: 'linear-gradient(90deg, #DDE3EA 0, #FFFFFF 30%, #F5F7FA 72%, #D3DAE3 100%)',
                boxShadow: '-1px 0 0 #CBD3DD, 1px 0 0 #CBD3DD',
                transformOrigin: '50% 0',
                transform: `scaleY(${range(f, END.mark, END.mark + 40, 0, 1, E.out).toFixed(4)})`,
              }}
            />
            <div style={{display: 'grid', justifyItems: 'center'}}>
              <Line shift={rise(END.mark + 4)}>
                <div style={{...MARK, fontSize: 92, lineHeight: 1.12}}>Castor Dental Associates</div>
              </Line>
              <Line shift={rise(END.mark + 12)}>
                <div style={{...MARK, fontVariantCaps: 'normal', fontSize: 34, letterSpacing: '0.07em', marginTop: 10}}>239-300-4635</div>
              </Line>
              <Line shift={rise(END.mark + 18)}>
                <div style={{...MARK, fontVariantCaps: 'normal', fontSize: 34, letterSpacing: '0.07em', marginTop: 4}}>JOSEPH A CASTOR DMD</div>
              </Line>
            </div>
          </div>
          <div style={{...H2, marginTop: 96, fontSize: 56, maxWidth: 1640, lineHeight: 1.04, color: C.ink, ...up(END.line)}}>Built from your sign, your team and your patients’ own words.</div>
          <div style={{...BODY, marginTop: 30, fontSize: 23, color: C.ink2, ...up(END.url)}}>castordentalassociates.com, website redesign concept, October 2026</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
