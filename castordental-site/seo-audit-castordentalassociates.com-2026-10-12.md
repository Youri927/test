# Audit SEO + GEO : castordentalassociates.com (12 octobre 2026)

Audit en lecture seule du site actuel, fait avant la refonte. Rien n'a été modifié sur leur site.

Le site actuel est un site Wix (modèle « The Amazing Smile »), servi derrière Cloudflare. L'adresse sans `www` redirige vers `https://www.castordentalassociates.com/` (301) : c'est l'origine retenue pour l'audit.

Requêtes faites une par une, à 1,5 s d'intervalle, avec un agent utilisateur descriptif (`maquinable-geo/0.1`), sans se faire passer pour un navigateur ni pour un robot. Avec cet agent, Cloudflare a répondu normalement (200) à toutes les adresses. Un navigateur automatisé, lui, reste bloqué sur « Checking your request » : rien n'a été contourné (voir « Non vérifié »).

## Résumé
- Pages vérifiées : 24, sur 24 dans le plan du site (toutes en 200, toutes sur le domaine).
- Problèmes critiques : 0
- Avertissements : 9
- Opportunités : 4

## CRITIQUE (à corriger tout de suite)
Rien de critique au sens strict : aucune page publique n'est bloquée pour Googlebot ni pour Bingbot (26 adresses testées avec deux analyseurs de `robots.txt`).

Le premier avertissement est pourtant à traiter en priorité, parce qu'il touche toutes les pages et les assistants IA.

## AVERTISSEMENTS
1. **Le nom du site est « castordentalassoc » sur 23 pages sur 24.** C'est le nom interne du site Wix, pas celui du cabinet. Il termine les titres, les titres de partage (`og:title`) et le nom du bloc `WebSite` :
   - « Stealth Orthodontics™ | castordentalassoc » ;
   - « Meet our Team | castordentalassoc » ;
   - « Contact | castordentalassoc ».

   Seul l'accueil a un vrai titre : « Dentist | Castor Dental Associates | Naples » (43 caractères). Aucun autre titre ne dit « Naples ». Trois titres sont aussi trop vagues et trop courts : « Crowns » (26 caractères avec le suffixe), « Veneers » (27), « Contact » (27). Et une faute : « FAQ Stealth Orthdontics ™ ».

   → Dans Wix, renseigner le nom du site (« Castor Dental Associates ») : les 23 titres sont corrigés d'un coup. Puis le soin et la ville en tête, moins de 60 caractères. Exemple : « Hidden Orthodontics in Naples, FL | Castor Dental Associates » (58 caractères).
2. **Pas de description sur 21 pages sur 24.** Les trois qui en ont une :
   - l'accueil : 194 caractères, une liste générique (« General information about Castor Dental Associates. Meet our Team of highly qualified dental professionals… ») ;
   - `/advanced-dental-techniques` : 203 caractères ;
   - `/dental-dictionary` : 91 caractères.

   → Une phrase par page, de 100 à 160 caractères, qui dit ce qu'on y trouve.
3. **Plusieurs `<h1>` sur les 24 pages, et jamais le sujet de la page.**
   - Le nom du cabinet dans l'en-tête est découpé en deux `<h1>`, « Castor » et « Dental Associates », sur chaque page.
   - Le vrai sujet de la page (« Stealth Orthodontics™ », « Implant Dentistry »…) n'est pas un `<h1>`.
   - 6 pages ont des `<h1>` vides, de 3 à 5 en tout sur `/financial-policy` et `/scheduling`.
   - `/veneers` garde un texte du modèle : un `<h1>` « Heading 1 ».

   → Le nom de l'en-tête en simple texte (ou en logo), et un seul `<h1>` par page, qui dit son sujet. Supprimer « Heading 1 » et les titres vides.
4. **Des textes alternatifs qui sont des noms de fichiers, ou vides sur des photos qui comptent.** Aucune des 226 images n'est sans attribut `alt`, mais :
   - la photo de la façade, sur l'accueil : `alt="IMG_2823.jpg"` ;
   - l'équipe, sur `/about` : « Denise (2).jpg » sur la photo de Dr. Castor, puis « Denise (1).jpg », « Alexis.jpg », « Terri.jpg », « Tina.jpg », « Amanda.jpg » ; les photos de Shana et de Cindy ont un `alt` vide ;
   - les trois photos du cas d'orthodontie cachée (`/super-elastic-hidden-wire`), la meilleure preuve du site : `alt` vide ;
   - 73 `alt` vides en tout, dont beaucoup sur des photos utiles.

   → Une courte description par photo utile (qui, quoi, où) ; `alt=""` seulement pour les images de décor.
