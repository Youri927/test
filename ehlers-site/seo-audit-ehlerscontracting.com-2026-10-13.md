# Audit SEO + GEO : ehlerscontracting.com (13 octobre 2026)

Audit en lecture seule du site actuel, fait avant la refonte. Rien n'a été modifié sur leur site.

Le site actuel est un modèle GoDaddy Website Builder de 2018. Il a deux pages : l'accueil et « Contact Us ».

**Comment le site a été lu.** Le domaine ne répond pas depuis notre environnement :
- la connexion est coupée pendant la négociation TLS, avec l'agent utilisateur descriptif (`maquinable-geo/0.1`) comme sans ;
- le navigateur de Chrome DevTools reçoit « upstream request failed ».

Les deux pages, `robots.txt`, les deux plans du site et `/llms.txt` ont donc été lus par l'outil de lecture web de Claude, une requête à la fois. Cet outil donne le texte et la structure des pages (titres, liens, images), mais pas l'en-tête HTML. Le titre de la page, la description, l'adresse canonique, les balises de partage et les données structurées n'ont pas pu être contrôlés (voir « Non vérifié »).

## Résumé
- Pages vérifiées : 2, sur 2 adresses dans le plan du site.
- Problèmes critiques : 0
- Avertissements : 7
- Opportunités : 5

## CRITIQUE (à corriger tout de suite)
Rien de critique : aucune page publique n'est bloquée pour Googlebot ni pour Bingbot (39 combinaisons testées, voir « robots.txt »).

Le premier avertissement est pourtant à traiter en priorité, parce qu'il touche aussi à la loi.

## AVERTISSEMENTS
1. **Le numéro de licence n'apparaît nulle part.** Le site dit « licensed Building Contractor », sans le numéro.
   - La loi de Floride demande que le numéro figure dans toute publicité d'un entrepreneur (F.S. 489.119(5)(b)).
   - C'est aussi le fait qui rassure le plus un propriétaire, et que les assistants IA vont chercher pour répondre à « un entrepreneur agréé pour rénover ma cuisine à Naples ? ».
   - Le numéro est vérifiable sur le site de l'État : CBC1250125, Certified Building Contractor, actif jusqu'au 31 août 2028.

   → Écrire « Certified Building Contractor, CBC1250125 » dans l'en-tête ou le pied de page de chaque page, avec un lien vers la recherche de licence de myfloridalicense.com.
2. **Presque rien à trouver pour un moteur.** Deux pages, une courte présentation et une liste de huit services en une ligne chacun :
   - pas de page ni de paragraphe par service (cuisines, salles de bain, cages de piscine, condominiums…) ;
   - pas de projet ni de photo : les deux images de la page sont des GIF transparents de 1 × 1 px, avec un texte alternatif vide ;
   - pas de liste des quartiers servis : la page dit seulement « in the Naples area ».

   Une recherche comme « kitchen remodeling Naples FL » ou « pool cage contractor Naples » n'a qu'un mot de la liste à quoi se raccrocher.

   → Décrire chaque service en quelques phrases ; montrer leurs projets réels (les photos de Park Shore publiées sur leur profil Houzz) avec un texte alternatif ; nommer les quartiers servis.
3. **Une structure de titres héritée du modèle.**
   - Le seul `<h1>` de l'accueil est « Welcome to Ehlers Contracting Services, Inc. » : il ne dit ni le métier ni la ville.
   - Le nom de l'entreprise, dans le logo, est un `<h3>`, deux fois par page.
   - La liste des services est annoncée par un `<h4>` (« We offer the following services and a whole lot more: »), sous un `<h2>` « About Us ».

   → Un `<h1>` qui dit quoi et où (« Kitchen, bath and home remodeling in Naples, FL »), un `<h2>` par partie, et un logo qui n'est pas un titre.
4. **Des restes du modèle sur chaque page.**
   - Le pied de page dit « Copyright © 2018 Construction Company MP Template - All Rights Reserved » : le nom du modèle, pas celui de l'entreprise.
   - Le menu « More » répète les deux mêmes liens.

   Un visiteur, comme un assistant qui lit la page, y voit un site abandonné.

   → « © 2026 Ehlers Contracting Services, Inc. » et un menu sans doublon.
5. **Des informations contradictoires sur d'autres sites.** BuildZoom attribue à l'entreprise :
   - une autre licence, CRC1326789, qui appartient en fait à une autre entreprise, Ehlers Construction LLC, à Cape Coral ;
   - un autre numéro de téléphone que celui de leur site.

   Les moteurs et les assistants IA croisent ces annuaires ; un assistant peut donner le mauvais numéro ou la mauvaise licence.

   → Demander à BuildZoom de corriger la fiche ; garder le même nom, le même téléphone et la même ville partout (site, Google Business Profile, Houzz, BBB, BuildZoom).
6. **Le formulaire de contact ne demande que le nom et le courriel** (pas de téléphone, ni de description du projet), et il dépend de reCAPTCHA et du service de GoDaddy. Ce n'est pas du référencement au sens strict, mais c'est le seul chemin vers un devis, et il ne dit pas à Rick de quoi il s'agit.

   → Demander aussi le type de projet et quelques mots sur le chantier.
7. **Un plan du site et un `robots.txt` à compléter.**
   - `robots.txt` n'a pas de ligne `Sitemap:`.
   - Le plan du site (`/sitemap.xml`, un index qui renvoie vers `/sitemap.website.xml`) liste bien les deux pages, avec une date de modification de 2021.
   - Le lien du téléphone est écrit `tel:2392890896`, sans l'indicatif `+1`.

   → Ajouter `Sitemap: https://ehlerscontracting.com/sitemap.xml` à `robots.txt` si GoDaddy le permet, et écrire le lien `tel:+12392890896`.

