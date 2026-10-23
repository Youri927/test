# Audit SEO + GEO : niancustomhomes.com (23 octobre 2026)

**Le site.** Un site Wix, dont l'origine est `https://www.niancustomhomes.com`. Les autres adresses y mènent par une
redirection 301 : `http://niancustomhomes.com/` passe par `https://niancustomhomes.com/`, puis arrive sur
`https://www.niancustomhomes.com/` ; `http://www.niancustomhomes.com/` y mène directement.

**Comment il a été lu.** Lecture seule : rien n'a été modifié. Les requêtes ont été faites une à une, avec l'agent
descriptif `maquinable-geo/0.1`.
- Le robots.txt, les deux plans du site, le llms.txt et le code HTML brut de six des sept pages ont été lus en ligne.
- La page /sales a répondu par une page d'attente (« Checking Your Request », 429) à nos requêtes scriptées. Nous
  n'avons pas insisté : son contenu a été lu avec l'outil de lecture web.

## Résumé
- Pages contrôlées : 7 sur 7 (le plan du site en liste 7 ; une seule lue sans son code HTML brut, /sales).
- Problèmes critiques : 2
- Avertissements : 10
- Opportunités : 5

## CRITIQUE (à corriger tout de suite)

1. **Une page du modèle Wix, avec de faux témoignages et de fausses annonces, est proposée aux moteurs.**
   - /home-designs figure dans le plan du site et répond normalement. Elle n'a jamais été remplie :
     - « I'm a paragraph. Click here to add your own text and edit me. » ;
     - trois témoignages signés de noms inventés par le modèle ;
     - trois annonces de maisons avec un prix et un nombre de chambres ;
     - le titre « HOME DESIGNS | mysite », et quatre images dont le texte alternatif est « I'm an image title. ».
   - Pour un moteur, c'est une page pauvre et trompeuse. Pour un client qui tombe dessus, des avis inventés.
   - → Supprimer la page (ou la passer en `noindex`) et la retirer du plan du site. Rien n'en est repris dans le
     nouveau site.
2. **Les photos permettent de retrouver les maisons des clients.**
   - Sept façades montrent leur numéro de maison, lisible à pleine résolution.
   - Les liens de la grille de la galerie ont des noms d'ancre tirés de l'adresse des maisons (numéro et rue).
   - Avec la ville, l'un ou l'autre suffit à retrouver la maison d'un client. Aucune adresse n'est reprise dans ce
     rapport.
   - → Renommer les ancres de la galerie, et remplacer les photos de façade par des versions où le numéro est effacé.
     Le nouveau site efface les numéros et n'utilise pas ces ancres.

## AVERTISSEMENTS

3. **Aucune page n'a de titre principal (h1).** Les titres de section sont des h2 et des h4 ; /realtors n'a ni h1 ni
   h2.
   - → Un h1 par page, qui dit ce qu'elle contient (« Custom homes in Naples, from the lot up. » sur l'accueil).
4. **Aucune image de partage, et un nom de site resté « mysite ».**
   - Aucune page n'a d'`og:image` : un lien partagé (Facebook, SMS, WhatsApp) s'affiche sans photo.
   - `og:site_name` vaut « mysite », le nom par défaut de Wix.
   - → Une image de 1200 × 630 pour l'accueil ; « NIAN Custom Homes » comme nom de site.
5. **Des titres de page trop courts ou restés du modèle.**
   - « About US » et « Realtors » font 8 signes, sans le nom de l'entreprise.
   - « HOME DESIGNS | mysite » et « Sales | mysite » gardent le nom par défaut.
   - → Des titres de 30 à 60 signes avec le nom (« Realtor Program, 4% Commission | NIAN Custom Homes »).
6. **Des descriptions manquantes, courtes ou en double.**
   - /home-designs n'en a pas ; /sales non plus, d'après l'outil de lecture web.
   - /image-gallery (80 signes) et /services (87) sont sous les 100 conseillés.
   - /about-us reprend mot pour mot celle de l'accueil.
   - Deux fautes s'y lisent : « Forward » (avec une majuscule, sur /realtors) et « Remodelling » (orthographe
     britannique, quand le reste du site écrit « remodeling »).
   - → Une description par page, de 100 à 160 signes, qui dit ce qu'elle contient.
7. **Des données structurées minimes, et un téléphone qui ne correspond pas.**
   - L'accueil a une fiche `LocalBusiness` : le nom (« Nian Custom Homes »), l'adresse du bureau et un téléphone.
   - Ce téléphone n'est pas celui que les pages affichent (239-280-6428). Un moteur ou un assistant peut donner le
     mauvais numéro.
   - Il manque le logo, la licence, la succursale de vente, la zone servie et la page Facebook.
   - → Une fiche `HomeAndConstructionBusiness` complète, avec le numéro affiché. Le nouveau site la donne.
8. **La licence n'est citée nulle part.** Le registre de l'État liste NIAN CUSTOM HOMES INC comme Certified Building
   Contractor, licence CBC1260134, active jusqu'au 31 août 2028. Pour un moteur comme pour un client, un numéro
   vérifiable vaut mieux qu'un adjectif.
   - → Le numéro, lié à sa fiche du registre, dans le pied de page et la page de l'entreprise.
