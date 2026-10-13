# Audit SEO + GEO : hideoutboutique.com (13 octobre 2026)

Audit en lecture seule du site actuel, fait avant la refonte. Rien n'a été modifié sur leur site.

Le site actuel est fait avec WordPress, WooCommerce et Elementor (thème « Solox »), avec Yoast SEO pour les métadonnées et le plan du site. L'origine retenue est `https://www.hideoutboutique.com/` : le domaine nu et `http://` y redirigent (301).

**Comment le site a été lu.** Avec un agent utilisateur descriptif (`maquinable-geo/0.1`), une requête à la fois, à 1,5 s d'intervalle. Le site répond normalement. Les pages ont été lues ce matin pour l'analyse ; les plans du site restants, les articles du blog, les redirections, `llms.txt` et un échantillon de 28 adresses ont été relus cet après-midi. Le HTML brut contient bien le texte des pages : WordPress le produit côté serveur, les robots qui n'exécutent pas JavaScript le lisent.

## Résumé
- Pages vérifiées : 50 (l'accueil, les pages principales, les 6 adresses du blog et les pages de soins), sur 148 adresses dans le plan du site ; statut et balise robots d'un échantillon de 28 autres adresses.
- Problèmes critiques : 0
- Avertissements : 10
- Opportunités : 5

## CRITIQUE (à corriger tout de suite)
Rien de critique au sens strict : aucune page publique n'est bloquée pour Googlebot ni pour Bingbot (312 combinaisons testées, voir « robots.txt »).

Les deux premiers avertissements sont pourtant à traiter en priorité : le premier fait indexer des soins que le cabinet ne propose pas, le second donne une adresse de courriel fausse sur chaque page.

## AVERTISSEMENTS
1. **Des pages sans valeur, indexables et listées dans le plan du site.** Sur 148 adresses, 29 ne sont pas du contenu :
   - 4 pages de démonstration du thème, qui décrivent des soins que le cabinet ne propose pas : Reflexology, Thermo Stone, Hydro Therapy, Aroma Therapy ;
   - 10 pages techniques de WooCommerce et du thème : deux listes d'envies, deux paniers, deux pages de commande, deux comptes, la connexion, un carrousel de produits ;
   - 13 gabarits Elementor publiés comme des pages : 8 en-têtes (`/header/header-two/`…), 3 pieds de page (`/footer/footer-one/`…), 2 méga-menus (`/megamenu/home-showcase/`, titré « Click Mega Menu ») ;
   - l'archive d'auteur `/author/hide1/` (elle affiche aussi l'identifiant de connexion du compte) et la catégorie « Uncategorized ».

   Dans l'échantillon relu, toutes répondent 200 et sont en `index, follow`, sauf les deux paniers `solox-*`, en `noindex` mais toujours listés dans le plan du site.

   → Supprimer les pages de démonstration ; dans Yoast, passer en `noindex` et retirer du plan du site les gabarits (en-têtes, pieds de page, méga-menus), les archives d'auteur et la catégorie « Uncategorized » ; ne plus lister les pages en `noindex`.
2. **De faux liens de contact dans l'en-tête de chaque page**, à côté des bons liens du pied de page.
   - Le courriel pointe vers « hideoutboutque@gmail.com » : il manque un i.
   - Le lien du téléphone est écrit `tel:http://239-936-0758`.
   - Les icônes Facebook et Instagram mènent à facebook.com et instagram.com, pas à leurs pages.

   Pour le référencement local, le nom, l'adresse, le téléphone et le courriel doivent être justes et identiques partout ; un assistant IA qui lit la page peut reprendre le faux courriel.

   → Corriger le widget d'en-tête : `mailto:HideoutBoutique@gmail.com`, `tel:+12399360758`, `https://www.instagram.com/hideoutboutique/`, `https://www.facebook.com/hideoutboutique`.
3. **Pas de titre principal (`<h1>`) sur 47 des 50 pages.** Le thème écrit le titre de chaque page dans un `<h2 class="page-header__title">`. L'accueil n'a pas de `<h1>` non plus (son premier titre est « The Hideout », en `<h2>`). À l'inverse, Fotona 4D en a 5 (ses questions sont en `<h1>`) et Before & After Photos 3. Seules les pages IPL et détatouage en ont un seul.

   → Dans le modèle du thème, passer le titre de page en `<h1>` ; dans le contenu, garder les questions et les parties en `<h2>`.
4. **Pas de description sur 35 des 50 pages**, dont l'accueil des soins (`/services/`), À propos, Contact, la galerie avant/après, les abonnements, les soins du visage, les cils, les trois pages par préoccupation et la plupart des pages de soins. Les moteurs écrivent alors leur propre extrait. Les 15 descriptions présentes sont bonnes (de 137 à 161 caractères).

   → Écrire une description de 100 à 160 caractères par page dans Yoast, en commençant par les pages de soins les plus demandés.
5. **Des titres trop longs : 36 sur 50 dépassent 60 caractères.** Le modèle par défaut ajoute « - Hideout Boutique Med Spa Fort Myers, FL :: Book Online » (jusqu'à 96 caractères, coupés dans les résultats). Les pages récentes utilisent déjà un modèle court (« Med Spa in Fort Myers, FL | Hideout Boutique », « Permanent Jewelry in Fort Myers, FL | Hideout Boutique »).

   → Dans Yoast, remplacer le modèle par défaut par « %title% | Hideout Boutique », et écrire « Fort Myers » dans le titre des pages de soins.
6. **Des pages en double.** LipLase (`/liplase/` et `/liplase-2/`), NightLase (`/nightlase/` et `/nightlase-2/`) et TightSculpt (`/tightsculpt/` et `/tightsculpt-2/`) ont chacune deux pages au même titre, chacune avec sa propre adresse canonique : elles se font concurrence. Le plan du site liste aussi `/elementor-2715/`, qui redirige vers l'article sur le Botox, et `/shop-skin-care/` deux fois.

   → Garder une page par soin, rediriger l'autre (301) et corriger les liens du menu ; retirer `/elementor-2715/` du plan du site.
7. **Une adresse du plan du site répond 404 :** `/brand/skinbetter/` (plan `pa_brand-sitemap.xml`).

   → Retirer ce plan de l'index de Yoast, ou réparer l'archive de la marque.
8. **Des données structurées approximatives.**
   - L'accueil décrit l'entreprise deux fois, sans lien entre les deux : un bloc `Organization` (Yoast), avec Facebook seulement, et un bloc `DaySpa`.
   - Le type `DaySpa` ne dit pas qu'il s'agit d'un med spa avec un directeur médical, une infirmière praticienne et une infirmière.
   - Le téléphone est écrit `2399360758`, sans indicatif.
   - L'image du bloc `DaySpa` pointe vers un fichier qui n'existe pas (`…/2023/09/hideout-boutique-logo`, 404).
   - Pas d'Instagram (`sameAs`), pas de mention « sur rendez-vous », pas de liste des soins.

   → Un seul bloc, de type `MedicalBusiness` et `HealthAndBeautyBusiness`, avec un `@id` partagé : nom, adresse, coordonnées, `+1-239-936-0758`, courriel, logo existant, Instagram et Facebook, l'équipe médicale, les familles de soins et les abonnements avec leurs prix.
9. **Les images des galeries n'ont pas de texte alternatif.** 111 des 406 images des 50 pages ont un `alt` vide. Ce sont surtout les avant/après, leur meilleure preuve : 27 sur 31 sur la page des injections de Lina, 35 sur 47 sur les trois pages de maquillage permanent, 16 sur 20 sur le maquillage, 13 sur 17 sur les cils.

   → Décrire chaque avant/après : le soin et la praticienne (« Before and after: lip filler by Lina Davis, NP-C »).
10. **Une chaîne de redirections et des pages minces.**
    - `http://www.hideoutboutique.com/` passe par `https://hideoutboutique.com/` avant d'arriver sur `https://www.hideoutboutique.com/` : deux redirections au lieu d'une.
    - Plusieurs pages n'ont presque pas de texte propre. La page des bijoux permanents n'a qu'un titre (son texte n'est que dans la description pour Google) ; Sculptra, PDO et LipLase tiennent en un paragraphe ; les trois pages par préoccupation comptent environ 260 mots, menus compris.

    → Une seule redirection 301 vers `https://www.`, et quelques phrases de faits sur chaque page mince (pour qui, combien de séances, combien de temps).

## GAINS RAPIDES (fort impact, peu d'effort)
Tout se règle dans WordPress, sans développement :
1. Corriger les liens de l'en-tête : courriel, téléphone, réseaux (avertissement 2).
2. Supprimer les 4 pages de démonstration et sortir les gabarits, l'auteur et « Uncategorized » de l'index et du plan du site (avertissement 1).
3. Changer le modèle de titre de Yoast (avertissement 5).
4. Rediriger les trois pages en double (avertissement 6).
5. Passer le titre de page du thème en `<h1>` (avertissement 3) : un seul réglage du modèle, pour toutes les pages.

## OPPORTUNITÉS GEO
1. **`robots.txt` laisse passer tous les robots, et c'est à garder.** Les robots des moteurs (Googlebot, Bingbot) et ceux des assistants IA (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User), comme ceux d'entraînement (Google-Extended, CCBot, Bytespider), peuvent tout lire. Bloquer les robots d'entraînement est un choix possible, à faire en connaissance de cause.
2. **Pas de `llms.txt`** (404). Un court fichier en Markdown présenterait le cabinet comme un assistant doit le résumer : l'adresse, « sur rendez-vous », l'équipe médicale et ses diplômes, les cinq familles de soins, les abonnements et leurs prix, la réservation Boulevard.

   Rappel : `llms.txt` est une proposition, pas un standard, et les assistants IA ne le lisent pas tous.
3. **Des faits précis, à écrire en texte simple.** Leurs pages contiennent déjà ce qu'on demande à un assistant, mais dispersé : SkinPen (30 à 60 min, rougeur 2 à 4 jours, 2 ou 3 séances), Morpheus8 (2 à 10 jours d'éviction sociale), Tox (3 à 4 mois, résultat complet à deux semaines), BioRePeel (4 à 6 séances), le Beauty Bank (99 $ par mois, trois mois au moins, l'argent n'expire jamais). Regroupés soin par soin, sous des titres clairs, ils deviennent citables.
4. **Des articles à rendre attribuables.** Les 5 articles du blog (sur le Botox, Morpheus8, l'HydraFacial et le détatouage) sont de vrais articles de fond, mais Yoast les décrit comme des `ItemPage`, sans `Article` ni `BlogPosting`, sans auteur ni titre structuré. Un assistant ne peut pas dire qui a écrit l'article ni quand.

   → Type d'article `BlogPosting` dans Yoast, avec son vrai auteur ; la compétence `geo-optimize` du plugin ajoute à chaque article un court résumé et une FAQ.
5. **L'équipe médicale, nommée et balisée.** Leur différence avec un institut tient en quelques noms : Dr. Davek Sharma, MD (directeur médical), Lina Davis, NP-C (toutes les injections), Diana Fermin, RN, et la fondatrice, anesthésiste assistante certifiée. Une page d'équipe avec ces diplômes en texte, et des blocs `Person` reliés à l'entreprise, donnent aux moteurs et aux assistants de quoi répondre à « qui fait les injections chez Hideout ? ».

### robots.txt
Contenu (généré par Yoast) :

```
User-agent: *
Disallow:

Sitemap: https://www.hideoutboutique.com/sitemap_index.xml
```

Verdict par robot, calculé avec deux analyseurs (`urllib.robotparser`, la première règle qui correspond, et `protego`, la règle la plus longue de la RFC 9309, celle de Google), sur l'accueil, un échantillon de 22 adresses des plans du site et `/llms.txt` : 13 robots × 24 adresses = 312 combinaisons, **aucune bloquée**, et les deux analyseurs sont d'accord partout. La ligne `Sitemap:` est présente.

### Ce que la nouvelle version (`hideout-site/`) règle déjà
- Une seule page claire, testée de 320 à 1920 px, avec le contenu utile de leurs pages : 55 soins en cinq familles avec leurs faits (durée, éviction, séances), les trois préoccupations, 38 avant/après signés, l'équipe, les abonnements et leurs prix, la visite.
- Plus de page de démonstration ni de gabarit : seulement leur contenu réel.
- Des liens de contact justes : `tel:+12399360758`, le bon courriel, leurs vraies pages Instagram et Facebook.
- Titre de 44 caractères (« Hideout Boutique | Med Spa in Fort Myers, FL »), description de 147 caractères, adresse canonique.
- Un seul `<h1>`, un `<h2>` par partie, un `<h3>` par famille de soins et par personne ; tout le texte est dans le HTML, lisible sans JavaScript.
- Un texte alternatif sur les 55 photos qui portent une information ; chaque avant/après dit le soin et la praticienne.
- Un seul bloc de données structurées, `MedicalBusiness` et `HealthAndBeautyBusiness` : adresse, coordonnées, `+1-239-936-0758`, courriel, fondatrice, équipe médicale, familles de soins, les trois abonnements avec leurs prix, Instagram et Facebook, réservation Boulevard.
- `robots.txt` avec la ligne `Sitemap:`, `sitemap.xml`, un `llms.txt` écrit avec les faits, et une image de partage 1200 × 630.
- La maquette en ligne est en `noindex` (`_headers`, `vercel.json`), à retirer au lancement.
- Lighthouse SEO : 100 sur ordinateur et sur téléphone.

## NON VÉRIFIÉ
- 98 des 148 adresses du plan du site n'ont pas été contrôlées page par page (limite de 50 pages) : surtout les produits, les étiquettes et catégories de la boutique et les gabarits. Leur statut a été relevé sur un échantillon de 28.
- Performance et mobile par PageSpeed Insights : pas de clé d'API PageSpeed. Lighthouse a été passé sur la nouvelle version, voir `README.md`.
- Données de Google Search Console (pages réellement indexées, requêtes) : pas d'accès.
- La fiche Google Business Profile (horaires, catégorie, avis) : hors du site, pas lue.

Maquinable propose un diagnostic payant avec le score de citabilité IA et le plan de corrections priorisé (voir le README du plugin).