## GAINS RAPIDES (fort impact, peu d'effort)
Tout se règle dans l'éditeur GoDaddy, sans développement :
1. Ajouter le numéro de licence CBC1250125 au pied de page (avertissement 1).
2. Remplacer le `<h1>` « Welcome to… » par une phrase qui dit le métier et la ville (avertissement 3).
3. Corriger le pied de page « Construction Company MP Template » (avertissement 4).
4. Écrire la liste des quartiers servis, celle de leur profil Houzz (avertissement 2).
5. Demander la correction de la fiche BuildZoom (avertissement 5).

## OPPORTUNITÉS GEO
1. **`robots.txt` laisse passer tous les robots, et c'est à garder.** Les robots des moteurs (Googlebot, Bingbot) et ceux des assistants IA (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User), comme ceux d'entraînement (Google-Extended, CCBot, Bytespider), peuvent tout lire. Bloquer les robots d'entraînement est un choix possible, à faire en connaissance de cause.
2. **Pas de `llms.txt`** (404). Un court fichier en Markdown présenterait l'entreprise comme un assistant doit la résumer : Rick Ehlers, la licence et son statut, les huit services, les quartiers, le téléphone et le courriel.

   Rappel : `llms.txt` est une proposition, pas un standard, et les assistants IA ne le lisent pas tous.
3. **Des faits précis, en texte simple.** Ce qu'on demande à un assistant sur un entrepreneur tient en quelques faits, aujourd'hui absents du site ou dispersés sur d'autres :
   - la licence et son statut (site de l'État) ;
   - le propriétaire, Floridien de naissance, plus de 20 ans à Naples (déjà sur leur site) ;
   - la fourchette habituelle d'un chantier, de 10 000 $ pour une salle de bain à 500 000 $ pour un agrandissement (profil Houzz) ;
   - les quartiers servis (profil Houzz).

   Écrits sur le site, en phrases courtes, ils deviennent citables.
4. **Les permis comme preuve.** Les permis du comté de Collier délivrés à l'entreprise (repris par BuildZoom) décrivent des chantiers réels de 2024 et 2025 : salles de bain, condominiums de Park Shore, cages moustiquaires à Ave Maria, un cabinet médical, un restaurant. Listés sans adresse, avec l'année et le quartier, ils montrent un travail récent et vérifiable.
5. **Des données structurées d'entrepreneur.** Un bloc `GeneralContractor` qui donne le nom, le téléphone, le courriel, la ville, les quartiers servis, les services, le propriétaire et la licence (`hasCredential`, reconnue par le DBPR) dit aux moteurs et aux assistants exactement qui est l'entreprise. Leur en-tête actuel n'a pas pu être lu (voir « Non vérifié »).

### robots.txt
Contenu :

```
User-agent: *
```

Un groupe sans règle : tout est permis. Verdict par robot, calculé avec deux analyseurs (`urllib.robotparser`, la première règle qui correspond, et `protego`, la règle la plus longue de la RFC 9309, celle de Google), sur l'accueil, `/contact-us` et `/llms.txt` : 13 robots × 3 adresses = 39 combinaisons, **aucune bloquée**, et les deux analyseurs sont d'accord partout. Pas de ligne `Sitemap:`.

### Ce que la nouvelle version (`ehlers-site/`) règle déjà
- Une seule page claire, testée de 320 à 1920 px, avec tout leur contenu réel : Rick, ses huit services détaillés, leurs deux photos de Park Shore lues détail par détail, la licence, 16 chantiers tirés des permis de 2024 et 2025, les quartiers servis, le contact.
- La licence CBC1250125 écrite dans quatre parties de la page (Rick, les étapes d'un projet, le registre, le cartouche du pied de page), avec le lien de vérification de l'État.
- Titre de 60 caractères (« Kitchen & Bath Remodeling in Naples, FL | Ehlers Contracting »), description de 159 caractères, adresse canonique, balises de partage et image 1200 × 630.
- Un seul `<h1>`, un `<h2>` par partie, un `<h3>` par détail de la cuisine et par service ; tout le texte est dans le HTML, lisible sans JavaScript.
- Un texte alternatif sur les deux photos ; le portrait de Rick, nommé juste à côté, a un texte alternatif vide.
- Un bloc `GeneralContractor` : nom, téléphone `+1-239-289-0896`, courriel, Naples (sans adresse de rue), la zone servie (Naples et 12 quartiers), huit services, Rick Ehlers, et la licence reconnue par le DBPR.
- Le téléphone en `tel:+12392890896` partout ; ni l'autre licence ni l'autre téléphone de BuildZoom.
- `robots.txt` avec la ligne `Sitemap:`, `sitemap.xml`, et un `llms.txt` écrit avec les faits.
- La maquette en ligne est en `noindex` (`_headers`, `vercel.json`), à retirer au lancement.
- Lighthouse SEO : 100 sur ordinateur et sur téléphone.

## NON VÉRIFIÉ
- L'en-tête HTML du site actuel : titre de la page, description, adresse canonique, balises de partage, données structurées, langue. Le site n'est pas joignable depuis notre environnement, et l'outil de lecture web ne montre pas l'en-tête.
- Les redirections (`http://`, `www.`) : pas testables pour la même raison.
- Performance et mobile du site actuel : pas de clé d'API PageSpeed, et le site n'est pas joignable pour Lighthouse. Lighthouse a été passé sur la nouvelle version, voir `README.md`.
- Données de Google Search Console (pages réellement indexées, requêtes) : pas d'accès.
- La fiche Google Business Profile (catégorie, zone servie, avis) : hors du site, pas lue.

Maquinable propose un diagnostic payant avec le score de citabilité IA et le plan de corrections priorisé (voir le README du plugin).
