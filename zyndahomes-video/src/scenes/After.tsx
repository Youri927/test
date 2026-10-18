import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Caption, Rise, rise} from '../Bits';
import {M} from '../clips';
import {CameraRig, CamKey} from '../lib/camera';
import {BrowserAt, aside, asideBottom, asideWidth} from '../Stage';
import {Clip, Phone, phoneDims} from '../Screen';
import {PHONE_TIMING, TIMING} from '../beats.ts';
import {BG} from '../timeline';
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
      <BrowserAt b={B} clip={clip} />
    </CameraRig>
    {children}
  </AbsoluteFill>
);

/* ——— L'année : le cadran mené par le défilement ——— */
export const AfterYear: React.FC = () => (
  <Shot scene="Year" clip={clipOf(M.dYear, 'Year')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption
      title={['Your year,', 'on a dial']}
      text="Plan in winter, start in May, on site every day, home by October 1st. The dial follows the page, and it knows today’s date."
      at={14}
      side="left"
      {...cap}
    />
  </Shot>
);

/* ——— Les pièces : seulement leurs photos, qui se découvrent en entrant à l'écran ——— */
export const AfterWork: React.FC = () => (
  <Shot scene="Work" clip={clipOf(M.dWork, 'Work')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption
      title={['Only your', 'own photos']}
      text="Real rooms you built, never enlarged, each with a short caption. Your clients’ reviews sit next to the work they describe."
      at={14}
      side="right"
      {...cap}
    />
  </Shot>
);

/* ——— Les détails : les gros plans, et la pièce entière dans la visionneuse ——— */
export const AfterDetails: React.FC = () => (
  <Shot scene="Details" clip={clipOf(M.dDetails, 'Details')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption
      title={['The details,', 'up close']}
      text="Six close-ups from your own photos: the blue stone, the scale tile, the glass stair. Click one and the whole room opens."
      at={14}
      side="left"
      {...cap}
    />
  </Shot>
);

/* ——— Les prestations : chaque ligne découvre sa photo, à sa place ——— */
export const AfterServices: React.FC = () => (
  <Shot scene="Services" clip={clipOf(M.dServices, 'Services')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption
      title={['What you', 'build']}
      text="Seven lines, from custom homes to outdoor kitchens. Each one uncovers its photo in place, without chasing the mouse."
      at={14}
      side="right"
      {...cap}
    />
  </Shot>
);

/* ——— La demande : la fenêtre d'absence, et l'e-mail écrit pour Zynda ——— */
export const AfterContact: React.FC = () => (
  <Shot scene="Contact" clip={clipOf(M.dContact, 'Contact')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption
      title={['When are', 'you away?']}
      text="Owners pick the month they leave and the month they’re back: the window is drawn over the condo season, then the request is written into an email to you."
      at={14}
      side="left"
      {...cap}
    />
  </Shot>
);

/* ——— Sur téléphone : les trois téléphones montent à leur place d'un seul mouvement, puis ne bougent plus ——— */
const PW = 380;
const PHONES = [
  {x: 560, clip: {meta: M.mOpen, ...PHONE_TIMING.mOpen}, at: 0},
  {x: 960, clip: {meta: M.mMenu, ...PHONE_TIMING.mMenu}, at: 8},
  {x: 1360, clip: {meta: M.mSwatch, ...PHONE_TIMING.mSwatch}, at: 16},
];
export const AfterMobile: React.FC = () => {
  const f = useCurrentFrame();
  const ph = phoneDims(PW).h;
  return (
    <AbsoluteFill style={{background: BG.Mobile}}>
      {PHONES.map((p, i) => {
        const y = range(f, p.at, p.at + 50, 760, 0, E.out);
        return (
          <div
            key={i}
            style={{position: 'absolute', left: p.x - PW / 2, top: 240, width: PW, height: ph, transform: `translate3d(0, ${y.toFixed(3)}px, 0)`, willChange: 'transform'}}
          >
            <Phone clip={p.clip} w={PW} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 56, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{...H2, fontSize: 70, color: C.ink}}>
          <Rise p={rise(f, 20)}>On a phone</Rise>
        </div>
        <div style={{...BODY, marginTop: 14, fontSize: 26, color: C.vein, opacity: range(f, 46, 100, 0, 1, E.out)}}>
          The Z in a hand, the menu under a thumb, the close-ups to swipe through.
        </div>
      </div>
    </AbsoluteFill>
  );
};
