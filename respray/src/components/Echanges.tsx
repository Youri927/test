'use client';
/* Les formulaires d'échange entre acheteur et vendeur : faire une offre, écrire un message. */
import {useActionState, useEffect, useRef} from 'react';
import {faireOffre, envoyerMessage, type EtatOffre, type EtatMessage} from '@/app/actions/marche';
import {eur} from '@/lib/regles';

export function FormOffre({annonceId, prix}: {annonceId: number; prix: number}) {
  const [etat, agir, enCours] = useActionState<EtatOffre, FormData>(faireOffre, {});
  const min = Math.ceil(prix * 0.6);
  if (etat.ok) return <p className="offre-envoyee" role="status">{etat.ok}</p>;
  return (
    <details className="offre">
      <summary>Faire une offre</summary>
      <form action={agir} className="offre-form">
        <input type="hidden" name="annonceId" value={annonceId} />
        <label htmlFor="montant">Votre prix</label>
        <div className="offre-ligne">
          <div className="champ-prix"><input id="montant" name="montant" className="champ" inputMode="decimal" placeholder={String(Math.round(prix * 0.9))} required /><span>€</span></div>
          <button className="btn btn-noir" type="submit" disabled={enCours}>Proposer</button>
        </div>
        <p className="aide">Entre {eur(min)} et {eur(prix)}. Le vendeur a 48 heures pour accepter, refuser ou vous faire une contre-offre.</p>
        {etat.erreur ? <p className="erreur" role="alert">{etat.erreur}</p> : null}
      </form>
    </details>
  );
}

export function FormMessage({annonceId, acheteurId}: {annonceId: number; acheteurId?: number}) {
  const [etat, agir, enCours] = useActionState<EtatMessage, FormData>(envoyerMessage, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (etat.n) ref.current?.reset();
  }, [etat.n]);
  return (
    <form action={agir} ref={ref} className="message-form">
      <input type="hidden" name="annonceId" value={annonceId} />
      {acheteurId ? <input type="hidden" name="acheteurId" value={acheteurId} /> : null}
      <label className="vh" htmlFor="texte">Votre message</label>
      <textarea id="texte" name="texte" className="champ" rows={3} placeholder="Votre question sur le parfum, le flacon, l'envoi…" required />
      <div className="message-actions">
        <p className="aide">Restez sur Respray pour payer et échanger : hors d'ici, plus de paiement bloqué ni de 7 jours pour vérifier.</p>
        <button className="btn btn-noir" type="submit" disabled={enCours}>Envoyer</button>
      </div>
      {etat.masque ? <p className="note-ajout" role="status">Pour votre protection, on a masqué des coordonnées ou un moyen de paiement extérieur dans votre message.</p> : null}
      {etat.erreur ? <p className="erreur" role="alert">{etat.erreur}</p> : null}
    </form>
  );
}
