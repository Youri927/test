import {desc} from 'drizzle-orm';
import {db, schema} from '@/db';
import {apercus} from '@/lib/email';

export const metadata = {title: 'E-mails'};
export const dynamic = 'force-dynamic';

const court = new Intl.DateTimeFormat('fr-FR', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});

/* les e-mails : chaque modèle tel qu'il arrive (avec l'exemple de démonstration), puis les derniers envoyés */
export default async function Emails() {
  const derniers = await db.select().from(schema.emails).orderBy(desc(schema.emails.creeLe)).limit(50);
  return (
    <>
      <div className="bo-tete"><div><p className="surtitre">Communication</p><h1 className="bo-titre">E-mails</h1></div></div>
      <p className="aide bo-intro">Chaque e-mail tel que le reçoivent les membres, avec un exemple. Les vrais e-mails reprennent la photo, le suivi et le récapitulatif de la vraie commande.</p>
      <div className="apercus-mails">
        {apercus().map((x) => (
          <figure key={x.nom}>
            <figcaption><strong>{x.nom}</strong><small>Objet : {x.sujet}</small></figcaption>
            <iframe title={x.nom} srcDoc={x.contenu.html} loading="lazy" />
          </figure>
        ))}
      </div>
      <h2 className="h2" style={{marginTop: 32}}>Derniers envois</h2>
      <div className="bo-table-cadre"><table className="bo-table"><thead><tr><th>Quand</th><th>À</th><th>Objet</th><th>Statut</th></tr></thead><tbody>
        {derniers.map((m) => <tr key={m.id}><td>{court.format(m.creeLe)}</td><td>{m.a}</td><td>{m.sujet}</td><td><span className={`bo-pill bo-${m.statut === 'envoye' ? 'ok' : m.statut === 'echec' ? 'alerte' : 'gris'}`}>{m.statut === 'envoye' ? 'Envoyé' : m.statut === 'echec' ? 'Échec' : 'Simulé'}</span>{m.erreur ? <small className="bo-sous">{m.erreur}</small> : null}</td></tr>)}
      </tbody></table></div>
    </>
  );
}
