import {redirect} from 'next/navigation';
import {eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {abandonner} from '@/app/actions/commandes';

export const dynamic = 'force-dynamic';

/* retour depuis Stripe sans payer : l'annonce est libérée tout de suite, et on revient sur l'annonce */
export default async function Abandon({params}: {params: Promise<{id: string}>}) {
  const id = Number((await params).id);
  await abandonner(id).catch(() => null);
  const c = await db.query.commandes.findFirst({where: eq(schema.commandes.id, id)});
  redirect(c ? `/annonces/${c.annonceId}` : '/');
}
