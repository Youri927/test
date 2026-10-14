# Skoda Construction : nouveau site

Refonte complète de https://www.skodaconstructionflorida.com.

Skoda Construction Inc. est un constructeur familial de maisons sur mesure sur la côte du golfe de Floride :
- la famille construit depuis 1950 ; Chris Skoda a fondé l'entreprise en 1985, et son fils Mike l'a rejoint en 2014 ;
- licence de l'État CBC1266776 (Certified Building Contractor), au nom de Michael Skoda, active jusqu'au 31 août 2028 ;
- maisons neuves (y compris sur le terrain du client), rénovations, restauration après tempête et locaux
  commerciaux, de Boca Grande à Marco Island ;
- un bureau à Naples, un autre dans la région de Cleveland (Ohio).

- **À ouvrir** : `dist/index.html`, d'un double-clic. C'est un seul fichier (5,4 Mo, les photos, les polices, la
  carte et le script compris), qui marche sans serveur ni connexion.
- **À mettre en ligne** : le dossier `dist-web/`.
  - On le glisse sur app.netlify.com/drop, ou on le publie sur Vercel avec `vercel.json`.
  - `_headers` (Netlify) et `vercel.json` demandent aux moteurs de recherche de ne pas indexer la maquette. Ils sont
    à retirer au lancement.
  - `_redirects` (Netlify) et `vercel.json` renvoient les 38 anciennes adresses vers la bonne partie de la nouvelle
    page (les 33 du plan de site, plus 5 pages du menu), par une redirection permanente (301).
  - Prêts pour leur domaine :
    - `robots.txt` ;
    - `sitemap.xml` ;
    - `llms.txt` ;
    - l'image de partage (`assets/og.jpg`).

