# Audit SEO + GEO : feelydevelopments.com (27 octobre 2026)

**Le site.** Un site GoDaddy (Website Builder) d'une seule page, à l'adresse `https://feelydevelopments.com/`.

**Comment il a été lu.** Lecture seule : rien n'a été modifié.
- Nos requêtes directes (curl, puis un navigateur sans interface) ont été coupées par le réseau avant d'atteindre le
  site : connexion réinitialisée. Ce n'est pas le site qui refuse les robots (voir le robots.txt plus bas), et nous
  n'avons pas cherché à contourner la coupure.
- Le robots.txt, les deux plans du site, le llms.txt et la page ont donc été lus avec l'outil de lecture web. Il rend
  le texte de la page, mais pas son en-tête HTML (`<head>`) : les points qui en dépendent sont rangés dans « Non
  vérifié ».

## Résumé
- Pages contrôlées : 1 sur 1 (le plan du site n'en liste qu'une).
- Problèmes critiques : 0
- Avertissements : 7
- Opportunités : 5

## CRITIQUE (à corriger tout de suite)

Rien n'empêche les moteurs de lire le site : la page est dans le plan du site, et aucun robot n'est bloqué.

## AVERTISSEMENTS

1. **Pas de titre principal (h1).** Dans la version lue, les titres de la page sont des h3 et des h4 : « Sold »,
   « Coming Soon - Under Construction », les adresses des deux maisons, « Custom Homes and Renovations »,
   « Design-Build-Live », « Drop us a line! », « Feely Developments ». « Available Homes », « Photo Gallery » et
   « Contact Us » ne sont même pas des titres.
   - → Un h1 qui dit ce que fait l'entreprise et où (« Custom homes and renovations in Winter Park. »), puis un titre
     par partie. Le nouveau site le fait.
2. **Aucune image n'a de texte alternatif.** 5 images, dont 2 fois le logo, toutes avec un `alt` vide. Pour un moteur
   comme pour un lecteur d'écran, la photo de façade et les deux intérieurs n'existent pas.
   - → Une phrase qui dit ce qu'on voit (« An entry hall with whitewashed brick walls, two antique doors hung on an
     iron rail, a herringbone oak floor and black steel-framed glass doors. »). Le logo : le nom de l'entreprise.
3. **Très peu de contenu.** Environ 380 mots sur tout le site, et un titre « Photo Gallery » sans aucune photo dessous.
   Une seule adresse à indexer pour tout : la maison sur mesure, la rénovation, les maisons à vendre.
   - → Remplir la galerie (ou retirer le titre), et donner à chaque offre sa phrase claire. Le nouveau site montre les
     trois photos en grand, avec leurs détails, et présente les deux maisons.
4. **Les licences ne sont citées nulle part.** Le registre de l'État liste deux licences actives jusqu'au 31 août 2028,
   au nom commercial Feely Developments LLC : Certified Residential Contractor CRC1330421 (depuis 2010) et Certified
   Building Contractor CBC1268587 (depuis 2025). Pour un moteur comme pour un client, un numéro vérifiable vaut mieux
   qu'un adjectif.
   - → Les deux numéros, liés à leur fiche du registre. Le nouveau site les donne dans « Build » et dans le pied de
     page.
5. **Les adresses complètes des deux maisons sont des titres de la page**, numéro compris, et la plaque d'un pilier
   donne le numéro sur la photo de façade. Celle de la maison vendue est aussi l'adresse de l'entreprise, et la page
   décrit l'agencement de ses étages. Aucune adresse de maison n'est reprise dans ce rapport.
   - → À voir avec Feely Developments : si la maison vendue appartient à un client, retirer son numéro et l'effacer de
     la photo. Le nouveau site nomme les maisons par leur rue seulement, et la plaque est effacée.
6. **Des fautes dans le texte** : « the 2nd Floor floor », « First first floor », « live In ». Un moteur ne les
   pénalise pas en tant que telles, mais elles se voient sur une maison à 5,8 M$.
   - → Corrigées dans le nouveau site.
