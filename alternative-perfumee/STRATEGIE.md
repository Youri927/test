# Respray : la stratégie

## Le principe

Respray est une plateforme de revente de parfums entre particuliers. Respray est l'intermédiaire : elle ne stocke
rien et ne touche jamais les flacons.

1. **Le vendeur publie avec 6 photos imposées** : de face, le dessous avec le code lot, le niveau, le flacon sans
   bouchon vu de dessus avec le spray, la même vue sans le bouton spray pour voir la tige, et le flacon à côté d'un
   papier portant son pseudo et la date.
2. **L'équipe vérifie chaque annonce sur ces photos** avant de la publier, en quelques heures.
3. **L'acheteur paie, et l'argent reste bloqué** par Respray (Stripe Connect).
4. **Le vendeur envoie sous 5 jours**, avec un colis suivi et assuré.
5. **L'acheteur a 7 jours après la livraison pour vérifier** le flacon, le niveau, le code lot et l'odeur. S'il ne
   signale rien, ou s'il confirme, le vendeur est payé.

## Ce qui change par rapport à Perfumee

Le principe ressemble à celui de Perfumee. La différence tient à des règles plus strictes, tenues pour de vrai, et
dites partout.

| | Perfumee | Respray |
|---|---|---|
| Photos | Au moins 3, dont le dessous du flacon | 6 imposées : face, dessous avec le code lot, niveau, vue de dessus avec le spray, tige sans le spray, photo avec pseudo et date ; boîte et ticket si disponibles |
| Spray et tige | Pas regardés | Photographiés : un flacon ouvert pour être rempli avec autre chose laisse des traces (tige tordue, colle, bague abîmée) |
| Preuve que le vendeur a le flacon | Aucune | Le papier avec le pseudo et la date, comme dans les groupes d'échange entre passionnés |
| Délai de vérification de l'annonce | « Un petit peu de temps », jusqu'à une semaine selon des avis | Quelques heures, avec un refus motivé (on dit quelle photo refaire) |
| Délai pour vérifier le parfum reçu | 48 h | **7 jours** |
| Qui garantit | « Nous ne garantissons ni leur authenticité ni leur conformité » (FAQ) | Respray rembourse si le parfum n'est pas conforme à l'annonce |
| Colis perdu | L'acheteur est remboursé, le vendeur n'est pas payé | Colis assuré : l'acheteur est remboursé et le vendeur est payé |
| Commission vendeur | 10 % | **0 %** |
| Frais acheteur | 5 % | 8 % + 0,90 € |
| Choix du parfum | Marque et nom tapés à la main (« Parfum », « Guerlain »…) | Choisi dans une liste ; une maison absente peut être proposée, l'équipe corrige l'orthographe et l'ajoute pour tout le monde |
| Paiement du vendeur | 7 à 10 jours ouvrés après confirmation | 1 à 2 jours après confirmation, ou 7 jours après la livraison |
| Application | Non | Oui, pour prendre les photos imposées facilement |
| Avis sur les vendeurs | Un « système de notation », sans détail | Seul l'acheteur d'une vente conclue note, après les 7 jours : 3 questions (conforme aux photos, bien emballé, envoyé vite) et une note. Chaque annonce affiche la part de ventes conformes et le délai d'envoi moyen du vendeur |
| Confirmation par erreur | Écrire un e-mail au service client | Une heure pour annuler, depuis la commande |

**La phrase pour un créateur de contenu** :

> « Sur Respray, chaque annonce a les mêmes 6 photos obligatoires : on voit même la tige du spray, et il y a une
> photo avec le pseudo du vendeur et la date, donc on sait que la personne a vraiment le flacon. L'équipe vérifie avant publication. Tu as 7 jours pour vérifier le
> parfum, pas 48 heures, et c'est Respray qui rembourse s'il n'est pas conforme. Et le vendeur ne paie aucune
> commission. »

## Les photos obligatoires

