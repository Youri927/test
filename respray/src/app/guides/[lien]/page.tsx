import Link from 'next/link';
import {notFound} from 'next/navigation';
import {GUIDES} from '@/lib/guides';

export const generateStaticParams = () => GUIDES.map((g) => ({lien: g.lien}));
export async function generateMetadata({params}: {params: Promise<{lien: string}>}) {
  const {lien} = await params;
  const g = GUIDES.find((x) => x.lien === lien);
  return g ? {title: g.titre, description: g.resume} : {};
}

export default async function Guide({params}: {params: Promise<{lien: string}>}) {
  const {lien} = await params;
  const g = GUIDES.find((x) => x.lien === lien);
  if (!g) notFound();
  // la FAQ, lisible par Google (FAQPage)
  const ld = {'@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: g.faq.map(([q, r]) => ({'@type': 'Question', name: q, acceptedAnswer: {'@type': 'Answer', text: r}}))};
  return (
    <article className="env page guide">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(ld).replace(/</g, '\\u003c')}} />
      <nav className="fil" aria-label="Fil d'Ariane"><Link href="/guides">Guides</Link><span aria-hidden="true">›</span><span>{g.titre}</span></nav>
      <h1 className="titre-page">{g.titre}</h1>
      <p className="chapo">{g.resume}</p>
      {g.sections.map((s) => <section key={s.t}><h2 className="h2">{s.t}</h2>{s.p.map((x) => <p key={x}>{x}</p>)}</section>)}
      <section><h2 className="h2">Questions fréquentes</h2>{g.faq.map(([q, r]) => <details key={q}><summary>{q}</summary><p>{r}</p></details>)}</section>
      <Link className="btn btn-noir btn-large" href={g.action.href}>{g.action.texte}</Link>
    </article>
  );
}
