import {BEAT, DIVE_LEN, SCENE_BEATS} from './beats.ts';
import {mix} from './util';

export {DIVE_LEN, RISE, RISES} from './beats.ts';

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

/** Le fond s'assombrit à chaque section, comme sur le site : de la plage au grand bain */
export const DEPTH: Record<string, string> = {
  Hero: '#F2F7F9',
  Layers: '#E9F2F5',
  Work: '#DFECF1',
  Surfaces: '#D3E5EC',
  Cost: '#C6DCE5',
  About: '#062C48',
  Areas: '#052640',
  Estimate: '#042139',
  Mobile: '#031D31',
  End: '#031D31',
};
const DEEP_ORDER = SCENES.map(([n]) => n).filter((n) => DEPTH[n]);

/** Couleur du fond à l'image globale `f` (fondue pendant chaque plongée) */
export const depthAt = (f: number) => {
  for (let i = 0; i < DEEP_ORDER.length; i++) {
    const name = DEEP_ORDER[i];
    const next = DEEP_ORDER[i + 1];
    if (next && f >= START[next] - DIVE_LEN && f < START[next] + DIVE_LEN) {
      const t = (f - (START[next] - DIVE_LEN)) / (2 * DIVE_LEN);
      return mix(DEPTH[name], DEPTH[next], t * t * (3 - 2 * t));
    }
    if (f < START[name] + LEN[name]) return DEPTH[name];
  }
  return DEPTH.End;
};
