# Five Points Roofing : nouveau site

Refonte complète de https://www.fivepointsroofingfl.com.

Five Points Roofing est un couvreur familial de Lakeland, dans le comté de Polk (centre de la Floride) :
- la famille Ray est dans le métier depuis 1955, quand Troy Ray Jr. a fondé Ray's Roofing ; trois générations depuis ;
- licence de l'État CCC1333259 (Certified Roofing Contractor), au nom d'Angela M. Ray, qui exerce sous le nom Five
  Points Roofing ; active depuis le 10 août 2021, jusqu'au 31 août 2028 ;
- trois sortes de toits : maisons, mobile-homes, bâtiments commerciaux ; neuf villes, du lundi au vendredi de 7 h à
  19 h, depuis leur bureau de Lakeland.

- **À ouvrir** : `dist/index.html`, d'un double-clic. C'est un seul fichier (758 Ko, les photos, la police, le logo
  et le script compris), qui marche sans serveur ni connexion.
- **À mettre en ligne** : le dossier `dist-web/` (la page fait 130 Ko ; la police et les photos à part, chargées à la
  demande).
  - On le glisse sur app.netlify.com/drop, ou on le publie sur Vercel avec `vercel.json`.
  - `_headers` (Netlify) et `vercel.json` demandent aux moteurs de recherche de ne pas indexer la maquette. Ils sont
    à retirer au lancement.
  - `_redirects` (Netlify) et `vercel.json` renvoient les 46 anciennes adresses de leur plan de site vers la bonne
    partie de la nouvelle page, par une redirection permanente (301).
  - Prêts pour leur domaine :
    - `robots.txt` ;
    - `sitemap.xml` ;
    - `llms.txt` ;
    - l'image de partage (`assets/og.jpg`).

