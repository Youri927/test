import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Caption} from '../Bits';
import {M} from '../clips';
import {CameraRig, CamKey} from '../lib/camera';
import {BrowserAt, Box, PhoneAt, aside, asideBottom, asideWidth, focus} from '../Stage';
import type {Clip} from '../Screen';
import {PHONE_TIMING, TIMING} from '../beats.ts';
import {BG, LEN} from '../timeline';
import {BODY, C, E, H2, range} from '../util';

const B: Box = {x: 960, y: 552, w: 1480};
const WIDE = {x: 960, y: 552, s: 1.0};
/** échelle du navigateur rangé de côté pour laisser la place à une légende */
const SIDE = 0.8;

const clipOf = (meta: Clip['meta'], scene: string): Clip => ({meta, ...TIMING[scene]});

/** Fond de la scène (couleur de la partie du site), caméra, et le plan filmé du site dans le navigateur */
const Shot: React.FC<{scene: string; keys: CamKey[]; clip: Clip; dark?: boolean; children?: React.ReactNode}> = ({scene, keys, clip, dark, children}) => (
  <AbsoluteFill style={{background: BG[scene]}}>
    <CameraRig blur={0.5} keys={keys}>
      <BrowserAt b={B} clip={clip} dark={dark} />
    </CameraRig>
    {children}
  </AbsoluteFill>
);

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

/* ——— L'avant/après : l'eau monte d'elle-même (navigateur rangé, légende), puis on s'approche : la souris prend la ligne
   d'eau sur le temps 4, la monte, la descend, la remonte et la lâche sur le temps 10 ——— */
export const AfterRefill: React.FC = () => {
  return (
    <Shot
      scene="Refill"
      dark
      clip={clipOf(M.dRefill, 'Refill')}
      keys={[
        aside(B, 'right', {f: 0, s: SIDE - 0.012}),
        aside(B, 'right', {f: 118, s: SIDE + 0.006, ease: E.sine}),
        // la photo du site ne fait que 700 px de large : on s'approche sans l'agrandir au-delà de 1,3×
        focus(B, 1000, 372, {f: 168, s: 1.24, ease: E.soft}),
        focus(B, 1000, 376, {f: LEN.Refill, s: 1.28, ease: E.sine}),
      ]}
    >
      <Caption title="Before and after" text="Drag the water line up, and the spa fills with its new glass tile." at={6} out={134} tone="dark" side="right" {...capProps} />
    </Shot>
  );
};

/* ——— Les quatre changements : la photo suit le nom qu'on lit ——— */
export const AfterChanges: React.FC = () => {
  const len = LEN.Changes;
  return <Shot scene="Changes" dark clip={clipOf(M.dChanges, 'Changes')} keys={[{...WIDE, f: 0, s: 1.02}, focus(B, 860, 470, {f: len, s: 1.12, ease: E.sine})]} />;
};

/* ——— Le local technique : un appareil choisi, le reste dans l'ombre ——— */
export const AfterPad: React.FC = () => {
  const len = LEN.Pad;
  return (
    <Shot
      scene="Pad"
      clip={clipOf(M.dPad, 'Pad')}
      keys={[
        // la scène commence navigateur rangé (pas de grand mouvement pendant l'ouverture au noir)
        aside(B, 'right', {f: 0, s: SIDE - 0.012}),
        aside(B, 'right', {f: 166, s: SIDE + 0.008, ease: E.sine}),
        // les deux clics suivants (temps 7 et 11), au plus près de la photo et du détail
        focus(B, 650, 452, {f: 226, s: 1.18, ease: E.soft}),
        focus(B, 660, 452, {f: len, s: 1.22, ease: E.sine}),
      ]}
    >
      <Caption title="Every box on the pad" text="Pick a part on a real equipment pad: the rest goes dark, and your repairs for it show on the side." at={34} out={178} side="right" {...capProps} />
    </Shot>
  );
};

/* ——— Le déroulé : la ligne se remplit à mesure qu'on lit ——— */
export const AfterProcess: React.FC = () => {
  const len = LEN.Process;
  return (
    <Shot scene="Process" dark clip={clipOf(M.dProcess, 'Process')} keys={sideKeys('left', len, 50, 220)}>
      <Caption title="In your customers’ words" text="How a remodel goes, step by step, told with quotes from your reviews." at={44} out={232} tone="dark" side="left" {...capProps} />
    </Shot>
  );
};

/* ——— Les avis : la grande citation, puis la carte des villes ——— */
export const AfterReviews: React.FC = () => {
  const len = LEN.Reviews;
  return (
    <Shot scene="Reviews" clip={clipOf(M.dReviews, 'Reviews')} keys={sideKeys('left', len, 170, 330, [{...WIDE, f: 380, s: 1.0}, focus(B, 700, 470, {f: len, s: 1.1, ease: E.soft})])}>
      <Caption title="Reviews by town" text="Your 43 reviews on a map of North Dallas, with its real lakes. Pick a town to read what people there wrote." at={164} out={342} side="left" {...capProps} />
    </Shot>
  );
};

/* ——— L'entreprise, la salle d'exposition (« Open now »), le devis, puis « PETRI » en mosaïque ——— */
export const AfterClose: React.FC = () => {
  const len = LEN.Close;
  return (
    <Shot scene="Close" clip={clipOf(M.dClose, 'Close')} keys={sideKeys('right', len, 70, 236, [{...WIDE, f: 300, s: 1.0}, {...WIDE, f: len, s: 1.07, ease: E.sine}])}>
      <Caption title="Open now?" text="Your showroom hours with a live open or closed status in Texas time, and a form that writes the email." at={64} out={246} side="right" {...capProps} />
    </Shot>
  );
};

/* ——— Sur téléphone ——— */
const PHONES = [
  {x: 560, w: 360, z: -40, clip: {meta: M.mOpen, ...PHONE_TIMING.mOpen}, at: 0},
  {x: 960, w: 400, z: 60, clip: {meta: M.mTowns, ...PHONE_TIMING.mTowns}, at: 8},
  {x: 1360, w: 360, z: -40, clip: {meta: M.mMenu, ...PHONE_TIMING.mMenu}, at: 16, darkFrom: M.mMenu.clicks[0]},
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
            darkFrom={p.darkFrom}
            transform={`rotateY(${(i - 1) * -6}deg)`}
          />
        ))}
      </CameraRig>
      <div style={{position: 'absolute', left: 0, right: 0, top: 58, textAlign: 'center', opacity: range(f, 30, 60), transform: `translateY(${range(f, 30, 70, 20, 0, E.out)}px)`}}>
        <div style={{...H2, fontSize: 66, color: C.ink}}>On a phone</div>
        <div style={{...BODY, marginTop: 16, fontSize: 26, color: C.muted}}>The retiled waterline, the map of your towns and the menu, one thumb away.</div>
      </div>
    </AbsoluteFill>
  );
};
