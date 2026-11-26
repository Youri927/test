import Link from 'next/link';
import {desc, eq, or, inArray} from 'drizzle-orm';
import {db, schema} from '@/db';
import {exigerEquipe} from '@/lib/auth';
import {etoiles} from '@/lib/avis';
import {moderer} from '@/app/actions/avis';

export const metadata = {title: 'Avis signalés'};
export const dynamic = 'force-dynamic';

/* les avis signalés par les membres, et ceux que l'équipe a masqués (pour pouvoir les rétablir) */
export default async function AvisEquipe() {
  await exigerEquipe();
  const liste = await db.select().from(schema.avis).where(or(eq(schema.avis.signale, true), eq(schema.avis.masque, true))).orderBy(desc(schema.avis.creeLe)).limit(200);
  const ids = [...new Set(liste.flatMap((a) => [a.vendeurId, a.acheteurId]))];
  const membres = ids.length ? await db.select({id: schema.membres.id, pseudo: schema.membres.pseudo}).from(schema.membres).where(inArray(schema.membres.id, ids)) : [];
  const p = (id: number) => membres.find((x) => x.id === id)?.pseudo ?? '?';
  return (
    <>
      <h1 className="bo-titre">Avis signalés</h1>
      <p className="aide">Masquez un avis s&apos;il contient des insultes, des coordonnées ou s&apos;il ne parle pas de la vente. Sinon, gardez-le : un avis négatif mais honnête reste en ligne.</p>
      {liste.length ? (
        <div className="bo-table-cadre"><table className="bo-table"><thead><tr><th>Avis</th><th>Vendeur</th><th>État</th><th /></tr></thead><tbody>
          {liste.map((a) => (
            <tr key={a.id}>
              <td><span className="etoiles">{etoiles(a.note)}</span> par @{p(a.acheteurId)}<small className="bo-sous">{a.texte || '(sans texte)'}</small>{a.reponse ? <small className="bo-sous">Réponse : {a.reponse}</small> : null}</td>
              <td><Link className="lien-souligne" href={`/vendeur/${p(a.vendeurId)}#avis-${a.id}`}>@{p(a.vendeurId)}</Link></td>
              <td>{a.masque ? <span className="bo-pill bo-gris">Masqué</span> : <span className="bo-pill bo-attente">Signalé</span>}</td>
              <td>
                <div className="boutons">
                  {(a.masque ? [['retablir', 'Rétablir', 'btn']] : [['garder', 'Garder', 'btn'], ['masquer', 'Masquer', 'btn btn-noir']]).map(([v, t, cl]) => (
                    <form key={v} action={moderer}><input type="hidden" name="avisId" value={a.id} /><input type="hidden" name="action" value={v} /><button className={`${cl} btn-petit`} type="submit">{t}</button></form>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody></table></div>
      ) : <p className="aide">Aucun avis signalé.</p>}
    </>
  );
}
