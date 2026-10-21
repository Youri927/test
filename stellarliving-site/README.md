# Stellar Living Homes : nouveau site

Refonte complète de https://www.stellarlivinghomes.com.

Stellar Living Homes LLC est un entrepreneur général de Naples, en Floride :
- « Founded 2014 », « over 38 years of custom home building, and remodeling experience » (leurs mots) ;
- licence de l'État CGC1531679 (Certified General Contractor), active jusqu'au 31 août 2028 (vérifiée sur le registre
  de l'État le 21 octobre 2026) ;
- surtout des condos et des maisons individuelles (cuisines, salles de bain, logements entiers), des maisons neuves,
  des réparations après ouragan, des cages de piscine et de la construction commerciale ;
- douze avis de clients, longs et précis, qui reviennent sans cesse au temps, au budget et au soin de la maison.

- **À ouvrir** : `dist/index.html`, d'un double-clic. C'est un seul fichier (7 Mo : les 135 photos, les polices, le
  logo et le script compris), qui marche sans serveur ni connexion.
- **À mettre en ligne** : le dossier `dist-web/` (la page fait 179 Ko ; les polices et les photos à part, chargées à
  la demande, en plusieurs tailles).
  - On le glisse sur app.netlify.com/drop, ou on le publie sur Vercel avec `vercel.json`.
  - `_headers` (Netlify) et `vercel.json` demandent aux moteurs de recherche de ne pas indexer la maquette. Ils sont
    à retirer au lancement.
  - `_redirects` (Netlify) et `vercel.json` renvoient les anciennes pages (About, Reviews et sa copie, Contact, Screen
    Enclosures, la liste des projets et ses 16 pages, les pages oubliées de Talis Park et de Pelican Bay, le lien
    Instagram) vers la bonne partie de la nouvelle page, par une redirection permanente (301).
  - Le blog (9 articles de mars 2023) mène aux prestations. S'il est gardé ou migré, retirer ces lignes (signalées
    dans `_redirects` ; dans `vercel.json`, ce sont les lignes `/post` et `/blog`).
  - Les six anciennes pages au nom de familles clientes : `vercel.json` les reconnaît sans les nommer ; dans
    `_redirects`, leurs adresses sont à ajouter (elles ne sont recopiées nulle part ici).
  - Prêts pour leur domaine :
    - `robots.txt` ;
    - `sitemap.xml` ;
    - `llms.txt` (qui ils sont, la licence, les prestations, les chantiers avec leurs dates, les avis cités mot pour
      mot) ;
    - l'image de partage (`assets/og.jpg`) et les icônes (l'onglet, l'écran d'accueil des téléphones, le logo des
      données structurées).

**À dire au client :**
- **la photo d'accueil et l'image de partage de leur site actuel** sont une photo d'annonce immobilière de Talis Park,
  avec le filigrane « SWFLAMLS » dans le coin et leur logo collé dessus. Plusieurs pages de projets sont faites de ces
  photos d'annonce (Prato, Corsica, deux pages Brightling, la plupart des photos d'Imperial Golf Club et d'un logement
  de Breakwater). Aucune n'est reprise : le nouveau site ne montre que leurs propres photos, et il y en a 134 ;
- **six pages publiques portent le nom de familles clientes** (« …-residence ») et figurent dans leur plan de site.
  À retirer, ou à rediriger, avec l'accord des clients ;
