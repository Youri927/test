import type {Meta} from './Screen';
import dOpen from '../public/site/d-open.json';
import dWeekly from '../public/site/d-weekly.json';
import dPrices from '../public/site/d-prices.json';
import dRemodels from '../public/site/d-remodels.json';
import dDallas from '../public/site/d-dallas.json';
import dEstimate from '../public/site/d-estimate.json';
import mOpen from '../public/site/m-open.json';
import mPrices from '../public/site/m-prices.json';
import mViewer from '../public/site/m-viewer.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dOpen, dWeekly, dPrices, dRemodels, dDallas, dEstimate, mOpen, mPrices, mViewer} as unknown as Record<string, Meta>;
