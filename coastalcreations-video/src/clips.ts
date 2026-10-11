import type {Meta} from './Screen';
import dHero from '../public/site/d-hero.json';
import dCards from '../public/site/d-cards.json';
import dBuild from '../public/site/d-build.json';
import dReno from '../public/site/d-reno.json';
import dFinish from '../public/site/d-finish.json';
import dLeaks from '../public/site/d-leaks.json';
import dContact from '../public/site/d-contact.json';
import mHero from '../public/site/m-hero.json';
import mCards from '../public/site/m-cards.json';
import mMenu from '../public/site/m-menu.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dHero, dCards, dBuild, dReno, dFinish, dLeaks, dContact, mHero, mCards, mMenu} as unknown as Record<string, Meta>;
