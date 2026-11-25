import Link from 'next/link';
import type {AnnonceAvecPhotos} from '@/lib/annonces';
import {eur} from '@/lib/regles';

const depuis = (d: Date | null) => {
  if (!d) return '';
  const j = Math.floor((Date.now() - d.getTime()) / 864e5);
  return j < 1 ? 'Vérifiée aujourd\'hui' : j === 1 ? 'Vérifiée hier' : `Vérifiée il y a ${j} jours`;
};

/* une annonce, en carte : la vraie photo de face du vendeur */
export function Carte({a}: {a: AnnonceAvecPhotos}) {
  return (
    <article className="carte">
      <Link className="carte-lien" href={`/annonces/${a.id}`}>
        <div className="carte-photo">
          {a.photos.face ? <img className="visuel" src={`/photos/${a.photos.face}`} alt={`${a.parfumNom}, de face`} loading="lazy" /> : <span className="visuel" />}
          <span className="etiq etiq-verif">{depuis(a.publieeLe)}</span>
          {a.etat === 'neuf' ? <span className="etiq etiq-bas">Neuf sous blister</span> : null}
        </div>
        <span className="carte-prix">{eur(a.prix)}</span>
        <span className="carte-nom">{a.parfumNom}</span>
        <span className="carte-maison">{a.maisonNom}</span>
        <span className="carte-meta">{a.ml} ml · {a.etat === 'neuf' ? 'neuf' : `reste ~${a.niveau} %`}</span>
      </Link>
    </article>
  );
}