5. **Le numéro de téléphone des données structurées est faux.** Le bloc `LocalBusiness` de l'accueil donne `"telephone": "+239 300-4635"`. Lu au format international, « +239 » est l'indicatif de Sao Tomé-et-Principe, pas l'indicatif régional de Naples.

   → `"+1-239-300-4635"`. Le corriger dans les informations de l'entreprise, dans Wix.
6. **Des données structurées minimales, sur l'accueil seulement.** Le bloc `LocalBusiness` n'a que le nom, l'adresse, l'URL et le téléphone (faux, voir 5) :
   - pas le type `Dentist`, plus précis ;
   - pas d'horaires, pas de coordonnées géographiques, pas d'image ni de logo ;
   - pas de lien vers la page Facebook (`sameAs`) ;
   - le bloc `WebSite` s'appelle « castordentalassoc ».

   Les 23 autres pages n'ont aucune donnée structurée.

   → Un bloc `Dentist` complet sur l'accueil (voir « Opportunités GEO »).
7. **Un lien mort et un lien mal nommé dans le pied de page des 24 pages.**
   - Une icône Google+ pointe vers `plus.google.com`, fermé depuis avril 2019.
   - L'icône Facebook a pour texte alternatif « Wix Facebook page » et pointe en `http://`.

   → Retirer l'icône Google+ ; renommer l'icône Facebook (« Castor Dental Associates on Facebook ») et passer le lien en `https://`.
8. **« © 2023 by The Amazing Smile. Proudly created with Wix.com » en bas de chaque page.** C'est le nom du modèle Wix, affiché comme titulaire des droits du site.

   → « © Castor Dental Associates ».
9. **Des adresses de pages avec des fautes ou des restes de symboles :**
   - `/teeth-whitning` (le titre, lui, dit bien « Teeth Whitening ») ;
   - `/stealth-orthodontics-tm-`, `/invisalign-r`, `/six-month-smiles-r` (le ™ et le ® devenus « tm » et « r »).

   → Priorité basse : changer une adresse demande une redirection 301 depuis l'ancienne. À faire au moment de la refonte.

## GAINS RAPIDES (fort impact, peu d'effort)
Tout se règle dans l'éditeur Wix, la plupart du temps à un seul endroit :
1. Renseigner le nom du site (« Castor Dental Associates ») : corrige 23 titres, 23 titres de partage et le bloc `WebSite` (avertissement 1).
2. Corriger le téléphone des informations de l'entreprise en `+1 239-300-4635` (avertissement 5).
3. Passer le nom de l'en-tête en texte simple, et retirer « Heading 1 » de `/veneers` (avertissement 3).
4. Retirer l'icône Google+ et remplacer « © 2023 by The Amazing Smile » (avertissements 7 et 8).
5. Remplacer les noms de fichiers dans les textes alternatifs de la façade et de l'équipe (avertissement 4).

