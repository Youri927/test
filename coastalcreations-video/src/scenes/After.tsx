import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Caption, Stills} from '../Bits';
import {CameraRig, CamKey} from '../lib/camera';
import {BrowserAt, Box, PhoneAt, aside, asideBottom, asideWidth, focus} from '../Stage';
import {BG, LEN} from '../timeline';
import {BODY, C, E, H2, range} from '../util';

const B: Box = {x: 960, y: 552, w: 1480};
const WIDE = {x: 960, y: 552, s: 1.0};
/** échelle du navigateur rangé de côté pour laisser la place à une légende */
const SIDE = 0.8;

/** Fond de la scène (couleur de la section), caméra, et les captures du site dans le navigateur */
const Shot: React.FC<{scene: string; keys: CamKey[]; stills: [string, number][]; dark?: boolean; children?: React.ReactNode}> = ({scene, keys, stills, dark, children}) => (
  <AbsoluteFill style={{background: BG[scene]}}>
    <CameraRig blur={0.5} keys={keys}>
      <BrowserAt b={B} dark={dark}>
        <Stills list={stills} />
      </BrowserAt>
    </CameraRig>
    {children}
  </AbsoluteFill>
);

/** Le navigateur se range d'un côté le temps d'une légende, puis revient au centre */
const sideKeys = (side: 'left' | 'right', len: number, from = 50, to = len - 44): CamKey[] => [
  {...WIDE, f: 0, s: 1.03},
  aside(B, side, {f: from, s: SIDE, ease: E.soft}),
  aside(B, side, {f: to, s: SIDE + 0.012, ease: E.sine}),
  {...WIDE, f: len, s: 1.0, ease: E.soft},
];
const capProps = {width: asideWidth(B, SIDE), bottom: asideBottom(B, SIDE)};

/* ——— L'accueil : leur construction de Bradenton en plein écran ——— */
export const AfterHero: React.FC = () => {
  const len = LEN.Hero;
  return (
    <Shot scene="Hero" dark stills={[['d-hero', 0]]} keys={sideKeys('right', len)}>
      <Caption title="Your work, first" text="The page opens on a new pool you built in Bradenton, sharp at full screen." at={48} out={len - 36} tone="dark" side="right" {...capProps} />
    </Shot>
  );
};

/* ——— Ce qu'ils font : la phrase qui s'allume, les chiffres, puis les cartes empilées ——— */
export const AfterCards: React.FC = () => {
  const len = LEN.Cards;
  return (
    <Shot scene="Cards" stills={[['d-intro', 0], ['d-cards', 132]]} keys={sideKeys('left', len)}>
      <Caption title="What you do" text="One sentence that lights up as you read, then four cards that stack as you scroll." at={48} out={len - 36} side="left" {...capProps} />
    </Shot>
  );
};

/* ——— La construction : l'écran tient, les étapes passent ——— */
export const AfterBuild: React.FC = () => {
  const len = LEN.Build;
  return (
    <Shot scene="Build" dark stills={[['d-build-1', 0], ['d-build-2', 140]]} keys={sideKeys('right', len)}>
      <Caption title="Eleven steps" text="The page holds still while the build moves on, step by step, with photos from your own jobs." at={48} out={len - 36} tone="dark" side="right" {...capProps} />
    </Shot>
  );
};

/* ——— Avant / après ——— */
export const AfterReno: React.FC = () => {
  const len = LEN.Reno;
  return (
    <Shot scene="Reno" stills={[['d-reno', 0], ['d-holmes', 132]]} keys={sideKeys('left', len)}>
      <Caption title="Before. After." text="Your renovations from your own photos: the after large, the before beside it." at={48} out={len - 36} side="left" {...capProps} />
    </Shot>
  );
};

/* ——— Le nuancier Stonescapes ——— */
export const AfterFinish: React.FC = () => {
  const len = LEN.Finish;
  return (
    <Shot scene="Finish" dark stills={[['d-finish', 0]]} keys={sideKeys('right', len)}>
      <Caption title="Pick a water color" text="Your six Stonescapes finishes: pick a name and the swatch changes." at={48} out={len - 36} tone="dark" side="right" {...capProps} />
    </Shot>
  );
};

/* ——— Les tarifs de détection de fuites, puis le total du calcul ——— */
export const AfterLeaks: React.FC = () => {
  const len = LEN.Leaks;
  return (
    <Shot
      scene="Leaks"
      stills={[['d-leaks', 0]]}
      keys={[
        {...WIDE, f: 0, s: 1.03},
        aside(B, 'left', {f: 46, s: SIDE, ease: E.soft}),
        aside(B, 'left', {f: 176, s: SIDE + 0.012, ease: E.sine}),
        // le total du calcul, en gros plan
        focus(B, 1150, 560, {f: 238, s: 1.32, ease: E.soft}),
        focus(B, 1160, 560, {f: len, s: 1.35, ease: E.sine}),
      ]}
    >
      <Caption title="Readable prices" text="Your leak detection prices were inside an image. Now in plain text, with a quick calculator." at={44} out={196} side="left" {...capProps} />
    </Shot>
  );
};

/* ——— Le contact : le numéro en très grand, les trois façons de les joindre ——— */
export const AfterContact: React.FC = () => {
  const len = LEN.Contact;
  return (
    <Shot scene="Contact" stills={[['d-contact', 0]]} keys={[{...WIDE, f: 0, s: 1.0}, focus(B, 560, 560, {f: len, s: 1.2, ease: E.sine})]} />
  );
};

/* ——— Sur téléphone ——— */
const PHONES = [
  {x: 560, w: 360, z: -40, img: 'm-hero', at: 0},
  {x: 960, w: 400, z: 60, img: 'm-leaks', at: 8},
  {x: 1360, w: 360, z: -40, img: 'm-menu', at: 16},
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
            key={p.img}
            x={p.x}
            y={720 + Math.sin((f + i * 40) / 60) * 6 + range(f, p.at, p.at + 60, 900, 0, E.out)}
            w={p.w}
            z={p.z}
            img={p.img}
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
