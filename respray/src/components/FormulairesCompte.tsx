'use client';
import Link from 'next/link';
import {useActionState} from 'react';
import {inscription, connexion, rejoindreAttente, candidater, type Etat} from '@/app/actions/compte';

const Erreur = ({e}: {e?: string}) => (e ? <p className="erreur" role="alert">{e}</p> : null);

export function FormConnexion({retour}: {retour: string}) {
  const [etat, agir, enCours] = useActionState<Etat, FormData>(connexion, {});
  return (
    <form className="formulaire compte-form" action={agir} key={JSON.stringify(etat.valeurs || {})}>
      <input type="hidden" name="retour" value={retour} />
      <label htmlFor="email">Adresse e-mail</label>
      <input id="email" name="email" defaultValue={etat.valeurs?.email} type="email" className="champ" autoComplete="email" required />
      <label htmlFor="mdp">Mot de passe</label>
      <input id="mdp" name="motDePasse" type="password" className="champ" autoComplete="current-password" required />
      <Erreur e={etat.erreur} />
      <button className="btn btn-noir btn-large" type="submit" disabled={enCours}>{enCours ? 'Connexion…' : 'Se connecter'}</button>
      <p className="aide">Pas encore de compte ? <Link className="lien-souligne" href={`/inscription?retour=${encodeURIComponent(retour)}`}>Créer un compte</Link></p>
    </form>
  );
}

export function FormInscription({retour, parrain = ''}: {retour: string; parrain?: string}) {
  const [etat, agir, enCours] = useActionState<Etat, FormData>(inscription, {});
  return (
    <form className="formulaire compte-form" action={agir} key={JSON.stringify(etat.valeurs || {})}>
      <input type="hidden" name="retour" value={retour} />
      <input type="hidden" name="parrain" value={parrain} />
      {parrain ? <p className="note-ajout">Vous êtes invité par un membre : votre première annonce publiée vous fait gagner une mise en avant offerte.</p> : null}
      <div className="ligne-champs">
        <div><label htmlFor="prenom">Prénom</label><input id="prenom" name="prenom" defaultValue={etat.valeurs?.prenom} className="champ" autoComplete="given-name" required /></div>
        <div><label htmlFor="nom">Nom</label><input id="nom" name="nom" defaultValue={etat.valeurs?.nom} className="champ" autoComplete="family-name" required /></div>
      </div>
      <p className="aide">Votre nom reste privé : il sert à la vérification d'identité et aux versements.</p>
      <label htmlFor="pseudo">Pseudo</label>
      <input id="pseudo" name="pseudo" defaultValue={etat.valeurs?.pseudo} className="champ" autoComplete="username" placeholder="ex. lea.parfums" required />
      <p className="aide">C'est lui qu'on voit sur vos annonces, et que vous écrirez sur la photo preuve.</p>
      <label htmlFor="email">Adresse e-mail</label>
      <input id="email" name="email" defaultValue={etat.valeurs?.email} type="email" className="champ" autoComplete="email" required />
      <label htmlFor="mdp">Mot de passe</label>
      <input id="mdp" name="motDePasse" type="password" className="champ" autoComplete="new-password" minLength={10} required />
      <p className="aide">10 caractères au moins.</p>
      <label className="choix"><input type="checkbox" name="cgu" defaultChecked={etat.valeurs?.cgu === 'on'} required /> J'accepte les conditions d'utilisation et la politique de confidentialité.</label>
      <Erreur e={etat.erreur} />
      <button className="btn btn-noir btn-large" type="submit" disabled={enCours}>{enCours ? 'Création…' : 'Créer mon compte'}</button>
      <p className="aide">Déjà un compte ? <Link className="lien-souligne" href={`/connexion?retour=${encodeURIComponent(retour)}`}>Se connecter</Link></p>
    </form>
  );
}

export function FormAttente({envie = 'acheter'}: {envie?: 'acheter' | 'vendre'}) {
  const [etat, agir, enCours] = useActionState<Etat, FormData>(rejoindreAttente, {});
  if (etat.ok) return <p className="note-ajout">{etat.ok}</p>;
  return (
    <form className="attente-form" action={agir}>
      <input type="hidden" name="envie" value={envie} />
      <label className="vh" htmlFor={`attente-${envie}`}>Votre adresse e-mail</label>
      <input id={`attente-${envie}`} name="email" defaultValue={etat.valeurs?.email} type="email" className="champ" placeholder="votre@adresse.fr" required />
      <button className="btn btn-noir" type="submit" disabled={enCours}>Me prévenir</button>
      <Erreur e={etat.erreur} />
    </form>
  );
}

export function FormFondateur() {
  const [etat, agir, enCours] = useActionState<Etat, FormData>(candidater, {});
  if (etat.ok) return <p className="note-ajout">{etat.ok}</p>;
  return (
    <form className="formulaire compte-form" action={agir} key={JSON.stringify(etat.valeurs || {})}>
      <div className="ligne-champs">
        <div><label htmlFor="f-prenom">Prénom</label><input id="f-prenom" name="prenom" className="champ" defaultValue={etat.valeurs?.prenom} /></div>
        <div><label htmlFor="f-email">Adresse e-mail</label><input id="f-email" name="email" type="email" className="champ" defaultValue={etat.valeurs?.email} required /></div>
      </div>
      <label htmlFor="f-flacons">Combien de flacons pensez-vous vendre ?</label>
      <select id="f-flacons" name="flacons" className="champ" defaultValue={etat.valeurs?.flacons || ''}><option value="">Choisir</option><option>1 à 3</option><option>4 à 10</option><option>Plus de 10</option></select>
      <label htmlFor="f-maisons">Quelles maisons, par exemple ? <small className="facultatif">facultatif</small></label>
      <input id="f-maisons" name="maisons" className="champ" placeholder="ex. Xerjoff, Le Labo, Guerlain" defaultValue={etat.valeurs?.maisons} />
      <label htmlFor="f-ou">Où vendez-vous aujourd'hui ? <small className="facultatif">facultatif</small></label>
      <input id="f-ou" name="ou" className="champ" placeholder="ex. nulle part, Vinted, un groupe Facebook" defaultValue={etat.valeurs?.ou} />
      {etat.erreur ? <p className="erreur" role="alert">{etat.erreur}</p> : null}
      <button className="btn btn-noir btn-large" type="submit" disabled={enCours}>Devenir vendeur fondateur</button>
    </form>
  );
}