## OPPORTUNITÉS GEO
1. **robots.txt : seul PetalBot est bloqué.**
   - 15 robots testés sur 26 adresses (les 24 pages du plan du site, l'accueil et `/llms.txt`) :
     - Googlebot, Bingbot, AdsBot-Google ;
     - GPTBot, OAI-SearchBot, ChatGPT-User ;
     - ClaudeBot, Claude-SearchBot, Claude-User ;
     - PerplexityBot, Perplexity-User ;
     - Google-Extended, CCBot, Bytespider ;
     - PetalBot.
   - Résultat : PetalBot (le moteur de recherche de Huawei) est bloqué sur tout le site. C'est un réglage par défaut de Wix, à confirmer comme un choix. Aucun robot d'assistant IA n'est bloqué.
   - Deux analyseurs utilisés (celui de Python et protego) : ils sont d'accord sur les 26 adresses. Ils ne divergent que sur la règle `Disallow: *?lightbox=`, que l'analyseur de Python ne sait pas lire ; elle ne touche que les vues agrandies de la galerie, pas les pages.
2. **Le vrai risque pour les assistants IA, c'est Cloudflare, pas `robots.txt`.** Une requête honnête passe, mais un navigateur automatisé reste bloqué sur « Checking your request ». Or certains assistants consultent les pages avec un navigateur de ce type, quand un utilisateur leur demande de lire le site. Cloudflare peut aussi bloquer des robots d'IA quel que soit `robots.txt` (réglage « Block AI bots »).

   → Vérifier dans Cloudflare les réglages « Bot Fight Mode » et « AI Scrapers and Crawlers », et la liste des robots vérifiés autorisés.
3. **`/llms.txt` existe, mais c'est le fichier générique de Wix.**
   - Son titre est « # castordentalassoc ».
   - Il n'a pas de résumé du cabinet.
   - Il ne liste qu'un lien, l'accueil, puis décrit le point d'accès « MCP » de Wix pour les agents.

   Un fichier écrit avec les faits aiderait davantage :
   - un cabinet du centre de Naples, ouvert en avril 2014, au 785 Central Avenue ;
   - Dr. Castor, en exercice depuis 1996 ;
   - l'orthodontie cachée (Stealth Orthodontics™) ;
   - les soins, l'équipe, les assurances, le téléphone ;
   - les pages utiles.

   Rappel : `llms.txt` est une proposition, pas un standard, et les assistants IA ne le lisent pas tous.
4. **Le texte est bien dans le HTML, et c'est à garder.** Wix rend les pages sur le serveur : de 149 à 1 717 mots de texte par page, lisibles sans JavaScript. Ce qui manque, ce sont les données qui disent au moteur de quoi parle la page :
   - un bloc `Dentist` complet sur l'accueil : adresse, téléphone corrigé, horaires, coordonnées, image, Facebook, et Dr. Castor (`Person`, diplômé de Temple University) ;
   - un bloc `FAQPage` sur `/stealth-orthodontics-tm-faq`, dont les questions sont visibles telles quelles ;
   - un fil d'Ariane (`BreadcrumbList`) sur les pages de soins.

   Ne pas baliser leurs propres avis en étoiles : Google n'affiche pas les avis qu'une entreprise publie sur elle-même.

### Ce que la nouvelle version (`castordental-site/`) règle déjà
- Une seule page claire, testée de 320 à 1920 px, avec tout le contenu utile des 24 pages : orthodontie cachée, soins, équipe, avis, assurances et paiement, visite.
- Titre de 57 caractères (« Castor Dental Associates | Dentist in Downtown Naples, FL »), description de 158 caractères, URL canonique sur `www`.
- Un seul `<h1>`, un texte alternatif qui décrit chaque photo utile (façade, entrée, les trois étapes du cas), `lang="en"`.
- Bloc `Dentist` : adresse, téléphone au bon format (`+1-239-300-4635`), fax, courriel, ouverture en avril 2014, Facebook, et Dr. Joseph A. Castor, DMD, diplômé de Temple University. Les horaires n'y sont pas : leur site n'en donne pas, et les annuaires se contredisent (voir `README.md`).
- Image de partage 1200 × 630 (`assets/og.jpg`), sans Google+ ni mention du modèle Wix.
- `robots.txt`, `sitemap.xml` et un `llms.txt` écrit avec les faits.
- La maquette en ligne est en `noindex` (`_headers`, `vercel.json`), à retirer au lancement.
- Lighthouse SEO : 100 sur ordinateur et sur téléphone.

## NON VÉRIFIÉ
- Performance et mobile par PageSpeed Insights : pas de clé d'API PageSpeed. Lighthouse n'a pas pu être passé sur le site actuel : le navigateur automatisé reste bloqué par la vérification Cloudflare, et rien n'a été contourné. Lighthouse a été passé sur la nouvelle version, voir `README.md`.
- Le traitement des vrais robots par Cloudflare (Googlebot, GPTBot, ClaudeBot…) : impossible à tester d'ici sans se faire passer pour eux, ce qui n'a pas été fait.
- La redirection de `http://` vers `https://` : le proxy de notre environnement refuse les requêtes en `http`.
- Le point d'accès « MCP » de Wix annoncé dans `llms.txt` : pas appelé, c'est une interface pour agents, pas une page.
- Données de Google Search Console (pages réellement indexées, requêtes) : pas d'accès.

Maquinable propose un diagnostic payant avec le score de citabilité IA et le plan de corrections priorisé (voir le README du plugin).
