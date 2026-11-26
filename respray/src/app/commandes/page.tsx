import Link from 'next/link';
import {exigerMembre} from '@/lib/auth';
import {deMembre} from '@/lib/commandes';
import {eur} from '@/lib/regles';

export const metadata = {title: 'Mes commandes'};
export const dynamic = 'force-dynamic';

const STATUTS: Record<string, [string, string]> = {
  payee: ['Payée, à expédier', 'attente'],
  expediee: ['En route', 'attente'],
  livree: ['Arrivée, à vérifier', 'attente'],
  litige: ['Problème signalé', 'alerte'],
  confirmee: ['Confirmée', 'ok'],
  versee: ['Terminée', 'ok'],
  remboursee: ['Remboursée', 'gris'],
  annulee: ['Annulée', 'gris'],
};

export default async function Commandes() {
  const m = await exigerMembre('/commandes');
  const liste = await deMembre(m.id);
  const achats = liste.filter((x) => x.c.acheteurId === m.id);
  const ventes = liste.filter((x) => x.c.vendeurId === m.id);
  const Tableau = ({l, vente}: {l: typeof liste; vente: boolean}) => (
    <div className="bo-table-cadre"><table className="bo-table"><thead><tr><th>Parfum</th><th>{vente ? 'Pour vous' : 'Payé'}</th><th>Où en est-on</th></tr></thead><tbody>
      {l.map(({c, a}) => (
        <tr key={c.id}>
          <td><Link className="bo-ligne-a" href={`/commandes/${c.id}`}><span><strong>{a.parfumNom}</strong><small>{a.maisonNom} · {a.ml} ml · commande {c.id}</small></span></Link></td>
          <td>{eur(vente ? c.prix : c.total)}</td>
          <td><span className={`bo-pill bo-${STATUTS[c.statut]?.[1] ?? 'gris'}`}>{STATUTS[c.statut]?.[0] ?? c.statut}</span></td>
        </tr>
      ))}
    </tbody></table></div>
  );
  return (
    <div className="env page">
      <h1 className="titre-page">Mes commandes</h1>
      <section className="section"><div className="section-tete"><h2>Mes achats</h2></div>{achats.length ? <Tableau l={achats} vente={false} /> : <p className="aide">Aucun achat pour l'instant. <Link className="lien-souligne" href="/parfums">Voir les parfums</Link></p>}</section>
      <section className="section"><div className="section-tete"><h2>Mes ventes</h2><Link className="lien" href="/compte/versements">Mes versements</Link></div>{ventes.length ? <Tableau l={ventes} vente /> : <p className="aide">Aucune vente pour l'instant.</p>}</section>
    </div>
  );
}
