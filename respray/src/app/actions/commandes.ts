'use server';
/* Acheter, expédier, vérifier, être payé. Les règles d'argent sont dans lib/commandes ; ici, qui a le droit de faire
   quoi, et les redirections. */
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {and, eq, isNull} from 'drizzle-orm';
import {db, schema} from '@/db';
import {exigerMembre, exigerEquipe, moi} from '@/lib/auth';
import {stripe, centimes, cle} from '@/lib/stripe';
import {relaisPres, simule, creerExpedition, expediteurValide, type Expediteur} from '@/lib/envoi';
import {prixPour, protectionOfferte, montants, synchroniser, annuler, remiseEnMain, confirmer, ouvrirLitige, rembourserLitige, actualiserVersements, taches, deposee as marquerDeposee, livree as marquerLivree, type Commande} from '@/lib/commandes';
import {MISES_EN_AVANT, SEUIL_ASSURANCE} from '@/lib/regles';

const site = () => process.env.SITE_URL || 'http://localhost:3100';
const num = (f: FormData, k: string) => Number(f.get(k)) || 0;

/* ——— acheter ——— */
export async function payer(f: FormData) {
  const id = num(f, 'annonceId');
  const m = await exigerMembre(`/acheter/${id}`);
  const a = await db.query.annonces.findFirst({where: eq(schema.annonces.id, id)});
  if (!a || a.vendeurId === m.id) redirect(`/annonces/${id}`);
  const mode = f.get('mode') === 'main' && a.mainPropre ? 'main' : 'relais';
  const cp = String(f.get('cp') || '');
  const relais = mode === 'relais' ? (await relaisPres(cp).catch(() => [])).find((r) => r.id === f.get('relais')) : undefined;
  if (mode === 'relais' && !relais) redirect(`/acheter/${id}?cp=${encodeURIComponent(cp)}&erreur=relais`);
  // réserver l'annonce, d'un coup : si quelqu'un d'autre paie déjà, on s'arrête là
  const [reservee] = await db.update(schema.annonces).set({statut: 'reservee'}).where(and(eq(schema.annonces.id, id), eq(schema.annonces.statut, 'publiee'))).returning();
  if (!reservee) redirect(`/annonces/${id}?erreur=reservee`);
  const {prix, offreId} = await prixPour(a, m.id);
  const mt = montants(prix, {offerte: await protectionOfferte(m), assurance: f.get('assurance') === 'on' && prix >= SEUIL_ASSURANCE});
  const [c] = await db.insert(schema.commandes).values({annonceId: a.id, acheteurId: m.id, vendeurId: a.vendeurId, offreId, ...mt, mode, relais: relais ?? null}).returning();
  const lignes = [
    {nom: `${a.parfumNom}, ${a.maisonNom} (${a.ml} ml)`, montant: mt.prix},
    {nom: mt.protection ? 'Protection acheteur' : '', montant: mt.protection},
    {nom: 'Livraison en point relais', montant: mt.envoi},
    {nom: mt.assurance ? 'Envoi assuré à la valeur du parfum' : '', montant: mt.assurance},
  ].filter((l) => l.nom && l.montant > 0);
  let url: string | null = null;
  try {
    const s = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        locale: 'fr',
        adaptive_pricing: {enabled: false}, // toujours en euros
        customer_email: m.email,
        line_items: lignes.map((l) => ({quantity: 1, price_data: {currency: 'eur', unit_amount: centimes(l.montant), product_data: {name: l.nom}}})),
        payment_intent_data: {transfer_group: `commande:${c.id}`, metadata: {commande: String(c.id)}, description: `Respray, commande ${c.id}`},
        metadata: {commande: String(c.id)},
        expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
        success_url: `${site()}/commandes/${c.id}?paye=1`,
        cancel_url: `${site()}/commandes/${c.id}/abandon`,
      },
      {idempotencyKey: cle('checkout', c.id, c.creeLe)},
    );
    await db.update(schema.commandes).set({checkoutId: s.id}).where(eq(schema.commandes.id, c.id));
    url = s.url;
  } catch (e) {
    console.error(`Stripe Checkout, commande ${c.id} :`, (e as Error).message);
    await db.update(schema.commandes).set({statut: 'annulee'}).where(eq(schema.commandes.id, c.id));
    await db.update(schema.annonces).set({statut: 'publiee'}).where(eq(schema.annonces.id, a.id));
    redirect(`/acheter/${id}?erreur=stripe`);
  }
  redirect(url!);
}

