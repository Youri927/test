/* Outil de test (mode test Stripe uniquement) : paie une commande en attente avec la carte de test Visa de Stripe,
   sans passer par la page Checkout (qu'un navigateur automatisé ne peut pas remplir). Ce qui suit le paiement
   (étiquette, notifications, versement, remboursement) est exactement le même que pour un vrai paiement.
   npx tsx --conditions=react-server scripts/test-paiement.ts <numéro de commande> [contestation]
   (« contestation » : la carte de test qui déclenche une contestation bancaire) */
import 'dotenv/config';
import {eq} from 'drizzle-orm';
import {db, schema} from '../src/db';
import {stripe, centimes} from '../src/lib/stripe';
import {enregistrerPaiement} from '../src/lib/commandes';

(async () => {
  const c = await db.query.commandes.findFirst({where: eq(schema.commandes.id, Number(process.argv[2]))});
  if (!c || c.statut !== 'attente_paiement') throw new Error('Commande introuvable ou déjà payée');
  const pi = await stripe.paymentIntents.create({amount: centimes(c.total), currency: 'eur', payment_method: process.argv[3] === 'contestation' ? 'pm_card_createDispute' : 'pm_card_visa', automatic_payment_methods: {enabled: true, allow_redirects: 'never'}, confirm: true, transfer_group: `commande:${c.id}`, metadata: {commande: String(c.id), test: '1'}});
  if (pi.livemode) throw new Error('Clé live : refusé');
  if (c.checkoutId) await stripe.checkout.sessions.expire(c.checkoutId).catch(() => null);
  await db.update(schema.commandes).set({checkoutId: null}).where(eq(schema.commandes.id, c.id));
  const r = await enregistrerPaiement(c, pi.id);
  console.log(`commande ${c.id} : ${r?.statut}, ${pi.status}, ${pi.id}`);
  process.exit(0);
})();
