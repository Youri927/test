import type {Meta} from './Screen';
import dHero from '../../public/site/d-hero.json';
import dTeaser from '../../public/site/d-teaser.json';
import dR66 from '../../public/site/d-r66.json';
import dCorleone from '../../public/site/d-corleone.json';
import dAlerte from '../../public/site/d-alerte.json';
import dVerdict from '../../public/site/d-verdict.json';
import dPricing from '../../public/site/d-pricing.json';
import dExit from '../../public/site/d-exit.json';
import mHero from '../../public/site/m-hero.json';
import mR66 from '../../public/site/m-r66.json';
import mAlerte from '../../public/site/m-alerte.json';
import mPricing from '../../public/site/m-pricing.json';
import mExit from '../../public/site/m-exit.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s */
export const M = {
  dHero, dTeaser, dR66, dCorleone, dAlerte, dVerdict, dPricing, dExit,
  mHero, mR66, mAlerte, mPricing, mExit,
} as unknown as Record<string, Meta>;
