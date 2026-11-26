import 'server-only';
/* Le client Stripe : version d'API fixée, nouvelles tentatives automatiques en cas de coupure réseau.
   En développement (STRIPE_VIA_PROXY=1), les appels passent par le proxy de la session, qui y ajoute la vraie clé de
   test ; en production, la clé vient de STRIPE_SECRET_KEY, sans proxy. */
import Stripe from 'stripe';
import {HttpsProxyAgent} from 'https-proxy-agent';

export const VERSION_API = '2026-11-18.endive';

const g = globalThis as unknown as {stripe?: Stripe};
export const stripe =
  g.stripe ??
  new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_absente', {
    apiVersion: VERSION_API,
    maxNetworkRetries: 3,
    appInfo: {name: 'Respray', url: 'https://respray.fr'},
    ...(process.env.STRIPE_VIA_PROXY === '1' && process.env.HTTPS_PROXY ? {httpAgent: new HttpsProxyAgent(process.env.HTTPS_PROXY)} : {}),
  });
if (process.env.NODE_ENV !== 'production') g.stripe = stripe;

export const centimes = (euros: number) => Math.round(euros * 100);
