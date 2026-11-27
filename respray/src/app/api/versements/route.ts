/* L'inscription du vendeur à ses versements, avec le formulaire de Respray : le navigateur a déjà envoyé l'identité,
   l'IBAN ou la pièce d'identité directement à Stripe, et ne transmet ici que les jetons (« accttok_… », « btok_… »). */
import {NextResponse} from 'next/server';
import {moi} from '@/lib/auth';
import {inscrireParticulier, changerIban, ajouterPiece, etatCompte, compteParticulier} from '@/lib/connect';
import {actualiserVersements} from '@/lib/commandes';
import {noter} from '@/lib/journal';

const jeton = (v: unknown, prefixe: string) => (typeof v === 'string' && v.startsWith(prefixe) && v.length < 200 ? v : undefined);

export async function POST(req: Request) {
  const m = await moi();
  if (!m) return NextResponse.json({erreur: 'connexion'}, {status: 401});
  const b = (await req.json().catch(() => ({}))) as {action?: string; compte?: string; banque?: string};
  try {
    let compte = await compteParticulier(m.stripeCompte);
    if (b.action === 'inscrire') {
      const jc = jeton(b.compte, 'accttok_');
      const jb = jeton(b.banque, 'btok_');
      if (!jc || !jb) return NextResponse.json({erreur: 'jetons'}, {status: 400});
      compte = await inscrireParticulier(m, jc, jb);
      await noter(m.id, 'versements_inscription', `membre:${m.id}`, 'a enregistré son identité et son IBAN pour les versements');
    } else if (b.action === 'iban') {
      const jb = jeton(b.banque, 'btok_');
      if (!compte || !jb) return NextResponse.json({erreur: 'jetons'}, {status: 400});
      await changerIban(compte, jb);
      await noter(m.id, 'versements_iban', `membre:${m.id}`, 'a changé son IBAN de versement');
    } else if (b.action === 'piece') {
      const jc = jeton(b.compte, 'accttok_');
      if (!compte || !jc) return NextResponse.json({erreur: 'jetons'}, {status: 400});
      await ajouterPiece(compte, jc);
    } else if (!compte) {
      return NextResponse.json({ok: false, aFournir: []});
    }
    const etat = await etatCompte(compte!);
    await actualiserVersements(m.id).catch(() => null);
    return NextResponse.json({ok: etat.ok, aFournir: etat.aFournir});
  } catch (e) {
    const x = e as {message?: string; code?: string};
    console.error('Versements, inscription :', x.code ?? '', x.message);
    // les erreurs de saisie (date de naissance, IBAN…) sont renvoyées au formulaire, en clair
    return NextResponse.json({erreur: 'stripe', message: x.message ?? ''}, {status: 502});
  }
}
