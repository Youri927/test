import Link from 'next/link';
import {ajouterEnvie} from '@/app/actions/marche';

/* « Préviens-moi » : ajoute un parfum (ou un nom cherché) à la liste d'envies, avec un prix maximum facultatif */
export function FormEnvie({parfumId, texte, retour, connecte, deja = false, libelle = 'Me prévenir quand il arrive'}: {parfumId?: number; texte?: string; retour: string; connecte: boolean; deja?: boolean; libelle?: string}) {
  if (deja) return <p className="envie-ok">✓ Dans votre liste d'envies : vous serez prévenu dès qu'une annonce vérifiée arrive.</p>;
  if (!connecte) return <Link className="btn btn-noir" href={`/connexion?retour=${encodeURIComponent(retour)}`}>{libelle}</Link>;
  return (
    <form action={ajouterEnvie} className="envie-form">
      {parfumId ? <input type="hidden" name="parfumId" value={parfumId} /> : <input type="hidden" name="texte" value={texte} />}
      <input type="hidden" name="retour" value={retour} />
      <div className="champ-prix"><input name="prixMax" className="champ" inputMode="decimal" placeholder="Prix max (facultatif)" aria-label="Prix maximum, facultatif" /><span>€</span></div>
      <button className="btn btn-noir" type="submit">{libelle}</button>
    </form>
  );
}
