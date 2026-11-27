import {redirect} from 'next/navigation';
import {cookies} from 'next/headers';
import {FormInscription, BoutonGoogle} from '@/components/FormulairesCompte';
import {googleActif} from '@/lib/google';
import {moi} from '@/lib/auth';

export const metadata = {title: 'Créer un compte'};

export default async function Page({searchParams}: {searchParams: Promise<{retour?: string; parrain?: string}>}) {
  const {retour = '/compte', parrain} = await searchParams;
  const code = (parrain || (await cookies()).get('respray_parrain')?.value || '').replace(/[^A-Z0-9]/gi, '').slice(0, 12);
  if (await moi()) redirect(retour);
  return (
    <div className="env page page-etroite">
      <h1 className="titre-page">Créer un compte</h1>
      <p className="chapo">Pour vendre en six photos, et acheter avec 7 jours pour vérifier.</p>
      {code ? <p className="envie-ok">Vous êtes invité : la protection acheteur est offerte sur votre premier achat.</p> : null}
      {googleActif() ? <BoutonGoogle retour={retour} /> : null}
      <FormInscription retour={retour} parrain={code} />
    </div>
  );
}
