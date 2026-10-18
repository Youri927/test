import type {Meta} from './Screen';
import dOpen from '../public/site/d-open.json';
import dYear from '../public/site/d-year.json';
import dWork from '../public/site/d-work.json';
import dDetails from '../public/site/d-details.json';
import dServices from '../public/site/d-services.json';
import dContact from '../public/site/d-contact.json';
import mOpen from '../public/site/m-open.json';
import mMenu from '../public/site/m-menu.json';
import mSwatch from '../public/site/m-swatch.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dOpen, dYear, dWork, dDetails, dServices, dContact, mOpen, mMenu, mSwatch} as unknown as Record<string, Meta>;
