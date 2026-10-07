import type {Meta} from './Screen';
import dHero from '../public/site/d-hero.json';
import dTour from '../public/site/d-tour.json';
import dWork from '../public/site/d-work.json';
import dEquip from '../public/site/d-equip.json';
import dReviews from '../public/site/d-reviews.json';
import dLicense from '../public/site/d-license.json';
import dAreas from '../public/site/d-areas.json';
import dEstimate from '../public/site/d-estimate.json';
import mHero from '../public/site/m-hero.json';
import mTour from '../public/site/m-tour.json';
import mMenu from '../public/site/m-menu.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dHero, dTour, dWork, dEquip, dReviews, dLicense, dAreas, dEstimate, mHero, mTour, mMenu} as unknown as Record<string, Meta>;
