import {SCENE_BEATS, BEAT} from './beats.ts';
import {C} from './util';

/** Les scènes du montage et leur durée (images à 60 i/s), en temps de la musique (90 BPM) */
export const SCENES: [string, number][] = SCENE_BEATS.map(([name, beats]) => [name, beats * BEAT]);
export const PRES_FRAMES = SCENES.reduce((n, [, len]) => n + len, 0);
/** début de chaque scène, en images */
export const START: Record<string, number> = {};
export const LEN: Record<string, number> = {};
{
  let from = 0;
  for (const [name, len] of SCENES) { START[name] = from; LEN[name] = len; from += len; }
}

/** Le fond de chaque scène : un ton plus soutenu que la partie du site qu'elle montre ; l'équipe, devant la haie */
export const BG: Record<string, string> = {
  Open: C.stage,
  Straight: C.stage,
  Care: C.stage,
  Team: C.stageHedge,
  Reviews: C.stage,
  Visit: C.stage,
  Mobile: C.stage,
  End: C.white,
};
