import Link from 'next/link';
import {notFound} from 'next/navigation';
import {eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {exigerMembre} from '@/lib/auth';
import {simule} from '@/lib/envoi';
import {obtenirEtiquette} from '@/app/actions/commandes';

export const metadata = {title: 'Étiquette'};
export const dynamic = 'force-dynamic';

/* L'étiquette à imprimer. Avec Mondial Relay : le vendeur donne une fois son adresse d'expéditeur, puis télécharge le
   PDF prépayé. En simulation : une étiquette factice. L'adresse de l'acheteur n'apparaît jamais : seulement son nom
   et son point relais. */
export default async function Etiquette({params, searchParams}: {params: Promise<{id: string}>; searchParams: Promise<{erreur?: string}>}) {
  const id = Number((await params).id);
  const {erreur} = await searchParams;
  const m = await exigerMembre(`/commandes/${id}/etiquette`);
  const c = await db.query.commandes.findFirst({where: eq(schema.commandes.id, id)});
  if (!c || c.vendeurId !== m.id || c.mode !== 'relais' || !c.relais) notFound();

  if (!simule()) {
    if (c.etiquettePdf) {
      return (
        <div className="env page page-etroite">
          <p className="surtitre">Commande {c.id}</p>
          <h1 className="titre-page">Votre étiquette est prête</h1>
          <p className="chapo">Prépayée par Respray : vous n&apos;avez rien à payer. Suivi Mondial Relay : {c.etiquette}.</p>
          <a className="btn btn-noir btn-large" href={c.etiquettePdf} target="_blank" rel="noopener">Télécharger l&apos;étiquette (PDF)</a>
          <ol className="etapes-envoi">
            <li>Imprimez-la, découpez-la et collez-la à plat sur le dessus du colis, sans scotch sur le code-barres.</li>
            <li>Déposez le colis dans <strong>n&apos;importe quel</strong> point relais ou locker Mondial Relay. Gardez le reçu de dépôt.</li>
            <li>C&apos;est tout : l&apos;acheteur est prévenu automatiquement, et vous êtes payé dès qu&apos;il a vérifié le parfum.</li>
          </ol>
          <p className="aide">Pas d&apos;imprimante ? Certains points relais impriment l&apos;étiquette pour vous à partir du numéro de suivi : demandez au commerçant. <Link className="lien-souligne" href={`/commandes/${c.id}`}>Retour à la commande</Link></p>
        </div>
      );
    }
    if (c.statut !== 'payee') notFound();
    const e = m.expediteur;
    return (
      <div className="env page page-etroite">
        <p className="surtitre">Commande {c.id}</p>
        <h1 className="titre-page">Votre étiquette prépayée</h1>
        <p className="chapo">Mondial Relay demande l&apos;adresse de l&apos;expéditeur. Elle est imprimée sur l&apos;étiquette et sert en cas de retour : l&apos;acheteur ne la voit pas sur Respray. Vous ne la donnerez qu&apos;une fois.</p>
        {erreur === 'adresse' ? <p className="erreur" role="alert">Vérifiez l&apos;adresse : rue, code postal à 5 chiffres, ville, et un numéro de téléphone français.</p> : null}
        {erreur === 'mr' ? <p className="erreur" role="alert">Mondial Relay n&apos;a pas pu créer l&apos;étiquette. Vérifiez l&apos;adresse et réessayez ; si ça recommence, écrivez-nous à contact@respray.fr.</p> : null}
        <form action={obtenirEtiquette} className="formulaire compte-form">
          <input type="hidden" name="id" value={c.id} />
          <label htmlFor="nom">Nom et prénom</label>
          <input id="nom" name="nom" className="champ" autoComplete="name" defaultValue={e?.nom ?? `${m.prenom} ${m.nom}`.trim()} required />
          <label htmlFor="rue">Adresse</label>
          <input id="rue" name="rue" className="champ" autoComplete="street-address" defaultValue={e?.rue} placeholder="12 rue des Lilas" required />
          <div className="ligne-champs">
            <div><label htmlFor="cp">Code postal</label><input id="cp" name="cp" className="champ" inputMode="numeric" maxLength={5} autoComplete="postal-code" defaultValue={e?.cp} required /></div>
            <div><label htmlFor="ville">Ville</label><input id="ville" name="ville" className="champ" autoComplete="address-level2" defaultValue={e?.ville} required /></div>
          </div>
          <label htmlFor="tel">Téléphone</label>
          <input id="tel" name="tel" className="champ" type="tel" autoComplete="tel" defaultValue={e?.tel} placeholder="06 12 34 56 78" required />
          <p className="aide">Mondial Relay l&apos;utilise seulement en cas de souci avec le colis.</p>
          <button className="btn btn-noir btn-large" type="submit">Créer mon étiquette</button>
        </form>
        <p className="aide">Le colis part vers : {c.relais.nom}, {c.relais.cp} {c.relais.ville}.</p>
      </div>
    );
  }

  if (!c.etiquette) notFound();
  const acheteur = await db.query.membres.findFirst({where: eq(schema.membres.id, c.acheteurId)});
  return (
    <div className="env page page-etroite">
      <div className="etiquette">
        <p className="etiquette-simu">SIMULATION · ne pas utiliser</p>
        <p className="etiquette-marque">Mondial Relay · Point Relais®</p>
        <p className="etiquette-num">{c.etiquette}</p>
        <div className="etiquette-code" aria-hidden="true">{c.etiquette.split('').map((x, i) => <span key={i} style={{width: `${2 + (x.charCodeAt(0) % 4)}px`}} />)}</div>
        <dl>
          <div><dt>Destinataire</dt><dd>{acheteur?.prenom} {acheteur?.nom?.charAt(0)}.</dd></div>
          <div><dt>Point relais</dt><dd>{c.relais.nom}<br />{c.relais.adresse}<br />{c.relais.cp} {c.relais.ville}</dd></div>
          <div><dt>Commande</dt><dd>Respray n° {c.id}</dd></div>
        </dl>
      </div>
      <p className="aide">Imprimez cette page, découpez l&apos;étiquette et collez-la à plat sur le colis.</p>
    </div>
  );
}
