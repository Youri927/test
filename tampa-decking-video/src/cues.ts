/**
 * Les repères des bruitages, partagés par src/PresSound.tsx (aperçu dans Remotion) et sound/mix.mjs (bande-son finale).
 * Chaque repère : [image, bruitage, volume]. Ce fichier n'importe que beats.ts : Node le lit directement.
 */
import {DIVE_LEN, END_SWAP, FROM, LAYER_FRAMES, MARK, MARK_THUMBS, OPEN_MOVES, RATE, RISES, TYPING} from './beats.ts';

export type Cue = [number, string, number];

export const cues = (START: Record<string, number>, LEN: Record<string, number>, clicks: (clip: string) => number[]): Cue[] => {
  const out: Cue[] = [];
  // deux gestes à la même image (deux téléphones touchés ensemble) ne donnent qu'un son
  const at = (f: number, name: string, vol: number) => {
    if (!out.some(([g, n]) => g === Math.round(f) && n === name)) out.push([Math.round(f), name, vol]);
  };
  const inScene = (scene: string, f: number) => f >= START[scene] && f < START[scene] + LEN[scene];

  // ouverture : la fenêtre monte, puis descend d'une couche à l'autre
  at(20, 'air', 0.14);
  for (const [a] of OPEN_MOVES) at(a - 3, 'swish', 0.16);
  // les lignes d'eau qui montent entre les chapitres
  for (const [name, pre] of Object.entries(RISES)) at(START[name] - pre - 3, 'rise', 0.32);
  // le surligneur sur le code brut du site actuel
  at(START.Today + MARK, 'marker', 0.32);
  at(START.Today + MARK_THUMBS, 'tap', 0.18);
  // les plongées d'une section à l'autre ; l'entrée dans le grand bain est plus profonde
  for (const name of ['Layers', 'Work', 'Surfaces', 'Cost', 'About', 'Areas', 'Estimate', 'Mobile', 'End']) {
    at(START[name] - DIVE_LEN, name === 'About' ? 'plunge' : 'dive', name === 'About' ? 0.36 : 0.32);
  }
  // les couches qui s'allument : ré, la, fa dièse, ré
  LAYER_FRAMES.forEach((f, k) => at(START.Layers + f, `layer${k + 1}`, 0.32));

  // les clics filmés, replacés sur la ligne de temps du montage
  const filmed = (scene: string, clip: string, rate: number) =>
    clicks(clip)
      .map((c) => START[scene] + (c - (FROM[scene] ?? 0)) / rate)
      .filter((f) => inScene(scene, f));
  const work = filmed('Work', 'dWork', RATE.Work);
  work.forEach((f) => at(f, 'tap', 0.3));
  if (work[0]) at(work[0] + 2, 'air', 0.16); // la visionneuse s'ouvre
  filmed('Areas', 'dAreas', RATE.Areas).forEach((f) => at(f, 'tap', 0.3));
  const est = filmed('Estimate', 'dEstimate', RATE.Estimate);
  est.forEach((f) => at(f, 'tap', 0.3));
  if (est.length) at(est[est.length - 1] + 8, 'chime', 0.3); // le formulaire est envoyé
  const phones = [...filmed('Mobile', 'mLayers', 1), ...filmed('Mobile', 'mMenu', 1)];
  phones.forEach((f) => at(f, 'tap', 0.2));
  const menu = filmed('Mobile', 'mMenu', 1);
  if (menu[0]) at(menu[0] + 2, 'air', 0.12);

  // la frappe au clavier : une touche par caractère, au plus une toutes les 4 images
  let key = 0;
  for (const [scene, windows] of Object.entries(TYPING)) {
    const rate = RATE[scene as keyof typeof RATE];
    for (const [a, b, chars] of windows) {
      let last = -99;
      for (let k = 1; k <= chars; k++) {
        const f = START[scene] + ((a + ((b - a) * k) / chars) * 60) / rate;
        if (f - last < 4 || !inScene(scene, f)) continue;
        last = f;
        at(f, `key${(key++ % 3) + 1}`, 0.07);
      }
    }
  }

  // la fin : le grand bain, puis le nom
  at(START.End + 12, 'deep', 0.28);
  at(START.End + END_SWAP, 'air', 0.14);
  return out.sort((x, y) => x[0] - y[0]);
};
