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

/** Le fond de chaque scène : le gris du bloc, un ton plus soutenu ; la fin, sur le bleu du pied de page */
export const BG: Record<string, string> = {
  Open: C.stage,
  Name: C.stage,
  Homes: C.stage,
  Rooms: C.stage,
  Story: C.stage,
  Family: C.stage,
  Consult: C.stage,
  Mobile: C.stage,
  End: C.blue,
};
