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

/** Le fond de chaque scène : un ton plus soutenu que la partie du site qu'elle montre ; l'équipe, sur l'expresso */
export const BG: Record<string, string> = {
  Open: C.stage,
  Treatments: C.stage,
  Results: C.stage,
  Team: C.stageDark,
  Bank: '#EADBD3',
  Visit: C.stage,
  Mobile: C.stage,
  End: C.espresso,
};
