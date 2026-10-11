# Mad River Pools : nouveau site

Refonte complète de https://madriverpools.com.

Mad River Pool Construction :
- construit des piscines en béton, en fibre de verre et à liner vinyle ;
- pose des spas et des terrasses, et rénove les bassins ;
- travaille à Maitland et dans toute la Floride centrale depuis 1998.

Le propriétaire, Mike Ramée, supervise chaque chantier.

- **À ouvrir** : `dist/index.html`, d'un double-clic. C'est un seul fichier (7,2 Mo, photos comprises), qui marche sans serveur ni connexion.
- **À mettre en ligne** : le dossier `dist-web/`.
  - On le glisse sur app.netlify.com/drop, ou on le publie sur Vercel avec `vercel.json`.
  - `_headers` (Netlify) et `vercel.json` demandent aux moteurs de recherche de ne pas indexer la maquette. Ils sont à retirer au lancement.
  - Prêts pour leur domaine :
    - `robots.txt` ;
    - `sitemap.xml` ;
    - `llms.txt` ;
    - l'image de partage (`assets/og.jpg`).

**Les documents de travail :**
- `ANALYSE.md` : le site actuel ;
- `seo-audit-madriverpools.com-2026-10-11.md` : l'audit SEO et GEO du site actuel ;
- `DIRECTION.md` : la direction artistique ;
- `REVUE.md` : la revue de design et des textes d'interface ;
- `ACCESSIBILITE.md` : l'audit d'accessibilité ;
- `boards/` : les planches :
  - accueil ;
  - ouverture image par image ;
  - parties ;
  - téléphone ;
  - interactions.

## La méthode, et les extensions installées

- Le site est écrit à la main, en HTML, CSS et JavaScript.
- Lenis fait le défilement doux, et `build.mjs` assemble le tout.
- Les animations sont natives : CSS et quelques lignes de script, sans GSAP ni WebGL.

**Ce qui a servi :**
- **`frontend-design`** : le plan de direction artistique, revu contre le brief avant de coder (voir `DIRECTION.md`).
- **`design-critique`, `accessibility-review` et `ux-copy`** (extension Design) : la revue des captures, l'audit WCAG et la relecture des boutons et des messages. Les corrections sont faites et listées dans `REVUE.md` et `ACCESSIBILITE.md`.
- **`seo-audit`** (Maquinable GEO) : l'audit du site actuel, puis les mêmes contrôles sur le nouveau.
- **Les outils de Chrome** : les mesures Lighthouse et une trace de performance de l'ouverture.
- **Playwright** :
  - les captures écran par écran ;
  - les 17 contrôles d'interaction (`tools/interact.mjs`) ;
  - le parcours au clavier ;
  - le contraste mesuré sur les pixels.
- **21st.dev**, pour la recherche. Cherchés :
  - des pages d'accueil de constructeurs haut de gamme ;
  - des animations de largeur de police variable ;
  - des galeries filtrables ;
  - des frises de planning.

**Ce qui n'a pas été retenu, et pourquoi :**
- **Les héros proposés par 21st.dev** (« Glass Video Hero », « Cinematic Landing Hero », « SaaS Hero with 3D Sculpture »…) sont les gabarits que le brief écarte : on les retrouve sur n'importe quel site. L'accueil part du métier : le plan de la piscine.
- **Les effets de police variable au survol** (lettre par lettre, au curseur, « breathing text ») sont des gadgets. On garde l'idée de l'axe de largeur, mais une seule fois : le slogan s'élargit à l'ouverture, comme l'eau qui s'étale. Ensuite, plus rien ne bouge au survol.
- **Les galeries en 3D, en éventail ou en carrousel** ralentissent et cachent les photos. Ici, une grille simple ; les filtres font glisser les photos à leur place, et la visionneuse est un `<dialog>` natif.
- **Les composants de Gantt** sont des bibliothèques React. Le graphique « From dig to deck » tient en quelques lignes de grille CSS, dans le même trait que le plan.
- **Facade UI et les registres shadcn** fournissent des sections en React : héros centré, grille de services, carrousel d'avis. Le brief écarte ces gabarits, et la méthode du site est sans React.

