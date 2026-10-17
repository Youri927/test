# Florida South Construction : nouveau site

Refonte complète de https://floridasouth.us.

Florida South Construction, Inc. est un entrepreneur général de Naples, en Floride :
- dirigé par son président, Judson White ;
- licence de l'État CGC1515532 (Certified General Contractor), au nom de Judson Gregory White pour Florida South
  Construction, Inc. ; active depuis le 2 juin 2008, jusqu'au 31 août 2028 ;
- du trou à reboucher à la maison neuve : entretien et réparations, rénovation (cuisines, salles de bain, plans de
  travail, meubles, sols, peinture, terrasses, vérandas, agrandissements), menuiserie sur mesure, remise en état après
  une catastrophe naturelle, construction neuve ; dans les comtés de Lee et de Collier.

- **À ouvrir** : `dist/index.html`, d'un double-clic. C'est un seul fichier (3,1 Mo : les 21 photos en grand, les
  polices, l'emblème et le script compris), qui marche sans serveur ni connexion.
- **À mettre en ligne** : le dossier `dist-web/` (la page fait 129 Ko ; les polices et les photos à part, chargées à
  la demande, en deux tailles).
  - On le glisse sur app.netlify.com/drop, ou on le publie sur Vercel avec `vercel.json`.
  - `_headers` (Netlify) et `vercel.json` demandent aux moteurs de recherche de ne pas indexer la maquette. Ils sont
    à retirer au lancement.
  - `_redirects` (Netlify) et `vercel.json` renvoient les 11 anciennes adresses (les pages du menu, celles du plan de
    site et les pages de la galerie) vers la bonne partie de la nouvelle page, par une redirection permanente (301).
  - Prêts pour leur domaine :
    - `robots.txt` ;
    - `sitemap.xml` ;
    - `llms.txt` ;
    - l'image de partage (`assets/og.jpg`).

**À dire au client :**
- sur leur site actuel, la page « Portfolio » est en faux texte (« Lorem ipsum »), et un brouillon « Home 2 » est
  public ; les deux sont dans le plan de site, qui oublie en revanche l'accueil et les pages du menu. Le nouveau site
  les remplace et redirige ces adresses (voir l'audit SEO) ;
- le bureau : 1575 Pine Ridge Rd., Suite 10 est l'adresse publiée par l'entreprise depuis 2015 ; le registre de
  l'État en donne une autre. À faire confirmer ;
- des photos de rénovation (cuisines, salles de bain, le surf shack) manquent : celles de leur site font 185 à 521 px,
  trop petites. Quelques photos neuves en grand compléteraient le site.

**Les documents de travail :**
- `ANALYSE.md` : le site actuel, et ce qui a été vérifié ailleurs (licence, photos écartées) ;
- `seo-audit-floridasouth.us-2026-10-17.md` : l'audit SEO et GEO du site actuel ;
- `DIRECTION.md` : la direction artistique, revue contre le brief avant de coder ;
- `REVUE.md` : la revue de design et la relecture des textes ;
- `ACCESSIBILITE.md` : l'audit d'accessibilité ;
- `boards/` : les planches :
  - l'ouverture image par image, sur ordinateur et sur téléphone (`la-liste.jpg`) ;
  - les cadres qui grandissent avec le chantier, la maison qui s'ouvre jusqu'aux bords (`les-cadres.jpg`) ;
  - les deux maisons et la visionneuse (`deux-maisons.jpg`) ;
  - Judson, la licence, les avis (`confiance.jpg`) ;
  - la demande, ses erreurs, la liste prête, le pied de page, l'image de partage (`demande.jpg`) ;
  - le téléphone (`telephone.jpg`).

## La méthode, et les extensions installées

- Le site est écrit à la main, en HTML, CSS et JavaScript.
- Lenis fait le défilement doux, et `build.mjs` assemble le tout.
- Les animations sont natives (transitions CSS, Web Animations pour la visionneuse), sans GSAP ni WebGL.

**Ce qui a servi :**
- **`frontend-design`** : le plan de direction artistique (couleurs, polices, mise en page, principes), revu contre
  le brief et contre les réflexes des pages générées avant de coder (voir `DIRECTION.md`).
- **`design-critique`, `accessibility-review` et `ux-copy`** (extension Design) : la revue des captures, l'audit WCAG
  et la relecture des textes. Les corrections sont faites et listées dans `REVUE.md` et `ACCESSIBILITE.md`.
- **`seo-audit`** (Maquinable GEO) : l'audit du site actuel (11 pages, deux analyseurs de robots.txt), puis les mêmes
  contrôles sur le nouveau. Il a aussi corrigé une erreur de mon analyse : le robots.txt actuel ne bloque pas les
  robots des assistants.
- **Lighthouse 13.5**, installé en local (l'extension des outils de Chrome ne se connectait pas), et des traces de
  chargement au téléphone ralenti : elles ont montré 460 ms de blocage, corrigées (voir « Les mesures »).
- **Playwright** :
  - l'ouverture capturée à des instants donnés ;
  - les 42 essais d'interaction (`tools/interact.mjs`), dont la visionneuse à la souris, au clavier et au doigt, le
    mouvement réduit, la page sans JavaScript et les débordements à 20 largeurs ;
  - le parcours au clavier, les cibles tactiles et le contraste mesuré sur les pixels (`tools/a11y.mjs`) ;
  - les planches et l'image de partage (`tools/shots.mjs`, `tools/boards.mjs`, `tools/og.mjs`).
- **Les sources publiques**, pour ne rien inventer :
  - le site de l'État de Floride (myfloridalicense.com) pour la licence ;
  - leur site actuel, pour les textes, les deux avis et les photos (à 2 500 px, le maximum que sert Squarespace) ;
  - les limites du Recensement américain (us-atlas) et Natural Earth, pour redessiner la Floride et le lac
    Okeechobee de leur emblème (domaine public).
- **21st.dev**, consulté pour la recherche : l'idée d'un trait qui barre un texte (« Strikethrough Replace »), celle
  d'un cadre qui s'élargit en entrant à l'écran (« Scroll Reveal Image ») et la navigation d'une visionneuse
  (« Thumbnail image viewer ») ; tout est réécrit sans bibliothèque, et le cadre s'ouvre sans zoom ni ressort.

**Ce qui n'a pas été retenu, et pourquoi :**
- **Facade UI et shadcn** : des sections React, et justement le découpage modèle (héros, cartes, chiffres,
  témoignages) que le brief refuse.
- **Le bleu partout** : Skoda et Castor étaient bleus en aplat. Ici, le bleu n'est que le ciel de leurs photos (l'accueil,
  la demande) ; le reste est blanc, stuc vert d'eau et encre.
- **Une carte du secteur** : Skoda et Mendieta en avaient une.
- **Les promesses invérifiables de leur site** : « Southwest Florida's choice », « the best general contractor in
  Southwest Florida ».
- **Les photos de banque d'images** (outils, palette de bois, mèches de perceuse, planche, palmiers au couchant), les
  vignettes de leur galerie (trop petites pour être agrandies), la scie à onglets (logos de marques en gros plan).
- **Le lettrage western de 2015** : remplacé, l'emblème gardé (il est sur leurs polos, leur casquette et leur panneau).

## L'idée : « Give us your list, and consider the job done »

C'est leur phrase. Le site s'ouvre sur une liste de travaux écrite sur le ciel de leur photo, de plus en plus grand,
du trou à reboucher à la maison à construire ; les lignes se barrent une à une, puis « Consider it done. » s'écrit en
très grand.

1. **Le ciel de la photo est la page.** Leurs photos de 2015 sont en Adobe RGB : converties en sRGB, leur ciel donne
   le dégradé de l'accueil, relevé sur la première rangée de pixels. La photo des débords blancs monte du bas de
   l'écran sans raccord visible.
2. **L'échelle comme idée.** La taille des lignes de la liste, puis celle des cadres des photos (un étrier, une
   ossature, une maison), dit la taille du travail.
3. **Leurs mots pour titres** : « No job is too small. », « Another quality home. » (ce qu'écrit le panneau de leur
   chantier), « Send us your list. »
4. **Un seul vocabulaire de mouvement** : des traits qui s'allongent de gauche à droite, des cadres qui s'ouvrent.

## La page, partie par partie

- **L'accueil** : « Give us your list. », la liste barrée, « Consider it done. », le titre (« A general contractor in
  Naples, Florida, for repairs, remodels and new homes. »), Lee et Collier, la licence depuis 2008, « Get an
  estimate » et le téléphone ; la photo des débords blancs qui monte du bas.
