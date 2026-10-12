import type {Meta} from './Screen';
import dOpen from '../public/site/d-open.json';
import dStraight from '../public/site/d-straight.json';
import dCare from '../public/site/d-care.json';
import dTeam from '../public/site/d-team.json';
import dReviews from '../public/site/d-reviews.json';
import dVisit from '../public/site/d-visit.json';
import mOpen from '../public/site/m-open.json';
import mTeam from '../public/site/m-team.json';
import mDock from '../public/site/m-dock.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dOpen, dStraight, dCare, dTeam, dReviews, dVisit, mOpen, mTeam, mDock} as unknown as Record<string, Meta>;
