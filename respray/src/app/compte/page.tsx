import Link from 'next/link';
import {exigerMembre} from '@/lib/auth';
import {deVendeur, completer} from '@/lib/annonces';
import {and, eq, inArray, sql} from 'drizzle-orm';
import {db, schema} from '@/db';
import {Carte} from '@/components/Carte';
import {eur} from '@/lib/regles';
import {RemplacerPhoto} from '@/components/RemplacerPhoto';
import {proposerAuxFavoris, retirerEnvie} from '@/app/actions/marche';
import {reglerEmails} from '@/app/actions/compte';
import {payerMiseEnAvant} from '@/app/actions/commandes';
import {verifierPaiementAvant} from '@/lib/avant';
import {MISES_EN_AVANT} from '@/lib/regles';

export const metadata = {title: 'Mon compte'};
export const dynamic = 'force-dynamic';

const STATUTS: Record<string, [string, string]> = {
  attente: ['En vérification', 'attente'],
  photo: ['Photo à refaire', 'attente'],
  reservee: ['Paiement en cours', 'attente'],
  publiee: ['En ligne', 'ok'],
  refusee: ['Refusée', 'alerte'],
  retiree: ['Retirée', 'gris'],
  vendue: ['Vendue', 'ok'],
};

export default async function Compte({searchParams}: {searchParams: Promise<{propose?: string; erreur?: string; avant?: string; mdp?: string; emails?: string}>}) {
  const q = await searchParams;
  const m = await exigerMembre('/compte');
  if (q.avant) await verifierPaiementAvant(Number(q.avant), m.id).catch(() => null);
  const annonces = await deVendeur(m.id);
  const filleuls = await db.$count(schema.membres, eq(schema.membres.parrainId, m.id));
  const idsFav = (await db.select().from(schema.favoris).where(eq(schema.favoris.membreId, m.id))).map((x) => x.annonceId);
  const fans = Object.fromEntries((await db.select({a: schema.favoris.annonceId, n: sql<number>`count(*)::int`}).from(schema.favoris).where(inArray(schema.favoris.annonceId, annonces.map((a) => a.id).concat(-1))).groupBy(schema.favoris.annonceId)).map((x) => [x.a, x.n])) as Record<number, number>;
  const envies = await db.select({e: schema.envies, nom: schema.parfums.nom}).from(schema.envies).leftJoin(schema.parfums, eq(schema.envies.parfumId, schema.parfums.id)).where(eq(schema.envies.membreId, m.id));
  const favoris = idsFav.length ? await completer(await db.select().from(schema.annonces).where(and(inArray(schema.annonces.id, idsFav), eq(schema.annonces.statut, 'publiee')))) : [];
  return (
    <div className="env page">
      <p className="surtitre">Mon compte</p>
      <h1 className="titre-page">Bonjour {m.prenom}</h1>
      <p className="chapo">@{m.pseudo} · {m.email}</p>
      <nav className="compte-raccourcis" aria-label="Mon espace">
        <Link href="/activite">Activité</Link><Link href="/commandes">Mes commandes</Link><Link href="/compte/versements">Mes versements</Link><Link href="/messages">Messages</Link><Link href="/placard">Mon placard</Link><Link href="#envies">Mes envies</Link>
      </nav>
      {q.propose ? <p className="envie-ok" role="status">✓ Prix proposé à {Number(q.propose) > 1 ? `${q.propose} personnes : elles sont prévenues, et ont` : `${q.propose} personne : elle est prévenue, et a`} 48 heures pour en profiter.</p> : null}
      {q.mdp === 'ok' ? <p className="envie-ok" role="status">✓ Mot de passe changé.</p> : null}
      {q.erreur === 'offre' ? <p className="erreur" role="alert">Le prix proposé doit être inférieur au prix affiché.</p> : null}
      <section className="section parrainage">
        <div><p className="surtitre">Parrainage</p><h2 className="h2">Invitez quelqu'un : chacun y gagne</h2>
          <p className="aide">La personne invitée a la protection acheteur offerte sur son premier achat. Et quand sa première annonce est publiée, vous gagnez chacun une mise en avant.{m.fondateur ? ' Vous êtes vendeur fondateur.' : ''}</p></div>
        <p className="lien-parrain"><span className="bo-mono">{(process.env.SITE_URL || 'https://respray.fr') + '/r/' + m.code}</span></p>
        <p className="aide">{filleuls} personne{filleuls > 1 ? 's' : ''} invitée{filleuls > 1 ? 's' : ''} · {m.credits} mise{m.credits > 1 ? 's' : ''} en avant offerte{m.credits > 1 ? 's' : ''} à utiliser</p>
      </section>
      <section className="section" id="annonces">
        <div className="section-tete"><h2>Mes annonces</h2><Link className="btn btn-noir btn-petit" href="/vendre">Vendre un parfum</Link></div>
        {annonces.length ? (
          <div className="bo-table-cadre"><table className="bo-table"><thead><tr><th>Annonce</th><th>Prix</th><th>Statut</th></tr></thead><tbody>
            {annonces.map((a) => (
              <tr key={a.id}>
                <td><Link className="bo-ligne-a" href={a.statut === 'publiee' ? `/annonces/${a.id}` : '#'}><span className="bo-vignette">{a.photos.face ? <img className="visuel" src={`/photos/${a.photos.face}`} alt="" /> : null}</span><span><strong>{a.parfumNom}</strong><small>{a.maisonNom} · {a.ml} ml</small></span></Link></td>
                <td>{eur(a.prix)}</td>
                <td><span className={`bo-pill bo-${STATUTS[a.statut][1]}`}>{STATUTS[a.statut][0]}</span>{a.raison ? <small className="bo-sous">{a.raison}</small> : null}{a.statut === 'photo' ? <RemplacerPhoto id={a.id} demande={a.raison} /> : null}
                  {a.statut === 'publiee' && a.avantJusqua && a.avantJusqua > new Date() ? <small className="bo-sous">★ Mise en avant jusqu'au {new Intl.DateTimeFormat('fr-FR', {day: 'numeric', month: 'long'}).format(a.avantJusqua)}</small> : null}
                  {a.statut === 'publiee' && a.miseEnAvant && !(a.avantJusqua && a.avantJusqua > new Date()) ? (
                    <form action={payerMiseEnAvant} className="proposer-fans">
                      <input type="hidden" name="annonceId" value={a.id} />
                      <input type="hidden" name="duree" value={a.miseEnAvant} />
                      <button className="btn btn-petit" type="submit">Mettre en avant · {MISES_EN_AVANT.find((x) => x.k === a.miseEnAvant)?.t} · {eur(MISES_EN_AVANT.find((x) => x.k === a.miseEnAvant)?.prix ?? 0)}</button>
                    </form>
                  ) : null}
                  {a.statut === 'publiee' && fans[a.id] ? (
                    <form action={proposerAuxFavoris} className="proposer-fans">
                      <input type="hidden" name="annonceId" value={a.id} />
                      <small className="bo-sous">♥ {fans[a.id] > 1 ? `${fans[a.id]} personnes l'ont en favori. Proposez-leur` : '1 personne l\'a en favori. Proposez-lui'} un prix, valable 48 heures :</small>
                      <div className="offre-ligne"><div className="champ-prix"><input name="montant" className="champ" inputMode="decimal" aria-label="Prix proposé" placeholder={String(Math.round(a.prix * 0.9))} required /><span>€</span></div><button className="btn btn-petit" type="submit">Proposer</button></div>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody></table></div>
        ) : (
          <div className="bientot"><h3>Aucune annonce pour l'instant.</h3><p className="aide">Gratuit, sans commission : vous touchez 100 % du prix.</p></div>
        )}
      </section>
      <section className="section" id="envies">
        <div className="section-tete"><h2>Mes envies</h2><Link className="lien" href="/parfums">Chercher un parfum</Link></div>
        {envies.length ? (
          <ul className="envies-liste">
            {envies.map(({e, nom}) => (
              <li key={e.id}><span><strong>{nom || `« ${e.texte} »`}</strong>{e.prixMax ? <small> · jusqu'à {eur(e.prixMax)}</small> : null}</span>
                <form action={retirerEnvie}><input type="hidden" name="id" value={e.id} /><button className="lien-bouton" type="submit">Retirer</button></form></li>
            ))}
          </ul>
        ) : <p className="aide">Sur la page d'un parfum ou après une recherche, « Me prévenir quand il arrive » l'ajoute ici. Vous êtes prévenu dès qu'une annonce vérifiée arrive, à votre prix.</p>}
      </section>
      <section className="section" id="notifications">
        <div className="section-tete"><h2>Mes e-mails</h2></div>
        <form action={reglerEmails} className="emails-form">
          <label className="choix"><input type="checkbox" name="emailsActivite" defaultChecked={m.emailsActivite} /> <span>Me prévenir par e-mail quand une envie arrive, quand je reçois une offre ou un message</span></label>
          <button className="btn btn-petit" type="submit">Enregistrer</button>
        </form>
        <p className="aide">{q.emails === 'ok' ? '✓ Enregistré. ' : ''}Les e-mails sur vos commandes et vos annonces (paiement, envoi, versement, litige) partent toujours : ils sont nécessaires à la vente.</p>
      </section>
      {favoris.length ? (
        <section className="section">
          <div className="section-tete"><h2>Mes favoris</h2></div>
          <div className="grille">{favoris.map((a) => <Carte key={a.id} a={a} favori connecte />)}</div>
        </section>
      ) : null}
    </div>
  );
}
