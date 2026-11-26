import 'server-only';
/* Le cycle d'une commande, et l'argent qui va avec.
   Respray encaisse (Stripe Checkout), garde l'argent pendant l'envoi et les 7 jours de vérification, puis transfère
   100 % du prix au vendeur (Stripe Connect, « separate charges and transfers »). Respray garde la protection, l'envoi
   et l'assurance. Chaque étape prévient la bonne personne et laisse une ligne au journal. */
import {and, asc, desc, eq, gt, inArray, isNotNull, lt, ne, sql} from 'drizzle-orm';
import {randomInt} from 'crypto';
import {db, schema} from '@/db';
import {stripe, centimes, cle} from '@/lib/stripe';
import {notifier} from '@/lib/activite';
import {noter} from '@/lib/journal';
import {creerEtiquette} from '@/lib/envoi';
import {pretPourVersements} from '@/lib/connect';
import {protection, ENVOI, ASSURANCE, SEUIL_ASSURANCE, eur} from '@/lib/regles';

export type Commande = typeof schema.commandes.$inferSelect;
const JOUR = 864e5;
export const DELAI_DEPOT = 5; // jours pour déposer le colis
export const DELAI_VERIF = 7; // jours pour vérifier, après la livraison

/* le prix pour cet acheteur : une offre acceptée (ou un prix proposé par le vendeur) encore valable, le plus bas */
export async function prixPour(a: {id: number; prix: number}, acheteurId: number) {
  const o = await db.select().from(schema.offres).where(and(eq(schema.offres.annonceId, a.id), eq(schema.offres.acheteurId, acheteurId), eq(schema.offres.statut, 'acceptee'), gt(schema.offres.expire, new Date()))).orderBy(asc(schema.offres.montant)).limit(1);
  return o[0] ? {prix: o[0].montant, offreId: o[0].id} : {prix: a.prix, offreId: null};
}

/* parrainage : la protection est offerte sur le premier achat de la personne invitée */
export async function protectionOfferte(m: {id: number; parrainId: number | null}) {
  if (!m.parrainId) return false;
  const deja = await db.$count(schema.commandes, and(eq(schema.commandes.acheteurId, m.id), inArray(schema.commandes.statut, ['payee', 'expediee', 'livree', 'litige', 'confirmee', 'versee'])));
  return deja === 0;
}

export function montants(prix: number, {offerte, assurance}: {offerte: boolean; assurance: boolean}) {
  const pr = offerte ? 0 : protection(prix);
  const as = assurance && prix >= SEUIL_ASSURANCE ? ASSURANCE : 0;
  return {prix, protection: pr, envoi: ENVOI, assurance: as, total: Math.round((prix + pr + ENVOI + as) * 100) / 100};
}

const ref = (c: {id: number}) => `commande:${c.id}`;

/* ——— le paiement ——— */

/* après le paiement (le webhook, ou le retour sur le site : le premier arrivé fait le travail) */
export async function synchroniser(commandeId: number) {
  const c = await db.query.commandes.findFirst({where: eq(schema.commandes.id, commandeId)});
  if (!c || c.statut !== 'attente_paiement' || !c.checkoutId) return c;
  const s = await stripe.checkout.sessions.retrieve(c.checkoutId, {expand: ['payment_intent']});
  if (s.payment_status === 'paid') return enregistrerPaiement(c, typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id ?? null);
  if (s.status === 'expired') return annuler(c, 'Paiement non terminé.');
  return c;
}