**À dire au client :** leur site actuel décline les mêmes textes pour dix villes (27 pages, de 89 à 99 % de mots en
commun). Google range ce cas parmi les pages satellites de ses règles anti-spam. Le nouveau site le remplace par une
seule page, avec les villes sur une vraie carte, et redirige les anciennes adresses (voir l'audit SEO).

**Les documents de travail :**
- `ANALYSE.md` : le site actuel, et ce qui a été vérifié ailleurs (licence, avis, photos) ;
- `seo-audit-skodaconstructionflorida.com-2026-10-14.md` : l'audit SEO et GEO du site actuel ;
- `DIRECTION.md` : la direction artistique ;
- `REVUE.md` : la revue de design et la relecture des textes ;
- `ACCESSIBILITE.md` : l'audit d'accessibilité ;
- `boards/` : les planches :
  - le nom épinglé et les chantiers qui passent devant (`le-nom.jpg`) ;
  - l'ouverture image par image, sur ordinateur et sur téléphone ;
  - « Better than new » : la maison restaurée, à trois moments du défilement ;
  - les parties du site ;
  - les détails (la visionneuse, les erreurs, le budget et le message du formulaire, l'image de partage) ;
  - le téléphone.

## La méthode, et les extensions installées

- Le site est écrit à la main, en HTML, CSS et JavaScript.
- Lenis fait le défilement doux, et `build.mjs` assemble le tout.
- Les animations sont natives (CSS, avec un peu de JavaScript pour suivre le défilement), sans GSAP ni WebGL.
- La carte est tracée par script à partir des limites officielles du Census (`tools/geo.py`).

**Ce qui a servi :**
- **`frontend-design`** : le plan de direction artistique, revu contre le brief avant de coder (voir `DIRECTION.md`).
- **`design-critique`, `accessibility-review` et `ux-copy`** (extension Design) : la revue des captures, l'audit
  WCAG et la relecture des textes. Les corrections sont faites et listées dans `REVUE.md` et `ACCESSIBILITE.md`.
- **`seo-audit`** (Maquinable GEO) : l'audit du site actuel, puis les mêmes contrôles sur le nouveau.
- **Les outils de Chrome** : Lighthouse et les traces de chargement, au téléphone ralenti et à l'ordinateur.
- **Playwright** :
  - l'ouverture capturée image par image, l'horloge des transitions arrêtée et calée ;
  - les 63 essais d'interaction (`tools/interact.mjs`), dont un contrôle des débordements à 8 largeurs ;
  - le parcours au clavier, les cibles tactiles et le contraste mesuré sur les pixels (`tools/a11y.mjs`) ;
  - les planches et l'image de partage (`tools/shots.mjs`, `tools/boards.mjs`, `tools/og.mjs`).
- **Les sources publiques**, pour ne rien inventer :
  - le site de l'État de Floride (myfloridalicense.com) pour la licence ;
  - leur site actuel et son plan de site, pour les textes, les avis et les photos (2 500 px de large au plus, le
    maximum que sert leur hébergeur) ;
  - le Census Bureau (limites des comtés et des villes, 2023) pour la carte.
- **21st.dev**, consulté pour la recherche (galeries à défilement horizontal, histoires racontées au défilement,
  titres révélés derrière un masque) : des composants React génériques, souvent en carrousel ou en 3D, dont aucun
  n'est pensé pour un constructeur. Seul le principe du texte qui monte derrière un masque est refait, en CSS, pour
  les lettres du nom.

**Ce qui n'a pas été retenu, et pourquoi :**
- **Un comparateur avant/après à glissière** pour la maison restaurée : les photos des dégâts et de la maison refaite
  ne sont pas prises du même point de vue. L'histoire est racontée dans l'ordre, datée.
- **Une rangée de chiffres sous le titre** (« depuis 1950, 11 villes, 7 avis ») : remplacée par une phrase, et par la
  licence, vérifiable.
- **Une partie « Testimonials » à part** : chaque avis est posé dans le chapitre dont il parle.
- **Les promesses sans preuve de leur site** : « award-winning », la note A+ du BBB, la construction verte.

## L'idée : un Skoda derrière chaque chantier

Leur argument le plus fort tient en une phrase de leur site : « All jobs are owner supervised ». Chris et Mike Skoda
sont sur chaque chantier. Le site en fait sa mise en page :
- **le nom « Skoda »**, très grand, dans le bleu de leur logo, reste en place au milieu de l'écran ;
- **leurs chantiers passent devant lui**, photo après photo : le terrain nu, la coque en blocs sur trois niveaux, la
  maison finie, une cuisine, la maison refaite après la tempête, un studio de fitness ;
- puis la phrase qui donne la clé : « All our jobs are owner supervised. A Skoda is on every one of them. »

Tout est en CSS (position sticky) : le défilement reste celui du navigateur, rien ne flotte, rien n'est recalculé.

**L'ouverture** (1,65 s, une fois, quand les polices sont là) :
1. le titre, le texte et les boutons sont là tout de suite ;
2. les cinq lettres du nom montent une à une derrière leur ligne de base ;
3. la première photo, le terrain nu, entre par le bas.

Rien ne se décale dans la page (CLS 0), et rien ne bloque la page pendant ce temps. Avec « réduire les animations »,
on voit directement l'état final.

**Ensuite, le mouvement n'arrive que là où il dit quelque chose :**
- du terrain à la maison : trois photos de trois chantiers se découvrent dans l'ordre ;
- « Better than new » : sur ordinateur, la partie reste en place pendant que la barre du temps avance de novembre 2022
  à décembre 2023, des dégâts au séchage, puis à la maison refaite ; d'une étape à l'autre, l'ancienne s'efface sur
  place et la nouvelle monte (un fondu enchaîné, jamais d'écran vide) ;
- la famille : la ligne des dates se trace une fois ;
- les réponses aux gestes : la visionneuse (elle s'ouvre en fondu, et chaque photo arrive du côté où l'on va), le
  budget qui suit le projet choisi (la suite du formulaire glisse pour lui faire place, ses fourchettes apparaissent
  en fondu), la demande prête, qui arrive en montant un peu.

## La direction

- **Couleurs** (détail et contrastes dans `DIRECTION.md` et `ACCESSIBILITE.md`) :
  - le blanc des maisons modernes de leurs photos (pas de crème) ;
  - le bleu exact de leur logo (#0253A0), pour le nom, les boutons, les liens et les dates ;
  - le noir bleuté des menuiseries (#17212E) pour le texte et la partie sombre de la tempête ;
  - les gris du bloc de béton (#E9EAE6) et du joint (#C9CBC5), et l'ardoise (#565D66) du texte secondaire.
- **Typographie :**
  - Besley, un Clarendon (licence OFL), pour le nom, les titres et les citations : le descendant direct des
    lettres de leur logo de 1985, sans le relief western ;
  - Rethink Sans (licence OFL) pour le reste.

  Les deux sont hébergées avec le site, avec des polices de secours aux mêmes mesures pour éviter tout saut au
  chargement.
- **Mise en page :** une seule longue page sur une grille de 12 colonnes, alignée à gauche ; du blanc pour lire, une
  seule partie sombre (la tempête), un seul fond gris (la famille), le pied de page bleu. Les seuls numéros sont ceux
  du déroulé d'un aménagement de bureaux, qui est une vraie suite, et les dates de la famille.

## La page

1. **L'accueil** : « Custom homes on Florida's Gulf coast, built by the Skoda family. », « Book a consultation » et
   « Call 239-777-7288 », puis le nom épinglé et huit photos de leurs chantiers qui passent devant.
2. **« New homes, from the lot up. »** : ce qu'ils vérifient sur votre terrain, puis le terrain, la coque et la
   maison finie de trois de leurs chantiers ; l'avis de Salvatore T.
3. **« Remodels, from one room to the whole house. »** : six métiers, douze pièces de leurs maisons (en Floride et
   dans l'Ohio, comme le dit la partie) avec une visionneuse ; l'avis de Rosemarie D.
4. **« Better than new. »** : la maison restaurée, de novembre 2022 à décembre 2023 ; les avis de John M. et Lou A.
   sur l'assurance ; « Call 239-777-7288 » pour l'urgence.
5. **« Commercial work, scheduled around your business. »** : sept types de projets, trois photos, le déroulé en
   sept étapes d'un aménagement de bureaux ; les avis de Robyn L. et Joe L.
6. **« A family of builders since 1950. »** : 1950, 1985, 2014, 2023 ; Chris et Mike, leur parcours, leurs phrases ;
   l'avis de Gloria A.
7. **« From Boca Grande to Marco Island. »** : la carte des onze villes et la liste par comté ; le second bureau dans
   l'Ohio.
8. **« Book a consultation. »** : le téléphone et l'e-mail en grand, la licence avec le lien vers le registre de
   l'État, et un formulaire qui écrit l'e-mail (type de projet, leurs fourchettes de budget, ville, coordonnées).

**Au téléphone :**
- l'en-tête garde le nom et « Menu », qui ouvre la liste des parties, la consultation et l'appel ;
- le nom reste au milieu de l'écran, les photos passent devant, une par une ;
- la maison restaurée se lit en trois étapes l'une sous l'autre ;
- les petites photos des dégâts, prises au téléphone, gardent leur taille réelle.

## Rien d'inventé

- **Les textes** viennent de leur site, raccourcis et réécrits en phrases simples, sans ajouter de service, de
  chiffre ni de promesse.
- **Les avis** sont ceux de leur site, signés d'un prénom et d'une initiale ; les coupes sont marquées « … ». Les
  données structurées reprennent mot pour mot les citations affichées (`build.mjs` le vérifie).
- **Les photos** sont les leurs, converties en AVIF et jamais agrandies :
  - recadrées pour ôter le rétroviseur d'une voiture ou l'échafaudage du voisin ;
  - un numéro de maison, une boîte aux lettres et les panneaux d'autres entreprises sont floutés ;
  - écartées : une image de synthèse, deux photos signées d'un autre photographe, une façade avec le logo d'un
    client, une maison avec une poubelle au premier plan.
- **Aucune ville sur les intérieurs** : les arbres d'automne par leurs fenêtres disent l'Ohio, alors que leur site les
  légende « Naples » ou « Bonita Springs ».
- **La licence** est celle du site de l'État : numéro, type, titulaire et date de fin. Aucune adresse de rue n'est
  publiée : celle de leur site est un appartement, celles de la licence sont un domicile et un bureau de l'Ohio ; le
  site dit « Naples, Florida » et « Cleveland, Ohio area ».
- **Pas repris** (voir `ANALYSE.md`) : « award-winning », la note A+ du BBB, la construction verte, les noms des
  clients commerciaux, « Highland Heights » (une ville de l'Ohio sur leurs pages de Naples et d'Estero).

## À confirmer avec l'entreprise

- **Les photos** : que les maisons de Floride sont bien les leurs, et où sont les intérieurs (Ohio ou Floride).
- **La maison restaurée** : sa ville (leur site dit Naples sur la page, Captiva ou Sanibel dans les légendes).
- **La note A+ du BBB** : aucune fiche trouvée ; à remettre si elle existe.
- **Une adresse de bureau à Naples** qui puisse être publiée.
- **Le 239-777-7288** : répond-il aux SMS, et à quelles heures ?
- **Une adresse e-mail à leur nom de domaine,** plutôt que l'adresse Gmail.
- **Le formulaire** : il passe par la messagerie du visiteur ; pour recevoir les demandes directement, il faudra un
  service de formulaire, à choisir avec eux.

## Mesures

Lighthouse et traces de chargement de Chrome, téléphone simulé (4G rapide, processeur ralenti 4 fois) et
ordinateur, sur le nouveau site servi en local.

| | Nouveau site |
| --- | --- |
| Accessibilité (Lighthouse) | **100** sur ordinateur et sur téléphone |
| Bonnes pratiques (Lighthouse) | **100** |
| SEO (Lighthouse) | **100** |
| Navigation par agents (Lighthouse) | **100** |
| Affichage du contenu principal (LCP) | **0,15 s** sur ordinateur, **0,68 s** au téléphone ralenti (médiane de cinq chargements à cache vide) |
| Décalage de mise en page (CLS) | **0** |
| Premier chargement, ordinateur | **12 requêtes, 523 Ko, 1 domaine** |
| Premier chargement, téléphone | **8 requêtes, 621 Ko, 1 domaine** (photos en haute densité pour l'écran) |
| Données structurées | **`GeneralContractor`** : téléphone, e-mail, Naples, les 11 villes desservies, la licence reconnue par le DBPR, 1985, le fondateur, quatre avis |

**Notes sur ces chiffres :**
- Servie compressée par l'hébergeur (Netlify et Vercel le font d'office), la page passe de 145 à 44 Ko (gzip), ou
  34 Ko (brotli).
- Les photos se chargent en arrivant à l'écran, sauf la première de l'accueil.
- La trace signale un calcul de mise en page forcé au démarrage (Lenis mesure la page) : c'est le premier calcul de
  la page de toute façon, et Chrome n'estime aucun gain possible. Une fois les polices là, recalculer toute la page
  prend 4 ms.

**Les mêmes contrôles SEO/GEO que pour le site actuel :**
- un titre de 54 caractères et une description de 157, une image de partage et une adresse canonique ;
- un seul `<h1>`, un `<h2>` par partie, des `<h3>` pour les étapes, les personnes et les comtés, `lang="en"` ;
- un texte alternatif sur chaque photo ;
- des données structurées `GeneralContractor`, sans adresse de rue ;
- aucun robot bloqué ;
- un `llms.txt` écrit avec les faits.

**Vérifié aussi :**
- de 320 à 1920 px, sans débordement, y compris avec l'espacement du texte élargi ; 72 caractères par ligne au plus ;
- au clavier : 44 arrêts sur ordinateur et 38 sur téléphone, focus toujours visible, jamais caché sous l'en-tête ;
- les contrastes mesurés sur les vrais pixels (89 mesures de texte, toutes au-dessus du seuil ; les contours et les
  repères au-dessus de 3:1) ;
- avec « moins d'animations » ;
- les 63 essais d'interaction de `tools/interact.mjs` :
  - l'ouverture, le nom qui tient dans ses marges et reste épinglé, les photos qui passent devant ;
  - les liens de l'en-tête, la partie courante du menu ;
  - le terrain, la coque et la maison qui se découvrent ;
  - la maison restaurée au début, au milieu et à la fin, sans photo qui en couvre une autre, et le fondu enchaîné
    d'une étape à l'autre ;
  - la visionneuse (son ouverture en fondu, la bonne photo, sa plus grande version, la photo suivante qui arrive de
    la droite, Échap et le focus rendu) ;
  - le formulaire : les erreurs, le focus, les fourchettes de budget selon le projet (et leur arrivée sans à-coup),
    l'e-mail mal formé, la demande rédigée ;
  - le lien d'évitement, le menu du téléphone, le mouvement réduit, les photos et la console.

## Fabrication

- **`node build.mjs`** assemble :
  - `dist/index.html`, tout intégré (5,4 Mo), chaque photo intégrée une seule fois, dans sa plus grande version ;
  - `dist-web/`, une page légère (145 Ko), avec les photos et les polices en fichiers séparés, et les fichiers de
    `web/`.

  Il vérifie au passage que le contenu tient ses promesses : onze villes dans la liste, sur la carte et dans les
  données structurées ; douze pièces ; trois étapes à la maison restaurée ; la licence dans l'accueil, la
  consultation, le pied de page et les données ; les avis des données identiques à ceux de la page.
- **`src/`** : `index.html`, `styles.css`, `main.js` et `img/` (les photos en AVIF).
- **`data/`** : les dimensions des photos (`photo-sizes.json`), la carte (`map.json`) et les réglages des polices de
  secours (`fallback.json`).
- **`tools/`** :
  - `images.py` refait les photos depuis les fichiers téléchargés (recadrages et floutage compris) :
    `python3 -I tools/images.py <dossier des téléchargements>` ;
  - `geo.py` refait la carte depuis les fichiers du Census :
    `python3 -I tools/geo.py <dossier de pyshp> <dossier des fichiers du Census>` ;
  - `fallback.py` calcule les polices de secours ;
  - `redirects.py` écrit les redirections des anciennes pages (`web/_redirects` et `web/vercel.json`) ;
  - `interact.mjs` rejoue les 63 essais d'interaction ;
  - `a11y.mjs` fait le parcours au clavier, les cibles tactiles, les contrastes et la structure, sur le site servi en
    local (`python3 -m http.server 8790 --bind 127.0.0.1 --directory dist-web`) ;
  - `shots.mjs` fait les captures, `boards.mjs` compose les planches, `og.mjs` l'image de partage.
- **`web/`** : les fichiers de mise en ligne (`_headers`, `_redirects`, `vercel.json`, `robots.txt`, `sitemap.xml`,
  `llms.txt`, `og.jpg`).
- **`vendor/`** : Lenis 1.3.26, et les polices Besley et Rethink Sans (sous-ensembles latins, avec leurs licences
  OFL).
