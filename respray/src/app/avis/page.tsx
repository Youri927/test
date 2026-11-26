import Link from 'next/link';
import {bilanGlobal, derniersAvis} from '@/lib/avis';
import {CarteAvis, NoteGlobale} from '@/components/AvisAcheteurs';
import {BlocTrustpilot} from '@/components/Trustpilot';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Avis des acheteurs',
  description: 'Les avis laissés sur Respray par des acheteurs qui ont reçu et vérifié leur parfum : un avis par achat, jamais trié.',
  alternates: {canonical: './'},
};

/* Tous les avis du site, du plus récent au plus ancien, sans tri par note : un avis par achat reçu et vérifié.
   Les avis sur Respray lui-même sont sur Trustpilot (lien en haut). */
export default async function Avis() {
  const [b, liste] = await Promise.all([bilanGlobal(), derniersAvis(60)]);
  return (
    <div className="env page page-avis">
      <header className="avis-entete">
        <div>
          <p className="surtitre">Avis</p>
          <h1 className="titre-page">Ce qu&apos;en disent les acheteurs</h1>
          <p className="chapo">Seuls les acheteurs qui ont reçu et vérifié leur commande peuvent laisser un avis, un par achat. On les affiche tous, du plus récent au plus ancien, sans les trier.</p>
        </div>
        <div className="avis-synthese">
          {b.n ? (
            <>
              <NoteGlobale moyenne={b.moyenne} n={b.n} />
              <ul className="avis-barres" aria-label="Répartition des notes">
                {b.repartition.map((r) => (
                  <li key={r.note}>
                    <span>{r.note} ★</span>
                    <span className="avis-barre"><span style={{width: `${b.n ? (r.n / b.n) * 100 : 0}%`}} /></span>
                    <span>{r.n}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : <p className="aide">Pas encore d&apos;avis : les premiers arrivent avec les premières ventes.</p>}
          <div className="avis-tp">
            <p className="aide">Et sur Respray lui-même, les avis sont publics sur Trustpilot.</p>
            <BlocTrustpilot />
          </div>
        </div>
      </header>

      {liste.length ? (
        <div className="avis-grille">{liste.map((a) => <CarteAvis key={a.id} a={a} />)}</div>
      ) : null}

      <p className="aide avis-pied"><Link className="lien-souligne" href="/comment-ca-marche">Comment Respray vérifie chaque annonce</Link></p>
    </div>
  );
}
