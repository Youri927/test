import {SCENE_BEATS, BEAT} from './beats.ts';

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

/** Le fond de chaque scène : la couleur de la section du site qu'elle montre */
export const BG: Record<string, string> = {
  Opening: '#081033',
  Build: '#081033',
  Drag: '#081033',
  Services: '#0b2fb3',
  Pools: '#eef2fb',
  Night: '#081033',
  Values: '#ffffff',
  Contact: '#0b2fb3',
  Mobile: '#eef2fb',
  End: '#081033',
};
