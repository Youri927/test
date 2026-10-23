# NIAN Custom Homes : nouveau site

Refonte complète de https://www.niancustomhomes.com.

NIAN Custom Homes est un constructeur de maisons sur mesure de Naples, en Floride :
- « a family owned and operated company that has worked in the SW Florida real estate market since 2006 », « primarily
  a Custom Home builder » ;
- tout commence par le terrain (un de leurs lots dans le comté de Collier, le vôtre, ou celui qu'ils aident à trouver
  avec Sun Realty), puis le plan (de zéro, un de leurs plans éprouvés, retouché ou non, ou vos plans), puis le conseil en
  design (« from color schemes to fixture styles ») ; aussi des packages terrain + maison, des maisons à vendre, de la
  rénovation, et 4 % de commission pour les agents immobiliers ;
- Certified Building Contractor, licence CBC1260134, active jusqu'au 31 août 2028 (vérifiée sur le registre de l'État le
  23 octobre 2026) ;
- le bureau et sa salle d'exposition, 2055 Trade Center Way ; la succursale de vente, 6020 Radio Rd. ; 239-280-6428.

- **À ouvrir** : `dist/index.html`, d'un double-clic. C'est un seul fichier (5,6 Mo : les photos, les polices, le logo
  et le script compris), qui marche sans serveur ni connexion. Chaque photo n'y est intégrée qu'une fois.
- **À mettre en ligne** : le dossier `dist-web/` (la page fait 133 Ko, 34 Ko une fois compressée par l'hébergeur ; les
  polices et les photos à part, chargées à la demande, en plusieurs tailles).
  - On le glisse sur app.netlify.com/drop, ou on le publie sur Vercel avec `vercel.json`.
  - `_headers` (Netlify) et `vercel.json` demandent aux moteurs de recherche de ne pas indexer la maquette. Ils sont
    à retirer au lancement.
  - `_redirects` et `vercel.json` envoient l'adresse sans `www` vers celle avec `www` (leur adresse actuelle), et les
    six anciennes pages vers leur partie de la nouvelle : /image-gallery et /home-designs vers les maisons, /services
    vers le choix, /sales vers les packages, /realtors vers les agents, /about-us vers l'entreprise.
  - Prêts pour leur domaine :
    - `robots.txt` ;
    - `sitemap.xml` ;
    - `llms.txt` (qui ils sont, la licence liée au registre, l'offre dans l'ordre d'un projet, les six maisons, le
      programme des agents, le contact) ;
    - l'image de partage (`assets/og.jpg`) et les icônes (l'onglet, l'écran d'accueil des téléphones, le logo des
      données structurées).

