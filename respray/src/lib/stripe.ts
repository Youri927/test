import 'server-only';
/* Le client Stripe. En développement (STRIPE_VIA_PROXY=1), les appels passent par le proxy de la session, qui y
   ajoute la vraie clé de test ; en production, la clé vient de STRIPE_SECRET_KEY, sans proxy. */
import Stripe from 'stripe';
import {HttpsProxyAgent} from 'https-proxy-agent';

const g = globalThis as unknown as {stripe?: Stripe};
export const stripe =
  g.stripe ??
  new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_absente', {
    appInfo: {name: 'Respray'},
    ...(process.env.STRIPE_VIA_PROXY === '1' && process.env.HTTPS_PROXY ? {httpAgent: new HttpsProxyAgent(process.env.HTTPS_PROXY)} : {}),
  });
if (process.env.NODE_ENV !== 'production') g.stripe = stripe;

export const centimes = (euros: number) => Math.round(euros * 100);
