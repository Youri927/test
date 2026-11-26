/* Les avis des acheteurs (de vrais achats, reçus et vérifiés) : une carte par avis, réutilisée sur l'accueil et sur /avis. */
import Link from 'next/link';
import {etoiles, type AvisDetaille} from '@/lib/avis';

const jour = new Intl.DateTimeFormat('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'});

export function CarteAvis({a, court = false}: {a: AvisDetaille; court?: boolean}) {
  const texte = a.texte && court && a.texte.length > 220 ? `${a.texte.slice(0, 210).trimEnd()}…` : a.texte;
  return (
    <article className="avis carte-avis">
      <div className="avis-tete">
        <span className="etoiles" aria-label={`${a.note} sur 5`}>{etoiles(a.note)}</span>
        <span className="avis-qui">@{a.acheteur ?? 'un acheteur'} · {jour.format(a.creeLe)}</span>
      </div>
      {texte ? <p className="avis-texte">{texte}</p> : null}
      {a.achat ? (
        <p className="avis-achat">
          {a.achat.photo ? <img src={`/photos/${a.achat.photo}`} alt="" /> : null}
          <span>
            A acheté <strong>{a.achat.parfumNom}</strong> · {a.achat.maisonNom}, {a.achat.ml} ml
            {a.vendeur ? <> à <Link className="lien-souligne" href={`/vendeur/${a.vendeur}#avis-${a.id}`}>@{a.vendeur}</Link></> : null}
          </span>
        </p>
      ) : null}
      {a.reponse && !court ? <p className="avis-reponse"><strong>Réponse de @{a.vendeur}</strong>{a.reponse}</p> : null}
    </article>
  );
}

/* la note globale : « 4,8 ★★★★★ · 23 avis d'acheteurs vérifiés » */
export function NoteGlobale({moyenne, n}: {moyenne: number; n: number}) {
  return (
    <p className="note-globale">
      <strong>{moyenne.toLocaleString('fr-FR')}</strong>
      <span className="etoiles" aria-hidden="true">{etoiles(moyenne)}</span>
      <span>{n} avis d&apos;acheteurs vérifiés</span>
    </p>
  );
}
