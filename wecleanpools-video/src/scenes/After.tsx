import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Caption} from '../Bits';
import {M} from '../clips';
import {CameraRig, CamKey} from '../lib/camera';
import {BrowserAt, aside, asideBottom, asideWidth, focus} from '../Stage';
import {Clip, Phone, phoneDims} from '../Screen';
import {PHONE_TIMING, TIMING} from '../beats.ts';
import {BG, LEN} from '../timeline';
import {BODY, C, E, H2, range} from '../util';
import {B, SIDE, WIDE} from './Open';

const clipOf = (meta: Clip['meta'], scene: string): Clip => ({meta, ...TIMING[scene]});
const cap = {width: asideWidth(B, SIDE), bottom: asideBottom(B, SIDE)};

/**
 * Une partie du site : le navigateur rangé d'un côté, immobile (le site défile dedans, à vitesse 1), la légende de l'autre.
 * Les seuls mouvements de caméra sont des déplacements francs, adoucis au départ et à l'arrivée.
 */
const Shot: React.FC<{scene: string; keys: CamKey[]; clip: Clip; dark?: boolean; children?: React.ReactNode}> = ({scene, keys, clip, dark, children}) => (
  <AbsoluteFill style={{background: BG[scene]}}>
    <CameraRig keys={keys}>
      <BrowserAt b={B} clip={clip} dark={dark} />
    </CameraRig>
    {children}
  </AbsoluteFill>
);

/* ——— L'entretien : chaque coche se trace quand on arrive à sa ligne, la tournée se remplit ——— */
export const AfterWeekly: React.FC = () => (
  <Shot scene="Weekly" clip={clipOf(M.dWeekly, 'Weekly')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption title="Every visit, checked off" text="Your weekly service as a checklist that draws itself, like a technician’s round." at={14} out={LEN.Weekly - 2} side="right" {...cap} />
  </Shot>
);

/* ——— Les prix : la vidange s'ouvre sur ce qui est fait et sur sa vraie paire avant/après ——— */
export const AfterPrices: React.FC = () => (
  <Shot scene="Prices" clip={clipOf(M.dPrices, 'Prices')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption title="Your prices, in plain sight" text="Each one-time job opens on what you do, with its real before and after photos." at={14} out={LEN.Prices - 2} side="left" {...cap} />
  </Shot>
);

/* ——— Les rénovations : le chantier 8, puis la photo maintenue (l'avant) ; la caméra s'approche pendant le maintien ——— */
export const AfterRemodels: React.FC = () => {
  const len = LEN.Remodels;
  return (
    <Shot
      scene="Remodels"
      clip={clipOf(M.dRemodels, 'Remodels')}
      keys={[
        aside(B, 'right', {f: 0, s: SIDE}),
        aside(B, 'right', {f: 140, s: SIDE}),
        // la photo maintenue de 180 à 288 : la caméra arrive juste avant, et repart après le lâcher
        focus(B, 497, 500, {f: 184, s: 0.9, ease: E.soft}),
        focus(B, 497, 500, {f: 300, s: 0.9}),
        {...WIDE, f: 352, ease: E.soft},
        {...WIDE, f: len},
      ]}
    >
      <Caption title="Hold to see the before" text="Nine of your remodels. Press and hold a photo to see the pool as you found it." at={10} out={148} side="right" {...cap} />
    </Shot>
  );
};

/* ——— Dallas, sur le grand bain : sa lettre et la licence qu'on vérifie ——— */
export const AfterDallas: React.FC = () => (
  <Shot scene="Dallas" dark clip={clipOf(M.dDallas, 'Dallas')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption title="A license anyone can check" text="Your story in your words, with TICL 410 linked to the state’s license search." at={14} out={LEN.Dallas - 2} tone="dark" side="right" {...cap} />
  </Shot>
);

/* ——— Le devis, sur une eau limpide ——— */
export const AfterEstimate: React.FC = () => (
  <Shot scene="Estimate" clip={clipOf(M.dEstimate, 'Estimate')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption title="Free estimate, on clear water" text="Open or closed in Texas time, and a form that writes the email for you." at={14} out={LEN.Estimate - 2} side="left" {...cap} />
  </Shot>
);

/* ——— Sur téléphone : les trois téléphones montent à leur place d'un seul mouvement, puis ne bougent plus ——— */
const PW = 380;
const PHONES = [
  {x: 560, clip: {meta: M.mOpen, ...PHONE_TIMING.mOpen}, at: 0},
  {x: 960, clip: {meta: M.mPrices, ...PHONE_TIMING.mPrices}, at: 8},
  {x: 1360, clip: {meta: M.mViewer, ...PHONE_TIMING.mViewer}, at: 16},
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
        <div style={{...H2, fontSize: 64, color: C.ink}}>On a phone</div>
        <div style={{...BODY, marginTop: 14, fontSize: 26, color: C.ink2}}>The water clears under your thumb, prices open, photos hold.</div>
      </div>
    </AbsoluteFill>
  );
};
