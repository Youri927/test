import type {Meta} from './Screen';
import dOpen from '../public/site/d-open.json';
import dSvc from '../public/site/d-svc.json';
import dRes from '../public/site/d-res.json';
import dTeam from '../public/site/d-team.json';
import dBank from '../public/site/d-bank.json';
import dVisit from '../public/site/d-visit.json';
import mOpen from '../public/site/m-open.json';
import mSvc from '../public/site/m-svc.json';
import mDock from '../public/site/m-dock.json';

/** Plans filmés du site (capture/shots.mjs), 60 images/s, en 2× */
export const M = {dOpen, dSvc, dRes, dTeam, dBank, dVisit, mOpen, mSvc, mDock} as unknown as Record<string, Meta>;
