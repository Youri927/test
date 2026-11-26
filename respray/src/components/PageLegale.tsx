import Link from 'next/link';
import {MAJ} from '@/lib/legal';

export type Section = {id: string; t: string; c: React.ReactNode};

/* la mise en page commune des pages légales : un sommaire, des sections numérotées, la date de mise à jour */
export function PageLegale({surtitre, titre, intro, sections}: {surtitre: string; titre: string; intro: React.ReactNode; sections: Section[]}) {
  return (
    <div className="env page legal">
      <p className="surtitre">{surtitre}</p>
      <h1 className="titre-page">{titre}</h1>
      <div className="chapo">{intro}</div>
      <p className="aide">Mise à jour : {MAJ}.</p>
      <nav className="legal-sommaire" aria-label="Sommaire">
        <ol>{sections.map((s, i) => <li key={s.id}><a href={`#${s.id}`}>{i + 1}. {s.t}</a></li>)}</ol>
      </nav>
      {sections.map((s, i) => (
        <section key={s.id} id={s.id} className="legal-section">
          <h2 className="h2">{i + 1}. {s.t}</h2>
          {s.c}
        </section>
      ))}
      <p className="aide legal-pied">Une question sur ces conditions ? Écrivez-nous : <a className="lien-souligne" href="mailto:contact@respray.fr">contact@respray.fr</a>. Voir aussi : <Link className="lien-souligne" href="/cgu">conditions</Link> · <Link className="lien-souligne" href="/regles">règles des annonces</Link> · <Link className="lien-souligne" href="/confidentialite">confidentialité</Link> · <Link className="lien-souligne" href="/obligations-fiscales">obligations fiscales</Link> · <Link className="lien-souligne" href="/mentions-legales">mentions légales</Link></p>
    </div>
  );
}
