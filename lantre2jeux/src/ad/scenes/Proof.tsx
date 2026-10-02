import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CameraRig, Place} from '../../lib/camera';
import {Stars} from '../Bits';
import {C, F} from '../theme';
import {E, range} from '../util';

export const PROOF_LEN = 50;
const DIG = Array.from({length: 10}, (_, i) => i);

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

const Quote: React.FC<{children: React.ReactNode; at: number; top: number}> = ({children, at, top}) => {
  const f = useCurrentFrame();
  const t = range(f, at, at + 12, 0, 1, E.out);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top,
        textAlign: 'center',
        fontFamily: F.body,
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: 66,
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
        color: C.chalk,
        opacity: t,
        transform: `translateY(${(1 - t) * 36}px)`,
      }}
    >
      <span style={{color: C.tungsten, fontStyle: 'normal'}}>«&nbsp;</span>
      {children}
      <span style={{color: C.tungsten, fontStyle: 'normal'}}>&nbsp;»</span>
    </div>
  );
};

/** 8,4 – 10,6 s : la preuve sociale. */
export const Proof: React.FC = () => {
  const f = useCurrentFrame();
  const roll = range(f, 2, 18, 0, 1, E.out);
  const shown = range(f, 1, 8);
  return (
    <AbsoluteFill style={{background: `radial-gradient(70% 40% at 50% 44%, #13202f 0%, ${C.ink} 70%)`}}>
      <CameraRig
        keys={[
          {f: 0, x: 540, y: 960, s: 0.82, ry: 26, rx: 10, rz: -3},
          {f: 14, s: 1.0, ry: 0, rx: 0, rz: 0, ease: E.out},
          {f: 42, s: 1.05, ry: -2, ease: E.sine},
          {f: PROOF_LEN, s: 1.6, ry: -8, ease: E.in},
        ]}
      >
        <Place x={540} y={960} w={1080} h={1920}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center'}}>
            <Stars value={range(f, 4, 20, 0, 4.6, E.out)} size={96} gap={16} />
          </div>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 610,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'baseline',
              fontFamily: F.display,
              fontWeight: 900,
              fontSize: 430,
              lineHeight: 1,
              color: C.tungsten,
              fontVariantNumeric: 'tabular-nums',
              filter: 'drop-shadow(0 0 60px rgba(255, 198, 110, 0.3))',
              opacity: shown,
            }}
          >
            <Col v={2 + 2 * roll} />
            <span style={{marginRight: '-0.04em'}}>,</span>
            <Col v={1 + 5 * roll} />
            <span style={{fontWeight: 300, fontSize: '0.28em', color: C.mist, marginLeft: '0.2em'}}>/5</span>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1066, textAlign: 'center', fontFamily: F.body, fontWeight: 500, fontSize: 40, color: C.mist, opacity: range(f, 10, 18)}}>
            Note moyenne sur 62 avis de joueurs
          </div>
          <Quote at={14} top={1170}>Accueil très amical</Quote>
          <Quote at={20} top={1262}>Animateurs au top</Quote>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1372, textAlign: 'center', fontFamily: F.body, fontSize: 30, color: C.mist, opacity: range(f, 26, 34)}}>
            Extraits d’avis sur The Escapers
          </div>
        </Place>
      </CameraRig>
    </AbsoluteFill>
  );
};
