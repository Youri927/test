import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {LowerThird, TileCover, TileReveal, Wall} from '../Bits';
import {M} from '../clips';
import {CameraRig, CamKey} from '../lib/camera';
import {ease} from '../lib/ease';
import {BrowserAt, Box, PhoneAt, onSite} from '../Stage';
import {BEAT, C, DISPLAY, E, range} from '../util';

const B: Box = {x: 960, y: 530, w: 1500};
const WIDE = {x: 960, y: 540, s: 1.0};
const WHIP = 1250;
const WHIP_LEN = 20;

/** Entrée en filé : la caméra arrive de la gauche, très vite, puis se pose */
const whipIn = (to: Partial<CamKey> = WIDE): CamKey[] => [
  {...to, x: (to.x ?? 960) - WHIP, rz: -0.6, f: 0},
  {...to, rz: 0, ease: ease.out, f: WHIP_LEN},
];
/** Sortie en filé vers la droite, à partir du dernier cadrage */
const whipOut = (len: number, from: Partial<CamKey>): CamKey[] => [
  {...from, f: len - WHIP_LEN},
  {...from, x: (from.x ?? 960) + WHIP, rz: 0.6, ease: ease.in, f: len},
];
const end = (len: number, last: CamKey) => [{...last, f: len - WHIP_LEN, ease: E.soft}, ...whipOut(len, last).slice(1)];

/* ——— L'accueil : la photo se pose en mosaïque, le titre monte ——— */
export const HERO_LEN = 12 * BEAT;
export const AfterHero: React.FC = () => {
  const last = {...WIDE, s: 1.02, f: 0};
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          {f: 0, ...WIDE, s: 0.93},
          onSite(B, 720, 620, {f: 50, s: 1.16, ease: E.soft}),
          onSite(B, 720, 600, {f: 150, s: 1.2, ease: E.sine}),
          onSite(B, 700, 230, {f: 240, s: 1.26, ease: E.soft}),
          onSite(B, 720, 240, {f: 320, s: 1.28, ease: E.sine}),
          {f: 400, ...WIDE, s: 1.0, ease: E.soft},
          ...end(HERO_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dHero, from: 0, rate: 1}} />
      </CameraRig>
      <LowerThird tag="First impression" title="Their own work, set like tile." text="On load, the homepage photo lays itself down tile by tile, the way they set a waterline." at={170} out={HERO_LEN - 24} right />
    </AbsoluteFill>
  );
};

/* ——— La visite guidée : la caméra s'approche de chaque partie du bassin ——— */
export const TOUR_LEN = 18 * BEAT;
export const AfterTour: React.FC = () => {
  const last = onSite(B, 560, 480, {f: 0, s: 1.12});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          onSite(B, 620, 300, {f: 70, s: 1.08, ease: E.soft}),
          onSite(B, 470, 480, {f: 150, s: 1.3, ease: E.soft}),
          onSite(B, 500, 490, {f: 420, s: 1.32, ease: E.sine}),
          onSite(B, 760, 480, {f: 520, s: 1.16, ease: E.soft}),
          onSite(B, 520, 480, {f: 640, s: 1.24, ease: E.soft}),
          ...end(TOUR_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dTour, from: 0, rate: 1.34}} />
      </CameraRig>
      <LowerThird tag="What we rebuild" title="A guided tour of a real pool." text="Scroll, and the camera moves in on each part: the finish, the waterline, the coping, the deck, the light, the equipment." at={150} out={620} right />
    </AbsoluteFill>
  );
};

/* ——— Les chantiers : les fiches s'empilent ——— */
export const WORK_LEN = 12 * BEAT;
export const AfterWork: React.FC = () => {
  const last = onSite(B, 720, 470, {f: 0, s: 1.06});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          onSite(B, 720, 470, {f: 80, s: 1.1, ease: E.soft}),
          onSite(B, 700, 480, {f: 300, s: 1.14, ease: E.sine}),
          ...end(WORK_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dWork, from: 0, rate: 1.32}} />
      </CameraRig>
      <LowerThird tag="Recent work" title="Four renovations, four build sheets." text="Each project fills the screen with what went in: finish, tile, coping, equipment. The sheets stack as you scroll." at={30} out={WORK_LEN - 30} right dark />
    </AbsoluteFill>
  );
};

/* ——— Le local technique : l'« après » monte derrière une ligne d'eau ——— */
export const EQUIP_LEN = 12 * BEAT;
export const AfterEquip: React.FC = () => {
  const last = {...WIDE, s: 1.03, f: 0};
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          onSite(B, 720, 560, {f: 80, s: 1.16, ease: E.soft}),
          onSite(B, 720, 520, {f: 250, s: 1.18, ease: E.sine}),
          {f: 330, ...WIDE, s: 1.02, ease: E.soft},
          ...end(EQUIP_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dEquip, from: 0, rate: 1.25}} />
      </CameraRig>
      <LowerThird tag="Equipment" title="The “after” rises like water." text="Their real before and after photos, revealed behind a yellow waterline. Then the brands they install, in big type." at={40} out={EQUIP_LEN - 30} />
    </AbsoluteFill>
  );
};

