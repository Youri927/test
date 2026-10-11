# Revue de design : nouveau site D's Pool Care (We Clean Pools)

Revue faite avec la grille de l'extension `design-critique` et relecture des textes avec `ux-copy`.
- **Supports :** captures à l'ordinateur (1440 × 900, 1280 × 720, 1920 × 1080), à la tablette (768 × 1024, 1024 × 768) et au téléphone (320 × 640 à 430 × 932).
- **Corrections :** toutes celles retenues sont faites, et listées en fin de fichier.

## Impression d'ensemble

En deux secondes, on voit une piscine vue d'en haut, à l'eau verte et trouble, et une seule question en blanc : « Can you see the bottom of your pool? ».

- **Au défilement**, l'eau devient laiteuse, puis limpide. Au fond apparaissent, en grandes lettres de carrelage, les mots de leur nom de domaine : **WE CLEAN POOLS.**
- **On comprend sans lire** ce que fait l'entreprise, et ce qu'elle promet.
- **Le bas de l'écran** donne tout de suite les deux façons d'agir (« Get a free estimate », le téléphone) et trois faits vérifiables : le prix, l'année, la licence.

**La plus grande marge de progrès :** les photos de service sont anciennes et petites (800 × 600, appareil d'il y a dix ans).
- Elles sont montrées à des tailles où elles restent nettes, comme preuves.
- Elles ne peuvent pas porter de grands visuels.
- Des photos récentes changeraient la seconde moitié de la page (voir « À confirmer » dans le README).

## Utilisation

| Constat | Gravité | Correction |
| --- | --- | --- |
| Sans JavaScript, la liste des prix restait fermée sans moyen de l'ouvrir, et les coches de l'entretien restaient vides. | 🟡 Moyen | Fait : sans JavaScript, tout est ouvert et coché. Le script ajoute la fermeture et l'animation. |
| Les liens du menu et de l'en-tête arrivaient 76 px trop bas : le décalage de l'en-tête était compté deux fois (Lenis tient déjà compte du `scroll-padding-top`). | 🟡 Moyen | Fait : la section arrive juste sous l'en-tête. |
| Au doigt, un simple défilement sur la photo des rénovations montrait l'avant une fraction de seconde. | 🟢 Mineur | Fait : au doigt, l'avant n'apparaît qu'après 140 ms d'appui. Un défilement l'annule. |
| À côté de la visionneuse, sous les vignettes, il restait un grand vide. | 🟢 Mineur | Fait : les trois étapes d'une rénovation (estimation, choix, travaux) et le lien vers leur site de rénovation sont montés à côté des photos. |
| Sur les téléphones courts (moins de 720 px de haut), le bas de l'écran prenait la moitié de la place et l'eau devenait une bande. | 🟢 Mineur | Fait : les trois faits sont masqués à cette hauteur (ils reviennent plus bas dans la page). L'eau garde de la place. |
| À 320 px, la question se coupait en « Can you see the / bottom / of your pool? ». | 🟢 Mineur | Fait : dans une eau étroite, la question coule sur des lignes équilibrées. |

## Hiérarchie visuelle

- **Ce qui attire l'œil en premier :** la question blanche sur l'eau verte, puis les lettres du fond. C'est le bon ordre : la question pose le problème, les lettres y répondent.
- **Le parcours de lecture :**
  - l'ouverture, puis « What is your time worth? » et le prix de 185 $ ;
  - puis la liste des travaux ponctuels, présentée comme une carte de prix ;
  - chaque partie commence par un grand titre, qui est une de leurs phrases.
- **L'accent :**
  - les prix sont en chiffres tabulaires, alignés à droite ;
  - les citations des clients sont en Light, grandes : ce sont eux qui parlent.
- **L'alignement :**
  - Tout est aligné à gauche.
  - La question dans l'eau, l'accroche du bas et le logo de l'en-tête sont sur la même verticale, à toutes les tailles d'écran (corrigé : la question était décalée de 16 px).
  - La seule composition centrée est celle des lettres au fond du bassin.

## Cohérence

| Élément | Constat | Correction |
| --- | --- | --- |
| Boutons | Une seule forme (pilule encre, texte blanc, bleu foncé au survol), partout. « Free estimate » garde le même nom de l'en-tête au bouton du téléphone. | Aucune |
| Arrondis | Le bassin 20 à 30 px, les photos 6 px, le formulaire 12 px, les boutons en pilule : quatre niveaux qui disent ce qu'ils sont. | Aucune |
| Typographie | Overpass seule : Black et en capitales pour les lettres du fond, ExtraBold pour les titres, Regular pour le texte, Light pour les citations et la question. Les capitales ne servent nulle part ailleurs. | Aucune |
| Couleurs | Le vert d'algue n'apparaît que dans l'eau trouble ; le bleu de l'eau sert aux coches, aux liens et aux prix ; le rouge ne sert qu'au « D's » du logo. | Aucune |
| Mouvement | Un seul spectacle (l'eau qui s'éclaircit). Ailleurs, le mouvement répond à une action (prix, visionneuse) ou suit la lecture (coches, tournée, léger glissement des grandes photos). Rien n'apparaît en fondu par section. | Aucune |

## Fluidité (mesurée)

L'ouverture a été mesurée en défilant à travers la scène avec le processeur ralenti 4 fois, au téléphone.

**Avant correction :**
- des images de plus de 34 ms ;
- 111 repeints en 3 secondes.

**La cause :** les animations de la lumière utilisaient des variables CSS dans leurs images-clés. Le navigateur les faisait tourner sur le fil principal, avec un recalcul des styles à chaque image.

**Corrections :**
- des images-clés à valeurs fixes, donc confiées à la carte graphique ;
- la couleur de l'eau, qui changeait à chaque image, remplacée par un fondu entre deux couches ;
- le flou des lettres, un filtre recalculé à chaque image, remplacé par une ombre de texte peinte une fois ;
- les positions mesurées une fois, et non plus à chaque image.

**Résultat :**
- 0 image de plus de 34 ms ;
- 16 repeints au lieu de 111 ;
- médiane de 16,7 ms, soit 60 images par seconde.

## Accessibilité

Voir `ACCESSIBILITE.md`. En bref :
- **Lighthouse :** 100.
- **Contrastes :** de 4,8 à 16:1 sur le texte courant ; au moins 4,3:1 pour la question en grand sur l'eau verte (exigé : 3:1).
- **Clavier :** tout est utilisable au clavier, avec un contour visible.
- **Moins d'animations :** avec ce réglage, l'eau est limpide d'emblée et rien ne bouge seul.

## Les textes (`ux-copy`)

- **Les actions disent ce qui se passe :**
  - « Get a free estimate » ;
  - « Call about a repair » ;
  - « Ask about Pool School » ;
  - « Email my request », qui ouvre bien la messagerie ;
  - « Hold to see the before ».
- **Les erreurs disent quoi corriger,** champ par champ :
  - « Enter a phone number we can call, with the area code. » ;
  - un résumé : « 4 fields need a fix before your email can be written. ».
- **Avant l'envoi,** la note dit ce qui va se passer : « Your email app opens with the message ready, addressed to D’s Pool Care. »
- **Après l'envoi,** si rien ne s'ouvre, elle donne le téléphone et l'adresse.
- **Le statut d'ouverture** est calculé à l'heure du Texas : « Open now, until 5 PM Central Time. » ou « Closed now, opens Monday at 9 AM Central Time. ».
- **Corrigé :** « with 27 years of practice behind every answer » aurait été faux dès 2027. Remplacé par « We’ve been doing it ourselves since 1999. ».

## Ce qui marche

- **Leur propre question devient la scène d'ouverture.** C'est un geste qu'on ne verra chez aucun autre pisciniste : l'eau qui s'éclaircit, et leur nom au fond.
- **La lumière au fond du bassin n'est pas une vidéo ni du WebGL.** C'est une vraie simulation de caustiques (des rayons réfractés par une houle), calculée une fois en images raccordables, puis animée par la carte graphique.
- **Les prix sont en vue,** comme une carte de restaurant, chacun avec sa vraie paire avant/après.
- **La licence se vérifie** en un clic sur le site de l'État. Le policier est présenté par ses mots, sans badge ni gyrophare.
- **Le devis se fait sur une eau limpide :** la fin de la page répond au début.

## Corrections faites

- [x] Eau trouble trop plate : profondeur (plus claire au centre, plus sombre contre les parois), nuages d'algues plus contrastés, reflet du ciel à la surface.
- [x] Lettres au fond : les lignes de lumière blanches ressemblaient à des fissures sur le carrelage sombre. La grande couche de lumière est passée en mode « overlay » : elle éclaire l'enduit et ne fait que bleuir les carreaux.
- [x] Au début, les lettres se lisaient trop sous l'eau verte et volaient la vedette à la question : flou plus large.
- [x] Fluidité de l'ouverture (voir plus haut).
- [x] Liens internes décalés de 76 px.
- [x] Version sans JavaScript complète.
- [x] Rénovations : le paragraphe d'introduction remonté à côté de la grande photo, les étapes à côté de la visionneuse.
- [x] Alignements de l'ouverture sur la grille, à toutes les largeurs.
- [x] Téléphones courts et très étroits.
- [x] Indication « Scroll to clear the water » en blanc plein (contraste).
- [x] Anneau de focus des champs plus visible ; lien « Look it up » agrandi à 24 px de haut.
