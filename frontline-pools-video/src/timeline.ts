import {AREAS_LEN, EQUIP_LEN, ESTIMATE_LEN, HERO_LEN, LICENSE_LEN, MOBILE_LEN, REVIEWS_LEN, TOUR_LEN, WORK_LEN} from './scenes/After';
import {BEFORE_LEN} from './scenes/Before';
import {END_LEN} from './scenes/End';
import {OPEN_LEN} from './scenes/Opening';
import {TURN_LEN} from './scenes/Turn';

/** Les scènes du montage et leur durée (images à 60 i/s) */
export const SCENES: [string, number][] = [
  ['Opening', OPEN_LEN],
  ['Today', BEFORE_LEN],
  ['Turn', TURN_LEN],
  ['First impression', HERO_LEN],
  ['What we rebuild', TOUR_LEN],
  ['Recent work', WORK_LEN],
  ['Equipment', EQUIP_LEN],
  ['Reviews', REVIEWS_LEN],
  ['License & financing', LICENSE_LEN],
  ['Service area', AREAS_LEN],
  ['Free estimate', ESTIMATE_LEN],
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
