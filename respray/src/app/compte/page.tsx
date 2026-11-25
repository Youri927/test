import Link from 'next/link';
import {exigerMembre} from '@/lib/auth';
import {deVendeur, completer} from '@/lib/annonces';
import {and, eq, inArray} from 'drizzle-orm';
import {db, schema} from '@/db';
import {Carte} from '@/components/Carte';
import {eur} from '@/lib/regles';
import {RemplacerPhoto} from '@/components/RemplacerPhoto';

export const metadata = {title: 'Mon compte'};
export const dynamic = 'force-dynamic';

const STATUTS: Record<string, [string, string]> = {
  attente: ['En vérification', 'attente'],
  photo: ['Photo à refaire', 'attente'],
  publiee: ['En ligne', 'ok'],
  refusee: ['Refusée', 'alerte'],
  retiree: ['Retirée', 'gris'],
  vendue: ['Vendue', 'ok'],
};

export default async function Compte() {
  const m = await exigerMembre('/compte');
  const annonces = await deVendeur(m.id);
  const idsFav = (await db.select().from(schema.favoris).where(eq(schema.favoris.membreId, m.id))).map((x) => x.annonceId);
  const favoris = idsFav.length ? await completer(await db.select().from(schema.annonces).where(and(inArray(schema.annonces.id, idsFav), eq(schema.annonces.statut, 'publiee')))) : [];
  return (
    <div className="env page">
      <p className="surtitre">Mon compte</p>
      <h1 className="titre-page">Bonjour {m.prenom}</h1>
      <p className="chapo">@{m.pseudo} · {m.email}</p>
      <section className="section">
        <div className="section-tete"><h2>Mes annonces</h2><Link className="btn btn-noir btn-petit" href="/vendre">Vendre un parfum</Link></div>
        {annonces.length ? (
          <div className="bo-table-cadre"><table className="bo-table"><thead><tr><th>Annonce</th><th>Prix</th><th>Statut</th></tr></thead><tbody>
            {annonces.map((a) => (
              <tr key={a.id}>
                <td><Link className="bo-ligne-a" href={a.statut === 'publiee' ? `/annonces/${a.id}` : '#'}><span className="bo-vignette">{a.photos.face ? <img className="visuel" src={`/photos/${a.photos.face}`} alt="" /> : null}</span><span><strong>{a.parfumNom}</strong><small>{a.maisonNom} · {a.ml} ml</small></span></Link></td>
                <td>{eur(a.prix)}</td>
                <td><span className={`bo-pill bo-${STATUTS[a.statut][1]}`}>{STATUTS[a.statut][0]}</span>{a.raison ? <small className="bo-sous">{a.raison}</small> : null}{a.statut === 'photo' ? <RemplacerPhoto id={a.id} demande={a.raison} /> : null}</td>
              </tr>
            ))}
          </tbody></table></div>
        ) : (
          <div className="bientot"><h3>Aucune annonce pour l'instant.</h3><p className="aide">Gratuit, sans commission : vous touchez 100 % du prix.</p></div>
        )}
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
