# Audit SEO + GEO : oneplacewellness.com (12 octobre 2026)

Audit en lecture seule du site actuel, fait avant la refonte. Rien n'a été modifié sur leur site.

Le site actuel est fait avec l'éditeur de sites de GoDaddy (Website Builder) : photos sur `img1.wsimg.com`, plan du site en `sitemap.website.xml`, `llms.txt` généré automatiquement. L'origine retenue est `https://oneplacewellness.com/`.

**Comment le site a été lu.** Le serveur du site coupe les connexions venues de notre environnement (« connection reset »), qu'elles viennent d'un navigateur automatisé ou d'une simple requête avec un agent utilisateur descriptif (`maquinable-geo/0.1`). Une seule requête a abouti (`robots.txt`, une fois), les suivantes ont été coupées. Rien n'a été contourné : pas de proxy tiers, pas d'agent utilisateur déguisé. `robots.txt`, le plan du site, `llms.txt` et le texte des 9 pages ont été lus avec l'outil de lecture web (WebFetch), une requête à la fois. Cet outil rend le texte de la page, pas son code : l'en-tête HTML (titre, description, balises de partage, URL canonique, données structurées) et les attributs `alt` des images n'ont pas pu être vérifiés (voir « Non vérifié »).

## Résumé
- Pages vérifiées : 9, sur 9 dans le plan du site (texte seulement, voir ci-dessus).
- Problèmes critiques : 0
- Avertissements : 9
- Opportunités : 4

## CRITIQUE (à corriger tout de suite)
Rien de critique au sens strict : aucune page publique n'est bloquée pour Googlebot ni pour Bingbot (130 combinaisons testées, voir « robots.txt »).

Le premier avertissement est pourtant à traiter en priorité : il touche chaque visiteur qui arrive d'un moteur de recherche avec l'envie de réserver.

## AVERTISSEMENTS
1. **Le bouton principal mène à une page désactivée.** « Complimentary Consult », sur l'accueil, ouvre la réservation en ligne (`web2.myaestheticspro.com/booknow/…`), qui affiche : « This booking link has been disabled. We are currently not accepting new bookings from this interface. »

   → Remplacer le lien par le téléphone (`tel:+12392628585`) et une demande écrite, ou réactiver la réservation en ligne.
2. **Deux horaires différents.**
   - L'accueil et la fiche de l'entreprise (reprise dans leur `llms.txt`) : du lundi au jeudi, de 9 h à 16 h, fermé du vendredi au dimanche.
   - La page Contact : du lundi au vendredi, de 9 h à 17 h (les horaires par défaut du module de GoDaddy).

   Un moteur ou un assistant IA peut donner l'un ou l'autre.

   → Corriger le module Contact pour qu'il dise la même chose que l'accueil, et vérifier la fiche Google Business Profile.
3. **La page Contact n'a ni l'adresse ni le courriel.** Elle n'a que le nom du cabinet, les horaires (faux, voir 2), un formulaire (nom, courriel) et le téléphone. L'adresse n'apparaît que dans le pied de l'accueil et dans `llms.txt`, sans code postal.

   → Le nom, l'adresse complète (827 Myrtle Terrace, Naples, FL 34103) et le téléphone, écrits pareil sur chaque page : c'est la base du référencement local.
4. **Un plan du site cassé.** `sitemap.xml` est un index qui renvoie vers deux plans :
   - `sitemap.website.xml` : les 9 pages, toutes modifiées le 18 novembre 2025 ;
   - `sitemap.ola.xml` (le module de rendez-vous en ligne de GoDaddy) : répond **400 Bad Request**.

   → Retirer le module de rendez-vous inutilisé, ou le réparer, pour que l'index ne renvoie plus vers une erreur.
5. **`robots.txt` n'indique pas le plan du site.** Il ne contient que `User-agent: *` et `Disallow: /404`.

   → Ajouter `Sitemap: https://oneplacewellness.com/sitemap.xml`.
