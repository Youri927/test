import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Caption, Line} from '../Bits';
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
      <BrowserAt b={B} clip={clip} />
    </CameraRig>
    {children}
  </AbsoluteFill>
);

/* ——— Les trois toits : une seule ligne de toit, qui s'aplatit ——— */
export const AfterRoofs: React.FC = () => (
  <Shot scene="Roofs" clip={clipOf(M.dRoofs, 'Roofs')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption
      title={['Three roofs,', 'one line']}
      text="A house, a mobile home, a flat commercial roof: one gold roofline goes from two gables to a flat roof, and the building changes with it. The numbers mark where each one leaks."
      at={14}
      out={LEN.Roofs - 2}
      side="left"
      {...cap}
    />
  </Shot>
);

/* ——— Après une tempête : la partie sombre ——— */
export const AfterStorm: React.FC = () => (
  <Shot scene="Storm" clip={clipOf(M.dStorm, 'Storm')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption
      title={['After a storm']}
      text="Your four steps, on site within five days or less, and the rotted decking found under the shingles. Then what to do while the roof is leaking."
      at={14}
      out={LEN.Storm - 2}
      side="right"
      {...cap}
    />
  </Shot>
);

/* ——— Réparer, recouvrir, remplacer, et la rangée des chantiers ——— */
export const AfterJob: React.FC = () => (
  <Shot scene="Job" clip={clipOf(M.dJob, 'Job')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption
      title={['Repair, reroof', 'or replace']}
      text="When each one fits. Then four photos from your job sites, uncovered at the pitch of a roof: tear-off, underlayment, new shingles, the finished roof."
      at={14}
      out={LEN.Job - 2}
      side="left"
      {...cap}
    />
  </Shot>
);

/* ——— Les garanties, sur une règle graduée en années ——— */
export const AfterWarranty: React.FC = () => (
  <Shot scene="Warranty" clip={clipOf(M.dWarranty, 'Warranty')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption
      title={['What’s covered']}
      text="Your warranties on a ruler marked in years: 10 years on your workmanship, 20 years No Dollar Limit on commercial roofs, 30 years to lifetime on shingles."
      at={14}
      out={LEN.Warranty - 2}
      side="right"
      {...cap}
    />
  </Shot>
);

/* ——— La famille : 1955, trois générations, la licence ——— */
export const AfterFamily: React.FC = () => (
  <Shot scene="Family" clip={clipOf(M.dFamily, 'Family')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption
      title={['Since 1955']}
      text="Troy Ray Jr. started Ray’s Roofing in 1955. Three generations later, your state license is on the page, and on the van, for anyone to check."
      at={14}
      out={LEN.Family - 2}
      side="left"
      {...cap}
    />
  </Shot>
);

/* ——— L'estimation : le formulaire écrit l'e-mail ——— */
export const AfterEstimate: React.FC = () => (
  <Shot scene="Estimate" clip={clipOf(M.dEstimate, 'Estimate')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption
      title={['A free estimate,', 'by email']}
      text="Pick the property and what it needs. The page writes the request to you, ready to send from the customer’s own email app."
      at={14}
      out={LEN.Estimate - 2}
      side="right"
      {...cap}
    />
  </Shot>
);

/* ——— Sur téléphone : les trois téléphones montent à leur place d'un seul mouvement, puis ne bougent plus ——— */
const PW = 380;
const PHONES = [
  {x: 560, clip: {meta: M.mOpen, ...PHONE_TIMING.mOpen}, at: 0},
  {x: 960, clip: {meta: M.mRoofs, ...PHONE_TIMING.mRoofs}, at: 8},
  {x: 1360, clip: {meta: M.mJob, ...PHONE_TIMING.mJob}, at: 16},
];
export const AfterMobile: React.FC = () => {
  const f = useCurrentFrame();
  const ph = phoneDims(PW).h;
  const rise = (k: number) => range(f, 22 + k * 5, 62 + k * 5, 104, 0, E.out);
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
        <div style={{...H2, fontSize: 66, color: C.asphalt}}>
          <Line shift={rise(0)}>On a phone</Line>
        </div>
        <div style={{...BODY, marginTop: 14, fontSize: 26, color: C.slate, opacity: range(f, 40, 66)}}>
          The roof of words, the three roofs under a thumb, and your job sites in a row that scrolls sideways.
        </div>
      </div>
    </AbsoluteFill>
  );
};