- **Ce qu'ils font** (« No job is too small. ») : entretien et réparations, rénovation (leur liste, et les rénovations
  « artistiques »), construction neuve ; la maison dont le cadre s'ouvre jusqu'aux bords.
- **Deux maisons** (« Another quality home. ») : la maison sur pilotis de 2015, la maison en blocs dans les pins de
  2016 ; deux mosaïques légendées, une visionneuse qui part de la vignette (flèches, doigt, Échap).
- **Judson White** : son portrait, son message mot pour mot, leurs trois engagements, la photo avec un membre de
  l'équipe ; la licence en carte, avec le lien vers le registre de l'État.
- **Les avis** : les deux, mot pour mot, prénom et initiale ; les mots passent du gris à l'encre au fil de la lecture.
- **La demande** (« Send us your list. ») : nom, téléphone ou e-mail, ville, la liste sur un champ réglé, « Who sent
  you our way? » ; le bouton « Email my list » prépare l'e-mail (rien ne part de la page, et la note le dit).
- **Le pied de page** : l'emblème, le bureau, les numéros, la licence, Lee et Collier, Facebook.

## Les photos

21 photos, toutes les leurs (voir `ANALYSE.md`), exportées en AVIF (`tools/images.py`) :
- converties de l'Adobe RGB vers le sRGB (les photos de 2015, le portrait, l'équipe), sans autre retouche ;
- jamais agrandies : 2 500 px pour l'accueil et la maison, 1 800 px pour les mosaïques, 990 px pour le portrait ;
- vérifiées une à une : aucun numéro de maison, aucune plaque ; la personne à côté de Judson n'est pas nommée ;
- légendées pour ce qu'elles montrent, avec l'année.

