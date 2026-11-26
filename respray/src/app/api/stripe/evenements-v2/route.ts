/* Les événements v2 (« thin ») des comptes vendeurs : compte mis à jour, documents demandés, capacité activée ou
   suspendue. L'événement ne contient que l'identifiant du compte : on relit son état chez Stripe. Signature vérifiée,
   refus si le secret manque. */
import {NextResponse} from 'next/server';
import {eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {stripe} from '@/lib/stripe';
import {actualiserVersements} from '@/lib/commandes';
import {notifier} from '@/lib/activite';

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET_V2;
  if (!secret) return NextResponse.json({erreur: 'secret absent'}, {status: 500});
  const corps = await req.text();
  let n;
  try {
    n = stripe.parseEventNotification(corps, req.headers.get('stripe-signature') || '', secret);
  } catch {
    return NextResponse.json({erreur: 'signature'}, {status: 400});
  }
  const compte = (n as unknown as {related_object?: {id?: string}}).related_object?.id;
  if (compte && n.type.startsWith('v2.core.account')) {
    const m = await db.query.membres.findFirst({where: eq(schema.membres.stripeCompte, compte)});
    if (m) {
      const avant = m.versementsOk;
      try {
        const ok = await actualiserVersements(m.id);
        if (ok && !avant) await notifier(m.id, 'vente', 'Vos versements sont prêts : vos ventes confirmées vous sont versées automatiquement.', '/compte/versements');
        if (!ok && avant) await notifier(m.id, 'vente', 'Stripe a besoin d\'informations pour continuer vos versements.', '/compte/versements');
      } catch (e) {
        console.error(`Événement ${n.type} :`, (e as Error).message);
        return NextResponse.json({erreur: 'traitement'}, {status: 500});
      }
    }
  }
  return NextResponse.json({recu: true});
}
