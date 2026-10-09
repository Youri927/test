import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Caption} from '../Bits';
import {M} from '../clips';
import {CameraRig, CamKey} from '../lib/camera';
import {BrowserAt, Box, PhoneAt, focus} from '../Stage';
import {type Clip} from '../Screen';
import {PHONE_TIMING, TIMING} from '../beats.ts';
import {BG, LEN, pre} from '../timeline';
import {C, E, H2, range} from '../util';

const B: Box = {x: 960, y: 552, w: 1480};
const WIDE = {x: 960, y: 552, s: 1.0};

const clipOf = (meta: Clip['meta'], scene: string): Clip => ({meta, ...TIMING[scene]});

/** Fond de la scène (couleur de la section) et caméra ; les images clés sont en images de la séquence (règle comprise) */
const Shot: React.FC<{scene: string; keys: CamKey[]; clip: Clip; dark?: boolean; children?: React.ReactNode}> = ({scene, keys, clip, dark, children}) => (
  <AbsoluteFill style={{background: BG[scene]}}>
    <CameraRig blur={0.5} keys={keys}>
      <BrowserAt b={B} clip={clip} dark={dark} />
    </CameraRig>
    {children}
  </AbsoluteFill>
);

/* ——— L'accueil : « Hello Florida » monte ligne par ligne, le bassin se dévoile avec ses cotes ;
   survol de « Find your pool », puis le Billabong Cove laisse la place au Laguna ——— */
export const AfterHero: React.FC = () => {
  const len = pre('Hero') + LEN.Hero;
  return (
    <Shot
      scene="Hero"
      clip={clipOf(M.dHero, 'Hero')}
      keys={[
        focus(B, 380, 330, {f: 0, s: 1.5}),
        focus(B, 360, 380, {f: 130, s: 1.46, ease: E.sine}),
        focus(B, 270, 640, {f: 196, s: 1.55, ease: E.soft}),
        focus(B, 280, 650, {f: 262, s: 1.57, ease: E.sine}),
        {...WIDE, f: 336, s: 1.0, ry: -1.2, ease: E.soft},
        {...WIDE, f: 384, s: 1.03, ry: 0, ease: E.sine},
        focus(B, 1010, 410, {f: 440, s: 1.42, ease: E.soft}),
        focus(B, 1000, 420, {f: len, s: 1.46, ease: E.sine}),
      ]}
    >
      <Caption title="Their greeting, then a real pool" text="“Hello Florida” from their homepage, next to a Barrier Reef model drawn at its real proportions." at={300} out={len - 4} />
    </Shot>
  );
};

/* ——— La coque d'un seul tenant : le titre, la photo ; puis le chemin de l'usine au jardin,
   la caméra passe des quatre étapes de l'usine aux trois du jardin ——— */
export const AfterOnePiece: React.FC = () => {
  const len = pre('OnePiece') + LEN.OnePiece;
  return (
    <Shot
      scene="OnePiece"
      clip={clipOf(M.dOnepiece, 'OnePiece')}
      keys={[
        {...WIDE, f: 0, s: 1.02},
        focus(B, 560, 300, {f: 84, s: 1.26, ease: E.soft}),
        focus(B, 720, 470, {f: 176, s: 1.1, ease: E.soft}),
        focus(B, 420, 400, {f: 256, s: 1.85, ease: E.soft}),
        focus(B, 470, 400, {f: 336, s: 1.88, ease: E.sine}),
        focus(B, 1100, 400, {f: 424, s: 1.88, ease: E.soft}),
        focus(B, 1130, 400, {f: len, s: 1.92, ease: E.sine}),
      ]}
    >
      <Caption title="Made by Barrier Reef, set by Gracie Pools" text="Seven steps from the mold to the deck, each drawn on the outline of a real model, the Coral Sea." at={290} out={len - 4} width={760} />
    </Shot>
  );
};

/* ——— Le comparateur : le panneau sombre s'ouvre ; Whitsunday Deep s'étire, le filtre « Plunge »,
   l'Escape se rétracte à 17′, on l'épingle ——— */
