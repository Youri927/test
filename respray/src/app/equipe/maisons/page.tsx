import {eq, desc} from 'drizzle-orm';
import {db, schema} from '@/db';
import {normal, proprement} from '@/lib/regles';
import {traiterProposition} from '@/app/actions/equipe';

export const metadata = {title: 'Maisons et parfums proposés'};

export default async function Maisons({searchParams}: {searchParams: Promise<{attente?: string}>}) {
  const {attente} = await searchParams;
  const props = await db.select({p: schema.propositions, pseudo: schema.membres.pseudo}).from(schema.propositions).leftJoin(schema.membres, eq(schema.propositions.membreId, schema.membres.id)).where(eq(schema.propositions.statut, 'attente')).orderBy(desc(schema.propositions.creeLe));
  const maisons = await db.select().from(schema.maisons);
  const proche = (t: string) => maisons.find((m) => normal(m.nom) === normal(t) || normal(m.nom).replace(/\W/g, '') === normal(t).replace(/\W/g, '') || (normal(t).length > 4 && normal(m.nom).includes(normal(t))));
  return (
    <>
      <div className="bo-tete"><div><p className="surtitre">Catalogue</p><h1 className="bo-titre">Maisons et parfums proposés</h1></div></div>
      <p className="aide bo-intro">Quand un vendeur ne trouve pas sa maison ou son parfum, il l'écrit. Corrigez l'orthographe et les majuscules, puis ajoutez-le : les vendeurs suivants pourront le choisir. Une maison passe avant ses parfums.</p>
      {attente ? <p className="p-alerte">Ajoutez d'abord la maison de ce parfum.</p> : null}
      {props.length ? props.map(({p, pseudo}) => {
        const r = p.type === 'maison' ? proche(p.tape) : null;
        return (
          <article className="bo-carte bo-prop" key={p.id}>
            <div className="p-prop-tete"><span className="pastille">{p.type === 'maison' ? 'Maison' : 'Parfum'}</span><p className="aide">Proposé{p.type === 'maison' ? 'e' : ''} par @{pseudo}{p.maisonNom ? ` · maison ${p.maisonNom}` : ''}</p></div>
            <p className="p-tape">Tapé : <q>{p.tape}</q></p>
            {r ? <p className="p-ressemble">Ressemble à <strong>{r.nom}</strong>, déjà dans la liste.</p> : null}
            <form action={traiterProposition} className="bo-form-ligne">
              <input type="hidden" name="id" value={p.id} />
              <label className="vh" htmlFor={`n-${p.id}`}>Nom correct</label>
              <input id={`n-${p.id}`} name="nom" className="champ" defaultValue={r ? r.nom : proprement(p.tape)} />
              <input type="hidden" name="choix" value="ajouter" />
              <button className="btn btn-noir btn-petit" type="submit">{r ? 'Rattacher à ce nom' : 'Ajouter à la liste'}</button>
            </form>
            <form action={traiterProposition}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="choix" value="refuser" /><button className="btn btn-petit" type="submit">Refuser</button></form>
          </article>
        );
      }) : <div className="bo-vide"><p>Aucune proposition en attente.</p></div>}
    </>
  );
}
