import {notFound} from 'next/navigation';
import {eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {exigerMembre} from '@/lib/auth';
import {simule} from '@/lib/envoi';

export const metadata = {title: 'Étiquette'};
export const dynamic = 'force-dynamic';

/* L'étiquette à imprimer. Simulée tant que le contrat Mondial Relay n'est pas signé ; ensuite, c'est le PDF de
   Mondial Relay. L'adresse de l'acheteur n'apparaît jamais : seulement son point relais. */
export default async function Etiquette({params}: {params: Promise<{id: string}>}) {
  const id = Number((await params).id);
  const m = await exigerMembre(`/commandes/${id}/etiquette`);
  const c = await db.query.commandes.findFirst({where: eq(schema.commandes.id, id)});
  if (!c || c.vendeurId !== m.id || !c.etiquette || !c.relais) notFound();
  const acheteur = await db.query.membres.findFirst({where: eq(schema.membres.id, c.acheteurId)});
  return (
    <div className="env page page-etroite">
      <div className="etiquette">
        {simule() ? <p className="etiquette-simu">SIMULATION · ne pas utiliser</p> : null}
        <p className="etiquette-marque">Mondial Relay · Point Relais®</p>
        <p className="etiquette-num">{c.etiquette}</p>
        <div className="etiquette-code" aria-hidden="true">{c.etiquette.split('').map((x, i) => <span key={i} style={{width: `${2 + (x.charCodeAt(0) % 4)}px`}} />)}</div>
        <dl>
          <div><dt>Destinataire</dt><dd>{acheteur?.prenom} {acheteur?.nom?.charAt(0)}.</dd></div>
          <div><dt>Point relais</dt><dd>{c.relais.nom}<br />{c.relais.adresse}<br />{c.relais.cp} {c.relais.ville}</dd></div>
          <div><dt>Commande</dt><dd>Respray n° {c.id}</dd></div>
        </dl>
      </div>
      <p className="aide">Imprimez cette page, découpez l'étiquette et collez-la à plat sur le colis.</p>
    </div>
  );
}
