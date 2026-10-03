import type {Meta} from './Screen';
import dHero from '../public/site/d-hero.json';
import dPitch from '../public/site/d-pitch.json';
import dGrid from '../public/site/d-grid.json';
import dBeast from '../public/site/d-beast.json';
import dFilm from '../public/site/d-film.json';
import dAudience from '../public/site/d-audience.json';
import mHero from '../public/site/m-hero.json';
import mGrid from '../public/site/m-grid.json';
import mBeast from '../public/site/m-beast.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dHero, dPitch, dGrid, dBeast, dFilm, dAudience, mHero, mGrid, mBeast} as unknown as Record<string, Meta>;
