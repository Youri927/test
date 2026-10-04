# Scottsdale Pool Patio & Landscape Design : refonte du site

Proposition de refonte pour [scottsdalepoolpatiolandscape.com](https://www.scottsdalepoolpatiolandscape.com), le site de **Scottsdale Pool Patio & Landscape Design**, qui conçoit, construit et rénove piscines, jardins et espaces de vie extérieurs à Scottsdale (Arizona). L'analyse du site actuel et les choix de direction sont dans [`ANALYSE.md`](ANALYSE.md).

**Le livrable est un fichier unique, `dist/index.html`** (5,7 Mo), qui s'ouvre directement dans un navigateur, sans serveur ni connexion : polices, photos, styles et scripts y sont intégrés.

## Le concept : « Where Scottsdale lives outside »

Une vraie réalisation de l'entreprise apparaît dans un cercle, comme un soleil qui se lève à côté du titre, sur un fond de sable strié d'ombres de pergola. Là où le titre passe dans le cercle, ses lettres deviennent claires. Au défilement, le cercle s'ouvre jusqu'à remplir l'écran : la photo se recadre, le titre passe en clair, l'en-tête aussi.

| Partie | Ce qu'on y voit |
| --- | --- |
| Accroche | le soleil qui se lève puis s'ouvre ; licence, ancienneté, note Google et devis gratuit en bas d'écran |
| Une seule équipe | la promesse en une phrase, qui s'éclaire mot à mot au défilement |
| Trois métiers | piscines, paysagisme, espaces extérieurs : trois volets photo qui s'ouvrent au survol (empilés sur mobile) |
| 25 prestations | l'index complet sur fond nuit, rangé par élément ; au survol, la photo de l'élément suit la souris, sous le texte |
| Sept formes de bassin | chaque forme dessinée en plan comme sur une planche d'architecte, trait par trait, avec les reflets qui bougent au fond de l'eau ; sur mobile, les légendes deviennent des repères numérotés |
| Réalisations | dix photos des galeries en défilement horizontal, pastille « View » au survol, visionneuse plein écran (flèches du clavier, balayage) |
| Déroulé | cinq étapes, la photo et le numéro suivent l'étape en cours ; frise des délais réels |
| Avis | les avis Google cités mot pour mot, un à la fois ; la note de 5,0 et les preuves |
| Questions | les huit questions de la FAQ, en accordéon |
| Devis | formulaire en trois étapes (projet, budget, coordonnées), avec vérification des champs |

## Direction artistique

- **Couleurs.** Sable, papier et encre ; un bleu nuit pour les parties sombres ; la terre cuite des toits de Scottsdale comme seule couleur vive.
- **Typographie.** Mona Sans très large en capitales pour le titre, Instrument Serif et son italique pour les titres de parties.
- **Images.** Uniquement les photos des galeries de l'entreprise, recadrées, agrandies quand il le fallait et étalonnées ensemble (voir plus bas). Pas d'image générée ni d'illustration : les seuls dessins sont les plans des bassins.
- **Mouvement.** Défilement doux (Lenis), animations au défilement (GSAP et ScrollTrigger) : textes qui montent ligne par ligne, volets qui se découvrent, plans qui se tracent, parallaxe légère dans la galerie, léger effet d'aimant sur les boutons principaux.

## Responsive et accessibilité

- Testé à 390 (téléphone), 820 (tablette), 1280 × 720, 1440 et 1920 px de large, sans défilement horizontal.
- Sur téléphone et tablette en hauteur, le cercle de l'accroche se place sous le texte ; la galerie défile au doigt ; le plan des bassins reste visible en haut pendant qu'on parcourt les formes.
- Avec « réduire les animations » : pas de défilement doux ni d'épinglage, tout est visible d'emblée, l'accroche reste sur le cercle et la galerie se fait défiler à l'horizontale.
- Navigation au clavier : formes de bassin (flèches), accordéon, visionneuse (flèches, Échap), menu mobile (Échap), lien d'évitement vers le contenu.

## Fabrication

```
node build.mjs                                          # assemble src/ et vendor/ dans dist/index.html
python3 tools/images.py <originaux> <agrandies>        # recadre, étalonne et exporte les photos en WebP (src/img/)
python3 tools/caustics.py                               # dessine la texture des reflets (src/img/caustics.webp)
```

| Fichier | Rôle |
| --- | --- |
| `src/index.html` | structure et contenu (en anglais, comme le site actuel) |
| `src/styles.css` | styles ; couleurs et tailles en variables en tête de fichier |
| `src/plans.js` | les sept plans de bassin (repère 800 × 560) |
| `src/main.js` | accroche, défilement, apparitions, volets, index, plans, galerie, avis, FAQ, formulaire |
| `src/img/` | photos recadrées et étalonnées, texture des reflets |
| `tools/` | préparation des photos et de la texture |
| `vendor/` | GSAP + ScrollTrigger, Lenis, polices (licences SIL OFL jointes) |

**Les photos.** Elles viennent des galeries du site actuel. Les plus petites ont été agrandies deux fois (super-résolution EDSR, OpenCV), sans retouche du contenu, puis toutes ont reçu le même étalonnage : bleus des bassins moins saturés, noirs à peine relevés, ombres légèrement froides et lumières légèrement chaudes. Les images ajoutées en 2023 au site actuel, qui ressemblent à des photos de banque d'images, n'ont pas été reprises.

**Le formulaire de devis** vérifie les champs et affiche un message de remerciement, mais n'envoie rien : il reste à le brancher sur la messagerie ou le CRM de l'entreprise.

## À vérifier avant une mise en ligne

- Que toutes les photos utilisées sont bien des réalisations de l'entreprise, et leur légende.
- Le logo officiel : la maquette utilise un monogramme dessiné pour l'occasion (un soleil sur l'horizon).
- L'accord pour citer les avis Google, et le nombre d'avis à jour (6 à la date de l'analyse).
- L'envoi du formulaire de devis (adresse de réception, CRM, protection anti-spam).
- Les liens vers les sites jumeaux (Anthem, Arcadia, Cave Creek, Gilbert, Phoenix) et la page Facebook.
- La mention « Redesign concept, unofficial mockup » du pied de page, à retirer.
- Les versions de GSAP et Lenis embarquées et leurs licences (GSAP « Standard License », Lenis MIT).
