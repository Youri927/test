# La Ferme de la Biza : refonte du site

Proposition de refonte pour [labiza.fr](https://www.labiza.fr), le site de **La Ferme de la Biza**, domaine de réception à Missy-sur-Aisne (mariages, fêtes de famille, événements d'entreprise). L'analyse du site actuel et les choix de direction sont dans [`ANALYSE.md`](ANALYSE.md).

**Le livrable est un fichier unique, `dist/index.html`**, qui s'ouvre directement dans un navigateur, sans serveur ni connexion : polices, styles et scripts y sont intégrés.

## Le concept : « Une journée à la Biza »

Le site se lit comme le déroulé d'une journée de mariage au domaine. **La lumière change au fil du défilement** : le ciel passe de l'après-midi à l'heure dorée, au coucher du soleil, puis à la nuit étoilée, avant de revenir au matin pour les familles et les entreprises. Le soleil descend et se couche, la lune se lève, et les couleurs du texte et des boutons suivent. Une horloge, en bas à gauche, donne l'heure de cette journée.

| Heure | Partie | Ce qu'on y voit |
| --- | --- | --- |
| 15 h | Le domaine | Le nom « La Biza » se lève sur l'horizon, devant la ligne d'arbres de l'autre rive, et se reflète avec elle dans l'Aisne, où il ondule |
| 15 h 30 | L'arrivée | Le porche de la ferme, un portail charretier en pierre dessiné pierre à pierre : en descendant, on s'en approche et on entre dans le passage, au bout duquel on aperçoit le parc ; à côté, l'histoire réelle de la ferme, du Moyen Âge à Naïma et Vianney |
| 16 h 30 | Le oui, sur l'île | Le parc boisé, l'alignement de peupliers, les saules de la berge et l'îlot (son saule, l'arche fleurie, les chaises), reflétés dans l'eau, avec des repères |
| 18 h | Le vin d'honneur | Le préau de 150 m², dessiné trait par trait comme un plan d'architecte |
| 20 h | Le dîner | La grande salle (200 m², 150 assis, cheminée) et la carte des trois menus, qui s'incline sous la souris |
| 23 h | La fête | Une guirlande de guinguette dont les ampoules s'allument une à une ; celles proches de la souris brillent plus fort |
| 2 h | La nuit | Le gîte 4 étoiles : ses cinq chambres s'allument une par une |
| Le lendemain | Familles et entreprises | Deux portes, qui s'ouvrent au survol, avec les formules réelles |
| — | Visite 3D | La grande salle et le préau en vue éclatée, dessinés trait par trait ; le bouton lance la visite virtuelle (Matterport) |
| — | Avis | 4,9/5 sur 126 avis Mariages.net, les quatre notes détaillées, les cinq Wedding Awards |
| — | Venir | Les accès (Soissons, Reims, Paris, Charles-de-Gaulle) sur un schéma, l'adresse, les horaires et la demande de visite |

## Direction artistique

- **Couleurs.** Pas de crème ni de rose poudré : la palette est celle du ciel au-dessus de l'Aisne, calculée heure par heure (`KEYS` dans `src/main.js`). Le texte passe automatiquement du sombre au clair quand la nuit tombe.
- **Typographie.** Bodoni Moda, un didone à fort contraste, en très grand ; Schibsted Grotesk pour le texte.
- **Images.** Les photos du domaine sont inaccessibles depuis mon environnement de travail. La rivière, le ciel, les reflets, le mur de pierre, la guirlande et le gîte sont générés en direct (canvas et SVG). Les vraies photos du domaine (l'îlot, la salle, le préau, le gîte) pourront compléter chaque moment.
- **Le paysage.** Les arbres sont dessinés touche par touche, comme une gravure : des chênes, des peupliers d'Italie, des saules pleureurs, des buissons et des roseaux, éclairés du côté du soleil, sur trois plans de plus en plus pâles avec la distance et la brume. Le paysage est dessiné une seule fois à la taille de l'écran, puis seulement recoloré quand l'heure change (`src/woods.js`).
- **Le porche.** C'est une évocation des portails charretiers des fermes fortifiées du Soissonnais (mur de moellons, arc en claveaux autour d'une clé, piédroits harpés, chasse-roues, lierre), pas un relevé de l'entrée réelle de la Biza (`src/porche.js`).

## Responsive et accessibilité

- Testé à 390, 768, 1024, 1280 × 720, 1440 et 1920 px de large, sans défilement horizontal.
- Sur mobile, l'horloge se range dans la barre du haut, l'îlot garde un seul repère et les portes s'empilent.
- Avec « réduire les animations », le défilement doux et les animations sont coupés : le ciel suit toujours l'heure, l'eau ne bouge plus, et toutes les lumières sont allumées.
- L'eau et les étoiles ne sont dessinées que lorsqu'elles sont à l'écran ; le porche et le parc sont dessinés quand la page est au repos, ou dès qu'on s'en approche.

## Fabrication

```
node build.mjs     # assemble src/ et vendor/ dans dist/index.html
```

| Fichier | Rôle |
| --- | --- |
| `src/index.html` | structure et contenu |
| `src/styles.css` | styles (les couleurs sont des variables mises à jour par le script) |
| `src/woods.js` | les bois : arbres, plans, lumière ; la ligne d'arbres du haut de page, le parc et l'îlot |
| `src/porche.js` | le porche de l'arrivée et le parc qu'on aperçoit au bout du passage |
| `src/main.js` | ciel et heure, Aisne et reflets, arche, guirlande, gîte, navigation, apparitions |
| `vendor/` | GSAP + ScrollTrigger, Lenis, polices (licences SIL OFL jointes) |

Tous les boutons « Demander une visite » ouvrent un e-mail à info@labiza.fr ; les numéros sont cliquables.

**La visite virtuelle.** Le bouton « Lancer la visite 3D » ouvre pour l'instant la page de visite du site actuel (`labiza.fr/visite-virtuelle`). Dès que l'identifiant Matterport est connu, il suffit de le mettre dans `data-matterport` (section `#visite` de `src/index.html`) : la visite s'affiche alors directement dans la page.

## À vérifier avant une mise en ligne

- Les tarifs et ce qu'ils comprennent (relevés sur les fiches publiques du domaine).
- La capacité exacte selon l'événement (de 30 à 250 personnes selon les fiches).
- Le devenir des pages « Salle de mariage à… » du site actuel.
- Les photos du domaine, à fournir. Une photo de l'entrée réelle pourra remplacer l'évocation du porche.
- L'identifiant de la visite Matterport (adresse en `my.matterport.com/show/?m=…`).
