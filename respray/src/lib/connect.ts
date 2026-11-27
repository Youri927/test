import 'server-only';
/* Les comptes de versement des vendeurs (Stripe Connect, Accounts v2), avec la configuration arrêtée avec Stripe :
   tableau de bord Express, frais et pertes à la charge de Respray, configuration « recipient » (le vendeur reçoit des
   transferts), inscription intégrée au site (Connect.js). L'identifiant du compte n'est connu que du serveur. */
import {eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {stripe, cle} from '@/lib/stripe';
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
      defaults: {currency: 'eur', locales: ['fr-FR'], responsibilities: {fees_collector: 'application', losses_collector: 'application'}, // Stripe demande un site et une activité pour chaque compte, particulier compris : on donne la page publique du
      // vendeur sur Respray (sa « boutique »), pas le site de Respray, et une activité de particulier
      profile: {product_description: 'Revente de mes parfums personnels d\'occasion, en particulier, sur Respray', business_url: `${site}/vendeur/${encodeURIComponent(m.pseudo)}`}},
      configuration: {recipient: {capabilities: {stripe_balance: {stripe_transfers: {requested: true}}}}},
      metadata: {membre: String(m.id)},
    },
    {idempotencyKey: cle('compte-vendeur', m.id, m.creeLe)},
  );
  await db.update(schema.membres).set({stripeCompte: a.id}).where(eq(schema.membres.id, m.id));
  return a.id;
}

/* un compte que Stripe ne connaît pas avec la clé actuelle : typiquement un compte créé en mode test, après le passage
   en live (les comptes de test n'existent pas en live) */
const compteInconnu = (e: unknown) => {
  const x = e as {code?: string; message?: string; statusCode?: number};
  return x.code === 'resource_missing' || x.statusCode === 404 || /no such account|test mode|live mode|testmode|livemode/i.test(x.message ?? '');
};

/* on oublie le compte : un nouveau sera créé (en live) au prochain passage */
export async function oublierCompte(membreId: number) {
  await db.update(schema.membres).set({stripeCompte: null, versementsOk: false}).where(eq(schema.membres.id, membreId));
}

export {compteInconnu};

/* prêt à recevoir de l'argent : seulement si la capacité « stripe_transfers » est active (pas sur un simple retour) */
export async function pretPourVersements(compte: string) {
  const a = await stripe.v2.core.accounts.retrieve(compte, {include: ['configuration.recipient', 'requirements']});
  const statut = a.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status;
  return {ok: statut === 'active', statut: statut ?? 'inconnu', aFournir: (a.requirements?.entries ?? []).length};
}

/* ——— l'inscription « maison » des vendeurs particuliers ———
   Le formulaire de Respray (FormVersements) envoie directement à Stripe, depuis le navigateur et avec la clé publique,
   l'identité du vendeur et son acceptation des conditions de Stripe (un « jeton de compte »), puis son IBAN (un « jeton
   bancaire »). Le serveur ne reçoit que ces jetons : il crée (ou met à jour) le compte et y attache l'IBAN.
   Ces comptes ont dashboard « none » : c'est Respray qui recueille les informations (requirements_collector
   « application »), sans aucun écran Stripe pour le vendeur. Les comptes créés avant avec le formulaire de Stripe
   (dashboard « express ») ne peuvent pas changer de mode : ils sont remplacés par un nouveau compte. */

export type AFournir = 'document' | 'identite' | 'adresse' | 'iban' | 'autre';

/* ce que Stripe attend encore du vendeur, traduit pour le formulaire */
export async function etatCompte(compte: string) {
  const a = await stripe.v2.core.accounts.retrieve(compte, {include: ['configuration.recipient', 'requirements']});
  const statut = a.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status ?? 'inconnu';
  const entrees = (a.requirements?.entries ?? []).filter((e) => ['currently_due', 'past_due'].includes(e.minimum_deadline?.status ?? '') && e.awaiting_action_from !== 'stripe');
  const manque = new Set<AFournir>();
  for (const e of entrees) {
    const d = (e.description ?? '').toLowerCase();
    manque.add(/document|verification/.test(d) ? 'document' : /address/.test(d) ? 'adresse' : /bank|external_account|payout/.test(d) ? 'iban' : /name|birth|email|phone|individual/.test(d) ? 'identite' : 'autre');
  }
  return {ok: statut === 'active', statut, aFournir: [...manque], details: entrees.map((e) => e.description ?? '')};
}

async function compteParticulier(compte: string | null) {
  if (!compte) return null;
  const a = await stripe.v2.core.accounts.retrieve(compte, {include: ['defaults']}).catch(() => null);
  return a?.defaults?.responsibilities?.requirements_collector === 'application' ? a.id : null;
}

export async function inscrireParticulier(m: Membre, jetonCompte: string, jetonBanque?: string) {
  const site = process.env.SITE_URL?.startsWith('https://') ? process.env.SITE_URL : 'https://respray.fr';
  let compte = await compteParticulier(m.stripeCompte);
  if (compte) {
    await stripe.v2.core.accounts.update(compte, {account_token: jetonCompte});
  } else {
    const a = await stripe.v2.core.accounts.create(
      {
        account_token: jetonCompte,
        dashboard: 'none',
        identity: {country: 'fr'},
        defaults: {
          currency: 'eur',
          locales: ['fr-FR'],
          responsibilities: {fees_collector: 'application', losses_collector: 'application'},
          profile: {product_description: 'Revente de mes parfums personnels d\'occasion, en particulier, sur Respray', business_url: `${site}/vendeur/${encodeURIComponent(m.pseudo)}`},
        },
        configuration: {recipient: {capabilities: {stripe_balance: {stripe_transfers: {requested: true}}}}},
        metadata: {membre: String(m.id)},
      },
      {idempotencyKey: `compte-particulier-${jetonCompte}`},
    );
    compte = a.id;
    await db.update(schema.membres).set({stripeCompte: compte, versementsOk: false}).where(eq(schema.membres.id, m.id));
  }
  if (jetonBanque) await changerIban(compte, jetonBanque);
  return compte;
}

/* le nouvel IBAN devient celui des versements ; les anciens sont retirés */
export async function changerIban(compte: string, jetonBanque: string) {
  const nouveau = await stripe.accounts.createExternalAccount(compte, {external_account: jetonBanque, default_for_currency: true});
  const anciens = await stripe.accounts.listExternalAccounts(compte, {object: 'bank_account', limit: 20});
  for (const b of anciens.data) if (b.id !== nouveau.id) await stripe.accounts.deleteExternalAccount(compte, b.id).catch(() => null);
}

/* l'IBAN enregistré, pour l'afficher (4 derniers chiffres seulement) */
export async function ibanDe(compte: string) {
  const l = await stripe.accounts.listExternalAccounts(compte, {object: 'bank_account', limit: 1}).catch(() => null);
  const b = l?.data[0] as {last4?: string; bank_name?: string | null} | undefined;
  return b ? {fin: b.last4 ?? '', banque: b.bank_name ?? ''} : null;
}

/* une pièce d'identité demandée par Stripe : le jeton porte les fichiers envoyés depuis le navigateur */
export async function ajouterPiece(compte: string, jetonCompte: string) {
  await stripe.v2.core.accounts.update(compte, {account_token: jetonCompte});
}

export {compteParticulier};
