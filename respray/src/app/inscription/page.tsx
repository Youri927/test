import {redirect} from 'next/navigation';
import {FormInscription} from '@/components/FormulairesCompte';
import {moi} from '@/lib/auth';

export const metadata = {title: 'Créer un compte'};

export default async function Page({searchParams}: {searchParams: Promise<{retour?: string}>}) {
  const {retour = '/compte'} = await searchParams;
  if (await moi()) redirect(retour);
  return (
    <div className="env page page-etroite">
      <h1 className="titre-page">Créer un compte</h1>
      <p className="chapo">Pour vendre sans commission, et acheter avec 7 jours pour vérifier.</p>
      <FormInscription retour={retour} />
    </div>
  );
}
