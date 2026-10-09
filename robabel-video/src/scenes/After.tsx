import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Caption} from '../Bits';
import {M} from '../clips';
import {CameraRig, CamKey} from '../lib/camera';
import {BrowserAt, Box, PhoneAt, aside, asideBottom, asideWidth, focus} from '../Stage';
import {type Clip} from '../Screen';
import {PHONE_TIMING, TIMING} from '../beats.ts';
import {BG, LEN} from '../timeline';
import {BODY, C, E, H2, range} from '../util';

const B: Box = {x: 960, y: 552, w: 1480};
const WIDE = {x: 960, y: 552, s: 1.0};

const clipOf = (meta: Clip['meta'], scene: string): Clip => ({meta, ...TIMING[scene]});

/** Fond de la scène (couleur de la section) et caméra ; les images clés sont en images de la scène */
const Shot: React.FC<{scene: string; keys: CamKey[]; clip: Clip; dark?: boolean; children?: React.ReactNode}> = ({scene, keys, clip, dark, children}) => (
  <AbsoluteFill style={{background: BG[scene]}}>
    <CameraRig blur={0.5} keys={keys}>
      <BrowserAt b={B} clip={clip} dark={dark} />
    </CameraRig>
    {children}
  </AbsoluteFill>
);

/* ——— L'accueil du site : les lumières s'allument dans le navigateur ; puis l'aqua, le bleu, le blanc, et le violet ——— */
export const AfterHero: React.FC = () => {
  const len = LEN.Hero;
  return (
    <Shot
      scene="Hero"
      dark
      clip={clipOf(M.dHero, 'Hero')}
      keys={[
        focus(B, 520, 440, {f: 0, s: 1.34}),
        focus(B, 560, 450, {f: 190, s: 1.28, ease: E.sine}),
        {...WIDE, f: 262, s: 1.0, ease: E.soft},
        {...WIDE, f: 290, s: 1.01, ease: E.sine},
        focus(B, 1060, 700, {f: 350, s: 1.55, ease: E.soft}),
        focus(B, 1080, 705, {f: 540, s: 1.6, ease: E.sine}),
        focus(B, 900, 600, {f: len, s: 1.3, ease: E.soft}),
      ]}
    >
      {/* à droite : à gauche, le texte d'accueil et les boutons du site */}
      <Caption title="Your pool, lights on" text="The page opens on your photo at dusk, lights off. Then the house, each palm and the pool come on." at={90} out={236} tone="dark" side="right" width={620} />
      {/* en haut à gauche : en bas, le texte d'accueil et les boutons ; en haut, un bout du titre coupé par le cadrage */}
      <Caption title="Pick the pool light" text="Violet is how your pool was photographed. The other colors are simulated, and the page says so." at={352} out={540} tone="dark" width={620} top={40} />
    </Shot>
  );
};

/* ——— Rob, puis la piscine aux motos : la boucle de leur film s'élargit jusqu'aux bords, puis les photos ——— */
const SIDE = 0.84;
export const AfterPools: React.FC = () => {
  const len = LEN.Pools;
  return (
    <Shot
      scene="Pools"
      clip={clipOf(M.dPools, 'Pools')}
      keys={[
        {...WIDE, f: 0, s: 1.02},
        {...WIDE, f: 70, s: 1.0, ease: E.sine},
        // « One builder… » : on lit le titre pendant que la page est arrêtée
        focus(B, 380, 400, {f: 150, s: 1.22, ease: E.soft}),
        focus(B, 390, 405, {f: 190, s: 1.23, ease: E.sine}),
        {...WIDE, f: 270, s: 1.0, ease: E.soft},
        // la boucle monte et s'élargit : le navigateur se range à gauche, entier, pour qu'on voie les bords
        aside(B, 'right', {f: 330, s: SIDE, ease: E.soft}),
        aside(B, 'right', {f: 500, s: SIDE + 0.01, ease: E.sine}),
        // les trois photos
        focus(B, 720, 520, {f: 590, s: 1.12, ease: E.soft}),
        focus(B, 720, 530, {f: len, s: 1.14, ease: E.sine}),
      ]}
    >
      <Caption
        title="Your motorcycle pool"
        text="A loop from your own film opens up to the edges of the screen as it comes up."
        at={322}
        out={512}
        side="right"
        width={asideWidth(B, SIDE)}
        bottom={asideBottom(B, SIDE)}
      />
    </Shot>
  );
};

