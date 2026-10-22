# Audit SEO + GEO : bocaremodelinggroup.com (22 octobre 2026)

Site actuel, GoDaddy Website Builder. Origine : `https://bocaremodelinggroup.com/`. Les autres adresses y mènent :
`http://` par une redirection 308, `https://www.` par une 301 ; `http://www.` passe par deux redirections (301 vers
`http://bocaremodelinggroup.com/`, puis 308). Requêtes une par une, avec l'agent descriptif `maquinable-geo/0.1`.
Lecture seule : rien n'a été modifié.

## Résumé
- Pages contrôlées : 1 sur 1. Le site n'a qu'une page, et le plan du site la liste deux fois.
- Problèmes critiques : 2
- Avertissements : 8
- Opportunités : 4

## CRITIQUE (à corriger tout de suite)

1. **48 photos publiées gardent la position GPS de la maison où elles ont été prises.**
   - Les originaux servis par le CDN de GoDaddy (img1.wsimg.com) ont gardé leurs métadonnées : l'appareil, la date et,
     pour 48 d'entre eux, les coordonnées GPS.
   - N'importe qui peut télécharger une photo de salle de bain et retrouver la maison du client.
   - Ces coordonnées ne sont reprises nulle part dans ce rapport.
   - → Remplacer ces photos par des copies sans métadonnées (un export « sans position » depuis le téléphone, ou un
     outil qui retire l'EXIF), puis supprimer les anciennes de la médiathèque GoDaddy. C'est à faire avant même la
     refonte.
2. **Le lien d'appel du bandeau compose le numéro de licence.**
   - Le bandeau du haut porte un lien `tel:1539814` : sur un téléphone, toucher ce lien appelle « 1539814 » au lieu
     du 561-247-2727.
   - C'est le bouton d'appel le plus visible du site.
   - → `tel:+15612472727`. Le lien du bas de page (`tel:5612472727`) est juste.

## AVERTISSEMENTS

3. **Le titre ne dit ni le métier ni la ville** : « Boca Remodeling Consulting Group » (32 signes).
   - C'est aussi le nom « Consulting », que ni le logo, ni les camions, ni le registre de l'État n'emploient.
   - → Par exemple « Boca Remodeling Group | Remodeling in Boca Raton, FL » (52 signes).
4. **Le h1 a une faute et ne dit pas où** : « You're local trusted Remodeling CO. » (« You're » pour « Your »).
   - Un h3 (le nom dans l'en-tête) le précède.
   - Les h2 se répètent : « Our Work in Pictures » six fois, « Before & After » trois fois (sans un seul avant et
     après), « Transform Your Home » deux fois. Six h4 s'appellent « Our Services ».
   - → Un h1 sans faute, puis un h2 par partie, chacun différent.
5. **Les photos sont invisibles pour qui ne lance pas JavaScript.**
   - Les 145 photos des 14 galeries sont chargées par script : le code de la page n'en contient que 5.
   - Ces 5 images n'ont pas de texte de remplacement, et les galeries n'ont pas de légende.
   - Beaucoup de robots d'assistants IA ne lancent pas JavaScript : pour eux, la page n'a presque pas d'images.
   - Une bonne partie de ces photos ne sont pas leurs chantiers : photos d'annonces immobilières de Californie, images
     générées (détail dans ANALYSE.md).
   - → Ne garder que leurs chantiers, avec une phrase par photo : la pièce, ce qui a été fait.
6. **Les données structurées sont incomplètes et en partie invalides.** Sur l'accueil, un seul `LocalBusiness` :
   - son adresse de site, `"url": "bocaremodelinggroup.com"`, n'a pas de `https://` : ce n'est pas une adresse valide ;
   - son identifiant (`@id`) est une suite de chiffres de GoDaddy en `.com`, pas leur domaine ;
   - son nom est « Boca Remodeling Consulting Group » ;
   - son image est servie en `http://` ;
   - il n'a ni téléphone, ni logo, ni `sameAs` (la fiche Google), ni la licence ;
   - le pays de l'adresse est vide.
   - Les horaires sont justes : lundi à vendredi de 9 h à 17 h, et le week-end « 00:00 à 00:00 », la façon documentée
     par Google de dire « fermé toute la journée ».
   - → Un `GeneralContractor` complet : le nom des camions, l'adresse, le téléphone, l'e-mail, le logo, la licence
     CGC1539814 avec le lien vers sa fiche à l'État, la fiche Google. Le nouveau site en fournit un.
7. **Le nom, l'adresse et le téléphone ne sont pas les mêmes partout** (la cohérence que les moteurs locaux et les
   assistants recoupent) :
   - deux noms, avec et sans « Consulting » ;
   - deux numéros : 561-247-2727 sur le site, un autre sur les portières des camions ;
   - deux écritures de l'adresse : « 7284 W Palmetto Park Road suite # 101 » (données structurées) et « 7284 West
     Palmetto Park Road suite # 101 » (llms.txt).
   - → Choisir une forme de chaque et l'employer partout : site, fiche Google, camions, annuaires.
