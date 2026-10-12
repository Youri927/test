# Prestige Pools of Wilmington : nouveau site

Refonte complète de https://www.prestigepoolsofwilmington.com.

Prestige Pools of Wilmington :
- pose uniquement des piscines en fibre de verre Latham (« Grand Dealer ») et de l'équipement Pentair ;
- travaille avec ses propres équipes et ses propres machines ;
- ajoute spas, jacuzzis, terrasses, foyers et pergolas, et entretient les piscines qu'elle a posées ;
- est une entreprise familiale, à Monkey Junction (Wilmington, Caroline du Nord), depuis 1999.

Shane Kosnik, le fondateur, construit des piscines depuis 1991. Il dirige l'entreprise avec Darlene.

- **À ouvrir** : `dist/index.html`, d'un double-clic. C'est un seul fichier (5,7 Mo, photos et polices comprises), qui marche sans serveur ni connexion.
- **À mettre en ligne** : le dossier `dist-web/`.
  - On le glisse sur app.netlify.com/drop, ou on le publie sur Vercel avec `vercel.json`.
  - `_headers` (Netlify) et `vercel.json` demandent aux moteurs de recherche de ne pas indexer la maquette. Ils sont à retirer au lancement.
  - Prêts pour leur domaine :
    - `robots.txt` ;
    - `sitemap.xml` ;
    - `llms.txt` ;
    - l'image de partage (`assets/og.jpg`).
- **Pour une démonstration** : `?lights=on` ou `?lights=off` à la fin de l'adresse force la nuit ou le jour, sans garder ce choix.

**Les documents de travail :**
- `ANALYSE.md` : le site actuel ;
- `seo-audit-prestigepoolsofwilmington.com-2026-10-12.md` : l'audit SEO et GEO du site actuel ;
- `DIRECTION.md` : la direction artistique ;
- `REVUE.md` : la revue de design et des textes d'interface ;
- `ACCESSIBILITE.md` : l'audit d'accessibilité ;
- `boards/` : les planches :
  - l'accueil de jour et de nuit ;
  - l'allumage image par image ;
  - les sections de jour, puis de nuit ;
  - les interactions ;
  - le téléphone ;
- `shots/` : les captures des interactions, en taille réelle.

## La méthode, et les extensions installées

- Le site est écrit à la main, en HTML, CSS et JavaScript.
- Lenis fait le défilement doux, et `build.mjs` assemble le tout.
- Les animations sont natives : CSS et quelques lignes de script, sans GSAP ni WebGL.

**Ce qui a servi :**
- **`frontend-design`** : le plan de direction artistique, revu contre le brief avant de coder (voir `DIRECTION.md`).
- **`design-critique`, `accessibility-review` et `ux-copy`** (extension Design) : la revue des captures, l'audit WCAG et la relecture des boutons et des messages. Les corrections sont faites et listées dans `REVUE.md` et `ACCESSIBILITE.md`.
- **`seo-audit`** (Maquinable GEO) : l'audit du site actuel, puis les mêmes contrôles sur le nouveau.
- **Les outils de Chrome** : Lighthouse et les traces de chargement, sur le site actuel et sur le nouveau.
- **Playwright** :
  - les captures écran par écran ;
  - les 38 contrôles d'interaction (`tools/interact.mjs`) ;
  - le parcours au clavier et le contraste mesuré sur les pixels (`tools/a11y.mjs`) ;
  - les planches (`tools/shots.mjs`, `tools/boards.mjs`).
