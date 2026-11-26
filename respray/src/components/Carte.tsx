import Link from 'next/link';
import type {AnnonceAvecPhotos} from '@/lib/annonces';
import {eur} from '@/lib/regles';
import {remise} from '@/lib/cote';
import {basculerFavori} from '@/app/actions/favoris';
import {Bouclier} from '@/components/Bouclier';

const depuis = (d: Date | null) => {
  if (!d) return '';
  const j = Math.floor((Date.now() - d.getTime()) / 864e5);
  return j < 1 ? 'Vérifiée aujourd\'hui' : j === 1 ? 'Vérifiée hier' : `Vérifiée il y a ${j} jours`;
};

/* une annonce, en carte : la vraie photo de face du vendeur */
export function Carte({a, favori = false, connecte = false}: {a: AnnonceAvecPhotos; favori?: boolean; connecte?: boolean}) {
  const r = a.parfum ? remise(a.parfum.formats, a) : null;
  return (
    <article className="carte" data-revele data-maison={a.maisonNom}>
      <Link className="carte-lien" href={`/annonces/${a.id}`}>
        <div className="carte-photo">
          {a.photos.face ? <img className="visuel" src={`/photos/${a.photos.face}`} alt={`${a.parfumNom}, de face`} loading="lazy" /> : <span className="visuel" />}
          <span className="etiq etiq-verif"><Bouclier taille={20} anime={false} />{depuis(a.publieeLe)}</span>
          {a.etat === 'neuf' ? <span className="etiq etiq-bas">Neuf sous blister</span> : null}
          {a.avantJusqua && a.avantJusqua > new Date() ? <span className="etiq etiq-avant">Mise en avant</span> : null}
        </div>
        <span className="carte-prix">{eur(a.prix)}{r ? <span className="carte-remise" title={`${r.pct} % moins cher au millilitre que le neuf (prix indicatif ${eur(r.neuf)})`}>−{r.pct} % vs neuf</span> : null}</span>
        <span className="carte-nom">{a.parfumNom}</span>
        <span className="carte-maison">{a.maisonNom}</span>
        <span className="carte-meta">{a.ml} ml · {a.etat === 'neuf' ? 'neuf' : `reste ~${a.niveau} %`}</span>
        {a.vendeur.note ? <span className="carte-note"><span aria-hidden="true">★</span> {a.vendeur.note.moyenne.toLocaleString('fr-FR')} <span>({a.vendeur.note.n} avis)</span></span> : null}
        {a.vendeur.fondateur ? <span className="badge-fondateur">Vendeur fondateur</span> : null}
      </Link>
      {connecte ? (
        <form action={basculerFavori} className="coeur-form">
          <input type="hidden" name="id" value={a.id} />
          <button className="coeur" type="submit" aria-pressed={favori} aria-label={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
          </button>
        </form>
      ) : null}
    </article>
  );
}
