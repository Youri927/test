import Link from 'next/link';
import {and, eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {exigerMembre} from '@/lib/auth';
import {eur} from '@/lib/regles';

export const metadata = {title: 'Annonce envoyée'};

export default async function Envoyee({searchParams}: {searchParams: Promise<{id?: string}>}) {
  const m = await exigerMembre('/compte');
  const {id} = await searchParams;
  const a = id ? await db.query.annonces.findFirst({where: and(eq(schema.annonces.id, Number(id)), eq(schema.annonces.vendeurId, m.id))}) : null;
  return (
    <div className="env page vendre">
      <div className="envoye">
        <span className="rond-ok">✓</span>
        <h1 className="titre-page">Annonce envoyée à la vérification</h1>
        {a ? <p className="chapo">{a.maisonNom}, {a.parfumNom}, {a.ml} ml, {eur(a.prix)}. L'équipe vérifie vos photos, en général en quelques heures. Vous suivez l'avancement dans votre compte.</p> : null}
        <p className="aide">Si une photo ne permet pas de vérifier le parfum, on vous dit laquelle refaire.</p>
        <div className="boutons"><Link className="btn btn-noir" href="/compte">Voir mes annonces</Link><Link className="btn" href="/vendre">Vendre un autre parfum</Link></div>
      </div>
    </div>
  );
}
