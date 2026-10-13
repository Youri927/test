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

/* ——— Les soins : le nom d'une famille s'élargit au survol et sa photo passe dans le cadre ; une famille s'ouvre ——— */
export const AfterTreatments: React.FC = () => (
  <Shot scene="Treatments" clip={clipOf(M.dSvc, 'Treatments')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption
      title="Every treatment, one frame"
      text="Five families, 55 treatments, with the facts that matter. Hover a family: its name widens like your logo, and its photo slides into the frame."
      at={14}
      out={LEN.Treatments - 2}
      side="left"
      {...cap}
    />
  </Shot>
);

/* ——— Les résultats : un filtre, les avant/après de la famille montent ——— */
export const AfterResults: React.FC = () => (
  <Shot scene="Results" clip={clipOf(M.dRes, 'Results')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption
      title="Only your own results"
      text="38 before-and-afters from your clients, each with its treatment and its provider. One click filters them by family."
      at={14}
      out={LEN.Results - 2}
      side="right"
      {...cap}
    />
  </Shot>
);

/* ——— L'équipe : le cadre se trace autour de la photo de groupe, puis les responsables ——— */
export const AfterTeam: React.FC = () => (
  <Shot scene="Team" clip={clipOf(M.dTeam, 'Team')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption
      title="Credentials first"
      text="The whole team, framed as the photo scrolls into view. Then your leads and their credentials."
      at={14}
      out={LEN.Team - 2}
      tone="dark"
      side="left"
      {...cap}
    />
  </Shot>
);

/* ——— Le Beauty Bank : le curseur tiré jusqu'à 12 mois, le crédit qui monte ——— */
export const AfterBank: React.FC = () => (
  <Shot scene="Bank" clip={clipOf(M.dBank, 'Bank')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption
      title="Beauty Bank at a glance"
      text="Slide the months and watch the credit add up: $99 a month, credited to the account, and it never expires."
      at={14}
      out={LEN.Bank - 2}
      side="right"
      {...cap}
    />
  </Shot>
);

/* ——— La visite : la carte, et le cadre du logo qui se pose sur le cabinet ——— */
export const AfterVisit: React.FC = () => (
  <Shot scene="Visit" clip={clipOf(M.dVisit, 'Visit')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption
      title="Find the hideout"
      text="A map drawn from OpenStreetMap. As it scrolls in, the frame of your logo lands on 1342 Colonial Blvd."
      at={14}
      out={LEN.Visit - 2}
      side="left"
      {...cap}
    />
  </Shot>
);

/* ——— Sur téléphone : les trois téléphones montent à leur place d'un seul mouvement, puis ne bougent plus ——— */
const PW = 380;
const PHONES = [
  {x: 560, clip: {meta: M.mOpen, ...PHONE_TIMING.mOpen}, at: 0},
  {x: 960, clip: {meta: M.mSvc, ...PHONE_TIMING.mSvc}, at: 8},
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
        <div style={{...H2, fontSize: 62, color: C.ink}}>On a phone</div>
        <div style={{...BODY, marginTop: 16, fontSize: 26, color: C.ink2}}>The same opening in portrait, each family with its photo in the frame, and Book now always a tap away.</div>
      </div>
    </AbsoluteFill>
  );
};
