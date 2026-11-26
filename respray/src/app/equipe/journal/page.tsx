import {desc, eq} from 'drizzle-orm';
import {db, schema} from '@/db';

export const metadata = {title: 'Journal'};

export default async function Journal() {
  const lignes = await db.select({j: schema.journal, prenom: schema.membres.prenom}).from(schema.journal).leftJoin(schema.membres, eq(schema.journal.membreId, schema.membres.id)).orderBy(desc(schema.journal.creeLe)).limit(300);
  const f = new Intl.DateTimeFormat('fr-FR', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});
  return (
    <>
      <div className="bo-tete"><div><p className="surtitre">Traçabilité</p><h1 className="bo-titre">Journal</h1></div></div>
      <p className="aide bo-intro">Chaque décision de l'équipe, signée et datée.</p>
      {lignes.length ? (
        <ol className="bo-journal">{lignes.map(({j, prenom}) => <li key={j.id}><span className="avatar" aria-hidden="true">{(prenom || 'R')[0]}</span><span><strong>{prenom ?? 'Respray (automatique)'}</strong> {j.texte}<small>{f.format(j.creeLe)}</small></span></li>)}</ol>
      ) : <div className="bo-vide"><p>Aucune action pour l'instant.</p></div>}
    </>
  );
}