| Photo | Ce qu'elle permet de vérifier |
|---|---|
| Le flacon de face | La forme du flacon, du bouchon et de l'étiquette, comparés aux modèles connus |
| Le dessous du flacon | Le code lot : il existe, il suit le format de la marque, il correspond à la boîte |
| Le niveau, à hauteur des yeux (flacon opaque : une lampe de téléphone collée derrière) | Que le niveau annoncé est le bon |
| Sans le bouchon, vu de dessus, le spray en place | Le bouton spray et la bague sertie d'origine |
| Sans le bouton spray, la tige visible | Que la tige n'a pas été forcée, tordue ou recollée : le signe d'un flacon ouvert puis rempli |
| Le flacon avec un papier (pseudo + date) | Que le vendeur a le flacon entre les mains, et que les photos ne sont pas reprises d'ailleurs |
| La boîte (si disponible) | Code lot et code-barres cohérents avec le flacon |
| Le ticket ou la facture (facultatif) | La provenance |

En option, plus tard : une photo du flacon posé sur une balance de cuisine. Avec le poids à vide du flacon, on
calcule les millilitres restants.

## Les maisons et parfums absents de la liste

- Dans le formulaire de vente, le vendeur choisit sa maison dans la liste. Si elle n'y est pas, il choisit « Ma maison
  n'est pas dans la liste » et l'écrit.
- Pendant qu'il tape, le site compare avec la liste : « xerjof » propose « Vouliez-vous dire Xerjoff ? » ; un nom
  déjà présent est proposé directement. Cela évite les doublons dès la saisie.
