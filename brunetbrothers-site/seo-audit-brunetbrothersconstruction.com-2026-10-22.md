# Audit SEO + GEO : brunetbrothersconstruction.com (22 octobre 2026)

**Le site.** Un site Wix, dont l'origine est `https://www.brunetbrothersconstruction.com`. Les autres adresses y mènent
par une redirection 301 : le domaine sans « www », et `http://`.

**Comment il a été lu.** Lecture seule : rien n'a été modifié. Le site est servi derrière Cloudflare : nos requêtes en
ligne de commande, avec l'agent descriptif `maquinable-geo/0.1`, reçoivent un défi (429, `cf-mitigated: challenge`).
Le défi n'a pas été contourné.
- Les pages, le robots.txt, le plan du site et le llms.txt ont été lus en ligne avec l'outil de lecture web.
- Le code HTML brut des quatre pages vient des copies de la Wayback Machine (juin et juillet 2026), mises à jour comme
  le site le 2 avril 2026.

## Résumé
- Pages contrôlées : 4 sur 4 (le plan du site en liste 4).
- Problèmes critiques : 1
- Avertissements : 10
- Opportunités : 5

## CRITIQUE (à corriger tout de suite)

1. **40 photos publiées gardent la position GPS de la maison où elles ont été prises.**
   - Les originaux restent téléchargeables à leur adresse sur le CDN de Wix (`static.wixstatic.com/media/…`, sans
     paramètre de taille). Ils ont gardé leurs métadonnées : l'appareil, la date et, pour 40 d'entre eux, des
     coordonnées GPS.
   - Un contrôle grossier situe 39 de ces positions dans le comté de Palm Beach, et la dernière ailleurs en Floride.
   - N'importe qui peut télécharger une photo de salle de bain et retrouver la maison du client.
   - Ces coordonnées ne sont reprises nulle part dans ce rapport ni dans le nouveau site.
   - → Remplacer ces photos par des copies sans métadonnées (un export « sans position » depuis le téléphone, ou un
     outil qui retire l'EXIF), puis supprimer les anciennes de la médiathèque de Wix. C'est à faire avant même la
     refonte. Les photos du nouveau site n'ont aucune métadonnée (vérifié à l'export).

## AVERTISSEMENTS

2. **Le défi Cloudflare pourrait gêner des robots légitimes.**
   - Le robots.txt laisse tout lire. Mais chacune de nos requêtes scriptées a reçu un défi, et rien ne garantit que les
     robots des moteurs et des assistants passent.
   - Ce n'est pas une preuve de blocage : le défi vise d'abord les clients inconnus.
   - → Dans Cloudflare (Security → Bots), vérifier que les robots vérifiés (Googlebot, Bingbot) passent. Décider
     explicitement du sort des robots d'IA (GPTBot, ClaudeBot, PerplexityBot) : laisser passer ceux qui citent leurs
     sources, ou les bloquer en connaissance de cause.
3. **Des données structurées presque vides.**
   - L'accueil n'a qu'un bloc `WebSite`, au nom tronqué : « Brunet Brothers » suivi d'une espace.
   - Il n'y a ni fiche d'entreprise (`GeneralContractor` ou `LocalBusiness` : nom, adresse ou zone, téléphones, logo,
     réseaux), ni licence, ni FAQ balisée.
   - → Une fiche `GeneralContractor` avec les quatre licences, les deux lignes (anglais et espagnol) et la zone servie,
     plus une `FAQPage` sur /faq. Le nouveau site le fait.
4. **Aucune image de partage.** Les quatre pages n'ont pas d'`og:image`. Un lien partagé (Facebook, WhatsApp, SMS)
   s'affiche sans photo.
   - → Une image de 1200 × 630 pour l'accueil, une par page si possible.
5. **Les descriptions.**
   - /projects et /faq ont la même description : « Trusted general contracting and home remodeling at competitive
     rates ». Elle fait 68 signes, sous les 100 conseillés.
   - /testimonials n'en a pas.
   - → Une description par page, de 100 à 160 signes, qui dit ce que la page contient.
6. **Des images sans texte alternatif.**
   - Sur /projects, 54 des 69 images n'en ont pas.
   - Sur l'accueil, 2 n'en ont pas, et 5 ont un nom de fichier en guise de texte (« IMG_0223.jpg », « GOPR0017.JPG »).
   - → Une phrase qui dit ce qu'on voit (« A glass shower with a tiled bench and a mosaic band »).
7. **Des titres mal employés sur /testimonials.** Les 18 témoignages sont balisés en h2 : la page a 19 h2 et aucune
   section.
   - → Les témoignages en paragraphes ou en citations, sous un seul h2.
8. **Les licences ne figurent nulle part.**
   - Le site dit « A State Certified General Contractor », sans numéro. Pourtant, le registre de l'État (DBPR) liste
     quatre licences certifiées à leur nom, toutes actives : entrepreneur général CGC1524915, plomberie CFC1430197,
     climatisation CAC1825088, toiture CCC1337876.
   - Pour un moteur comme pour un client, un numéro vérifiable vaut mieux qu'un adjectif.
   - → Les quatre numéros, liés à leur fiche du registre, dans le pied de page et la page de l'entreprise.
