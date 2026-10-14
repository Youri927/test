import {SCENE_BEATS, BEAT} from './beats.ts';
import {C} from './util';

/** Les scènes du montage et leur durée (images à 60 i/s), en temps de la musique (112,5 BPM) */
export const SCENES: [string, number][] = SCENE_BEATS.map(([name, beats]) => [name, beats * BEAT]);
export const PRES_FRAMES = SCENES.reduce((n, [, len]) => n + len, 0);
/** début de chaque scène, en images */
export const START: Record<string, number> = {};
export const LEN: Record<string, number> = {};
{
  let from = 0;
  for (const [name, len] of SCENES) { START[name] = from; LEN[name] = len; from += len; }
}

/** Le fond de chaque scène : un ton plus soutenu que le ciel du site ; la fin, sur l'encre du pied de page */
export const BG: Record<string, string> = {
  Open: C.stage,
  Layers: C.stage,
  Photos: C.stage,
  Proof: C.stage,
  Area: C.stage,
  Estimate: C.stage,
  Mobile: C.stage,
  End: C.ink,
};
