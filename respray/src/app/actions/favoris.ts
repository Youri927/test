'use server';
import {revalidatePath} from 'next/cache';
import {and, eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {exigerMembre} from '@/lib/auth';

/* ajouter ou retirer une annonce des favoris */
export async function basculerFavori(f: FormData) {
  const id = Number(f.get('id'));
  const m = await exigerMembre(`/annonces/${id}`);
  const deja = await db.query.favoris.findFirst({where: and(eq(schema.favoris.membreId, m.id), eq(schema.favoris.annonceId, id))});
  if (deja) await db.delete(schema.favoris).where(and(eq(schema.favoris.membreId, m.id), eq(schema.favoris.annonceId, id)));
  else await db.insert(schema.favoris).values({membreId: m.id, annonceId: id}).onConflictDoNothing();
  revalidatePath('/parfums');
  revalidatePath('/compte');
}