- Sinon, la maison (et le parfum) partent à l'équipe. Dans le panel, une notification montre ce qui a été tapé, une
  version corrigée (majuscules, « de », « d' »), et une alerte si le nom ressemble à une maison existante.
- L'équipe ajoute le nom à la liste, corrige l'annonce vers une maison existante, ou refuse. Une fois ajoutée, la
  maison est proposée aux vendeurs suivants.
- La même chose vaut pour les parfums d'une maison.

## Le back-office de l'équipe

Tout ce que l'équipe voit et fait, à un seul endroit (`#panel` dans le prototype) :

| Rubrique | Ce qu'on y voit | Ce qu'on y fait |
|---|---|---|
| Aujourd'hui | Les compteurs (annonces à vérifier, litiges, envois en retard, propositions), l'argent bloqué et à verser, les recettes du mois | Une liste « à faire », du plus urgent au moins urgent, chaque ligne mène au bon écran |
| Annonces | La file de vérification (6 photos agrandissables, contrôles à cocher, alertes : prix bas, photo reprise d'une autre annonce, nouveau vendeur, attente de plus de 2 h) ; les annonces en ligne ; les décisions passées | Publier, demander une photo précise avec un message, refuser avec une raison ; retirer une annonce en ligne et la remettre |
| Commandes | Toutes les commandes, filtrées par état ; pour chacune : ce qui s'est passé (paiement, envoi, étapes du transporteur, livraison, réclamation, actions de l'équipe), les personnes, l'argent | Relancer le vendeur, annuler et rembourser, déclarer un colis perdu, prolonger les 7 jours, verser au vendeur ; notes internes |
| Envois | À envoyer (5 jours, retards en rouge), en route (colis immobile depuis plus de 6 jours), livrés en cours de vérification | Relancer, annuler, déclarer perdu, prolonger |
| Litiges | Les réclamations des acheteurs : les photos de l'annonce à côté de celles reçues, le code lot comparé, les échanges, le délai de 48 h du vendeur | Trancher : non conforme avec retour, non conforme sans retour, conforme, problème de transport, ou demander une précision ; exclure le vendeur pour une contrefaçon ; message aux deux parties |
| Membres | Vendeurs et acheteurs : identité, e-mail, téléphone, ville, compte de versement et vérification d'identité, chiffres, annonces, ventes, achats, litiges, non-conformités | Écrire au membre, suspendre (ses annonces sont masquées), exclure, réactiver ; notes internes |
| Maisons et parfums | Les propositions des vendeurs (ce qu'ils ont tapé, la version corrigée, les doublons probables) et toute la liste, avec l'origine de chaque ajout | Ajouter avec la bonne orthographe, corriger vers un nom existant, refuser ; ajouter une maison ou un parfum directement ; corriger un nom |
| Paiements | L'argent bloqué, à verser, versé, remboursé, et les recettes de la protection acheteur | Verser une vente, ou toutes |
| Journal | Chaque action, signée et datée | — |

Une recherche, en haut de chaque écran, trouve une commande, un membre (pseudo, nom, e-mail), une annonce, un code lot
ou un numéro de suivi.

Chaque action est une ligne du journal ; l'état se recalcule en le rejouant. On sait donc toujours qui a fait quoi,
et rien n'est modifié sans trace. Sur la page publiée, le journal est partagé : toute l'équipe voit les mêmes
décisions. Le site suit : une annonce publiée apparaît sur le site, une annonce retirée ou un vendeur suspendu en
disparaît, une maison ajoutée est proposée aux vendeurs suivants.

## La vérification de l'équipe

- Elle contrôle que les photos sont présentes, nettes et prises par le vendeur, que le code lot est cohérent, que le
  flacon, le spray et la tige correspondent aux modèles connus et n'ont pas été forcés, que le niveau correspond à
  l'annonce et que le prix n'est pas anormalement bas.
- Les signaux d'alerte, vérifiés de plus près : prix très bas, nouveau compte qui vend un parfum cher, photos déjà
  publiées ailleurs, code lot incohérent, même flacon déjà vendu.
- Objectif : moins de 2 heures en journée, 24 heures au maximum.
- Une annonce refusée l'est avec une raison claire (« la photo du dessous ne permet pas de lire le code lot »).
- Plus tard, un outil peut faire un premier tri automatique (lecture du code lot, photos en double), mais la décision
  reste humaine.

## Après l'achat

- Le vendeur a 5 jours pour envoyer, avec l'étiquette fournie. Passé ce délai, la vente est annulée et l'acheteur
  remboursé.
- L'acheteur a 7 jours après la livraison pour vérifier. Il confirme ou ouvre un signalement, avec des photos.
- **Non conforme** (contrefaçon, niveau plus bas qu'annoncé, flacon abîmé, mauvais parfum) : retour avec l'étiquette
  fournie, remboursement complet, livraison comprise. Le vendeur paie le retour. Une contrefaçon, c'est l'exclusion.
- **Conforme mais il ne plaît pas** : pas de remboursement. L'acheteur peut le remettre en vente sur Respray.
- **Remise en main propre** : l'acheteur paie dans l'appli et valide sur place, après avoir vu et senti le flacon.
  L'argent part à ce moment-là.
- **Confirmation par erreur** : l'acheteur a une heure pour l'annuler, depuis sa commande.
- **Déjà vendu ailleurs** : la vente est annulée, l'acheteur remboursé tout de suite ; l'annulation est comptée sur
  le profil du vendeur.

### Les avis

Perfumee dit avoir « un système de notation » pour juger la fiabilité des vendeurs, sans dire comment il marche.
Sur Respray, les règles sont écrites.

- Seul l'acheteur d'une vente conclue peut noter le vendeur : un avis par vente, laissé après les 7 jours.
- Trois questions (conforme aux photos ? bien emballé ? envoyé en moins de 3 jours ?), puis une note sur 5 et un mot
  si on veut.
- Chaque annonce affiche la note, la part de ventes conformes (une non-conformité reconnue par l'équipe y reste), le
  délai d'envoi moyen et le nombre de ventes.
- Deux non-conformités en six mois : les annonces du vendeur sont suspendues le temps qu'on regarde. Une contrefaçon ou
  un parfum dilué : exclusion définitive.
- Le vendeur peut répondre une fois sous l'avis ; il ne peut ni le modifier, ni le supprimer.

## Les frais

Le principe : le vendeur ne paie rien, c'est l'argument qu'on répète partout. L'acheteur paie une protection qui
finance ce qui rend la vente sûre. Les options n'impliquent jamais que Respray touche un colis.

| | |
|---|---|
| Vendre | Gratuit, 0 % de commission |
| Protection acheteur | 8 % du prix + 0,90 € |
| Envoi suivi en point relais | À partir de 4,90 € |
| Remise en main propre | Gratuit |
| Envoi assuré à la valeur réelle (acheteur, en option au-dessus de 150 €) | 2,90 € |
| Mise en avant d'une annonce (vendeur, en option) | 1,99 € pour 3 jours, 4,99 € pour 7 jours avec l'accueil |

Sur un flacon à 100 € :

| | Perfumee | Respray |
|---|---|---|
| Le vendeur reçoit | 90 € | **100 €** |
| L'acheteur paie (hors livraison) | 105 € | 108,90 € |
| La plateforme gagne | 15 € | 8,90 €, plus les options |

Le vendeur ne perdant rien, il peut afficher un prix plus bas : au total, l'écart vendeur-acheteur (8,90 €) reste
bien en dessous de celui de Perfumee (15 €).

**Ce que coûte une vente à 100 € (estimations à confirmer avec de vrais devis)** : paiement et virement au vendeur
(Stripe Connect) ≈ 1,90 € ; vérification humaine de l'annonce ≈ 1,50 à 2 € (toutes les annonces ne se vendent pas) ;
service client, litiges et remboursements non récupérés ≈ 0,50 à 1 €. Soit 4 à 5 €. Il reste 4 à 5 € par vente, plus
la mise en avant (≈ 0,50 € en moyenne par vente si un vendeur sur trois à cinq la prend) et la marge sur l'envoi
assuré (≈ 1 à 2 € quand il est pris). Les 0,90 € fixes couvrent les coûts qui ne dépendent pas du prix : sur un
flacon à 30 €, la protection rapporte 3,30 €.

Écartés : la commission vendeur (on perdrait l'argument principal), une « protection renforcée » (Respray ne voit
pas les flacons, il ne peut pas garantir plus que la conformité aux photos), une vérification express payante (peu
utile), une marge sur l'étiquette d'envoi.

## Ce qu'il faut régler avant de lancer

1. **Le transport.** Le parfum est un liquide inflammable : La Poste l'interdit en colis. Il faut un transporteur qui
   accepte les flacons de parfum pour des envois de particuliers sous le compte de Respray, avec les consignes
   d'emballage à donner aux vendeurs. C'est le premier point à valider.
2. **Les CGU, avec un avocat.** Statut d'intermédiaire, garantie limitée à la conformité à l'annonce, règles de
   signalement, interdits (contrefaçons, testeurs, échantillons offerts, décants), droit des marques (Cour de
   cassation, Chanel contre Easy Cash, 2023), obligations des plateformes (DSA, déclaration DAC7 des vendeurs au-delà
   de 30 ventes ou 2 000 € par an).
3. **Le paiement.** Stripe Connect, avec des fonds bloqués jusqu'à la fin des 7 jours et la vérification d'identité
   des vendeurs.
4. **Le nom.** respray.fr semble libre ; respray.com est pris (page de domaine en attente, peut-être à vendre).
   Dépôt de la marque à l'INPI, réservation des comptes Instagram et TikTok.
5. **La liste des parfums.** Une base sous licence pour démarrer (Fragella ou équivalent), complétée à la main.

## Le lancement

- Les communautés de passionnés (groupes Facebook, Reddit, TikTok) : ils font déjà des photos avec pseudo et date
  pour leurs échanges. Respray leur apporte le paiement bloqué et les 7 jours.
- Des créateurs de contenu parfum, avec un code de parrainage (par exemple 5 € pour le parrain et pour le filleul à
  la première vente).
- Une page par parfum pour Google (« Baccarat Rouge 540 occasion ») : Perfumee n'en a pas, ses annonces sont des
  numéros.
- Faire venir les premiers vendeurs avant les acheteurs : une plateforme vide ne retient personne.

## Ce qu'on a retiré de la première version

L'atelier (recevoir les flacons avant de les renvoyer), le passeport à puce, la conciergerie, la cote détaillée, les
échanges. Ils coûtent cher et compliquent le message. Si un jour la demande existe, une authentification physique
peut revenir en option payante pour les flacons les plus chers.
