import type {Meta} from './Screen';
import dHero from '../public/site/d-hero.json';
import dImplants from '../public/site/d-implants.json';
import dCrowns from '../public/site/d-crowns.json';
import dTreatments from '../public/site/d-treatments.json';
import dSedation from '../public/site/d-sedation.json';
import dDoctor from '../public/site/d-doctor.json';
import dRequest from '../public/site/d-request.json';
import mHero from '../public/site/m-hero.json';
import mCrowns from '../public/site/m-crowns.json';
import mSheet from '../public/site/m-sheet.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dHero, dImplants, dCrowns, dTreatments, dSedation, dDoctor, dRequest, mHero, mCrowns, mSheet} as unknown as Record<string, Meta>;
