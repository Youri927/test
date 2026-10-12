import {SCENE_BEATS, BEAT} from './beats.ts';
import {C} from './util';

/** Les scènes du montage et leur durée (images à 60 i/s), en temps de la musique (100 BPM) */
export const SCENES: [string, number][] = SCENE_BEATS.map(([name, beats]) => [name, beats * BEAT]);
export const PRES_FRAMES = SCENES.reduce((n, [, len]) => n + len, 0);
/** début de chaque scène, en images */
export const START: Record<string, number> = {};
export const LEN: Record<string, number> = {};
{
  let from = 0;
  for (const [name, len] of SCENES) { START[name] = from; LEN[name] = len; from += len; }
}

/**
 * Le fond de chaque scène : un ton plus soutenu que la partie du site qu'elle montre. Les scènes de jour et de nuit
 * alternent ; l'ouverture passe du jour à la nuit avec le site (voir scenes/Open.tsx).
 */
export const BG: Record<string, string> = {
  Open: C.stage,
  Build: C.stageNight,
  Work: C.stage,
  Dark: C.stageNight,
  Reviews: C.stage,
  Plan: C.stageNight,
  Mobile: C.stage,
  End: C.night,
};
