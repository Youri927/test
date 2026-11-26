import Link from 'next/link';
import {and, desc, eq, gt} from 'drizzle-orm';
import {db, schema} from '@/db';
import {exigerMembre} from '@/lib/auth';
import {toutLu} from '@/lib/activite';
import {repondreOffre} from '@/app/actions/marche';
import {eur} from '@/lib/regles';

export const metadata = {title: 'Activité'};
export const dynamic = 'force-dynamic';

const quand = new Intl.DateTimeFormat('fr-FR', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});
const ICONES: Record<string, string> = {envie: '★', favori: '♥', offre: '€', message: '✉', annonce: '✓'};

/* ce qui vous arrive : les offres reçues à traiter d'abord, puis tout le reste, le plus récent en haut */
export default async function Activite({searchParams}: {searchParams: Promise<{erreur?: string}>}) {
  const {erreur} = await searchParams;
  const m = await exigerMembre('/activite');
  const recues = await db
    .select({o: schema.offres, a: schema.annonces, pseudo: schema.membres.pseudo})
    .from(schema.offres)
    .innerJoin(schema.annonces, eq(schema.offres.annonceId, schema.annonces.id))
    .innerJoin(schema.membres, eq(schema.offres.acheteurId, schema.membres.id))
    .where(and(eq(schema.annonces.vendeurId, m.id), eq(schema.offres.statut, 'attente'), gt(schema.offres.expire, new Date())))
    .orderBy(desc(schema.offres.creeLe));
  const liste = await db.select().from(schema.notifications).where(eq(schema.notifications.membreId, m.id)).orderBy(desc(schema.notifications.creeLe)).limit(80);
  await toutLu(m.id);
  return (
    <div className="env page page-etroite">
      <h1 className="titre-page">Activité</h1>
      <p className="chapo">Vos envies arrivées, les offres, les messages et le suivi de vos annonces.</p>
      {erreur === 'contre' ? <p className="erreur" role="alert">Une contre-offre doit être entre l'offre reçue et votre prix affiché.</p> : null}
      {recues.length ? (
        <section className="section">
          <h2 className="h2">Offres à traiter</h2>
          <ul className="offres-recues">
            {recues.map(({o, a, pseudo}) => (
              <li key={o.id}>
                <p><strong>@{pseudo} propose {eur(o.montant)}</strong> pour votre {a.parfumNom} (affiché {eur(a.prix)}) · répondez avant le {quand.format(o.expire)}</p>
                <div className="boutons">
                  <form action={repondreOffre}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="choix" value="accepter" /><button className="btn btn-noir btn-petit" type="submit">Accepter {eur(o.montant)}</button></form>
                  <form action={repondreOffre} className="contre-form"><input type="hidden" name="id" value={o.id} /><input type="hidden" name="choix" value="contre" /><div className="champ-prix"><input name="contre" className="champ" inputMode="decimal" aria-label="Votre contre-offre" placeholder={String(Math.round((o.montant + a.prix) / 2))} required /><span>€</span></div><button className="btn btn-petit" type="submit">Contre-offre</button></form>
                  <form action={repondreOffre}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="choix" value="refuser" /><button className="btn btn-petit btn-discret" type="submit">Refuser</button></form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {liste.length ? (
        <ul className="activite">
          {liste.map((n) => (
            <li key={n.id} className={n.lue ? '' : 'nouveau'}>
              <span className={`activite-ico ico-${n.type}`} aria-hidden="true">{ICONES[n.type] ?? '•'}</span>
              <div>{n.lien ? <Link href={n.lien}>{n.texte}</Link> : <span>{n.texte}</span>}<small>{quand.format(n.creeLe)}</small></div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="bientot"><h3>Rien de nouveau.</h3><p className="aide">Ajoutez des parfums à votre <Link className="lien-souligne" href="/compte#envies">liste d'envies</Link> : vous serez prévenu ici dès qu'ils arrivent.</p></div>
      )}
    </div>
  );
}
