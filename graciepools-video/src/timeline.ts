import {CALIPERS, SCENE_BEATS, TIMING, BEAT, type ClipTiming} from './beats.ts';

export {CAL, CALIPERS} from './beats.ts';

/** Les scènes du montage et leur durée (images à 60 i/s), en temps de la musique (100 BPM) */
export const SCENES: [string, number][] = SCENE_BEATS.map(([name, beats]) => [name, beats * BEAT]);
export const PRES_FRAMES = SCENES.reduce((n, [, len]) => n + len, 0);
/** début de chaque scène, en images (la règle qui l'ouvre se termine là) */
export const START: Record<string, number> = {};
export const LEN: Record<string, number> = {};
{
  let from = 0;
  for (const [name, len] of SCENES) { START[name] = from; LEN[name] = len; from += len; }
}
/** durée de la règle qui ouvre la scène (0 : la scène précédente continue) */
export const pre = (name: string) => CALIPERS[name] ?? 0;

/** Le fond de chaque scène : la couleur de la section du site qu'elle montre */
export const BG: Record<string, string> = {
  Opening: '#FFFFFF',
  Today: '#ECECEC',
  Sheet: '#FFFFFF',
  Hero: '#EEF2F4',
  OnePiece: '#FFFFFF',
  Models: '#0A1A24',
  Compare: '#0A1A24',
  Gallery: '#EEF2F4',
  Service: '#0A1A24',
  Request: '#EEF2F4',
  Mobile: '#EEF2F4',
  End: '#0A1A24',
};

/** Image du plan filmé affichée à l'image `f` de la séquence d'une scène (règle comprise) */
export const clipFrame = (t: ClipTiming, f: number) => t.from + Math.max(0, f - t.delay) * t.rate;
/** Image du montage (globale) où passe l'image `c` du plan filmé de la scène */
export const atClip = (scene: string, c: number, t: ClipTiming = TIMING[scene]) => START[scene] - pre(scene) + t.delay + (c - t.from) / t.rate;
