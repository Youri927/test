import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Caption} from '../Bits';
import {M, TONES} from '../clips';
import {CameraRig, CamKey} from '../lib/camera';
import {BrowserAt, Box, PhoneAt, aside, asideBottom, asideWidth, focus} from '../Stage';
import {srcFrame, type Clip} from '../Screen';
import {BUILD, PHONE_TIMING, TIMING} from '../beats.ts';
import {BG, LEN} from '../timeline';
import {BODY, C, E, H2, range} from '../util';

const B: Box = {x: 960, y: 552, w: 1480};
const WIDE = {x: 960, y: 552, s: 1.0};
/** échelle du navigateur rangé de côté pour laisser la place à une légende */
const SIDE = 0.8;

const clipOf = (meta: Clip['meta'], scene: string): Clip => ({meta, ...TIMING[scene]});

/**
 * Fond de la scène (couleur de la section), caméra, et le plan filmé du site dans le navigateur.
 * Avec `tones`, le fond suit la couleur de la page image par image, comme l'ouverture du site qui prend la couleur du chantier.
 */
const Shot: React.FC<{scene: string; keys: CamKey[]; clip: Clip; tones?: string[]; dark?: boolean; children?: React.ReactNode}> = ({scene, keys, clip, tones, dark, children}) => {
  const f = useCurrentFrame();
  const bg = (tones && tones[srcFrame(clip, f)]) || BG[scene];
  return (
    <AbsoluteFill style={{background: bg}}>
      <CameraRig blur={0.5} keys={keys}>
        <BrowserAt b={B} clip={clip} dark={dark} />
      </CameraRig>
      {children}
    </AbsoluteFill>
  );
};

/** Le navigateur se range d'un côté le temps d'une légende, puis revient au centre */
const sideKeys = (side: 'left' | 'right', len: number, from: number, to: number, after: CamKey[] = []): CamKey[] => [
  {...WIDE, f: 0, s: 1.03},
  {...WIDE, f: Math.max(1, from - 50), s: 1.0, ease: E.sine},
  aside(B, side, {f: from, s: SIDE, ease: E.soft}),
  aside(B, side, {f: to, s: SIDE + 0.012, ease: E.sine}),
  {...WIDE, f: Math.min(len, to + 50), s: 1.0, ease: E.soft},
  ...(after.length ? after : [{...WIDE, f: len, s: 1.0}]),
];
const capProps = {width: asideWidth(B, SIDE), bottom: asideBottom(B, SIDE)};

/* ——— L'ouverture du site en entier : le titre, puis le chantier au défilement, l'eau, la nuit, les lumières ——— */
export const AfterBuild: React.FC = () => {
  const {water, lit} = BUILD;
  return (
    <Shot
      scene="Build"
      dark
      clip={clipOf(M.dOpen, 'Build')}
      tones={TONES.dOpen}
      keys={[
        {...WIDE, f: 0, s: 1.03},
        {...WIDE, f: 50, s: 1.0, ease: E.sine},
        aside(B, 'left', {f: 96, s: SIDE, ease: E.soft}),
        aside(B, 'left', {f: 290, s: SIDE + 0.012, ease: E.sine}),
        {...WIDE, f: 350, s: 1.0, ease: E.soft},
        // le compteur tourne pendant les jours où la coque sèche
        focus(B, 330, 430, {f: 420, s: 1.17, ease: E.soft}),
        focus(B, 350, 440, {f: 520, s: 1.19, ease: E.sine}),
        // l'eau monte, en plein cadre
        {...WIDE, f: water - 24, s: 1.0, ease: E.soft},
        {...WIDE, f: water + 40, s: 1.0},
        // la nuit tombe, la piscine s'allume ; on s'en approche jusqu'à la coupe
        focus(B, 1000, 420, {f: lit + 40, s: 1.16, ease: E.soft}),
        focus(B, 980, 430, {f: LEN.Build, s: 1.21, ease: E.sine}),
      ]}
    >
      <Caption title="Lawn to lights" text="The page opens on one of your builds. Scroll, and the 41 days go by in your own photos." at={90} out={302} tone="dark" side="left" {...capProps} />
    </Shot>
  );
};