**À dire au client :**
- **Une page du modèle Wix est en ligne et proposée aux moteurs** : /home-designs, avec « I'm a paragraph… », trois faux
  témoignages signés de noms inventés et trois fausses annonces avec des prix. À supprimer tout de suite, sans attendre
  le nouveau site (voir l'audit SEO, point 1). La page /sales, vide, est aussi dans le plan du site.
- **Les photos permettent de retrouver des maisons de clients** : sept façades montrent leur numéro, et les liens de la
  grille de la galerie portent des fragments d'adresse. Le nouveau site efface les six numéros des photos qu'il reprend,
  et n'utilise pas ces liens (audit SEO, point 2).
- **Leur licence n'apparaît nulle part** sur le site actuel. Le nouveau site la montre trois fois, chaque fois liée à sa
  fiche du registre.
- **Le téléphone des données structurées** de leur site actuel n'est pas celui que leurs pages affichent. Le nouveau
  site utilise celui des pages (239-280-6428) : à confirmer.
- **Les packages et les maisons à vendre** : leur page Sales est vide. Le site dit qu'il en existe, sans en lister ; une
  liste à jour (photo, terrain, prix) serait le meilleur ajout.
- **Le bouton « Schedule a Free Consultation » de leur page Services** ouvre un e-mail vers l'adresse nominative d'un
  employé. Le nouveau site écrit à l'adresse générale (contact@niancustomhomes.com), et à sales@niancorp.com pour les
  agents.
- **Sun Realty et le programme des agents** (4 %, la moitié à la signature, l'autre au certificat d'occupation) : à
  confirmer, toujours en vigueur ?
- **Aucun témoignage** : leur seule page de témoignages est celle du modèle, avec de faux noms. Des avis réels (fiche
  Google, accord de clients) seraient un vrai plus ; le site n'en invente pas.
- **Le pied de page dit « © 2016 »**, le menu « Contact » ramène en haut de l'accueil, et un lien mène encore à
  Google+.
- Le site ne nomme personne : ni le titulaire de la licence, ni l'autre adresse de la fiche du registre, ni aucun
  client.
- Le formulaire prépare un e-mail dans la messagerie du visiteur (rien ne part de la page, et la page le dit). Pour
  recevoir les demandes directement, un service de formulaires (Netlify Forms, Formspree) peut prendre le relais : une
  petite modification.

**Les documents de travail :**
- `ANALYSE.md` : le site actuel, le registre, les six maisons, l'inventaire des 46 images ;
- `seo-audit-niancustomhomes.com-2026-10-23.md` : l'audit SEO et GEO du site actuel ;
- `DIRECTION.md` : la direction artistique, revue contre le brief avant de coder ;
- `REVUE.md` : la revue de design et la relecture des textes ;
- `ACCESSIBILITE.md` : l'audit d'accessibilité ;
- `boards/` : les planches :
  - l'arrivée, l'accueil au repos, la jonction au défilement, le téléphone, la tablette et l'image de partage
    (`l-accueil-lot-home.jpg`) ;
  - les six maisons, le chevron, les vignettes, la visionneuse, l'accordéon du téléphone (`les-six-maisons.jpg`) ;
  - le choix terrain + maison, le résumé, la demande remplie, les finitions (`le-choix-terrain-maison.jpg`) ;
  - les packages, les agents, l'entreprise, les erreurs, l'envoi, le menu et le pied de page
    (`packages-agents-entreprise.jpg`).

## La méthode, et les extensions installées

- Le site est écrit à la main, en HTML, CSS et JavaScript.
- Lenis fait le défilement doux, et `build.mjs` assemble le tout. À chaque construction, il vérifie aussi que :
  - la licence est là trois fois, avec son lien, et le téléphone s'affiche au moins cinq fois (celui des agents, deux) ;
  - les seules adresses de rue sont celles du bureau et de la succursale, et aucune année n'apparaît hors 2006 (leurs
    débuts), 2026 (le pied de page) et 2028 (la fin de validité de la licence) ;
  - aucun texte du modèle Wix ne revient (ses faux noms, « mysite »), ni l'adresse nominative, ni NIAN Roofing ;
  - chaque photo a sa légende et appartient à une maison, chaque image a son attribut de remplacement, chaque
    référence (`aria-labelledby`, `aria-controls`) existe, et la page a un seul h1.
- Les animations sont natives, sans GSAP ni WebGL : l'accueil est calculé à chaque image par quelques lignes de
  JavaScript (une échelle, un déplacement et une découpe pour chacune des deux moitiés), le reste en transitions CSS.

**Ce qui a servi :**
- **`frontend-design`** : le plan de direction artistique (couleurs, polices, mise en page, principes), revu contre le
  brief et contre les réflexes des pages générées avant de coder (voir `DIRECTION.md`). Ont été écartés : les couleurs
  de chaque maison relevées sur ses photos (faussées par le HDR), une loupe sur les détails (les halos du HDR), une
  caméra qui remonte l'allée (trop proche de Boca et de Stellar), le chevron comme cadre (Hideout), des volets qui
  s'ouvrent, une grille de six cartes.
