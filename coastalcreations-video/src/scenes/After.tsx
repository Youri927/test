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
/** échelle du navigateur rangé de côté pour laisser la place à une légende */
const SIDE = 0.8;

const clipOf = (meta: Clip['meta'], scene: string): Clip => ({meta, ...TIMING[scene]});

/** Fond de la scène (couleur de la section), caméra, et le plan filmé du site dans le navigateur */
const Shot: React.FC<{scene: string; keys: CamKey[]; clip: Clip; dark?: boolean; children?: React.ReactNode}> = ({scene, keys, clip, dark, children}) => (
  <AbsoluteFill style={{background: BG[scene]}}>
    <CameraRig blur={0.5} keys={keys}>
      <BrowserAt b={B} clip={clip} dark={dark} />
    </CameraRig>
    {children}
  </AbsoluteFill>
);

/** Le navigateur se range d'un côté le temps d'une légende, puis revient au centre */
const sideKeys = (side: 'left' | 'right', len: number, from: number, to: number): CamKey[] => [
  {...WIDE, f: 0, s: 1.03},
  {...WIDE, f: Math.max(1, from - 50), s: 1.0, ease: E.sine},
  aside(B, side, {f: from, s: SIDE, ease: E.soft}),
  aside(B, side, {f: to, s: SIDE + 0.012, ease: E.sine}),
  {...WIDE, f: len, s: 1.0, ease: E.soft},
];
const capProps = {width: asideWidth(B, SIDE), bottom: asideBottom(B, SIDE)};

/* ——— L'accueil : la photo se pose, le titre monte ; puis on descend ——— */
export const AfterHero: React.FC = () => {
  const len = LEN.Hero;
  return (
    <Shot scene="Hero" dark clip={clipOf(M.dHero, 'Hero')} keys={sideKeys('right', len, 110, 250)}>
      <Caption title="Your work, first" text="The page opens on a new pool you built in Bradenton, sharp at full screen." at={104} out={262} tone="dark" side="right" {...capProps} />
    </Shot>
  );
};

/* ——— Ce qu'ils font : la phrase qui s'allume, les chiffres, puis les cartes qui s'empilent ——— */
export const AfterCards: React.FC = () => {
  const len = LEN.Cards;
  return (
    <Shot scene="Cards" clip={clipOf(M.dCards, 'Cards')} keys={sideKeys('left', len, 60, 270)}>
      <Caption title="What you do" text="One sentence that lights up as you read, then four cards that stack as you scroll." at={54} out={282} side="left" {...capProps} />
    </Shot>
  );
};

/* ——— La construction : l'écran tient, les étapes passent ——— */
export const AfterBuild: React.FC = () => {
  const len = LEN.Build;
  return (
    <Shot scene="Build" dark clip={clipOf(M.dBuild, 'Build')} keys={sideKeys('right', len, 80, 300)}>
      <Caption title="Eleven steps" text="The page holds still while the build moves on, step by step, with photos from your own jobs." at={74} out={312} tone="dark" side="right" {...capProps} />
    </Shot>
  );
};

/* ——— Avant / après ——— */
export const AfterReno: React.FC = () => {
  const len = LEN.Reno;
  return (
    <Shot scene="Reno" clip={clipOf(M.dReno, 'Reno')} keys={sideKeys('left', len, 70, 240)}>
      <Caption title="Before. After." text="Your renovations from your own photos: the after opens up, the before drifts beside it." at={64} out={252} side="left" {...capProps} />
    </Shot>
  );
};

/* ——— Le nuancier Stonescapes : trois clics ——— */
export const AfterFinish: React.FC = () => {
  const len = LEN.Finish;
  return (
    <Shot scene="Finish" dark clip={clipOf(M.dFinish, 'Finish')} keys={sideKeys('right', len, 64, 226)}>
      <Caption title="Pick a water color" text="Your six Stonescapes finishes: pick a name and the swatch changes." at={58} out={238} tone="dark" side="right" {...capProps} />
    </Shot>
  );
};

/* ——— Les tarifs de détection de fuites, puis le calcul en gros plan ——— */
export const AfterLeaks: React.FC = () => {
  const len = LEN.Leaks;
  return (
    <Shot
      scene="Leaks"
      clip={clipOf(M.dLeaks, 'Leaks')}
      keys={[
        {...WIDE, f: 0, s: 1.03},
        {...WIDE, f: 50, s: 1.0, ease: E.sine},
        aside(B, 'left', {f: 100, s: SIDE, ease: E.soft}),
        aside(B, 'left', {f: 190, s: SIDE + 0.012, ease: E.sine}),
        // les clics du calcul (images 162 à 282 du plan), en gros plan
        focus(B, 1150, 560, {f: 236, s: 1.32, ease: E.soft}),
        focus(B, 1160, 560, {f: len, s: 1.35, ease: E.sine}),
      ]}
    >
      <Caption title="Readable prices" text="Your leak detection prices were inside an image. Now in plain text, with a quick calculator." at={94} out={210} side="left" {...capProps} />
    </Shot>
  );
};

/* ——— Le contact : le titre, le numéro en très grand, les trois façons de les joindre ——— */
export const AfterContact: React.FC = () => {
  const len = LEN.Contact;
  return <Shot scene="Contact" clip={clipOf(M.dContact, 'Contact')} keys={[{...WIDE, f: 0, s: 1.02}, {...WIDE, f: len, s: 1.07, ease: E.sine}]} />;
};

/* ——— Sur téléphone ——— */
const PHONES = [
  {x: 560, w: 360, z: -40, clip: {meta: M.mHero, ...PHONE_TIMING.mHero}, at: 0},
  {x: 960, w: 400, z: 60, clip: {meta: M.mCards, ...PHONE_TIMING.mCards}, at: 8},
  {x: 1360, w: 360, z: -40, clip: {meta: M.mMenu, ...PHONE_TIMING.mMenu}, at: 16},
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
          {f: 0, x: 960, y: 600, s: 0.94, ry: 5},
          {f: len, x: 960, y: 590, s: 1.0, ry: -5, ease: E.sine},
        ]}
      >
        {PHONES.map((p, i) => (
          <PhoneAt
            key={i}
            x={p.x}
            y={720 + Math.sin((f + i * 40) / 60) * 6 + range(f, p.at, p.at + 60, 900, 0, E.out)}
            w={p.w}
            z={p.z}
            clip={p.clip}
            transform={`rotateY(${(i - 1) * -6}deg)`}
          />
        ))}
      </CameraRig>
      <div style={{position: 'absolute', left: 0, right: 0, top: 58, textAlign: 'center', opacity: range(f, 30, 60), transform: `translateY(${range(f, 30, 70, 20, 0, E.out)}px)`}}>
        <div style={{...H2, fontSize: 68, color: C.ink}}>On a phone</div>
        <div style={{...BODY, marginTop: 14, fontSize: 26, color: C.muted}}>Call, text and free quote stay one tap away.</div>
      </div>
    </AbsoluteFill>
  );
};