## L'idée : le plan de la piscine

Un constructeur de piscines pense en plan, vu du dessus :
- un rectangle ;
- une extrémité arrondie ;
- un spa rond collé au bassin ;
- des cotes en pieds.

C'est aussi ce qu'on trace au sol, au cordeau, avant de creuser.

1. À l'ouverture, un trait fin dessine un grand rectangle aux angles arrondis, puis un cercle qui le chevauche : une piscine et son spa vus d'en haut.
2. Le contour fermé, l'eau monte : la vraie photo d'un de leurs bassins en béton se dévoile du fond vers le haut, puis le spa rond arrive dans le cercle.
3. En même temps, le slogan « Nothing's as cool as a Mad River Pool. » part en lettres étroites et s'élargit.

C'est la seule mise en scène du site. Elle dure environ deux secondes et ne se rejoue pas.

**Ensuite, le plan revient pour servir à quelque chose :**
- **« From dig to deck »** : les semaines du béton, de la fibre de verre et du liner sur une même règle.
- **« Vinyl liner shapes, drawn to scale »** : huit piscines à liner qu'ils ont installées, chacune dessinée à la même échelle avec ses vraies dimensions, du 10 × 22 au 18 × 75 pieds. On choisit une forme, la photo du bassin réel apparaît.
- **Le logo** : le plus petit plan possible, un rectangle et un cercle orange.

## La direction

