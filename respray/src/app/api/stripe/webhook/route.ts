/* Le webhook Stripe (événements v1, du compte Respray et des comptes vendeurs). Signature vérifiée ; refus si le
   secret manque. Chaque traitement est idempotent : le même événement reçu deux fois ne fait le travail qu'une fois.
   - paiement : checkout.session.completed / async_payment_succeeded / expired, payment_intent.succeeded / payment_failed
   - après coup : charge.refunded, charge.dispute.created
   - vendeurs : payout.failed (sur leur compte Connect) */
import {NextResponse} from 'next/server';
import {eq, and} from 'drizzle-orm';
import type Stripe from 'stripe';
import {db, schema} from '@/db';
import {stripe} from '@/lib/stripe';
import {synchroniser, contestation, rembourseeAilleurs, paiementEchoue, virementEchoue} from '@/lib/commandes';
import {payeeMiseEnAvant} from '@/lib/avant';

const id = (x: string | {id: string} | null | undefined) => (typeof x === 'string' ? x : x?.id ?? null);

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({erreur: 'secret absent'}, {status: 500});
  const corps = await req.text();
  let ev: Stripe.Event;
  try {
    ev = stripe.webhooks.constructEvent(corps, req.headers.get('stripe-signature') || '', secret);
  } catch {
    return NextResponse.json({erreur: 'signature'}, {status: 400});
  }
  if (await db.query.evenementsStripe.findFirst({where: eq(schema.evenementsStripe.id, ev.id)})) return NextResponse.json({recu: true, deja: true});
  try {
    switch (ev.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
      case 'checkout.session.expired': {
        const s = ev.data.object;
        if (s.metadata?.commande) await synchroniser(Number(s.metadata.commande));
        if (s.metadata?.paiement && s.payment_status === 'paid') await payeeMiseEnAvant(Number(s.metadata.paiement));
        if (s.metadata?.paiement && ev.type === 'checkout.session.expired') await db.update(schema.paiements).set({statut: 'annulee'}).where(and(eq(schema.paiements.id, Number(s.metadata.paiement)), eq(schema.paiements.statut, 'attente')));
        break;
      }
      case 'payment_intent.succeeded': {
        const pi = ev.data.object;
        if (pi.metadata?.commande) await synchroniser(Number(pi.metadata.commande));
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = ev.data.object;
        if (pi.metadata?.commande) await paiementEchoue(Number(pi.metadata.commande), pi.last_payment_error?.message ?? 'carte refusée.');
        break;
      }
      case 'charge.refunded': {
        const ch = ev.data.object;
        if (ch.refunded && id(ch.payment_intent)) await rembourseeAilleurs(id(ch.payment_intent)!, ch.refunds?.data?.[0]?.id ?? null);
        break;
      }
      case 'charge.dispute.created': {
        const d = ev.data.object;
        if (id(d.payment_intent)) await contestation(id(d.payment_intent)!, d.reason);
        break;
      }
      case 'payout.failed': {
        const p = ev.data.object;
        if (ev.account) await virementEchoue(ev.account, p.failure_message ?? p.failure_code ?? 'refusé par la banque');
        break;
      }
    }
  } catch (e) {
    // une erreur de notre côté : Stripe renverra l'événement plus tard
    console.error(`Webhook ${ev.type} :`, (e as Error).message);
    return NextResponse.json({erreur: 'traitement'}, {status: 500});
  }
  await db.insert(schema.evenementsStripe).values({id: ev.id, type: ev.type}).onConflictDoNothing();
  return NextResponse.json({recu: true});
}
