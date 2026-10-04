import React, {useId} from 'react';
import {AbsoluteFill, Html5Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import './fonts';
import {DAY, DAY_FRAMES, DAY_FROM, PHONE, mouseAt, scrollAt} from './clips';
import {E, F, FPS, H, W, range, sec} from './util';

/* Une journée à la Biza : le site filmé en un seul plan-séquence, plein cadre. Aucune coupe : la seule
   transition, c'est l'heure qui passe. On accélère entre les moments, on ralentit sur chacun ; des
   sous-titres tiennent lieu de voix off ; à la fin, la journée se rembobine jusqu'au début. */

// ——— Les sous-titres, comme une voix off sans voix ———
const CAPTIONS: [number, number, string][] = [
  [0.9, 4.2, 'Le nouveau site de la Ferme de la Biza se lit comme une journée.'],
  [4.7, 6.5, 'En descendant, l’heure avance, et le ciel avec elle.'],
  [7.2, 10.4, '15 h 30. On arrive par le porche de la ferme.'],
  [13.2, 18.4, '16 h 30, le oui sur l’îlot. Le parc et l’eau sont dessinés en direct.'],
  [20.9, 24.2, '18 h, le vin d’honneur sous le préau.'],
  [26.4, 30.8, '20 h, le dîner : les trois menus du domaine.'],
  [32.8, 36.6, '23 h, la guinguette s’allume.'],
  [38.8, 42.4, '2 h, le gîte : cinq chambres, à quelques pas.'],
  [43.1, 45.3, 'Puis le jour se lève.'],
  [46.0, 49.8, 'Le lendemain, familles et entreprises ont chacune leur porte.'],
  [51.8, 54.6, '4,9 sur 5 sur Mariages.net, d’après 126 avis.'],
  [55.9, 60.2, 'Sur mobile, la même journée.'],
  [61.3, 63.6, 'Et la journée recommence.'],
  [64.9, 67.2, 'Proposition de refonte du site de la Ferme de la Biza.'],
];

// ——— La caméra respire : de lentes avancées sur les moments, défaites pendant les accélérations ———
type Push = {a: number; b: number; c: number; d: number; s: number; x: number; y: number};
// (les points fixes sont choisis pour que l'horloge du site, en bas à gauche, reste entière dans le cadre)
const PUSHES: Push[] = [
  {a: 13.4, b: 18.2, c: 18.6, d: 20.2, s: 1.1, x: 540, y: 930}, // l'îlot, l'arche, les chaises
  {a: 26.6, b: 30.6, c: 30.8, d: 32.0, s: 1.09, x: 597, y: 900}, // la carte des menus
  {a: 39.0, b: 42.6, c: 42.8, d: 44.0, s: 1.07, x: 480, y: 860}, // le gîte qui s'allume
  {a: 51.8, b: 55.0, c: 55.2, d: 56.4, s: 1.06, x: 700, y: 820}, // la note
  {a: 64.4, b: 68.5, c: 69, d: 70, s: 1.05, x: 960, y: 780}, // le nom, pour finir
];
const camAt = (t: number) => {
  let s = 1, x = W / 2, y = H / 2;
  for (const p of PUSHES) {
    const k = t < p.a ? 0 : t < p.b ? E.soft((t - p.a) / (p.b - p.a)) : t < p.c ? 1 : t < p.d ? 1 - E.inOut((t - p.c) / (p.d - p.c)) : 0;
    if (k > 0) { s = 1 + (p.s - 1) * k; x = p.x; y = p.y; }
  }
  return {s, x, y};
};

// ——— Le passage sur mobile : une fente s'ouvre au milieu du plan ———
const SLIT_AT = sec(55);
const PHONE_H = 860;
const PHONE_W = (PHONE_H * PHONE.width) / PHONE.height;
const slitOpen = (f: number) => {
  const l = f - SLIT_AT;
  return E.out(range(l, 0, 42)) * (1 - E.inOut(range(l, PHONE.frames - 52, PHONE.frames - 4)));
};

/** les plans filmés, bout à bout */
const Takes: React.FC = () => (
  <>
    {DAY.map((m, i) => (
      <Sequence key={m.name} from={DAY_FROM[i]} durationInFrames={m.frames} layout="none">
        <OffthreadVideo src={staticFile(`site/${m.name}.mp4`)} muted style={{position: 'absolute', inset: 0, width: W, height: H}} />
      </Sequence>
    ))}
  </>
);

const ARROW = 'M1 1 L1 21.5 L6.6 16.4 L10.4 24.8 L14 23.2 L10.3 15 L17.6 15 Z';
/** la souris, redessinée nette, seulement là où le site y répond */
const Cursor: React.FC = () => {
  const f = useCurrentFrame();
  const m = mouseAt(f);
  if (!m) return null;
  let a = 0;
  while (a < 12 && mouseAt(f - a)) a++;
  let b = 0;
  while (b < 12 && mouseAt(f + b)) b++;
  const o = Math.min(1, a / 10, b / 10);
  return (
    <svg viewBox="0 0 20 26" style={{position: 'absolute', left: m.x - 1.5, top: m.y - 1.5, width: 23, height: 30, overflow: 'visible', opacity: o, filter: 'drop-shadow(0 3px 5px rgba(0,0,0,.3))'}}>
      <path d={ARROW} fill="#fff" stroke="#16201c" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  );
};

/** le site, plein cadre : flou de mouvement vertical quand ça défile vite (sauf la barre du haut et l'horloge) */
const Day: React.FC = () => {
  const f = useCurrentFrame();
  const id = 'mb' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const v = Math.abs(scrollAt(f) - scrollAt(f - 1)); // px par image
  const sigma = Math.min(v * 0.3, 48);
  const blurOn = sigma > 0.6;
  const cam = camAt(f / FPS);
  const open = f >= SLIT_AT ? slitOpen(f) : 0;
  return (
    <AbsoluteFill style={{filter: open > 0.001 ? `blur(${(open * 7).toFixed(2)}px) brightness(${(1 - open * 0.3).toFixed(3)})` : undefined}}>
      <AbsoluteFill style={{transformOrigin: `${cam.x}px ${cam.y}px`, transform: `scale(${cam.s.toFixed(5)})`}}>
        <svg width="0" height="0" style={{position: 'absolute'}}>
          <filter id={id} x="0" y="-4%" width="100%" height="108%">
            <feGaussianBlur stdDeviation={`0 ${sigma.toFixed(2)}`} edgeMode="duplicate" />
          </filter>
        </svg>
        <AbsoluteFill style={{filter: blurOn ? `url(#${id})` : undefined}}>
          <Takes />
        </AbsoluteFill>
        {blurOn ? (
          <>
            <AbsoluteFill style={{clipPath: 'inset(0 0 1012px 0)'}}><Takes /></AbsoluteFill>
            <AbsoluteFill style={{clipPath: 'inset(988px 1600px 0 30px)'}}><Takes /></AbsoluteFill>
          </>
        ) : null}
        <Cursor />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** le téléphone : sans coque, juste l'écran, qui s'ouvre comme une fente */
const Phone: React.FC = () => {
  const f = useCurrentFrame() + SLIT_AT;
  const open = slitOpen(f);
  if (open < 0.002) return null;
  const w = PHONE_W * open;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: (W - w) / 2, top: (H - PHONE_H) / 2 - 34, width: w, height: PHONE_H, overflow: 'hidden', borderRadius: 40 * Math.min(1, open * 3), boxShadow: `0 40px 110px rgba(0,0,0,${0.45 * open})`}}>
        <OffthreadVideo src={staticFile(`site/${PHONE.name}.mp4`)} muted style={{position: 'absolute', top: 0, left: -(PHONE_W - w) / 2, width: PHONE_W, height: PHONE_H}} />
      </div>
    </AbsoluteFill>
  );
};

