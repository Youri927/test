import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Caption, tint} from '../Bits';
import {M} from '../clips';
import {CameraRig, CamKey} from '../lib/camera';
import {BrowserAt, Box, PhoneAt, focus} from '../Stage';
import {valueAt, type Clip} from '../Screen';
import {PHONE_TIMING, TIMING} from '../beats.ts';
import {BG, LEN, pre} from '../timeline';
import {C, E, H2, range} from '../util';

const B: Box = {x: 960, y: 552, w: 1480};
const WIDE = {x: 960, y: 552, s: 1.0};

const clipOf = (meta: Clip['meta'], scene: string): Clip => ({meta, ...TIMING[scene]});

const Rig: React.FC<{keys: CamKey[]; children: React.ReactNode}> = ({keys, children}) => (
  <CameraRig blur={0.5} keys={keys}>
    {children}
  </CameraRig>
);

/** Fond de la scène (couleur de la section) et caméra ; les images clés sont en images de la séquence (pastille comprise) */
const Shot: React.FC<{scene: string; keys: CamKey[]; clip: Clip; bg?: string; dark?: boolean; children?: React.ReactNode}> = ({scene, keys, clip, bg, dark, children}) => (
  <AbsoluteFill style={{background: bg ?? BG[scene]}}>
    <Rig keys={keys}>
      <BrowserAt b={B} clip={clip} dark={dark} />
    </Rig>
    {children}
  </AbsoluteFill>
);

/* ——— L'accueil : les mots montent, la pastille du sourire s'ouvre, survol du bouton d'appel ;
   puis la pastille grandit jusqu'au portrait entier et son nom apparaît sur le mur ——— */
export const AfterHero: React.FC = () => {
  const len = pre('Hero') + LEN.Hero;
  return (
    <Shot
      scene="Hero"
      clip={clipOf(M.dHero, 'Hero')}
      keys={[
        focus(B, 700, 480, {f: 0, s: 1.42}),
        focus(B, 690, 476, {f: 130, s: 1.38, ease: E.sine}),
        focus(B, 1130, 560, {f: 190, s: 1.62, ease: E.soft}),
        focus(B, 1140, 566, {f: 250, s: 1.64, ease: E.sine}),
        {...WIDE, f: 322, s: 1.0, ry: -1.2, ease: E.soft},
        {...WIDE, f: 470, s: 1.04, ry: 0.6, ease: E.sine},
        focus(B, 1110, 470, {f: 590, s: 1.38, ry: 0, ease: E.soft}),
        focus(B, 1100, 480, {f: len, s: 1.42, ease: E.sine}),
      ]}
    >
      <Caption title="Meet the dentist first" text="His smile sits in the headline, then opens into his portrait as you scroll." at={318} out={560} />
    </Shot>
  );
};

/* ——— Les implants : la page continue de défiler depuis l'accueil ; le logo devient le schéma
   (la racine, la vis filet par filet, la couronne qui se pose), puis les légendes ——— */
export const AfterImplants: React.FC = () => {
  const len = pre('Implants') + LEN.Implants;
  return (
    <Shot
      scene="Implants"
      clip={clipOf(M.dImplants, 'Implants')}
      keys={[
        // même cadrage que la fin de l'accueil : le raccord ne se voit pas
        focus(B, 1100, 480, {f: 0, s: 1.42}),
        focus(B, 1080, 500, {f: 70, s: 1.42, ease: E.sine}),
        focus(B, 390, 690, {f: 190, s: 1.5, ease: E.soft}),
        focus(B, 390, 640, {f: 330, s: 1.56, ease: E.sine}),
        focus(B, 410, 470, {f: 400, s: 1.5, ease: E.soft}),
        focus(B, 690, 430, {f: len, s: 1.3, ease: E.soft}),
      ]}
    >
      <Caption title="Their logo, as the diagram" text="As you scroll, it assembles itself: the implant, the abutment, then the crown." at={250} out={len - 4} side="right" />
    </Shot>
  );
};

/* ——— La couronne en une séance : la course, E4D finit à la première visite ——— */
export const AfterCrowns: React.FC = () => {
  const len = pre('Crowns') + LEN.Crowns;
  return (
    <Shot
      scene="Crowns"
      clip={clipOf(M.dCrowns, 'Crowns')}
      keys={[
        {...WIDE, f: 0},
        focus(B, 720, 640, {f: 76, s: 1.36, ease: E.soft}),
        focus(B, 600, 690, {f: 170, s: 1.58, ease: E.soft}),
        focus(B, 610, 694, {f: 228, s: 1.6, ease: E.sine}),
        focus(B, 920, 650, {f: 300, s: 1.44, ease: E.soft}),
        focus(B, 1140, 640, {f: 420, s: 1.6, ease: E.soft}),
        focus(B, 1150, 644, {f: 470, s: 1.62, ease: E.sine}),
        focus(B, 720, 520, {f: len, s: 1.16, ease: E.soft}),
      ]}
    >
      <Caption title="Same day, as a race" text="Their E4D system designs and mills the crown in the office: one visit, against two." tone="dark" at={240} out={430} />
    </Shot>
  );
};

