import type {Meta} from './Screen';
import dOpen from '../public/site/d-open.json';
import dPools from '../public/site/d-pools.json';
import dShapes from '../public/site/d-shapes.json';
import dOnecall from '../public/site/d-onecall.json';
import dReno from '../public/site/d-reno.json';
import dVisit from '../public/site/d-visit.json';
import mOpen from '../public/site/m-open.json';
import mShapes from '../public/site/m-shapes.json';
import mReno from '../public/site/m-reno.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dOpen, dPools, dShapes, dOnecall, dReno, dVisit, mOpen, mShapes, mReno} as unknown as Record<string, Meta>;
