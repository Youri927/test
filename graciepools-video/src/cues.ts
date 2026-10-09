/**
 * Les repères des bruitages, partagés par src/PresSound.tsx (aperçu dans Remotion) et sound/mix.mjs (bande-son finale).
 * Chaque repère : [image, bruitage, volume]. Ce fichier n'importe que beats.ts : Node le lit directement.
 */
import {CALIPERS, END, MARKS, OPEN, PHONE_TIMING, SHEET, TIMING, TODAY, TYPING, type ClipTiming} from './beats.ts';

export type Cue = [number, string, number];

/** l'ordre des clics du plan du comparateur (capture/shots.mjs, d-planner) et ce qu'ils font */
const PLANNER = ['deep', 'filter', 'escape', 'pin', 'filter', 'deep2', 'finish', 'finish', 'finish', 'filter', 'cove'] as const;

export const cues = (START: Record<string, number>, LEN: Record<string, number>, clicks: (clip: string) => number[]): Cue[] => {
  const out: Cue[] = [];
  const at = (f: number, name: string, vol: number) => {
    if (!out.some(([g, n]) => g === Math.round(f) && n === name)) out.push([Math.round(f), name, vol]);
  };
  const pre = (scene: string) => CALIPERS[scene] ?? 0;
  const seq = (scene: string) => START[scene] - pre(scene);
  const inScene = (scene: string, f: number) => f >= seq(scene) && f < START[scene] + LEN[scene];
  // image du montage où passe l'image `c` du plan filmé d'une scène
  const clipAt = (scene: string, c: number, t: ClipTiming = TIMING[scene]) => seq(scene) + t.delay + (c - t.from) / t.rate;

  // ouverture : la cote compte (petits déclics), le contour se trace, l'eau arrive sur le temps 4, la marque
  for (let k = 0; k < 12; k++) at(OPEN.length + 2 + k * 4, 'tick', 0.05 + 0.006 * k);
  at(OPEN.outline, 'draw', 0.16);
  at(OPEN.fill - 4, 'fill', 0.3);
  at(OPEN.mark + 6, 'pop', 0.16);

  // les règles qui ouvrent les scènes : le ruban se tire, puis les mâchoires s'écartent
  for (const scene of Object.keys(CALIPERS)) {
    at(seq(scene), 'measure', 0.2);
    at(seq(scene) + 10, 'open', 0.24);
  }

  // aujourd'hui : chaque page qu'on ouvre, chaque preuve mesurée
  for (const n of TODAY.pages) at(START.Today + n - 7, 'page', 0.15);
  for (const m of TODAY.marks) at(START.Today + m, 'mark', 0.2);

  // la fiche : la note mesurée ; la page s'efface, les 23 dessins se posent un à un (une note de marimba chacun)
  const s = START.Sheet;
  at(s + SHEET.note + 30, 'mark', 0.2);
  at(s + SHEET.lift, 'lift', 0.22);
  for (let k = 0; k < 23; k++) at(s + SHEET.lift + 10 + k * SHEET.landStep + 50, `land${(k % 8) + 1}`, 0.11 + 0.002 * k);
  at(s + SHEET.title, 'air', 0.1);

  // l'accueil : le Billabong Cove laisse la place au Laguna
  at(clipAt('Hero', MARKS.heroSwitch), 'swap', 0.16);

  // la coque : les étapes du parcours se tracent
  at(clipAt('OnePiece', MARKS.steps) + 4, 'draw', 0.12);

  // les clics filmés, replacés sur la ligne de temps du montage
  const filmed = (scene: string, clip: string, t: ClipTiming = TIMING[scene]) => clicks(clip).map((c) => clipAt(scene, c, t)).filter((f) => inScene(scene, f));
  for (const scene of ['Hero', 'Gallery', 'Service', 'Request']) {
    const clip = {Hero: 'dHero', Gallery: 'dGallery', Service: 'dService', Request: 'dRequest'}[scene] as string;
    filmed(scene, clip).forEach((f) => at(f, 'tap', 0.26));
  }

  // le comparateur : chaque clic, et ce qu'il fait (le bassin qui s'étire ou se rétracte, l'épingle, le coloris)
  clicks('dPlanner').forEach((c, k) => {
    const scene = clipAt('Models', c) < START.Compare ? 'Models' : 'Compare';
    const f = clipAt(scene, c);
    if (!inScene(scene, f)) return;
    at(f, 'tap', 0.24);
    const what = PLANNER[k];
    if (what === 'deep' || what === 'deep2') at(f + 3, 'grow', 0.2);
    if (what === 'escape' || what === 'cove') at(f + 3, 'shrink', 0.2);
    if (what === 'pin') at(f + 2, 'pin', 0.2);
    if (what === 'finish') at(f + 2, 'swatch', 0.22);
  });

  // la galerie : la bande qu'on fait glisser, puis le site qui remonte jusqu'au comparateur
  at(clipAt('Gallery', Math.round(2.45 * 60)), 'drag', 0.16);
  at(clipAt('Gallery', MARKS.cove) + 6, 'air', 0.13);

  // les piscines existantes : l'onglet qui s'ouvre
  at(clipAt('Service', MARKS.tile) + 4, 'air', 0.12);

  // la demande : le site descend jusqu'au formulaire, la frappe, l'envoi
  at(clipAt('Request', 80), 'air', 0.12);
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
  at(clipAt('Request', MARKS.sent) + 8, 'chime', 0.26);

  // téléphones : les touchers
  const phoneAt = (c: number, timing: ClipTiming) => seq('Mobile') + timing.delay + (c - timing.from) / timing.rate;
  for (const [clip, timing] of [['mPlanner', PHONE_TIMING.mPlanner], ['mMenu', PHONE_TIMING.mMenu]] as const) {
    clicks(clip).forEach((c) => {
      const f = phoneAt(c, timing);
      if (inScene('Mobile', f)) at(f, 'tap', 0.2);
    });
  }

  // la fin : la gamme qui se pose, la marque, le téléphone
  const e = START.End;
  for (let r = 0; r < 6; r++) at(e + END.lineup + r * 7 + 6, `land${(r % 8) + 1}`, 0.07);
  at(e + END.mark + 6, 'pop', 0.12);
  at(e + END.phone, 'air', 0.1);
  return out.sort((x, y) => x[0] - y[0]);
};
