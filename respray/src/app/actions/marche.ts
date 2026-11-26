'use server';
import {depuisScento} from '@/lib/recherche-parfums';
/* Ce qui fait vivre le marché entre deux achats : la liste d'envies, le placard, les offres et les messages.
   Chaque événement prévient la bonne personne (lib/activite). */
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {and, eq, ne} from 'drizzle-orm';
import {db, schema} from '@/db';
import {exigerMembre, moi} from '@/lib/auth';
import {notifier, masquer} from '@/lib/activite';
import {eur} from '@/lib/regles';

const nombre = (x: FormDataEntryValue | null) => Number(String(x ?? '').replace(',', '.').replace(/[^\d.]/g, '')) || 0;
const retour = (f: FormData, defaut: string) => {
  const r = String(f.get('retour') || defaut);
  return r.startsWith('/') && !r.startsWith('//') ? r : defaut;
};
const DUREE_OFFRE = 48 * 3600 * 1000;

/* ——— la liste d'envies ——— */
export async function ajouterEnvie(f: FormData) {
  const r = retour(f, '/compte');
  const m = await exigerMembre(r);
  const parfumId = nombre(f.get('parfumId')) || null;
  const texte = String(f.get('texte') || '').trim().slice(0, 120);
  const prixMax = nombre(f.get('prixMax')) || null;
  if (!parfumId && texte.length < 2) redirect(r);
  const deja = await db.query.envies.findFirst({where: and(eq(schema.envies.membreId, m.id), parfumId ? eq(schema.envies.parfumId, parfumId) : eq(schema.envies.texte, texte))});
  if (deja) await db.update(schema.envies).set({prixMax}).where(eq(schema.envies.id, deja.id));
  else await db.insert(schema.envies).values({membreId: m.id, parfumId, texte: parfumId ? '' : texte, prixMax});
  revalidatePath(r);
  redirect(r + (r.includes('?') ? '&' : '?') + 'envie=ok');
}

export async function retirerEnvie(f: FormData) {
  const m = await exigerMembre('/compte');
  await db.delete(schema.envies).where(and(eq(schema.envies.id, nombre(f.get('id'))), eq(schema.envies.membreId, m.id)));
  revalidatePath('/compte');
}

/* ——— le placard ——— */
export async function ajouterAuPlacard(f: FormData) {
  const m = await exigerMembre('/placard');
  const texte = (k: string) => String(f.get(k) || '').trim().slice(0, 80);
  // un parfum introuvable : proposé à l'équipe, qui l'ajoute au catalogue
  if (texte('libreNom')) {
    await db.insert(schema.propositions).values({type: 'parfum', tape: texte('libreNom'), maisonNom: texte('libreMaison') || null, membreId: m.id});
    redirect('/placard?propose=1');
  }
  // un parfum trouvé chez Scento : ajouté au catalogue (après vérification), puis au placard
  const parfumId = nombre(f.get('parfumId')) || (texte('scentoNom') ? await depuisScento(texte('scentoNom'), texte('scentoMaison')) : null);
  const ml = nombre(f.get('ml'));
  const niveau = Math.min(100, Math.max(5, Math.round(nombre(f.get('niveau')) || 100)));
  const p = parfumId ? await db.query.parfums.findFirst({where: eq(schema.parfums.id, parfumId)}) : null;
  if (p && ml > 0 && ml <= 1000) await db.insert(schema.placard).values({membreId: m.id, parfumId: p.id, ml, niveau});
  revalidatePath('/placard');
  redirect('/placard');
}

export async function retirerDuPlacard(f: FormData) {
  const m = await exigerMembre('/placard');
  await db.delete(schema.placard).where(and(eq(schema.placard.id, nombre(f.get('id'))), eq(schema.placard.membreId, m.id)));
  revalidatePath('/placard');
}

/* ——— les offres ——— */
export type EtatOffre = {erreur?: string; ok?: string};

