import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CameraRig, Place} from '../../lib/camera';
import {LockDrum} from '../Bits';
import {C, F, G} from '../theme';
import {E, pop, range} from '../util';

export const OFFER_LEN = 45;
const DIG = Array.from({length: 10}, (_, i) => i);
const STEPS = [6, 13, 20];

const Col: React.FC<{v: number}> = ({v}) => (
  <span style={{display: 'inline-flex', height: '1em', overflow: 'hidden'}}>
    <span style={{display: 'flex', flexDirection: 'column', transform: `translateY(${-v}em)`}}>
      {DIG.map((d) => (
        <span key={d} style={{display: 'block', height: '1em', textAlign: 'center'}}>
          {d}
        </span>
      ))}
    </span>
  </span>
);

/** 10,6 – 12,6 s : le cadenas tourne de 3 à 6 joueurs, le prix par joueur descend de 29 € à 21 €. */
export const Offer: React.FC = () => {
  const f = useCurrentFrame();
  const p = STEPS.map((s) => pop(f, s, 240, 17));
  const sel = p[0] + p[1] + p[2];
  const ones = 9 - 4 * p[0] - 2 * p[1] - 2 * p[2];
  const team = 3 + Math.round(sel);
  const head = pop(f, 0, 200, 18);
  const last = range(f, 26, 36, 0, 1, E.out);
  return (
    <AbsoluteFill style={{background: `radial-gradient(70% 40% at 60% 48%, #13202f 0%, ${C.ink} 72%)`}}>
      <CameraRig keys={[{f: 0, x: 540, y: 960, s: 0.8, ry: -24, rz: 2}, {f: 12, s: 1.0, ry: -7, rz: 0, ease: E.out}, {f: OFFER_LEN, s: 1.06, ry: 7, ease: E.sine}]}>
        <Place x={540} y={960} w={1080} h={1920}>
          <div
            style={{
              position: 'absolute',
              left: G - 6,
              top: 290,
              fontFamily: F.display,
              fontWeight: 900,
              fontSize: 168,
              lineHeight: 1.04,
              textTransform: 'uppercase',
              color: C.chalk,
              opacity: Math.min(1, head * 2),
              transformOrigin: 'left center',
              transform: `scale(${0.9 + 0.1 * head})`,
            }}
          >
            Combien
            <br />
            êtes-vous&#8239;?
          </div>
          <div style={{position: 'absolute', left: G, top: 730}}>
            <LockDrum sel={sel} width={290} height={470} />
          </div>
          <div style={{position: 'absolute', left: 430, top: 776}}>
            <div style={{display: 'flex', alignItems: 'flex-start', fontFamily: F.display, fontWeight: 900, fontSize: 330, lineHeight: 1, color: C.tungsten, fontVariantNumeric: 'tabular-nums', filter: 'drop-shadow(0 0 50px rgba(255, 198, 110, 0.28))'}}>
              <Col v={2} />
              <Col v={ones} />
              <span style={{fontWeight: 300, fontSize: '0.36em', marginLeft: '0.08em', marginTop: '0.12em', color: 'rgba(255, 198, 110, 0.8)'}}>€</span>
            </div>
            <div style={{marginTop: 14, fontFamily: F.body, fontWeight: 500, fontSize: 40, color: C.mist}}>par joueur</div>
            <div style={{marginTop: 6, fontFamily: F.body, fontWeight: 700, fontSize: 46, color: C.chalk, fontVariantNumeric: 'tabular-nums'}}>à {team} joueurs</div>
          </div>
          <div
            style={{
              position: 'absolute',
              left: G,
              top: 1300,
              fontFamily: F.body,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 54,
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              color: C.chalk,
              opacity: last,
              transform: `translateY(${(1 - last) * 30}px)`,
            }}
          >
            Plus vous êtes nombreux,
            <br />
            moins c’est cher.
          </div>
        </Place>
      </CameraRig>
    </AbsoluteFill>
  );
};
