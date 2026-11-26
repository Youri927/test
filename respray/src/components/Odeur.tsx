import Link from 'next/link';
import {classeFamille, moment} from '@/lib/odeur';
import {noteFr, familleFr, familleClasse, aPorter} from '@/lib/notes-fr';
import type {Senteur} from '@/lib/scento';

type Proche = {nom: string; maison: string; lien: string};

/* « À quoi il ressemble ». Avec Scento : la vraie pyramide (tête, cœur, fond), la famille, les saisons et les parfums
   proches avec leurs notes en commun, et la source. Sans : les notes du catalogue et les parfums proches du catalogue. */
export function Odeur({senteur, famille, notes, proches, liens = {}}: {senteur: Senteur | null; famille: string; notes: string; proches: Proche[]; liens?: Record<string, string>}) {
  if (senteur) {
    const etages: [string, string[]][] = senteur.tete?.length || senteur.coeur?.length || senteur.fond?.length ? [['Tête', senteur.tete ?? []], ['Cœur', senteur.coeur ?? []], ['Fond', senteur.fond ?? []]] : [['Notes', senteur.notes ?? []]];
    // la famille : celle de notre catalogue (la plus parlante), sinon celle de Scento
    const nomFamille = famille || familleFr(senteur.famille);
    return (
      <section className={`senteur ${famille ? classeFamille(famille) : familleClasse(senteur.famille)}`}>
        <h2 className="h3">À quoi il ressemble</h2>
        <p className="senteur-famille"><span className="senteur-pastille" aria-hidden="true" />{nomFamille}</p>
        <dl className="pyramide">
          {etages.filter(([, l]) => l.length).map(([t, l]) => (
            <div key={t}><dt>{t}</dt><dd><ul className="senteur-notes">{l.map((n) => <li key={n}>{noteFr(n)}</li>)}</ul></dd></div>
          ))}
        </dl>
        {senteur.saisons?.length ? <p className="aide">À porter : {aPorter(senteur.saisons, senteur.moments ?? [])}.</p> : null}
        {senteur.proches?.length ? (
          <div className="senteur-proches">
            <p>Si vous l'aimez, essayez aussi :</p>
            <ul>
              {senteur.proches.map((x) => (
                <li key={x.nom + x.maison}>
                  <Link className="lien-souligne" href={liens[`${x.maison}|${x.nom}`] ?? `/parfums?q=${encodeURIComponent(x.nom)}`}>{x.nom}</Link> <small>{x.maison}{x.communes.length ? ` · en commun : ${x.communes.map(noteFr).join(', ')}` : ''}</small>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <p className="senteur-source">Notes publiées par la maison, d'après <a className="lien-souligne" href={senteur.page} target="_blank" rel="noopener">Scento</a>.</p>
      </section>
    );
  }
  if (!famille && !notes) return null;
  return (
    <section className={`senteur ${classeFamille(famille)}`}>
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
