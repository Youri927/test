import Link from 'next/link';
import {and, eq, inArray} from 'drizzle-orm';
import {db, schema} from '@/db';
import {exigerMembre} from '@/lib/auth';
import {actualiserVersements} from '@/lib/commandes';
import {eur} from '@/lib/regles';
import {configurerVersements, relireVersements} from '@/app/actions/commandes';

export const metadata = {title: 'Mes versements'};
export const dynamic = 'force-dynamic';

/* Les versements du vendeur : son compte Stripe (identité et IBAN, vérifiés par Stripe, jamais stockés chez Respray),
   et l'argent en attente ou déjà versé. */
export default async function Versements({searchParams}: {searchParams: Promise<{retour?: string; erreur?: string}>}) {
  const q = await searchParams;
  const m = await exigerMembre('/compte/versements');
  const ok = m.stripeCompte ? await actualiserVersements(m.id).catch(() => m.versementsOk) : false;
  const ventes = await db.select().from(schema.commandes).where(and(eq(schema.commandes.vendeurId, m.id), inArray(schema.commandes.statut, ['payee', 'expediee', 'livree', 'litige', 'confirmee', 'versee'])));
  const somme = (st: string[]) => ventes.filter((c) => st.includes(c.statut)).reduce((s, c) => s + c.prix, 0);
  return (
    <div className="env page page-etroite">
      <nav className="fil" aria-label="Fil d'Ariane"><Link href="/compte">Mon compte</Link><span aria-hidden="true">›</span><span>Versements</span></nav>
      <h1 className="titre-page">Mes versements</h1>
      <p className="chapo">Vous touchez 100 % du prix de vos ventes, sans commission. L'argent vous est versé quand l'acheteur a vérifié le parfum.</p>
      <div className="verif-chiffres versements-chiffres">
        <div><strong>{eur(somme(['payee', 'expediee', 'livree', 'litige']))}</strong><span>en cours (colis en route ou en vérification)</span></div>
        <div className="ok"><strong>{eur(somme(['confirmee']))}</strong><span>prêts à être versés{ok ? '' : ', dès que votre IBAN est enregistré'}</span></div>
        <div><strong>{eur(somme(['versee']))}</strong><span>déjà versés</span></div>
      </div>
      {q.erreur ? <p className="erreur" role="alert">Stripe n'a pas pu créer votre compte de versement. Réessayez dans un instant ; si ça continue, écrivez-nous.</p> : null}
      {ok ? (
        <section className="action-bloc">
          <h2 className="h2">✓ Vos versements sont prêts</h2>
          <p>Votre identité et votre IBAN sont vérifiés par Stripe. Chaque vente confirmée vous est versée automatiquement, puis arrive sur votre compte bancaire sous quelques jours.</p>
          <form action={configurerVersements}><button className="btn" type="submit">Modifier mes informations</button></form>
        </section>
      ) : (
        <section className="action-bloc">
          <h2 className="h2">{m.stripeCompte ? 'Terminez votre inscription' : 'Ajoutez votre IBAN pour être payé'}</h2>
          <p>Notre partenaire de paiement, Stripe, vérifie votre identité et enregistre votre IBAN. Respray ne voit ni vos papiers ni vos coordonnées bancaires. Comptez 2 minutes, avec une pièce d'identité.</p>
          <form action={configurerVersements}><button className="btn btn-noir btn-large" type="submit">{m.stripeCompte ? 'Reprendre l\'inscription' : 'Configurer mes versements'}</button></form>
          {q.retour && m.stripeCompte ? <form action={relireVersements}><p className="aide">Vous venez de terminer ? La vérification peut prendre un instant. <button className="lien-bouton" type="submit">Actualiser</button></p></form> : null}
        </section>
      )}
    </div>
  );
}
