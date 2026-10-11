import type {Meta} from './Screen';
import dOpen from '../public/site/d-open.json';
import dRefill from '../public/site/d-refill.json';
import dChanges from '../public/site/d-changes.json';
import dPad from '../public/site/d-pad.json';
import dProcess from '../public/site/d-process.json';
import dReviews from '../public/site/d-reviews.json';
import dClose from '../public/site/d-close.json';
import mOpen from '../public/site/m-open.json';
import mTowns from '../public/site/m-towns.json';
import mMenu from '../public/site/m-menu.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dOpen, dRefill, dChanges, dPad, dProcess, dReviews, dClose, mOpen, mTowns, mMenu} as unknown as Record<string, Meta>;
