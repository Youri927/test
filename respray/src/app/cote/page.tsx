import Link from 'next/link';
import {tousLesParfums, lienParfum} from '@/lib/catalogue';
import {prixAuMl, demande} from '@/lib/marche';
import {estimer} from '@/lib/cote';
import {eur, eur2} from '@/lib/regles';
import {classeFamille} from '@/lib/odeur';

export const metadata = {
  title: 'La cote des parfums d\'occasion',
  description: 'Combien vaut un parfum d\'occasion ? La cote Respray donne, pour chaque parfum, le prix neuf, le prix d\'occasion au millilitre et la valeur d\'un flacon entamé.',
};
export const revalidate = 3600;

/* la cote de tous les parfums du catalogue : le format le plus courant, neuf et entamé aux deux tiers */
export default async function Cote() {
  const tous = await tousLesParfums();
  const [occ, dem] = await Promise.all([prixAuMl(), demande()]);
  const lignes = tous
    .map(({p, maison}) => {
      const f = [...p.formats].filter((x) => x.neuf).sort((a, b) => b.ml - a.ml)[0];
      if (!f) return null;
      const neuf = estimer({formats: p.formats, ml: f.ml, niveau: 100, etat: 'neuf', occMl: occ[p.id]});
      const entame = estimer({formats: p.formats, ml: f.ml, niveau: 70, etat: 'entame', occMl: occ[p.id]});
      return {p, maison, f, neuf, entame, n: occ[p.id]?.length ?? 0, d: dem[p.id] ?? 0};
    })
    .filter((x): x is NonNullable<typeof x> => !!x);
  return (
    <div className="env page">
      <p className="surtitre">La cote Respray</p>
      <h1 className="titre-page">Combien vaut un parfum d'occasion ?</h1>
      <p className="chapo">Pour chaque parfum : le prix neuf indicatif, et ce que vaut le même flacon d'occasion, jamais ouvert ou entamé. Dès qu'un parfum a au moins 3 annonces sur Respray, sa cote suit leur prix réel au millilitre.</p>
      <div className="bo-table-cadre">
        <table className="bo-table cote-table">
          <thead><tr><th>Parfum</th><th>Neuf</th><th>D'occasion, jamais ouvert</th><th>D'occasion, reste 70 %</th><th>Demande</th></tr></thead>
          <tbody>
            {lignes.map(({p, maison, f, neuf, entame, n, d}) => (
              <tr key={p.id}>
                <td><Link href={`/parfum/${lienParfum(maison, p.nom)}`} className="cote-nom"><span className={`pastille ${classeFamille(p.famille)}`} aria-hidden="true" /><span><strong>{p.nom}</strong><small>{maison} · {f.ml} ml</small></span></Link></td>
                <td>{eur(f.neuf!)}<small className="bo-sous">{eur2(f.neuf! / f.ml)} le ml</small></td>
                <td>{neuf ? `${eur(neuf.bas)} à ${eur(neuf.haut)}` : '—'}</td>
                <td>{entame ? `${eur(entame.bas)} à ${eur(entame.haut)}` : '—'}<small className="bo-sous">{n >= 3 ? `d'après ${n} annonces` : 'estimation'}</small></td>
                <td>{d ? `${d} en attente` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="section">
        <h2 className="h2">Et le vôtre ?</h2>
        <p className="aide">Ajoutez vos flacons à votre placard : la cote estime chacun, avec ce qu'il en reste, et vous dit combien vaut l'ensemble.</p>
        <div className="boutons"><Link className="btn btn-noir" href="/placard">Estimer mon placard</Link><Link className="btn" href="/guides/combien-vendre-son-parfum">À combien vendre son parfum</Link></div>
      </section>
    </div>
  );
}
