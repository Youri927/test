import Link from 'next/link';
import {notFound} from 'next/navigation';
import {and, desc, eq, inArray} from 'drizzle-orm';
import {db, schema} from '@/db';
import {moi} from '@/lib/auth';
import {completer} from '@/lib/annonces';
import {chiffres, notesDe, etoiles} from '@/lib/avis';
import {Carte} from '@/components/Carte';
import {repondreAvis, signalerAvis} from '@/app/actions/avis';

export const dynamic = 'force-dynamic';

const vendeurDe = (pseudo: string) => db.query.membres.findFirst({where: eq(schema.membres.pseudo, decodeURIComponent(pseudo).toLowerCase())});

export async function generateMetadata({params}: {params: Promise<{pseudo: string}>}) {
  const v = await vendeurDe((await params).pseudo);
  if (!v || v.statut === 'exclu') return {title: 'Vendeur', robots: {index: false}};
  return {title: `@${v.pseudo}, vendeur sur Respray`, description: `Les annonces vérifiées, les ventes et les avis de @${v.pseudo} sur Respray, le parfum de seconde main sans le doute.`};
}

const mois = new Intl.DateTimeFormat('fr-FR', {month: 'long', year: 'numeric'});
const jour = new Intl.DateTimeFormat('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'});

/* le profil public d'un vendeur : ses chiffres, ses annonces en ligne, ses avis (de vrais acheteurs uniquement) */
export default async function Vendeur({params, searchParams}: {params: Promise<{pseudo: string}>; searchParams: Promise<{signale?: string}>}) {
  const v = await vendeurDe((await params).pseudo);
  if (!v || v.statut === 'exclu') notFound();
  const q = await searchParams;
  const m = await moi();
  const [c, notes, enLigne] = await Promise.all([
    chiffres(v.id),
    notesDe([v.id]),
    db.select().from(schema.annonces).where(and(eq(schema.annonces.vendeurId, v.id), eq(schema.annonces.statut, 'publiee'))).orderBy(desc(schema.annonces.publieeLe)),
  ]);
  const annonces = await completer(enLigne);
  const note = notes[v.id];
  const liste = await db.select().from(schema.avis).where(and(eq(schema.avis.vendeurId, v.id), eq(schema.avis.masque, false))).orderBy(desc(schema.avis.creeLe));
  const acheteurs = liste.length ? await db.select({id: schema.membres.id, pseudo: schema.membres.pseudo}).from(schema.membres).where(inArray(schema.membres.id, liste.map((a) => a.acheteurId))) : [];
  const achats = liste.length ? await completer(await db.select().from(schema.annonces).where(inArray(schema.annonces.id, liste.map((a) => a.annonceId)))) : [];
  const delai = c.delaiHeures === null ? null : c.delaiHeures < 24 ? 'moins de 24 h' : `${Math.round(c.delaiHeures / 24)} jour${Math.round(c.delaiHeures / 24) > 1 ? 's' : ''}`;

  return (
    <div className="env page profil">
      <header className="profil-tete">
        <span className="profil-avatar" aria-hidden="true">{v.pseudo.charAt(0).toUpperCase()}</span>
        <div>
          <h1 className="titre-page">@{v.pseudo}</h1>
          <p className="chapo">
            {v.fondateur ? <span className="badge-fondateur">Vendeur fondateur</span> : null}
            Membre depuis {mois.format(v.creeLe)}{v.ville ? ` · ${v.ville}` : ''}
          </p>
          <p className="profil-note">{note ? <><span className="etoiles" aria-hidden="true">{etoiles(note.moyenne)}</span> <strong>{note.moyenne.toLocaleString('fr-FR')}</strong> · <a href="#avis">{note.n} avis</a></> : 'Pas encore d\'avis'}</p>
        </div>
      </header>

      <div className="profil-chiffres">
        <div><strong>{c.ventes}</strong><span>vente{c.ventes > 1 ? 's' : ''} réussie{c.ventes > 1 ? 's' : ''}</span></div>
        <div><strong>{annonces.length}</strong><span>annonce{annonces.length > 1 ? 's' : ''} en ligne</span></div>
        {delai ? <div><strong>{delai}</strong><span>pour envoyer, en moyenne</span></div> : null}
        {c.sansLitige !== null ? <div><strong>{c.sansLitige} %</strong><span>des ventes sans litige</span></div> : null}
      </div>

      <section className="section">
        <h2 className="h2">En ligne</h2>
        {annonces.length ? <div className="grille resultats">{annonces.map((a) => <Carte key={a.id} a={a} connecte={!!m} />)}</div> : <p className="aide">Aucune annonce en ligne pour l&apos;instant.</p>}
      </section>

      <section className="section" id="avis">
        <h2 className="h2">Avis{note ? ` · ${note.n}` : ''}</h2>
        <p className="aide">Seuls les acheteurs qui ont reçu et vérifié leur commande peuvent laisser un avis : un par achat.</p>
        {q.signale ? <p className="envie-ok" role="status">✓ Merci : l&apos;équipe va regarder cet avis.</p> : null}
        {liste.length ? (
          <ul className="avis-liste">
            {liste.map((a) => {
              const achat = achats.find((x) => x.id === a.annonceId);
              const auteur = acheteurs.find((x) => x.id === a.acheteurId)?.pseudo ?? 'un acheteur';
              return (
                <li key={a.id} id={`avis-${a.id}`} className="avis">
                  <div className="avis-tete">
                    <span className="etoiles" aria-label={`${a.note} sur 5`}>{etoiles(a.note)}</span>
                    <span className="avis-qui">@{auteur} · {jour.format(a.creeLe)}</span>
                  </div>
                  {achat ? (
                    <p className="avis-achat">
                      {achat.photos.face ? <img src={`/photos/${achat.photos.face}`} alt="" /> : null}
                      <span>A acheté <strong>{achat.parfumNom}</strong> · {achat.maisonNom}, {achat.ml} ml</span>
                    </p>
                  ) : null}
                  {a.texte ? <p className="avis-texte">{a.texte}</p> : null}
                  {a.reponse ? <p className="avis-reponse"><strong>Réponse de @{v.pseudo}</strong>{a.reponse}</p> : null}
                  {m?.id === v.id && !a.reponse ? (
                    <form action={repondreAvis} className="avis-repondre">
                      <input type="hidden" name="avisId" value={a.id} />
                      <label className="vh" htmlFor={`rep-${a.id}`}>Votre réponse</label>
                      <textarea id={`rep-${a.id}`} name="reponse" className="champ" rows={2} maxLength={600} placeholder="Répondre publiquement (une seule fois)" required />
                      <button className="btn btn-petit" type="submit">Répondre</button>
                    </form>
                  ) : null}
                  {m && m.id !== v.id && m.id !== a.acheteurId && !a.signale ? (
                    <form action={signalerAvis} className="avis-signaler"><input type="hidden" name="avisId" value={a.id} /><button className="lien-bouton" type="submit">Signaler</button></form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : <p className="aide">Pas encore d&apos;avis : les premiers arrivent après les premières ventes.</p>}
      </section>
      <p className="aide"><Link className="lien-souligne" href="/comment-ca-marche">Comment Respray vérifie chaque annonce</Link></p>
    </div>
  );
}
