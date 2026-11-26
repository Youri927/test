/* Le webhook Stripe : un paiement validé ou abandonné (commande ou mise en avant), un remboursement.
   La signature est vérifiée avec STRIPE_WEBHOOK_SECRET ; le même travail est refait au retour sur le site, et il ne
   se fait qu'une fois. */
import {NextResponse} from 'next/server';
import {eq, and} from 'drizzle-orm';
import type Stripe from 'stripe';
import {db, schema} from '@/db';
import {stripe} from '@/lib/stripe';
import {synchroniser} from '@/lib/commandes';
import {payeeMiseEnAvant} from '@/lib/avant';

export async function POST(req: Request) {
  const corps = await req.text();
  let ev: Stripe.Event;
  try {
    ev = stripe.webhooks.constructEvent(corps, req.headers.get('stripe-signature') || '', process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch {
    return NextResponse.json({erreur: 'signature'}, {status: 400});
  }
  if (ev.type === 'checkout.session.completed' || ev.type === 'checkout.session.async_payment_succeeded' || ev.type === 'checkout.session.expired') {
    const s = ev.data.object as Stripe.Checkout.Session;
    if (s.metadata?.commande) await synchroniser(Number(s.metadata.commande));
    if (s.metadata?.paiement && s.payment_status === 'paid') await payeeMiseEnAvant(Number(s.metadata.paiement));
    if (s.metadata?.paiement && ev.type === 'checkout.session.expired') await db.update(schema.paiements).set({statut: 'annulee'}).where(and(eq(schema.paiements.id, Number(s.metadata.paiement)), eq(schema.paiements.statut, 'attente')));
  }
  return NextResponse.json({recu: true});
}
