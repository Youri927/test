import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {CameraRig} from '../../lib/camera';
import {Wordmark} from '../Bits';
import {BEAT, C, E, F, range, steps} from '../util';

export const OPEN_LEN = 7 * BEAT;

// Grésillement de la torche (images après l'allumage → part du rayon), comme sur le site
const FLICKER: [number, number][] = [[0, 0], [4, 0.5], [7, 0.04], [11, 0.8], [15, 0.25], [20, 1]];
const ON = 14;
const MOTES = Array.from({length: 70}, (_, i) => ({
  x: random(`mx${i}`) * 1920,
  y: random(`my${i}`) * 1080,
  s: 1 + random(`ms${i}`) * 2.2,
  v: 0.25 + random(`mv${i}`) * 0.5,
  p: random(`mp${i}`) * Math.PI * 2,
}));

const Block: React.FC<{lit: boolean}> = ({lit}) => {
  const ink = lit ? C.chalk : C.shade;
  return (
    <div style={{position: 'absolute', left: 150, top: 272}}>
      <Wordmark size={50} color={ink} two={lit ? C.tungsten : C.shade} />
      <div style={{marginTop: 46, fontFamily: F.display, fontWeight: 800, fontSize: 286, lineHeight: 0.82, textTransform: 'uppercase', color: ink, letterSpacing: '0.005em'}}>
        Le nouveau
        <br />
        site.
      </div>
      <div style={{marginTop: 44, fontFamily: F.body, fontWeight: 500, fontSize: 36, color: lit ? C.chalk : C.shade, opacity: lit ? 0.92 : 1}}>
        Escape game à Soissons <span style={{color: lit ? C.tungsten : C.shade}}>·</span> concept de refonte, octobre 2026
      </div>
    </div>
  );
};

/** Ouverture : la torche du site s'allume et révèle le titre de la vidéo */
export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const rf = f < ON ? 0 : steps(f - ON, FLICKER);
  const sweep = range(f, ON + 18, 148, 0, 1, E.inOut);
  const tx = 210 + 1230 * sweep;
  const ty = 600 - 170 * Math.sin(sweep * Math.PI);
  const grow = range(f, 150, 200, 1, 6.5, E.inOut);
  const R = 340 * rf * grow;
  const mask = `radial-gradient(circle ${R.toFixed(1)}px at ${tx.toFixed(1)}px ${ty.toFixed(1)}px, #000 0%, rgba(0,0,0,.92) 30%, rgba(0,0,0,.35) 70%, transparent 100%)`;
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <CameraRig
        blur={1.1}
        keys={[
          {f: 0, x: 960, y: 540, s: 1.07, rz: -0.6},
          {f: 205, x: 960, y: 540, s: 1.0, rz: 0, ease: E.sine},
          {f: OPEN_LEN, x: 1010, y: 520, s: 1.55, rz: 1.2, ease: E.in},
        ]}
      >
        <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}}>
          <Block lit={false} />
          <div style={{position: 'absolute', inset: 0, WebkitMaskImage: mask, maskImage: mask}}>
            <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
              <filter id="openwall">
                <feTurbulence type="fractalNoise" baseFrequency="0.006 0.011" numOctaves={5} seed={3} />
                <feColorMatrix type="matrix" values="0 0 0 0 0.44  0 0 0 0 0.47  0 0 0 0 0.52  0 0 0 1.1 -0.2" />
              </filter>
              <rect width={1920} height={1080} fill="#1a2433" />
              <rect width={1920} height={1080} filter="url(#openwall)" opacity={0.8} />
            </svg>
            <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(255,214,150,.18), transparent 70%)'}} />
            <Block lit />
          </div>
          {/* poussière dans le faisceau */}
          {R > 8
            ? MOTES.map((m, i) => {
                const y = (m.y - f * m.v * 2 + 1080 * 4) % 1080;
                const x = m.x + Math.sin(f / 40 + m.p) * 14;
                const d = Math.hypot(x - tx, y - ty) / R;
                if (d >= 1) return null;
                const a = (1 - d) * (1 - d) * (0.55 + 0.45 * Math.sin(f / 9 + m.p * 3));
                return <div key={i} style={{position: 'absolute', left: x, top: y, width: m.s * 2, height: m.s * 2, borderRadius: '50%', background: `rgba(255, 226, 178, ${(a * 0.8).toFixed(3)})`}} />;
              })
            : null}
        </div>
      </CameraRig>
    </AbsoluteFill>
  );
};
