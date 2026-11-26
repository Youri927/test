import 'server-only';
/* Les comptes de versement des vendeurs (Stripe Connect, Accounts v2), avec la configuration arrêtée avec Stripe :
   tableau de bord Express, frais et pertes à la charge de Respray, configuration « recipient » (le vendeur reçoit des
   transferts), inscription intégrée au site (Connect.js). L'identifiant du compte n'est connu que du serveur. */
import {eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {stripe} from '@/lib/stripe';
import type {Membre} from '@/lib/auth';

/* le compte du vendeur : créé une seule fois (même si on clique deux fois), puis réutilisé */
export async function compteDe(m: Membre) {
  if (m.stripeCompte) return m.stripeCompte;
  const site = process.env.SITE_URL?.startsWith('https://') ? process.env.SITE_URL : 'https://respray.fr';
  const a = await stripe.v2.core.accounts.create(
    {
      contact_email: m.email,
      display_name: `${m.prenom} ${m.nom}`.trim() || m.pseudo,
      dashboard: 'express',
      identity: {country: 'fr', entity_type: 'individual', individual: {given_name: m.prenom || undefined, surname: m.nom || undefined, email: m.email}},
      defaults: {currency: 'eur', locales: ['fr-FR'], responsibilities: {fees_collector: 'application', losses_collector: 'application'}, profile: {product_description: 'Vente de parfums de seconde main entre particuliers sur Respray', business_url: site}},
      configuration: {recipient: {capabilities: {stripe_balance: {stripe_transfers: {requested: true}}}}},
      metadata: {membre: String(m.id)},
    },
    {idempotencyKey: `compte-vendeur-${m.id}`},
  );
  await db.update(schema.membres).set({stripeCompte: a.id}).where(eq(schema.membres.id, m.id));
  return a.id;
}

/* la session de l'inscription intégrée : seul son « client secret » part au navigateur */
export async function sessionInscription(m: Membre) {
  const compte = await compteDe(m);
  const s = await stripe.accountSessions.create({
    account: compte,
    components: {
      account_onboarding: {enabled: true, features: {external_account_collection: true}},
      notification_banner: {enabled: true, features: {external_account_collection: true}},
    },
  });
  return s.client_secret;
}

/* prêt à recevoir de l'argent : seulement si la capacité « stripe_transfers » est active (pas sur un simple retour) */
export async function pretPourVersements(compte: string) {
  const a = await stripe.v2.core.accounts.retrieve(compte, {include: ['configuration.recipient', 'requirements']});
  const statut = a.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status;
  return {ok: statut === 'active', statut: statut ?? 'inconnu', aFournir: (a.requirements?.entries ?? []).length};
}
