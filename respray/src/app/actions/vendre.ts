'use server';
/* Une annonce envoyée à la vérification : tout ce que le vendeur déclare, ses photos, et les maisons ou parfums qu'il
   propose s'ils ne sont pas dans la liste. Rien n'est publié avant la décision de l'équipe. */
import {redirect} from 'next/navigation';
import {eq, and} from 'drizzle-orm';
import {z} from 'zod';
import {db, schema} from '@/db';
import {moi} from '@/lib/auth';
import {enregistrerPhoto} from '@/lib/photos';
import {PHOTOS, CONCENTRATIONS, FORMATS, BOITES, MISES_EN_AVANT, POURQUOI, proprement} from '@/lib/regles';

export type EtatVente = {erreur?: string};

/* « autre » (pas dans la liste) ou vide : pas d'identifiant */
const idOpt = z.preprocess((x) => (x === '' || x === 'autre' || x == null ? undefined : x), z.coerce.number().int().optional());

const Vente = z
  .object({
    maisonId: idOpt,
    maisonAutre: z.string().trim().max(80).optional(),
    parfumId: idOpt,
    parfumAutre: z.string().trim().max(120).optional(),
    conc: z.string().optional(),
    genre: z.enum(['Femme', 'Homme', 'Mixte', '']).optional(),
    familles: z.array(z.string()).max(4).default([]),
    format: z.enum(FORMATS.map((f) => f[0]) as [string, ...string[]]),
    ml: z.coerce.number().positive('Indiquez la contenance.').max(2000),
    etat: z.enum(['neuf', 'entame']),
    niveau: z.coerce.number().int().min(0).max(100),
    visible: z.enum(['oui', 'opaque', '']).default(''),
    defauts: z.array(z.string()).max(6).default([]),
    boite: z.enum(BOITES.map((b) => b[0]) as [string, ...string[]], {errorMap: () => ({message: 'Dites s\'il a sa boîte.'})}),
    annee: z.string().min(1, 'Dites quand vous l\'avez acheté.').max(20),
    lieu: z.string().min(1, 'Dites où vous l\'avez acheté.').max(80),
    lumiere: z.enum(['abri', 'expose'], {errorMap: () => ({message: 'Dites comment il a été rangé (lumière).'})}),
    chaleur: z.enum(['abri', 'expose'], {errorMap: () => ({message: 'Dites comment il a été rangé (chaleur).'})}),
    pourquoi: z.enum(POURQUOI as [string, ...string[]], {errorMap: () => ({message: 'Dites pourquoi vous le vendez : c\'est ce que l\'acheteur se demande.'})}),
    lot: z.string().trim().max(40).default(''),
    lotIllisible: z.literal('on').optional(),
    description: z.string().trim().max(2000).default(''),
    prix: z.coerce.number().min(3, 'Indiquez un prix d\'au moins 3 €.').max(20000),
    mainPropre: z.literal('on').optional(),
    ville: z.string().trim().max(80).default(''),
    miseEnAvant: z.enum(MISES_EN_AVANT.map((m) => m.k) as [string, ...string[]]).default(''),
    engagement: z.literal('on', {errorMap: () => ({message: 'Cochez l\'engagement d\'authenticité.'})}),
  })
  .superRefine((d, ctx) => {
    const e = (message: string) => ctx.addIssue({code: 'custom', message});
    if (!d.maisonId && !d.maisonAutre) e('Choisissez ou écrivez la maison.');
    if (!d.parfumId && !d.parfumAutre) e('Choisissez ou écrivez le parfum.');
    if (!d.parfumId && !CONCENTRATIONS.includes(d.conc || '')) e('Choisissez la concentration.');
    if (!d.parfumId && !d.genre) e('Dites pour qui est ce parfum : femme, homme ou mixte.');
    if (d.etat === 'entame' && !d.visible && d.format !== 'decant') e('Dites si le parfum se voit à travers le flacon.');
    if (d.format === 'decant' && d.ml > 30) e('Un décant fait 30 ml au plus.');
    if (!d.lot && !d.lotIllisible) e('Recopiez le code lot, ou cochez « effacé ou illisible ».');
    if (d.mainPropre && !d.ville) e('Indiquez la ville de la remise en main propre.');
  });

