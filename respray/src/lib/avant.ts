import 'server-only';
/* La mise en avant : en tête des résultats (et sur l'accueil pour 7 jours) jusqu'à avantJusqua. Offerte avec un
   crédit (parrainage, vendeur fondateur), sinon payée par le vendeur une fois l'annonce publiée. */
import {and, eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {stripe} from '@/lib/stripe';
import {notifier} from '@/lib/activite';

export const JOURS: Record<string, number> = {'3j': 3, '7j': 7};

export async function activer(annonceId: number, k: string) {
  const jours = JOURS[k];
  if (!jours) return;
  await db.update(schema.annonces).set({miseEnAvant: k, avantJusqua: new Date(Date.now() + jours * 864e5)}).where(eq(schema.annonces.id, annonceId));
}

export async function payeeMiseEnAvant(paiementId: number) {
  const [p] = await db.update(schema.paiements).set({statut: 'payee'}).where(and(eq(schema.paiements.id, paiementId), eq(schema.paiements.statut, 'attente'))).returning();
  if (!p) return;
  const k = p.type.split(':')[1] || '3j';
  await activer(p.annonceId, k);
  await notifier(p.membreId, 'annonce', `Mise en avant active pour ${JOURS[k]} jours.`, `/annonces/${p.annonceId}`);
}

/* au retour sur le site, si le webhook n'est pas encore passé */
export async function verifierPaiementAvant(paiementId: number, membreId: number) {
  const p = await db.query.paiements.findFirst({where: and(eq(schema.paiements.id, paiementId), eq(schema.paiements.membreId, membreId))});
  if (!p || p.statut !== 'attente' || !p.checkoutId) return;
  const s = await stripe.checkout.sessions.retrieve(p.checkoutId);
  if (s.payment_status === 'paid') await payeeMiseEnAvant(p.id);
}
