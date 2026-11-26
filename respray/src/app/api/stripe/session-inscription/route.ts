/* La session de l'inscription intégrée du vendeur : créée côté serveur pour la personne connectée ; seul son
   « client secret » est renvoyé au navigateur. */
import {NextResponse} from 'next/server';
import {moi} from '@/lib/auth';
import {sessionInscription} from '@/lib/connect';

export async function POST() {
  const m = await moi();
  if (!m) return NextResponse.json({erreur: 'connexion'}, {status: 401});
  try {
    return NextResponse.json({clientSecret: await sessionInscription(m)});
  } catch (e) {
    console.error('Session d\'inscription Stripe :', (e as Error).message);
    return NextResponse.json({erreur: 'stripe'}, {status: 502});
  }
}
