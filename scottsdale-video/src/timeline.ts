import {DISC_LEN, ELEMENTS_LEN, HERO_LEN, MOBILE_LEN, POOLS_LEN, PROCESS_LEN, PROOF_LEN, QUOTE_LEN, WORK_LEN} from './scenes/After';
import {AVANT_LEN} from './scenes/Avant';
import {FIN_LEN} from './scenes/Fin';
import {OPEN_LEN} from './scenes/Opening';

/** Les scènes du montage et leur durée (images à 60 i/s) */
export const SCENES: [string, number][] = [
  ['Opening', OPEN_LEN],
  ['Before', AVANT_LEN],
  ['The new site', HERO_LEN],
  ['01 Three trades', DISC_LEN],
  ['02 25 services', ELEMENTS_LEN],
  ['03 Pool designs', POOLS_LEN],
  ['04 Work', WORK_LEN],
  ['05 Process', PROCESS_LEN],
  ['06 Reviews', PROOF_LEN],
  ['07 Free quote', QUOTE_LEN],
  ['Mobile', MOBILE_LEN],
  ['End', FIN_LEN],
];
export const PRES_FRAMES = SCENES.reduce((n, [, len]) => n + len, 0);
/** début de chaque scène, en images */
export const START: Record<string, number> = {};
export const LEN: Record<string, number> = {};
{
  let from = 0;
  for (const [name, len] of SCENES) { START[name] = from; LEN[name] = len; from += len; }
}
