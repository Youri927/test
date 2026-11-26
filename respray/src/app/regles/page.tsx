import Link from 'next/link';
import {PageLegale} from '@/components/PageLegale';

export const metadata = {title: 'Règles des annonces', description: 'Ce qui peut être vendu sur Respray, ce qui est interdit, et ce qu\'attend l\'équipe qui vérifie chaque annonce.'};

export default function Regles() {
  return (
    <PageLegale
      surtitre="Vendre sur Respray"
      titre="Les règles des annonces"
      intro={<p>Chaque annonce est vérifiée par l'équipe avant d'être en ligne. Ces règles disent ce qui est accepté, ce qui ne l'est pas, et pourquoi : la confiance des acheteurs en dépend.</p>}
      sections={[
        {id: 'accepte', t: 'Ce qui est accepté', c: (
          <ul className="legal-liste">
            <li>Les parfums authentiques qui vous appartiennent, neufs ou entamés : extrait, eau de parfum, eau de toilette, eau de Cologne, parfum pour cheveux, brume.</li>
            <li>Les formats voyage et miniatures, dans leur flacon d'origine.</li>
            <li>Les échantillons achetés (vendus comme tels par la maison).</li>
            <li>Les coffrets, s'ils sont neufs, scellés et sous blister.</li>
          </ul>
        )},
        {id: 'interdit', t: 'Ce qui est interdit', c: (
          <ul className="legal-liste">
            <li>Les contrefaçons, copies et « dupes », même présentées comme telles.</li>
            <li>Les parfums dilués, mélangés, transvasés ou reconditionnés, et les décants.</li>
            <li>Les échantillons offerts et tout ce qui porte « ne peut être vendu », « vente interdite » ou « testeur ».</li>
            <li>Les parfums altérés (couleur ou odeur tournées) présentés comme en bon état.</li>
            <li>Les flacons vides, sauf s'ils sont décrits comme tels pour la collection.</li>
            <li>Les parfums qui ne vous appartiennent pas, ou que vous n'avez pas en main.</li>
            <li>La revente habituelle de parfums achetés pour être revendus : c'est une activité professionnelle.</li>
          </ul>
        )},
        {id: 'photos', t: 'Les 6 photos', c: <>
          <p>Elles sont prises par vous, du flacon que vous avez en main, récemment : de face, le dessous avec le code lot lisible, le niveau à hauteur des yeux (lampe de téléphone derrière un flacon opaque), sans le bouchon vu de dessus, sans le bouton spray pour voir la tige, et à côté d'un papier portant votre pseudo et la date. Pas de photo reprise d'internet ni d'une autre annonce.</p>
          <p><Link className="lien-souligne" href="/guides/photographier-un-parfum-pour-le-vendre">Le guide des 6 photos</Link></p>
        </>},
        {id: 'description', t: 'La description et le prix', c: <p>Ce que vous déclarez doit être exact : niveau restant, état du flacon et de la boîte, conservation, petits défauts. Un niveau surestimé ou un défaut caché donne raison à l'acheteur en cas de litige. Le prix est libre ; un prix anormalement bas pour un parfum recherché fait l'objet d'une vérification renforcée.</p>},
        {id: 'verification', t: 'Comment l\'équipe vérifie', c: <p>Les 6 contrôles : photos présentes et nettes ; code lot lisible et au format de la maison ; spray, bague et tige d'origine ; flacon conforme aux modèles connus ; niveau conforme ; papier avec le bon pseudo et une date récente. L'équipe peut vous demander une photo, refuser l'annonce ou la retirer, en vous disant pourquoi. <Link className="lien-souligne" href="/verification">Nos chiffres de vérification</Link></p>},
        {id: 'comportement', t: 'Entre membres', c: <p>On échange sur Respray, on paie sur Respray, on reste courtois. Proposer un paiement ou un rendez-vous de paiement hors du site, créer plusieurs comptes ou publier des avis trompeurs entraîne la suspension du compte. En cas de contrefaçon, le compte est fermé et les éléments peuvent être transmis aux autorités.</p>},
      ]}
    />
  );
}