9. **Des coordonnées incohérentes.**
   - L'e-mail est écrit de deux façons (« brunetbrothersconstruction@ » et « Brunetbrothersconstruction@ »).
   - Il n'y a aucune adresse ni zone détaillée, seulement « Lake Worth ».
   - Le pied de page dit « © Copyright 2020 ».
   - → Une seule écriture partout. La zone servie, en clair (Palm Beach County, South Florida). Une fiche Google à
     jour, avec les mêmes informations.
10. **Trois boutons ne mènent nulle part.** « Get in Touch », « Find Out More » et « Schedule an Appointment » pointent
    vers l'accueil lui-même : le visiteur revient en haut de la page au lieu d'arriver au formulaire.
    - → Les faire pointer vers le formulaire (une ancre `#contact`).
11. **Le robots.txt est lu différemment selon les robots** pour les adresses de la visionneuse de la galerie
    (`?lightbox=`).
    - La règle de Wix `Disallow: *?lightbox=` suit un `Allow: /`. L'analyseur « première règle trouvée »
      (`urllib.robotparser`) autorise ces adresses ; l'analyseur « règle la plus longue » (`protego`, comme Google)
      les bloque, ce qui est l'intention.
    - Aucune adresse publique n'est touchée.
    - → Rien d'urgent ; c'est le fichier par défaut de Wix.

## QUICK WINS (fort impact, peu d'effort)
- Retirer et remplacer les originaux qui portent une position GPS (point 1).
- Une description par page et une image de partage (points 4 et 5).
- Les quatre numéros de licence dans le pied de page, liés au registre (point 8).
- Un texte alternatif pour chaque photo de la galerie (point 6).
- Les trois boutons vers le formulaire (point 10). Le pied de page à jour (© 2026).
- Une favicon : le site affiche celle de Wix par défaut.

## OPPORTUNITÉS GEO

- **robots.txt : aucun robot utile n'est bloqué.**
  - 6 adresses testées (les 4 pages du plan du site, /llms.txt et une adresse de galerie), avec 14 robots : Googlebot,
    Bingbot, GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot,
    Perplexity-User, Google-Extended, CCBot, Bytespider et PetalBot.
  - Deux analyseurs utilisés, `urllib.robotparser` et `protego`.
  - Les pages publiques sont ouvertes à tous. Seul PetalBot (Huawei) est bloqué, par le réglage par défaut de Wix.
  - Le fichier donne bien l'adresse du plan du site.
- **llms.txt : il existe, mais il est générique.**
  - Wix l'a généré : un titre (« Brunet Brothers »), un résumé, cinq sections, trois liens.
  - Il présente surtout un point d'accès pour agents d'IA (MCP) et la documentation de Wix. Ce point d'accès n'a pas
    été appelé.
  - Il ne cite ni les pages (projets, témoignages, FAQ), ni les services, ni les licences, ni les deux lignes
    téléphoniques.
  - → Un llms.txt écrit à la main, avec les faits et les liens. Le nouveau site en livre un.
  - Le llms.txt reste une proposition : les assistants ne le lisent pas tous.
- **La FAQ** est un excellent contenu à citer (« Do you charge for estimates? No… », le dépôt de 50 %, les permis). Une
  `FAQPage` la rendrait lisible telle quelle par les assistants. `geo-optimize` peut ajouter ce balisage et un résumé en
  tête de page.
- **L'espagnol.** L'entreprise a une ligne en espagnol, mais aucun contenu dans cette langue. Une version espagnole
  serait visible des recherches et des assistants interrogés en espagnol, très fréquentes dans le comté de Palm Beach :
  - soit des pages à part, avec `hreflang` ;
  - soit, comme dans le nouveau site, une page bilingue.
- **Des légendes pour les projets.** La galerie est une mosaïque muette. Une phrase par photo donne aux moteurs et aux
  assistants un texte à citer (« a frameless glass shower with a tiled bench »).

## NON VÉRIFIÉ
- **Performance et mobile.** Non vérifiés : pas de clé PageSpeed Insights.
- **Le point d'accès MCP** annoncé par le llms.txt : non appelé, volontairement.
- **La fiche Google de l'entreprise et les annuaires** (un profil Birdeye non revendiqué existe) : non audités.
- **Le HTML servi aujourd'hui.** Le HTML brut vient des copies Wayback de juin et juillet 2026. Les pages en ligne,
  lues avec l'outil de lecture web, ont les mêmes titres et le même contenu.
- **Les photos.** Leurs métadonnées ont été lues sur les 72 originaux du CDN, pas sur les copies redimensionnées que Wix
  sert aux visiteurs. Ces copies peuvent avoir perdu leurs métadonnées ; les originaux restent téléchargeables.

Maquinable propose un diagnostic payant avec le score de citabilité IA et le plan de corrections priorisé (voir le README du plugin).
