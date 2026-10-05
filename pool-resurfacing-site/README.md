# Scottsdale Pool Resurfacing : refonte du site (maquette)

`dist/index.html` est un fichier unique (6,2 Mo) : polices, images, librairies et scripts sont intégrés. Il s'ouvre directement dans un navigateur, sans serveur.

L'analyse du site actuel et les choix de direction sont dans `ANALYSE.md`. Les planches avant/après sont dans `boards/`.

## La page

| Section | Contenu |
| --- | --- |
| Accueil | Le fond du bassin vu de dessus. Le bassin vide se remplit au chargement, puis l'eau fait des ronds sous la souris, au toucher, ou d'elle-même de temps en temps. « Love your pool again. », appel, devis, « Now booking November, December, January ». |
| Confiance | 12+ ans, licensed / bonded / insured, satisfaction garantie, Google « Excellent » (27 avis), devis gratuit. |
| 01 Signes | Les 6 signes d'usure de la FAQ du site, à cocher. Chacun est repéré sur une illustration d'un vieux bassin à moitié vidé. |
| 02 Finitions | Les 9 finitions du site, rendues sous l'eau en temps réel. La nouvelle se répand en cercle à partir du centre. Fiche : texte du site, toucher, durée, lavage acide. « Ask about this finish » préremplit le formulaire. |
| 03 Services | Les 5 services en cartes qui s'empilent au défilement, avec les photos de chantier. |
| 04 Déroulé | Les 7 étapes du site. L'aperçu raconte le chantier : vidange, sablage, pose de la finition choisie plus haut, remplissage, eau trouble puis claire. Une jauge suit le niveau d'eau. |
| Réalisations | 4 photos de chantier. |
| 05 Avis | Les 10 avis Google du site, mot pour mot, en colonnes qui défilent. |
| Offre | « We try to beat any licensed competitor’s written estimate. » |
| 06 FAQ | 8 questions ; les réponses reprennent le site. |
| Contact | Rappel par le patron, les 3 étapes « How it works », coordonnées, horaires, formulaire. |
| Secteurs | Les 51 quartiers listés sur le site. |

## Fabrication

- **`src/water.js`** : le rendu de l'eau en WebGL2, sans librairie.
  - La surface est une somme de 12 houles plus les ronds dans l'eau, calculée exactement à chaque instant : même temps, même image, ce qui permet de filmer le site image par image.
  - Les caustiques sont calculées physiquement. Une grille de rayons de soleil est réfractée par la surface (loi de Snell). La lumière reçue par le fond est le rapport des aires avant et après réfraction.
  - Le fond est ensuite vu à travers la même surface : déformation, teinte selon l'épaisseur d'eau, reflets du soleil.
  - Le même moteur sait vider ou remplir le bassin (ligne d'eau) et remplacer un fond par un autre, en cercle ou en bande.
- **`tools/finishes.py`** : génère les 9 textures de finition, plus le vieil enduit abîmé et la coque sablée.
  - Chaque matière est modélisée à l'échelle réelle (1 px ≈ 0,24 mm) : galets, éclats de quartz, billes de verre, mosaïque.
  - Rendu avec relief, occlusion et brillance ; textures raccordables sans couture.
  - Ce sont des rendus, pas des photos : la page le précise sous le configurateur.
- **`tools/images.py`** : recadrage et étalonnage des photos du site actuel. Ce sont des photos de téléphone, agrandies ×2 par super-résolution (EDSR), sans retouche du contenu.
- **`tools/boards.py`** : les planches avant/après.
- **Animations** : GSAP 3 + ScrollTrigger, défilement doux Lenis (`vendor/`).
- **Polices** : Bricolage Grotesque et DM Mono, licence OFL (`vendor/fonts/`).

Pour reconstruire : `node build.mjs` (textures : `python3 tools/finishes.py` ; photos : `python3 tools/images.py <originaux> <agrandies>`).

## Comportements prévus

- **Économie de calcul** : chaque scène d'eau ne tourne que lorsqu'elle est à l'écran ; la résolution est plafonnée à 1,5×.
- **Sans WebGL2** : images fixes à la place des scènes d'eau.
- **Mouvement réduit** (réglage système) : pas de défilement doux ni d'animations, eau figée, colonnes d'avis immobiles.
- **Écrans testés** : 390 px (téléphone), 820 px (tablette), 1440 et 1920 px (ordinateur).

## À vérifier avec le client avant mise en ligne

1. **Droits des photos.** Les photos viennent du site actuel. Il faut confirmer qu'elles sont bien celles de leurs chantiers et qu'elles peuvent être réutilisées.
2. **Logo.** Le logo actuel contient une faute : « POOL RESURACING ». La maquette utilise une version redessinée (le bassin et le soleil) avec le nom correctement écrit. À valider, ou remplacer par leur logo corrigé.
3. **Formulaire non branché.** Il vérifie les champs et affiche un remerciement, mais n'envoie rien. Il faut le relier à leur messagerie ou à leur outil (et remettre un anti-spam).
4. **Finitions.** Les rendus sont indicatifs. Si l'entreprise a des photos ou des nuanciers réels des marques, ils peuvent compléter les fiches.
5. **Avis Google.** Le nombre (27) et les textes sont ceux affichés sur le site actuel. À mettre à jour au lancement.
6. **Dates de réservation** (« Now booking November, December, January ») : à tenir à jour.
