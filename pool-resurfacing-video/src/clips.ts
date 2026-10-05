import type {Meta} from './Screen';
import dHero from '../public/site/d-hero.json';
import dSigns from '../public/site/d-signs.json';
import dFinishes from '../public/site/d-finishes.json';
import dServices from '../public/site/d-services.json';
import dProcess from '../public/site/d-process.json';
import dReviews from '../public/site/d-reviews.json';
import dFaq from '../public/site/d-faq.json';
import dContact from '../public/site/d-contact.json';
import dFooter from '../public/site/d-footer.json';
import mHero from '../public/site/m-hero.json';
import mFinishes from '../public/site/m-finishes.json';
import mProcess from '../public/site/m-process.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dHero, dSigns, dFinishes, dServices, dProcess, dReviews, dFaq, dContact, dFooter, mHero, mFinishes, mProcess} as unknown as Record<string, Meta>;
