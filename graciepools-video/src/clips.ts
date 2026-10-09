import type {Meta} from './Screen';
import dHero from '../public/site/d-hero.json';
import dOnepiece from '../public/site/d-onepiece.json';
import dPlanner from '../public/site/d-planner.json';
import dGallery from '../public/site/d-gallery.json';
import dService from '../public/site/d-service.json';
import dRequest from '../public/site/d-request.json';
import mHero from '../public/site/m-hero.json';
import mPlanner from '../public/site/m-planner.json';
import mMenu from '../public/site/m-menu.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dHero, dOnepiece, dPlanner, dGallery, dService, dRequest, mHero, mPlanner, mMenu} as unknown as Record<string, Meta>;
