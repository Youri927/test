import type {Meta} from './Screen';
import dHero from '../public/site/d-hero.json';
import dCoupe from '../public/site/d-coupe.json';
import dBassins from '../public/site/d-bassins.json';
import dRefs from '../public/site/d-refs.json';
import dMetier from '../public/site/d-metier.json';
import dContact from '../public/site/d-contact.json';
import mHero from '../public/site/m-hero.json';
import mCoupe from '../public/site/m-coupe.json';
import mContact from '../public/site/m-contact.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dHero, dCoupe, dBassins, dRefs, dMetier, dContact, mHero, mCoupe, mContact} as unknown as Record<string, Meta>;