/* retour depuis la page de paiement sans payer : on libère l'annonce tout de suite */
export async function abandonner(commandeId: number) {
  const m = await moi();
  const c = await db.query.commandes.findFirst({where: eq(schema.commandes.id, commandeId)});
  if (!m || !c || c.acheteurId !== m.id || c.statut !== 'attente_paiement') return;
  const apres = await synchroniser(c.id);
  if (apres?.statut === 'attente_paiement') await annuler(apres, 'Paiement abandonné.');
}

/* ——— la commande, côté vendeur et acheteur ——— */
async function commandeDe(f: FormData, qui: 'vendeur' | 'acheteur') {
  const id = num(f, 'id');
  const m = await exigerMembre(`/commandes/${id}`);
  const c = await db.query.commandes.findFirst({where: eq(schema.commandes.id, id)});
  if (!c || (qui === 'vendeur' ? c.vendeurId : c.acheteurId) !== m.id) redirect('/commandes');
  return c;
}
const retour = (c: Commande) => {
  revalidatePath(`/commandes/${c.id}`);
  redirect(`/commandes/${c.id}`);
};

export async function deposer(f: FormData) {
  const c = await commandeDe(f, 'vendeur');
  if (c.etiquette) await marquerDeposee(c);
  retour(c);
}

/* simulation de Mondial Relay : le colis arrive au point relais (visible seulement avec ENVOIS_SIMULES=1) */
export async function simulerArrivee(f: FormData) {
  if (!simule()) return;
  const id = num(f, 'id');
  const m = await exigerMembre(`/commandes/${id}`);
  const c = await db.query.commandes.findFirst({where: eq(schema.commandes.id, id)});
  if (!c || (c.acheteurId !== m.id && c.vendeurId !== m.id && m.role !== 'equipe')) redirect('/commandes');
  await marquerLivree(c);
  retour(c);
}

export type EtatCode = {erreur?: string};
export async function saisirCode(_: EtatCode, f: FormData): Promise<EtatCode> {
  const c = await commandeDe(f, 'vendeur');
  if (!(await remiseEnMain(c, String(f.get('code') || '')))) return {erreur: 'Ce n\'est pas le bon code. Demandez à l\'acheteur celui affiché dans sa commande.'};
  retour(c);
  return {};
}

export async function annulerParVendeur(f: FormData) {
  const c = await commandeDe(f, 'vendeur');
  if (c.statut === 'payee') await annuler(c, 'le vendeur a annulé la vente.');
  retour(c);
}

export async function confirmerReception(f: FormData) {
  const c = await commandeDe(f, 'acheteur');
  await confirmer(c, 'L\'acheteur a confirmé que tout est conforme.');
  retour(c);
}

export async function signalerProbleme(f: FormData) {
  const c = await commandeDe(f, 'acheteur');
  const raison = String(f.get('raison') || '').slice(0, 120);
  const texte = String(f.get('texte') || '').trim().slice(0, 1500);
  if (raison && texte) await ouvrirLitige(c, raison, texte);
  retour(c);
}

/* ——— la mise en avant, payée quand l'annonce est publiée ——— */
export async function payerMiseEnAvant(f: FormData) {
  const id = num(f, 'annonceId');
  const m = await exigerMembre('/compte');
  const a = await db.query.annonces.findFirst({where: and(eq(schema.annonces.id, id), eq(schema.annonces.vendeurId, m.id))});
  const offre = MISES_EN_AVANT.find((x) => x.k === String(f.get('duree') || a?.miseEnAvant));
  if (!a || a.statut !== 'publiee' || !offre?.prix) redirect('/compte');
  const [p] = await db.insert(schema.paiements).values({membreId: m.id, annonceId: a.id, montant: offre.prix, type: `mise_en_avant:${offre.k}`}).returning();
  const s = await stripe.checkout.sessions.create({
    mode: 'payment',
    locale: 'fr',
    adaptive_pricing: {enabled: false},
    customer_email: m.email,
    line_items: [{quantity: 1, price_data: {currency: 'eur', unit_amount: centimes(offre.prix), product_data: {name: `Mise en avant : ${offre.t} (${a.parfumNom})`}}}],
    metadata: {paiement: String(p.id)},
    success_url: `${site()}/compte?avant=${p.id}`,
    cancel_url: `${site()}/compte`,
  });
  await db.update(schema.paiements).set({checkoutId: s.id}).where(eq(schema.paiements.id, p.id));
  redirect(s.url!);
}