- **Couleurs** (détail et contrastes dans `DIRECTION.md`) :
  - Kool Deck (#F4F5F1), le fond, comme la plage enduite qu'ils posent ;
  - Cage (#17232B), le texte et les traits, le gris bleuté des enclos grillagés ;
  - Travertine (#E8E0D2), les bandes de pierre ;
  - Shallow (#C9ECEF), l'eau peu profonde ;
  - Pool (#0A8EA3, et #076A7B pour les liens) ;
  - Orange County (#F57A1F), la seule couleur vive, réservée à la visite gratuite ;
  - Night (#0A1A23), la fin de page à la nuit, quand les bassins s'allument.
- **Typographie :** Mona Sans, une seule famille variable (largeur de 75 à 125 %, graisse de 200 à 900), sous licence OFL et hébergée avec le site.
  - Titres larges et gras.
  - Texte en largeur normale.
  - Le slogan joue sur la largeur.
- **Mise en page :**
  - grille de 12 colonnes, alignée à gauche ;
  - grandes photos aux angles arrondis ;
  - les sections alternent la plage claire et la pierre ;
  - la fin de page passe à la nuit.

## La page

1. **L'accueil** :
   - le slogan, puis « Pools, spas and backyards built across Central Florida since 1998… » ;
   - « Book a free home visit » et le téléphone ;
   - en bas, trois faits : depuis 1998, licence d'État CPC 1457780 (avec un lien pour la vérifier), revendeur Latham Pools.
2. **« Three ways to build a pool. We build all three. »** : béton (gunite), fibre de verre et liner vinyle. Chacun a sa photo, ses faits (finitions, garanties, entretien) et un lien « Ask about… » qui coche le bon sujet dans le formulaire.
3. **« From dig to deck »** : le graphique des délais :
   - béton : 3 à 3½ semaines ;
   - fibre de verre : environ 2 semaines ;
   - liner : 2 à 2½ semaines.

   Les hachures montrent la fourchette.
4. **« Vinyl liner shapes, drawn to scale. »** : les huit formes à l'échelle et la photo de la forme choisie. Au téléphone, la photo reste en haut de l'écran pendant qu'on parcourt la liste.
5. **« Spas, decks and everything around the pool. »** :
   - les spas, les « spools » et les swim spas ;
   - les terrasses en pavés, en travertin ou en béton avec Kool Deck ;
   - « One call covers the whole project » : les permis, le terrassement, la terrasse, l'électricité, l'enclos grillagé, le paysage, l'éclairage, l'arrosage et les murs de soutènement.
6. **« Is your pool showing its age? »** : la rénovation, par problème :
   - liner déchiré ;
   - fibre de verre fissurée ou ternie ;
   - béton qui se fissure ;
   - envie de changement.

   Chaque onglet montre leurs vraies paires avant/après. L'après se dévoile à côté de l'avant.
7. **« Pools we've built. »** : 22 photos de chantiers, avec :
   - des filtres (béton, fibre de verre, spas, terrasses) ;
   - une visionneuse avec flèches, balayage et Échap.

   Au téléphone, 11 photos puis « Show all 22 photos ».
8. **« The owner supervises every job. »** : Mike Ramée, 1998, la licence CPC 1457780 et le lien vers le registre de Floride, Latham Pools.
9. **« Pay for it over time. »** : HFS Financial et Lyon Financial.
10. **« Good to know. »** : six questions, reprises dans les données structurées.
11. **« Book a free home visit. »**, sur une de leurs piscines éclairée la nuit :
    - le téléphone, l'adresse e-mail, l'adresse du bureau ;
    - les horaires, avec « Open now » ou « Closed now » à l'heure de Maitland ;
    - le formulaire. On choisit d'abord ce qui nous intéresse. Le formulaire vérifie les champs, puis ouvre la messagerie du visiteur avec la demande rédigée, adressée à madriverpool@gmail.com. Le site n'a pas de serveur pour l'envoyer lui-même.

**Au téléphone :**
- le titre passe sur quatre lignes ;
- une barre « Call / Free home visit » apparaît après l'accueil et s'efface au niveau du formulaire ;
- le menu s'ouvre en plein écran (la page derrière ne prend plus le focus) ;
- l'avant et l'après passent l'un sous l'autre.

**Avec le réglage « moins d'animations » :**
- le plan est dessiné et rempli d'emblée ;
- pas de défilement doux ni d'effet de profondeur ;
- rien ne bouge seul.

## Rien d'inventé

- **Les textes** viennent de leurs 17 pages : services, galeries, financement, contact.
  - Ils sont raccourcis et réécrits en phrases simples, sans ajouter de service, de prix ni de chiffre.
  - Le délai de réponse reprend leur formule prudente (« we aim to reply within 48 hours »).
- **Pas d'avis clients** : leur site n'en a pas. Les notes des annuaires extérieurs se contredisent (date de création, adresse) et ne sont pas reprises.
- **Les photos** sont les leurs, recadrées et converties en AVIF.
  - Écartées :
    - la vidéo d'accueil (720p, décor incrusté) ;
    - les photos petites ou étirées.
  - Les mots « BEFORE » et « AFTER » incrustés dans les avant/après sont recadrés.
- **Les formes et leurs tailles** sont celles que leur galerie de piscines à liner donne pour chaque photo.
- **Les coordonnées géographiques** des données structurées sont celles de leur propre fiche.

## À confirmer avec eux

- **Le logo officiel en vectoriel** (SVG). Le site utilise un logotype provisoire : le petit plan (rectangle et cercle) et le nom en Mona Sans.
- **Une photo de Mike Ramée** sur un chantier, pour la partie « The owner supervises every job ».
- **Des avis clients** (Google, par exemple), à citer tels quels avec leur source.
- **L'adresse madriverpool@gmail.com** pour les demandes de visite : c'est celle de leur page de contact. Faut-il plutôt un vrai envoi (service de formulaires) ? Le bouton deviendrait alors « Send my request » (voir `REVUE.md`).
- **Les deux organismes de financement** (HFS Financial, Lyon Financial) : toujours partenaires ?
- **À corriger sur leur site actuel**, ou à rediriger au lancement (voir l'audit SEO) :
  - le code postal du balisage ;
  - la page en double de la galerie de rénovation ;
  - les liens parasites de leur `llms.txt`.

## Mesures

Lighthouse 12.8, téléphone simulé (réseau 4G lent, processeur ralenti 4 fois) et ordinateur :
- le site actuel est mesuré en ligne ;
- le nouveau est servi en local, compressé en brotli comme chez un hébergeur ;
- 6 passages au téléphone pour le nouveau site, 3 pour l'actuel.

| | Site actuel | Nouveau site |
| --- | --- | --- |
| Performance au téléphone | 54 à 78 | **86 à 99** |
| Affichage du plus grand élément au téléphone (LCP) | 2,0 à 3,1 s | **2,0 s** |
| Blocage du fil principal au téléphone (TBT) | 600 à 700 ms | **20 à 440 ms** (médiane 65 ms) |
| Performance à l'ordinateur | 80 (LCP 2,6 s) | **100** (LCP 0,6 s) |
| Accessibilité | 68 au téléphone, 80 à l'ordinateur | **100** |
| Bonnes pratiques | 96 | **100** |
| SEO | 100 | **100** |
| Décalage de mise en page (CLS) | 0,02 à 0,35 | **0** au téléphone, 0,03 à l'ordinateur |
| Poids de l'accueil | 1,5 Mo au téléphone, 7,4 Mo à l'ordinateur | **232 Ko** au téléphone, **373 Ko** à l'ordinateur |

**Notes sur ces chiffres :**
- À l'ordinateur, le petit décalage (0,03) vient de l'élargissement du slogan : sur une ligne, le second groupe de mots glisse vers la droite pendant l'ouverture. Il reste très en dessous du seuil de 0,1.
- Une comparaison avec et sans cette animation donne le même temps de blocage. Les écarts de TBT d'un passage à l'autre viennent de la machine de mesure.
- Sur le site actuel, l'accessibilité perd des points sur :
  - les contrastes ;
  - l'ordre des titres ;
  - des liens sans nom ;
  - des erreurs dans la console.

**Les mêmes contrôles SEO/GEO que pour le site actuel :**
- un titre de 56 caractères et une description de 145 ;
- une image de partage et une adresse canonique ;
- un seul H1 ;
- aucune image sans texte alternatif ;
- des données structurées `HomeAndConstructionBusiness` (adresse correcte, horaires, licence, services, Facebook) et `FAQPage` ;
- aucun robot bloqué ;
- un `llms.txt` réécrit et un plan du site.

**Vérifié aussi :**
- de 320 à 1440 px, sans débordement, y compris avec l'espacement du texte élargi ;
- au clavier : 85 arrêts dans l'ordre de lecture, focus toujours visible (bleu clair sur les fonds sombres) ;
- les contrastes mesurés sur les vrais pixels, y compris sur la photo de nuit ;
- avec « moins d'animations » ;
- les 17 contrôles d'interaction de `tools/interact.mjs` :
  - formes ;
  - onglets ;
  - avant/après ;
  - filtres ;
  - visionneuse ;
  - formulaire et ses erreurs ;
  - menu ;
  - ancres ;
  - barre d'appel.

## Fabrication

- **`node build.mjs`** assemble :
  - `dist/index.html`, tout intégré (7,2 Mo) ;
  - `dist-web/`, une page légère, avec les photos (en plusieurs tailles, choisies par le navigateur) et la police en fichiers séparés.
- **`src/`** : `index.html`, `styles.css`, `main.js`, et `img/` (les photos en AVIF, avec leurs versions réduites `<nom>.w<largeur>.avif`).
- **`data/photos.json`** liste les photos retenues, avec leurs recadrages et leurs largeurs ; `photo-sizes.json` donne leurs dimensions.
- **`tools/images.py`** refait les AVIF depuis les photos d'origine : `python3 -I tools/images.py <dossier>`.
- **`tools/interact.mjs`** rejoue les 17 contrôles d'interaction sur le site servi en local (`npx http-server dist-web -p 8765`).
- **`tools/shots.mjs`** fait les captures (page entière et accueil, ordinateur et téléphone).
- **`web/`** : les fichiers de mise en ligne (`_headers`, `vercel.json`, `robots.txt`, `sitemap.xml`, `llms.txt`, `og.jpg`).
- **`vendor/`** : Lenis 1.3.26 et la police Mona Sans (avec sa licence OFL).
