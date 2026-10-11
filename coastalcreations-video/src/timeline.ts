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
  Opening: '#052a30',
  Hero: '#052a30',
  Cards: '#f4eee4',
  Build: '#052a30',
  Reno: '#f4eee4',
  Finish: '#0a3c44',
  Leaks: '#35c4cc',
  Contact: '#ff6a4c',
  Mobile: '#f4eee4',
  End: '#052a30',
};
