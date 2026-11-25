import {desc, eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {traiterCandidature} from '@/app/actions/equipe';

export const metadata = {title: 'Vendeurs fondateurs'};

export default async function Candidatures() {
  const cs = await db.select().from(schema.candidatures).orderBy(desc(schema.candidatures.creeLe));
  const comptes = new Set((await db.select({e: schema.membres.email}).from(schema.membres)).map((x) => x.e));
  const f = new Intl.DateTimeFormat('fr-FR', {day: 'numeric', month: 'short'});
  return (
    <>
      <div className="bo-tete"><div><p className="surtitre">Lancement</p><h1 className="bo-titre">Vendeurs fondateurs</h1></div></div>
      <p className="aide bo-intro">Acceptée : si la personne a un compte avec cette adresse, elle reçoit le badge et 5 mises en avant. Écrivez-lui pour l'aider à publier ses premières annonces.</p>
      {cs.length ? (
        <div className="bo-table-cadre"><table className="bo-table"><thead><tr><th>Candidature</th><th>Flacons</th><th>Maisons</th><th>Vend aujourd'hui</th><th></th></tr></thead><tbody>
          {cs.map((c) => (
            <tr key={c.id}>
              <td><strong>{c.prenom || '—'}</strong><small className="bo-sous bo-mono">{c.email}</small><small className="bo-sous">{f.format(c.creeLe)}{comptes.has(c.email) ? ' · a un compte' : ' · pas encore de compte'}</small></td>
              <td>{c.flacons}</td><td>{c.maisons}</td><td>{c.ou}</td>
              <td className="bo-droite">{c.statut === 'nouvelle' ? (
                <div className="bo-actions">
                  <form action={traiterCandidature}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="choix" value="accepter" /><button className="btn btn-noir btn-petit" type="submit">Accepter</button></form>
                  <form action={traiterCandidature}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="choix" value="refuser" /><button className="btn btn-petit" type="submit">Refuser</button></form>
                </div>
              ) : <span className={`bo-pill bo-${c.statut === 'acceptee' ? 'ok' : 'gris'}`}>{c.statut === 'acceptee' ? 'Acceptée' : 'Refusée'}</span>}</td>
            </tr>
          ))}
        </tbody></table></div>
      ) : <div className="bo-vide"><p>Aucune candidature pour l'instant.</p></div>}
    </>
  );
}
