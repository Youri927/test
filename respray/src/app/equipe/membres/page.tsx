import {desc, count, eq} from 'drizzle-orm';
import {db, schema} from '@/db';

export const metadata = {title: 'Membres'};

export default async function Membres() {
  const ms = await db.select().from(schema.membres).orderBy(desc(schema.membres.creeLe)).limit(500);
  const nb = await db.select({v: schema.annonces.vendeurId, n: count()}).from(schema.annonces).groupBy(schema.annonces.vendeurId);
  const att = await db.select({n: count()}).from(schema.attente);
  const f = new Intl.DateTimeFormat('fr-FR', {day: 'numeric', month: 'short', year: 'numeric'});
  return (
    <>
      <div className="bo-tete"><div><p className="surtitre">Communauté</p><h1 className="bo-titre">Membres</h1></div></div>
      <p className="aide bo-intro">{ms.length} compte{ms.length > 1 ? 's' : ''} · {att[0].n} personne{att[0].n > 1 ? 's' : ''} sur la liste d'attente de l'ouverture.</p>
      <div className="bo-table-cadre"><table className="bo-table"><thead><tr><th>Membre</th><th>E-mail</th><th>Inscrit</th><th>Annonces</th><th>Statut</th></tr></thead><tbody>
        {ms.map((m) => (
          <tr key={m.id}>
            <td><span className="bo-ligne-a"><span className="avatar" aria-hidden="true">{m.pseudo[0].toUpperCase()}</span><span><strong>@{m.pseudo}</strong><small>{m.prenom} {m.nom}{m.role === 'equipe' ? ' · équipe' : ''}</small></span></span></td>
            <td className="bo-mono">{m.email}</td>
            <td>{f.format(m.creeLe)}</td>
            <td>{nb.find((x) => x.v === m.id)?.n ?? 0}</td>
            <td><span className={`bo-pill bo-${m.statut === 'actif' ? 'ok' : 'alerte'}`}>{m.statut}</span></td>
          </tr>
        ))}
      </tbody></table></div>
    </>
  );
}
