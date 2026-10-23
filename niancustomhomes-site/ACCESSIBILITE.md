# Accessibilité : nouveau site NIAN Custom Homes

**Référence :** WCAG 2.1 niveau AA (et 2.2 pour la taille des cibles et le focus jamais masqué)
**Date :** 23 octobre 2026
**Outils :**
- `tools/a11y.mjs` (Chromium, sur `dist-web` servi en local) ;
- `tools/interact.mjs` (45 essais) ;
- Lighthouse 13.5.

## En bref

**Points trouvés : 6. Bloquants : 0. Corrigés : 6.**

- **Clavier.** Le site se parcourt entièrement au clavier, dans l'ordre de lecture : 61 arrêts sur ordinateur, 56 sur
  téléphone.
- **Focus.** Il se voit partout : un contour plein de 2 px décalé de 3 px, bordeaux sur le stucco (10,4:1), blanc sur la
  bande bordeaux (11,5:1), le pied de page et la visionneuse (17,6:1). Il ne passe jamais sous l'en-tête fixe.
- **Contrastes.** Les 90 textes mesurés passent les seuils, sur les vrais pixels de la page : 80 à 1 440 px (visionneuse
  comprise) et 10 à 390 px, là où les textes rapetissent.
- **Au doigt.** Aucune cible seule ne fait moins de 44 px de haut ; seuls des liens pris dans une phrase restent plus
  petits, ce que le critère 2.5.8 permet.
- **Mouvement.** Avec « réduire les animations », rien ne bouge seul : pas de défilement doux, pas d'accueil épinglé
  (les deux moitiés restent séparées, avec leur « + »), pas d'apparitions.
- **Lighthouse.** Accessibilité 100 sur ordinateur et sur téléphone.

## Ce qui a été corrigé pendant l'audit

| # | Problème | Critère | Correction |
|---|---|---|---|
| 1 | Le nom de chaque maison et son style étaient lus d'un seul mot : « The Park Modern HomeModern West Indies design » | 1.3.1, 4.1.2 | Une virgule cachée entre les deux : « The Park Modern Home, Modern West Indies design » |
| 2 | Même défaut sur les six choix du terrain et de la maison : « One of our lotsLots throughout Collier County. » | 4.1.2 | Deux-points cachés : « One of our lots: Lots throughout Collier County. » |
| 3 | Le lien vers la licence, dans la ligne du © du pied de page, ne se distinguait du texte que par sa couleur (relevé par Lighthouse) | 1.4.1 | Souligné |
| 4 | Le lien « Skip to content » menait au contenu sans y déplacer le focus : `main` ne pouvait pas le recevoir | 2.4.1 | `main` reçoit le focus (`tabindex="-1"`, sans contour) ; un essai le vérifie |
| 5 | Au doigt, des cibles de 25 à 32 px de haut : « or call 239-280-6428 » sous le bouton de l'accueil, l'e-mail et le téléphone des agents, le logo de l'en-tête | 2.5.8 (AA : 24 px, respecté) | 44 px de haut, au-delà du minimum AA |
| 6 | Pendant l'arrivée, le titre de la page (h1) restait invisible 0,6 s, le temps de son fondu | lisibilité | Le titre est visible dès le premier affichage ; seuls la phrase et le bouton apparaissent en fondu |

## Constats par principe

### Perceptible

| # | Constat | Critère | État |
|---|---|---|---|
| 1 | **Les photos.** Chacune est un bouton nommé par sa légende, suivie de « , open full screen ». L'image a un `alt=""`, puisque le bouton porte déjà la description. Les vignettes sont nommées par la légende de leur photo. | 1.1.1 | ✅ |
| 2 | **« Lot + Home ».** Les deux grands mots et le « + » de l'accueil sont décoratifs (`aria-hidden`). Le titre de la page les dit en clair : « Custom homes in Naples, from the lot up. » | 1.1.1, 1.3.1 | ✅ |
| 3 | **La structure des titres.** Un seul h1, onze h2 (dont les trois du pied de page), des h3 pour les six maisons et « Then, every selection. », sans niveau sauté. Les repères `header`, `nav`, `main` et `footer` sont présents. | 1.3.1 | ✅ |
| 4 | **Les contrastes du texte.** L'encre fait 15,0:1 sur le stucco ; l'ardoise des légendes et des textes secondaires, 5,7:1 ; le bordeaux du « 4% », 10,4:1. Sur la bande bordeaux, le blanc fait 11,5:1 et le rose pâle des textes 9,5:1. Dans le pied de page, le gris clair fait 10,2:1. | 1.4.3 | ✅ |
| 5 | **Les erreurs du formulaire** sont en rouge (6,6:1), en gras, et dites en mots ; elles ne reposent pas sur la couleur. | 1.4.1, 1.4.3 | ✅ |
| 6 | **Les contours.** Champs du formulaire et choix du terrain : 3,3:1 sur le stucco. Puces des sujets : 15,0:1. Bouton « Ask about a remodel » sur le bordeaux : 7,5:1. Boutons de la visionneuse : 6,1:1. | 1.4.11 | ✅ |
| 7 | **Les repères d'état.** Le trait bordeaux sous la vignette choisie et le chevron devant la maison ouverte font 10,4:1, et l'état est aussi annoncé (`aria-pressed`, `aria-expanded`). Les filets gris entre les maisons sont décoratifs. | 1.4.11 | ✅ |
| 8 | **Le zoom à 400 % et l'espacement élargi** (interligne 1,5, lettres +0,12 em, mots +0,16 em). Aucun texte coupé ni débordement, de 320 à 1 920 px. | 1.4.4, 1.4.10, 1.4.12 | ✅ |