const Captions: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const c = CAPTIONS.find(([a, b]) => t >= a - 0.4 && t <= b + 0.4);
  if (!c) return null;
  const [a, b, text] = c;
  const o = Math.min(range(t, a - 0.35, a + 0.1, 0, 1, E.sine), 1 - range(t, b - 0.1, b + 0.35, 0, 1, E.sine));
  const rise = (1 - range(t, a - 0.35, a + 0.3, 0, 1, E.out)) * 10;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 250, background: 'linear-gradient(to top, rgba(8,12,14,.44), rgba(8,12,14,0))', opacity: o}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 62, textAlign: 'center', font: `500 33px/1.3 ${F.body}`, letterSpacing: '-0.005em', color: '#fff', opacity: o, transform: `translateY(${rise.toFixed(2)}px)`, textShadow: '0 2px 16px rgba(0,0,0,.45), 0 0 2px rgba(0,0,0,.4)'}}>
        {text}
      </div>
    </AbsoluteFill>
  );
};

/** ouverture au noir, et fondu au noir pour finir */
const Fades: React.FC = () => {
  const f = useCurrentFrame();
  const o = Math.max(1 - range(f, 0, 34, 0, 1, E.sine), range(f, DAY_FRAMES - 44, DAY_FRAMES - 2, 0, 1, E.sine));
  return o > 0.001 ? <AbsoluteFill style={{background: '#000', opacity: o}} /> : null;
};

export const FILM_FRAMES = DAY_FRAMES;

export const Film: React.FC<{sound: boolean}> = ({sound}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Day />
    <Sequence from={SLIT_AT} durationInFrames={PHONE.frames} name="Sur mobile">
      <Phone />
    </Sequence>
    <Captions />
    <Fades />
    {sound ? <Html5Audio src={staticFile('sfx/day.wav')} /> : null}
  </AbsoluteFill>
);
