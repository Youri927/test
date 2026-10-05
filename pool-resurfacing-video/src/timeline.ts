import {CON_LEN, FAQ_LEN, FIN_LEN as FINISHES_LEN, HERO_LEN, MOBILE_LEN, PROC_LEN, REV_LEN, SERV_LEN, SIGNS_LEN} from './scenes/After';
import {AVANT_LEN} from './scenes/Avant';
import {FIN_LEN} from './scenes/Fin';
import {OPEN_LEN} from './scenes/Opening';

/** Les scènes du montage et leur durée (images à 60 i/s) */
export const SCENES: [string, number][] = [
  ['Opening', OPEN_LEN],
  ['Before', AVANT_LEN],
  ['The new site', HERO_LEN],
  ['01 Signs', SIGNS_LEN],
  ['02 Finishes', FINISHES_LEN],
  ['03 Services', SERV_LEN],
  ['04 Process', PROC_LEN],
  ['05 Reviews', REV_LEN],
  ['06 Offer & FAQ', FAQ_LEN],
  ['07 Contact', CON_LEN],
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
