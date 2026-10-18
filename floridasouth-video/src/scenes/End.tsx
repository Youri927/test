import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Emblem, Write} from '../Bits';
import {END} from '../beats.ts';
import {LEN} from '../timeline';
import {BODY, C, E, F, H2, SKY_GRAD, range} from '../util';

/**
 * Fin, sur le ciel du site : l'emblème paraît ; « Give us your list. », puis « Consider it done. » s'écrit de gauche à
 * droite, aux temps de l'accueil du site (0,85 s, --ease-io) ; dessous, l'adresse du site ; fondu au noir.
 */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.End;
  const fade = range(f, len - 46, len - 4, 1, 0, E.inOut);
  const on = (at: number, d = 30) => range(f, at, at + d, 0, 1, E.sine);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: fade, background: `${C.sky} ${SKY_GRAD}`, color: C.white}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 168, display: 'flex', justifyContent: 'center', opacity: on(END.mark, 36)}}>
          <Emblem height={150} color={C.white} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 404, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{fontFamily: F.sans, fontWeight: 600, fontSize: 30, lineHeight: 1.2, color: C.onSky, opacity: on(END.mark + 14)}}>Give us your list.</div>
          <div style={{...H2, marginTop: 18, fontSize: 136, lineHeight: 0.98, letterSpacing: '-0.02em'}}>
            <Write p={range(f, END.done, END.done + 51, 0, 1, E.inOut)}>Consider it done.</Write>
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 742, textAlign: 'center'}}>
          <div style={{...BODY, fontWeight: 600, fontSize: 44, lineHeight: 1.1, letterSpacing: '0.005em', opacity: on(END.url)}}>floridasouth.us</div>
          <div style={{...BODY, marginTop: 14, fontSize: 23, color: C.onSky, opacity: on(END.url + 14)}}>Website redesign concept, October 2026</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
