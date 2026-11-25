import {eq, and, ne, count} from 'drizzle-orm';
import {db, schema} from '@/db';
import {aVerifier, type AnnonceAvecPhotos} from '@/lib/annonces';
import {PHOTOS, CONTROLES, RAISONS_REFUS, MISES_EN_AVANT, eur} from '@/lib/regles';
import {publier, refuser, demanderPhoto} from '@/app/actions/equipe';

export const metadata = {title: 'Annonces à vérifier'};

const depuis = (d: Date) => {
  const m = Math.round((Date.now() - d.getTime()) / 6e4);
  return m < 60 ? `il y a ${m} min` : m < 1440 ? `il y a ${Math.floor(m / 60)} h` : `il y a ${Math.floor(m / 1440)} j`;
};

async function Fiche({a}: {a: AnnonceAvecPhotos}) {
  const [{n: ventes}] = await db.select({n: count()}).from(schema.annonces).where(and(eq(schema.annonces.vendeurId, a.vendeurId), eq(schema.annonces.statut, 'vendue')));
  const [{n: autres}] = await db.select({n: count()}).from(schema.annonces).where(and(eq(schema.annonces.vendeurId, a.vendeurId), ne(schema.annonces.id, a.id)));
  const d = a.details;
  const declare: [string, string][] = [
    ['Concentration', a.conc],
    ['Format', `${d.format}, ${a.ml} ml`],
    ['État', a.etat === 'neuf' ? 'Neuf, jamais ouvert' : `Utilisé, reste ~${a.niveau} %${d.visible === 'opaque' ? ' (flacon opaque, photo à contre-jour)' : ''}`],
    ['Boîte', d.boite],
    ['Code lot', a.lot || 'déclaré illisible'],
    ['Acheté', `${d.annee}, ${d.lieu}`],
    ['Rangé', `${d.lumiere === 'abri' ? 'à l\'abri de' : 'exposé à'} la lumière, ${d.chaleur === 'abri' ? 'à l\'abri de' : 'exposé à'} la chaleur`],
    ['Défauts', d.defauts.join(', ')],
    ['Pour', d.genre],
    ['Familles', d.familles.join(', ')],
    ['Main propre', a.mainPropre ? a.ville : ''],
    ['Mise en avant', MISES_EN_AVANT.find((x) => x.k === a.miseEnAvant)?.t ?? ''],
    ['Description', a.description],
  ];
  const lent = Date.now() - a.creeLe.getTime() > 2 * 36e5;
  return (
    <article className="bo-carte bo-verif">
      <div className="bo-verif-photos">
        {PHOTOS.filter((p) => a.photos[p.k]).map((p) => (
          <figure key={p.k}>
            <a href={`/photos/${a.photos[p.k]}`} target="_blank" rel="noopener"><img src={`/photos/${a.photos[p.k]}`} alt={p.t} /></a>
            <figcaption>{p.t}</figcaption>
          </figure>
        ))}
      </div>
      <div className="bo-verif-infos">
        <p className="aide">Soumise {depuis(a.creeLe)} · @{a.vendeur.pseudo} · {ventes ? `${ventes} ventes` : 'nouveau vendeur'}{autres ? ` · ${autres} autre${autres > 1 ? 's' : ''} annonce${autres > 1 ? 's' : ''}` : ''}</p>
        <h2 className="bo-h2">{a.maisonNom} · {a.parfumNom}, {a.ml} ml {lent ? <span className="bo-pill bo-attente">En attente depuis plus de 2 h</span> : null}</h2>
        <p>{eur(a.prix)}{a.parfumId ? '' : ' · parfum hors liste (proposé à l\'équipe)'}</p>
        <dl className="bo-dl bo-declare">{declare.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        <fieldset className="p-checks"><legend className="vh">Contrôles</legend>{CONTROLES.map((c) => <label className="choix" key={c}><input type="checkbox" /> {c}</label>)}</fieldset>
        <p className="aide">Photo preuve : le papier doit porter <strong>@{a.vendeur.pseudo}</strong> et une date récente.</p>
        <div className="bo-actions">
          <form action={publier}><input type="hidden" name="id" value={a.id} /><button className="btn btn-noir btn-petit" type="submit">Publier</button></form>
        </div>
        <details className="bo-plus">
          <summary>Demander une photo</summary>
          <form action={demanderPhoto} className="bo-form-ligne">
            <input type="hidden" name="id" value={a.id} />
            <select name="quelle" className="champ">{PHOTOS.map((p) => <option key={p.k}>{p.t}</option>)}</select>
            <input name="message" className="champ" defaultValue="Pouvez-vous la reprendre, plus nette et en pleine lumière ? Merci !" />
            <button className="btn btn-petit" type="submit">Envoyer la demande</button>
          </form>
        </details>
        <details className="bo-plus">
          <summary>Refuser</summary>
          <form action={refuser} className="bo-form-ligne">
            <input type="hidden" name="id" value={a.id} />
            <select name="raison" className="champ">{RAISONS_REFUS.map((r) => <option key={r}>{r}</option>)}</select>
            <button className="btn btn-petit" type="submit">Refuser l'annonce</button>
          </form>
        </details>
      </div>
    </article>
  );
}

export default async function AVerifier() {
  const liste = await aVerifier();
  return (
    <>
      <div className="bo-tete"><div><p className="surtitre">Vérification</p><h1 className="bo-titre">Annonces à vérifier</h1></div></div>
      <p className="aide bo-intro">Les plus anciennes d'abord. Objectif : moins de 2 heures en journée. Cliquez une photo pour l'ouvrir en grand.</p>
      {liste.length ? liste.map((a) => <Fiche key={a.id} a={a} />) : <div className="bo-vide"><p>Aucune annonce en attente. Tout est vérifié.</p></div>}
    </>
  );
}
