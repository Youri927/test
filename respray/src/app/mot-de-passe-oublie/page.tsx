import Link from 'next/link';
import {FormOubli} from '@/components/FormulairesCompte';

export const metadata = {title: 'Mot de passe oublié'};

export default function Oubli() {
  return (
    <div className="env page page-etroite">
      <h1 className="titre-page">Mot de passe oublié</h1>
      <p className="chapo">Indiquez l'adresse de votre compte : vous recevez un lien pour choisir un nouveau mot de passe, valable une heure.</p>
      <FormOubli />
      <p className="aide"><Link className="lien-souligne" href="/connexion">Retour à la connexion</Link></p>
    </div>
  );
}
