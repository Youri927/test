# Perfumee.fr : l'analyse complète

Analyse faite le 25 novembre 2026, à partir du site public (pages, configuration publiée par le site, plan du site,
pages de recherche), des CGU, de la FAQ, de Trustpilot, du registre des sociétés et de la presse. Rien n'a été fait
derrière une connexion : tout ce qui suit est visible par n'importe quel visiteur.

## 1. Qui est Perfumee

| | |
|---|---|
| Société | PERFUMEE SAS, capital de 3 000 €, RCS Antibes 931 084 354, créée en juillet 2024 |
| Fondatrice | Tara Roumian, passée par Fragonard, Kenzo et Chanel (selon leur page « Notre histoire ») |
| Accompagnement | Incubée à NEOMA Business School |
| Prix | Young Award Business O Féminin 2024 (remis à Vivatech), 1er prix Powered Day NEOMA, 2e prix Fondation Le Roch-Les Mousquetaires (6 000 €), 2 prix Pépite, Coup de cœur du public au Grand Pitch de Reims, 1er prix Genius |
| Presse | Capital (juillet 2024), Neoma Alumni, Revue Parfum, Scentimental (article favorable, avril 2026) |
| Levée de fonds | Aucune trouvée. Pas d'application mobile (« nous y travaillons », réponses Trustpilot d'avril et juin 2026) |
| Réputation | 4,6/5 sur Trustpilot. Plaintes récurrentes : validation des annonces lente (jusqu'à une semaine), étiquette et envoi laborieux, pas d'appli, pas de compteur de vues |
| Réseaux | Instagram et TikTok (@perfumeeperfumee) |

**Ce qu'il faut retenir** : Perfumee n'est pas un gros acteur financé. C'est un projet de fondatrice seule (ou presque),
bien primé, bien raconté, qui a trouvé son public et qui grossit vite. C'est le premier nom qu'un passionné citera,
et c'est pour ça que l'alternative ne peut pas être « Perfumee en plus joli ».

## 2. L'activité réelle, mesurée

Le plan du site (`sitemap-recent-listings.xml`) liste **7 401 annonces**. Les identifiants Sharetribe commencent par
l'heure de création : on peut dater chaque annonce.

| Mois | Annonces créées |
|---|---|
| déc. 2024 (première annonce le 17/12) | 15 |
| juin 2025 | 45 |
| nov. 2025 | 205 |
| mars 2026 | 481 |
| juin 2026 | 471 |
| sept. 2026 | 848 |
| oct. 2026 | 972 |
| nov. 2026 (au 24) | 1 058 |

- **5 455 parfums** sont disponibles à l'achat (page de recherche, 25/11/2026). L'écart avec le plan du site (≈ 1 950)
  correspond aux annonces vendues, retirées ou fermées.
- **Croissance ×5 en un an** sur les dépôts (205 en novembre 2025, plus de 1 000 en novembre 2026).
- La page d'accueil annonce « + 3 000 ventes ». À un prix médian de 85 €, cela fait un volume d'affaires cumulé de
  l'ordre de 250 000 €, soit environ 38 000 € de commissions à 15 %. Petit, mais en accélération.

**Échantillon de 288 annonces** (les 12 premières pages de la recherche, les plus récentes) :

| | |
|---|---|
| Prix médian | 85 € (moyenne 102 €) |
| Quartiles | 50 € / 85 € / 140 € ; 10 % au-dessus de 200 € ; maximum 570 € |
| Petits prix | 41 annonces à 30 € ou moins (dont des « Baccarat Rouge 540 » à 6 € : des échantillons ou décants, sans catégorie pour les ranger) |
| Neuf sous blister / déjà utilisé | 23 % / 77 % |
| Vendeurs | 148 vendeurs différents pour 288 annonces ; 87 n'en ont qu'une ; les 10 plus gros font 23 % des annonces |
| Livraison | 100 % des annonces proposent à la fois l'envoi et la remise en main propre |
| Profil | Très « niche » : Xerjoff, Byredo, Frédéric Malle, Orto Parisi, Laboratorio Olfattivo, Mémo, Trudon, Vilhelm, Ella K, Casamorati… à côté des classiques (Guerlain, Mugler, Lancôme, Carolina Herrera) |
| Titres | Libres et incohérents : « Parfum », « Guerlain », « Parfum lancome », « Musc Ravageur » sans la marque, « Xerjoff Naxos 100mL » |

## 3. Comment c'est construit

- **Sharetribe** (Web Template React, hébergé par Sharetribe Oy à Helsinki d'après les mentions légales) : une
  marketplace « en kit », configurée depuis une console. La configuration publiée par le site (catégories, champs,
  filtres, commissions, prix minimum) se lit dans la page elle-même.
- **Stripe Connect** pour le paiement et les virements, **Mapbox** pour la carte, **Google Analytics**, **Sentry**.
- **Ajouts sur mesure** repérés dans le code : création d'étiquettes **Mondial Relay** par API, ligne « assurance
  livraison » dans le récapitulatif, encart « La protection Perfumee » (refonte d'octobre 2026), invitation à noter sur
  **Trustpilot** (sans widget de note : leur compte n'y a pas accès), favoris, « Faire une offre », « Parfums
  similaires » (recherche par mots du titre, faute de catalogue), badge « Vendu », suppression de compte.
- **Refonte 2026** : bordeaux (#410d1c) et crème, typographie propre. Le site est correct visuellement : la différence
  ne pourra pas venir seulement du design.

### Le catalogue tel qu'il est configuré

- 3 catégories (féminin, masculin, mixte) × 7 sous-catégories (extrait, eau de parfum, eau de toilette, eau de cologne,
  parfum cheveux, brume, coffret).
- 2 types d'annonce : « parfum neuf (sous blister) » et « parfum déjà utilisé ».
- Champs : **marque et nom du parfum en texte libre**, familles olfactives (10), format (19 contenances fixes de 5 à
  250 ml), date d'achat (4 tranches), conditions de stockage (4 cases), état du flacon (5 tranches : plein 90–100 %,
  3/4, moitié, moins d'1/4, vide), flacon opaque, état de la boîte (4), code lot (facultatif, texte libre).
- Prix minimum : 3 €. Recherche par mots-clés, filtres par catégorie, prix (0–5 000 €) et champs ci-dessus.
- À l'inscription, un champ obligatoire « Engagement » propose deux réponses : « Je certifie l'authenticité… » et
  « Je ne certifie pas l'authenticité… ». La seconde est sélectionnable.

### SEO et technique

- Adresses d'annonces sans mots : `/l/6b05d29c-553a-49a6-9c12-c4288e2afb8b`. Aucune page par parfum ou par marque :
  personne ne tombe sur Perfumee en cherchant « Baccarat Rouge 540 occasion ».
- 3 balises H1 identiques sur chaque annonce ; la page « Comment ça marche » s'intitule « Fonctionnement ».
- Pas de `llms.txt`, pas de données structurées produit/offre exploitables par les moteurs et les assistants.
- Les « source maps » sont en ligne : le code source du site est lisible par tous.
- La carte « Emplacement » de l'annonce reste grise ; le bloc « Fraîchement déposés » de l'accueil est vide au premier
  affichage.
- Accueil : 1,4 Mo transférés, 48 requêtes.

## 4. Le parcours, étape par étape

### Vendre
1. Inscription (e-mail, Google ou Facebook) et « engagement » d'authenticité (voir plus haut).
2. Annonce : type, catégorie, titre, marque, nom, champs, au moins 3 photos (dessous du flacon obligatoire, niveau,
   boîte), prix (conseil : « commencez à −30 % ») ; livraison : envoi et/ou main propre.
3. **Validation manuelle** avant publication : « cela peut prendre un petit peu de temps » (FAQ) ; jusqu'à une semaine
   selon des avis Trustpilot.
4. Vente : le vendeur reçoit une étiquette Mondial Relay ou organise la remise en main propre par la messagerie.
5. Paiement : après « J'ai reçu et j'en suis satisfait », ou automatiquement 48 h après réception, ou 14 jours après
   que le vendeur a déclaré l'envoi livré. Puis **7 à 10 jours ouvrés** de virement Stripe (CGU) ; « 1 semaine au
   maximum » selon la FAQ.
6. Lots : un seul prix total, la liste des parfums écrite dans la description.

### Acheter
1. Recherche par mots-clés et filtres ; tri par date ou prix.
2. Annonce : photos du vendeur, détails, vendeur (initiales), « La protection Perfumee ».
3. Paiement par carte (Stripe) : prix + **5 % de « Protection »** + port. Mondial Relay dans 9 pays (France, Belgique,
   Allemagne, Espagne, Italie, Luxembourg, Pays-Bas, Pologne, Portugal), ou main propre.
4. **48 heures** après réception pour signaler un problème, par e-mail (contact@perfumee.fr).

### Ce que paie chacun

Sur un flacon vendu 100 € : l'acheteur paie 105 € + port ; le vendeur touche 90 € ; Perfumee garde **15 €, soit 15 %**.

## 5. Ce que disent vraiment les textes

C'est la faiblesse centrale. Le site promet la sécurité ; les CGU et la FAQ la retirent.

| La vitrine dit | Les textes disent |
|---|---|
| « Annonces pré-vérifiées », « des parfums authentiques » | FAQ : « nous ne garantissons ni leur authenticité ni leur conformité » ; CGU : « Les Vendeurs sont les seuls responsables de la provenance et de l'authenticité » ; Perfumee « n'exerce aucun contrôle sur les ventes » |
| « Remboursé en cas de non-livraison » | Colis perdu : l'acheteur est remboursé, **le vendeur n'est pas payé** (« ne pourra pas être remboursé ni percevoir le paiement ») |
| « Paiement envoyé dès que l'acheteur a reçu son colis » | 48 h d'attente, puis 7 à 10 jours ouvrés de virement |
| « En toute sécurité » | 48 h pour tout signaler ; au-delà la vente est conclue. Neuf ouvert par l'acheteur : aucun remboursement. Changement d'avis sur un parfum utilisé : port aller et retour à la charge de l'acheteur |
| La vérification | Des photos regardées par une personne. Pas d'examen physique, pas de mesure du niveau, pas de contrôle du jus. Contre la dilution : « un système de notation » et le bannissement |
| « Frais Perfumee » | CGU : des « frais d'annulation » et « frais de non-conformité » peuvent être facturés au vendeur, sans montant |

Autres points relevés :
- Interdits : contrefaçons, testeurs, échantillons offerts. Acceptés : échantillons achetés, coffrets scellés,
  flacons vides « rares ou de collection ».
- La FAQ prévoit le cas « le parfum que j'ai acheté a déjà été vendu » : des vendeurs vendent le même flacon ailleurs
  (Vinted, Leboncoin), et rien ne l'empêche.
- « + 3 000 ventes » sur l'accueil, « plus de 5 000 parfums » sur « Comment ça marche », « jusqu'à 70 % » sur le site,
  « jusqu'à 80 % » dans la presse : les chiffres varient d'une page à l'autre.

## 6. Ce qui manque à Perfumee

### La confiance
1. **Aucune authentification physique.** Rien ne prouve qu'un flacon est vrai, ni qu'il contient ce qu'il dit.
2. **Aucune mesure du niveau.** Cinq tranches déclarées par le vendeur (« plein = 90 à 100 % ») : sur un 100 ml, 10 ml
   d'écart, soit 20 à 30 € sur un parfum de niche.
3. **Aucune garantie portée par la plateforme.** Tout repose sur le vendeur ; 48 h pour réagir.
4. **Pas d'identité vérifiée visible**, pas de score vendeur détaillé (délai d'envoi, litiges), pas de badge.
5. **Pas d'historique du flacon.** Revendu trois fois, il repart de zéro à chaque fois.
6. **Rien contre la double vente** entre plateformes.

### Le produit
7. **Pas de catalogue.** Marque et nom en texte libre : pas de filtre par marque, pas de page par parfum, pas de
   regroupement des offres d'un même parfum, des titres comme « Parfum ».
8. **Pas de prix de référence.** Ni cote, ni historique des ventes, ni prix au ml, ni prix neuf de comparaison.
   Le seul outil est le conseil « commencez à −30 % ».
9. **Pas d'alertes**, pas de recherche sauvegardée, pas de liste d'envies (seulement des favoris d'annonces).
10. **Pas de collection**, pas d'échanges, pas d'enchères, pas de lots structurés, pas de décants organisés.
11. **Pas d'application mobile**, réclamée par les utilisateurs.
12. **Une seule langue, 9 pays**, alors que la communauté du parfum de niche est européenne.

### La vente
13. **Validation lente** (jusqu'à une semaine), vente sans aide : pas de scan de code-barres, pas de prix suggéré,
    pas de photos guidées.
14. **15 % de commission** (10 % + 5 %), plus le port, et un vendeur non payé si le colis se perd.
15. **Pas de service « on s'occupe de tout »** pour ceux qui ont dix flacons et pas le temps.

### Le cadre
16. **Le transport du parfum.** La Poste interdit le parfum en colis postal (liquide inflammable). Mondial Relay ne
    publie pas de liste claire ; les guides d'envoi le donnent comme interdit. Perfumee expédie pourtant tout par
    Mondial Relay, sans emballage fourni ni consigne particulière.
17. **Le droit des marques.** La Cour de cassation (ch. com., 6 décembre 2023, n° 20-18.653, Chanel contre Easy
    Cash) admet qu'une marque s'oppose à la revente de produits dont l'état a été modifié ou altéré, et à celle
    d'échantillons gratuits. La revente de parfums entamés est donc exposée. Perfumee n'a aucune relation affichée avec
    les marques.
18. **Le contenu.** Guide statique, interviews renvoyées vers Instagram, aucune page par parfum, aucune donnée
    propre (alors que 7 400 annonces produisent déjà des prix exploitables).

## 7. Les autres acteurs

| Acteur | Ce qu'il fait | Ce qui lui manque |
|---|---|---|
| **Vinted** | Le réflexe seconde main des Français | Interdit les parfums utilisés ou non scellés (« même une seule fois ») ; les vendeurs Pro ne peuvent pas vendre de cosmétiques. Le parfum entamé n'y a pas sa place |
| **Leboncoin** | Généraliste, main propre | Aucune garantie spécifique, aucune vérification |
| **Reflaco** (reflaco.fr, récent) | Catalogue, millilitres restants, offres, alertes, porte-monnaie, 5 % côté vendeur, paiement bloqué jusqu'à réception | Pas d'authentification physique ; débute (« Reflaco démarre ! ») ; pas de transport conforme affiché |
| **Mïron** (2023) | Seconde main « certifiée par un nez » | Méthode non décrite ; commentaires sous l'article de L'ADN (2024-2026) de vendeurs disant ne pas avoir été payés |
| **Conscience — Fragrance²** | Dépôt-vente en boutique (Paris 20e), flacons de moins de 12 mois, au moins à moitié pleins | Physique, local, très restrictif |
| **Groupes Facebook, Reddit** | Échanges entre passionnés | Aucune protection |
| **Spritz** (États-Unis) | Échanges avec soulte, enchères, authentification optionnelle en entrepôt, historique des prix, alertes, tri « meilleure affaire », décants | N'existe pas en Europe |
| **Rescented** (États-Unis) | 40 000 membres, offres, lots, profils de collectionneurs, badges | 20 % de commission vendeur + 15 $ d'authentification et livraison |
| **Scentfine** | Base de 120 000 parfums, guide de prix, protection acheteur | Pas en France |

**Le marché** : le parfum est le premier marché de la beauté de prestige en France (2,3 Md€, en recul de 3 % en
valeur et 5 % en volume selon Premium Beauty News). La seconde main pèse 14 Md€ en France (Xerfi, 2024). Selon une
étude Mïron sur 2 000 personnes, 59 % des Français ont un parfum qu'ils ne portent pas. La contrefaçon est massive :
82 000 faux parfums saisis en une semaine lors de l'opération « Fragrance » des douanes (novembre 2025), et une usine
démantelée en Catalogne en février 2026.

**L'espace libre** : personne, en Europe, ne prouve l'authenticité et le niveau d'un parfum entamé, ne donne sa cote,
et ne l'expédie dans les règles. C'est là que se place l'alternative (voir `STRATEGIE.md`).

## Sources

- Le site : https://www.perfumee.fr (accueil, /s, /p/comment-ca-marche, /p/faq, /p/faq-vendeur, /p/faq-acheteur,
  /p/lutte-contrefacon, /p/declaration-vendeur, /p/guide-livraison, /p/charte-ethique, /p/prix-page,
  /p/histoire-page, /p/interview, /p/mentionslegales, /terms-of-service, /robots.txt, /sitemap-index.xml)
- Trustpilot : https://fr.trustpilot.com/review/perfumee.fr
- Registre : https://www.societe.com/societe/perfumee-931084354.html
- Fondation Le Roch-Les Mousquetaires : https://fondationleroch-lesmousquetaires.org/portraits-entrepreneurs/tara-roumian/
- Business O Féminin : https://www.businessofeminin.com/interview-de-tara-roumian-porteuse-du-projet-perfumee/
- Scentimental : https://scentimental.fr/perfumee-startup/
- Reflaco : https://reflaco.fr/
- Mïron (L'ADN) : https://www.ladn.eu/actualite/miron-plateforme-seconde-main-parfums/
- Conscience Fragrance² : https://www.conscience-parfums.fr/fragrance2
- Vinted, règles du catalogue : https://www.vinted.fr/catalog-rules
- La Poste, envoi de liquides : https://www.laposte.fr/envoyer/envoi-liquides
- Eurosender, envoi de parfum : https://www.eurosender.com/fr/envoyer-emballer/parfum
- Chanel c. Easy Cash, Cass. com. 6 déc. 2023 n° 20-18.653 : https://pibd.inpi.fr/sites/default/files/2024-01/M20230236.pdf
- Douane, opération Fragrance : https://www.douane.gouv.fr/actualites/la-douane-francaise-et-ses-allies-contre-les-contrefacons-de-parfums
- Douane, Catalogne : https://www.douane.gouv.fr/actualites/demantelement-de-la-plus-grande-usine-europeenne-de-parfums-contrefaits-en-catalogne
- Premium Beauty News, beauté prestige 2025 : https://www.premiumbeautynews.com/fr/beaute-prestige-2025-la-france,27211
- Spritz : https://apps.apple.com/us/app/fragrance-marketplace-spritz/id6792328619
- Rescented : https://apps.apple.com/us/app/rescented-buy-sell-fragrances/id6737845912
- Scentfine : https://play.google.com/store/apps/details?id=com.scentfine
