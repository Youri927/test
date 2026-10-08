import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Line, LogoMark, PORTRAIT, SMILE, Smile, buildAt, type Focus} from '../Bits';
import {END} from '../beats.ts';
import {LEN, pre} from '../timeline';
import {BODY, C, DISPLAY, E, F, H2, range} from '../util';

// le portrait dans une grande pastille verticale, à droite
const WIN = {x: 1188, y: 112, w: 588, h: 856};
// cadrage final : le visage, sur toute la hauteur de la photo
const FACE: Focus = {x: 1045 - (PORTRAIT.h * WIN.w) / WIN.h / 2, y: 0, w: (PORTRAIT.h * WIN.w) / WIN.h, h: PORTRAIT.h};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Fin : le logo, le nom, le téléphone et l'adresse ; à droite, le sourire du titre s'ouvre en grand portrait ; fondu final */
export const End: React.FC = () => {
  const t = useCurrentFrame() - pre('End');
  const len = LEN.End;
  const shift = (at: number) => range(t, at, at + 50, 118, 0, E.out);
  const up = (at: number) => ({opacity: range(t, at, at + 30, 0, 1), transform: `translateY(${range(t, at, at + 40, 20, 0, E.out)}px)`});
  const out = range(t, len - 44, len - 4, 1, 0, E.inOut);
  // la pastille : elle part de la taille du sourire dans le titre du site et s'ouvre en portrait
  const p = E.pill(range(t, END.pill, END.pill + 80));
  const pw = lerp(300, WIN.w, p);
  const ph = lerp(110, WIN.h, p);
  const focus: Focus = {x: lerp(SMILE.x, FACE.x, p), y: lerp(SMILE.y, FACE.y, p), w: lerp(SMILE.w, FACE.w, p), h: lerp(SMILE.h, FACE.h, p)};
  const drift = range(t, END.pill + 80, len, 1, 1.05);
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <AbsoluteFill style={{opacity: out}}>
        <div style={{position: 'absolute', left: 150, top: 150}}>
          <LogoMark height={150} crown={C.white} build={buildAt(t, END.logo)} />
        </div>
        <div style={{position: 'absolute', left: 150, top: 352, ...H2, fontSize: 66, color: C.white}}>
          <Line shift={shift(40)}>Implant and Comprehensive</Line>
          <Line shift={shift(48)}>Dentistry of Naples</Line>
        </div>
        <div style={{position: 'absolute', left: 152, top: 520, ...BODY, fontSize: 26, color: 'rgba(255,255,255,.7)', ...up(END.phone - 14)}}>Call the office</div>
        <div style={{position: 'absolute', left: 146, top: 560, ...DISPLAY, fontSize: 128, letterSpacing: '-0.04em', color: C.white, ...up(END.phone)}}>(239) 241-2951</div>
        <div style={{position: 'absolute', left: 152, top: 704, width: 128, height: 6, borderRadius: 3, background: C.teal, transformOrigin: '0 50%', transform: `scaleX(${range(t, END.phone + 16, END.phone + 56, 0, 1, E.out)})`}} />
        <div style={{position: 'absolute', left: 152, top: 742, fontFamily: F.sans, fontSize: 23, lineHeight: 1.65, color: 'rgba(255,255,255,.68)', ...up(END.phone + 30)}}>
          4280 Tamiami Trail East, Unit 201, Naples, FL 34112
          <br />
          naplescomprehensivedentist.com · Website redesign concept, October 2026
        </div>
        {p > 0 ? (
          <div
            style={{
              position: 'absolute',
              left: WIN.x + WIN.w / 2 - pw / 2,
              top: WIN.y + WIN.h / 2 - ph / 2,
              width: pw,
              height: ph,
              borderRadius: Math.min(pw, ph) / 2,
              overflow: 'hidden',
              clipPath: `inset(0 ${(1 - range(t, END.pill, END.pill + 30, 0, 1, E.out)) * 46}% round ${Math.min(pw, ph) / 2}px)`,
            }}
          >
            <div style={{transform: `scale(${drift})`, transformOrigin: '50% 40%'}}>
              <Smile w={pw} h={ph} focus={focus} />
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
