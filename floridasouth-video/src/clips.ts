import type {Meta} from './Screen';
import dOpen from '../public/site/d-open.json';
import dWork from '../public/site/d-work.json';
import dHouses from '../public/site/d-houses.json';
import dJudson from '../public/site/d-judson.json';
import dReviews from '../public/site/d-reviews.json';
import dEstimate from '../public/site/d-estimate.json';
import mOpen from '../public/site/m-open.json';
import mMenu from '../public/site/m-menu.json';
import mViewer from '../public/site/m-viewer.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dOpen, dWork, dHouses, dJudson, dReviews, dEstimate, mOpen, mMenu, mViewer} as unknown as Record<string, Meta>;