- des pages oubliées sont en ligne et dans le plan du site : « copy-of-reviews », « projects-old-hide » (titrée
  « Projects - OLD - Hide »), « talis-park-copy »… (voir l'audit SEO) ;
- **« Founded 2014 » et « over 38 years »**, mais une licence de l'État délivrée en 2022 : les 38 ans sont sans doute
  ceux du dirigeant. Le nouveau site garde leurs deux phrases telles quelles, sans en tirer de calcul. À confirmer ;
- le téléphone est un numéro du New Jersey (908) et l'e-mail une adresse Gmail : un numéro en 239 et une adresse au nom
  du domaine rassureraient à Naples ;
- « ©2022 » dans le pied de page de leur site, alors que les projets sont mis à jour en 2026 ;
- leurs pages de projets n'ont aucun texte (seulement le nom du quartier) : le nouveau site dit ce qui a été fait et
  quand, d'après les photos et leurs dates ;
- le site ne nomme personne, comme le leur ; « Dominic » et « Mr. Palmeri » n'apparaissent que dans les avis, mot pour
  mot. S'ils veulent apparaître sous leur nom, il suffit de le dire ;
- le formulaire prépare un e-mail dans la messagerie du visiteur (rien ne part de la page, et la page le dit). Pour
  recevoir les demandes directement, un service de formulaires (Netlify Forms, Formspree) peut prendre le relais :
  une petite modification.

**Les documents de travail :**
- `ANALYSE.md` : le site actuel, ce qui a été vérifié ailleurs (la licence), et le tri des photos, page par page
  (gardées, écartées, et pourquoi) ;
- `seo-audit-stellarlivinghomes.com-2026-10-21.md` : l'audit SEO et GEO du site actuel ;
- `DIRECTION.md` : la direction artistique, revue contre le brief avant de coder ;
- `REVUE.md` : la revue de design et la relecture des textes ;
- `ACCESSIBILITE.md` : l'audit d'accessibilité ;
- `boards/` : les planches :
  - l'ouverture image par image, sur ordinateur et sur téléphone, et l'image de partage (`l-ouverture.jpg`) ;
  - la visite de sept minutes, à quatre moments, et au téléphone (`la-visite.jpg`) ;
  - Breakwater, « Across Naples » et la visionneuse (`les-chantiers.jpg`) ;
  - les douze avis et leurs sujets, les prestations (`les-avis.jpg`) ;
  - l'entreprise, la demande, les erreurs, l'envoi, le pied de page (`la-demande.jpg`).

## La méthode, et les extensions installées

- Le site est écrit à la main, en HTML, CSS et JavaScript.
- Lenis fait le défilement doux, et `build.mjs` assemble le tout (il vérifie aussi, à chaque construction, que les
  avis des données structurées sont mot pour mot ceux de la page, que l'ouverture cite bien l'avis de Scott D., et que
  les heures de la visite sont celles des photos).
- Les animations sont natives (transitions CSS, et la visite menée par le défilement), sans GSAP ni WebGL.

**Ce qui a servi :**
- **`frontend-design`** : le plan de direction artistique (couleurs, polices, mise en page, principes), revu contre
  le brief et contre les réflexes des pages générées avant de coder (voir `DIRECTION.md`). Une couverture de magazine,
  une « sixième étoile », un carrousel d'avis, une rangée de chiffres et une visite en fondu enchaîné ont été écartés à
  cette relecture.
- **`design-critique`, `accessibility-review` et `ux-copy`** (extension Design) : la revue des captures de 320 à
  1920 px, l'audit WCAG et la relecture des textes. Les corrections sont faites et listées dans `REVUE.md` et
  `ACCESSIBILITE.md`, dont une bloquante : les avis pâlis tombaient à 23 px sur téléphone, sous le seuil des grands
  textes.
- **`seo-audit`** (Maquinable GEO) : l'audit du site actuel (34 pages lues sur les 48 adresses de son plan de site,
  deux analyseurs de robots.txt), puis les mêmes contrôles sur le nouveau.
- **Lighthouse 13.5**, installé en local (l'extension des outils de Chrome ne se connecte pas).
- **Playwright** :
  - l'ouverture capturée à des instants donnés ;
  - les 40 essais d'interaction (`tools/interact.mjs`), dont la visite liée au défilement, la visionneuse à la
    souris, au clavier et au doigt, les avis par sujet, la demande, le mouvement réduit, la page sans JavaScript et les
    débordements de 320 à 1920 px ;
  - le parcours au clavier, les cibles tactiles et le contraste mesuré sur les pixels, à 1440 px et sur téléphone
    (`tools/a11y.mjs`) ;
  - les planches, l'image de partage et les icônes (`tools/shots.mjs`, `tools/boards.mjs`, `tools/og.mjs`,
    `tools/icons.mjs`).
- **potrace** (potracer) : leur logo vectorisé en deux couleurs à partir de leur fichier publié.
- **Fontsource** : les deux polices, en paquets npm, réduites au latin et aux graisses utiles.
- **Les sources publiques**, pour ne rien inventer :
  - le registre de l'État de Floride (myfloridalicense.com) pour la licence ;
  - leur site actuel, pour les textes, les douze avis et les photos (les originaux du CDN de Wix, avec leurs dates de
    prise de vue), lu lentement : il répond « 429 » dès qu'on enchaîne les pages, et la protection n'a jamais été
    contournée.
