import Link from 'next/link';
import {notFound} from 'next/navigation';
import {eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {exigerMembre} from '@/lib/auth';
import {synchroniser, DELAI_VERIF} from '@/lib/commandes';
import {simule} from '@/lib/envoi';
import {eur, eur2} from '@/lib/regles';
import {deposer, simulerArrivee, annulerParVendeur, confirmerReception, signalerProbleme} from '@/app/actions/commandes';
import {FormCode} from '@/components/Commande';
import {Bouclier} from '@/components/Bouclier';

export const metadata = {title: 'Commande'};
export const dynamic = 'force-dynamic';

const jour = new Intl.DateTimeFormat('fr-FR', {weekday: 'long', day: 'numeric', month: 'long'});
const court = new Intl.DateTimeFormat('fr-FR', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});
const PROBLEMES = ['Ce n\'est pas le parfum de l\'annonce', 'Je pense que c\'est une contrefaçon', 'Il en reste moins qu\'annoncé', 'Le flacon est cassé ou abîmé', 'Le colis n\'est jamais arrivé', 'Autre problème'];

/* une commande : où elle en est, et ce que chacun peut faire maintenant */
export default async function CommandePage({params, searchParams}: {params: Promise<{id: string}>; searchParams: Promise<{paye?: string}>}) {
  const id = Number((await params).id);
  const q = await searchParams;
  const m = await exigerMembre(`/commandes/${id}`);
  let c = await db.query.commandes.findFirst({where: eq(schema.commandes.id, id)});
  if (!c || (c.acheteurId !== m.id && c.vendeurId !== m.id && m.role !== 'equipe')) notFound();
  if (c.statut === 'attente_paiement') c = (await synchroniser(c.id).catch(() => c)) ?? c;
  const a = (await db.query.annonces.findFirst({where: eq(schema.annonces.id, c.annonceId)}))!;
  const vendeur = c.vendeurId === m.id;
  const acheteur = c.acheteurId === m.id;
  const autre = await db.query.membres.findFirst({where: eq(schema.membres.id, vendeur ? c.acheteurId : c.vendeurId)});
  const moiV = vendeur ? await db.query.membres.findFirst({where: eq(schema.membres.id, m.id)}) : null;

  const etapes: [string, Date | null][] =
    c.mode === 'relais'
      ? [['Payée', c.payeeLe], ['Déposée au point relais', c.expedieeLe], ['Arrivée au point relais', c.livreeLe], ['Vérifiée par l\'acheteur', c.confirmeeLe], ['Versée au vendeur', c.verseeLe]]
      : [['Payée', c.payeeLe], ['Remise en main propre', c.livreeLe], ['Versée au vendeur', c.verseeLe]];
  const fini = ['annulee', 'remboursee'].includes(c.statut);

  return (
    <div className="env page page-etroite">
      <nav className="fil" aria-label="Fil d'Ariane"><Link href="/commandes">Mes commandes</Link><span aria-hidden="true">›</span><span>Commande {c.id}</span></nav>
      <h1 className="titre-page">{a.parfumNom}</h1>
      <p className="chapo">{a.maisonNom} · {a.ml} ml · {vendeur ? `vendu à @${autre?.pseudo}` : `vendu par @${autre?.pseudo}`} · <Link className="lien-souligne" href={`/messages/${a.id}${vendeur ? `?avec=${c.acheteurId}` : ''}`}>{vendeur ? 'écrire à l\'acheteur' : 'écrire au vendeur'}</Link></p>

      {q.paye && c.statut === 'payee' && acheteur ? <p className="offre-ok">Paiement reçu, merci. L'argent reste bloqué jusqu'à ce que vous ayez vérifié le parfum.</p> : null}
      {c.statut === 'attente_paiement' ? <p className="p-alerte">Paiement en cours de confirmation… Rechargez la page dans quelques secondes.</p> : null}
      {c.statut === 'annulee' ? <p className="p-alerte">Commande annulée{c.remboursementId ? ' et remboursée en entier' : ''}.</p> : null}
      {c.statut === 'remboursee' ? <p className="p-alerte">Litige tranché : l'acheteur est remboursé en entier. {c.litige?.decision}</p> : null}

      {!fini ? (
        <ol className="suivi">
          {etapes.map(([t, d], i) => {
            const fait = !!d;
            const enCours = !fait && (i === 0 || !!etapes[i - 1][1]);
            return <li key={t} className={fait ? 'fait' : enCours ? 'en-cours' : ''}><span aria-hidden="true">{fait ? '✓' : i + 1}</span><div><strong>{t}</strong>{d ? <small>{court.format(d)}</small> : null}</div></li>;
          })}
        </ol>
      ) : null}

      {/* ——— ce que le vendeur fait ——— */}
      {vendeur && c.statut === 'payee' && c.mode === 'relais' ? (
        <section className="action-bloc">
          <h2 className="h2">À vous : déposer le colis</h2>
          <p>Avant le <strong>{jour.format(c.deposerAvant!)}</strong>, sinon la vente est annulée et l'acheteur remboursé.</p>
          <ol className="etapes-simples">
            <li>Emballez le flacon : <Link className="lien-souligne" href="/guides/emballer-un-parfum-pour-l-envoyer">le guide en 5 étapes</Link>.</li>
            <li><Link className="lien-souligne" href={`/commandes/${c.id}/etiquette`} target="_blank">Imprimez l'étiquette</Link> et collez-la à plat sur le dessus.</li>
            <li>Déposez-le dans n'importe quel point relais Mondial Relay, et gardez le reçu.</li>
          </ol>
          <div className="boutons">
            <form action={deposer}><input type="hidden" name="id" value={c.id} /><button className="btn btn-noir" type="submit">J'ai déposé le colis</button></form>
            <form action={annulerParVendeur}><input type="hidden" name="id" value={c.id} /><button className="btn btn-discret" type="submit">Je ne peux plus le vendre</button></form>
          </div>
        </section>
      ) : null}
      {vendeur && c.statut === 'payee' && c.mode === 'main' ? (
        <section className="action-bloc">
          <h2 className="h2">À vous : la remise en main propre</h2>
          <p>Convenez d'un rendez-vous par message, dans un lieu public. L'acheteur vérifie le flacon, puis vous montre un code à 6 chiffres : saisissez-le ici. L'argent vous est versé aussitôt.</p>
          <FormCode id={c.id} />
        </section>
      ) : null}
      {vendeur && ['confirmee', 'livree', 'expediee', 'payee'].includes(c.statut) && !moiV?.versementsOk ? (
        <p className="brouillon">Pour recevoir vos {eur(c.prix)}, ajoutez votre IBAN : <Link className="lien-souligne" href="/compte/versements">configurer mes versements</Link> (2 minutes, vérifié par Stripe).</p>
      ) : null}
      {vendeur && c.statut === 'livree' ? <p className="aide">Le colis est arrivé : l'acheteur a jusqu'au {jour.format(c.finVerif!)} pour vérifier. Sans problème signalé, l'argent vous est versé automatiquement.</p> : null}
      {vendeur && c.statut === 'litige' ? <p className="p-alerte">L'acheteur signale un problème : « {c.litige?.raison} ». L'argent reste bloqué ; l'équipe compare avec vos photos vérifiées et vous écrit.</p> : null}

      {/* ——— ce que l'acheteur fait ——— */}
      {acheteur && c.statut === 'payee' && c.mode === 'main' ? (
        <section className="action-bloc">
          <h2 className="h2">Votre code de remise</h2>
          <p className="code-remise">{c.codeRemise}</p>
          <p>Au rendez-vous, vérifiez d'abord le flacon (code lot, niveau, tige). Puis donnez ce code au vendeur : c'est lui qui débloque son argent. Ne le donnez pas avant.</p>
        </section>
      ) : null}
      {acheteur && ['payee', 'expediee'].includes(c.statut) && c.mode === 'relais' ? (
        <p className="aide">{c.statut === 'payee' ? `Le vendeur a jusqu'au ${jour.format(c.deposerAvant!)} pour déposer le colis.` : `Colis en route (suivi ${c.etiquette}).`} Livraison chez {c.relais?.nom}, {c.relais?.adresse}, {c.relais?.cp}.</p>
      ) : null}
      {acheteur && c.statut === 'livree' ? (
        <section className="action-bloc">
          <h2 className="h2">À vous : vérifier le parfum</h2>
          <p>Vous avez jusqu'au <strong>{jour.format(c.finVerif!)}</strong>. Comparez avec les photos de l'annonce : code lot sous le flacon, niveau, bague et tige. Sans réponse de votre part, la commande est confirmée automatiquement.</p>
          <form action={confirmerReception}><input type="hidden" name="id" value={c.id} /><button className="btn btn-noir btn-large" type="submit">Tout est conforme</button></form>
          <details className="offre">
            <summary>Signaler un problème</summary>
            <form action={signalerProbleme} className="offre-form">
              <input type="hidden" name="id" value={c.id} />
              <label htmlFor="raison">Le problème</label>
              <select id="raison" name="raison" className="champ" required defaultValue=""><option value="" disabled>Choisir</option>{PROBLEMES.map((p) => <option key={p}>{p}</option>)}</select>
              <label htmlFor="texte">Ce que vous constatez</label>
              <textarea id="texte" name="texte" className="champ" rows={3} required placeholder="Décrivez précisément. L'équipe pourra vous demander des photos par message." />
              <button className="btn btn-noir" type="submit">Envoyer à l'équipe</button>
              <p className="aide">L'argent reste bloqué pendant que l'équipe regarde. S'il n'est pas conforme à l'annonce, vous êtes remboursé en entier.</p>
            </form>
          </details>
        </section>
      ) : null}
      {acheteur && c.statut === 'litige' ? <p className="p-alerte">Problème signalé : « {c.litige?.raison} ». L'argent reste bloqué ; l'équipe compare avec les photos vérifiées de l'annonce et vous répond.</p> : null}
      {['confirmee', 'versee'].includes(c.statut) ? <p className="offre-ok">{acheteur ? 'Commande terminée. Bonne découverte !' : c.statut === 'versee' ? `${eur(c.prix)} versés le ${jour.format(c.verseeLe!)}.` : `Commande confirmée : ${eur(c.prix)} vous seront versés dès que votre IBAN est enregistré.`}</p> : null}

      {simule() && ['payee', 'expediee'].includes(c.statut) && c.mode === 'relais' ? (
        <form action={simulerArrivee} className="simulation"><input type="hidden" name="id" value={c.id} /><span>Simulation (en attendant Mondial Relay)</span><button className="btn btn-petit" type="submit">Le colis arrive au point relais</button></form>
      ) : null}

      <section className="section">
        <h2 className="h2">Le détail</h2>
        <dl className="total">
          <div><dt>Parfum{vendeur ? ' (pour vous, sans commission)' : ''}</dt><dd>{eur2(c.prix)}</dd></div>
          {!vendeur ? <>
            <div><dt>Protection acheteur</dt><dd>{c.protection ? eur2(c.protection) : 'offerte'}</dd></div>
            <div><dt>Livraison</dt><dd>{eur2(c.envoi)}</dd></div>
            {c.assurance ? <div><dt>Envoi assuré</dt><dd>{eur2(c.assurance)}</dd></div> : null}
            <div className="total-ligne"><dt>Payé</dt><dd>{eur2(c.total)}</dd></div>
          </> : null}
        </dl>
        {c.mode === 'relais' && c.relais ? <p className="aide">Point relais : {c.relais.nom}, {c.relais.adresse}, {c.relais.cp}{c.etiquette ? ` · suivi ${c.etiquette}` : ''}</p> : null}
        <div className="achat-garantie"><Bouclier taille={40} anime={false} /><p>{acheteur ? `Paiement bloqué jusqu'à votre vérification, ${DELAI_VERIF} jours après la livraison.` : 'Vos 6 photos vérifiées font foi en cas de désaccord : elles prouvent l\'état du flacon avant l\'envoi.'}</p></div>
      </section>
    </div>
  );
}
