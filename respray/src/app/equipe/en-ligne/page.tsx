import Link from 'next/link';
import {publiees} from '@/lib/annonces';
import {eur} from '@/lib/regles';
import {retirer} from '@/app/actions/equipe';

export const metadata = {title: 'Annonces en ligne'};

export default async function EnLigne() {
  const liste = await publiees(500);
  return (
    <>
      <div className="bo-tete"><div><p className="surtitre">Annonces</p><h1 className="bo-titre">En ligne</h1></div></div>
      {liste.length ? (
        <div className="bo-table-cadre"><table className="bo-table"><thead><tr><th>Annonce</th><th>Vendeur</th><th>Prix</th><th>Retirer du site</th></tr></thead><tbody>
          {liste.map((a) => (
            <tr key={a.id}>
              <td><Link className="bo-ligne-a" href={`/annonces/${a.id}`}><span className="bo-vignette">{a.photos.face ? <img className="visuel" src={`/photos/${a.photos.face}`} alt="" /> : null}</span><span><strong>{a.parfumNom}</strong><small>{a.maisonNom} · {a.ml} ml</small></span></Link></td>
              <td>@{a.vendeur.pseudo}</td>
              <td>{eur(a.prix)}</td>
              <td><form action={retirer} className="bo-form-ligne"><input type="hidden" name="id" value={a.id} /><select name="raison" className="champ champ-petit"><option>Signalée par un acheteur : à vérifier</option><option>Le vendeur l'a vendu ailleurs</option><option>Photos reprises d'une autre annonce</option><option>Contrefaçon probable</option><option>Demande du vendeur</option></select><button className="btn btn-petit" type="submit">Retirer</button></form></td>
            </tr>
          ))}
        </tbody></table></div>
      ) : <div className="bo-vide"><p>Aucune annonce en ligne pour l'instant.</p></div>}
    </>
  );
}
