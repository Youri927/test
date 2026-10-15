import type {Meta} from './Screen';
import dOpen from '../public/site/d-open.json';
import dRoofs from '../public/site/d-roofs.json';
import dStorm from '../public/site/d-storm.json';
import dJob from '../public/site/d-job.json';
import dWarranty from '../public/site/d-warranty.json';
import dFamily from '../public/site/d-family.json';
import dEstimate from '../public/site/d-estimate.json';
import mOpen from '../public/site/m-open.json';
import mRoofs from '../public/site/m-roofs.json';
import mJob from '../public/site/m-job.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dOpen, dRoofs, dStorm, dJob, dWarranty, dFamily, dEstimate, mOpen, mRoofs, mJob} as unknown as Record<string, Meta>;