- **21st.dev**, consulté pour la recherche (des citations aux passages surlignés, du surlignage éditorial, des
  galeries de photos en hauteur) : des carrousels de citations, des surligneurs « feutre », des galeries en éventail,
  tout en React. Rien n'est repris : la recherche a surtout montré ce qu'il fallait éviter.

**Ce qui n'a pas été retenu, et pourquoi :**
- **Facade UI et shadcn** : des sections React, et justement le découpage modèle (héros, cartes, chiffres,
  témoignages) que le brief refuse.
- **Les photos d'annonces immobilières** (filigrane SWFLAMLS) et les photos professionnelles de maisons modèles de
  Talis Park, dont la provenance n'est pas établie.
- **Deux photos de cages de piscine** où un homme pose au premier plan, de face.
- **Les noms et les numéros** : ni le titulaire de la licence, ni les familles clientes, ni les numéros de logement des
  adresses de leurs pages.
- **Les articles du blog** : des textes génériques de mars 2023, sans lien avec leurs chantiers.
- **Une carte du secteur** : les quartiers et les immeubles sont écrits, à Naples ces noms parlent d'eux-mêmes.
- **Un carrousel d'avis**, **une rangée de chiffres** (2014, 38 ans, 12 avis) et **des étoiles**.

## L'idée : « ce qui compte ressort »

Ce qu'ils ont de plus fort ne vient pas d'eux : les mots de leurs clients, et leurs photos de fin de chantier. D'où
une seule figure, appliquée trois fois : **le pâle et l'encre**. Le texte d'un client est posé en grand ; les mots qui
comptent sont à l'encre (le bleu de leur logo), le reste s'efface en gris-bleu pâle, sans disparaître. C'est la façon
dont on lit un avis : en diagonale, en retenant trois mots.

1. **À l'ouverture** : l'avis de Scott D. (« Wish we could give Dominic more than 5 stars… ») monte en pâle ; puis,
   l'un après l'autre, « more than 5 stars », « attention to detail », « protect our floors », « cleaned everyday »
   passent à l'encre. Lu seul, ce qui ressort résume l'entreprise.
2. **Dans la visite** (au défilement) : 24 photos d'un condo de Breakwater prises entre 10 h 38 et 10 h 45, dans
   l'ordre. Sur ordinateur, la section se fige et la rangée avance quand on descend ; la grande heure change, la pièce
   en cours passe en blanc, les autres restent pâles.
3. **Dans les avis** (au clic) : on choisit un sujet ; les passages qui en parlent passent à l'encre, soulignés
   d'olive, le reste pâlit, et une phrase compte les avis concernés.

Le reste se tait : le bleu marine et l'olive de leur logo, beaucoup de blanc (celui de leurs cuisines), de grandes
photos hautes. Deux polices : Imbue, une didone étroite à axe optique, pour tout ce qui est grand et pour les avis ;
Zalando Sans pour le reste.

## La page, partie par partie

- **L'en-tête** : leur monogramme et leur nom, Work, Reviews, Services, About, le téléphone et « Free estimate » ; il
  se range quand on descend, revient quand on remonte, et souligne la partie où l'on est.
- **L'accueil** : l'avis de Scott D., en pâle et à l'encre ; « Read all twelve reviews » ; la phrase qui dit qui ils
  sont (le titre de la page) ; « Get a free estimate » et le téléphone ; une de leurs cuisines de Breakwater.
- **La visite** (« Seven minutes in a finished condo. ») : neuf pièces, chacune avec son heure ; chaque photo ouvre la
  visionneuse au bon endroit, « See all 24 photos » ouvre tout le passage.
- **Breakwater** (« Five homes at Breakwater, and the clubhouse. ») : six cartes décalées, chacune avec ce qui a été
  fait, la date et le nombre de photos.
- **« Across Naples »** : Trieste (Bay Colony), Hidden Lakes (Park Shore), Imperial Golf Club, Gulf Tower (Gulf
  Shores), Pistoia (Talis Park) et les cages de piscine ; photo et texte alternent.
