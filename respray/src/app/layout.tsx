import type {Metadata, Viewport} from 'next';
import Link from 'next/link';
import './globals.css';
import './site.css';
import {Logo, Symbole} from '@/components/Logo';
import {moi} from '@/lib/auth';
import {deconnexion} from './actions/compte';
import {nonLues} from '@/lib/activite';
import {MenuCompte} from '@/components/MenuCompte';
import {Apparitions, BoutonTheme, SCRIPT_THEME} from '@/components/Ambiance';

export const metadata: Metadata = {
  title: {default: 'Respray', template: '%s · Respray'},
  description: 'Le parfum de seconde main, sans le doute : des annonces vérifiées par l\'équipe avant d\'être en ligne, un paiement bloqué, et 7 jours pour vérifier.',
};
export const viewport: Viewport = {width: 'device-width', initialScale: 1, viewportFit: 'cover'};

export default async function Racine({children}: {children: React.ReactNode}) {
  const m = await moi();
  const n = m ? await nonLues(m.id) : 0;
  return (
    <html lang="fr" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{__html: SCRIPT_THEME}} /></head>
      <body>
        <Apparitions />
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
              <Link href="/comment-ca-marche">Comment ça marche</Link>
              <Link href="/placard">Mon placard</Link>
              {m ? <Link href="/activite" className="nav-activite nav-garde" aria-label={n ? `Activité, ${n} nouveau${n > 1 ? 'x' : ''}` : 'Activité'}>Activité{n ? <b className="pastille-n">{n}</b> : null}</Link> : null}
              {m?.role === 'equipe' ? <Link href="/equipe">Équipe</Link> : null}
              {m ? null : <Link href="/connexion" className="nav-garde">Se connecter</Link>}
              <Link className="btn btn-noir btn-petit" href="/vendre">Vendre</Link>
              {m ? <MenuCompte prenom={m.prenom} pseudo={m.pseudo} equipe={m.role === 'equipe'} /> : null}
            </nav>
            <BoutonTheme />
          </div>
        </header>
        <main id="vue">{children}</main>
        <footer className="pied pied-signature">
          <div className="env pied-in">
            <div className="pied-cols">
              <div>
                <p className="pied-titre">Acheter</p>
                <Link href="/parfums">Tous les parfums</Link>
                <Link href="/guides/reconnaitre-un-faux-parfum">Reconnaître un faux</Link>
                <Link href="/guides/conserver-un-parfum">Conserver un parfum</Link>
                <Link href="/cote">La cote des parfums</Link>
              </div>
              <div>
                <p className="pied-titre">Vendre</p>
                <Link href="/vendre">Vendre un parfum</Link>
                <Link href="/fondateurs">Vendeur fondateur</Link>
                <Link href="/guides/combien-vendre-son-parfum">À combien le vendre</Link>
                <Link href="/guides/photographier-un-parfum-pour-le-vendre">Les 6 photos</Link>
                <Link href="/guides/emballer-un-parfum-pour-l-envoyer">Emballer un flacon</Link>
                <Link href="/placard">Combien vaut mon placard</Link>
              </div>
              <div>
                <p className="pied-titre">Respray</p>
                <Link href="/comment-ca-marche">Comment ça marche</Link>
                <Link href="/verification">Nos chiffres de vérification</Link>
                <Link href="/regles">Règles des annonces</Link>
                <Link href="/guides">Guides</Link>
                {m ? (
                  <form action={deconnexion}><button className="lien-bouton" type="submit">Se déconnecter</button></form>
                ) : (
                  <Link href="/inscription">Créer un compte</Link>
                )}
              </div>
            </div>
            <p className="pied-phrase">Le parfum de seconde main, sans le doute.</p>
          </div>
          {/* la signature : le logo en très grand, qui vaporise doucement */}
          <div className="env pied-geant" aria-hidden="true"><Logo className="logo-geant" /></div>
          <div className="env pied-bas"><Symbole className="symbole-mini" /><span>Vérifié avant d'être en ligne · 0 % de commission vendeur · 7 jours pour vérifier</span></div>
          <nav className="env pied-legal" aria-label="Informations légales"><Link href="/cgu">Conditions</Link><Link href="/confidentialite">Confidentialité</Link><Link href="/obligations-fiscales">Obligations fiscales</Link><Link href="/mentions-legales">Mentions légales</Link></nav>
        </footer>
      </body>
    </html>
  );
}
