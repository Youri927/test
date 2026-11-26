import Link from 'next/link';
import {classeFamille, moment} from '@/lib/odeur';

/* « À quoi il ressemble » : la famille en couleur, les notes, le moment, et les parfums proches */
export function Odeur({famille, notes, proches}: {famille: string; notes: string; proches: {nom: string; maison: string; lien: string}[]}) {
  if (!famille && !notes) return null;
  const cl = classeFamille(famille);
  return (
    <section className={`senteur ${cl}`}>
      <h2 className="h3">À quoi il ressemble</h2>
      {famille ? <p className="senteur-famille"><span className="senteur-pastille" aria-hidden="true" />{famille}</p> : null}
      {notes ? <ul className="senteur-notes" aria-label="Notes">{notes.split(',').map((n) => <li key={n}>{n.trim()}</li>)}</ul> : null}
      <p className="aide">À porter : {moment(famille).toLowerCase()}.</p>
      {proches.length ? (
        <p className="senteur-proches">Si vous aimez {proches.map((p, i) => <span key={p.lien}>{i ? (i === proches.length - 1 ? ' ou ' : ', ') : ''}<Link className="lien-souligne" href={`/parfum/${p.lien}`}>{p.nom}</Link></span>)}, il a de bonnes chances de vous plaire : mêmes familles, notes en commun.</p>
      ) : null}
    </section>
  );
}
