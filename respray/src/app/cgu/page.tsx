import Link from 'next/link';
import {PageLegale} from '@/components/PageLegale';
import {SOCIETE, MEDIATEUR} from '@/lib/legal';
import {ENVOI, ENVOI_GRAND, ASSURANCE, SEUIL_ASSURANCE, MISES_EN_AVANT, eur2} from '@/lib/regles';

export const metadata = {title: 'Conditions générales d\'utilisation et de vente'};

/* Les conditions de la plateforme : ce que fait Respray (et ce qu'il ne fait pas), ce que doivent les membres, l'argent,
   les envois, la vérification et les litiges. Rédigées pour une plateforme de mise en relation entre particuliers
   (code de la consommation, art. L111-7) ; à faire relire par un juriste avant l'ouverture au public. */
export default function Cgu() {
  const avant = MISES_EN_AVANT.filter((m) => m.prix).map((m) => `${m.t.toLowerCase()} : ${eur2(m.prix)}`).join(' ; ');
  return (
    <PageLegale
      surtitre="Conditions"
      titre="Conditions générales d'utilisation et de vente"
      intro={<p>Ces conditions s'appliquent à toute personne qui utilise {SOCIETE.site}. En créant un compte, vous les acceptez. Elles sont écrites pour être lues : si un point n'est pas clair, écrivez-nous.</p>}
      sections={[
        {id: 'role', t: 'Ce que fait Respray', c: <>
          <p>Respray, édité par {SOCIETE.nom} (voir les <Link className="lien-souligne" href="/mentions-legales">mentions légales</Link>), est une plateforme en ligne qui met en relation des particuliers pour la vente de parfums de seconde main. <strong>Respray n'est ni le vendeur ni l'acheteur</strong> : le contrat de vente est conclu directement entre le membre qui vend (le vendeur) et le membre qui achète (l'acheteur). Respray ne possède pas les parfums et ne manipule pas les colis.</p>
          <p>Respray fournit : la publication des annonces après vérification de leurs photos par son équipe, le paiement sécurisé, la conservation du paiement jusqu'à la vérification par l'acheteur, l'étiquette d'envoi, la messagerie et le traitement des litiges.</p>
        </>},
        {id: 'particuliers', t: 'Une plateforme entre particuliers', c: <>
          <p>Respray est réservé aux particuliers qui vendent des parfums leur appartenant, à titre occasionnel. Acheter des parfums pour les revendre est une activité professionnelle : elle n'est pas permise sur Respray.</p>
          <p><strong>Information importante pour l'acheteur</strong> : la vente ayant lieu entre particuliers, les droits propres aux achats auprès d'un professionnel (droit de rétractation de 14 jours, garantie légale de conformité) ne s'appliquent pas à l'achat du parfum. Respray vous offre à la place la protection décrite à l'article 7 : 7 jours pour vérifier le parfum, et le remboursement s'il n'est pas conforme à l'annonce.</p>
        </>},
        {id: 'compte', t: 'Votre compte', c: <>
          <p>Il faut avoir 18 ans et donner des informations exactes. Un seul compte par personne. Vous êtes responsable de votre mot de passe et de ce qui est fait depuis votre compte.</p>
          <p>Pour recevoir l'argent de ses ventes, le vendeur fait vérifier son identité et son compte bancaire par Stripe, notre prestataire de paiement, et accepte l'accord de compte connecté de Stripe. Respray n'a accès ni à ses papiers d'identité ni à ses coordonnées bancaires.</p>
        </>},
        {id: 'annonces', t: 'Les annonces, leur vérification et leur classement', c: <>
          <p>Le vendeur décrit honnêtement son parfum et fournit les 6 photos demandées, prises par lui, du flacon qu'il a en main. Il s'engage à ce que le parfum soit authentique, ni dilué ni transvasé. Les <Link className="lien-souligne" href="/regles">règles des annonces</Link> précisent ce qui est accepté et ce qui est interdit.</p>
          <p>Avant publication, l'équipe de Respray examine les photos et les informations : code lot, bague et tige, flacon, niveau, photo preuve. Elle peut demander une photo, refuser ou retirer une annonce, en indiquant la raison. Cette vérification est faite avec soin mais sur photos : elle réduit fortement le risque, sans pouvoir le supprimer ; c'est pourquoi l'acheteur dispose en plus de 7 jours pour vérifier le parfum en main.</p>
          <p><strong>Classement</strong> : par défaut, les annonces sont affichées de la plus récente à la plus ancienne. Les annonces dont le vendeur a payé une mise en avant (ou utilisé une mise en avant offerte) passent en tête pendant sa durée, et portent la mention « Mise en avant ». L'acheteur peut aussi trier par prix ou par prix au millilitre.</p>
        </>},
        {id: 'prix', t: 'Prix et frais', c: <>
          <p><strong>Pour le vendeur</strong> : publier une annonce est gratuit, et Respray ne prend aucune commission sur le prix de vente. En option, la mise en avant d'une annonce publiée ({avant}).</p>
          <p><strong>Pour l'acheteur</strong>, en plus du prix du parfum : la protection acheteur (8 % du prix du parfum + 1,50 €), la livraison en point relais ({eur2(ENVOI)}, ou {eur2(ENVOI_GRAND)} pour un flacon de plus de 125 ml ou un coffret ; gratuite en remise en main propre), et en option, pour un parfum de {eur2(SEUIL_ASSURANCE)} ou plus, l'envoi assuré à la valeur du parfum ({eur2(ASSURANCE)}). Le total est affiché avant le paiement. Les prix sont indiqués toutes taxes comprises.</p>
          <p>Les frais de Respray rémunèrent un service exécuté dès le paiement (vérification, paiement sécurisé, protection, étiquette) : vous demandez expressément cette exécution immédiate et renoncez à votre droit de rétractation sur ces frais. Ils sont remboursés en même temps que le parfum dans les cas prévus aux articles 7 et 8.</p>
        </>},
        {id: 'paiement', t: 'Le paiement', c: <>
          <p>L'acheteur paie sur Respray, par l'intermédiaire de Stripe (carte bancaire, Apple Pay, Google Pay). Le paiement est conservé jusqu'à la fin de la vérification par l'acheteur ; le vendeur ne le reçoit qu'ensuite. Le prix du parfum est alors versé en totalité au vendeur, sur son compte bancaire, par Stripe : les ventes confirmées sont versées une fois par semaine, le lundi.</p>
          <p>Il est interdit de proposer ou d'accepter un paiement en dehors de Respray (virement, PayPal, espèces…). Hors de Respray, il n'y a ni paiement conservé, ni vérification, ni remboursement. Les coordonnées et moyens de paiement écrits dans la messagerie sont masqués.</p>
        </>},
        {id: 'verification', t: 'Envoi, vérification et protection de l\'acheteur', c: <>
          <p>Après le paiement, le vendeur reçoit une étiquette prépayée et dépose le colis en point relais sous 5 jours ; à défaut, la vente est annulée et l'acheteur remboursé en totalité. En remise en main propre, l'acheteur paie sur Respray, vérifie le flacon au rendez-vous, puis donne au vendeur le code affiché dans sa commande : ce code confirme la remise.</p>
          <p>À l'arrivée du colis, l'acheteur dispose de <strong>7 jours</strong> pour vérifier le parfum. Il confirme que tout est conforme, ou signale un problème depuis sa commande. Sans réponse dans ce délai, la commande est confirmée et le vendeur payé.</p>
          <p>Si le parfum n'est pas conforme à l'annonce (contrefaçon, autre parfum, niveau nettement inférieur, flacon abîmé ou défaut non signalé) ou si le colis n'arrive pas, l'acheteur est <strong>remboursé en totalité</strong>, frais compris. Il peut lui être demandé de renvoyer le parfum avec une étiquette retour fournie par Respray.</p>
        </>},
        {id: 'litiges', t: 'Les litiges entre membres', c: <>
          <p>En cas de problème signalé, le paiement reste conservé. L'équipe de Respray examine les éléments : les photos vérifiées de l'annonce, celles fournies par l'acheteur, les échanges dans la messagerie, le suivi du colis. Elle décide de rembourser l'acheteur ou de payer le vendeur, et motive sa décision. Respray agit ici comme intermédiaire de confiance ; chaque membre conserve la possibilité de saisir le juge compétent.</p>
          <p>Si l'acheteur conteste le paiement auprès de sa banque, le paiement du vendeur est suspendu, ou repris s'il avait déjà été versé, le temps de l'examen.</p>
        </>},
        {id: 'offres', t: 'Offres et messagerie', c: <p>L'acheteur peut proposer un prix (au moins 60 % du prix affiché). Le vendeur accepte, refuse ou fait une contre-offre ; une offre acceptée vaut 48 heures. Le vendeur peut aussi proposer un prix aux membres qui ont mis son annonce en favori. La messagerie sert aux questions sur la vente ; elle doit rester courtoise, et ne peut pas servir à conclure la vente ailleurs.</p>},
        {id: 'interdits', t: 'Ce qui est interdit, et les sanctions', c: <>
          <p>Sont notamment interdits : la vente de contrefaçons, de parfums dilués ou transvasés, d'échantillons marqués « ne peut être vendu » ; les photos qui ne sont pas les vôtres ; les comptes multiples ; le paiement hors de Respray ; les fausses déclarations dans un litige ; tout propos insultant ou discriminatoire.</p>
          <p>Selon la gravité, Respray peut refuser ou retirer une annonce, suspendre ou fermer un compte, et, pour une contrefaçon, conserver les éléments utiles et les transmettre aux autorités. La décision est motivée et peut être contestée en nous écrivant.</p>
        </>},
        {id: 'photos', t: 'Vos photos et vos contenus', c: <p>Vous restez propriétaire de vos photos et textes. Vous autorisez Respray à les afficher sur le site tant que l'annonce existe, et à les conserver ensuite pour la vérification et les litiges. Respray ne les utilise pas dans sa communication (réseaux sociaux, publicités) sans vous demander votre accord.</p>},
        {id: 'responsabilite', t: 'Responsabilité', c: <p>Respray met en œuvre les moyens raisonnables pour faire fonctionner la plateforme, vérifier les annonces et traiter les litiges. Respray n'est pas partie aux ventes et ne répond pas de l'exécution du contrat entre membres, sous réserve de la protection de l'acheteur décrite ci-dessus et de ses propres manquements. Respray ne répond pas des interruptions dues à la maintenance, aux prestataires (paiement, transport) ou à la force majeure.</p>},
        {id: 'fiscal', t: 'Obligations fiscales et sociales', c: <p>Les revenus tirés de ventes sur Respray peuvent, dans certains cas, devoir être déclarés. Respray vous en informe sur la page <Link className="lien-souligne" href="/obligations-fiscales">obligations fiscales et sociales</Link>, et transmet chaque année à l'administration fiscale les informations prévues par la loi sur les vendeurs qui dépassent les seuils légaux.</p>},
        {id: 'donnees', t: 'Données personnelles', c: <p>Leur traitement est décrit dans la <Link className="lien-souligne" href="/confidentialite">politique de confidentialité</Link>.</p>},
        {id: 'reclamations', t: 'Réclamations et médiation', c: <p>Pour toute réclamation sur le service de Respray : {SOCIETE.email}. À défaut de solution, vous pouvez saisir gratuitement le médiateur de la consommation : {MEDIATEUR.nom} ({MEDIATEUR.site}).</p>},
        {id: 'modifications', t: 'Modification des conditions et droit applicable', c: <p>Respray peut faire évoluer ces conditions ; les membres en sont informés au moins 15 jours à l'avance, et les nouvelles conditions ne s'appliquent pas aux ventes déjà conclues. Ces conditions sont soumises au droit français. En cas de litige, et à défaut d'accord amiable, les tribunaux français sont compétents, dans le respect des règles protectrices du consommateur.</p>},
      ]}
    />
  );
}
