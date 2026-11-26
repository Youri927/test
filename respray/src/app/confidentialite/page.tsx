import {PageLegale} from '@/components/PageLegale';
import {SOCIETE, PRESTATAIRES} from '@/lib/legal';

export const metadata = {title: 'Confidentialité'};

/* La politique de confidentialité (RGPD) : ce que Respray collecte, pourquoi, combien de temps, avec qui. */
export default function Confidentialite() {
  return (
    <PageLegale
      surtitre="Vos données"
      titre="Politique de confidentialité"
      intro={<p>Respray collecte le moins possible : ce qu'il faut pour vendre, acheter et être protégé. Pas de publicité ciblée, pas de revente de données, pas de traceurs publicitaires.</p>}
      sections={[
        {id: 'responsable', t: 'Qui est responsable', c: <p>{SOCIETE.nom}, {SOCIETE.siege}. Pour toute question ou demande sur vos données : <a className="lien-souligne" href={`mailto:${SOCIETE.email}`}>{SOCIETE.email}</a>.</p>},
        {id: 'donnees', t: 'Les données collectées', c: (
          <ul className="legal-liste">
            <li><strong>Votre compte</strong> : prénom, nom, pseudo, adresse e-mail, ville, mot de passe (stocké chiffré, jamais lisible).</li>
            <li><strong>Vos annonces</strong> : descriptions, photos, dont la photo preuve avec votre pseudo et la date.</li>
            <li><strong>Vos commandes</strong> : montants, point relais choisi, suivi, échanges avec l'équipe en cas de litige.</li>
            <li><strong>Vos messages</strong> avec les autres membres. Les coordonnées et moyens de paiement extérieurs y sont masqués automatiquement.</li>
            <li><strong>Votre activité</strong> : favoris, liste d'envies, placard, offres, notifications.</li>
            <li><strong>Paiement et versements</strong> : collectés et conservés par Stripe, pas par Respray. Respray ne voit ni votre numéro de carte, ni vos papiers d'identité, ni votre IBAN ; il ne connaît que l'identifiant de votre compte Stripe et son statut.</li>
          </ul>
        )},
        {id: 'pourquoi', t: 'Pourquoi, et sur quelle base', c: (
          <ul className="legal-liste">
            <li><strong>Faire fonctionner le service</strong> (compte, annonces, vérification, paiement, envoi, versements, litiges) : exécution du contrat.</li>
            <li><strong>Prévenir la fraude et les contrefaçons</strong>, sécuriser la plateforme, masquer les coordonnées dans les messages : intérêt légitime de Respray et de ses membres.</li>
            <li><strong>Respecter la loi</strong> : comptabilité, déclaration annuelle des vendeurs à l'administration fiscale au-delà des seuils légaux, réponses aux autorités : obligation légale.</li>
            <li><strong>Vous prévenir</strong> (envie arrivée, offre, message, colis) par l'activité du site et par e-mail : exécution du contrat ; vous pouvez désactiver les e-mails non indispensables dans votre compte.</li>
          </ul>
        )},
        {id: 'qui', t: 'Qui y a accès', c: <>
          <p>L'équipe de Respray, pour vérifier les annonces et traiter les litiges. Les autres membres voient seulement votre pseudo, votre ville si vous proposez la remise en main propre, et ce que vous publiez. L'acheteur et le vendeur d'une commande voient ce qui est utile à l'envoi (prénom et initiale du nom, point relais) : jamais votre adresse postale ni votre e-mail.</p>
          <p>Nos prestataires, chacun pour sa mission seulement :</p>
          <ul className="legal-liste">{PRESTATAIRES.map(([n, r, s]) => <li key={n}><strong>{n}</strong> : {r} ({s}).</li>)}</ul>
          <p>Stripe peut transférer certaines données hors de l'Union européenne ; ces transferts sont encadrés par les clauses contractuelles types de la Commission européenne. Les données du site restent hébergées en France.</p>
        </>},
        {id: 'durees', t: 'Combien de temps', c: (
          <ul className="legal-liste">
            <li>Compte : tant qu'il est actif, puis 3 ans après la dernière connexion, avant suppression.</li>
            <li>Annonces et photos : le temps de l'annonce, puis 3 ans pour les éventuels litiges et la lutte contre la fraude.</li>
            <li>Commandes et pièces comptables : 10 ans (obligation légale).</li>
            <li>Messages : 3 ans après le dernier message de la conversation.</li>
          </ul>
        )},
        {id: 'droits', t: 'Vos droits', c: <p>Vous pouvez accéder à vos données, les corriger, les faire effacer, en demander une copie (portabilité), vous opposer à un traitement ou le limiter, et donner des directives pour après votre décès. Écrivez à {SOCIETE.email} : nous répondons sous un mois. Certaines données doivent être gardées malgré une demande d'effacement (commandes, obligations fiscales). Vous pouvez aussi saisir la CNIL (cnil.fr).</p>},
        {id: 'cookies', t: 'Cookies', c: <>
          <p>Respray n'utilise que des cookies indispensables, qui ne demandent pas votre accord :</p>
          <ul className="legal-liste">
            <li><strong>respray_session</strong> : vous garder connecté (30 jours).</li>
            <li><strong>respray_parrain</strong> : retenir le code de parrainage du lien que vous avez suivi (30 jours).</li>
            <li>Les cookies de <strong>Stripe</strong>, sur les pages de paiement et de versements : sécurité et prévention de la fraude.</li>
          </ul>
          <p>Vos préférences d'affichage (thème, brouillon d'annonce) sont gardées dans votre navigateur seulement. Aucun traceur publicitaire ni outil de mesure d'audience tiers.</p>
        </>},
        {id: 'securite', t: 'Sécurité', c: <p>Connexion chiffrée (HTTPS), mots de passe hachés, accès de l'équipe limité et journalisé, sauvegardes de la base chaque nuit, conservées 14 jours sur le serveur. En cas de violation de données à risque pour vous, nous vous prévenons ainsi que la CNIL.</p>},
      ]}
    />
  );
}
