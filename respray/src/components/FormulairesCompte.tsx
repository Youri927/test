'use client';
import Link from 'next/link';
import {useActionState} from 'react';
import {inscription, connexion, rejoindreAttente, candidater, demanderReinitialisation, changerMotDePasse, finirGoogle, type Etat} from '@/app/actions/compte';

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
      <p className="aide"><Link className="lien-souligne" href="/mot-de-passe-oublie">Mot de passe oublié ?</Link> · Pas encore de compte ? <Link className="lien-souligne" href={`/inscription?retour=${encodeURIComponent(retour)}`}>Créer un compte</Link></p>
    </form>
  );
}

export function FormOubli() {
  const [etat, agir, enCours] = useActionState<Etat, FormData>(demanderReinitialisation, {});
  if (etat.ok) return <p className="envie-ok" role="status">{etat.ok}</p>;
  return (
    <form className="formulaire compte-form" action={agir}>
      <label htmlFor="email">L'adresse e-mail de votre compte</label>
      <input id="email" name="email" type="email" className="champ" autoComplete="email" required />
      <button className="btn btn-noir btn-large" type="submit" disabled={enCours}>{enCours ? 'Envoi…' : 'Recevoir un lien'}</button>
    </form>
  );
}

export function FormNouveauMdp({jeton}: {jeton: string}) {
  const [etat, agir, enCours] = useActionState<Etat, FormData>(changerMotDePasse, {});
  return (
    <form className="formulaire compte-form" action={agir}>
      <input type="hidden" name="jeton" value={jeton} />
      <label htmlFor="mdp">Nouveau mot de passe</label>
      <input id="mdp" name="motDePasse" type="password" className="champ" autoComplete="new-password" minLength={10} required />
      <p className="aide">10 caractères au moins.</p>
      <Erreur e={etat.erreur} />
      <button className="btn btn-noir btn-large" type="submit" disabled={enCours}>{enCours ? 'Enregistrement…' : 'Enregistrer'}</button>
      {etat.erreur ? <p className="aide"><Link className="lien-souligne" href="/mot-de-passe-oublie">Demander un nouveau lien</Link></p> : null}
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
      <label className="choix"><input type="checkbox" name="cgu" defaultChecked={etat.valeurs?.cgu === 'on'} required /> <span>J'ai 18 ans ou plus, et j'accepte les <a className="lien-souligne" href="/cgu" target="_blank">conditions</a> et la <a className="lien-souligne" href="/confidentialite" target="_blank">politique de confidentialité</a>.</span></label>
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

/* « Continuer avec Google », au format demandé par Google (fond clair, G en couleurs), et un séparateur « ou » */
export function BoutonGoogle({retour}: {retour: string}) {
  return (
    <div className="auth-google">
      <a className="btn-google" href={`/api/auth/google?retour=${encodeURIComponent(retour)}`}>
        <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
        Continuer avec Google
      </a>
      <p className="auth-ou"><span>ou</span></p>
    </div>
  );
}

export function FormFinirGoogle({retour, prenom, nom, pseudo}: {retour: string; prenom: string; nom: string; pseudo: string}) {
  const [etat, agir, enCours] = useActionState<Etat, FormData>(finirGoogle, {});
  const v = etat.valeurs;
  return (
    <form className="formulaire compte-form" action={agir} key={JSON.stringify(v || {})}>
      <input type="hidden" name="retour" value={retour} />
      <div className="ligne-champs">
        <div><label htmlFor="prenom">Prénom</label><input id="prenom" name="prenom" defaultValue={v?.prenom ?? prenom} className="champ" autoComplete="given-name" required /></div>
        <div><label htmlFor="nom">Nom</label><input id="nom" name="nom" defaultValue={v?.nom ?? nom} className="champ" autoComplete="family-name" required /></div>
      </div>
      <p className="aide">Votre nom reste privé : il sert à la vérification d'identité et aux versements.</p>
      <label htmlFor="pseudo">Pseudo</label>
      <input id="pseudo" name="pseudo" defaultValue={v?.pseudo ?? pseudo} className="champ" autoComplete="username" required />
      <p className="aide">C'est lui qu'on voit sur vos annonces, et que vous écrirez sur la photo preuve.</p>
      <label className="choix"><input type="checkbox" name="cgu" defaultChecked={v?.cgu === 'on'} required /> <span>J'ai 18 ans ou plus, et j'accepte les <a className="lien-souligne" href="/cgu" target="_blank">conditions</a> et la <a className="lien-souligne" href="/confidentialite" target="_blank">politique de confidentialité</a>.</span></label>
      <Erreur e={etat.erreur} />
      <button className="btn btn-noir btn-large" type="submit" disabled={enCours}>{enCours ? 'Création…' : 'Créer mon compte'}</button>
    </form>
  );
}