9. **Des images sans texte alternatif.** 12 images n'en ont pas sur les six pages lues. Les icônes des réseaux en ont
   un, mais l'une mène encore à Google+, fermé depuis 2019.
   - → Une phrase qui dit ce qu'on voit (« The front: a gold-toned metal roof, palms, and a fountain on the circular
     drive »), et le lien Google+ retiré.
10. **Les photos de la galerie sont enfermées dans six anciens composants Wix** chargés dans des cadres (`iframe`). Les
    moteurs ne les lisent pas comme le contenu de la page, et aucune photo n'a de légende.
    - → Les photos dans la page, avec leur légende. Le nouveau site le fait.
11. **Une page vide et un site figé.**
    - /sales est vide, au titre « Sales | mysite », et figure dans le plan du site.
    - Le plan du site date toutes les pages du 11 décembre 2021 ; le pied de page dit « © 2016 by NIAN Custom
      Homes ».
    - Le lien « Contact » du menu ramène en haut de l'accueil au lieu du formulaire.
    - → Retirer /sales du plan du site (ou la remplir), mettre la date du pied de page à jour, faire pointer
      « Contact » vers le formulaire.
12. **Le bouton « Schedule a Free Consultation » de /services ouvre un e-mail vers l'adresse nominative d'un employé**,
    alors que le reste du site donne l'adresse générale. L'adresse n'est pas reprise ici.
    - → L'adresse générale (contact@niancustomhomes.com) partout.

## QUICK WINS (fort impact, peu d'effort)
- Supprimer /home-designs ou la passer en `noindex`, et retirer /sales du plan du site (points 1 et 11).
- Le bon téléphone dans les données structurées (point 7).
- Le numéro de licence dans le pied de page, lié au registre (point 8).
- Un h1, un titre et une description par page, et une image de partage (points 3 à 6).
- Le lien « Contact » vers le formulaire, le lien Google+ retiré, « © 2026 ».
- Une favicon : le site affiche celle de Wix par défaut.

## OPPORTUNITÉS GEO

- **robots.txt : aucun robot utile n'est bloqué.**
  - 8 adresses testées (les 7 pages du plan du site et /llms.txt), avec 13 robots : Googlebot, Bingbot, GPTBot,
    OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User,
    Google-Extended, CCBot et Bytespider.
  - Deux analyseurs utilisés, `urllib.robotparser` et `protego` : ils sont d'accord sur ces 8 adresses.
  - Ils divergent seulement sur les adresses de la visionneuse de la galerie (`?lightbox=`) : la règle de Wix
    `Disallow: *?lightbox=` suit un `Allow: /` ; « première règle trouvée » les autorise, « règle la plus longue »
    (comme Google) les bloque, ce qui est l'intention. Aucune page publique n'est touchée.
  - Seul PetalBot (Huawei) est bloqué, par le réglage par défaut de Wix. Le fichier donne l'adresse du plan du site.
- **llms.txt : il existe, mais il est générique.**
  - Wix l'a généré. Son titre est « mysite », il n'a pas de résumé, et un seul lien mène au contenu (l'accueil).
  - Le reste présente un point d'accès pour agents d'IA (MCP) et la documentation de Wix. Ce point d'accès n'a pas été
    appelé.
  - Il ne cite ni l'offre (terrain, plans, conseil en design, packages, rénovation), ni le programme des agents, ni la
    licence, ni les coordonnées.
  - → Un llms.txt écrit à la main, avec les faits et les liens. Le nouveau site en livre un.
  - Le llms.txt reste une proposition : les assistants ne le lisent pas tous.
- **Le programme des agents immobiliers** est un contenu très citable : 4 % de commission sur toute construction
  neuve, la moitié à la signature, l'autre à la délivrance du certificat d'occupation. Écrit en clair dans une
  section qui lui est propre, il répond tel quel à « which Naples builders pay realtors a commission? ».
- **Une FAQ tirée de leurs propres réponses** : les trois façons d'avoir un terrain (un de leurs lots, le vôtre, celui
  qu'ils aident à trouver avec Sun Realty), les trois façons de dessiner la maison, le conseil en design. Balisée en
  `FAQPage`, elle serait lisible telle quelle par les assistants. `geo-optimize` peut ajouter ce balisage et un
  résumé en tête de page.
- **Des coordonnées cohérentes partout** : le même nom (« NIAN Custom Homes »), les deux adresses (le bureau et sa
  salle d'exposition, la succursale de vente), le même téléphone, sur le site, les données structurées et la fiche
  Google.

## NON VÉRIFIÉ
- **Performance et mobile.** Non vérifiés : pas de clé PageSpeed Insights.
- **Le code HTML brut de /sales**, qui répond 429 aux requêtes scriptées. Nous n'avons pas insisté.
- **Le point d'accès MCP** annoncé par le llms.txt : non appelé, volontairement.
- **La fiche Google de l'entreprise et les annuaires** : non audités.
- **Le contenu des six galeries** : leurs photos ont été listées dans un navigateur pour l'analyse du site, mais pas
  auditées pour le référencement.

Maquinable propose un diagnostic payant avec le score de citabilité IA et le plan de corrections priorisé (voir le README du plugin).
