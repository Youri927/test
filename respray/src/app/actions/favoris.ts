'use server';
import {revalidatePath} from 'next/cache';
import {and, eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {exigerMembre} from '@/lib/auth';
import {notifier} from '@/lib/activite';

/* ajouter ou retirer une annonce des favoris */
export async function basculerFavori(f: FormData) {
  const id = Number(f.get('id'));
  const m = await exigerMembre(`/annonces/${id}`);
  const deja = await db.query.favoris.findFirst({where: and(eq(schema.favoris.membreId, m.id), eq(schema.favoris.annonceId, id))});
  if (deja) await db.delete(schema.favoris).where(and(eq(schema.favoris.membreId, m.id), eq(schema.favoris.annonceId, id)));
  else {
    await db.insert(schema.favoris).values({membreId: m.id, annonceId: id}).onConflictDoNothing();
    // le vendeur le sait : c'est ce qui l'encourage, et ce qui lui permet de proposer un prix à ces personnes
    const a = await db.query.annonces.findFirst({where: eq(schema.annonces.id, id)});
    if (a && a.vendeurId !== m.id) {
      const n = await db.$count(schema.favoris, eq(schema.favoris.annonceId, id));
      await notifier(a.vendeurId, 'favori', `Quelqu'un a mis votre ${a.parfumNom} en favori. ${n > 1 ? `${n} personnes l'ont en favori : vous pouvez leur proposer un prix` : 'Vous pouvez lui proposer un prix'} depuis votre compte.`, '/compte');
    }
  }
  revalidatePath('/parfums');
  revalidatePath('/compte');
  revalidatePath(`/annonces/${id}`);
}
