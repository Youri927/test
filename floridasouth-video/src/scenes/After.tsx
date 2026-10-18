import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Caption, Write} from '../Bits';
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

/* ——— Ce qu'ils font : les cadres s'ouvrent à la mesure du chantier ——— */
export const AfterWork: React.FC = () => (
  <Shot scene="Work" clip={clipOf(M.dWork, 'Work')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption
      title={['Sized to', 'the job']}
      text="Three rows for what you do: a repair, a remodel, a new house. Each photo’s frame opens as it comes up, a little for the small job, all the way to the edges of the screen for the house."
      at={14}
      side="left"
      {...cap}
    />
  </Shot>
);

/* ——— Les deux maisons, et la visionneuse ——— */
export const AfterHouses: React.FC = () => (
  <Shot scene="Houses" clip={clipOf(M.dHouses, 'Houses')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption
      title={['Two houses', 'you built']}
      text="Fifteen photos of the raised house and the block house in the pines, each captioned for what it shows. Click one and it grows from its place into a viewer."
      at={14}
      side="right"
      {...cap}
    />
  </Shot>
);

/* ——— Judson et la licence ——— */
export const AfterJudson: React.FC = () => (
  <Shot scene="Judson" clip={clipOf(M.dJudson, 'Judson')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption
      title={['Judson, and', 'the license']}
      text="Judson White, president: the quote, the three commitments, then the state license itself, with its number, holder and dates, and a link to check it on the State of Florida’s site."
      at={14}
      side="left"
      {...cap}
    />
  </Shot>
);

/* ——— Les avis, lus mot à mot ——— */
export const AfterReviews: React.FC = () => (
  <Shot scene="Reviews" clip={clipOf(M.dReviews, 'Reviews')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption
      title={['Read word', 'by word']}
      text="Your two reviews, quoted word for word. They light up from gray to ink as the page scrolls, as if read aloud."
      at={14}
      side="right"
      {...cap}
    />
  </Shot>
);

/* ——— La demande : la liste, écrite ligne par ligne, devient un e-mail ——— */
export const AfterEstimate: React.FC = () => (
  <Shot scene="Estimate" clip={clipOf(M.dEstimate, 'Estimate')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption
      title={['Send us', 'your list']}
      text="One job per line, big or small. The page writes the email to you, ready to send from the customer’s own email app. Nothing is sent from the page itself."
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
  {x: 1360, clip: {meta: M.mViewer, ...PHONE_TIMING.mViewer}, at: 16},
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
      <div style={{position: 'absolute', left: 0, right: 0, top: 58, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{...H2, fontSize: 68, color: C.ink}}>
          <Write p={range(f, 20, 71, 0, 1, E.inOut)}>On a phone</Write>
        </div>
        <div style={{...BODY, marginTop: 14, fontSize: 26, color: C.slate, opacity: range(f, 50, 80, 0, 1, E.sine)}}>
          The list on the sky, the menu under a thumb, and the photos to swipe through.
        </div>
      </div>
    </AbsoluteFill>
  );
};
