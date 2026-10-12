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
const Shot: React.FC<{scene: string; keys: CamKey[]; clip: Clip; children?: React.ReactNode}> = ({scene, keys, clip, children}) => (
  <AbsoluteFill style={{background: BG[scene]}}>
    <CameraRig keys={keys}>
      <BrowserAt b={B} clip={clip} dark={scene === 'Team'} />
    </CameraRig>
    {children}
  </AbsoluteFill>
);

/* ——— L'orthodontie cachée : la page descend jusqu'au cas, dont les trois étapes s'allument une à une ——— */
export const AfterStraight: React.FC = () => (
  <Shot scene="Straight" clip={clipOf(M.dStraight, 'Straight')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption title="The wire behind the teeth" text="One of your patients, before, mid-treatment and five months later. The timeline draws itself as the case comes into view." at={14} out={LEN.Straight - 2} side="left" {...cap} />
  </Shot>
);

/* ——— Les soins : un soin s'ouvre, puis deux mots donnent leur définition ——— */
export const AfterCare: React.FC = () => (
  <Shot scene="Care" clip={clipOf(M.dCare, 'Care')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption title="Every word explained" text="Open a treatment to read about it. A dotted word shows its definition, quoted from your own dental dictionary." at={14} out={LEN.Care - 2} side="right" {...cap} />
  </Shot>
);

/* ——— L'équipe, devant la haie : Denise, puis Amanda ——— */
export const AfterTeam: React.FC = () => (
  <Shot scene="Team" clip={clipOf(M.dTeam, 'Team')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption title="The people patients will see" text="Eight portraits, eye to eye on the same hedge. Pick a face to read the bio." at={14} out={LEN.Team - 2} tone="hedge" side="left" {...cap} />
  </Shot>
);

/* ——— Ce que les patients remarquent : les engagements et leurs avis ——— */
export const AfterReviews: React.FC = () => (
  <Shot scene="Reviews" clip={clipOf(M.dReviews, 'Reviews')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption title="What your patients notice" text="Five promises, each backed by a real review, with first names only." at={14} out={LEN.Reviews - 2} side="right" {...cap} />
  </Shot>
);

/* ——— La visite : l'enseigne en bardage, la porte, la demande ; « Something hurts » renvoie au téléphone ——— */
export const AfterVisit: React.FC = () => (
  <Shot scene="Visit" clip={clipOf(M.dVisit, 'Visit')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption title="From the sign to the door" text="Your sign rebuilt in clapboard, the door on the porch, a request form. Pick “Something hurts” and it points to the phone." at={14} out={LEN.Visit - 2} side="left" {...cap} />
  </Shot>
);

/* ——— Sur téléphone : les trois téléphones montent à leur place d'un seul mouvement, puis ne bougent plus ——— */
const PW = 380;
const PHONES = [
  {x: 560, clip: {meta: M.mOpen, ...PHONE_TIMING.mOpen}, at: 0},
  {x: 960, clip: {meta: M.mTeam, ...PHONE_TIMING.mTeam}, at: 8},
  {x: 1360, clip: {meta: M.mDock, ...PHONE_TIMING.mDock}, at: 16},
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
        <div style={{...H2, fontSize: 62, color: C.blue}}>On a phone</div>
        <div style={{...BODY, marginTop: 16, fontSize: 26, color: C.ink2}}>The same sign on a 4:3 facade, the team at a swipe, and a call button that follows you down the page.</div>
      </div>
    </AbsoluteFill>
  );
};