export const AfterModels: React.FC = () => {
  const len = pre('Models') + LEN.Models;
  return (
    <Shot
      scene="Models"
      clip={clipOf(M.dPlanner, 'Models')}
      dark
      keys={[
        {...WIDE, f: 0, s: 1.02},
        {...WIDE, f: 100, s: 1.0, ease: E.sine},
        focus(B, 480, 240, {f: 142, s: 1.38, ease: E.soft}),
        focus(B, 480, 240, {f: 228, s: 1.4, ease: E.sine}),
        focus(B, 430, 520, {f: 262, s: 1.24, ease: E.soft}),
        focus(B, 480, 250, {f: 322, s: 1.38, ease: E.soft}),
        focus(B, 480, 250, {f: 362, s: 1.4, ease: E.sine}),
        focus(B, 1100, 430, {f: 392, s: 1.36, ease: E.soft}),
        focus(B, 900, 380, {f: len, s: 1.2, ease: E.soft}),
      ]}
    >
      <Caption title="Every model, to scale" text="All the shells on one grid in feet: pick one, it takes its real size and the rulers follow." at={96} out={252} side="right" />
    </Shot>
  );
};

/* ——— La comparaison (même prise) : Whitsunday Deep avec l'Escape en pointillés, trois coloris,
   puis le Billabong Cove, toujours avec l'Escape en pointillés ——— */
export const AfterCompare: React.FC = () => {
  const len = pre('Compare') + LEN.Compare;
  return (
    <Shot
      scene="Compare"
      clip={clipOf(M.dPlanner, 'Compare')}
      dark
      keys={[
        focus(B, 900, 380, {f: 0, s: 1.2}),
        focus(B, 480, 240, {f: 50, s: 1.4, ease: E.soft}),
        focus(B, 480, 245, {f: 100, s: 1.42, ease: E.sine}),
        focus(B, 700, 380, {f: 132, s: 1.08, ease: E.soft}),
        focus(B, 710, 380, {f: 282, s: 1.1, ease: E.sine}),
        focus(B, 450, 420, {f: 322, s: 1.22, ease: E.soft}),
        focus(B, 480, 250, {f: 380, s: 1.4, ease: E.soft}),
        focus(B, 480, 255, {f: len, s: 1.44, ease: E.sine}),
      ]}
    >
      <Caption title="Pin one, compare another" text="The Escape stays as a dashed outline. The six real finishes recolor the water, and the site." at={384} out={len - 4} side="right" />
    </Shot>
  );
};

/* ——— Les photos : on fait glisser la bande, le nom « Billabong Cove » ouvre le comparateur sur lui ——— */
export const AfterGallery: React.FC = () => {
  const len = pre('Gallery') + LEN.Gallery;
  return (
    <Shot
      scene="Gallery"
      clip={clipOf(M.dGallery, 'Gallery')}
      keys={[
        {...WIDE, f: 0, s: 1.0},
        focus(B, 720, 560, {f: 72, s: 1.2, ease: E.soft}),
        focus(B, 700, 560, {f: 182, s: 1.22, ease: E.sine}),
        focus(B, 780, 700, {f: 240, s: 1.45, ease: E.soft}),
        focus(B, 790, 705, {f: 284, s: 1.47, ease: E.sine}),
        {...WIDE, f: 330, s: 1.0, ease: E.soft},
        focus(B, 500, 600, {f: 400, s: 1.3, ease: E.soft}),
        focus(B, 500, 600, {f: len, s: 1.33, ease: E.sine}),
      ]}
    >
      <Caption title="From the photo to the model" text="Barrier Reef photos, labeled as such. A model’s name opens it in the model finder, to scale." at={326} out={len - 4} side="right" />
    </Shot>
  );
};