export async function faireOffre(_: EtatOffre, f: FormData): Promise<EtatOffre> {
  const m = await moi();
  if (!m) return {erreur: 'Connectez-vous pour faire une offre.'};
  const a = await db.query.annonces.findFirst({where: eq(schema.annonces.id, nombre(f.get('annonceId')))});
  if (!a || a.statut !== 'publiee') return {erreur: 'Cette annonce n\'est plus en ligne.'};
  if (a.vendeurId === m.id) return {erreur: 'C\'est votre annonce.'};
  const montant = Math.round(nombre(f.get('montant')) * 100) / 100;
  if (montant >= a.prix) return {erreur: `Au prix affiché (${eur(a.prix)}), pas besoin d'offre.`};
  if (montant < Math.ceil(a.prix * 0.6)) return {erreur: `Une offre doit être d'au moins ${eur(Math.ceil(a.prix * 0.6))} (60 % du prix) : en dessous, les vendeurs refusent presque toujours.`};
  await db.update(schema.offres).set({statut: 'annulee'}).where(and(eq(schema.offres.annonceId, a.id), eq(schema.offres.acheteurId, m.id), eq(schema.offres.statut, 'attente')));
  await db.insert(schema.offres).values({annonceId: a.id, acheteurId: m.id, montant, expire: new Date(Date.now() + DUREE_OFFRE)});
  await notifier(a.vendeurId, 'offre', `@${m.pseudo} vous propose ${eur(montant)} pour votre ${a.parfumNom} (affiché ${eur(a.prix)}). Répondez sous 48 heures.`, '/activite');
  revalidatePath(`/annonces/${a.id}`);
  return {ok: `Offre de ${eur(montant)} envoyée. Le vendeur a 48 heures pour répondre ; on vous prévient.`};
}

async function offreDuVendeur(offreId: number, vendeurId: number) {
  const [r] = await db.select({o: schema.offres, a: schema.annonces}).from(schema.offres).innerJoin(schema.annonces, eq(schema.offres.annonceId, schema.annonces.id)).where(and(eq(schema.offres.id, offreId), eq(schema.annonces.vendeurId, vendeurId)));
  return r;
}

export async function repondreOffre(f: FormData) {
  const m = await exigerMembre('/activite');
  const r = await offreDuVendeur(nombre(f.get('id')), m.id);
  if (!r || r.o.statut !== 'attente' || r.o.expire < new Date()) redirect('/activite');
  const choix = String(f.get('choix'));
  const lien = `/annonces/${r.a.id}`;
  if (choix === 'accepter') {
    await db.update(schema.offres).set({statut: 'acceptee', expire: new Date(Date.now() + DUREE_OFFRE)}).where(eq(schema.offres.id, r.o.id));
    await notifier(r.o.acheteurId, 'offre', `Offre acceptée : ${r.a.parfumNom} à ${eur(r.o.montant)} pour vous, pendant 48 heures.`, lien);
  } else if (choix === 'contre') {
    const contre = Math.round(nombre(f.get('contre')) * 100) / 100;
    if (!(contre > r.o.montant && contre < r.a.prix)) redirect('/activite?erreur=contre');
    await db.update(schema.offres).set({statut: 'contre', contre, expire: new Date(Date.now() + DUREE_OFFRE)}).where(eq(schema.offres.id, r.o.id));
    await notifier(r.o.acheteurId, 'offre', `Contre-offre du vendeur : ${r.a.parfumNom} à ${eur(contre)} (vous proposiez ${eur(r.o.montant)}).`, lien);
  } else {
    await db.update(schema.offres).set({statut: 'refusee'}).where(eq(schema.offres.id, r.o.id));
    await notifier(r.o.acheteurId, 'offre', `Le vendeur a décliné votre offre de ${eur(r.o.montant)} pour ${r.a.parfumNom}. Le prix affiché reste ${eur(r.a.prix)}.`, lien);
  }
  revalidatePath('/activite');
  redirect('/activite');
}