6. **Un accueil sans structure de titres.** D'après le texte converti : un seul titre principal, « Non Surgical Rejuvenation », puis 18 intertitres dont :
   - « About Dr. Fox » six fois ;
   - « thermismooth » six fois, « ThreadLIFT » trois fois ;
   - « LASER » sans texte dessous, et le texte sur le Botox sous « ThreadLIFT ».

   Un moteur ou un assistant ne peut pas savoir quel texte parle de quel soin.

   → Un intertitre par soin, au-dessus de son propre texte, une seule fois ; « About Dr. Fox » une fois.
7. **Une page vide : `/medical-skincare`.** Elle n'a que le menu. Une page vide dans le plan du site est un signal de faible qualité.

   → Y écrire ce que fait le cabinet (Obagi, SkinCeuticals, le rétinol avec ThermiSmooth), ou la retirer du plan du site.
8. **Des coquilles sur les pages de soins, dont des noms de produits.** « Canidates », « Restylene » (au lieu de Restylane), « Lawlije » (jawline), « Poly-L-Latic », « complementary » (au lieu de complimentary), « retina » (au lieu de retinol), et une phrase inachevée sur le collagène. Une recherche « Restylane Naples » ne trouve pas « Restylene ».

   → Corriger ; c'est l'affaire de quelques minutes dans l'éditeur.
9. **Aucune photo de la docteure ni du cabinet.** Les photos des pages viennent de la banque d'images Getty fournie par GoDaddy (`img1.wsimg.com/isteam/getty/…`). Elles ne montrent ni Dr. Fox ni le 827 Myrtle Terrace. Pour un cabinet médical, une vraie photo de la praticienne est un signal de confiance, pour les patients comme pour les moteurs.

   → Un portrait de Dr. Fox et une photo du cabinet, avec un texte alternatif qui dit qui et où.

## GAINS RAPIDES (fort impact, peu d'effort)
Tout se règle dans l'éditeur de GoDaddy :
1. Remplacer le lien « Complimentary Consult » par le téléphone (avertissement 1).
2. Corriger les horaires du module Contact, et y ajouter l'adresse et le courriel (avertissements 2 et 3).
3. Corriger les coquilles, surtout « Restylene » (avertissement 8).
4. Ajouter la ligne `Sitemap:` à `robots.txt`, si l'éditeur le permet, et retirer le module de rendez-vous inutilisé (avertissements 4 et 5).

## OPPORTUNITÉS GEO
1. **`robots.txt` laisse passer tous les robots, et c'est à garder.** Les robots des moteurs (Googlebot, Bingbot) et ceux des assistants IA (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User), comme ceux d'entraînement (Google-Extended, CCBot, Bytespider), peuvent lire les 9 pages et `llms.txt`. Bloquer les robots d'entraînement est un choix possible, à faire en connaissance de cause.
2. **Un `llms.txt` existe, mais il ne dit presque rien.** GoDaddy l'a généré : le nom, une phrase (« One Place Wellness - Non Surgical Rejuvenation »), les 9 pages, les horaires, l'adresse sans code postal, le téléphone, le courriel, Facebook et Instagram. Rien sur Dr. Fox (chirurgienne plasticienne, 25 ans de liftings, 9 000 patients, formatrice Radiesse), ni sur les soins, leurs durées ou les produits utilisés : ce sont précisément les questions qu'on pose à un assistant (« combien de temps dure le Botox ? », « temps de récupération d'un threadlift ? »).

   Rappel : `llms.txt` est une proposition, pas un standard, et les assistants IA ne le lisent pas tous.