## L'emblème

Leur Floride à la rose des vents, redessinée (`tools/logo.py`) : la Floride d'après le Recensement américain, le lac
Okeechobee en réserve, l'anneau et ses quatre pointes tracés en courbes, qui passent derrière la côte. Deux graisses :
fine pour le pied de page, forte pour l'en-tête, la licence et l'onglet du navigateur. Le nom est composé en Gloock.

## Les mesures

Lighthouse 13.5 et traces de chargement de Chrome, sur la version en ligne servie en local ; téléphone simulé (4G
rapide, processeur ralenti 4 fois).

| Mesure | Résultat |
|--------|----------|
| Performance (Lighthouse) | **99** au téléphone (86 avant correction), **100** sur ordinateur |
| Accessibilité (Lighthouse) | **100** sur ordinateur et sur téléphone |
| Bonnes pratiques (Lighthouse) | **100** |
| SEO (Lighthouse) | **100** |
| Navigation par agents (Lighthouse) | **100** |
| Affichage du contenu principal (LCP), téléphone ralenti | **2,0 s** (0,5 s sur ordinateur) |
| Temps de blocage (TBT), téléphone ralenti | **10 ms** (460 ms avant correction) |
| Décalage de la mise en page (CLS) | **0** |
| Essais d'interaction (`tools/interact.mjs`) | **42 sur 42** |
| Audit d'accessibilité (`tools/a11y.mjs`) | aucun point bloquant |
| Débordements, de 320 à 1920 px | aucun |

## Refaire le site

```
python3 -I tools/fonts.py <Gloock-Regular.ttf> <OFL Gloock> "<AlbertSans[wght].ttf>" <OFL Albert Sans>
python3 -I tools/logo.py <dossier shapely> <states-10m.json> <ne_10m_lakes.geojson>   # l'emblème → data/logo.json
python3 -I tools/images.py <dossier des photos téléchargées>                           # les photos → src/img/*.avif
python3 -I tools/fallback.py                                                           # les polices de secours ajustées
python3 -I tools/redirects.py                                                          # web/_redirects et web/vercel.json
node tools/og.mjs                                                                      # l'image de partage
node build.mjs                                                                         # dist/ et dist-web/
node tools/interact.mjs <dossier>                                                      # les 42 essais
python3 -m http.server 8792 --bind 127.0.0.1 --directory dist-web
node tools/a11y.mjs                                                                    # l'audit d'accessibilité
node tools/shots.mjs <dossier> && node tools/boards.mjs <dossier> boards
```

Les sources : `src/index.html` (le contenu), `src/styles.css`, `src/main.js`, `vendor/` (Lenis, et les polices Gloock
et Albert Sans, licence OFL, dans `vendor/fonts/`).

`build.mjs` vérifie à chaque fois que les deux avis des données structurées sont ceux de la page mot pour mot (avec les
mêmes noms), que l'adresse du bureau est la même partout, que la licence figure partout où elle doit, que la liste de
l'accueil a ses cinq lignes, que chaque photo de mosaïque a sa légende, et que chaque photo est décrite.
