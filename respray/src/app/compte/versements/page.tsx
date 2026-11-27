import Link from 'next/link';
import {and, eq, inArray} from 'drizzle-orm';
import {db, schema} from '@/db';
import {exigerMembre} from '@/lib/auth';
import {actualiserVersements} from '@/lib/commandes';
import {eur} from '@/lib/regles';
import {relireVersements} from '@/app/actions/commandes';
import {FormVersements, ChangerIban, EnvoyerPiece} from '@/components/FormVersements';
import {compteParticulier, etatCompte, ibanDe} from '@/lib/connect';

export const metadata = {title: 'Mes versements'};
export const dynamic = 'force-dynamic';

/* Les versements du vendeur : son compte Stripe (identité et IBAN, vérifiés par Stripe, jamais stockés chez Respray),
   et l'argent en attente ou déjà versé. */
export default async function Versements({searchParams}: {searchParams: Promise<{retour?: string; erreur?: string}>}) {
  const q = await searchParams;
  const m = await exigerMembre('/compte/versements');
  // seuls comptent les comptes créés avec le formulaire de Respray ; un ancien compte (formulaire Stripe) est refait
  const compte = await compteParticulier(m.stripeCompte).catch(() => null);
  const ok = compte ? await actualiserVersements(m.id).catch(() => m.versementsOk) : false;
  const etat = compte ? await etatCompte(compte).catch(() => null) : null;
  const iban = compte && ok ? await ibanDe(compte) : null;
  const titulaire = `${m.prenom} ${m.nom}`.trim() || m.pseudo;
  const ventes = await db.select().from(schema.commandes).where(and(eq(schema.commandes.vendeurId, m.id), inArray(schema.commandes.statut, ['payee', 'expediee', 'livree', 'litige', 'confirmee', 'versee'])));
  const somme = (st: string[]) => ventes.filter((c) => st.includes(c.statut)).reduce((s, c) => s + c.prix, 0);
  return (
    <div className="env page page-etroite">
      <nav className="fil" aria-label="Fil d'Ariane"><Link href="/compte">Mon compte</Link><span aria-hidden="true">›</span><span>Versements</span></nav>
      <h1 className="titre-page">Mes versements</h1>
      <p className="chapo">Vous touchez le prix de vos ventes, moins 5 % de commission (0 % pour les vendeurs fondateurs). Vos ventes confirmées vous sont versées chaque lundi, en un seul virement.</p>
      <div className="verif-chiffres versements-chiffres">
        <div><strong>{eur(somme(['payee', 'expediee', 'livree', 'litige']))}</strong><span>en cours (colis en route ou en vérification)</span></div>
        <div className="ok"><strong>{eur(somme(['confirmee']))}</strong><span>prêts à être versés{ok ? '' : ', dès que votre IBAN est enregistré'}</span></div>
        <div><strong>{eur(somme(['versee']))}</strong><span>déjà versés</span></div>
      </div>
      {q.erreur ? <p className="erreur" role="alert">Stripe n'a pas pu créer votre compte de versement. Réessayez dans un instant ; si ça continue, écrivez-nous.</p> : null}
      {ok ? (
        <section className="action-bloc">
          <h2 className="h2">✓ Vos versements sont prêts</h2>
          <p>Chaque lundi, vos ventes confirmées vous sont versées automatiquement{iban ? <> sur votre compte <strong>{iban.banque ? `${iban.banque} ` : ''}•••• {iban.fin}</strong></> : null}. L&apos;argent arrive sous quelques jours.</p>
          <ChangerIban titulaire={titulaire} />
        </section>
      ) : compte && etat?.aFournir.includes('document') ? (
        <section className="action-bloc">
          <h2 className="h2">Une dernière vérification</h2>
          <EnvoyerPiece />
        </section>
      ) : compte && etat && !etat.aFournir.length ? (
        <section className="action-bloc">
          <h2 className="h2">Vérification en cours</h2>
          <p>Stripe vérifie vos informations : c&apos;est en général l&apos;affaire de quelques minutes. Vous serez prévenu dès que vos versements sont prêts.</p>
          <form action={relireVersements}><button className="btn" type="submit">Actualiser</button></form>
        </section>
      ) : (
        <section className="action-bloc">
          <h2 className="h2">{compte ? 'Il manque une information' : 'Ajoutez votre IBAN pour être payé'}</h2>
          <p>{compte ? 'Stripe n\'a pas pu tout vérifier : vérifiez vos informations et enregistrez-les à nouveau.' : 'Pour vous verser l\'argent de vos ventes, il nous faut votre nom, votre date de naissance, votre adresse et votre IBAN. Comptez une minute.'}</p>
          <FormVersements prenom={m.prenom} nom={m.nom} email={m.email} />
        </section>
      )}
    </div>
  );
}
