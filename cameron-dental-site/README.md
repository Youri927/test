# Cameron Dental Studio : refonte du site (maquette)

`dist/index.html` est un fichier unique (4,8 Mo) : polices, photos, logo, librairies et scripts sont intégrés. Il s'ouvre directement dans un navigateur, sans serveur.

L'analyse du site actuel et les choix de direction sont dans `ANALYSE.md`. Les planches avant/après sont dans `boards/`.

## L'idée : de vrais sourires, en pleine lumière

Le meilleur argument du cabinet, ce sont les sourires de ses patients. Le site les montre d'emblée : l'accueil est un mur de douze vrais patients après traitement.
- **Au survol**, un visage montre son avant.
- **L'interrupteur « Show before »** bascule tout le mur en vague.
- **De temps en temps**, un visage montre seul son avant une seconde.
- **Un clic** ouvre le cas complet.

Le reste est volontairement simple :
- **Couleurs** : celles du cabinet, sur fond blanc (le bleu de leur logo et un bleu marine).
- **Typographie** : une grotesque franche (Bricolage Grotesque) pour les titres, Hanken Grotesk pour le texte.
- **Photos** : uniquement les vraies.
- **Sobriété** : peu d'effets, aucun gimmick.

Une première version, « The Smile Issue », mise en page comme un magazine, a été écartée. Elle reste dans l'historique git (commit `4fac857`).

## La page

| Section | Contenu |
| --- | --- |
| En-tête | Le logo (la dent de leur logo, redessinée), le menu, l'état « Open now / Closed » calculé à l'heure de Naples (lundi–vendredi, 7 h–17 h), le téléphone et le bouton de rendez-vous. |
| Accueil | « Gentle, non-judgmental, beautiful dentistry » (leur accroche), deux boutons (rendez-vous, appel), la note Google, et le mur des sourires. Dessous, quatre raisons de choisir le cabinet : Top Dentist 2021, près de 5 étoiles, conventionné PPO, urgences le jour même. |
| La Dr. Cameron | La photo du miroir, « Every smile is a work of art », son parcours, l'avis d'une patiente, ses distinctions. |
| Un cas en détail | Donald Rebello : avant / après (visage et sourire), avec son avis signé. Le bouton « See all 18 smiles » ouvre la visionneuse. |
| Les soins | Huit soins en accordéon : esthétique, blanchiment, aligneurs, implants et prothèses, famille, holistique, ronflement, urgences. Chaque lien « Ask about… » présélectionne le sujet dans le formulaire. |
| Le confort | « Nervous about the dentist? Tell us. » : trois niveaux d'aide (approche douce, protoxyde d'azote, sédation consciente), d'après leurs propres textes, et l'avis de Dawn Pike. |
| Les dentistes | La photo d'équipe, qui s'élargit jusqu'aux bords de l'écran au défilement, puis les cinq dentistes, avec une courte biographie. |
| Les avis | Page bleue : un avis en grand, cinq autres, les liens Google, Yelp et Facebook, et les couvertures de magazines. |
| Le cabinet | Les photos du cabinet, l'équipement, le lien vers leur visite vidéo. |
| Première visite et assurances | Les quatre étapes de la première visite. Un vérificateur d'assurance : on tape le nom de son assurance, la liste de leur page « finances » répond (25 PPO, 6 plans de réduction). Les moyens de paiement. |
| Rendez-vous | Page bleu marine : le téléphone, l'adresse, les horaires, la photo du bâtiment et le formulaire. |

Sur téléphone, une barre « Call / Book a visit » apparaît après l'accueil. Elle se retire sur la section rendez-vous.

## Contenus

- Tous les textes viennent de leur site, raccourcis ou réécrits ; rien n'est inventé (ni chiffre, ni avis, ni badge).
- Les avis sont ceux publiés sur leur site, avec le nom de leur auteur.
- La note reprend la phrase de leur page « Best Naples Dentist » : « nearly a perfect five-star rating, with over 150 Google reviews ».
- Les photos des patients ne portent pas de nom, sauf Donald Rebello, dont l'avis est signé.

## Fabrication

- **Photos** : `tools/images.py` exporte les photos du site actuel en WebP.
  - Les photos des patients ne sont ni retouchées ni étalonnées. Petites à l'origine (430 × 536 px pour les visages, 385 × 246 px pour les gros plans), elles ont été agrandies ×2 par super-résolution (EDSR, OpenCV), comme les portraits des dentistes et la photo d'équipe.
  - Les photos de banque d'images, les affiches de films et l'ancienne publicité du site actuel ne sont pas reprises.
- **Logo** : `tools/logo.py` vectorise la dent de leur logo (tracé fidèle, potrace) dans `src/logo.svg` ; le nom est composé dans la police du site.
- **Planches** : `tools/boards.py`.
- **Animations** : GSAP 3 + ScrollTrigger, défilement doux Lenis (`vendor/`).
  - Uniquement des transformations, des opacités et des découpes ; rien n'est calculé en continu.
  - Pas de curseur personnalisé, pas d'effet 3D, pas de dégradés ni de cartes « verre ».
  - Mesuré : 60 images par seconde à l'arrêt sur toutes les sections, aucune tâche longue au défilement.
- **Polices** : Bricolage Grotesque (Atelier Triay) et Hanken Grotesk, licence OFL (`vendor/fonts/`).

Pour reconstruire la page : `node build.mjs`.

## Comportements prévus

- **Mouvement réduit** (réglage système) : pas de défilement doux ni d'animation ; tout est affiché d'emblée.
- **Clavier** : tout se pilote au clavier ; dans la visionneuse, les flèches changent de cas et Échap la ferme. Sur téléphone, on balaie.
- **Écrans testés** : 390 px (téléphone), 820 px (tablette), 1280, 1440 et 1920 px (ordinateur).

## À vérifier avec le client avant mise en ligne

1. **Le bon numéro.** Le site actuel en affiche quatre : (239) 423-5481, 422-7924, 256-1330 et 402-2413 (probablement du suivi d'appels). La maquette utilise celui de la page contact, (239) 422-7924.
2. **L'accord des patients** pour mettre leurs photos avant / après en avant sur l'accueil. Elles sont déjà publiques sur leur galerie, avec leurs noms.
3. **Les droits sur les couvertures** de Gulfshore Life et Naples Illustrated.
4. **La note Google et le nombre d'avis**, à mettre à jour.
5. **Formulaire non branché.** Il vérifie les champs et affiche un remerciement, mais n'envoie rien. Il faut le relier à leur outil de rendez-vous et ajouter un anti-spam.
6. **Les assurances** : la liste est celle de leur page « finances » ; à tenir à jour.