3. **Des faits précis, à écrire en texte simple.** Leurs pages contiennent déjà les réponses que cherchent les patients, mais dispersées et mal titrées : 45 minutes pour un threadlift, résultat du Botox en 5 à 7 jours et durée de 3 à 6 mois, 98 % de patients cicatrisés en 3 jours pour le MicroLaser Peel, trois séances de ThermiSmooth… Regroupées soin par soin, sous des titres clairs, elles deviennent citables.
4. **Des données structurées à vérifier, puis à compléter.** Elles n'ont pas pu être lues (voir « Non vérifié »). À avoir sur l'accueil : un bloc `MedicalClinic` (ou `MedicalBusiness`) avec l'adresse complète et le code postal, les coordonnées, le téléphone au format `+1-239-262-8585`, les horaires, Facebook et Instagram (`sameAs`), Dr. Fox (`Person`, « Plastic surgeon ») et la liste des soins. Ne pas baliser d'avis en étoiles écrits par le cabinet lui-même : Google ne les affiche pas.

### robots.txt
Contenu lu (WebFetch) :

```
User-agent: *
Disallow: /404
```

Verdict par robot, calculé avec l'analyseur de Python (`urllib.robotparser`), sur les 9 pages du plan du site et `/llms.txt` : 13 robots × 10 adresses = 130 combinaisons, **aucune bloquée**. Un seul analyseur a été utilisé : `protego` (règle de la correspondance la plus longue, celle de Google) n'est pas installé ici ; avec un seul `Disallow: /404`, les deux règles donnent forcément le même résultat.

### Ce que la nouvelle version (`oneplacewellness-site/`) règle déjà
- Une seule page claire, testée de 320 à 1920 px, avec tout le contenu utile des 9 pages : les ombres (leur phrase des 3 à 5 mm), les six soins sur une ligne du temps, les 16 cas de la galerie, la docteure, la visite.
- Plus de lien mort : le téléphone et une demande écrite, partout.
- Un seul horaire (du lundi au jeudi, de 9 h à 16 h, celui de l'accueil et de leur fiche), à confirmer par le cabinet.
- Titre de 52 caractères (« One Place Wellness | Elizabeth Fox, M.D., Naples, FL »), description de 160 caractères, URL canonique.
- Un seul `<h1>`, un `<h2>` par partie, un `<h3>` par soin et par cas ; chaque soin a ses faits écrits en liste, lisibles sans JavaScript.
- Les coquilles corrigées, les superlatifs et les promesses intenables retirés.
- Bloc `MedicalClinic` : adresse complète avec le code postal 34103, coordonnées, téléphone au bon format, courriel, horaires, Facebook, Instagram, Dr. Fox et les six soins.
- Image de partage 1200 × 630 (`assets/og.jpg`), sans photo de banque d'images.
- `robots.txt` avec la ligne `Sitemap:`, `sitemap.xml` et un `llms.txt` écrit avec les faits (la docteure, chaque soin et ses durées, les produits, les horaires).
- La maquette en ligne est en `noindex` (`_headers`, `vercel.json`), à retirer au lancement.
- Lighthouse SEO : 100 sur ordinateur et sur téléphone.

## NON VÉRIFIÉ
- L'en-tête HTML des 9 pages (titre, description, balises de partage, URL canonique), leurs données structurées (JSON-LD) et les attributs `alt` des images : l'outil de lecture web rend le texte, pas le code, et les requêtes directes sont coupées par le serveur. Rien n'a été contourné.
- Le décompte exact des `<h1>` : déduit du texte converti (un seul, « Non Surgical Rejuvenation »), pas du code.
- Performance et mobile par PageSpeed Insights : pas de clé d'API PageSpeed ; Lighthouse ne peut pas charger le site actuel depuis notre environnement. Lighthouse a été passé sur la nouvelle version, voir `README.md`.
- Le second analyseur de `robots.txt` (`protego`) : pas installé, voir plus haut.
- La redirection de `http://` vers `https://` et de `www` vers le domaine nu : non testées, les connexions directes étant coupées.
- Données de Google Search Console (pages réellement indexées, requêtes) : pas d'accès.

Maquinable propose un diagnostic payant avec le score de citabilité IA et le plan de corrections priorisé (voir le README du plugin).