- **`design-critique`, `accessibility-review` et `ux-copy`** (extension Design) : la revue des captures de 320 à
  1 920 px, en largeur et en hauteur, l'audit WCAG et la relecture des textes. Les corrections sont faites et listées
  dans `REVUE.md` et `ACCESSIBILITE.md`, dont quatre importantes : le « + » qui n'était pas au-dessus de l'écart, les
  deux moitiés qui montraient toutes deux la maison au téléphone, une découpe que Chrome calculait faux, et un titre
  écrit lettre par lettre au téléphone.
- **`seo-audit`** (Maquinable GEO) : l'audit du site actuel (ses sept pages, son plan de site, deux analyseurs de
  robots.txt pour 13 robots, son llms.txt), puis les mêmes contrôles sur le nouveau.
- **Lighthouse 13.5**, installé en local, mesuré derrière un petit serveur qui compresse comme un hébergeur : 100 / 100 /
  100 / 100 sur ordinateur, 95 / 100 / 100 / 100 sur téléphone.
- **Playwright** :
  - les 45 essais d'interaction (`tools/interact.mjs`) : l'arrivée, la place exacte des deux moitiés au départ, à
    mi-course et recollées, l'en-tête, les six maisons, la visionneuse à la souris, au clavier et au doigt, le choix qui
    remplit la demande, les boutons des packages, de la rénovation et des maisons, le formulaire, le menu et
    l'accordéon du téléphone, le mouvement réduit, la page sans JavaScript et les débordements de 320 à 1 920 px ;
  - le parcours au clavier, les cibles tactiles et le contraste mesuré sur les pixels, à 1 440 px et sur téléphone
    (`tools/a11y.mjs`) ;
  - les planches, l'image de partage et les icônes (`tools/shots.mjs`, `tools/boards.mjs`, `tools/og.mjs`,
    `tools/icons.mjs`).
- **Pillow** (`tools/images.py`) : les photos en AVIF, recadrées pour laisser leur filigrane hors cadre, les six
  numéros de maison effacés, sans aucune métadonnée (vérifié à la fin de chaque export).
- **Fontsource et fontTools** : les deux polices, réduites au latin et aux graisses utiles, et des polices de secours
  ajustées pour que la page ne bouge pas quand les vraies arrivent.
- **Les sources publiques**, pour ne rien inventer :
  - le registre des licences de l'État de Floride (myfloridalicense.com) ;
  - leur site actuel, ses sept pages, et les 46 originaux de leurs images sur le CDN de Wix.
- **21st.dev** : la recherche du catalogue et la recherche d'inspiration ont échoué le 23 octobre 2026 (« catalog
  search failed », côté serveur). Rien n'en vient.

**Ce qui n'a pas été retenu, et pourquoi :**
- **Facade UI et shadcn** : des sections React, et justement le découpage modèle (héros, cartes, chiffres,
  témoignages) que le brief refuse.
- **Les textes et les images du modèle Wix** : les faux témoignages, les fausses annonces, les textures de marbre et la
  façade en bois, qui ne sont pas à eux.
- **La photo du portail de la villa** (une boîte aux lettres et une boîte de permis de construire avec ses papiers), et
  les noms d'ancre de la galerie.
- **Une annonce immobilière et une fiche administrative trouvées en ligne** : elles donnent l'adresse de maisons de
  clients.
- **Les noms et les adresses** : ni le titulaire de la licence, ni l'autre adresse de sa fiche.
- **NIAN Roofing**, enregistrée à la même adresse : le site actuel n'en parle pas.
- **Des compteurs, un carrousel, des étoiles** : les réflexes d'un modèle de site.

## L'idée : Lot + Home

NIAN ne vend pas seulement une maison : sur leur site, tout commence par le terrain, et leur offre s'appelle « Lot+Home
Package ». Le nouveau site s'ouvre sur cette addition.

1. **L'accueil.** « Lot » et « Home » en très grand, et sous chaque mot sa moitié d'une de leurs photos : à gauche le
   jardin d'Oakes Estate (les cyprès, un tonneau de fleurs rouges), à droite la maison et son allée, écartées autour
   d'un « + » bordeaux, la couleur du toit de leur logo. À l'arrivée, les mots montent et les deux moitiés s'ouvrent
   depuis le « + ».
