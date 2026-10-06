import {CONTACT_LEN, COST_LEN, HERO_LEN, LOCAL_LEN, MOBILE_LEN, PATHS_LEN, TRUST_LEN, WORK_LEN} from './scenes/After';
import {BEFORE_LEN} from './scenes/Before';
import {END_LEN} from './scenes/End';
import {OPEN_LEN} from './scenes/Opening';
import {SAME_LEN} from './scenes/Same';
import {TURN_LEN} from './scenes/Turn';

/** Les scènes du montage et leur durée (images à 60 i/s) */
export const SCENES: [string, number][] = [
  ['Opening', OPEN_LEN],
  ['Look-alikes', SAME_LEN],
  ['Today', BEFORE_LEN],
  ['Turn', TURN_LEN],
  ['First impression', HERO_LEN],
  ['Trust', TRUST_LEN],
  ['Services', PATHS_LEN],
  ['Prices', COST_LEN],
  ['Work', WORK_LEN],
  ['Local', LOCAL_LEN],
  ['Contact', CONTACT_LEN],
  ['Mobile', MOBILE_LEN],
  ['End', END_LEN],
];
export const PRES_FRAMES = SCENES.reduce((n, [, len]) => n + len, 0);
/** début de chaque scène, en images */
export const START: Record<string, number> = {};
export const LEN: Record<string, number> = {};
{
  let from = 0;
  for (const [name, len] of SCENES) { START[name] = from; LEN[name] = len; from += len; }
}
