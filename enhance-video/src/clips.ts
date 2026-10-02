import type {Meta} from './Screen';
import dHero from '../public/site/d-hero.json';
import dLayers from '../public/site/d-layers.json';
import dSignature from '../public/site/d-signature.json';
import dSurgeon from '../public/site/d-surgeon.json';
import dResults from '../public/site/d-results.json';
import dVisit from '../public/site/d-visit.json';
import mHero from '../public/site/m-hero.json';
import mLayers from '../public/site/m-layers.json';
import mVisit from '../public/site/m-visit.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dHero, dLayers, dSignature, dSurgeon, dResults, dVisit, mHero, mLayers, mVisit} as unknown as Record<string, Meta>;