/* ——— l'équipe ——— */
/* le litige : chaque bouton a sa propre action (la valeur d'un bouton n'arrive pas toujours jusqu'au serveur) */
async function litige(f: FormData, rembourser: boolean) {
  const e = await exigerEquipe();
  const c = await db.query.commandes.findFirst({where: eq(schema.commandes.id, num(f, 'id'))});
  const decision = String(f.get('decision') || '').trim().slice(0, 500);
  if (c && c.statut === 'litige' && decision) {
    if (rembourser) await rembourserLitige(c, decision, e.id);
    else await confirmer(c, `L'équipe donne raison au vendeur : ${decision}`);
  }
  revalidatePath('/equipe/commandes');
  redirect('/equipe/commandes');
}
export async function litigeRembourser(f: FormData) {
  await litige(f, true);
}
export async function litigeVendeur(f: FormData) {
  await litige(f, false);
}

export async function annulerParEquipe(f: FormData) {
  await exigerEquipe();
  const c = await db.query.commandes.findFirst({where: eq(schema.commandes.id, num(f, 'id'))});
  const raison = String(f.get('raison') || '').trim();
  if (c && raison) await annuler(c, raison);
  redirect('/equipe/commandes');
}

export async function lancerTaches() {
  await exigerEquipe();
  await taches();
  redirect('/equipe/commandes');
}

export async function relireVersements() {
  const m = await exigerMembre('/compte/versements');
  await actualiserVersements(m.id).catch(() => null);
  redirect('/compte/versements');
}


/* ——— l'étiquette Mondial Relay : le vendeur donne son adresse d'expéditeur (gardée pour les prochaines fois), Respray
   crée l'expédition prépayée vers le point relais de l'acheteur ——— */
export async function obtenirEtiquette(f: FormData) {
  const id = num(f, 'id');
  const m = await exigerMembre(`/commandes/${id}/etiquette`);
  const c = await db.query.commandes.findFirst({where: eq(schema.commandes.id, id)});
  if (!c || c.vendeurId !== m.id || c.mode !== 'relais' || !c.relais || c.statut !== 'payee' || c.etiquette || simule()) redirect(`/commandes/${id}`);
  const texte = (k: string) => String(f.get(k) || '').trim().slice(0, 80);
  const exp: Expediteur = {nom: texte('nom'), rue: texte('rue'), cp: texte('cp').replace(/\D/g, ''), ville: texte('ville'), tel: texte('tel')};
  if (!expediteurValide(exp)) redirect(`/commandes/${id}/etiquette?erreur=adresse`);
  await db.update(schema.membres).set({expediteur: exp}).where(eq(schema.membres.id, m.id));
  const acheteur = await db.query.membres.findFirst({where: eq(schema.membres.id, c.acheteurId)});
  let ok = false;
  let code = '';
  try {
    const e = await creerExpedition(c.id, exp, {nom: `${acheteur?.prenom ?? ''} ${acheteur?.nom ?? ''}`.trim() || acheteur?.pseudo || 'Client', email: acheteur?.email ?? '', relais: c.relais}, c.assurance > 0);
    // seulement si personne ne l'a créée entre-temps (double clic)
    await db.update(schema.commandes).set({etiquette: e.numero, etiquettePdf: e.pdf}).where(and(eq(schema.commandes.id, c.id), isNull(schema.commandes.etiquette)));
    ok = true;
  } catch (err) {
    console.error('étiquette Mondial Relay', c.id, err);
    code = ((err as Error).message.match(/code (\d+)/) || [])[1] ?? '';
  }
  redirect(`/commandes/${id}/etiquette${ok ? '' : `?erreur=mr${code ? `&code=${code}` : ''}`}`);
}