2. **Au défilement**, les deux moitiés se rapprochent, le « + » s'efface et la photo redevient une, en plein cadre :
   une maison NIAN sur son terrain. Le geste suit la molette dans les deux sens. Au téléphone, la photo est réduite au
   départ pour que chaque moitié garde son sens, puis grandit jusqu'à une bande au format 4:5.
3. **Plus bas, le visiteur compose sa propre addition** : son terrain + sa maison. Son choix remplit la demande de
   consultation.

Le reste se tait et laisse la place à leurs photos : le stucco froid de leurs façades, l'encre, le bordeaux de leur
logo. Petrona très fine pour les grands mots, Gantari pour le texte.

## La page, partie par partie

- **L'en-tête** : le logo et « Custom Homes », Homes, How it works, Packages, Realtors, About, le téléphone et « Free
  consultation » ; il se range quand on descend et revient quand on remonte.
- **L'accueil** (« Custom homes in Naples, from the lot up. ») : l'addition, la phrase, « Schedule a free
  consultation » et le téléphone.
- **Leur phrase** (« No two clients are the same and neither should their home. ») : leur promesse, et trois faits
  (familiale, dans l'immobilier du sud-ouest de la Floride depuis 2006, la licence liée au registre).
- **Les six maisons** (« Six homes. No two alike. ») : leurs noms et leurs styles ; la scène de la maison choisie (la
  grande photo, sa légende, son rang, ses vignettes), la visionneuse, et « Ask about a home like this one ».
- **Le choix** (« Start where you are. ») : Your lot + Your home, trois réponses de chaque côté du « + », le résumé et
  « Ask about this starting point » ; puis « Then, every selection. » et quatre intérieurs.
- **La bande bordeaux** : Lot + Home packages (l'allée de Gates dans les pins) et la rénovation, chacun avec son bouton.
- **Les agents** (« For realtors: 4% on all our new construction. ») : la barre des deux versements, leur ligne.
- **L'entreprise** (« A family company, in Southwest Florida real estate since 2006. ») : l'histoire, Sun Realty, la
  licence, le bureau et sa salle d'exposition, la succursale de vente.
- **La consultation** (« Schedule a free consultation. ») : le téléphone en grand, l'e-mail ; un formulaire court (le
  sujet, le terrain, la maison, une maison aimée, le contact, un message) ; « Schedule my consultation » prépare
  l'e-mail.
- **Le pied de page** : le logo en clair, leur accroche (« Turning your vision into reality. »), le contact, les deux
  adresses, la ligne des agents, la licence.

## Les photos

34 images, toutes les leurs (voir `ANALYSE.md`) : la façade de l'accueil et 33 photos des six maisons (six pour quatre
d'entre elles, cinq pour Oakes Woods, quatre pour Collier Woods). Exportées en AVIF par `tools/images.py` :
- depuis les originaux du CDN de Wix, jamais agrandies, en 2 000, 1 400, 1 000 et 480 px de large (3 600 pour la
  photo de l'accueil, qui couvre tout l'écran) ;
- recadrées pour laisser hors cadre le filigrane NIAN d'une vingtaine de photos (le logo est déjà sur la page), et pour
  resserrer les panoramiques là où les murs restent droits ;
- six numéros de maison effacés, en reportant l'enduit voisin ;
- les couleurs du photographe, sans autre retouche ;
- sans aucune métadonnée.

## Le logo

Le leur, redessiné à plat d'après leur plus grand fichier (`tools/mark.mjs`) : le chevron de toit bordeaux, un peu
décalé vers la gauche et posé sur le N et le I, et les quatre lettres grises, le premier N plus haut que les autres, le
A au sommet coupé. Il passe en clair sur le pied de page sombre. Le toit sur le premier N sert d'icône (l'onglet,
l'écran d'accueil des téléphones), et le logo complet, avec « CUSTOM HOMES », de logo des données structurées.
