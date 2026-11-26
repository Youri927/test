import Link from 'next/link';
import {eq, inArray} from 'drizzle-orm';
import {db, schema} from '@/db';
import {exigerEquipe} from '@/lib/auth';

export const dynamic = 'force-dynamic';

/* l'espace de l'équipe : une navigation à gauche, le travail à droite */
export default async function Equipe({children}: {children: React.ReactNode}) {
  const e = await exigerEquipe();
  const attente = await db.$count(schema.annonces, eq(schema.annonces.statut, 'attente'));
  const props = await db.$count(schema.propositions, eq(schema.propositions.statut, 'attente'));
  const enLigne = await db.$count(schema.annonces, inArray(schema.annonces.statut, ['publiee']));
  const cands = await db.$count(schema.candidatures, eq(schema.candidatures.statut, 'nouvelle'));
  const litiges = await db.$count(schema.commandes, eq(schema.commandes.statut, 'litige'));
  const nav: [string, string, number][] = [
    ['/equipe', 'Annonces à vérifier', attente],
    ['/equipe/en-ligne', 'En ligne', enLigne],
    ['/equipe/commandes', 'Commandes et litiges', litiges],
    ['/equipe/maisons', 'Maisons et parfums proposés', props],
    ['/equipe/fondateurs', 'Vendeurs fondateurs', cands],
    ['/equipe/membres', 'Membres', 0],
    ['/equipe/journal', 'Journal', 0],
    ['/equipe/emails', 'E-mails', 0],
  ];
  return (
    <div className="bo bo-reel">
      <aside className="bo-cote">
        <p className="bo-marque"><span>Équipe</span></p>
        <nav className="bo-nav" aria-label="Équipe">
          {nav.map(([h, t, n]) => (
            <Link key={h} href={h}><span>{t}</span>{n ? <b className="bo-compte">{n}</b> : null}</Link>
          ))}
        </nav>
        <div className="bo-pied"><p className="bo-lien-etat">Connecté : {e.prenom} (@{e.pseudo})</p></div>
      </aside>
      <div className="bo-main"><div className="bo-contenu">{children}</div></div>
    </div>
  );
}
