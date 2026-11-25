import Link from 'next/link';
import {Symbole} from '@/components/Logo';

export default function Introuvable() {
  return (
    <div className="env page vide-flacon">
      <Symbole />
      <h1 className="titre-page">Ce flacon est vide.</h1>
      <p className="chapo">La page que vous cherchez n'existe pas, ou l'annonce n'est plus en ligne.</p>
      <div className="boutons"><Link className="btn btn-noir" href="/parfums">Voir les parfums</Link><Link className="btn" href="/">Accueil</Link></div>
    </div>
  );
}
