'use client';
/* La saisie du code de remise en main propre, côté vendeur */
import {useActionState} from 'react';
import {saisirCode, type EtatCode} from '@/app/actions/commandes';

export function FormCode({id}: {id: number}) {
  const [etat, agir, enCours] = useActionState<EtatCode, FormData>(saisirCode, {});
  return (
    <form action={agir} className="code-form">
      <input type="hidden" name="id" value={id} />
      <label htmlFor="code">Le code que vous montre l'acheteur</label>
      <div className="offre-ligne"><input id="code" name="code" className="champ" inputMode="numeric" maxLength={6} placeholder="123456" required /><button className="btn btn-noir" type="submit" disabled={enCours}>Valider la remise</button></div>
      {etat.erreur ? <p className="erreur" role="alert">{etat.erreur}</p> : null}
    </form>
  );
}
