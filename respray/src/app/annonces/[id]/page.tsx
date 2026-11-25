import Link from 'next/link';
import {notFound} from 'next/navigation';
import {annonce} from '@/lib/annonces';
import {moi} from '@/lib/auth';
import {PHOTOS, protection, ENVOI, eur, eur2} from '@/lib/regles';

export const dynamic = 'force-dynamic';

export async function generateMetadata({params}: {params: Promise<{id: string}>}) {
  const a = await annonce(Number((await params).id));
  return {title: a ? `${a.parfumNom}, ${a.maisonNom}` : 'Annonce'};
}

/* une annonce publiée : les vraies photos du vendeur, ce qu'il a déclaré, le prix et la protection */
export default async function Annonce({params}: {params: Promise<{id: string}>}) {
  const a = await annonce(Number((await params).id));
  const m = await moi();
  // visible par tous une fois publiée ; avant, seulement par son vendeur et l'équipe
  if (!a || (a.statut !== 'publiee' && a.statut !== 'vendue' && m?.id !== a.vendeurId && m?.role !== 'equipe')) notFound();
  const d = a.details;
  const pr = protection(a.prix);
  const lignes: [string, string][] = [
    ['Concentration', a.conc],
    ['Format', `${d.format}, ${a.ml} ml`],
    ['État', a.etat === 'neuf' ? 'Neuf, jamais ouvert' : `Reste environ ${a.niveau} % (≈ ${Math.round((a.ml * a.niveau) / 100)} ml)`],
    ['Boîte', d.boite],
    ['Code lot', a.lot || 'Illisible'],
    ['Acheté', `${d.annee}, ${d.lieu.charAt(0).toLowerCase() + d.lieu.slice(1)}`],
    ['Rangé', `${d.lumiere === 'abri' ? 'à l\'abri de' : 'exposé à'} la lumière, ${d.chaleur === 'abri' ? 'à l\'abri de' : 'exposé à'} la chaleur`],
    ['Petits défauts', d.defauts.join(', ')],
  ];
  return (
    <div className="env page">
      <nav className="fil" aria-label="Fil d'Ariane"><Link href="/parfums">Parfums</Link><span aria-hidden="true">›</span><Link href={`/parfums?q=${encodeURIComponent(a.maisonNom)}`}>{a.maisonNom}</Link><span aria-hidden="true">›</span><span>{a.parfumNom}</span></nav>
      {a.statut !== 'publiee' ? <p className="p-alerte">Aperçu : cette annonce n'est pas en ligne ({a.statut}).</p> : null}
      <div className="annonce">
        <div className="galerie galerie-reelle">
          {PHOTOS.filter((p) => a.photos[p.k]).map((p, i) => (
            <figure key={p.k} className={i === 0 ? 'grande' : ''}>
              <a href={`/photos/${a.photos[p.k]}`} target="_blank" rel="noopener"><img className="visuel" src={`/photos/${a.photos[p.k]}`} alt={`${a.parfumNom} : ${p.t.toLowerCase()}`} /></a>
              <figcaption>{p.t}</figcaption>
            </figure>
          ))}
        </div>
        <div className="fiche">
          <p className="fiche-maison">{a.maisonNom}</p>
          <h1>{a.parfumNom}</h1>
          <p className="fiche-sous">{a.conc} · {a.ml} ml</p>
          <p className="fiche-prix">{eur(a.prix)}</p>
          <dl className="details">{lignes.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          {a.description ? <p className="fiche-desc">{a.description}</p> : null}
          <dl className="total">
            <div><dt>Parfum</dt><dd>{eur2(a.prix)}</dd></div>
            <div><dt>Protection acheteur</dt><dd>{eur2(pr)}</dd></div>
            <div><dt>Livraison en point relais</dt><dd>{eur2(ENVOI)}</dd></div>
            <div className="total-ligne"><dt>Total</dt><dd>{eur2(a.prix + pr + ENVOI)}</dd></div>
          </dl>
          <button className="btn btn-noir btn-large" type="button" disabled>Acheter · bientôt</button>
          <div className="protection"><h2>Protection acheteur</h2><p>Votre paiement reste bloqué jusqu'à ce que vous ayez vérifié le parfum. Vous avez <strong>7 jours après la livraison</strong> : s'il n'est pas conforme à l'annonce, vous êtes remboursé.</p></div>
          <p className="aide">Vendu par @{a.vendeur.pseudo}{a.mainPropre ? ` · remise en main propre possible à ${a.ville}` : ''}</p>
        </div>
      </div>
    </div>
  );
}
