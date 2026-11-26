import Link from 'next/link';
import {desc, eq, inArray} from 'drizzle-orm';
import {alias} from 'drizzle-orm/pg-core';
import {db, schema} from '@/db';
import {taches} from '@/lib/commandes';
import {eur, eur2} from '@/lib/regles';
import {litigeRembourser, litigeVendeur, annulerParEquipe, lancerTaches} from '@/app/actions/commandes';

export const metadata = {title: 'Commandes'};
export const dynamic = 'force-dynamic';

const court = new Intl.DateTimeFormat('fr-FR', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});
const LIBELLES: Record<string, string> = {attente_paiement: 'Paiement en cours', payee: 'À expédier', expediee: 'En route', livree: 'En vérification', litige: 'Litige', confirmee: 'À verser', versee: 'Versée', remboursee: 'Remboursée', annulee: 'Annulée'};

/* Les commandes, côté équipe : les litiges d'abord (avec les photos vérifiées de l'annonce pour trancher), puis tout
   le reste ; et ce que la plateforme encaisse. */
export default async function CommandesEquipe() {
  await taches().catch(() => null); // les délais (dépôt, 7 jours) sont aussi appliqués à chaque visite de l'équipe
  const ach = alias(schema.membres, 'ach');
  const ven = alias(schema.membres, 'ven');
  const liste = await db
    .select({c: schema.commandes, a: schema.annonces, acheteur: ach.pseudo, vendeur: ven.pseudo})
    .from(schema.commandes)
    .innerJoin(schema.annonces, eq(schema.commandes.annonceId, schema.annonces.id))
    .innerJoin(ach, eq(schema.commandes.acheteurId, ach.id))
    .innerJoin(ven, eq(schema.commandes.vendeurId, ven.id))
    .orderBy(desc(schema.commandes.creeLe))
    .limit(300);
  const litiges = liste.filter((x) => x.c.statut === 'litige');
  const photos = litiges.length ? await db.select().from(schema.photos).where(inArray(schema.photos.annonceId, litiges.map((x) => x.a.id))) : [];
  const payees = liste.filter((x) => !['attente_paiement', 'annulee', 'remboursee'].includes(x.c.statut));
  const encaisse = payees.reduce((s, x) => s + x.c.protection + x.c.envoi + x.c.assurance, 0);
  const volume = payees.reduce((s, x) => s + x.c.total, 0);
  return (
    <>
      <div className="bo-tete"><div><p className="surtitre">Argent et envois</p><h1 className="bo-titre">Commandes</h1></div><form action={lancerTaches}><button className="btn btn-petit" type="submit">Appliquer les délais maintenant</button></form></div>
      <div className="verif-chiffres">
        <div><strong>{payees.length}</strong><span>commandes payées</span></div>
        <div><strong>{eur(volume)}</strong><span>payés par les acheteurs</span></div>
        <div className="ok"><strong>{eur2(encaisse)}</strong><span>pour Respray (protection, envois, assurances), avant frais Stripe et étiquettes</span></div>
      </div>
      {litiges.length ? (
        <section className="section">
          <h2 className="h2">Litiges à trancher</h2>
          {litiges.map(({c, a, acheteur, vendeur}) => (
            <article key={c.id} className="bo-carte litige">
              <p><strong>Commande {c.id} · {a.parfumNom}</strong> ({eur(c.prix)}) · @{acheteur} contre @{vendeur} · signalé le {court.format(new Date(c.litige!.le))}</p>
              <p><strong>{c.litige!.raison}</strong> : « {c.litige!.texte} »</p>
              <div className="litige-photos">{photos.filter((p) => p.annonceId === a.id).map((p) => <a key={p.id} href={`/photos/${p.fichier}`} target="_blank" rel="noopener"><img src={`/photos/${p.fichier}`} alt={p.vue} /></a>)}</div>
              <p className="aide">Les photos ci-dessus sont celles vérifiées à la publication. <Link className="lien-souligne" href={`/messages/${a.id}?avec=${c.acheteurId}`}>Échanges acheteur et vendeur</Link></p>
              <form action={litigeRembourser} className="litige-form">
                <input type="hidden" name="id" value={c.id} />
                <label htmlFor={`d${c.id}`}>La décision, telle qu'elle sera envoyée aux deux</label>
                <textarea id={`d${c.id}`} name="decision" className="champ" rows={2} required placeholder="ex. Le code lot reçu ne correspond pas à celui de la photo vérifiée." />
                <div className="boutons">
                  <button className="btn btn-noir" type="submit">Rembourser l'acheteur</button>
                  <button className="btn" type="submit" formAction={litigeVendeur}>Donner raison au vendeur (verser)</button>
                </div>
              </form>
            </article>
          ))}
        </section>
      ) : null}
      <div className="bo-table-cadre">
        <table className="bo-table">
          <thead><tr><th>Commande</th><th>Parfum</th><th>Acheteur · vendeur</th><th>Payé</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {liste.map(({c, a, acheteur, vendeur}) => (
              <tr key={c.id}>
                <td>{c.id}<small className="bo-sous">{court.format(c.creeLe)}</small></td>
                <td>{a.parfumNom}<small className="bo-sous">{c.mode === 'main' ? 'main propre' : c.relais?.nom}{c.etiquette ? ` · ${c.etiquette}` : ''}</small></td>
                <td>@{acheteur}<small className="bo-sous">@{vendeur}</small></td>
                <td>{eur2(c.total)}<small className="bo-sous">{eur2(c.prix)} au vendeur</small></td>
                <td><span className={`bo-pill bo-${c.statut === 'litige' ? 'alerte' : ['versee', 'confirmee'].includes(c.statut) ? 'ok' : ['annulee', 'remboursee', 'attente_paiement'].includes(c.statut) ? 'gris' : 'attente'}`}>{LIBELLES[c.statut]}</span></td>
                <td>
                  {['payee', 'expediee'].includes(c.statut) ? (
                    <details><summary className="lien-bouton">Annuler</summary><form action={annulerParEquipe} className="litige-form"><input type="hidden" name="id" value={c.id} /><input name="raison" className="champ" required placeholder="Raison, envoyée aux deux" /><button className="btn btn-petit" type="submit">Annuler et rembourser</button></form></details>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
