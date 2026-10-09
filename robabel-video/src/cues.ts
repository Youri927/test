/**
 * Les repères des bruitages, partagés par src/PresSound.tsx (aperçu dans Remotion) et sound/mix.mjs (bande-son finale).
 * Chaque repère : [image, bruitage, volume]. Ce fichier n'importe que beats.ts : Node le lit directement.
 */
import {END, LIGHT, OPEN, PHONE_TIMING, TIMING, TYPING, type ClipTiming} from './beats.ts';

export type Cue = [number, string, number];
/** ce qu'un plan filmé apporte au son : ses clics, ses repères, ses valeurs relevées image par image */
type ClipInfo = {clicks: number[]; marks?: Record<string, number>; values?: Record<string, (number | null)[]>};

export const cues = (START: Record<string, number>, LEN: Record<string, number>, info: (clip: string) => ClipInfo): Cue[] => {
  const out: Cue[] = [];
  const at = (f: number, name: string, vol: number) => {
    if (!out.some(([g, n]) => Math.abs(g - Math.round(f)) < 3 && n === name)) out.push([Math.round(f), name, vol]);
  };
  const inScene = (scene: string, f: number) => f >= START[scene] && f < START[scene] + LEN[scene] - 4;
  // image du montage où passe l'image `c` du plan filmé d'une scène
  const clipAt = (scene: string, c: number, t: ClipTiming = TIMING[scene]) => START[scene] + t.delay + (c - t.from) / t.rate;
  // les images où une valeur relevée augmente (un appareil, une étape qui s'allume)
  const rises = (clip: string, key: string) => {
    const v = info(clip).values?.[key] ?? [];
    const res: number[] = [];
    let prev = 0;
    v.forEach((x, c) => {
      if (x == null) return;
      if (x > prev) res.push(c);
      prev = x;
    });
    return res;
  };

  // Peu de sons, courts et nets, mixés très bas sous la musique : aucun souffle, aucun glissé.

  // chaque scène s'allume sur un interrupteur (l'ouverture a ses propres lumières)
  for (const scene of Object.keys(START)) if (scene !== 'Opening') at(START[scene] + LIGHT.click, 'switch', 0.045);

  // ouverture : l'interrupteur de la maison, une note par palmier, l'interrupteur de la piscine
  const o = START.Opening;
  at(o + OPEN.house - 2, 'switch', 0.045);
  for (let k = 0; k < 6; k++) at(o + OPEN.palms + k * OPEN.palmStep + 2, `vibe${k + 1}`, 0.022 + 0.002 * k);
  at(o + OPEN.pool - 2, 'switch', 0.05);

  // les clics filmés, replacés sur la ligne de temps du montage
  for (const [scene, clip, vol] of [['Hero', 'dHero', 0.03], ['Pump', 'dPump', 0.028], ['How', 'dHow', 0.03], ['Salt', 'dSalt', 0.028], ['Contact', 'dContact', 0.03]] as const) {
    info(clip).clicks.forEach((c) => {
      const f = clipAt(scene, c);
      if (inScene(scene, f)) at(f, 'tap', vol);
    });
  }

  // le local technique : une note, de plus en plus haute, pour chaque appareil que l'eau atteint
  rises('dPump', 'on').forEach((c, k) => {
    const f = clipAt('Pump', c);
    if (inScene('Pump', f)) at(f, `vibe${Math.min(8, k + 2)}`, 0.026);
  });
  // les étapes : une note plus discrète quand l'eau atteint un numéro
  rises('dHow', 'lit').forEach((c, k) => {
    const f = clipAt('How', c);
    if (inScene('How', f)) at(f, `vibe${(k % 5) + 1}`, 0.017);
  });

  // le rendez-vous : la frappe, puis le carillon de la demande envoyée
  let key = 0;
  for (const [a, b, chars] of TYPING) {
    let last = -99;
    for (let k = 1; k <= chars; k++) {
      const f = clipAt('Contact', (a + ((b - a) * k) / chars) * 60);
      if (f - last < 4 || !inScene('Contact', f)) continue;
      last = f;
      at(f, `key${(key++ % 3) + 1}`, 0.018);
    }
  }
  const sent = info('dContact').marks?.sent;
  if (sent !== undefined) at(clipAt('Contact', sent) + 6, 'chime', 0.05);

  // téléphones : le toucher qui ouvre le menu
  const t = PHONE_TIMING.mMenu;
  info('mMenu').clicks.forEach((c) => {
    const f = START.Mobile + t.delay + (c - t.from) / t.rate;
    if (inScene('Mobile', f)) at(f, 'tap', 0.028);
  });

  // la fin : la piscine puis la maison s'éteignent
  at(START.End + END.pool, 'switch', 0.04);
  at(START.End + END.house, 'switch', 0.04);
  return out.sort((x, y) => x[0] - y[0]);
};