8. **L'image de partage est le logo sur fond noir**, et les textes de partage sont négligés.
   - `og:image` et `twitter:image` : le logo de catalogue (PNG, fond noir).
   - `twitter:description` reprend la faute (« You're local trusted Remodeling CO. ») ; `og:description` a des espaces
     doubles.
   - → Une de leurs photos (1200 × 630), et une description propre. La meta description de la page (105 signes) est
     correcte, mais générique.
9. **Le plan du site liste l'accueil deux fois**, sous deux adresses.
   - `sitemap.xml` renvoie à deux plans : `sitemap.website.xml` (`https://bocaremodelinggroup.com/`, modifié le
     9 septembre 2026) et `sitemap.ola.xml` (`http://bocaremodelinggroup.com`, sans `https` ni barre finale).
   - Le second donne comme date de modification l'heure de la requête : elle change à chaque lecture.
   - C'est le plan des rendez-vous en ligne de GoDaddy ; on ne le règle pas toujours depuis l'éditeur.
   - → Une seule adresse, l'adresse finale en `https://`, avec une vraie date.
10. **Une partie « avis » vide** : « Don't Just Take Our Word For It », puis « Reviews coming soon! » trois fois.
    - Le menu « CUSTOMERS REVIEWS » mène à la fiche Google, mais la page ne cite aucun avis.
    - → Citer trois à cinq avis Google tels qu'ils sont publiés (prénom et initiale), avec l'accord des clients, ou
      retirer la partie.

## GAINS RAPIDES (fort effet, peu d'effort)
- **Le lien d'appel** (point 2) : une minute dans l'éditeur.
- **La faute du h1** (point 4) : la corriger corrige aussi le llms.txt et la description de partage, qui la recopient.
- **Le titre** (point 3) et **l'image de partage** (point 8) : dans les réglages SEO de GoDaddy.
- **« Reviews coming soon! »** (point 10) : retirer la partie en attendant des avis à citer.
- **Les photos avec position GPS** (point 1) : les remplacer d'abord dans les galeries de l'accueil.

## OPPORTUNITÉS GEO
- **robots.txt : rien à corriger.**
  - Le fichier ne bloque que `/404` et donne le plan du site.
  - 13 robots testés sur 4 adresses publiques (l'accueil, `/llms.txt`, `/sitemap.xml` et l'adresse en `http`) :
    - moteurs : Googlebot, Bingbot ;
    - assistants : GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot,
      Perplexity-User ;
    - entraînement : Google-Extended, CCBot, Bytespider.
  - Aucune adresse n'est bloquée. Les deux analyseurs (`urllib.robotparser` et `protego`, qui applique la règle du
    préfixe le plus long) donnent les mêmes verdicts.
- **`/llms.txt` existe, généré par GoDaddy.**
  - Son format est valide : un titre, un résumé, puis des sections avec des liens.
  - Mais il reprend le nom « Consulting » et la faute du h1, et ne donne que l'accueil, le lien vers les avis Google,
    les horaires, l'adresse et le téléphone. Rien sur les prestations, la 3D, la licence ou le bureau qu'on peut
    visiter.
  - C'est une proposition, pas une norme, et les assistants la lisent inégalement. Un fichier écrit à la main ne coûte
    rien : le nouveau site en fournit un.