/* ——— Au bord de l'eau : l'après-midi, le crépuscule et la nuit montent en décalé, les photos de nuit s'allument ——— */
export const AfterWater: React.FC = () => {
  const len = LEN.Water;
  return (
    <Shot
      scene="Water"
      clip={clipOf(M.dWater, 'Water')}
      keys={[
        {...WIDE, f: 0, s: 1.0},
        aside(B, 'left', {f: 70, s: SIDE, ease: E.soft}),
        aside(B, 'left', {f: 290, s: SIDE + 0.01, ease: E.sine}),
        {...WIDE, f: len, s: 1.02, ease: E.soft},
      ]}
    >
      {/* la page s'arrête une demi-seconde, la légende arrive, puis les photos de nuit s'allument (image 60 à 90 de la scène) */}
      <Caption
        title="Your waterfront pool"
        text="Afternoon, dusk and night: the night photos light up as the page goes down."
        at={40}
        out={300}
        width={asideWidth(B, SIDE)}
        bottom={asideBottom(B, SIDE)}
      />
    </Shot>
  );
};

/* ——— Le local technique : le circuit reste fixé pendant que l'eau le parcourt ; les trois tuyauteries ——— */
export const AfterPump: React.FC = () => {
  const len = LEN.Pump;
  return (
    <Shot
      scene="Pump"
      dark
      clip={clipOf(M.dPump, 'Pump')}
      keys={[
        {...WIDE, f: 0, s: 1.03},
        {...WIDE, f: 140, s: 1.0, ease: E.sine},
        // le circuit se fixe et l'eau le parcourt : le navigateur se range, la légende à droite
        aside(B, 'right', {f: 210, s: SIDE, ease: E.soft}),
        aside(B, 'right', {f: 500, s: SIDE + 0.01, ease: E.sine}),
        focus(B, 430, 300, {f: 560, s: 1.6, ease: E.soft}),
        focus(B, 470, 305, {f: 680, s: 1.62, ease: E.sine}),
        {...WIDE, f: 760, s: 1.0, ease: E.soft},
        {...WIDE, f: len, s: 1.02, ease: E.sine},
      ]}
    >
      <Caption
        title="The water circuit"
        text="Your pump room stays in place while the water runs through it, and each machine lights up with your own photo."
        at={210}
        out={500}
        tone="dark"
        side="right"
        width={asideWidth(B, SIDE)}
        bottom={asideBottom(B, SIDE)}
      />
      {/* en haut : en bas, les photos des appareils */}
      <Caption title="Schedule 40, 80 or clear PVC" text="The three options from your page. With clear PVC, the water and the UV show." at={560} out={740} tone="dark" side="right" width={600} top={40} />
    </Shot>
  );
};

/* ——— Autour de l'eau : la photo reste en place et change avec le sujet au milieu de l'écran ——— */
export const AfterBackyard: React.FC = () => {
  const len = LEN.Backyard;
  return (
    <Shot
      scene="Backyard"
      clip={clipOf(M.dBackyard, 'Backyard')}
      keys={[
        {...WIDE, f: 0, s: 1.02},
        aside(B, 'left', {f: 90, s: SIDE, ease: E.soft}),
        aside(B, 'left', {f: 330, s: SIDE + 0.01, ease: E.sine}),
        {...WIDE, f: len, s: 1.03, ease: E.soft},
      ]}
    >
      <Caption
        title="Your work, item by item"
        text="Water features, lighting, shade, fire pits and more: the photo changes as each one comes up."
        at={70}
        out={340}
        width={asideWidth(B, SIDE)}
        bottom={asideBottom(B, SIDE)}
      />
    </Shot>
  );
};

/* ——— Neuve ou existante : les étapes de la piscine neuve, reliées par un tuyau qui se remplit ;
   on remonte aux onglets, « The pool you have », et les étapes de la rénovation se remplissent à leur tour ——— */
export const AfterHow: React.FC = () => {
  const len = LEN.How;
  return (
    <Shot
      scene="How"
      clip={clipOf(M.dHow, 'How')}
      keys={[
        {...WIDE, f: 0, s: 1.02},
        aside(B, 'right', {f: 60, s: SIDE, ease: E.soft}),
        aside(B, 'right', {f: 230, s: SIDE + 0.01, ease: E.sine}),
        // la page remonte aux onglets ; la souris choisit l'onglet de la piscine existante (image 318)
        focus(B, 470, 420, {f: 290, s: 1.3, ease: E.soft}),
        focus(B, 480, 425, {f: 336, s: 1.31, ease: E.sine}),
        // puis les étapes de la rénovation, qui s'allument de l'image 378 à l'image 455
        focus(B, 900, 560, {f: 400, s: 1.18, ease: E.soft}),
        focus(B, 910, 570, {f: len, s: 1.2, ease: E.sine}),
      ]}
    >
      <Caption
        title="Step by step"
        text="Your two processes, a new pool and a renovation, joined by a pipe that fills as you read."
        at={50}
        out={236}
        side="right"
        width={asideWidth(B, SIDE)}
        bottom={asideBottom(B, SIDE)}
      />
    </Shot>
  );
};

