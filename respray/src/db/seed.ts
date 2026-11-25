/* Remplit une base neuve : le catalogue des maisons et parfums (de vrais parfums, aucune annonce inventée) et le
   premier compte de l'équipe (EQUIPE_EMAIL, EQUIPE_MOT_DE_PASSE). Sans danger si on le relance : rien n'est écrit
   deux fois.
     npm run db:seed */
import 'dotenv/config';
import {eq, and} from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import {db, schema} from './index';
import catalogue from './catalogue.json';

async function maison(nom: string) {
  const [m] = await db.insert(schema.maisons).values({nom}).onConflictDoNothing().returning();
  return m ?? (await db.query.maisons.findFirst({where: eq(schema.maisons.nom, nom)}))!;
}

async function main() {
  for (const p of catalogue.parfums) {
    const m = await maison(p.maison);
    const deja = await db.query.parfums.findFirst({where: and(eq(schema.parfums.maisonId, m.id), eq(schema.parfums.nom, p.nom))});
    if (!deja) await db.insert(schema.parfums).values({maisonId: m.id, nom: p.nom, conc: p.conc, annee: p.annee, genre: p.genre, famille: p.famille, notes: p.notes, formats: p.formats});
  }
  for (const nom of catalogue.maisons) await maison(nom);
  const email = process.env.EQUIPE_EMAIL;
  const mdp = process.env.EQUIPE_MOT_DE_PASSE;
  if (email && mdp) {
    await db
      .insert(schema.membres)
      .values({email: email.toLowerCase(), pseudo: 'equipe', prenom: 'Équipe', nom: 'Respray', motDePasse: await bcrypt.hash(mdp, 10), role: 'equipe'})
      .onConflictDoNothing();
  }
  const n = await db.$count(schema.parfums);
  const nm = await db.$count(schema.maisons);
  console.log(`Catalogue : ${nm} maisons, ${n} parfums. Compte équipe : ${email ?? '(aucun)'}`);
  process.exit(0);
}
main();