- **La licence est leur fait le plus vérifiable.** « LIC#CGC1539814 » figure sur la page, mais en simple texte.
  - La fiche de l'État (registre du DBPR) la dit active jusqu'au 31 août 2028, au nom commercial « Boca Remodeling
    Group ».
  - → Un lien vers cette fiche, et la licence dans les données structurées : un assistant peut alors écrire
    « entrepreneur général agréé en Floride » en citant sa source.
- **Leurs trois histoires « dessiné, puis construit » sont leur meilleure matière à citer**, et elles sont
  aujourd'hui noyées dans des carrousels sans légende :
  - une salle de bain esquissée aux crayons de couleur, dessinée en 3D quinze jours plus tard, puis construite ;
  - une cuisine dessinée sur l'écran du bureau, polie sur place, puis finie ;
  - une salle de bain dessinée en 3D avec ses cotes, puis finie.
  - → Les raconter en texte (ce qui a été dessiné, ce qui a été construit, l'écart entre les deux étapes) : c'est ce
    que les moteurs et les assistants peuvent reprendre.
- **Des faits à accorder**, que les assistants reprennent tels quels :
  - « Over 30 years experience in construction », face à une licence de l'État délivrée le 16 décembre 2025 ;
  - le second numéro des camions et le second nom (point 7).
  - → Une phrase qui explique les trente ans (le métier du dirigeant, la licence actuelle), et la même partout.

## Ce que corrige le nouveau site
- Une seule page avec un titre (52 signes) et une description (145 signes) propres, et un seul h1, sans faute.
- Un h2 par partie, chacun différent ; les histoires et les projets en h3.
- Une image de partage faite de leur propre esquisse et de la salle de bain construite.
- Un texte de remplacement sur chacune des 54 images (24 sur la page, 30 dans la visionneuse), et une légende sous
  chaque photo des histoires.
- Les photos exportées sans aucune métadonnée (ni date, ni appareil, ni position) ; le script d'export le vérifie à
  chaque fois.
- Un JSON-LD `GeneralContractor` : nom, adresse complète avec le pays, coordonnées du bureau, téléphone, e-mail, logo,
  horaires, la licence CGC1539814 avec le lien vers sa fiche à l'État, la fiche Google en `sameAs`.
- Le bon numéro dans chaque lien d'appel (`tel:+15612472727`).
- Un `llms.txt` écrit à la main, un plan du site d'une seule adresse, un robots.txt, et les en-têtes pour l'hébergeur.
- Ni photo d'annonce, ni image générée, ni « coming soon », ni date de chantier.

## NON VÉRIFIÉ
- **Performance et mobile du site actuel** : pas de clé PageSpeed Insights. Le nouveau site, mesuré avec Lighthouse
  en local derrière un serveur qui compresse comme un hébergeur, obtient 100 / 100 / 100 / 100 sur ordinateur et
  98 / 100 / 100 / 100 sur téléphone (performance, accessibilité, bonnes pratiques, SEO).
- **robots.txt et les plans du site** ont été lus ce matin (9 h 10 à 9 h 12, heure du serveur). Cet après-midi, notre
  proxy réseau a coupé les nouvelles connexions au site (« tunnel closed ») : ce n'est pas un blocage par le site, et
  les redirections, testées juste avant, répondaient normalement. Le `llms.txt` a été lu par un second canal (l'outil
  de lecture web).
- **La fiche Google de l'entreprise** et ses avis, et les annuaires (BBB, Houzz, Yelp) : non ouverts.
- **Les photos** : leurs métadonnées ont été lues sur les 145 originaux du CDN, pas sur les copies redimensionnées que
  GoDaddy sert aux visiteurs. Ces copies peuvent avoir perdu leurs métadonnées ; les originaux restent téléchargeables.

Maquinable propose un diagnostic payant avec le score de citabilité IA et le plan de corrections priorisé (voir le README du plugin).
