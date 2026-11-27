import Link from 'next/link';
import {FormFondateur} from '@/components/FormulairesCompte';

export const metadata = {
  title: 'Vendeur fondateur',
  description: 'Les premiers vendeurs de Respray : badge fondateur, 5 mises en avant offertes, vérification prioritaire, aide pour les photos et 0 % de commission à vie.',
};

const AVANTAGES = [
  ['Le badge fondateur', 'Sur votre profil et sur chacune de vos annonces, pour toujours.'],
  ['5 mises en avant offertes', 'Vos annonces en tête des résultats, sans rien payer.'],
  ['Une vérification prioritaire', 'Vos annonces passent en premier dans la file de l\'équipe.'],
  ['De l\'aide pour les photos', 'Un guide pas à pas, et une réponse rapide si une photo coince.'],
  ['0 % de commission, à vie', 'Les autres vendeurs paient 5 %. Vous, jamais : vous touchez 100 % du prix, pour toutes vos ventes.'],
];

/* les premiers vendeurs : on ouvre la vente avant l'achat, pour que le site soit plein le jour de l'ouverture */
export default function Fondateurs() {
  return (
    <div className="env page fondateurs">
      <p className="surtitre">Avant l'ouverture</p>
      <h1 className="accueil-titre">Vos parfums qui dorment ont de la valeur. Soyez les premiers à les vendre.</h1>
      <p className="chapo">Respray ouvre d'abord aux vendeurs. Les premiers ont des avantages qu'on ne refera pas.</p>
      <div className="fondateurs-grille">
        <ul className="fondateurs-avantages">{AVANTAGES.map(([t, d]) => <li key={t}><strong>{t}</strong><span>{d}</span></li>)}</ul>
        <div className="fondateurs-form"><h2 className="h2">Je veux en être</h2><FormFondateur /><p className="aide">Déjà un compte ? <Link className="lien-souligne" href="/vendre">Vendre un parfum</Link></p></div>
      </div>
    </div>
  );
}
