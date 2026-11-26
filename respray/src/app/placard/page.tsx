import Link from 'next/link';
import {asc, eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {moi} from '@/lib/auth';
import {estimer} from '@/lib/cote';
import {prixAuMl, demande} from '@/lib/marche';
import {eur} from '@/lib/regles';
import {retirerDuPlacard} from '@/app/actions/marche';
import {FormPlacard, Partager} from '@/components/Placard';

export const metadata = {
  title: 'Combien vaut votre placard ?',
  description: 'Ajoutez les parfums que vous possédez : Respray estime ce qu\'ils valent d\'occasion, d\'après la cote. Vendez ensuite celui que vous voulez, en un geste et sans commission.',
};
export const dynamic = 'force-dynamic';

/* Le placard : ce qu'on possède, ce que ça vaut. L'argent qui dort devient visible ; chaque flacon se vend ensuite en
   un geste, le formulaire déjà rempli. */
export default async function Placard() {
  const m = await moi();
  if (!m) {
    return (
      <div className="env page placard-accueil">
        <p className="surtitre">Le placard</p>
        <h1 className="titre-page">Combien valent les parfums qui dorment dans votre placard ?</h1>
        <p className="chapo">Ajoutez ceux que vous avez, avec ce qu'il en reste. Respray estime leur valeur d'occasion d'après la cote, flacon par flacon. Vous gardez ceux que vous aimez ; les autres se vendent en un geste, sans commission.</p>
        <div className="boutons"><Link className="btn btn-noir btn-large" href="/inscription?retour=/placard">Estimer mon placard</Link><Link className="btn btn-large" href="/connexion?retour=/placard">J'ai déjà un compte</Link></div>
        <p className="aide">Gratuit. Rien n'est mis en vente sans que vous le demandiez.</p>
      </div>
    );
  }
  const items = await db.select({x: schema.placard, p: schema.parfums, maison: schema.maisons.nom}).from(schema.placard).innerJoin(schema.parfums, eq(schema.placard.parfumId, schema.parfums.id)).innerJoin(schema.maisons, eq(schema.parfums.maisonId, schema.maisons.id)).where(eq(schema.placard.membreId, m.id)).orderBy(asc(schema.placard.creeLe));
  const ids = [...new Set(items.map((i) => i.p.id))];
  const [occ, dem] = await Promise.all([prixAuMl(ids), demande(ids)]);
  const estimes = items.map((i) => ({...i, cote: estimer({formats: i.p.formats, ml: i.x.ml, niveau: i.x.niveau, etat: i.x.niveau >= 100 ? 'neuf' : 'entame', occMl: occ[i.p.id]})}));
  const total = estimes.reduce((s, i) => s + (i.cote?.milieu ?? 0), 0);
  const ms = await db.select().from(schema.maisons).orderBy(asc(schema.maisons.nom));
  const ps = await db.select().from(schema.parfums).orderBy(asc(schema.parfums.nom));
  const maisons = ms.map((x) => ({id: x.id, nom: x.nom, parfums: ps.filter((p) => p.maisonId === x.id).map((p) => ({id: p.id, nom: p.nom, formats: p.formats}))}));
  const site = process.env.SITE_URL || 'https://respray.fr';
  return (
    <div className="env page">
      <p className="surtitre">Mon placard</p>
      {items.length ? (
        <div className="placard-total">
          <p>Votre placard vaut environ</p>
          <strong>{eur(total)}</strong>
          <p className="aide">{items.length} flacon{items.length > 1 ? 's' : ''}, estimé{items.length > 1 ? 's' : ''} d'après la cote Respray. C'est ce que vous toucheriez en {items.length > 1 ? 'les' : 'le'} vendant ici : 0 % de commission.</p>
          <div className="boutons"><Partager texte={`Mon placard de parfums vaut ${eur(total)} d'occasion. Et le vôtre ?`} url={`${site}/placard`} /></div>
        </div>
      ) : (
        <>
          <h1 className="titre-page">Combien vaut votre placard ?</h1>
          <p className="chapo">Ajoutez les parfums que vous avez, même entamés. On estime chacun d'après la cote, et le total s'affiche ici.</p>
        </>
      )}
      <section className="section">
        <h2 className="h2">Ajouter un flacon</h2>
        <FormPlacard key={items.length} maisons={maisons} />
        <p className="aide">Votre parfum n'est pas dans la liste ? <Link className="lien-souligne" href="/vendre">Vendez-le directement</Link> : l'équipe l'ajoutera au catalogue.</p>
      </section>
      {estimes.length ? (
        <section className="section">
          <h2 className="h2">Vos flacons</h2>
          <ul className="placard-liste">
            {estimes.map(({x, p, maison, cote}) => (
              <li key={x.id}>
                <div className="placard-nom"><strong>{p.nom}</strong><small>{maison} · {x.ml} ml · {x.niveau >= 100 ? 'neuf' : `reste ~${x.niveau} %`}</small>{dem[p.id] ? <span className="demande-mini">{dem[p.id]} personne{dem[p.id] > 1 ? 's le cherchent' : ' le cherche'}</span> : null}</div>
                <div className="placard-valeur">{cote ? <><strong>{eur(cote.milieu)}</strong><small>{eur(cote.bas)} à {eur(cote.haut)}</small></> : <small>Pas encore de cote</small>}</div>
                <div className="placard-actions">
                  <Link className="btn btn-noir btn-petit" href={`/vendre?parfum=${p.id}&ml=${x.ml}&niveau=${x.niveau}`}>Le vendre</Link>
                  <form action={retirerDuPlacard}><input type="hidden" name="id" value={x.id} /><button className="lien-bouton" type="submit">Retirer</button></form>
                </div>
              </li>
            ))}
          </ul>
          <p className="aide">La cote suit les annonces de chaque parfum sur Respray quand il y en a au moins 3 ; sinon, elle part du prix neuf indicatif, de l'état et de ce qu'il reste. <Link className="lien-souligne" href="/cote">Voir la cote de tous les parfums</Link></p>
        </section>
      ) : null}
    </div>
  );
}
