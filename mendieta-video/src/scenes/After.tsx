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
      <BrowserAt b={B} clip={clip} />
    </CameraRig>
    {children}
  </AbsoluteFill>
);

/* ——— Couche par couche : la coupe se monte au fil du défilement, chaque étape avec la photo d'un de leurs chantiers ——— */
export const AfterLayers: React.FC = () => (
  <Shot scene="Layers" clip={clipOf(M.dLayers, 'Layers')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption
      title="Layer by layer"
      text="Scroll, and a tile roof builds itself: off to the deck, underlayment, then tile from the eave up. Every step is a photo from one of your jobs."
      at={14}
      out={LEN.Layers - 2}
      side="left"
      {...cap}
    />
  </Shot>
);

/* ——— Les photos : en rangs de tuiles, puis le filtre « Tile » ——— */
export const AfterPhotos: React.FC = () => (
  <Shot scene="Photos" clip={clipOf(M.dPhotos, 'Photos')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption
      title="Your work, laid like tile"
      text="21 photos from your jobs, in courses of four and three. One click shows only tile, shingle, or your crew at work."
      at={14}
      out={LEN.Photos - 2}
      side="right"
      {...cap}
    />
  </Shot>
);

/* ——— La preuve : les avis, puis la licence ——— */
export const AfterProof: React.FC = () => (
  <Shot scene="Proof" clip={clipOf(M.dProof, 'Proof')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption
      title="Proof, not promises"
      text="Your 16 five-star reviews, then your Florida license in full: CCC1328504, held by Mario M. Mendieta, active through 2028."
      at={14}
      out={LEN.Proof - 2}
      side="left"
      {...cap}
    />
  </Shot>
);

/* ——— Le secteur : la vraie carte, et « Check your city » ——— */
export const AfterArea: React.FC = () => (
  <Shot scene="Area" clip={clipOf(M.dArea, 'Area')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption
      title="25 cities, on the real map"
      text="City limits from the U.S. Census. Type a city: it lights up on the map, with its county."
      at={14}
      out={LEN.Area - 2}
      side="right"
      {...cap}
    />
  </Shot>
);

/* ——— Le devis : le formulaire rédige le texto ——— */
export const AfterEstimate: React.FC = () => (
  <Shot scene="Estimate" clip={clipOf(M.dEstimate, 'Estimate')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption
      title="A free estimate, by text"
      text="Pick the roof and the job, add a name and a number: the page writes the text to your cell. On a phone, it opens the messages app."
      at={14}
      out={LEN.Estimate - 2}
      side="left"
      {...cap}
    />
  </Shot>
);

/* ——— Sur téléphone : les trois téléphones montent à leur place d'un seul mouvement, puis ne bougent plus ——— */
const PW = 380;
const PHONES = [
  {x: 560, clip: {meta: M.mOpen, ...PHONE_TIMING.mOpen}, at: 0},
  {x: 960, clip: {meta: M.mLayers, ...PHONE_TIMING.mLayers}, at: 8},
  {x: 1360, clip: {meta: M.mPhotos, ...PHONE_TIMING.mPhotos}, at: 16},
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
        <div style={{...BODY, marginTop: 16, fontSize: 26, color: C.ink2}}>The opening in portrait, the drawing pinned while the steps scroll by, and your photos two by two, with Call one tap away.</div>
      </div>
    </AbsoluteFill>
  );
};