/* le paiement est fait : on le note (une seule fois), on crée l'étiquette, on prévient tout le monde */
export async function enregistrerPaiement(c: Commande, paymentIntentId: string | null) {
  // une seule fois, même si le webhook et le retour arrivent en même temps
  const [maj] = await db.update(schema.commandes).set({statut: 'payee', payeeLe: new Date()}).where(and(eq(schema.commandes.id, c.id), eq(schema.commandes.statut, 'attente_paiement'))).returning();
  if (!maj) return db.query.commandes.findFirst({where: eq(schema.commandes.id, c.id)});
  const pi = paymentIntentId ? await stripe.paymentIntents.retrieve(paymentIntentId) : null;
  const chargeId = pi ? (typeof pi.latest_charge === 'string' ? pi.latest_charge : pi.latest_charge?.id) ?? null : null;
  const etiquette = c.mode === 'relais' ? await creerEtiquette() : null;
  const codeRemise = c.mode === 'main' ? String(randomInt(100000, 999999)) : null;
  await db.update(schema.commandes).set({paiementId: pi?.id ?? null, chargeId, etiquette, codeRemise, deposerAvant: new Date(Date.now() + DELAI_DEPOT * JOUR)}).where(eq(schema.commandes.id, c.id));
  await db.update(schema.annonces).set({statut: 'vendue'}).where(eq(schema.annonces.id, c.annonceId));
  if (c.offreId) await db.update(schema.offres).set({statut: 'annulee'}).where(and(eq(schema.offres.annonceId, c.annonceId), ne(schema.offres.id, c.offreId)));
  const a = await db.query.annonces.findFirst({where: eq(schema.annonces.id, c.annonceId)});
  const v = await db.query.membres.findFirst({where: eq(schema.membres.id, c.vendeurId)});
  await notifier(c.vendeurId, 'vente', c.mode === 'relais' ? `Vendu : ${a?.parfumNom}, ${eur(c.prix)} pour vous. Imprimez l'étiquette et déposez le colis en point relais sous ${DELAI_DEPOT} jours.` : `Vendu : ${a?.parfumNom}, ${eur(c.prix)} pour vous, remise en main propre. Convenez du rendez-vous par message.`, `/commandes/${c.id}`);
  if (!v?.versementsOk) await notifier(c.vendeurId, 'vente', `Pour recevoir vos ${eur(c.prix)}, ajoutez votre IBAN (2 minutes, vérifié par Stripe).`, '/compte/versements');
  await notifier(c.acheteurId, 'achat', `Paiement reçu pour ${a?.parfumNom}. L'argent reste bloqué jusqu'à ce que vous ayez vérifié le parfum.`, `/commandes/${c.id}`);
  await noter(null, 'commande_payee', ref(c), `commande ${c.id} payée : ${a?.parfumNom}, ${eur(c.total)}`);
  return db.query.commandes.findFirst({where: eq(schema.commandes.id, c.id)});
}

/* une commande qui n'aboutit pas : remboursement s'il y a eu paiement, annonce remise en ligne */
export async function annuler(c: Commande, raison: string) {
  if (['annulee', 'remboursee', 'versee'].includes(c.statut)) return c;
  if (c.paiementId && c.statut !== 'attente_paiement') {
    const r = await stripe.refunds.create({payment_intent: c.paiementId, reason: 'requested_by_customer', metadata: {commande: String(c.id)}}, {idempotencyKey: cle('remboursement', c.id, c.creeLe)});
    await db.update(schema.commandes).set({remboursementId: r.id}).where(eq(schema.commandes.id, c.id));
  } else if (c.checkoutId && c.statut === 'attente_paiement') {
    const s = await stripe.checkout.sessions.retrieve(c.checkoutId);
    if (s.status === 'open') await stripe.checkout.sessions.expire(c.checkoutId);
  }
  await db.update(schema.commandes).set({statut: 'annulee', litige: c.litige ? {...c.litige, decision: raison} : null}).where(eq(schema.commandes.id, c.id));
  await db.update(schema.annonces).set({statut: 'publiee'}).where(and(eq(schema.annonces.id, c.annonceId), inArray(schema.annonces.statut, ['reservee', 'vendue'])));
  if (c.statut !== 'attente_paiement') {
    await notifier(c.acheteurId, 'achat', `Commande ${c.id} annulée : ${raison} Vous êtes remboursé en entier (sous 5 à 10 jours sur votre carte).`, `/commandes/${c.id}`);
    await notifier(c.vendeurId, 'vente', `Commande ${c.id} annulée : ${raison} L'annonce est de nouveau en ligne.`, `/commandes/${c.id}`);
    await noter(null, 'commande_annulee', ref(c), `commande ${c.id} annulée et remboursée : ${raison}`);
  }
  return db.query.commandes.findFirst({where: eq(schema.commandes.id, c.id)});
}

/* ——— l'envoi et la vérification ——— */

