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

/* ——— La pose, de nuit : la page descend jusqu'aux huit étapes, qui s'allument une à une ——— */
export const AfterBuild: React.FC = () => (
  <Shot scene="Build" dark clip={clipOf(M.dBuild, 'Build')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption title="Your machines, your crews" text="Eight steps, from the layout on the lawn to the first swim. They light up as the page scrolls." at={14} out={LEN.Build - 2} tone="dark" side="right" {...cap} />
  </Shot>
);

/* ——— La galerie, de jour : le filtre « By the water », puis une photo ouverte en grand ——— */
export const AfterWork: React.FC = () => (
  <Shot scene="Work" clip={clipOf(M.dWork, 'Work')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption title="Every pool is one of yours" text="34 photos of your pools, with five filters and a viewer that opens each one full size." at={14} out={LEN.Work - 2} side="left" {...cap} />
  </Shot>
);

/* ——— La nuit : la même piscine en blanc, en bleu, puis en rouge ——— */
export const AfterDark: React.FC = () => (
  <Shot scene="Dark" dark clip={clipOf(M.dDark, 'Dark')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption title="Pool time doesn’t end at sunset" text="One of your pools, photographed the same night in three colors. Pick one and the photo changes." at={14} out={LEN.Dark - 2} tone="dark" side="right" {...cap} />
  </Shot>
);

/* ——— Les avis, de jour : la grande citation, puis les premiers avis ——— */
export const AfterReviews: React.FC = () => (
  <Shot scene="Reviews" clip={clipOf(M.dReviews, 'Reviews')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption title="In your customers’ words" text="Ten real reviews, with first names and sources. Half of them name Jordan." at={14} out={LEN.Reviews - 2} side="left" {...cap} />
  </Shot>
);

/* ——— Le formulaire, de nuit : le sujet choisi décide de l'adresse, à côté des piscines d'exposition allumées ——— */
export const AfterPlan: React.FC = () => (
  <Shot scene="Plan" dark clip={clipOf(M.dPlan, 'Plan')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption title="Plan your pool" text="The topic you pick decides where the email goes: to sales or to service." at={14} out={LEN.Plan - 2} tone="dark" side="right" {...cap} />
  </Shot>
);

/* ——— Sur téléphone : les trois téléphones montent à leur place d'un seul mouvement, puis ne bougent plus ——— */
const PW = 380;
const PHONES = [
  {x: 560, clip: {meta: M.mOpen, ...PHONE_TIMING.mOpen}, at: 0, nightAt: M.mOpen.marks?.night},
  {x: 960, clip: {meta: M.mWork, ...PHONE_TIMING.mWork}, at: 8, nightAt: undefined},
  {x: 1360, clip: {meta: M.mHues, ...PHONE_TIMING.mHues}, at: 16, nightAt: undefined},
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
            <Phone clip={p.clip} w={PW} nightAt={p.nightAt} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 64, textAlign: 'center', opacity: range(f, 26, 52)}}>
        <div style={{...H2, fontSize: 62, color: C.ink}}>On a phone</div>
        <div style={{...BODY, marginTop: 16, fontSize: 26, color: C.ink2}}>The same switch, the same pools, the same lights, sized for a thumb.</div>
      </div>
    </AbsoluteFill>
  );
};
