import {FormNouveauMdp} from '@/components/FormulairesCompte';

export const metadata = {title: 'Nouveau mot de passe', robots: {index: false}};

export default async function NouveauMdp({searchParams}: {searchParams: Promise<{jeton?: string}>}) {
  const {jeton = ''} = await searchParams;
  return (
    <div className="env page page-etroite">
      <h1 className="titre-page">Nouveau mot de passe</h1>
      <p className="chapo">Choisissez votre nouveau mot de passe. Vous serez déconnecté de vos autres appareils.</p>
      <FormNouveauMdp jeton={jeton} />
    </div>
  );
}