export async function deposee(c: Commande) {
  if (c.statut !== 'payee' || c.mode !== 'relais') return;
  await db.update(schema.commandes).set({statut: 'expediee', expedieeLe: new Date()}).where(eq(schema.commandes.id, c.id));
  await notifier(c.acheteurId, 'achat', `Votre colis est parti (suivi ${c.etiquette}). Vous serez prévenu à son arrivée au point relais.`, `/commandes/${c.id}`);
}

export async function livree(c: Commande) {
  if (!['payee', 'expediee'].includes(c.statut)) return;
  const fin = new Date(Date.now() + DELAI_VERIF * JOUR);
  // le suivi Mondial Relay peut signaler l'arrivée sans qu'on ait vu le dépôt : le colis a forcément été déposé
  await db.update(schema.commandes).set({statut: 'livree', expedieeLe: c.expedieeLe ?? new Date(), livreeLe: new Date(), finVerif: fin}).where(eq(schema.commandes.id, c.id));
  await notifier(c.acheteurId, 'achat', `Votre colis est arrivé${c.relais ? ` chez ${c.relais.nom}` : ''}. Vous avez ${DELAI_VERIF} jours pour vérifier le parfum : confirmez, ou signalez un problème.`, `/commandes/${c.id}`);
  await notifier(c.vendeurId, 'vente', `Le colis de la commande ${c.id} est arrivé. L'acheteur a ${DELAI_VERIF} jours pour vérifier ; ensuite, l'argent vous est versé.`, `/commandes/${c.id}`);
}

/* remise en main propre : le vendeur saisit le code que l'acheteur lui montre */
export async function remiseEnMain(c: Commande, code: string) {
  if (c.mode !== 'main' || c.statut !== 'payee' || !c.codeRemise || code.replace(/\D/g, '') !== c.codeRemise) return false;
  await db.update(schema.commandes).set({statut: 'livree', livreeLe: new Date(), finVerif: new Date()}).where(eq(schema.commandes.id, c.id));
  await confirmer({...c, statut: 'livree'}, 'Remise en main propre, code saisi.');
  return true;
}

export async function confirmer(c: Commande, comment: string) {
  if (!['livree', 'litige'].includes(c.statut)) return;
  await db.update(schema.commandes).set({statut: 'confirmee', confirmeeLe: new Date(), litige: c.litige ? {...c.litige, decision: comment} : null}).where(eq(schema.commandes.id, c.id));
  await noter(null, 'commande_confirmee', ref(c), `commande ${c.id} confirmée : ${comment}`);
  await verser((await db.query.commandes.findFirst({where: eq(schema.commandes.id, c.id)}))!);
}

export async function ouvrirLitige(c: Commande, raison: string, texte: string) {
  if (c.statut !== 'livree') return;
  await db.update(schema.commandes).set({statut: 'litige', litige: {raison, texte, le: new Date().toISOString()}}).where(eq(schema.commandes.id, c.id));
  await notifier(c.vendeurId, 'vente', `L'acheteur signale un problème sur la commande ${c.id} : ${raison}. L'argent reste bloqué ; l'équipe compare avec vos photos vérifiées et revient vers vous.`, `/commandes/${c.id}`);
  const equipe = await db.select({id: schema.membres.id}).from(schema.membres).where(eq(schema.membres.role, 'equipe'));
  for (const e of equipe) await notifier(e.id, 'litige', `Litige sur la commande ${c.id} : ${raison}`, '/equipe/commandes');
  await noter(null, 'litige_ouvert', ref(c), `litige ouvert sur la commande ${c.id} : ${raison}`);
}

/* l'équipe donne raison à l'acheteur : remboursement intégral, l'annonce est retirée */
export async function rembourserLitige(c: Commande, decision: string, equipeId: number) {
  if (c.statut !== 'litige' || !c.paiementId) return;
  const r = await stripe.refunds.create({payment_intent: c.paiementId, metadata: {commande: String(c.id)}}, {idempotencyKey: cle('remboursement', c.id, c.creeLe)});
  await db.update(schema.commandes).set({statut: 'remboursee', remboursementId: r.id, litige: {...c.litige!, decision}}).where(eq(schema.commandes.id, c.id));
  await db.update(schema.annonces).set({statut: 'retiree', raison: `Litige : ${decision}`}).where(eq(schema.annonces.id, c.annonceId));
  await notifier(c.acheteurId, 'achat', `Litige de la commande ${c.id} : vous êtes remboursé en entier. ${decision}`, `/commandes/${c.id}`);
  await notifier(c.vendeurId, 'vente', `Litige de la commande ${c.id} : l'acheteur est remboursé. ${decision}`, `/commandes/${c.id}`);
  await noter(equipeId, 'litige_rembourse', ref(c), `a remboursé la commande ${c.id} : ${decision}`);
}

