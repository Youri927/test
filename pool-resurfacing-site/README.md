# Scottsdale Pool Resurfacing : refonte du site (maquette)

`dist/index.html` est un fichier unique (6,4 Mo) : polices, images, librairies et scripts sont intégrés. Il s'ouvre directement dans un navigateur, sans serveur.

L'analyse du site actuel et les choix de direction sont dans `ANALYSE.md`. Les planches avant/après sont dans `boards/`.

## La page

| Section | Contenu |
| --- | --- |
| Accueil | Sur fond blanc d'enduit : « Love your pool again. », appel, devis. À côté, le même bassin avant et après rénovation, vu de dessus sous l'eau. Au chargement, un trait passe comme une lisseuse et efface l'ancien fond jusqu'au milieu ; on compare ensuite en faisant glisser (souris, doigt ou clavier). « Now booking November, December, January ». |
| Confiance | 12+ ans, licensed / bonded / insured, satisfaction garantie, Google « Excellent » (27 avis), devis gratuit. |
| 01 Signes | Les 6 signes d'usure de la FAQ du site, à cocher. Chacun est repéré sur une illustration d'un vieux bassin à moitié vidé. |
| 02 Finitions | Les 9 finitions du site, rendues sous l'eau. Chaque pastille montre la matière sèche ; la finition choisie s'ouvre en cercle depuis le centre de l'aperçu. Fiche : texte du site, toucher, durée, lavage acide. « Ask about this finish » préremplit le formulaire. |
| 03 Services | Les 5 services en cartes qui s'empilent au défilement, avec les photos de chantier. |
| 04 Déroulé | Les 7 étapes du site. L'aperçu raconte le chantier au défilement : la ligne d'eau recule (vidange), le sablage, la pose de la finition, la ligne d'eau avance (remplissage), l'eau trouble puis claire. Une jauge suit le niveau d'eau. |
| Réalisations | 4 photos de chantier. |
| 05 Avis | Les 10 avis Google du site, mot pour mot, en colonnes qui défilent. |
| Offre | « We try to beat any licensed competitor’s written estimate. » |
| 06 FAQ | 8 questions ; les réponses reprennent le site. |
| Contact | Rappel par le patron, les 3 étapes « How it works », coordonnées, horaires, formulaire. |
| Secteurs | Les 51 quartiers listés sur le site. |

## Fabrication

La page n'a rien à calculer : toutes les vues d'eau sont des images rendues à l'avance. Les enchaînements (comparaison, cercle, bandes, ligne d'eau) sont de simples découpes CSS animées. Résultat : 60 images par seconde à l'arrêt sur toutes les sections, et aucun calcul lourd au défilement. La première version calculait l'eau en direct (WebGL), ce qui faisait trop et ralentissait la page.

- **`tools/water.js`** : le moteur d'eau (WebGL2) qui sert à fabriquer les images, il n'est plus chargé par la page.
  - La surface est une somme de houles.
  - Les caustiques sont calculées physiquement : une grille de rayons de soleil est réfractée par la surface (loi de Snell), et la lumière reçue par le fond est le rapport des aires avant et après réfraction.
  - Le fond est vu à travers la même surface : déformation, teinte selon l'épaisseur d'eau, reflets.
- **`tools/stills.mjs`** : rend les images de la page avec ce moteur.
  - Accueil : avant et après, même surface au même instant.
  - Les 9 finitions sous l'eau.
  - Les 6 états du chantier.
  - Les pastilles sèches du sélecteur.
  - Commande : `node tools/stills.mjs`.
- **`tools/finishes.py`** : génère les matières, rangées dans `textures/` : les 9 finitions, le vieil enduit abîmé et la coque sablée.
  - Chaque matière est modélisée à l'échelle réelle (1 px ≈ 0,24 mm) : galets, éclats de quartz, billes de verre, mosaïque.
  - Rendu avec relief, occlusion et brillance ; textures raccordables sans couture.
  - Ce sont des rendus, pas des photos : la page le précise sous le configurateur et sur l'accueil.
- **`tools/images.py`** : recadrage et étalonnage des photos du site actuel. Ce sont des photos de téléphone, agrandies ×2 par super-résolution (EDSR), sans retouche du contenu.
- **`tools/boards.py`** : les planches avant/après.
- **Animations** : GSAP 3 + ScrollTrigger, défilement doux Lenis (`vendor/`).
- **Polices** : Bricolage Grotesque et DM Mono, licence OFL (`vendor/fonts/`).

Pour reconstruire la page : `node build.mjs`.

## Comportements prévus

- **Mouvement réduit** (réglage système) : pas de défilement doux ni d'animations ; la comparaison reste utilisable ; colonnes d'avis immobiles.
- **Écrans testés** : 390 px (téléphone), 820 px (tablette), 1440 et 1920 px (ordinateur).

## À vérifier avec le client avant mise en ligne

1. **Droits des photos.** Les photos viennent du site actuel. Il faut confirmer qu'elles sont bien celles de leurs chantiers et qu'elles peuvent être réutilisées.
2. **Logo.** Le logo actuel contient une faute : « POOL RESURACING ». La maquette utilise une version redessinée (le bassin et le soleil) avec le nom correctement écrit. À valider, ou remplacer par leur logo corrigé.
3. **Formulaire non branché.** Il vérifie les champs et affiche un remerciement, mais n'envoie rien. Il faut le relier à leur messagerie ou à leur outil (et remettre un anti-spam).
4. **Finitions.** Les rendus sont indicatifs. Si l'entreprise a des photos ou des nuanciers réels des marques, ils peuvent compléter les fiches.
5. **Avis Google.** Le nombre (27) et les textes sont ceux affichés sur le site actuel. À mettre à jour au lancement.
6. **Dates de réservation** (« Now booking November, December, January ») : à tenir à jour.
