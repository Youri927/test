'use client';
import {useActionState} from 'react';
import {remplacerPhoto, type EtatVente} from '@/app/actions/vendre';
import {PHOTOS} from '@/lib/regles';

/* sous une annonce dont l'équipe a demandé une photo : choisir laquelle, l'envoyer */
export function RemplacerPhoto({id, demande}: {id: number; demande: string}) {
  const [etat, agir, enCours] = useActionState<EtatVente, FormData>(remplacerPhoto, {});
  const quelle = PHOTOS.find((p) => demande.startsWith(p.t))?.k ?? 'face';
  return (
    <form action={agir} className="bo-form-ligne remplacer">
      <input type="hidden" name="id" value={id} />
      <select name="vue" className="champ champ-petit" defaultValue={quelle}>{PHOTOS.map((p) => <option key={p.k} value={p.k}>{p.t}</option>)}</select>
      <input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" required />
      <button className="btn btn-noir btn-petit" type="submit" disabled={enCours}>{enCours ? 'Envoi…' : 'Envoyer la nouvelle photo'}</button>
      {etat.erreur ? <p className="erreur">{etat.erreur}</p> : null}
    </form>
  );
}