/* ——— le versement au vendeur ——— */

export async function verser(c: Commande) {
  if (c.statut !== 'confirmee' || c.transfertId) return c;
  const v = await db.query.membres.findFirst({where: eq(schema.membres.id, c.vendeurId)});
  if (!v?.stripeCompte || !v.versementsOk) return c; // en attente de son IBAN : versé dès qu'il l'a ajouté
  const t = await stripe.transfers.create(
    {amount: centimes(c.prix), currency: 'eur', destination: v.stripeCompte, transfer_group: ref(c), ...(c.chargeId ? {source_transaction: c.chargeId} : {}), metadata: {commande: String(c.id)}},
    {idempotencyKey: cle('versement', c.id, c.creeLe)},
  );
  await db.update(schema.commandes).set({statut: 'versee', transfertId: t.id, verseeLe: new Date()}).where(eq(schema.commandes.id, c.id));
  await notifier(c.vendeurId, 'vente', `${eur(c.prix)} versés pour la commande ${c.id}. Ils arrivent sur votre compte bancaire sous quelques jours. Vos obligations fiscales : respray.fr/obligations-fiscales`, `/commandes/${c.id}`);
  await noter(null, 'commande_versee', ref(c), `commande ${c.id} : ${eur(c.prix)} versés au vendeur`);
  return db.query.commandes.findFirst({where: eq(schema.commandes.id, c.id)});
}

/* l'état des versements d'un vendeur, relu chez Stripe (au retour de l'inscription, puis à chaque visite) */
export async function actualiserVersements(membreId: number) {
  const m = await db.query.membres.findFirst({where: eq(schema.membres.id, membreId)});
  if (!m?.stripeCompte) return false;
  const {ok} = await pretPourVersements(m.stripeCompte);
  if (ok !== m.versementsOk) await db.update(schema.membres).set({versementsOk: ok}).where(eq(schema.membres.id, m.id));
  if (ok) for (const c of await db.select().from(schema.commandes).where(and(eq(schema.commandes.vendeurId, m.id), eq(schema.commandes.statut, 'confirmee')))) await verser(c);
  return ok;
}

/* ——— les tâches automatiques (cron toutes les 15 minutes, et à chaque visite de l'équipe) ——— */
export async function taches() {
  const maintenant = new Date();
  const fait: string[] = [];
  // paiements abandonnés depuis plus de 40 minutes
  for (const c of await db.select().from(schema.commandes).where(and(eq(schema.commandes.statut, 'attente_paiement'), lt(schema.commandes.creeLe, new Date(Date.now() - 40 * 6e4))))) {
    await synchroniser(c.id).catch(() => null);
    fait.push(`paiement ${c.id} relu`);
  }
  // colis pas déposé à temps : annulation et remboursement
  for (const c of await db.select().from(schema.commandes).where(and(eq(schema.commandes.statut, 'payee'), eq(schema.commandes.mode, 'relais'), lt(schema.commandes.deposerAvant, maintenant)))) {
    await annuler(c, `le colis n'a pas été déposé sous ${DELAI_DEPOT} jours.`);
    fait.push(`commande ${c.id} annulée (pas déposée)`);
  }
  // 7 jours sans problème signalé : confirmée, et versée
  for (const c of await db.select().from(schema.commandes).where(and(eq(schema.commandes.statut, 'livree'), lt(schema.commandes.finVerif, maintenant)))) {
    await confirmer(c, `${DELAI_VERIF} jours sans problème signalé.`);
    fait.push(`commande ${c.id} confirmée automatiquement`);
  }
  // versements en attente (le vendeur a peut-être ajouté son IBAN)
  const vendeurs = await db.selectDistinct({id: schema.commandes.vendeurId}).from(schema.commandes).where(eq(schema.commandes.statut, 'confirmee'));
  for (const v of vendeurs) await actualiserVersements(v.id).catch(() => null);
  return fait;
}