/* ——— Tout le reste : les situations au survol, puis « A tooth is missing » ouvre sa fiche ——— */
export const AfterTreatments: React.FC = () => {
  const len = pre('Treatments') + LEN.Treatments;
  return (
    <Shot
      scene="Treatments"
      clip={clipOf(M.dTreatments, 'Treatments')}
      keys={[
        {...WIDE, f: 0},
        focus(B, 480, 560, {f: 110, s: 1.4, ease: E.soft}),
        focus(B, 470, 530, {f: 330, s: 1.44, ease: E.sine}),
        {...WIDE, f: 384, s: 1.02, ease: E.soft},
        focus(B, 1140, 400, {f: 450, s: 1.42, ease: E.soft}),
        focus(B, 1090, 690, {f: 530, s: 1.52, ease: E.soft}),
        focus(B, 1080, 700, {f: len, s: 1.55, ease: E.sine}),
      ]}
    >
      <Caption title="Filed under what patients say" text="Each line opens the full text of their treatment pages, with the call button at hand." at={120} out={334} side="right" />
    </Shot>
  );
};

/* ——— La sédation : la section reste en place, la lumière baisse à chaque niveau ; le fond de la vidéo la suit ——— */
export const AfterSedation: React.FC = () => {
  const f = useCurrentFrame();
  const len = pre('Sedation') + LEN.Sedation;
  const clip = clipOf(M.dSedation, 'Sedation');
  // mêmes seuils que le site (sedation.tsx) : turquoise profond entre 27 et 39 %, vert-noir entre 60 et 72 %
  const sp = valueAt(clip, 'sp', f);
  const smooth = (a: number, b: number) => {
    const x = Math.max(0, Math.min(1, (sp - a) / (b - a)));
    return x * x * (3 - 2 * x);
  };
  const bg = tint(tint(C.mist, C.tealDeep, smooth(0.27, 0.39)), C.ink, smooth(0.6, 0.72));
  return (
    <Shot
      scene="Sedation"
      clip={clip}
      bg={bg}
      dark
      keys={[
        {...WIDE, f: 0},
        focus(B, 720, 560, {f: 80, s: 1.24, ease: E.soft}),
        focus(B, 900, 610, {f: 210, s: 1.4, ease: E.soft}),
        focus(B, 910, 620, {f: len, s: 1.48, ease: E.sine}),
      ]}
    >
      <Caption title="The light dims with the sedation" text="Three levels, from laughing gas to IV sedation. Dr. Fakhoury is licensed in conscious and IV sedation." tone="dark" at={60} out={300} side="right" width={640} />
    </Shot>
  );
};

/* ——— Le Dr. Fakhoury : son parcours se trace sur la carte ——— */
export const AfterDoctor: React.FC = () => {
  const len = pre('Doctor') + LEN.Doctor;
  return (
    <Shot
      scene="Doctor"
      clip={clipOf(M.dDoctor, 'Doctor')}
      dark
      keys={[
        {...WIDE, f: 0},
        focus(B, 1080, 520, {f: 96, s: 1.44, ease: E.soft}),
        focus(B, 1100, 600, {f: 260, s: 1.5, ease: E.sine}),
        focus(B, 1070, 700, {f: 420, s: 1.56, ease: E.soft}),
        focus(B, 1060, 706, {f: len, s: 1.58, ease: E.sine}),
      ]}
    >
      <Caption title="His path, on a real map" text="Born in Michigan, trained at NYU and in New York City hospitals, now on Tamiami Trail East." at={100} out={330} />
    </Shot>
  );
};

/* ——— Le cabinet et la demande : les horaires (mardi signalé), le formulaire rempli, envoyé, le remerciement ——— */
export const AfterRequest: React.FC = () => {
  const len = pre('Request') + LEN.Request;
  return (
    <Shot
      scene="Request"
      clip={clipOf(M.dRequest, 'Request')}
      keys={[
        {...WIDE, f: 0},
        focus(B, 1060, 420, {f: 50, s: 1.44, ease: E.soft}),
        focus(B, 1060, 430, {f: 104, s: 1.46, ease: E.sine}),
        {...WIDE, f: 160, ease: E.soft},
        focus(B, 1010, 380, {f: 214, s: 1.48, ease: E.soft}),
        focus(B, 1010, 500, {f: 320, s: 1.5, ease: E.sine}),
        focus(B, 1010, 560, {f: 400, s: 1.5, ease: E.soft}),
        focus(B, 1010, 430, {f: 510, s: 1.36, ease: E.soft}),
        focus(B, 1000, 440, {f: len, s: 1.38, ease: E.sine}),
      ]}
    >
      <Caption title="A form that works" text="Today’s appointment page is empty. Here: what brings you in, a number, and the office calls back." tone="dark" at={120} out={352} />
    </Shot>
  );
};

/* ——— Sur téléphone ——— */
const PHONES = [
  {x: 540, w: 400, z: -40, clip: {meta: M.mHero, ...PHONE_TIMING.mHero}, at: 0},
  {x: 960, w: 440, z: 60, clip: {meta: M.mCrowns, ...PHONE_TIMING.mCrowns}, at: 8},
  {x: 1380, w: 400, z: -40, clip: {meta: M.mSheet, ...PHONE_TIMING.mSheet}, at: 16},
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
        On a phone, every number is one tap away
      </div>
    </AbsoluteFill>
  );
};