**À dire au client :** sur leur site actuel, la page « About » est restée en texte de démonstration (« Lorem
Ipsum », avec ce texte en description dans Google), et une page « Test » au texte copié d'un couvreur du Tennessee est
publique et indexée. Le nouveau site les remplace et redirige ces adresses (voir l'audit SEO).

**Les documents de travail :**
- `ANALYSE.md` : le site actuel, et ce qui a été vérifié ailleurs (licence, avis, photos, promesses écartées) ;
- `seo-audit-fivepointsroofingfl.com-2026-10-15.md` : l'audit SEO et GEO du site actuel ;
- `DIRECTION.md` : la direction artistique ;
- `REVUE.md` : la revue de design et la relecture des textes ;
- `ACCESSIBILITE.md` : l'audit d'accessibilité ;
- `boards/` : les planches :
  - l'ouverture image par image, sur ordinateur et sur téléphone (`le-toit.jpg`) ;
  - les trois toits : le dessin qui se trace, la ligne de toit à mi-chemin, les repères reliés à la liste, les photos
    qui se découvrent (`les-toits.jpg`) ;
  - les parties du site ;
  - les détails (les questions, l'estimation, les erreurs et le message du formulaire, l'image de partage, le pied de
    page) ;
  - le téléphone.

## La méthode, et les extensions installées

- Le site est écrit à la main, en HTML, CSS et JavaScript.
- Lenis fait le défilement doux, et `build.mjs` assemble le tout.
- Les animations sont natives (CSS et Web Animations, un peu de JavaScript pour la ligne de toit), sans GSAP ni WebGL.
- Le logo est redessiné en vecteurs, d'après leur PNG de 280 px (`tools/logo.py`) : une étoile régulière aux traits
  exacts, coupée comme la leur, et le nom composé en Saira, converti en contours.

**Ce qui a servi :**
- **`frontend-design`** : le plan de direction artistique, revu contre le brief avant de coder (voir `DIRECTION.md`).
- **`design-critique`, `accessibility-review` et `ux-copy`** (extension Design) : la revue des captures, l'audit
  WCAG et la relecture des textes. Les corrections sont faites et listées dans `REVUE.md` et `ACCESSIBILITE.md`.
- **`seo-audit`** (Maquinable GEO) : l'audit du site actuel (47 pages, deux analyseurs de robots.txt), puis les mêmes
  contrôles sur le nouveau.
- **Les outils de Chrome** : Lighthouse et les traces de chargement, au téléphone ralenti et à l'ordinateur.
- **Playwright** :
  - l'ouverture et le tracé du dessin capturés image par image, les horloges arrêtées et calées ;
  - les 83 essais d'interaction (`tools/interact.mjs`), dont les débordements à 8 largeurs et la place des textes
    sous les toits de 1000 à 1920 px ;
  - le parcours au clavier, les cibles tactiles et le contraste mesuré sur les pixels (`tools/a11y.mjs`) ;
  - les planches et l'image de partage (`tools/shots.mjs`, `tools/boards.mjs`, `tools/og.mjs`).
- **Les sources publiques**, pour ne rien inventer :
  - le site de l'État de Floride (myfloridalicense.com) pour la licence ;
  - leur site actuel et son plan de site, pour les textes, les sept avis et les photos (550 à 750 px de large, le
    maximum qu'il sert).
- **21st.dev**, consulté pour la recherche : seul le principe d'un indicateur d'onglet qui s'étire vers l'onglet
  suivant est repris, réécrit sans bibliothèque (Web Animations).

**Ce qui n'a pas été retenu, et pourquoi :**
- **Une grande étoile seule dans l'accueil** : elle aurait fait insigne de shérif. L'étoile est au faîte d'un toit
  de mots, ce qu'elle est déjà dans leur logo (sa pointe du haut est un toit).
- **Un fond noir et or**, le réflexe « premium » : un fond clair et froid, l'asphalte pour deux parties seulement.
- **Les badges et les promesses invérifiables de leur site** : GAF, NRCA, National Women in Roofing, « top rated »,
  « 35 years » ou « 50 years », « 24/7 », et le sceau BBB, qui renvoie à une autre entreprise (Ray's Roofing
  Solutions, à Melbourne Beach).
- **Les photos génériques ou empruntées** : la maison du bandeau, les toits sous des feuillus ou devant des
  montagnes, les photos de la page « Test », le camion « Rays Roofing » et sa version retouchée, le pick-up au ciel
  rapporté. On montre peu de photos, mais ce sont les leurs.

## L'idée : la pente

Un couvreur pense en pente : l'angle d'un toit décide du matériau, du chemin de l'eau, de l'endroit où il fuira. Le
site prend cette ligne comme fil conducteur, et leur logo le dit déjà : la pointe du haut de l'étoile est un chevron,
la forme exacte d'un toit.

1. **L'accueil est un toit de mots.** « Roofing is in our blood » est écrit sur les deux rampants d'un toit à 6/12
   (26,6°), l'étoile au faîte. Le titre est sous le toit : « Roofs for homes, mobile homes and businesses across Polk
   County. »
2. **Une seule ligne de toit qui s'aplatit.** Dans la partie des toits, la même ligne dorée passe des deux pignons
   d'une maison au toit bas d'un mobile-home, puis au toit plat d'un bâtiment commercial ; le bâtiment se transforme
   avec elle. Sur chaque dessin, les endroits où ce toit-là fuit, d'après leurs propres textes.
3. **Les photos se découvrent à la pente du toit** : un bord en biais, à 6/12, qui monte une fois.
4. **Les garanties sur une règle graduée en années** : 10 ans, 20 ans, de 30 ans à vie.
5. **Le pied de page reprend le toit de l'accueil**, avec le numéro de téléphone dessous.

## La page, partie par partie

- **L'accueil** : le toit de mots, le titre, une phrase (une famille de couvreurs depuis 1955, sur place sous cinq
  jours, un devis détaillé), « Get a free estimate » et le téléphone, la photo d'une inspection avec leur camionnette ;
  puis trois preuves : la licence (avec un lien vers elle), la garantie de 10 ans, les cinq jours.
- **Les trois toits** : onglets (souris, doigt, flèches du clavier), dessin qui se trace la première fois, repères
  reliés à la liste ; pour chaque toit, ce qu'ils font et les matériaux.
- **Après une tempête** (fond asphalte) : quatre étapes, « 5 days or less », le platelage pourri trouvé sous les
  bardeaux, et leurs premiers gestes si le toit fuit.
- **Réparer, recouvrir, remplacer** : quand chacun convient ; quatre photos de leurs chantiers (la dépose, la
  sous-couche, les bardeaux, le toit fini) ; ce que comprend un toit neuf ; ce qu'il y a sur chaque chantier.
- **Les garanties** : la règle en années, l'inspection annuelle, ce que veut dire « No Dollar Limit », le financement.
- **La famille** : Troy Ray Jr. et 1955, trois générations, la licence de 2021 ; la licence en plaque, vérifiable ; la
  camionnette où son numéro est peint.
- **Les avis** : les sept, mot pour mot, prénom et initiale.
- **La zone** : le bureau, les horaires, les neuf villes.
- **Les questions** : six réponses tirées de leur blog, balisées pour les moteurs (FAQ).
- **L'estimation** : le téléphone, l'e-mail, les horaires, ce qui se passe ensuite, et un formulaire court qui écrit
  l'e-mail (rien n'est envoyé depuis la page : il n'y a pas de serveur, et la note le dit).

## Les photos

Neuf photos, toutes les leurs (voir `ANALYSE.md`), exportées en AVIF à leur taille d'origine (`tools/images.py`) :
- floutés : les plaques d'immatriculation, le numéro de maison sur un pilier de garage ;
- recadrée : la maison à la véranda ouverte, où l'on voit quelqu'un chez lui ;
- jamais agrandies : affichées à 60 % de leur largeur au plus sur ordinateur (vérifié au téléphone par un essai) ;
- légendées pour ce qu'elles montrent, sans nom de ville quand on ne le connaît pas.

## Les mesures

Lighthouse et traces de chargement de Chrome, sur la version en ligne servie en local ; téléphone simulé (4G rapide,
processeur ralenti 4 fois).

| Mesure | Résultat |
|--------|----------|
| Accessibilité (Lighthouse) | **100** sur ordinateur et sur téléphone |
| Bonnes pratiques (Lighthouse) | **100** |
| SEO (Lighthouse) | **100** |
| Navigation par agents (Lighthouse) | **100** |
| Affichage du contenu principal (LCP), téléphone ralenti | **0,31 s** |
| Décalage de la mise en page (CLS) | **0** |
| Essais d'interaction (`tools/interact.mjs`) | **83 sur 83** |
| Audit d'accessibilité (`tools/a11y.mjs`) | aucun point bloquant |
| Débordements, de 320 à 1920 px | aucun |

## Refaire le site

```
python3 -I tools/fonts.py "<Saira[wdth,wght].ttf>" <OFL.txt>   # la police, réduite (largeur 62,5 à 125 %, graisse 400 à 800)
python3 -I tools/logo.py "<Saira[wdth,wght].ttf>"              # le logo en vecteurs → data/logo.json
python3 -I tools/images.py <dossier des photos téléchargées>   # les photos → src/img/*.avif
python3 -I tools/fallback.py                                   # les polices de secours ajustées
python3 -I tools/redirects.py                                  # web/_redirects et web/vercel.json
node tools/og.mjs                                              # l'image de partage
node build.mjs                                                 # dist/ et dist-web/
node tools/interact.mjs <dossier>                              # les 83 essais
python3 -m http.server 8791 --bind 127.0.0.1 --directory dist-web
node tools/a11y.mjs                                            # l'audit d'accessibilité
node tools/shots.mjs <dossier> && node tools/boards.mjs <dossier> boards
```

Les sources : `src/index.html` (le contenu), `src/styles.css`, `src/main.js`, `vendor/` (Lenis et la police Saira,
licence OFL, dans `vendor/fonts/OFL-Saira.txt`).

`build.mjs` vérifie à chaque fois que les sept avis des données structurées sont ceux de la page mot pour mot, que les
neuf villes sont les mêmes partout, que les six questions de la FAQ balisée sont celles de la page, que la licence
figure partout où elle doit, et que chaque photo est décrite.
