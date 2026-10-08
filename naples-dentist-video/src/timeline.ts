import {BEAT, PILLS, SCENE_BEATS, TIMING, type ClipTiming} from './beats.ts';

export {PILL, PILLS} from './beats.ts';

/** Les scènes du montage et leur durée (images à 60 i/s), en temps de la musique (90 BPM) */
export const SCENES: [string, number][] = SCENE_BEATS.map(([name, beats]) => [name, beats * BEAT]);
export const PRES_FRAMES = SCENES.reduce((n, [, len]) => n + len, 0);
/** début de chaque scène, en images (la pastille qui l'ouvre se termine là) */
export const START: Record<string, number> = {};
export const LEN: Record<string, number> = {};
{
  let from = 0;
  for (const [name, len] of SCENES) { START[name] = from; LEN[name] = len; from += len; }
}
/** durée de la pastille qui ouvre la scène (0 : coupe franche) */
export const pre = (name: string) => PILLS[name] ?? 0;

/** Le fond de chaque scène : la couleur de la section du site qu'elle montre */
export const BG: Record<string, string> = {
  Opening: '#FFFFFF',
  Today: '#ECEEEE',
  Turn: '#23ACAC',
  Hero: '#EDF3F2',
  Implants: '#E3ECEA',
  Crowns: '#23ACAC',
  Treatments: '#EDF3F2',
  Sedation: '#EDF3F2',
  Doctor: '#0B2326',
  Request: '#23ACAC',
  Mobile: '#EDF3F2',
  End: '#0B2326',
};

/** Image du plan filmé affichée à l'image `f` de la séquence d'une scène (pastille comprise) */
export const clipFrame = (t: ClipTiming, f: number) => t.from + Math.max(0, f - t.delay) * t.rate;
/** Image du montage (globale) où passe l'image `c` du plan filmé de la scène */
export const atClip = (scene: string, c: number, t: ClipTiming = TIMING[scene]) => START[scene] - pre(scene) + t.delay + (c - t.from) / t.rate;
