import type {Meta} from './Screen';
import dHero from '../public/site/d-hero.json';
import dWall from '../public/site/d-wall.json';
import dStory from '../public/site/d-story.json';
import dDoctor from '../public/site/d-doctor.json';
import dCare from '../public/site/d-care.json';
import dTeam from '../public/site/d-team.json';
import dBook from '../public/site/d-book.json';
import mHero from '../public/site/m-hero.json';
import mStory from '../public/site/m-story.json';
import mMenu from '../public/site/m-menu.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dHero, dWall, dStory, dDoctor, dCare, dTeam, dBook, mHero, mStory, mMenu} as unknown as Record<string, Meta>;
