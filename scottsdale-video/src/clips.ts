import type {Meta} from './Screen';
import dHero from '../public/site/d-hero.json';
import dDisc from '../public/site/d-disc.json';
import dElements from '../public/site/d-elements.json';
import dPools from '../public/site/d-pools.json';
import dWork from '../public/site/d-work.json';
import dProcess from '../public/site/d-process.json';
import dProof from '../public/site/d-proof.json';
import dQuote from '../public/site/d-quote.json';
import dFooter from '../public/site/d-footer.json';
import mHero from '../public/site/m-hero.json';
import mPools from '../public/site/m-pools.json';
import mWork from '../public/site/m-work.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dHero, dDisc, dElements, dPools, dWork, dProcess, dProof, dQuote, dFooter, mHero, mPools, mWork} as unknown as Record<string, Meta>;
