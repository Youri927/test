import type {Meta} from './Screen';
import dHero from '../public/site/d-hero.json';
import dPools from '../public/site/d-pools.json';
import dWater from '../public/site/d-water.json';
import dPump from '../public/site/d-pump.json';
import dBackyard from '../public/site/d-backyard.json';
import dHow from '../public/site/d-how.json';
import dSalt from '../public/site/d-salt.json';
import dContact from '../public/site/d-contact.json';
import mHero from '../public/site/m-hero.json';
import mPump from '../public/site/m-pump.json';
import mMenu from '../public/site/m-menu.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dHero, dPools, dWater, dPump, dBackyard, dHow, dSalt, dContact, mHero, mPump, mMenu} as unknown as Record<string, Meta>;