/* ——— La règle des jours : on la ramène en arrière, puis un clic sur le jour 30 ——— */
export const AfterDrag: React.FC = () => {
  const len = LEN.Drag;
  return (
    <Shot scene="Drag" dark clip={clipOf(M.dRuler, 'Drag')} tones={TONES.dRuler} keys={sideKeys('right', len, 50, 196, [{...WIDE, f: 262, s: 1.0}, {...WIDE, f: len, s: 1.06, ease: E.sine}])}>
      <Caption title="Drag the timeline" text="Click a day, drag back through the build, or use the arrow keys." at={44} out={208} tone="dark" side="right" {...capProps} />
    </Shot>
  );
};

/* ——— Ce qu'ils font : les grands noms glissent ——— */
export const AfterServices: React.FC = () => {
  const len = LEN.Services;
  return (
    <Shot scene="Services" dark clip={clipOf(M.dServices, 'Services')} keys={sideKeys('right', len, 120, 270)}>
      <Caption title="What you do" text="Your six services in big type, sliding in as the page moves." at={114} out={282} tone="dark" side="right" {...capProps} />
    </Shot>
  );
};

/* ——— La galerie : l'année tourne comme un compteur ——— */
export const AfterPools: React.FC = () => {
  const len = LEN.Pools;
  return (
    <Shot scene="Pools" clip={clipOf(M.dPools, 'Pools')} keys={sideKeys('left', len, 90, 290)}>
      <Caption title="Every job, by date" text="Your photos from 2018 to 2022, grouped by job. The year turns like a counter." at={84} out={302} side="left" {...capProps} />
    </Shot>
  );
};

/* ——— La nuit : la piscine s'allume, puis le rouge ——— */
export const AfterNight: React.FC = () => {
  const len = LEN.Night;
  return (
    <Shot scene="Night" dark clip={clipOf(M.dNight, 'Night')} keys={sideKeys('right', len, 50, 190, [{...WIDE, f: 236, s: 1.0}, focus(B, 470, 470, {f: len, s: 1.14, ease: E.soft})])}>
      <Caption title="After dark" text="The pool lights up as you scroll. Pick blue or red, and the glow follows." at={44} out={202} tone="dark" side="right" {...capProps} />
    </Shot>
  );
};

/* ——— Les valeurs : les mots s'allument ——— */
export const AfterValues: React.FC = () => {
  const len = LEN.Values;
  return <Shot scene="Values" clip={clipOf(M.dValues, 'Values')} keys={[{...WIDE, f: 0, s: 1.02}, focus(B, 520, 560, {f: len, s: 1.12, ease: E.sine})]} />;
};

/* ——— Le contact : « Open now », le numéro, le formulaire ; puis le grand nom du pied de page ——— */
export const AfterContact: React.FC = () => {
  const len = LEN.Contact;
  return (
    <Shot scene="Contact" dark clip={clipOf(M.dContact, 'Contact')} keys={sideKeys('left', len, 56, 196)}>
      <Caption title="Open now?" text="Your hours with a live open or closed status in Texas time, and a form that writes the email." at={50} out={208} tone="dark" side="left" {...capProps} />
    </Shot>
  );
};

/* ——— Sur téléphone ——— */
const PHONES = [
  {x: 560, w: 360, z: -40, clip: {meta: M.mOpen, ...PHONE_TIMING.mOpen}, at: 0},
  {x: 960, w: 400, z: 60, clip: {meta: M.mServices, ...PHONE_TIMING.mServices}, at: 8},
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
        <div style={{...H2, fontSize: 68, color: C.blue}}>On a phone</div>
        <div style={{...BODY, marginTop: 14, fontSize: 26, color: C.muted}}>The build, your services and the menu, one thumb away.</div>
      </div>
    </AbsoluteFill>
  );
};
