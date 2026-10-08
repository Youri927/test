import type {Meta} from './Screen';
import dHero from '../public/site/d-hero.json';
import dLayers from '../public/site/d-layers.json';
import dWork from '../public/site/d-work.json';
import dSurfaces from '../public/site/d-surfaces.json';
import dCost from '../public/site/d-cost.json';
import dAbout from '../public/site/d-about.json';
import dAreas from '../public/site/d-areas.json';
import dEstimate from '../public/site/d-estimate.json';
import mHero from '../public/site/m-hero.json';
import mLayers from '../public/site/m-layers.json';
import mMenu from '../public/site/m-menu.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dHero, dLayers, dWork, dSurfaces, dCost, dAbout, dAreas, dEstimate, mHero, mLayers, mMenu} as unknown as Record<string, Meta>;
