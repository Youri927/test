import Link from 'next/link';
import {notFound, redirect} from 'next/navigation';
import {annonce} from '@/lib/annonces';
import {exigerMembre} from '@/lib/auth';
import {prixPour, protectionOfferte, montants, DELAI_VERIF} from '@/lib/commandes';
import {relaisPres, simule} from '@/lib/envoi';
import {ASSURANCE, SEUIL_ASSURANCE, eur, eur2} from '@/lib/regles';
import {payer} from '@/app/actions/commandes';
import {Bouclier} from '@/components/Bouclier';

export const metadata = {title: 'Acheter'};
export const dynamic = 'force-dynamic';

/* Acheter : le mode de remise, le point relais, le total ; puis la page de paiement Stripe. */
export default async function Acheter({params, searchParams}: {params: Promise<{id: string}>; searchParams: Promise<{cp?: string; mode?: string; erreur?: string}>}) {
  const id = Number((await params).id);
  const q = await searchParams;
  const m = await exigerMembre(`/acheter/${id}`);
  const a = await annonce(id);
  if (!a) notFound();
  if (a.vendeurId === m.id || a.statut !== 'publiee') redirect(`/annonces/${id}`);
  const {prix} = await prixPour(a, m.id);
  const offerte = await protectionOfferte(m);
  const mt = montants(prix, {offerte, assurance: false});
  const mode = q.mode === 'main' && a.mainPropre ? 'main' : 'relais';
  const cp = (q.cp || '').replace(/\D/g, '').slice(0, 5);
  const relais = relaisPres(cp);
  return (
    <div className="env page page-etroite achat">
      <nav className="fil" aria-label="Fil d'Ariane"><Link href={`/annonces/${a.id}`}>{a.parfumNom}</Link><span aria-hidden="true">›</span><span>Acheter</span></nav>
      <h1 className="titre-page">Acheter</h1>
      <div className="achat-resume">
        {a.photos.face ? <img src={`/photos/${a.photos.face}`} alt="" /> : null}
        <div><strong>{a.parfumNom}</strong><small>{a.maisonNom} · {a.ml} ml · {a.etat === 'neuf' ? 'neuf' : `reste ~${a.niveau} %`}</small><span>{prix < a.prix ? <><s>{eur(a.prix)}</s> {eur(prix)}</> : eur(prix)}</span></div>
      </div>
      {q.erreur === 'stripe' ? <p className="erreur" role="alert">Le paiement n'a pas pu démarrer. Réessayez dans un instant.</p> : null}
      {q.erreur === 'relais' ? <p className="erreur" role="alert">Choisissez un point relais.</p> : null}

      {a.mainPropre ? (
        <section className="section">
          <h2 className="h2">Comment le recevoir</h2>
          <div className="segment">
            <Link className={`choix-lien ${mode === 'relais' ? 'actif' : ''}`} href={`/acheter/${a.id}?mode=relais${cp ? `&cp=${cp}` : ''}`}>En point relais</Link>
            <Link className={`choix-lien ${mode === 'main' ? 'actif' : ''}`} href={`/acheter/${a.id}?mode=main`}>En main propre, à {a.ville}</Link>
          </div>
        </section>
      ) : null}

      {mode === 'relais' ? (
        <section className="section">
          <h2 className="h2">Votre point relais</h2>
          <form className="cp-form" action={`/acheter/${a.id}`}>
            <input type="hidden" name="mode" value="relais" />
            <label className="vh" htmlFor="cp">Code postal</label>
            <input id="cp" name="cp" className="champ" inputMode="numeric" maxLength={5} defaultValue={cp} placeholder="Votre code postal" required />
            <button className="btn" type="submit">Chercher</button>
          </form>
          {simule() && cp ? <p className="aide">Points relais de démonstration, en attendant le contrat Mondial Relay.</p> : null}
        </section>
      ) : (
        <p className="note-ajout">En main propre : vous payez ici, comme pour un envoi. Au rendez-vous, vous vérifiez le flacon, puis vous donnez au vendeur le code affiché dans votre commande. C'est ce code qui lui verse l'argent : ne le donnez qu'une fois le parfum vérifié.</p>
      )}

      {mode === 'main' || relais.length ? (
        <form action={payer} className="achat-form">
          <input type="hidden" name="annonceId" value={a.id} />
          <input type="hidden" name="mode" value={mode} />
          <input type="hidden" name="cp" value={cp} />
          {mode === 'relais' ? (
            <fieldset className="relais-liste">
              <legend className="vh">Point relais</legend>
              {relais.map((r, i) => (
                <label key={r.id} className="relais"><input type="radio" name="relais" value={r.id} defaultChecked={i === 0} /><span><strong>{r.nom}</strong><small>{r.adresse}, {r.cp} {r.ville}</small></span></label>
              ))}
            </fieldset>
          ) : null}
          {mode === 'relais' && prix >= SEUIL_ASSURANCE ? (
            <label className="choix assurance"><input type="checkbox" name="assurance" /> <span>Envoi assuré à la valeur du parfum (+{eur2(ASSURANCE)}) : remboursé en entier si le colis est perdu ou cassé.</span></label>
          ) : null}
          <dl className="total">
            <div><dt>Parfum</dt><dd>{eur2(mt.prix)}</dd></div>
            <div><dt>Protection acheteur</dt><dd>{offerte ? 'offerte' : eur2(mt.protection)}</dd></div>
            <div><dt>Livraison en point relais</dt><dd>{eur2(mt.envoi)}</dd></div>
            <div className="total-ligne"><dt>Total</dt><dd>{eur2(mt.total)}{mode === 'relais' && prix >= SEUIL_ASSURANCE ? <small> (+{eur2(ASSURANCE)} si assuré)</small> : null}</dd></div>
          </dl>
          <button className="btn btn-noir btn-large" type="submit">Payer {eur2(mt.total)}</button>
          <div className="achat-garantie"><Bouclier taille={44} anime={false} /><p>Votre argent reste bloqué. Le vendeur n'est payé qu'une fois que vous avez reçu et vérifié le parfum : vous avez {DELAI_VERIF} jours après la livraison. S'il n'est pas conforme à l'annonce, vous êtes remboursé.</p></div>
          <p className="aide">Paiement sécurisé par Stripe : carte bancaire, Apple Pay ou Google Pay. Respray ne voit jamais votre numéro de carte.</p>
        </form>
      ) : null}
    </div>
  );
}
