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

  // Peu de sons, courts et nets, mixés bas sous la musique : aucun souffle, aucun glissé.

  // ouverture : la cote compte (petits déclics), l'eau arrive sur le temps 4 (une goutte), la marque (une note)
  for (let k = 0; k < 12; k++) at(OPEN.length + 2 + k * 4, 'tick', 0.012 + 0.0012 * k);
  at(OPEN.fill - 2, 'drop', 0.07);
  at(OPEN.mark + 6, 'land5', 0.035);

  // les règles qui ouvrent les scènes : un déclic feutré quand les mâchoires s'écartent
  for (const scene of Object.keys(CALIPERS)) at(seq(scene) + 10, 'click', 0.05);

  // aujourd'hui : un clic à chaque page qu'on ouvre (les preuves mesurées ont leur note dans la musique)
  for (const n of TODAY.pages) at(START.Today + n - 7, 'tap', 0.03);

  // la fiche : les 23 dessins se posent un à un (une note de marimba chacun)
  const s = START.Sheet;
  for (let k = 0; k < 23; k++) at(s + SHEET.lift + 10 + k * SHEET.landStep + 50, `land${(k % 8) + 1}`, 0.03 + 0.0006 * k);

  // les clics filmés, replacés sur la ligne de temps du montage
  const filmed = (scene: string, clip: string, t: ClipTiming = TIMING[scene]) => clicks(clip).map((c) => clipAt(scene, c, t)).filter((f) => inScene(scene, f));
  // (plus bas dans les piscines existantes : la musique y passe dans le filtre et laisse peu de place)
  for (const [scene, clip, vol] of [['Hero', 'dHero', 0.035], ['Gallery', 'dGallery', 0.035], ['Service', 'dService', 0.016], ['Request', 'dRequest', 0.035]] as const) {
    filmed(scene, clip).forEach((f) => at(f, 'tap', vol));
  }

  // le comparateur : chaque clic ; l'épingle, la goutte de chaque coloris
  clicks('dPlanner').forEach((c, k) => {
    const scene = clipAt('Models', c) < START.Compare ? 'Models' : 'Compare';
    const f = clipAt(scene, c);
    if (!inScene(scene, f)) return;
    at(f, 'tap', 0.033);
    const what = PLANNER[k];
    if (what === 'pin') at(f + 2, 'pin', 0.038);
    if (what === 'finish') at(f + 2, 'swatch', 0.04);
  });

  // la demande : la frappe, l'envoi
  let key = 0;
  const t = TIMING.Request;
  for (const [a, b, chars] of TYPING) {
    let last = -99;
    for (let k = 1; k <= chars; k++) {
      const f = clipAt('Request', (a + ((b - a) * k) / chars) * 60, t);
      if (f - last < 4 || !inScene('Request', f)) continue;
      last = f;
      at(f, `key${(key++ % 3) + 1}`, 0.022);
    }
  }
  at(clipAt('Request', MARKS.sent) + 8, 'chime', 0.06);

  // téléphones : les touchers
  const phoneAt = (c: number, timing: ClipTiming) => seq('Mobile') + timing.delay + (c - timing.from) / timing.rate;
  for (const [clip, timing] of [['mPlanner', PHONE_TIMING.mPlanner], ['mMenu', PHONE_TIMING.mMenu]] as const) {
    clicks(clip).forEach((c) => {
      const f = phoneAt(c, timing);
      if (inScene('Mobile', f)) at(f, 'tap', 0.032);
    });
  }

  // la fin : la gamme qui se pose, la marque
  const e = START.End;
  for (let r = 0; r < 6; r++) at(e + END.lineup + r * 7 + 6, `land${(r % 8) + 1}`, 0.028);
  at(e + END.mark + 6, 'land5', 0.03);
  return out.sort((x, y) => x[0] - y[0]);
};
