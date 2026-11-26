import Link from 'next/link';
import {and, eq, gt, inArray, isNotNull} from 'drizzle-orm';
import {db, schema} from '@/db';
import {CONTROLES} from '@/lib/regles';
import {Bouclier} from '@/components/Bouclier';

export const metadata = {
  title: 'Nos chiffres de vérification',
  description: 'Combien d\'annonces l\'équipe Respray a vérifiées, publiées et refusées ces 30 derniers jours, et pourquoi. Une vérification qui ne refuse rien ne prouve rien.',
};
export const dynamic = 'force-dynamic';

const duree = (ms: number) => {
  const h = Math.floor(ms / 36e5);
  const min = Math.round((ms % 36e5) / 6e4);
  return h ? `${h} h ${String(min).padStart(2, '0')}` : min ? `${min} min` : 'moins d\'1 min';
};

/* La transparence : ce que l'équipe a publié, ce qu'elle a refusé et pourquoi, sur les 30 derniers jours. C'est la
   meilleure preuve que la vérification est réelle, et elle ne dépend d'aucun visage. */
export default async function Verification() {
  const depuis = new Date(Date.now() - 30 * 864e5);
  const j = await db.select().from(schema.journal).where(and(gt(schema.journal.creeLe, depuis), inArray(schema.journal.action, ['annonce_publiee', 'annonce_refusee', 'photo_demandee'])));
  const n = (a: string) => j.filter((x) => x.action === a).length;
  const publiees = n('annonce_publiee');
  const refusees = n('annonce_refusee');
  const photos = n('photo_demandee');
  const decisions = publiees + refusees;
  const idsRefus = j.filter((x) => x.action === 'annonce_refusee').map((x) => Number(x.cible.split(':')[1])).filter(Boolean);
  const refus = idsRefus.length ? await db.select({raison: schema.annonces.raison}).from(schema.annonces).where(inArray(schema.annonces.id, idsRefus)) : [];
  const raisons = Object.entries(refus.reduce<Record<string, number>>((o, r) => ({...o, [r.raison || 'Autre']: (o[r.raison || 'Autre'] || 0) + 1}), {})).sort((a, b) => b[1] - a[1]);
  const delais = (await db.select({c: schema.annonces.creeLe, p: schema.annonces.publieeLe}).from(schema.annonces).where(and(isNotNull(schema.annonces.publieeLe), gt(schema.annonces.publieeLe, depuis)))).map((x) => x.p!.getTime() - x.c.getTime()).sort((a, b) => a - b);
  const median = delais.length ? delais[Math.floor(delais.length / 2)] : null;
  const enLigne = await db.$count(schema.annonces, eq(schema.annonces.statut, 'publiee'));
  return (
    <div className="env page">
      <div className="verif-tete">
        <Bouclier taille={120} />
        <div>
          <p className="surtitre">Transparence</p>
          <h1 className="titre-page">Une vérification qui ne refuse rien ne prouve rien.</h1>
          <p className="chapo">Alors voici nos chiffres des 30 derniers jours : ce que l'équipe a publié, ce qu'elle a refusé, et pourquoi. Mis à jour en continu, directement depuis le journal de l'équipe.</p>
        </div>
      </div>
      {decisions ? (
        <div className="verif-chiffres">
          <div><strong>{decisions}</strong><span>annonces examinées</span></div>
          <div className="ok"><strong>{publiees}</strong><span>publiées</span></div>
          <div className="refus"><strong>{refusees}</strong><span>refusées, soit {Math.round((refusees / decisions) * 100)} %</span></div>
          <div><strong>{photos}</strong><span>photos redemandées avant de décider</span></div>
          {median !== null ? <div><strong>{duree(median)}</strong><span>entre l'envoi d'une annonce et sa publication, en temps médian</span></div> : null}
          <div><strong>{enLigne}</strong><span>annonces vérifiées en ligne aujourd'hui</span></div>
        </div>
      ) : (
        <div className="bientot"><h3>Les premiers chiffres arrivent avec les premières annonces.</h3><p className="aide">Dès que l'équipe aura publié ou refusé ses premières annonces, ils s'afficheront ici, sans retouche.</p></div>
      )}
      {raisons.length ? (
        <section className="section">
          <h2 className="h2">Pourquoi on a refusé</h2>
          <ul className="raisons">{raisons.map(([r, k]) => <li key={r}><span>{r}</span><b>{k}</b></li>)}</ul>
        </section>
      ) : null}
      <section className="section">
        <h2 className="h2">Ce que l'équipe vérifie, sur chaque annonce</h2>
        <ol className="verif-controles">{CONTROLES.map((c) => <li key={c}>{c}</li>)}</ol>
        <p className="aide">Puis vous avez 7 jours, flacon en main, pour vérifier à votre tour : l'argent reste bloqué jusque-là. <Link className="lien-souligne" href="/guides/reconnaitre-un-faux-parfum">Comment reconnaître un faux</Link></p>
      </section>
    </div>
  );
}
