import {BOOK_LEN, CARE_LEN, DOCTOR_LEN, HERO_LEN, MOBILE_LEN, STORY_LEN, TEAM_LEN, WALL_LEN} from './scenes/After';
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
  ['Before & after', WALL_LEN],
  ['Feature case', STORY_LEN],
  ['The artist', DOCTOR_LEN],
  ['Care', CARE_LEN],
  ['Team & reviews', TEAM_LEN],
  ['Booking', BOOK_LEN],
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
