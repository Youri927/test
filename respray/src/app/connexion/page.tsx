import {redirect} from 'next/navigation';
import {FormConnexion, BoutonGoogle} from '@/components/FormulairesCompte';
import {googleActif} from '@/lib/google';
import {moi} from '@/lib/auth';

export const metadata = {title: 'Se connecter'};

export default async function Page({searchParams}: {searchParams: Promise<{retour?: string; erreur?: string}>}) {
  const {retour = '/compte', erreur} = await searchParams;
  if (await moi()) redirect(retour);
  return (
    <div className="env page page-etroite">
      <h1 className="titre-page">Se connecter</h1>
      {erreur ? <p className="erreur" role="alert">{erreur === 'ferme' ? 'Ce compte a été fermé.' : 'La connexion avec Google n\'a pas abouti. Réessayez, ou utilisez votre adresse e-mail.'}</p> : null}
      {googleActif() ? <BoutonGoogle retour={retour} /> : null}
      <FormConnexion retour={retour} />
    </div>
  );
}