export async function deMembre(membreId: number) {
  const liste = await db
    .select({c: schema.commandes, a: {id: schema.annonces.id, parfumNom: schema.annonces.parfumNom, maisonNom: schema.annonces.maisonNom, ml: schema.annonces.ml}})
    .from(schema.commandes)
    .innerJoin(schema.annonces, eq(schema.commandes.annonceId, schema.annonces.id))
    .where(and(sql`(${schema.commandes.acheteurId} = ${membreId} or ${schema.commandes.vendeurId} = ${membreId})`, isNotNull(schema.commandes.payeeLe)))
    .orderBy(desc(schema.commandes.creeLe));
  return liste;
}

/* ——— ce que Stripe nous apprend (webhooks) ——— */

const parPaiement = (paiementId: string) => db.query.commandes.findFirst({where: eq(schema.commandes.paiementId, paiementId)});

/* contestation bancaire (chargeback) : l'argent est repris à Respray par la banque de l'acheteur. Si le vendeur n'est
   pas encore payé, on bloque le versement ; s'il l'est déjà, on récupère sa part (annulation du transfert). L'équipe
   répond à la contestation depuis le tableau de bord Stripe, avec les photos vérifiées. */
export async function contestation(paiementId: string, motif: string) {
  const c = await parPaiement(paiementId);
  if (!c || c.litige?.raison === 'Contestation bancaire') return;
  if (c.transfertId) {
    await stripe.transfers.createReversal(c.transfertId, {amount: centimes(c.prix), metadata: {commande: String(c.id), raison: 'contestation'}}, {idempotencyKey: cle('reprise', c.id, c.creeLe)}).catch((e) => console.error('Reprise du transfert :', (e as Error).message));
  }
  await db.update(schema.commandes).set({statut: 'litige', litige: {raison: 'Contestation bancaire', texte: `La banque de l'acheteur conteste le paiement (${motif}).`, le: new Date().toISOString()}}).where(eq(schema.commandes.id, c.id));
  const equipe = await db.select({id: schema.membres.id}).from(schema.membres).where(eq(schema.membres.role, 'equipe'));
  for (const e of equipe) await notifier(e.id, 'litige', `Contestation bancaire sur la commande ${c.id} (${motif}) : à traiter dans Stripe, avec les photos vérifiées.`, '/equipe/commandes');
  await notifier(c.vendeurId, 'vente', `La banque de l'acheteur conteste le paiement de la commande ${c.id}. ${c.transfertId ? 'Le versement est repris le temps de l\'examen' : 'Le versement est suspendu'} ; vos photos vérifiées serviront de preuve.`, `/commandes/${c.id}`);
  await noter(null, 'contestation', ref(c), `contestation bancaire sur la commande ${c.id} : ${motif}`);
}

/* un remboursement fait ailleurs (tableau de bord Stripe) : la commande suit */
export async function rembourseeAilleurs(paiementId: string, refundId: string | null) {
  const c = await parPaiement(paiementId);
  if (!c || ['remboursee', 'annulee'].includes(c.statut)) return;
  await db.update(schema.commandes).set({statut: 'remboursee', remboursementId: refundId ?? c.remboursementId}).where(eq(schema.commandes.id, c.id));
  await noter(null, 'commande_remboursee', ref(c), `commande ${c.id} remboursée (depuis Stripe)`);
}

/* un paiement par carte refusé : l'acheteur est prévenu, l'annonce revient en ligne à l'expiration de la session */
export async function paiementEchoue(commandeId: number, message: string) {
  const c = await db.query.commandes.findFirst({where: eq(schema.commandes.id, commandeId)});
  if (c && c.statut === 'attente_paiement') await notifier(c.acheteurId, 'achat', `Votre paiement n'est pas passé : ${message} Vous pouvez réessayer avec une autre carte.`, `/annonces/${c.annonceId}`);
}

/* un virement vers la banque du vendeur a échoué (IBAN fermé, erroné…) */
export async function virementEchoue(compte: string, message: string) {
  const m = await db.query.membres.findFirst({where: eq(schema.membres.stripeCompte, compte)});
  if (m) await notifier(m.id, 'vente', `Le virement vers votre banque a échoué (${message}). Vérifiez votre IBAN dans vos versements.`, '/compte/versements');
}
