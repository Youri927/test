import {SCENE_BEATS, TIMING, BEAT, type ClipTiming} from './beats.ts';

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

/** Le fond de chaque scène : la couleur de la section du site qu'elle montre (gris très clair pour les sections blanches : le navigateur s'en détache) */
export const BG: Record<string, string> = {
  Opening: '#071833',
  Today: '#ECEEF1',
  Hero: '#071833',
  Pools: '#F2F5F8',
  Water: '#F2F5F8',
  Pump: '#071833',
  Backyard: '#F2F5F8',
  How: '#F2F5F8',
  Salt: '#0C2448',
  Contact: '#071833',
  Mobile: '#F2F5F8',
  End: '#071833',
};

/** Image du montage (globale) où passe l'image `c` du plan filmé de la scène */
export const atClip = (scene: string, c: number, t: ClipTiming = TIMING[scene]) => START[scene] + t.delay + (c - t.from) / t.rate;