/* l'acheteur répond à une contre-offre */
export async function repondreContre(f: FormData) {
  const m = await exigerMembre('/activite');
  const o = await db.query.offres.findFirst({where: and(eq(schema.offres.id, nombre(f.get('id'))), eq(schema.offres.acheteurId, m.id))});
  if (!o || o.statut !== 'contre' || o.expire < new Date()) redirect('/activite');
  const a = (await db.query.annonces.findFirst({where: eq(schema.annonces.id, o.annonceId)}))!;
  if (String(f.get('choix')) === 'accepter') {
    await db.update(schema.offres).set({statut: 'acceptee', montant: o.contre!, expire: new Date(Date.now() + DUREE_OFFRE)}).where(eq(schema.offres.id, o.id));
    await notifier(a.vendeurId, 'offre', `@${m.pseudo} accepte votre contre-offre : ${a.parfumNom} à ${eur(o.contre!)}.`, '/activite');
  } else {
    await db.update(schema.offres).set({statut: 'refusee'}).where(eq(schema.offres.id, o.id));
    await notifier(a.vendeurId, 'offre', `@${m.pseudo} n'a pas retenu votre contre-offre pour ${a.parfumNom}.`, '/activite');
  }
  revalidatePath(`/annonces/${a.id}`);
  redirect(`/annonces/${a.id}`);
}

/* le vendeur propose un prix à toutes les personnes qui ont mis l'annonce en favori */
export async function proposerAuxFavoris(f: FormData) {
  const m = await exigerMembre('/compte');
  const a = await db.query.annonces.findFirst({where: and(eq(schema.annonces.id, nombre(f.get('annonceId'))), eq(schema.annonces.vendeurId, m.id))});
  const montant = Math.round(nombre(f.get('montant')) * 100) / 100;
  if (!a || a.statut !== 'publiee' || !(montant > 0 && montant < a.prix)) redirect('/compte?erreur=offre');
  const fans = await db.select({id: schema.favoris.membreId}).from(schema.favoris).where(and(eq(schema.favoris.annonceId, a.id), ne(schema.favoris.membreId, m.id)));
  for (const x of fans) {
    await db.update(schema.offres).set({statut: 'annulee'}).where(and(eq(schema.offres.annonceId, a.id), eq(schema.offres.acheteurId, x.id), eq(schema.offres.deVendeur, true)));
    await db.insert(schema.offres).values({annonceId: a.id, acheteurId: x.id, montant, deVendeur: true, statut: 'acceptee', expire: new Date(Date.now() + DUREE_OFFRE)});
    await notifier(x.id, 'offre', `Le ${a.parfumNom} que vous avez en favori est à ${eur(montant)} pour vous (au lieu de ${eur(a.prix)}), pendant 48 heures.`, `/annonces/${a.id}`);
  }
  revalidatePath('/compte');
  redirect(`/compte?propose=${fans.length}`);
}

/* ——— les messages ——— */
export type EtatMessage = {erreur?: string; masque?: boolean; n?: number};

export async function envoyerMessage(_: EtatMessage, f: FormData): Promise<EtatMessage> {
  const m = await moi();
  if (!m) return {erreur: 'Connectez-vous pour écrire au vendeur.'};
  const a = await db.query.annonces.findFirst({where: eq(schema.annonces.id, nombre(f.get('annonceId')))});
  if (!a || !['publiee', 'vendue'].includes(a.statut)) return {erreur: 'Cette annonce n\'est plus en ligne.'};
  const brut = String(f.get('texte') || '').trim().slice(0, 1500);
  if (!brut) return {erreur: 'Écrivez votre message.'};
  // l'acheteur écrit au vendeur ; le vendeur répond à un acheteur précis
  const acheteurId = a.vendeurId === m.id ? nombre(f.get('acheteurId')) : m.id;
  if (!acheteurId || acheteurId === a.vendeurId) return {erreur: 'À qui répondez-vous ?'};
  const {texte, masque} = masquer(brut);
  await db.insert(schema.messages).values({annonceId: a.id, acheteurId, auteurId: m.id, texte, masque});
  const dest = m.id === a.vendeurId ? acheteurId : a.vendeurId;
  await notifier(dest, 'message', `Message de @${m.pseudo} à propos de ${a.parfumNom} : « ${texte.slice(0, 80)}${texte.length > 80 ? '…' : ''} »`, `/messages/${a.id}${dest === a.vendeurId ? `?avec=${acheteurId}` : ''}`);
  revalidatePath(`/messages/${a.id}`);
  return {masque, n: Date.now()};
}