### Utilisable

| # | Constat | Critère | État |
|---|---|---|---|
| 1 | **Au clavier**, tout est atteignable : le menu, les six maisons, leurs vignettes et leurs photos (qui ouvrent la visionneuse), le choix du terrain et de la maison, les boutons des packages, et le formulaire. | 2.1.1 | ✅ |
| 2 | **Le premier Tab** montre « Skip to content » ; Entrée envoie le focus au contenu. | 2.4.1 | ✅ |
| 3 | **Les liens du menu** amènent la section sous l'en-tête ; au clavier, son titre prend le focus. | 2.4.3 | ✅ |
| 4 | **Les six maisons** sont des boutons d'ouverture (`aria-expanded`, `aria-controls`) dans des h3. La scène d'une maison fermée est inerte : on ne peut pas y tabuler. Les vignettes disent laquelle est montrée (`aria-pressed`). | 2.4.3, 4.1.2 | ✅ |
| 5 | **La visionneuse** est une `<dialog>` modale, nommée par la maison. Elle répond aux flèches et au glissement du doigt ; le rang (« 3 of 6 ») est annoncé. Échap la ferme, le focus revient sur la photo ouverte, et la scène reprend la dernière photo vue. | 2.1.2, 2.4.3 | ✅ |
| 6 | **Le menu du téléphone.** La page derrière devient inerte (`inert`) ; Échap le ferme et rend le focus au bouton. | 2.4.3 | ✅ |
| 7 | **L'en-tête** se range quand on descend, revient quand on remonte, et reste affiché dès qu'il a le focus. | 2.4.11 (2.2) | ✅ |
| 8 | **Le mouvement.** L'accueil suit le défilement, dans les deux sens, sans jamais bouger tout seul après son arrivée (1,4 s). Les apparitions ne jouent qu'une fois. Avec « réduire les animations », tout est immédiat. | 2.2.2, 2.3.3 | ✅ |

### Compréhensible

| # | Constat | Critère | État |
|---|---|---|---|
| 1 | **Les champs** ont une étiquette visible ; les champs facultatifs le disent (« (optional) »). | 3.3.2 | ✅ |
| 2 | **Les erreurs** disent quoi corriger (« Enter your email address. », « Check your email address. It should look like name@example.com. »), sont reliées à leur champ (`aria-describedby`, `aria-invalid`), et le focus va au premier champ en erreur. | 3.3.1, 3.3.3 | ✅ |
| 3 | **Ce que fait le bouton d'envoi** est écrit à côté : il ouvre la messagerie, avec la demande adressée à contact@niancustomhomes.com (ou à sales@niancorp.com pour un agent). Après l'envoi, une note le redit, donne l'e-mail et le téléphone, et reçoit le focus. | 3.2.2, 3.3.2 | ✅ |
| 4 | **Les boutons qui remplissent la demande** (« Ask about this starting point », les packages, la rénovation, « Ask about a home like this one ») font briller un instant ce qu'ils ont rempli. | 3.2.2 | ✅ |

### Robuste

| # | Constat | Critère | État |
|---|---|---|---|
| 1 | **Les noms et les états** : aucun contrôle sans nom, aucun identifiant en double, aucune référence cassée (`aria-labelledby`, `aria-describedby`, `aria-controls`, `for`). | 4.1.2 | ✅ |
| 2 | **Le choix du terrain et de la maison** : de vrais boutons radio, groupés par `fieldset` et `legend` ; les flèches passent d'un choix à l'autre. Le résumé (« Your starting point: … ») est annoncé quand il change. | 4.1.2, 4.1.3 | ✅ |
| 3 | **Sans JavaScript**, la page reste lisible : l'accueil montre ses deux moitiés, les six maisons sont dépliées, le formulaire est visible (il faut alors écrire l'e-mail soi-même). | 4.1.2 | ✅ |

## Contrastes principaux

| Élément | Texte | Fond | Rapport | Seuil | |
|---|---|---|---|---|---|
| Texte, titres | Encre #1E1F21 | Stucco #F3F4F2 | 15,0:1 | 4,5:1 | ✅ |
| Légendes, textes secondaires | Ardoise #5D6065 | Stucco | 5,7:1 | 4,5:1 | ✅ |
| « 4% » des agents | Bordeaux #6B1D22 | Stucco | 10,4:1 | 3:1 (grand) | ✅ |
| Boutons | Blanc | Bordeaux | 11,5:1 | 4,5:1 | ✅ |
| Textes de la bande | #F4E6E7 | Bordeaux | 9,5:1 | 4,5:1 | ✅ |
| Légende de la bande | #EBD3D5 | Bordeaux | 8,1:1 | 4,5:1 | ✅ |
| Erreurs | #A4242B | Stucco | 6,6:1 | 4,5:1 | ✅ |
| Pied de page | #C4C6C3 | #18191A | 10,2:1 | 4,5:1 | ✅ |
| Ligne du © | #ABADAA | #18191A | 7,8:1 | 4,5:1 | ✅ |
| Visionneuse, légende | #D6D8D5 | #18191A | 12,3:1 | 4,5:1 | ✅ |

## Ce qui reste à tester à la main

- Avec VoiceOver (iPhone et Mac) et NVDA : l'ordre de lecture de l'accueil (le titre avant les photos), l'annonce du
  résumé du choix, et la visionneuse.
- Le formulaire relié à un vrai service d'envoi, le jour de la mise en ligne : les messages de succès et d'échec
  devront garder la même forme (texte, focus).
