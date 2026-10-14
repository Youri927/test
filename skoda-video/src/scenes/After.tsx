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

/* ——— Un Skoda derrière chaque chantier : le nom reste en place, leurs chantiers passent devant ——— */
export const AfterName: React.FC = () => (
  <Shot scene="Name" clip={clipOf(M.dName, 'Name')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption
      title={['A Skoda behind', 'every job']}
      text="Your name stays put as your job sites pass in front of it: a cleared lot, a block shell, a finished home. All jobs are owner supervised."
      at={14}
      out={LEN.Name - 2}
      side="left"
      {...cap}
    />
  </Shot>
);

/* ——— Les maisons neuves : le terrain, la coque, la maison ——— */
export const AfterHomes: React.FC = () => (
  <Shot scene="Homes" clip={clipOf(M.dHomes, 'Homes')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption
      title={['From the lot up']}
      text="What you check on a lot before anything is drawn. Then three of your job sites, the shell and the finished home revealed as they arrive."
      at={14}
      out={LEN.Homes - 2}
      side="right"
      {...cap}
    />
  </Shot>
);

/* ——— Les pièces : douze intérieurs, et la visionneuse ——— */
export const AfterRooms: React.FC = () => (
  <Shot scene="Rooms" clip={clipOf(M.dRooms, 'Rooms')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption
      title={['Rooms you’ve built']}
      text="Twelve interiors from your new homes and remodels, in Florida and in Ohio. One click opens each one large."
      at={14}
      out={LEN.Rooms - 2}
      side="left"
      {...cap}
    />
  </Shot>
);

/* ——— Better than new : une maison, de la tempête à décembre 2023 ——— */
export const AfterStory: React.FC = () => (
  <Shot scene="Story" clip={clipOf(M.dStory, 'Story')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption
      title={['Better than new']}
      text="One house, from the storm in November 2022 to December 2023. As you scroll, the time bar moves from the damage to the rebuilt home."
      at={14}
      out={LEN.Story - 2}
      side="right"
      {...cap}
    />
  </Shot>
);

/* ——— La famille : la ligne des dates, puis Chris et Mike ——— */
export const AfterFamily: React.FC = () => (
  <Shot scene="Family" clip={clipOf(M.dFamily, 'Family')} keys={[aside(B, 'left', {f: 0, s: SIDE})]}>
    <Caption
      title={['Since 1950']}
      text="Joe Cicero in 1950, Chris in 1985, Mike in 2014 and his Florida license in 2023, on one line. Then the two of you, in your own words."
      at={14}
      out={LEN.Family - 2}
      side="left"
      {...cap}
    />
  </Shot>
);

/* ——— La consultation : le formulaire écrit l'e-mail ——— */
export const AfterConsult: React.FC = () => (
  <Shot scene="Consult" clip={clipOf(M.dConsult, 'Consult')} keys={[aside(B, 'right', {f: 0, s: SIDE})]}>
    <Caption
      title={['A consultation,', 'by email']}
      text="Pick the project, and your own budget ranges appear. The page writes the email to you, ready to send."
      at={14}
      out={LEN.Consult - 2}
      side="right"
      {...cap}
    />
  </Shot>
);

/* ——— Sur téléphone : les trois téléphones montent à leur place d'un seul mouvement, puis ne bougent plus ——— */
const PW = 380;
const PHONES = [
  {x: 560, clip: {meta: M.mOpen, ...PHONE_TIMING.mOpen}, at: 0},
  {x: 960, clip: {meta: M.mName, ...PHONE_TIMING.mName}, at: 8},
  {x: 1360, clip: {meta: M.mStory, ...PHONE_TIMING.mStory}, at: 16},
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
      <div style={{position: 'absolute', left: 0, right: 0, top: 62, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{...H2, fontSize: 60, color: C.frame}}>
          <Line shift={rise(0)}>On a phone</Line>
        </div>
        <div style={{...BODY, marginTop: 14, fontSize: 26, color: C.slate, opacity: range(f, 40, 66)}}>
          The opening, your job sites passing in front of your name, and the restored house, step by step.
        </div>
      </div>
    </AbsoluteFill>
  );
};