- **Les avis** (« Twelve clients, in their own words. ») : les douze, sur trois colonnes, et sept sujets.
- **Les prestations** (« What we build. ») : rénovation de condos, de maisons, maisons neuves, réparations après
  ouragan, cages de piscine, construction commerciale ; chacune renvoie à sa preuve (la visite, un sujet des avis, des
  photos).
- **L'entreprise** (« Founded in 2014. Based in Naples. ») : leur texte, la phrase de John T. sur leurs sous-traitants,
  la licence et le lien vers le registre de l'État, le bureau, les lieux où ils ont travaillé.
- **La demande** (« Get a free estimate. ») : nom, téléphone ou e-mail, le projet, le lieu, le message ; le bouton
  « Email my request » prépare l'e-mail. À côté : le téléphone en grand, l'e-mail, le bureau.
- **Le pied de page**, en bleu nuit : le logo, le bureau, le contact, la licence, Instagram.

## Les photos

134 photos, toutes les leurs (voir `ANALYSE.md`), dans douze reportages, plus la photo de l'accueil ; exportées en AVIF
(`tools/images.py`) :
- les originaux du CDN de Wix (jusqu'à 1944 × 2592), jamais agrandis : chaque image est servie au plus à sa taille
  d'origine, en 1200, 800 et 480 px de large (1600, 1000 et 600 pour les photos en largeur) ;
- dans l'ordre de prise de vue, vérifié à la construction, avec la date et l'heure lues dans les fichiers ;
- les photos d'iPhone converties du Display P3 vers le sRGB, l'orientation appliquée, sans autre retouche ;
- les doublons et les photos sans date d'une même série laissés de côté ; légendées pour ce qu'elles montrent.

## Le logo

Le monogramme « SLH » en romaines, ses trois toits (bleu marine, olive, une ferme de charpente) et le nom, vectorisés
en deux couleurs depuis leur fichier publié (`tools/logo.py`) : sans rien redessiner, nets à toutes les tailles, en
bleu et olive sur blanc ou en blanc et olive sur le bleu nuit. Le monogramme sert aussi d'icône (l'onglet, l'écran
d'accueil des téléphones).

## Les mesures

Lighthouse 13.5, sur la version en ligne servie en local ; téléphone simulé (4G lente, processeur ralenti 4 fois).

| Mesure | Résultat |
|--------|----------|
| Performance (Lighthouse) | **96** au téléphone (trois passages identiques ; le tout premier passage de la session, navigateur à froid, avait donné 73), **100** sur ordinateur |
| Accessibilité (Lighthouse) | **100** sur ordinateur et sur téléphone |
| Bonnes pratiques (Lighthouse) | **100** |
| SEO (Lighthouse) | **100** |
| Navigation par agents (Lighthouse) | **100** |
| Affichage du contenu principal (LCP), téléphone ralenti | **2,6 s** (0,5 s sur ordinateur) ; c'est la photo de l'accueil, qui s'ouvre avec l'avis |
| Temps de blocage (TBT) | **0 ms** |
| Décalage de la mise en page (CLS) | **0** |
| Essais d'interaction (`tools/interact.mjs`) | **40 sur 40** |
| Audit d'accessibilité (`tools/a11y.mjs`) | aucun point bloquant |
| Débordements, de 320 à 1920 px | aucun |

## Refaire le site

```
python3 -I tools/fonts.py <paquet @fontsource-variable/imbue> <paquet @fontsource-variable/zalando-sans>
python3 -I tools/logo.py <logo.jpg>                              # le logo → data/logo.json
python3 -I tools/images.py <dossier des photos téléchargées>    # les photos → src/img/*.avif et data/*.json
node tools/icons.mjs                                             # l'icône de l'onglet, celle des téléphones, le logo
python3 -I tools/fallback.py                                     # les polices de secours ajustées
node tools/og.mjs                                                # l'image de partage
node build.mjs                                                   # dist/ et dist-web/
node tools/interact.mjs <dossier>                                # les 40 essais
python3 -m http.server 8794 --bind 127.0.0.1 --directory dist-web
node tools/a11y.mjs                                              # l'audit d'accessibilité
node tools/shots.mjs <dossier> && node tools/boards.mjs <dossier> boards
```
