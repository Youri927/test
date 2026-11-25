'use server';
/* Inscription, connexion, déconnexion, et la liste d'attente de l'ouverture. */
import {redirect} from 'next/navigation';
import {eq, or} from 'drizzle-orm';
import {z} from 'zod';
import {db, schema} from '@/db';
import {randomBytes} from 'crypto';
import {hacher, verifier, ouvrirSession, fermerSession} from '@/lib/auth';

/* un code de parrainage court, sans lettres ambiguës (0/O, 1/I) */
const nouveauCode = () => [...randomBytes(6)].map((b) => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');

/* valeurs : ce qui a été tapé, pour le remettre dans le formulaire après une erreur (React vide les champs) */
export type Etat = {erreur?: string; ok?: string; valeurs?: Record<string, string>};
const garder = (f: FormData) => Object.fromEntries([...f.entries()].filter(([k, v]) => typeof v === 'string' && !/motDePasse|^\$/.test(k))) as Record<string, string>;
const retourSur = (r: FormDataEntryValue | null) => (typeof r === 'string' && r.startsWith('/') && !r.startsWith('//') ? r : '/compte');

const Inscription = z.object({
  email: z.string().trim().toLowerCase().email('Cette adresse e-mail ne semble pas valide.'),
  pseudo: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._-]{3,24}$/, 'Le pseudo : 3 à 24 caractères, lettres, chiffres, point, tiret.'),
  prenom: z.string().trim().min(1, 'Votre prénom.').max(60),
  nom: z.string().trim().min(1, 'Votre nom.').max(60),
  motDePasse: z.string().min(10, 'Le mot de passe : 10 caractères au moins.').max(200),
  cgu: z.literal('on', {errorMap: () => ({message: 'Acceptez les conditions pour continuer.'})}),
});

export async function inscription(_: Etat, f: FormData): Promise<Etat> {
  const r = Inscription.safeParse(Object.fromEntries(f));
  if (!r.success) return {erreur: r.error.issues[0].message, valeurs: garder(f)};
  const d = r.data;
  const deja = await db.query.membres.findFirst({where: or(eq(schema.membres.email, d.email), eq(schema.membres.pseudo, d.pseudo))});
  if (deja) return {erreur: deja.email === d.email ? 'Un compte existe déjà avec cette adresse : connectez-vous.' : 'Ce pseudo est déjà pris.', valeurs: garder(f)};
  const codeParrain = String(f.get('parrain') || '').trim().toUpperCase();
  const parrain = codeParrain ? await db.query.membres.findFirst({where: eq(schema.membres.code, codeParrain)}) : null;
  const [m] = await db.insert(schema.membres).values({email: d.email, pseudo: d.pseudo, prenom: d.prenom, nom: d.nom, motDePasse: await hacher(d.motDePasse), code: nouveauCode(), parrainId: parrain?.id ?? null}).returning();
  await ouvrirSession(m.id);
  redirect(retourSur(f.get('retour')));
}

export async function connexion(_: Etat, f: FormData): Promise<Etat> {
  const email = String(f.get('email') || '').trim().toLowerCase();
  const mdp = String(f.get('motDePasse') || '');
  const m = await db.query.membres.findFirst({where: eq(schema.membres.email, email)});
  // le même message dans les deux cas : on ne dit pas si l'adresse existe
  if (!m || !(await verifier(mdp, m.motDePasse))) return {erreur: 'Adresse ou mot de passe incorrect.', valeurs: garder(f)};
  if (m.statut === 'exclu') return {erreur: 'Ce compte a été fermé.'};
  await ouvrirSession(m.id);
  redirect(retourSur(f.get('retour')));
}

export async function deconnexion() {
  await fermerSession();
  redirect('/');
}

export async function rejoindreAttente(_: Etat, f: FormData): Promise<Etat> {
  const r = z.string().trim().toLowerCase().email().safeParse(f.get('email'));
  if (!r.success) return {erreur: 'Cette adresse e-mail ne semble pas valide.'};
  const envie = f.get('envie') === 'vendre' ? 'vendre' : 'acheter';
  await db.insert(schema.attente).values({email: r.data, envie}).onConflictDoNothing();
  return {ok: 'C\'est noté : on vous écrit dès que les premières annonces sont en ligne.'};
}

/* la candidature « vendeur fondateur » */
export async function candidater(_: Etat, f: FormData): Promise<Etat> {
  const r = z.string().trim().toLowerCase().email().safeParse(f.get('email'));
  if (!r.success) return {erreur: 'Cette adresse e-mail ne semble pas valide.', valeurs: garder(f)};
  const champ = (k: string) => String(f.get(k) || '').trim().slice(0, 300);
  await db.insert(schema.candidatures).values({email: r.data, prenom: champ('prenom'), flacons: champ('flacons'), maisons: champ('maisons'), ou: champ('ou')}).onConflictDoNothing();
  return {ok: 'Merci ! L\'équipe vous écrit sous 48 h pour vous ouvrir l\'accès vendeur fondateur.'};
}
