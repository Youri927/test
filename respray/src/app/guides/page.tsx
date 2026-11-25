import Link from 'next/link';
import {GUIDES} from '@/lib/guides';

export const metadata = {title: 'Guides', description: 'Reconnaître un faux parfum, trouver le code lot, photographier et vendre son parfum d\'occasion, le conserver.'};

export default function Guides() {
  return (
    <div className="env page">
      <p className="surtitre">Guides</p>
      <h1 className="titre-page">Acheter et vendre un parfum de seconde main, sans se tromper</h1>
      <ul className="guides-liste">{GUIDES.map((g) => <li key={g.lien}><Link href={`/guides/${g.lien}`}><strong>{g.titre}</strong><span>{g.resume}</span></Link></li>)}</ul>
    </div>
  );
}
