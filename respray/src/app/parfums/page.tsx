import Link from 'next/link';
import {and, eq, ilike, or, lte, desc, asc, sql, inArray} from 'drizzle-orm';
import {db, schema} from '@/db';
import {completer} from '@/lib/annonces';
import {moi} from '@/lib/auth';
import {Carte} from '@/components/Carte';
import {FormEnvie} from '@/components/Envie';
import {tousLesParfums, lienParfum} from '@/lib/catalogue';
import {demande} from '@/lib/marche';
import {normal} from '@/lib/regles';

export const metadata = {title: 'Parfums'};
export const dynamic = 'force-dynamic';

type Q = {q?: string; maison?: string; genre?: string; etat?: string; prix?: string; tri?: string; envie?: string};

/* toutes les annonces en ligne, filtrées dans la base : texte, maison, genre, état, prix ; les annonces mises en
   avant passent devant tant que leur mise en avant dure */
export default async function Parfums({searchParams}: {searchParams: Promise<Q>}) {
  const f = await searchParams;
  const m = await moi();
  const conds = [eq(schema.annonces.statut, 'publiee')];
  const q = (f.q || '').trim();
  if (q) conds.push(or(ilike(schema.annonces.parfumNom, `%${q}%`), ilike(schema.annonces.maisonNom, `%${q}%`))!);
  if (f.maison) conds.push(eq(schema.annonces.maisonNom, f.maison));
  if (f.genre) conds.push(sql`${schema.annonces.details}->>'genre' = ${f.genre}`);
  if (f.etat === 'neuf' || f.etat === 'entame') conds.push(eq(schema.annonces.etat, f.etat));
  const pmax = Number(f.prix);
  if (pmax > 0) conds.push(lte(schema.annonces.prix, pmax));
  const enAvant = sql<number>`case when ${schema.annonces.miseEnAvant} = '7j' and ${schema.annonces.publieeLe} > now() - interval '7 days' then 1 when ${schema.annonces.miseEnAvant} = '3j' and ${schema.annonces.publieeLe} > now() - interval '3 days' then 1 else 0 end`;
  const ordre = f.tri === 'prix' ? [asc(schema.annonces.prix)] : f.tri === 'ml' ? [asc(sql`${schema.annonces.prix} / greatest(${schema.annonces.ml} * ${schema.annonces.niveau} / 100.0, 1)`)] : [desc(enAvant), desc(schema.annonces.publieeLe)];
  const liste = await completer(await db.select().from(schema.annonces).where(and(...conds)).orderBy(...ordre).limit(120));
  const maisons = await db.selectDistinct({nom: schema.annonces.maisonNom}).from(schema.annonces).where(eq(schema.annonces.statut, 'publiee')).orderBy(asc(schema.annonces.maisonNom));
  const favs = m && liste.length ? new Set((await db.select().from(schema.favoris).where(and(eq(schema.favoris.membreId, m.id), inArray(schema.favoris.annonceId, liste.map((a) => a.id))))).map((x) => x.annonceId)) : new Set<number>();
  // rien trouvé : les parfums du catalogue qui correspondent, combien de personnes les attendent, et « préviens-moi »
  const cherche = q && !liste.length ? (await tousLesParfums()).filter(({p, maison}) => normal(`${maison} ${p.nom}`).includes(normal(q)) || normal(p.nom).includes(normal(q))).slice(0, 6) : [];
  const dem = cherche.length ? await demande(cherche.map((x) => x.p.id)) : {};
  const mesEnvies = m ? (await db.select().from(schema.envies).where(eq(schema.envies.membreId, m.id))) : [];
  const retourIci = `/parfums?q=${encodeURIComponent(q)}`;
  const filtre = (k: keyof Q, v: string) => {
    const p = new URLSearchParams(Object.entries(f).filter(([, x]) => x) as [string, string][]);
    if (v) p.set(k, v);
    else p.delete(k);
    return `/parfums?${p}`;
  };
  return (
    <div className="env page">
      <h1 className="titre-page">{q ? `« ${q} »` : 'Parfums'}</h1>
      <p className="chapo">{liste.length} annonce{liste.length > 1 ? 's' : ''} en ligne{q ? '' : ', chacune vérifiée par l\'équipe'}.</p>
      <form className="recherche-filtres" action="/parfums">
        <input type="search" name="q" className="champ" defaultValue={q} placeholder="Un parfum, une maison…" aria-label="Rechercher" />
        <select name="maison" className="champ" defaultValue={f.maison || ''} aria-label="Maison"><option value="">Toutes les maisons</option>{maisons.map((x) => <option key={x.nom}>{x.nom}</option>)}</select>
        <select name="genre" className="champ" defaultValue={f.genre || ''} aria-label="Pour"><option value="">Pour tous</option><option>Femme</option><option>Homme</option><option>Mixte</option></select>
        <select name="etat" className="champ" defaultValue={f.etat || ''} aria-label="État"><option value="">Neufs et entamés</option><option value="neuf">Neufs</option><option value="entame">Entamés</option></select>
        <input name="prix" className="champ" inputMode="numeric" defaultValue={f.prix || ''} placeholder="Prix max (€)" aria-label="Prix maximum" />
        <select name="tri" className="champ" defaultValue={f.tri || ''} aria-label="Trier"><option value="">Les plus récentes</option><option value="prix">Prix croissant</option><option value="ml">Prix au millilitre</option></select>
        <button className="btn btn-noir" type="submit">Filtrer</button>
      </form>
      {f.maison || f.genre || f.etat || f.prix || q ? <p className="aide"><Link className="lien-souligne" href="/parfums">Effacer les filtres</Link>{f.maison ? <> · <Link className="lien-souligne" href={filtre('maison', '')}>sans « {f.maison} »</Link></> : null}</p> : null}
      {liste.length ? (
        <div className="grille resultats">{liste.map((a) => <Carte key={a.id} a={a} favori={favs.has(a.id)} connecte={!!m} />)}</div>
      ) : q ? (
        <div className="vide-demande">
          <h2 className="h2">Personne ne le vend encore.</h2>
          {f.envie === 'ok' ? <p className="envie-ok">✓ C'est noté : vous serez prévenu dans votre activité dès qu'une annonce vérifiée arrive.</p> : null}
          {cherche.length ? (
            <ul className="demande-liste">
              {cherche.map(({p, maison}) => {
                const n = (dem[p.id] || 0);
                const deja = mesEnvies.some((e) => e.parfumId === p.id);
                return (
                  <li key={p.id}>
                    <div><Link className="lien-souligne" href={`/parfum/${lienParfum(maison, p.nom)}`}><strong>{p.nom}</strong></Link><small>{maison}</small>
                      <span className="demande-mini">{n ? `${n} personne${n > 1 ? 's le cherchent' : ' le cherche'} déjà` : 'Soyez le premier à le chercher'}</span></div>
                    <div className="demande-actions">
                      <FormEnvie parfumId={p.id} retour={retourIci} connecte={!!m} deja={deja} libelle="Me prévenir" />
                      <Link className="btn" href={`/vendre`}>Je l'ai : le vendre</Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="bientot">
              <p className="aide">« {q} » n'est pas encore dans le catalogue. Laissez-le dans votre liste d'envies : on vous prévient dès qu'une annonce qui y correspond est vérifiée.</p>
              <FormEnvie texte={q} retour={retourIci} connecte={!!m} deja={mesEnvies.some((e) => normal(e.texte) === normal(q))} libelle={`Me prévenir pour « ${q} »`} />
              <p className="aide">Vous l'avez ? <Link className="lien-souligne" href="/vendre">Vendez-le sans commission</Link> : l'équipe l'ajoutera au catalogue.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bientot"><h3>Rien pour l'instant.</h3><p className="aide">Les annonces arrivent chaque jour. Essayez sans filtre, ou revenez bientôt.</p></div>
      )}
    </div>
  );
}