/* ——— Les piscines existantes : le panneau sombre monte, la carte « Text a photo » ; « Resurfacing and tile » s'ouvre ——— */
export const AfterService: React.FC = () => {
  const len = pre('Service') + LEN.Service;
  return (
    <Shot
      scene="Service"
      clip={clipOf(M.dService, 'Service')}
      dark
      keys={[
        {...WIDE, f: 0, s: 1.02},
        focus(B, 330, 600, {f: 120, s: 1.45, ease: E.soft}),
        focus(B, 330, 610, {f: 212, s: 1.48, ease: E.sine}),
        {...WIDE, f: 262, s: 1.05, ease: E.soft},
        focus(B, 1000, 560, {f: 322, s: 1.3, ease: E.soft}),
        focus(B, 1000, 565, {f: len, s: 1.33, ease: E.sine}),
      ]}
    >
      <Caption title="Already have a pool? Text a photo" text="Their simplest offer, now on every screen: send a photo by text for a free estimate." at={330} out={len - 4} />
    </Shot>
  );
};

/* ——— La demande : le Sydney Harbour choisi, « Ask about this pool » ; le formulaire l'a déjà joint ;
   le nom, le téléphone, la ville, l'envoi, le remerciement ——— */
export const AfterRequest: React.FC = () => {
  const len = pre('Request') + LEN.Request;
  return (
    <Shot
      scene="Request"
      clip={clipOf(M.dRequest, 'Request')}
      keys={[
        focus(B, 1000, 640, {f: 0, s: 1.4}),
        focus(B, 1010, 660, {f: 74, s: 1.44, ease: E.sine}),
        {...WIDE, f: 132, s: 1.0, ease: E.soft},
        focus(B, 900, 430, {f: 232, s: 1.36, ease: E.soft}),
        // presque fixe pendant la saisie : la cote de la légende ne doit pas passer sur la licence ni sur les horaires
        focus(B, 900, 446, {f: 400, s: 1.35, ease: E.sine}),
        focus(B, 900, 320, {f: 500, s: 1.36, ease: E.soft}),
        focus(B, 900, 330, {f: len, s: 1.38, ease: E.sine}),
      ]}
    >
      <Caption title="Their pick comes with the request" text="Sydney Harbour 40′ in California Shimmer is already in the form. Then a name and a number." at={170} out={424} width={680} bottom={105} />
    </Shot>
  );
};

/* ——— Sur téléphone ——— */
const PHONES = [
  {x: 540, w: 400, z: -40, clip: {meta: M.mHero, ...PHONE_TIMING.mHero}, at: 0},
  {x: 960, w: 440, z: 60, clip: {meta: M.mPlanner, ...PHONE_TIMING.mPlanner}, at: 8},
  {x: 1380, w: 400, z: -40, clip: {meta: M.mMenu, ...PHONE_TIMING.mMenu}, at: 16},
];
export const AfterMobile: React.FC = () => {
  const f = useCurrentFrame();
  const len = pre('Mobile') + LEN.Mobile;
  return (
    <AbsoluteFill style={{background: BG.Mobile}}>
      <CameraRig
        blur={0.5}
        keys={[
          {f: 0, x: 960, y: 640, s: 0.94, ry: 5},
          {f: len, x: 960, y: 630, s: 1.0, ry: -5, ease: E.sine},
        ]}
      >
        {PHONES.map((p, i) => (
          <PhoneAt
            key={i}
            x={p.x}
            y={690 + Math.sin((f + i * 40) / 60) * 6 + range(f, p.at, p.at + 60, 900, 0, E.out)}
            w={p.w}
            z={p.z}
            clip={p.clip}
            transform={`rotateY(${(i - 1) * -6}deg)`}
          />
        ))}
      </CameraRig>
      <div style={{position: 'absolute', left: 0, right: 0, top: 58, textAlign: 'center', ...H2, fontSize: 60, color: C.ink, opacity: range(f, 40, 70), transform: `translateY(${range(f, 40, 80, 20, 0, E.out)}px)`}}>
        On a phone, call or text a photo from anywhere
      </div>
    </AbsoluteFill>
  );
};
