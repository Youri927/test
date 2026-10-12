import {SCENE_BEATS, BEAT} from './beats.ts';

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

/** Le fond de chaque scène : un ton un peu plus soutenu que la partie du site qu'elle montre */
export const BG: Record<string, string> = {
  Open: '#E7E8E2',
  Pools: '#E7E8E2',
  Shapes: '#E3DACA',
  OneCall: '#E7E8E2',
  Reno: '#E3DACA',
  Visit: '#0A1A23',
  Mobile: '#E7E8E2',
  End: '#0A1A23',
};
