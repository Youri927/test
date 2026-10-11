import type {Meta} from './Screen';
import dOpen from '../public/site/d-open.json';
import dRuler from '../public/site/d-ruler.json';
import dServices from '../public/site/d-services.json';
import dPools from '../public/site/d-pools.json';
import dNight from '../public/site/d-night.json';
import dValues from '../public/site/d-values.json';
import dContact from '../public/site/d-contact.json';
import mOpen from '../public/site/m-open.json';
import mServices from '../public/site/m-services.json';
import mMenu from '../public/site/m-menu.json';
import dOpenTones from '../public/site/d-open.tones.json';
import dRulerTones from '../public/site/d-ruler.tones.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dOpen, dRuler, dServices, dPools, dNight, dValues, dContact, mOpen, mServices, mMenu} as unknown as Record<string, Meta>;

/** Couleur du fond de la page, image par image (tools/tones.mjs) : l'ouverture du site prend la couleur du chantier */
export const TONES = {dOpen: dOpenTones, dRuler: dRulerTones} as Record<string, string[]>;
