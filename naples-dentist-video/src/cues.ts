/**
 * Les repères des bruitages, partagés par src/PresSound.tsx (aperçu dans Remotion) et sound/mix.mjs (bande-son finale).
 * Chaque repère : [image, bruitage, volume]. Ce fichier n'importe que beats.ts : Node le lit directement.
 */
import {END, MARKS, OPEN, PHONE_TIMING, PILLS, TIMING, TODAY, TYPING, type ClipTiming} from './beats.ts';

export type Cue = [number, string, number];

export const cues = (START: Record<string, number>, LEN: Record<string, number>, clicks: (clip: string) => number[]): Cue[] => {
  const out: Cue[] = [];
  const at = (f: number, name: string, vol: number) => {
    if (!out.some(([g, n]) => g === Math.round(f) && n === name)) out.push([Math.round(f), name, vol]);
  };
  const pre = (scene: string) => PILLS[scene] ?? 0;
  const seq = (scene: string) => START[scene] - pre(scene);
  const inScene = (scene: string, f: number) => f >= seq(scene) && f < START[scene] + LEN[scene];
  // image du montage où passe l'image `c` du plan filmé d'une scène
  const clipAt = (scene: string, c: number, t: ClipTiming = TIMING[scene]) => seq(scene) + t.delay + (c - t.from) / t.rate;

  // ouverture : la racine, les sept filets (de plus en plus aigus), la couronne qui se pose
  at(OPEN.root, 'air', 0.1);
  for (let k = 0; k < 7; k++) at(OPEN.thread0 + k * OPEN.threadStep, `thread${k + 1}`, 0.2);
  at(OPEN.crown, 'thump', 0.42);

  // aujourd'hui : chaque page qu'on ouvre, chaque preuve surlignée
  for (const n of TODAY.pages) at(START.Today + n - 7, 'page', 0.16);
  for (const m of TODAY.marks) at(START.Today + m, 'marker', 0.24);

  // les pastilles qui s'ouvrent ; celle du sourire, plus longue, ouvre le nouveau site
  for (const [scene, len] of Object.entries(PILLS)) at(seq(scene) - 2, len > 40 ? 'pillLong' : 'pill', len > 40 ? 0.34 : 0.28);
  at(START.Turn + 22, 'pop', 0.16);

  // l'accueil : la pastille du titre grandit, le nom apparaît
  at(clipAt('Hero', MARKS.heroScroll), 'swell', 0.14);
  at(clipAt('Hero', 385), 'air', 0.08);

  // les implants : un tic par filet, la couronne qui se pose, les légendes
  // (calés sur la double-croche la plus proche : au plus 5 images d'écart avec l'image)
  MARKS.implantThreads.forEach((c, k) => at(Math.round(clipAt('Implants', c) / 10) * 10, `thread${k + 1}`, 0.17));
  at(clipAt('Implants', MARKS.implantCrown), 'thump', 0.3);
  MARKS.implantLabels.forEach((c) => at(clipAt('Implants', c), 'tick', 0.1));

  // la course : E4D arrive (une cloche claire), puis la méthode habituelle (plus sourde)
  at(clipAt('Crowns', MARKS.e4d), 'chime', 0.24);
  at(clipAt('Crowns', MARKS.usual), 'done', 0.16);

  // les clics filmés, replacés sur la ligne de temps du montage
  const filmed = (scene: string, clip: string, t: ClipTiming = TIMING[scene]) => clicks(clip).map((c) => clipAt(scene, c, t)).filter((f) => inScene(scene, f));
  const treat = filmed('Treatments', 'dTreatments');
  treat.forEach((f) => at(f, 'tap', 0.28));
  at(clipAt('Treatments', MARKS.sheet) + 4, 'air', 0.15);

  // la sédation : la lumière baisse deux fois
  at(clipAt('Sedation', MARKS.level1), 'dim1', 0.3);
  at(clipAt('Sedation', MARKS.level2), 'dim2', 0.32);

  // le parcours : une note par étape (Michigan, New York, Naples)
  MARKS.stops.forEach((c, k) => {
    const f = clipAt('Doctor', c);
    if (f >= seq('Doctor')) at(f, `stop${k + 1}`, 0.22);
  });

  // la demande : clics, frappe, envoi
  filmed('Request', 'dRequest').forEach((f) => at(f, 'tap', 0.28));
  let key = 0;
  const t = TIMING.Request;
  for (const [a, b, chars] of TYPING) {
    let last = -99;
    for (let k = 1; k <= chars; k++) {
      const f = clipAt('Request', (a + ((b - a) * k) / chars) * 60, t);
      if (f - last < 4 || !inScene('Request', f)) continue;
      last = f;
      at(f, `key${(key++ % 3) + 1}`, 0.07);
    }
  }
  at(clipAt('Request', MARKS.sent) + 8, 'chime', 0.28);

  // téléphones : la course, le toucher
  const phoneAt = (c: number, timing: ClipTiming) => seq('Mobile') + timing.delay + (c - timing.from) / timing.rate;
  at(phoneAt(MARKS.mE4d, PHONE_TIMING.mCrowns), 'chime', 0.12);
  at(phoneAt(MARKS.mTap, PHONE_TIMING.mSheet), 'tap', 0.22);
  at(phoneAt(MARKS.mTap, PHONE_TIMING.mSheet) + 4, 'air', 0.12);

  // la fin : le logo se reconstruit, vite ; le sourire s'ouvre ; le téléphone
  const e = START.End;
  for (let k = 0; k < 7; k++) at(e + END.logo.thread0 + k * END.logo.threadStep, `thread${k + 1}`, 0.1);
  at(e + END.logo.crown, 'thump', 0.24);
  at(e + END.pill, 'pop', 0.12);
  at(e + END.phone, 'air', 0.1);
  return out.sort((x, y) => x[0] - y[0]);
};
