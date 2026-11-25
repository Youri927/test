'use server';
/* Les décisions de l'équipe : publier, demander une photo, refuser, retirer une annonce ; ajouter, corriger ou refuser
   une maison ou un parfum proposé. Chaque décision laisse une ligne au journal. */
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {eq, and} from 'drizzle-orm';
import {db, schema} from '@/db';
import {exigerEquipe} from '@/lib/auth';
import {noter} from '@/lib/journal';
import {proprement} from '@/lib/regles';

const id = (f: FormData, k = 'id') => Number(f.get(k));

async function annonce(n: number) {
  const a = await db.query.annonces.findFirst({where: eq(schema.annonces.id, n)});
  if (!a) throw new Error('Annonce introuvable');
  return a;
}

export async function publier(f: FormData) {
  const e = await exigerEquipe();
  const a = await annonce(id(f));
  await db.update(schema.annonces).set({statut: 'publiee', raison: '', publieeLe: new Date()}).where(eq(schema.annonces.id, a.id));
  await noter(e.id, 'annonce_publiee', `annonce:${a.id}`, `a publié l'annonce ${a.parfumNom} (${a.maisonNom})`);
  revalidatePath('/');
  redirect('/equipe');
}

export async function refuser(f: FormData) {
  const e = await exigerEquipe();
  const a = await annonce(id(f));
  const raison = String(f.get('raison') || '').slice(0, 300);
  await db.update(schema.annonces).set({statut: 'refusee', raison}).where(eq(schema.annonces.id, a.id));
  await noter(e.id, 'annonce_refusee', `annonce:${a.id}`, `a refusé l'annonce ${a.parfumNom} : « ${raison} »`);
  redirect('/equipe');
}

export async function demanderPhoto(f: FormData) {
  const e = await exigerEquipe();
  const a = await annonce(id(f));
  const quelle = String(f.get('quelle') || '');
  const message = String(f.get('message') || '').slice(0, 500);
  await db.update(schema.annonces).set({statut: 'photo', raison: `${quelle} : ${message}`}).where(eq(schema.annonces.id, a.id));
  await noter(e.id, 'photo_demandee', `annonce:${a.id}`, `a demandé une photo (${quelle}) pour l'annonce ${a.parfumNom}`);
  redirect('/equipe');
}

export async function retirer(f: FormData) {
  const e = await exigerEquipe();
  const a = await annonce(id(f));
  const raison = String(f.get('raison') || '').slice(0, 300);
  await db.update(schema.annonces).set({statut: 'retiree', raison}).where(eq(schema.annonces.id, a.id));
  await noter(e.id, 'annonce_retiree', `annonce:${a.id}`, `a retiré l'annonce ${a.parfumNom} du site : « ${raison} »`);
  revalidatePath('/');
  redirect('/equipe/en-ligne');
}

/* une maison ou un parfum proposé : ajouté au catalogue sous le bon nom, ou rattaché à un nom existant, ou refusé */
export async function traiterProposition(f: FormData) {
  const e = await exigerEquipe();
  const p = await db.query.propositions.findFirst({where: eq(schema.propositions.id, id(f))});
  if (!p || p.statut !== 'attente') redirect('/equipe/maisons');
  const choix = String(f.get('choix'));
  const nom = proprement(String(f.get('nom') || p.tape)).slice(0, 120);
  if (choix === 'refuser') {
    await db.update(schema.propositions).set({statut: 'refusee'}).where(eq(schema.propositions.id, p.id));
    await noter(e.id, 'proposition_refusee', `proposition:${p.id}`, `a refusé la proposition « ${p.tape} »`);
  } else if (p.type === 'maison') {
    // ajouter (ou retrouver) la maison, et corriger l'annonce et les propositions de parfums qui la citent
    const [m] = await db.insert(schema.maisons).values({nom}).onConflictDoNothing().returning();
    const ancien = p.tape;
    await db.update(schema.annonces).set({maisonNom: nom}).where(and(eq(schema.annonces.id, p.annonceId ?? -1)));
    await db.update(schema.propositions).set({maisonNom: nom}).where(and(eq(schema.propositions.type, 'parfum'), eq(schema.propositions.annonceId, p.annonceId ?? -1)));
    await db.update(schema.propositions).set({statut: m ? 'ajoutee' : 'fusionnee'}).where(eq(schema.propositions.id, p.id));
    await noter(e.id, 'maison_ajoutee', `proposition:${p.id}`, m ? `a ajouté la maison « ${nom} » (tapée « ${ancien} »)` : `a rattaché « ${ancien} » à la maison ${nom}, déjà dans la liste`);
  } else {
    const ma = await db.query.maisons.findFirst({where: eq(schema.maisons.nom, p.maisonNom || '')});
    if (!ma) {
      await noter(e.id, 'info', `proposition:${p.id}`, `n'a pas pu ajouter « ${nom} » : la maison ${p.maisonNom} n'est pas encore dans la liste`);
      redirect('/equipe/maisons?attente=maison');
    }
    const deja = await db.query.parfums.findFirst({where: and(eq(schema.parfums.maisonId, ma.id), eq(schema.parfums.nom, nom))});
    const pf = deja ?? (await db.insert(schema.parfums).values({maisonId: ma.id, nom, conc: p.conc || ''}).returning())[0];
    await db.update(schema.annonces).set({parfumNom: nom, parfumId: pf.id}).where(eq(schema.annonces.id, p.annonceId ?? -1));
    await db.update(schema.propositions).set({statut: deja ? 'fusionnee' : 'ajoutee'}).where(eq(schema.propositions.id, p.id));
    await noter(e.id, 'parfum_ajoute', `proposition:${p.id}`, `a ajouté le parfum « ${nom} » (${ma.nom})`);
  }
  redirect('/equipe/maisons');
}
