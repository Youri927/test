import {redirect} from 'next/navigation';
import {FormConnexion} from '@/components/FormulairesCompte';
import {moi} from '@/lib/auth';

export const metadata = {title: 'Se connecter'};

export default async function Page({searchParams}: {searchParams: Promise<{retour?: string}>}) {
  const {retour = '/compte'} = await searchParams;
  if (await moi()) redirect(retour);
  return (
    <div className="env page page-etroite">
      <h1 className="titre-page">Se connecter</h1>
      <FormConnexion retour={retour} />
    </div>
  );
}
