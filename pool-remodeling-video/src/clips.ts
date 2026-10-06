import type {Meta} from './Screen';
import dHero from '../public/site/d-hero.json';
import dIntro from '../public/site/d-intro.json';
import dPaths from '../public/site/d-paths.json';
import dCost from '../public/site/d-cost.json';
import dWork from '../public/site/d-work.json';
import dSeason from '../public/site/d-season.json';
import dAreas from '../public/site/d-areas.json';
import dContact from '../public/site/d-contact.json';
import mHero from '../public/site/m-hero.json';
import mCost from '../public/site/m-cost.json';
import mWork from '../public/site/m-work.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dHero, dIntro, dPaths, dCost, dWork, dSeason, dAreas, dContact, mHero, mCost, mWork} as unknown as Record<string, Meta>;
