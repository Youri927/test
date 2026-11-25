import type {Metadata, Viewport} from 'next';
import Link from 'next/link';
import './globals.css';
import './site.css';
import {Logo} from '@/components/Logo';
import {moi} from '@/lib/auth';
import {deconnexion} from './actions/compte';

export const metadata: Metadata = {
  title: {default: 'Respray', template: '%s · Respray'},
  description: 'Le parfum de seconde main, sans le doute : des annonces vérifiées par l\'équipe avant d\'être en ligne, un paiement bloqué, et 7 jours pour vérifier.',
};
export const viewport: Viewport = {width: 'device-width', initialScale: 1, viewportFit: 'cover'};

export default async function Racine({children}: {children: React.ReactNode}) {
  const m = await moi();
  return (
    <html lang="fr">
      <body>
        <header className="entete">
          <div className="env entete-in">
            <Link className="logo" href="/" aria-label="Respray, accueil">
              <Logo />
            </Link>
            <form className="cherche" action="/parfums" role="search">
              <label className="vh" htmlFor="q-entete">Rechercher un parfum ou une maison</label>
              <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5 5" /></svg>
              <input id="q-entete" name="q" type="search" placeholder="Rechercher un parfum ou une maison" autoComplete="off" />
            </form>
            <nav className="nav" aria-label="Principale">
              <Link href="/parfums">Parfums</Link>
              {m ? <Link href="/compte">Mon compte</Link> : <Link href="/connexion">Se connecter</Link>}
              {m?.role === 'equipe' ? <Link href="/equipe">Équipe</Link> : null}
              <Link className="btn btn-noir btn-petit" href="/vendre">Vendre</Link>
            </nav>
          </div>
        </header>
        <main id="vue">{children}</main>
        <footer className="pied">
          <div className="env pied-in">
            <div>
              <Link className="logo" href="/" aria-label="Respray, accueil"><Logo /></Link>
              <p>Achetez et revendez vos parfums entre particuliers.</p>
            </div>
            <nav aria-label="Respray">
              <Link href="/parfums">Parfums</Link>
              <Link href="/vendre">Vendre</Link>
              <Link href="/guides">Guides</Link>
              <Link href="/fondateurs">Vendeur fondateur</Link>
              {m ? (
                <form action={deconnexion}><button className="lien-bouton" type="submit">Se déconnecter</button></form>
              ) : (
                <Link href="/inscription">Créer un compte</Link>
              )}
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