export async function envoyerVente(_: EtatVente, f: FormData): Promise<EtatVente> {
  const m = await moi();
  if (!m) return {erreur: 'Connectez-vous pour envoyer votre annonce.'};
  if (m.statut !== 'actif') return {erreur: 'Votre compte est suspendu : vous ne pouvez pas vendre pour le moment.'};
  const brut = Object.fromEntries([...f.entries()].filter(([k, v]) => typeof v === 'string' && !k.startsWith('$') && !['familles', 'defauts'].includes(k)));
  const r = Vente.safeParse({...brut, familles: f.getAll('familles'), defauts: f.getAll('defauts')});
  if (!r.success) return {erreur: r.error.issues[0].message};
  const d = r.data;
  const fichiers = Object.fromEntries(PHOTOS.map((p) => [p.k, f.get('photo_' + p.k)]).filter(([, v]) => v instanceof File && v.size > 0)) as Record<string, File>;
  const manque = PHOTOS.filter((p) => (p.obl || (p.k === 'decant' && d.format === 'decant')) && !fichiers[p.k]);
  if (manque.length) return {erreur: `Il manque ${manque.length} photo${manque.length > 1 ? 's' : ''} obligatoire${manque.length > 1 ? 's' : ''} : ${manque.map((p) => p.t.toLowerCase()).join(', ')}.`};

  // le parfum : du catalogue, ou proposé (maison et/ou parfum écrits par le vendeur)
  let maisonNom = '';
  let parfumNom = '';
  let conc = d.conc || '';
  let genre = d.genre || '';
  let parfumId: number | null = null;
  if (d.maisonId) {
    const ma = await db.query.maisons.findFirst({where: eq(schema.maisons.id, d.maisonId)});
    if (!ma) return {erreur: 'Cette maison n\'existe pas.'};
    maisonNom = ma.nom;
  } else maisonNom = proprement(d.maisonAutre!);
  if (d.parfumId) {
    const p = await db.query.parfums.findFirst({where: and(eq(schema.parfums.id, d.parfumId), d.maisonId ? eq(schema.parfums.maisonId, d.maisonId) : undefined)});
    if (!p) return {erreur: 'Ce parfum n\'est pas dans la liste de cette maison.'};
    parfumId = p.id;
    parfumNom = p.nom;
    conc = p.conc;
    genre = p.genre;
  } else parfumNom = d.parfumAutre!.trim();

  let noms: Record<string, string> = {};
  try {
    for (const [vue, fichier] of Object.entries(fichiers)) noms[vue] = await enregistrerPhoto(fichier);
  } catch (e) {
    return {erreur: (e as Error).message};
  }
  const etiquette = (liste: readonly (readonly [string, string])[], k: string) => liste.find((x) => x[0] === k)?.[1] ?? k;
  const [a] = await db
    .insert(schema.annonces)
    .values({
      vendeurId: m.id,
      parfumId,
      maisonNom,
      parfumNom,
      conc,
      ml: d.ml,
      etat: d.format === 'decant' ? 'entame' : d.etat,
      niveau: d.etat === 'neuf' || d.format === 'decant' ? 100 : d.niveau,
      lot: d.lotIllisible ? '' : d.lot,
      description: d.description,
      details: {format: etiquette(FORMATS, d.format), visible: d.etat === 'neuf' ? '' : d.visible, defauts: d.defauts, annee: d.annee, lieu: d.lieu, lumiere: d.lumiere, chaleur: d.chaleur, boite: etiquette(BOITES, d.boite), familles: d.familles, genre, pourquoi: d.pourquoi},
      prix: d.prix,
      mainPropre: !!d.mainPropre,
      ville: d.mainPropre ? d.ville : '',
      miseEnAvant: d.miseEnAvant,
    })
    .returning();
  await db.insert(schema.photos).values(Object.entries(noms).map(([vue, fichier]) => ({annonceId: a.id, vue, fichier})));
  if (!d.maisonId) await db.insert(schema.propositions).values({type: 'maison', tape: d.maisonAutre!.trim(), membreId: m.id, annonceId: a.id});
  if (!d.parfumId) await db.insert(schema.propositions).values({type: 'parfum', tape: parfumNom, maisonNom, conc, membreId: m.id, annonceId: a.id});
  noms = {};
  redirect(`/vendre/envoyee?id=${a.id}`);
}

/* l'équipe a demandé une photo : le vendeur la remplace, et l'annonce repart dans la file de vérification */
export async function remplacerPhoto(_: EtatVente, f: FormData): Promise<EtatVente> {
  const m = await moi();
  if (!m) return {erreur: 'Connectez-vous.'};
  const id = Number(f.get('id'));
  const vue = String(f.get('vue'));
  const fichier = f.get('photo');
  const a = await db.query.annonces.findFirst({where: and(eq(schema.annonces.id, id), eq(schema.annonces.vendeurId, m.id))});
  if (!a || a.statut !== 'photo') return {erreur: 'Cette annonce n\'attend pas de photo.'};
  if (!PHOTOS.some((p) => p.k === vue)) return {erreur: 'Choisissez la photo à remplacer.'};
  if (!(fichier instanceof File) || !fichier.size) return {erreur: 'Choisissez une photo.'};
  let nom: string;
  try {
    nom = await enregistrerPhoto(fichier);
  } catch (e) {
    return {erreur: (e as Error).message};
  }
  await db.delete(schema.photos).where(and(eq(schema.photos.annonceId, a.id), eq(schema.photos.vue, vue)));
  await db.insert(schema.photos).values({annonceId: a.id, vue, fichier: nom});
  await db.update(schema.annonces).set({statut: 'attente', raison: ''}).where(eq(schema.annonces.id, a.id));
  redirect('/compte');
}