7. **Le robots.txt ne donne pas l'adresse du plan du site.** Il ne contient qu'une ligne, « User-agent: * ». Le plan du
   site existe pourtant (`/sitemap.xml`, un index qui mène à `/sitemap.website.xml`, une adresse modifiée le 10 avril
   2026, sans image).
   - → Ajouter `Sitemap: https://feelydevelopments.com/sitemap.xml`. Le nouveau site livre un robots.txt qui le fait,
     et un plan du site avec l'image de partage.

## QUICK WINS (fort impact, peu d'effort)
- Un h1, et un texte alternatif sur chaque photo (points 1 et 2).
- Les deux licences, liées au registre, dans le pied de page (point 4).
- Retirer le titre « Photo Gallery » tant qu'il n'y a pas de photos (point 3).
- La ligne `Sitemap:` dans le robots.txt (point 7).
- Les trois fautes (point 6).

## OPPORTUNITÉS GEO

- **robots.txt : aucun robot n'est bloqué.**
  - 3 adresses testées (l'accueil, la seule page du plan du site ; /llms.txt ; /sitemap.xml), avec 13 robots :
    Googlebot, Bingbot, GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot,
    Perplexity-User, Google-Extended, CCBot et Bytespider.
  - Deux analyseurs utilisés, `urllib.robotparser` et `protego` : ils sont d'accord. Un groupe sans règle autorise
    tout.
- **llms.txt : il existe, mais il ne dit rien de l'entreprise.**
  - GoDaddy l'a généré. Son titre est « Feely Developments », et son résumé répète le nom.
  - Il donne un lien vers l'accueil, l'adresse, et une page Facebook.
  - Il ne dit ni le métier (maisons sur mesure, rénovation), ni « depuis 2007 », ni la devise Design-Build-Live, ni les
    licences, ni les maisons, ni le téléphone, ni le rendez-vous avec Ryan.
  - → Un llms.txt écrit à la main, avec les faits et les liens. Le nouveau site en livre un.
  - Le llms.txt reste une proposition : les assistants ne le lisent pas tous.
- **Des faits faciles à citer**, écrits en phrases claires : maisons sur mesure et rénovations à Winter Park depuis
  2007 ; un seul interlocuteur, de l'achat du terrain à l'emménagement (« From Real Estate services, design, demo, all
  the way through move in ») ; une réponse sous cinq jours ouvrés ; la villa de Palmer Avenue (0,36 acre, 7 426 pieds
  carrés sous toit, 5 800 000 $). Le nouveau site les donne aussi en données structurées
  (`HomeAndConstructionBusiness` et `GeneralContractor`, avec les deux licences, Ryan Feely, l'adresse, le téléphone et
  l'offre de la villa).
- **La page Facebook** citée par le llms.txt n'est liée nulle part sur la page. Si elle est active, la lier
  dans le pied de page et dans les données structurées (`sameAs`) ; le nouveau site attend la confirmation.
- **Des coordonnées cohérentes partout** : le même nom, la même adresse, le même téléphone, sur le site, les données
  structurées, la fiche Google et les annuaires. L'adresse publiée est celle de la maison vendue, et l'e-mail est une
  adresse Gmail : une adresse sur leur domaine renforcerait la confiance. Le profil GuildQuality donne encore une
  ancienne adresse.

## NON VÉRIFIÉ
- **Performance et mobile.** Non vérifiés : pas de clé PageSpeed Insights.
- **L'en-tête HTML** (titre exact, description, adresse canonique, image de partage, données structurées) : illisible
  avec nos outils, puisque nos requêtes directes n'atteignent pas le site. La première ligne du texte lu, « Feely
  Developments - Custom Homes, Remodeling », est probablement le titre de la page (45 signes, dans la bonne longueur).
- **Les niveaux de titre** sont ceux que rend l'outil de lecture web : à confirmer sur le HTML brut.
- **Un second analyseur du plan du site** : la page n'en a qu'une adresse, lue une fois.
- **La fiche Google de l'entreprise, les annuaires et la page Facebook** : non audités.

Maquinable propose un diagnostic payant avec le score de citabilité IA et le plan de corrections priorisé (voir le README du plugin).
