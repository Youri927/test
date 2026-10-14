import type {Meta} from './Screen';
import dOpen from '../public/site/d-open.json';
import dLayers from '../public/site/d-layers.json';
import dPhotos from '../public/site/d-photos.json';
import dProof from '../public/site/d-proof.json';
import dArea from '../public/site/d-area.json';
import dEstimate from '../public/site/d-estimate.json';
import mOpen from '../public/site/m-open.json';
import mLayers from '../public/site/m-layers.json';
import mPhotos from '../public/site/m-photos.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dOpen, dLayers, dPhotos, dProof, dArea, dEstimate, mOpen, mLayers, mPhotos} as unknown as Record<string, Meta>;
