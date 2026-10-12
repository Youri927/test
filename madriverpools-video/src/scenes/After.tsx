import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Caption} from '../Bits';
import {M} from '../clips';
import {CameraRig, CamKey} from '../lib/camera';
import {BrowserAt, aside, asideBottom, asideWidth} from '../Stage';
import {Clip, Phone, phoneDims} from '../Screen';
import {PHONE_TIMING, TIMING} from '../beats.ts';
import {BG, LEN} from '../timeline';
import {BODY, C, E, H2, range} from '../util';
import {B, SIDE} from './Open';

const clipOf = (meta: Clip['meta'], scene: string): Clip => ({meta, ...TIMING[scene]});
const cap = {width: asideWidth(B, SIDE), bottom: asideBottom(B, SIDE)};

/**
 * Une partie du site : le navigateur rangé d'un côté, immobile (le site défile dedans, à vitesse 1), la légende de l'autre.
 * Aucun mouvement de caméra pendant le plan : rien ne dérive, rien ne sautille.
 */
const Shot: React.FC<{scene: string; keys: CamKey[]; clip: Clip; dark?: boolean; children?: React.ReactNode}> = ({scene, keys, clip, dark, children}) => (
  <AbsoluteFill style={{background: BG[scene]}}>
    <CameraRig keys={keys}>
      <BrowserAt b={B} clip={clip} dark={dark} />
    </CameraRig>
    {children}
  </AbsoluteFill>
);

/* ——— Trois façons de construire, puis le graphique « From dig to deck » qui se trace ——— */
export const AfterPools: React.FC = () => (
  <Shot scene="Pools" clip={clipOf(M.dPools, 'Pools')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption title="Three pools, side by side" text="Concrete, fiberglass and vinyl liner, each with its facts, and how many weeks each takes from dig to deck." at={14} out={LEN.Pools - 2} side="right" {...cap} />
  </Shot>
);

/* ——— Les formes à l'échelle : trois formes choisies, le contour se remplit, la photo du vrai bassin change ——— */
export const AfterShapes: React.FC = () => (
  <Shot scene="Shapes" clip={clipOf(M.dShapes, 'Shapes')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption title="Your shapes, drawn to scale" text="Eight vinyl liner pools you’ve installed, all at the same scale. Pick one to see the real pool." at={14} out={LEN.Shapes - 2} side="left" {...cap} />
  </Shot>
);

/* ——— « One call covers the whole project » : les neuf éléments se surlignent un à un ——— */
export const AfterOneCall: React.FC = () => (
  <Shot scene="OneCall" clip={clipOf(M.dOnecall, 'OneCall')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption title="One call for the whole project" text="From the permits to the retaining walls: everything you take care of, set as one sentence." at={14} out={LEN.OneCall - 2} side="right" {...cap} />
  </Shot>
);

/* ——— La rénovation : l'onglet du béton, l'après qui se dévoile à côté de l'avant, puis le projet 2 ——— */
export const AfterReno: React.FC = () => (
  <Shot scene="Reno" clip={clipOf(M.dReno, 'Reno')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption title="Renovation, by problem" text="Pick what’s wrong with the pool, and the after appears right beside the before." at={14} out={LEN.Reno - 2} side="left" {...cap} />
  </Shot>
);

/* ——— La visite gratuite, sur une de leurs piscines éclairée la nuit ——— */
export const AfterVisit: React.FC = () => (
  <Shot scene="Visit" dark clip={clipOf(M.dVisit, 'Visit')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption title="A free home visit" text="One of your pools lit up at night, open or closed in Maitland time, and a form that writes the email." at={14} out={LEN.Visit - 2} tone="dark" side="right" {...cap} />
  </Shot>
);

/* ——— Sur téléphone : les trois téléphones montent à leur place d'un seul mouvement, puis ne bougent plus ——— */
const PW = 380;
const PHONES = [
  {x: 560, clip: {meta: M.mOpen, ...PHONE_TIMING.mOpen}, at: 0},
  {x: 960, clip: {meta: M.mShapes, ...PHONE_TIMING.mShapes}, at: 8},
  {x: 1360, clip: {meta: M.mReno, ...PHONE_TIMING.mReno}, at: 16},
];
export const AfterMobile: React.FC = () => {
  const f = useCurrentFrame();
  const ph = phoneDims(PW).h;
  return (
    <AbsoluteFill style={{background: BG.Mobile}}>
      {PHONES.map((p, i) => {
        const rise = range(f, p.at, p.at + 50, 760, 0, E.out);
        return (
          <div
            key={i}
            style={{position: 'absolute', left: p.x - PW / 2, top: 240, width: PW, height: ph, transform: `translate3d(0, ${rise.toFixed(3)}px, 0)`, willChange: 'transform'}}
          >
            <Phone clip={p.clip} w={PW} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 64, textAlign: 'center', opacity: range(f, 26, 52)}}>
        <div style={{...H2, fontSize: 60, color: C.ink}}>On a phone</div>
        <div style={{...BODY, marginTop: 16, fontSize: 26, color: C.ink2}}>The plan draws itself, the chosen shape stays in view, before and after go full width.</div>
      </div>
    </AbsoluteFill>
  );
};