/* ——— Les avis : Matt et Jacob ——— */
export const REVIEWS_LEN = 12 * BEAT;
export const AfterReviews: React.FC = () => {
  const last = onSite(B, 720, 520, {f: 0, s: 1.08});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          onSite(B, 520, 470, {f: 70, s: 1.24, ease: E.soft}),
          onSite(B, 560, 480, {f: 180, s: 1.26, ease: E.sine}),
          onSite(B, 720, 440, {f: 270, s: 1.08, ease: E.soft}),
          onSite(B, 720, 560, {f: 390, s: 1.14, ease: E.soft}),
          ...end(REVIEWS_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dReviews, from: 0, rate: 1.25}} />
      </CameraRig>
      <LowerThird tag="Reviews" title="Meet Matt and Jacob." text="19 of their 33 published reviews name them. All 33 are on the page, word for word, with the names highlighted." at={60} out={REVIEWS_LEN - 30} right />
    </AbsoluteFill>
  );
};

/* ——— La licence, puis le financement ——— */
export const LICENSE_LEN = 12 * BEAT;
const LICENSE_CUT = 230;
export const AfterLicense: React.FC = () => {
  const last = onSite(B, 720, 440, {f: 0, s: 1.08});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          onSite(B, 620, 470, {f: 70, s: 1.2, ease: E.soft}),
          onSite(B, 640, 480, {f: 190, s: 1.22, ease: E.sine}),
          {f: 270, ...WIDE, s: 1.02, ease: E.soft},
          onSite(B, 720, 420, {f: 390, s: 1.12, ease: E.soft}),
          ...end(LICENSE_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dLicense, from: 0, rate: 1.375}} />
      </CameraRig>
      <LowerThird tag="License" title="Licensed, in large type." text="CPC1460668 rolls up like an odometer, with a link to verify it on the state register." at={40} out={LICENSE_CUT - 6} />
      <Sequence from={LICENSE_CUT} layout="none">
        <LowerThird tag="Financing" title="Pay over time." text="Their Lyon Financial offer, from their own site: rates as low as 2.99%, up to $150,000, terms up to 25 years." at={20} out={LICENSE_LEN - LICENSE_CUT - 26} right dark />
      </Sequence>
    </AbsoluteFill>
  );
};

/* ——— La carte de la baie ——— */
export const AREAS_LEN = 11 * BEAT;
export const AfterAreas: React.FC = () => {
  const last = onSite(B, 620, 480, {f: 0, s: 1.1});
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          onSite(B, 720, 470, {f: 80, s: 1.06, ease: E.soft}),
          onSite(B, 900, 470, {f: 200, s: 1.18, ease: E.soft}),
          onSite(B, 920, 480, {f: 270, s: 1.2, ease: E.sine}),
          onSite(B, 560, 480, {f: 360, s: 1.16, ease: E.soft}),
          ...end(AREAS_LEN, last),
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dAreas, from: 0, rate: 1.3}} />
      </CameraRig>
      <LowerThird tag="Service area" title="A real map of Tampa Bay." text="Drawn from US Census data. Pick a neighborhood and its project and reviews appear." at={30} out={190} />
    </AbsoluteFill>
  );
};

/* ——— Le devis ——— */
export const ESTIMATE_LEN = 14 * BEAT;
export const AfterEstimate: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.6}
        keys={[
          ...whipIn(),
          onSite(B, 1010, 390, {f: 70, s: 1.3, ease: E.soft}),
          onSite(B, 1010, 470, {f: 200, s: 1.32, ease: E.sine}),
          onSite(B, 1010, 520, {f: 340, s: 1.3, ease: E.soft}),
          onSite(B, 1010, 470, {f: 460, s: 1.26, ease: E.soft}),
          {f: ESTIMATE_LEN, ...WIDE, s: 1.06, ease: E.soft},
        ]}
      >
        <BrowserAt b={B} clip={{meta: M.dEstimate, from: 0, rate: 1.4}} />
      </CameraRig>
      <LowerThird tag="Free estimate" title="One minute to ask." text="Pick the work, leave a number. Call and text are one tap away, with live open / closed status." at={40} out={ESTIMATE_LEN - 60} />
      <TileCover level={range(f, ESTIMATE_LEN - 52, ESTIMATE_LEN, 0, 1)} color={C.navy} />
    </AbsoluteFill>
  );
};

/* ——— Sur téléphone ——— */
export const MOBILE_LEN = 10 * BEAT;
const PHONES = [
  {x: 545, w: 390, z: -30, clip: {meta: M.mHero, from: 10, rate: 1.05}, at: 4},
  {x: 960, w: 430, z: 60, clip: {meta: M.mTour, from: 0, rate: 1.2}, at: 10},
  {x: 1375, w: 390, z: -30, clip: {meta: M.mMenu, from: 0, rate: 0.9}, at: 16},
];
export const AfterMobile: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Wall />
      <CameraRig
        blur={0.5}
        keys={[
          {f: 0, x: 960, y: 590, s: 0.95, ry: 6},
          {f: MOBILE_LEN, x: 960, y: 580, s: 1.0, ry: -6, ease: E.sine},
        ]}
      >
        {PHONES.map((p, i) => (
          <PhoneAt key={i} x={p.x} y={610 + Math.sin((f + i * 40) / 60) * 7 + range(f, p.at, p.at + 40, 140, 0, E.out)} w={p.w} z={p.z} clip={p.clip} transform={`rotateY(${(i - 1) * -5}deg)`} />
        ))}
      </CameraRig>
      <div style={{position: 'absolute', left: 0, right: 0, top: 44, textAlign: 'center', ...DISPLAY, fontSize: 54, color: C.ink, opacity: range(f, 24, 54)}}>
        Made for the phone in their pocket
      </div>
      <TileReveal level={range(f, 0, 50, 0, 1)} color={C.navy} />
      <TileCover level={range(f, MOBILE_LEN - 52, MOBILE_LEN, 0, 1)} color={C.navy} />
    </AbsoluteFill>
  );
};