- **OpenCV** : le repérage du logo incrusté dans les photos et le recalage des photos de jour et de nuit (voir « Rien d'inventé »).
- **21st.dev**, pour la recherche. Cherchés :
  - des sélecteurs de couleurs ;
  - des frises de processus ;
  - des murs d'avis.

**Ce qui n'a pas été retenu, et pourquoi :**
- **Les nuanciers de couleurs** ne montrent que des aplats. Ici, on choisit la couleur des projecteurs sur trois vraies photos de la même piscine, prises le même soir.
- **Les frises de processus en défilement horizontal** cachent la moitié des étapes. Les 8 étapes de la pose tiennent dans une grille qui se lit d'un coup d'œil, et s'allument au défilement.
- **Les murs d'avis** sont des grilles de cartes identiques. Ici, une grande citation, puis des colonnes de texte.
- **Facade UI et les registres shadcn** fournissent des sections en React (héros centré, grille de services, carrousel d'avis). Le brief écarte ces gabarits, et la méthode du site est sans React.

## L'idée : allumer la piscine

Le soir, on allume les projecteurs du bassin. Dans leurs photos, c'est le moment le plus beau : l'eau devient un bloc de lumière bleue, et les palmiers sont éclairés par en dessous. Leur page sur l'éclairage le dit : « Who said pool time ends when the sun goes down? »

Le site a donc deux états, le jour et la nuit, et un interrupteur : **« Pool lights »**.

1. À l'ouverture, de jour : le titre « Fiberglass pools for long days and late swims. » et une vraie piscine Prestige au crépuscule.
2. On appuie sur l'interrupteur, posé sur le coin de la photo :
   - le fond passe du ciel de jour à la nuit, par une teinte de crépuscule ;
   - les textes suivent d'un seul mouvement ;
   - la photo se fond dans la même piscine, le même soir, lumières allumées.

   Les deux photos sont recalées l'une sur l'autre (0,75 % d'échelle, 0,2° de rotation), et le passage dure 1,25 s.
3. Le choix est gardé pour les visites suivantes.

**Il s'allume aussi tout seul.**
- L'heure du coucher du soleil est calculée chaque jour pour Wilmington, à l'heure de l'Est. Elle s'affiche sous la photo : « Sunset in Wilmington today: 6:41 pm. »
- 20 minutes après le coucher du soleil, si le visiteur n'a rien choisi, les lumières s'allument. Elles s'éteignent 20 minutes avant le lever.
- Quelqu'un qui cherche une piscine le soir, après le travail, arrive directement sur la version de nuit.

**Plus bas, la nuit revient pour servir à quelque chose :**
- **« Pool time doesn't end at sunset. »** : une bande toujours de nuit. La même forme libre éclairée en blanc, en bleu ou en rouge, trois vraies photos recalées sur la forme lumineuse du bassin. On choisit une couleur, la photo change sur place.
- **La galerie** : un filtre « After dark ». La nuit, les piscines éclairées passent en premier.
- **La visite** : de jour, leur dépôt de Monkey Junction vu du ciel ; de nuit, leurs piscines d'exposition allumées.

C'est la seule mise en scène du site. Elle répond toujours à un geste, ou à l'heure qu'il est vraiment à Wilmington.

## La direction

- **Couleurs** (détail et contrastes dans `DIRECTION.md`) :
  - Haze (#E4EBEF), le fond de jour, le ciel brumeux de la côte ;
  - Night Sky (#0C1838, et #0A1430 pour le fond de nuit), du nom d'un gel coat Latham ;
  - Pool Light (#2B47F5, #3550FF la nuit), la seule couleur vive, le bleu des projecteurs LED ;
  - Moon (#EAF0F7), le texte de nuit ;
  - Lantern (#FFC46B), la lumière chaude des guirlandes, seulement la nuit et en petites touches ;
  - Dusk (#C9B6C4), le crépuscule, qui ne dure que pendant l'allumage.
- **Typographie :** deux familles sous licence OFL, hébergées avec le site.
  - Syne pour les titres, large et ronde, en 700 (800 pour le nom de l'entreprise).
  - Onest pour le texte, 17-18 px.
  - Des polices de secours aux mêmes mesures évitent tout saut au chargement.
- **Mise en page :**
  - grille de 12 colonnes, alignée à gauche ;
  - photos aux angles arrondis comme le bord d'une coque moulée ;
  - galerie en bandes larges au format 2:1 ;
  - une bande de nuit au milieu de la page, et une fin de page de nuit, même le jour.

## La page

1. **L'accueil** :
   - « Fiberglass pools for long days and late swims. » ;
   - « Latham fiberglass pools and spas, set by our own crews with our own machines. Family-owned at Monkey Junction since 1999. » ;
   - « Plan your pool » et le téléphone ;
   - trois faits : depuis 1999 à Wilmington, Latham Grand Dealer, Best of the Cape Fear (WECT, 2024) ;
   - la photo, son interrupteur et l'heure du coucher du soleil.
2. **« Made in one piece. Set in days. »** :
   - leur dépôt de 2 acres vu du ciel, et une coque déplacée par leur pelle ;
   - quatre faits : 3 à 5 jours de pose, une surface lisse, une coque qui plie sans casser, la garantie à vie ;
   - le comparatif fibre de verre, béton et liner, sur quatre points tirés de leur page « Pros & Cons ».
3. **« Our machines. Our crews. »** : leurs camions et leur chargeuse, et les 8 étapes de la pose, qui s'allument une à une au défilement.
4. **« Every pool here is one of ours. »** :
   - 34 piscines, avec cinq filtres (rectangles, formes libres, avec spa, au bord de l'eau, de nuit) ;
   - une grande photo toutes les six ;
   - une visionneuse avec flèches, glissement du doigt et Échap.

   Au téléphone, 10 photos puis « Show all 34 photos ».
5. **« Make it yours. »** : trois planches de vraies photos (dans l'eau, autour, au fond du jardin), puis la piscine « cocktail » de 10 × 16 pieds pour les petits jardins.
6. **« Pool time doesn't end at sunset. »** : l'éclairage Pentair et la piscine en trois couleurs.
7. **Spas et équipement** : les spas Latham, les jacuzzis Nordic et Marquis, et l'équipement Pentair qu'on pilote du téléphone.
8. **« Our customers keep mentioning Jordan. »** : une grande citation et neuf autres avis, prénom et source à l'appui.
9. **« Shane has been building pools since 1991. »** : son parcours, la devise « Helping families have fun. That's us. », les licences, les récompenses et ce qu'ils donnent au quartier.
10. **Le financement et le service** : six prêteurs ; la détection de fuites ; « Request service », qui ouvre le formulaire sur le bon sujet.
11. **« Plan your pool. »** :
    - le formulaire : on choisit d'abord le sujet. Le formulaire vérifie les champs, puis ouvre la messagerie du visiteur avec la demande rédigée. Elle part vers sales.ppow@gmail.com, ou vers service.ppow@gmail.com pour une piscine déjà posée. Le site n'a pas de serveur pour l'envoyer lui-même ;
    - la visite : adresse, horaires, « Open now » ou « Closed now » à l'heure de Wilmington, le téléphone et l'itinéraire.

**Au téléphone :**
- l'en-tête se resserre : le nom, l'interrupteur et le bouton « Menu » ;
- le menu s'ouvre en plein écran (la page derrière ne prend plus le focus) ;
- le comparatif passe en une ligne par type de piscine, chaque valeur précédée de son nom.

**Avec le réglage « moins d'animations » :**
- l'interrupteur change la page d'un coup ;
- le titre et les photos sont là dès l'affichage ;
- pas de défilement doux.

## Rien d'inventé

- **Les textes** viennent de leurs 35 pages.
  - Ils sont raccourcis et réécrits en phrases simples, sans ajouter de service, de prix ni de chiffre.
  - Deux corrections : leur catalogue liste 57 modèles Latham (et non « plus de 70 », comme on le compterait en incluant les 15 « collections ») ; et le site ne reprend pas « Vinyl Pool Builder » de leurs titres, puisque leur page « About us » dit « Prestige only installs Latham fiberglass pools ».
- **Les avis** sont dix vrais avis de leur page « Testimonials », cités avec le prénom et la source (Google ou Facebook), points de suspension compris.
  - Sur leur page, le nom suit la citation : l'en-tête « A Dream Achieved – Nanny & Berry » le confirme. Chaque attribution a été vérifiée dans ce sens.
  - Aucun avis de HomeAdvisor n'est repris.
- **Les photos** sont les leurs, recadrées et converties en AVIF, jamais retouchées ni agrandies (1280 px au plus). 71 photos sont utilisées.
  - Toutes portent le logo « Prestige Pools / Monkey Junction » incrusté. Il a été repéré automatiquement dans chaque photo candidate (correspondance de gabarit sur 51 échelles).
  - Chaque cadre est le plus grand qui évite ce logo, avec une marge de 14 px. Le logo n'est jamais effacé : il est hors cadre.
  - Les photos de jour et de nuit de la même piscine sont recalées l'une sur l'autre (points SIFT pour la paire de l'accueil, forme lumineuse du bassin pour les trois couleurs).
- **Les coordonnées** viennent de leurs pages : le téléphone et les horaires de l'en-tête, l'adresse du pied de page, les deux adresses de la page de contact.
- **L'heure du coucher du soleil** est calculée dans la page, pour les coordonnées de Wilmington, sans service extérieur.

## À confirmer avec eux

- **Les photos originales, sans le logo incrusté.** Elles permettraient des cadrages plus libres et des photos plus grandes.
- **Des portraits** : Jordan à côté des avis ; Shane et Darlene dans « Shane has been building pools since 1991 ». Leur site n'en publie aucun.
- **Le logo officiel en vectoriel** (SVG). Le site utilise un logotype provisoire : le nom en Syne et un point de lumière qui s'allume la nuit.
- **Un vrai envoi du formulaire** (service de formulaires) au lieu de la messagerie. Le bouton deviendrait alors « Send my request » (voir `REVUE.md`).
- **Ce qui peut avoir changé** : les six prêteurs, le remboursement Duke Energy sur les pompes, les horaires.
- **À corriger sur leur site actuel**, en attendant le lancement (voir l'audit SEO) :
  - le contrôle « humains » qui renvoie une page vide aux robots qui n'exécutent pas JavaScript ;
  - les titres qui annoncent « Vinyl Pool Builder » ;
  - la phrase cassée du pied de page (« Prestige Pools of , provides… »).

## Mesures

Lighthouse 13.4.1 et traces de chargement de Chrome, téléphone simulé (réseau 4G rapide, processeur ralenti 4 fois) et ordinateur :
- le site actuel est mesuré en ligne ;
- le nouveau est servi en local.

| | Site actuel | Nouveau site |
| --- | --- | --- |
| Accessibilité | 61 au téléphone et à l'ordinateur | **100** (aussi de nuit) |
| Bonnes pratiques | 42 au téléphone, 46 à l'ordinateur | **100** |
| SEO | 91 | **100** |
| Fait pour le téléphone | non : pas de balise `viewport`, la page d'ordinateur s'affiche en réduit | **oui**, de 320 à 1440 px |
| Affichage du plus grand élément au téléphone (LCP) | 0,67 s | 0,94 à 1,10 s |
| Décalage de mise en page (CLS) | 0 | **0** |
| Poids de l'accueil | 4,67 Mo en 70 requêtes | **423 Ko** en 9 requêtes au téléphone, 428 Ko en 11 à l'ordinateur |
| Ressources en http sur la page en https | 3, dont une police Google (Playball), bloquée par le navigateur | **aucune** |
| Données structurées | aucune | **entreprise et site** |

**Notes sur ces chiffres :**
- Le LCP du site actuel est plus court parce qu'au téléphone, sa page est une page d'ordinateur réduite, dont le plus grand élément est un petit bloc de texte. Le nouveau affiche son titre et son chapô en taille réelle. Les deux restent sous le seuil « bon » de 2,5 s.
- Le délai du nouveau site vient du travail du processeur avant le premier affichage, pas du réseau : servie compressée en brotli (29 Ko au lieu de 134 Ko pour la page), elle donne le même temps.
- Sur le site actuel, Lighthouse relève notamment :
  - en accessibilité : des contrastes, 17 images sans texte alternatif, 12 liens sans nom, une langue non déclarée, un cadre sans titre ;
  - en bonnes pratiques : la page s'ouvre en mode de compatibilité (pas de `doctype`), du contenu en http, des erreurs dans la console, des cookies de tiers.

**Les mêmes contrôles SEO/GEO que pour le site actuel :**
- un titre de 60 caractères et une description de 140 ;
- une image de partage et une adresse canonique ;
- un seul H1 et `lang="en"` ;
- aucune image sans texte alternatif ;
- des données structurées `HomeAndConstructionBusiness` (adresse, horaires, fondateur, récompense, services, Facebook, Instagram et Houzz) et `WebSite` ;
- aucun robot bloqué ;
- un `llms.txt` écrit avec les faits et un plan du site.

**Vérifié aussi :**
- de 320 à 1440 px (10 largeurs), sans débordement, y compris avec l'espacement du texte élargi ;
- au clavier : 62 arrêts dans l'ordre de lecture, focus toujours visible (bleu clair sur les fonds de nuit) ;
- les contrastes mesurés sur les vrais pixels, de jour comme de nuit ;
- avec « moins d'animations » ;
- les 38 contrôles d'interaction de `tools/interact.mjs` :
  - lumières (allumage, choix gardé, les deux interrupteurs d'accord, photo décrite) ;
  - allumage automatique à 21 h 30 et phrase du soir ;
  - statut « Open now » ou « Closed now » ;
  - galerie de nuit, filtres, « Show all », visionneuse ;
  - couleurs des projecteurs ;
  - formulaire, ses erreurs et le choix du service ;
  - menu sur téléphone.

## Fabrication

- **`node build.mjs`** assemble :
  - `dist/index.html`, tout intégré (5,7 Mo) ;
  - `dist-web/`, une page légère, avec les photos (en plusieurs tailles, choisies par le navigateur) et les polices en fichiers séparés.
- **`src/`** : `index.html`, `styles.css`, `main.js`, et `img/` (les photos en AVIF, avec leurs versions réduites `<nom>.w<largeur>.avif`).
- **`data/`** :
  - `crops.json` : pour chaque photo, le cadre 2:1 qui évite le logo ;
  - `photos.json` : les photos retenues, leurs recadrages et leurs largeurs ;
  - `gallery.json` et `options.json` : la galerie et les planches d'options, d'où `build.mjs` tire le HTML ;
  - `photo-sizes.json` : les dimensions des photos.
- **`tools/`** :
  - `select.py` écrit `photos.json`, `gallery.json` et `options.json` : `python3 -I tools/select.py` ;
  - `images.py` refait les AVIF depuis les photos d'origine : `python3 -I tools/images.py <dossier>` ;
  - `findlogo.py` repère le logo incrusté, `propose.py` en déduit les cadres ;
  - `align.py` et `align_glow.py` recalent les photos de nuit sur celles de jour ;
  - `interact.mjs` rejoue les 38 contrôles d'interaction sur `dist/index.html` ;
  - `a11y.mjs` fait le parcours au clavier, les cibles tactiles et les contrastes, sur le site servi en local (`npx http-server dist-web -p 8765 -s`) ;
  - `shots.mjs` fait les captures des sections et du téléphone, et `boards.mjs` compose les planches.
- **`web/`** : les fichiers de mise en ligne (`_headers`, `vercel.json`, `robots.txt`, `sitemap.xml`, `llms.txt`, `og.jpg`).
- **`vendor/`** : Lenis 1.3.26, et les polices Syne et Onest (avec leurs licences OFL).
