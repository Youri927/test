import type {Meta} from './Screen';
import dOpen from '../public/site/d-open.json';
import dBuild from '../public/site/d-build.json';
import dWork from '../public/site/d-work.json';
import dDark from '../public/site/d-dark.json';
import dReviews from '../public/site/d-reviews.json';
import dPlan from '../public/site/d-plan.json';
import mOpen from '../public/site/m-open.json';
import mWork from '../public/site/m-work.json';
import mHues from '../public/site/m-hues.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dOpen, dBuild, dWork, dDark, dReviews, dPlan, mOpen, mWork, mHues} as unknown as Record<string, Meta>;
