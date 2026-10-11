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

/** Le fond de chaque scène : la couleur de la partie du site qu'elle montre */
export const BG: Record<string, string> = {
  Open: '#E4EBEA',
  Weekly: '#E4EBEA',
  Prices: '#DCE5E4',
  Remodels: '#E4EBEA',
  Dallas: '#08324A',
  Estimate: '#9ED9E3',
  Mobile: '#E4EBEA',
  End: '#08324A',
};
