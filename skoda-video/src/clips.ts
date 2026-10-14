import type {Meta} from './Screen';
import dOpen from '../public/site/d-open.json';
import dName from '../public/site/d-name.json';
import dHomes from '../public/site/d-homes.json';
import dRooms from '../public/site/d-rooms.json';
import dStory from '../public/site/d-story.json';
import dFamily from '../public/site/d-family.json';
import dConsult from '../public/site/d-consult.json';
import mOpen from '../public/site/m-open.json';
import mName from '../public/site/m-name.json';
import mStory from '../public/site/m-story.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dOpen, dName, dHomes, dRooms, dStory, dFamily, dConsult, mOpen, mName, mStory} as unknown as Record<string, Meta>;