/* ——— Chlore ou sel : cinq choix, le fléau penche du côté du sel ——— */
export const AfterSalt: React.FC = () => {
  const len = LEN.Salt;
  return (
    <Shot
      scene="Salt"
      dark
      clip={clipOf(M.dSalt, 'Salt')}
      keys={[
        {...WIDE, f: 0, s: 1.02},
        aside(B, 'left', {f: 70, s: SIDE, ease: E.soft}),
        aside(B, 'left', {f: 330, s: SIDE + 0.01, ease: E.sine}),
        {...WIDE, f: len, s: 1.03, ease: E.soft},
      ]}
    >
      <Caption
        title="Your seven points"
        text="Pick what matters to you, and the balance tips toward chlorine or salt."
        at={50}
        out={340}
        tone="dark"
        width={asideWidth(B, SIDE)}
        bottom={asideBottom(B, SIDE)}
      />
    </Shot>
  );
};

/* ——— La carte (elle recule depuis le bureau), puis le rendez-vous : la saisie, l'envoi, le remerciement ——— */
export const AfterContact: React.FC = () => {
  const len = LEN.Contact;
  return (
    <Shot
      scene="Contact"
      dark
      clip={clipOf(M.dContact, 'Contact')}
      keys={[
        {...WIDE, f: 0, s: 1.0},
        // la carte : le navigateur se range à gauche, la légende à droite
        aside(B, 'right', {f: 50, s: SIDE, ease: E.soft}),
        aside(B, 'right', {f: 190, s: SIDE + 0.01, ease: E.sine}),
        {...WIDE, f: 250, s: 1.0, ease: E.soft},
        // le rendez-vous : le navigateur se range à droite, la légende à gauche ; la saisie du nom et du téléphone
        aside(B, 'left', {f: 300, s: SIDE, ease: E.soft}),
        aside(B, 'left', {f: 410, s: SIDE + 0.01, ease: E.sine}),
        // la ville, le projet, l'envoi (image 558)
        focus(B, 1060, 520, {f: 470, s: 1.3, ease: E.soft}),
        focus(B, 1060, 560, {f: 560, s: 1.32, ease: E.sine}),
        // la page remonte : le remerciement, avec le titre et le numéro entiers à gauche
        focus(B, 720, 330, {f: 640, s: 1.35, ease: E.soft}),
        focus(B, 720, 335, {f: len, s: 1.37, ease: E.sine}),
      ]}
    >
      <Caption
        title="Your service area"
        text="A real map of your coast, drawn from U.S. Census data, starting from your office."
        at={44}
        out={200}
        tone="dark"
        side="right"
        width={asideWidth(B, SIDE)}
        bottom={asideBottom(B, SIDE)}
      />
      <Caption
        title="Booking a meeting"
        text="Your number in large type, and a short form: name, phone and town. Here, a test request."
        at={296}
        out={420}
        tone="dark"
        width={asideWidth(B, SIDE)}
        bottom={asideBottom(B, SIDE)}
      />
    </Shot>
  );
};

/* ——— Sur téléphone ——— */
const PHONES = [
  {x: 560, w: 380, z: -40, clip: {meta: M.mHero, ...PHONE_TIMING.mHero}, at: 0},
  {x: 960, w: 420, z: 60, clip: {meta: M.mPump, ...PHONE_TIMING.mPump}, at: 8},
  {x: 1360, w: 380, z: -40, clip: {meta: M.mMenu, ...PHONE_TIMING.mMenu}, at: 16},
];
export const AfterMobile: React.FC = () => {
  const f = useCurrentFrame();
  const len = LEN.Mobile;
  return (
    <AbsoluteFill style={{background: BG.Mobile}}>
      <CameraRig
        blur={0.5}
        keys={[
          // les téléphones sous le titre : leur bas sort de l'image
          {f: 0, x: 960, y: 580, s: 0.94, ry: 5},
          {f: len, x: 960, y: 572, s: 1.0, ry: -5, ease: E.sine},
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
      <div style={{position: 'absolute', left: 0, right: 0, top: 54, textAlign: 'center', opacity: range(f, 40, 70), transform: `translateY(${range(f, 40, 80, 20, 0, E.out)}px)`}}>
        <div style={{...H2, fontSize: 76, color: C.navy}}>On a phone</div>
        <div style={{...BODY, marginTop: 10, fontSize: 26, color: C.inkSoft}}>Your number one tap away, and the water circuit runs down the page.</div>
      </div>
    </AbsoluteFill>
  );
};
