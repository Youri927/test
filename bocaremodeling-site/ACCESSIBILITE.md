# Accessibilité : nouveau site Boca Remodeling Group

**Référence :** WCAG 2.1 niveau AA (et 2.2 pour la taille des cibles et le focus jamais masqué)
**Date :** 22 octobre 2026
**Outils :**
- `tools/a11y.mjs` (Chromium, sur `dist-web` servi en local) ;
- `tools/interact.mjs` (52 essais) ;
- Lighthouse 13.5.

## En bref

**Points trouvés : 9. Bloquants : 2. Corrigés : 9.**

- Le site se parcourt entièrement au clavier : 61 arrêts sur ordinateur, 56 sur téléphone, dans l'ordre de lecture.
- Le focus se voit partout : un contour plein de 2 px, bleu crayon sur clair, azur sur l'encre. Il ne passe jamais sous
  l'en-tête fixe.
- Les 72 textes mesurés passent les seuils de contraste, sur les vrais pixels de la page, à 1440 px et à 390 px.
- Au doigt, aucune cible seule ne fait moins de 44 px.
- Lighthouse : accessibilité 100 sur ordinateur et sur téléphone.

## Ce qui a été corrigé pendant l'audit

| # | Problème | Critère | Correction |
|---|---|---|---|
| 1 | Les mots non choisis de la liste des camions pâlissaient à 34 % d'opacité : 2,1:1 sur le blanc | 1.4.3 (bloquant) | Un gris propre, `#858E98` : 3,32:1, permis pour ce texte de très grande taille (58 px et plus) |
| 2 | Avec l'espacement du texte élargi, le titre d'une ligne (« We draw it. Then we build it. ») sortait de l'écran : 336 px de défilement horizontal à 1440 px | 1.4.12 (bloquant) | Chaque phrase du titre est un bloc : la seconde passe à la ligne entière quand la place manque, et se replie elle-même si besoin |
| 3 | Même cas sur téléphone : le nom de l'entreprise et le bouton « Menu » débordaient de 5 px | 1.4.12 | Le nom peut passer sur deux lignes dans l'en-tête quand l'utilisateur élargit l'espacement |
| 4 | Le contour des champs et des sujets du formulaire : 2,90:1 sur le blanc, 2,67:1 sur le plâtre | 1.4.11 | `#808A95` : 3,51:1 et 3,24:1 |
| 5 | Au clavier, un lien de téléphone pouvait s'arrêter sous l'en-tête fixe | 2.4.11 | Une marge de défilement de la hauteur de l'en-tête (`scroll-padding-top`) |
| 6 | À 320 px, le bouton « Menu » était coupé par le bord de l'écran | 1.4.10 | Sous 360 px, le logo et le nom rapetissent un peu ; le bouton tient |
| 7 | Les titres qui apparaissent au défilement auraient été invisibles (`visibility: hidden`) avant d'arriver : un lien du menu aurait pu y envoyer le focus sans rien montrer, et les boutons de la liste n'auraient pas pu recevoir le focus | 2.4.7, 2.1.1 | L'état d'attente est une simple opacité : tout reste focalisable, et l'apparition se déclenche dès que l'élément entre à l'écran (clavier compris) |
| 8 | Pendant leur apparition, les titres de deux lignes gagnaient quelques pixels (marges négatives fusionnées), et la page bougeait sous les yeux | 2.3.3 (confort) | Le cache est une découpe (`clip-path`), sans marge : rien ne bouge ; un essai le vérifie |
| 9 | Mesure du contraste des étapes faussée par le cercle du numéro | outil | Le libellé de chaque étape est dans son propre `span`, mesuré seul |

## Résultats par principe

### Perceptible
| Point | Critère | Résultat |
|---|---|---|
| Toutes les photos ont un texte de remplacement descriptif : 24 sur la page, 30 dans la visionneuse | 1.1.1 | ✅ |
| La scène de l'accueil est une `figure` nommée (« The same primary bathroom three times: sketched by hand, drawn in 3D, then built. ») ; chacune de ses trois images a son texte | 1.1.1 | ✅ |
| Le logo de l'en-tête est un lien nommé « Boca Remodeling Group, back to the top » ; le dessin des toits est caché aux lecteurs d'écran | 1.1.1 | ✅ |
| Titres en ordre : un h1, un h2 par section, des h3 dans les histoires et le travail, sans niveau sauté. Repères `header`, `nav`, `main`, `footer` | 1.3.1 | ✅ |
| Les étapes des histoires sont des listes numérotées (`ol`) : le numéro affiché est aussi dans le code | 1.3.1 | ✅ |
| Langue de la page : `en` | 3.1.1 | ✅ |
| Contrastes du texte : 72 éléments mesurés, tous au-dessus du seuil. Le plus faible des petits textes : les liens bleu crayon sur le plâtre, 5,24:1 | 1.4.3 | ✅ |
| Le seul texte pâle est en très grand : les mots non choisis de la liste (3,32:1, 58 px et plus) | 1.4.3 | ✅ |
| Contours : champs 3,51:1 (blanc) et 3,24:1 (plâtre), cercles des étapes 5,83:1, boutons de la visionneuse 5,21:1, bouton « Menu » à l'encre | 1.4.11 | ✅ |
| Le trait azur (bord du rectangle qui s'ouvre, fil de progression des étapes) fait 2,63:1 : il est décoratif, et l'étape en cours est aussi dite par le cercle plein et `aria-current` | 1.4.11 | ℹ️ |
| « Open now » ou « Closed now » : la pastille de couleur est doublée par le texte | 1.4.1 | ✅ |
| Espacement du texte élargi (interligne 1,5, lettres +0,12 em, mots +0,16 em) : rien n'est coupé ni hors de l'écran, à 1440 et à 390 px | 1.4.12 | ✅ |
| De 320 à 1920 px : aucun défilement horizontal | 1.4.10 | ✅ |

### Utilisable
| Point | Critère | Résultat |
|---|---|---|
| Tout se fait au clavier, dans l'ordre de lecture | 2.1.1, 2.4.3 | ✅ |
| Lien d'évitement « Skip to content » en premier arrêt ; il met le focus sur le titre de l'accueil | 2.4.1 | ✅ |
| Focus visible partout (2 px plein : 5,24:1 sur le plâtre, 5,68:1 sur le blanc, 5,56:1 azur sur l'encre) et jamais caché sous l'en-tête | 2.4.7, 2.4.11 | ✅ |
| Liens du menu : la page défile jusqu'à la section, et le focus va sur son titre | 2.4.3 | ✅ |
| La scène de l'accueil : ses trois étapes sont des boutons (« Sketched by hand », « Drawn in 3D », « Built »), qui mènent à l'état choisi sans avoir à faire défiler | 2.1.1 | ✅ |
| Visionneuse (`dialog`) : focus sur « Close » à l'ouverture ; flèches, Début et Fin ; Échap referme et rend le focus à la photo d'origine ; la page est bloquée derrière | 2.1.2, 2.4.3 | ✅ |
| Menu du téléphone : `aria-expanded`, focus sur le premier lien, la page derrière est `inert`, Échap le referme et rend le focus au bouton | 4.1.2, 2.4.3 | ✅ |
| Cibles au doigt : aucune cible seule sous 44 px ; seul le numéro de téléphone dans une phrase du devis (« Rather talk? Call 561-247-2727… ») est plus bas, ce que le critère permet | 2.5.8 | ✅ |
| Mouvement : l'ouverture se joue une fois (1,3 s), chaque apparition une fois (1 s). La scène n'avance que si l'on fait défiler. En mouvement réduit : pas de Lenis, pas d'ouverture ni d'apparition, la scène n'est plus épinglée et change d'état au clic, sans animation | 2.2.2, 2.3.3 | ✅ |
| Glisser dans la visionneuse : les boutons « Previous » et « Next » font la même chose | 2.5.1 | ✅ |

### Compréhensible
| Point | Critère | Résultat |
|---|---|---|
| Chaque champ a son étiquette visible ; les champs facultatifs le disent (« optional ») ; une phrase dit qu'un téléphone ou un e-mail suffit | 3.3.2 | ✅ |
| Erreurs dites en clair, reliées au champ (`aria-describedby`, `aria-invalid`), focus sur le premier champ en erreur | 3.3.1, 3.3.3 | ✅ |
| Le bouton dit ce qui se passe (« Email my request ») et la note dit que rien n'est envoyé sans le geste du visiteur ; après le clic, une note reçoit le focus | 3.2.2 | ✅ |
| La liste des camions : choisir un mot change la photo et sa légende (`aria-live="polite"`) sans déplacer le focus | 4.1.3 | ✅ |

### Robuste
| Point | Critère | Résultat |
|---|---|---|
| Aucun contrôle sans nom, aucun identifiant en double, aucune référence `aria-*` cassée | 4.1.2 | ✅ |
| Mots de la liste : `aria-pressed` ; étapes : `aria-current="step"` | 4.1.2 | ✅ |
| Liens qui ouvrent un nouvel onglet : annoncés (« opens in a new tab », « opens Google Maps in a new tab ») | 3.2.5 | ✅ |
| Sans JavaScript : les trois états de la salle de bain côte à côte, tout le texte, les liens et le formulaire (sa vérification en moins) | — | ✅ |

## Contrastes principaux

| Élément | Texte | Fond | Rapport | Seuil |
|---|---|---|---|---|
| Texte courant et titres | #10233A (encre) | #F4F6F7 (plâtre) | 14,6:1 | 4,5:1 ✅ |
| Le même sur blanc | #10233A | #FFFFFF | 15,9:1 | 4,5:1 ✅ |
| Liens et bouton (texte blanc sur le bouton) | #1269B3 (crayon) | #F4F6F7 | 5,24:1 (5,68:1 blanc sur crayon) | 4,5:1 ✅ |
| Textes secondaires, légendes | #56616C (graphite) | #F4F6F7 | 5,83:1 | 4,5:1 ✅ |
| Mots non choisis de la liste (très grand) | #858E98 | #FFFFFF | 3,32:1 | 3:1 ✅ |
| Texte sur l'encre (le bureau) | #FFFFFF | #10233A | 15,9:1 | 4,5:1 ✅ |
| Secondaire sur l'encre | #C9D4DF | #10233A | 10,6:1 | 4,5:1 ✅ |
| Étiquettes des faits sur l'encre | #AFC0D0 | #10233A | 8,52:1 | 4,5:1 ✅ |
| Liens sur l'encre | #9FCDF2 | #10233A | 9,44:1 | 4,5:1 ✅ |
| Erreurs du formulaire | #B3261E | #F4F6F7 | 6,03:1 | 4,5:1 ✅ |

## Clavier

| Élément | Tabulation | Entrée / Espace | Échap | Flèches |
|---|---|---|---|---|
| Lien d'évitement | 1er | va au titre de l'accueil | — | — |
| Menu (téléphone) | dans l'en-tête | ouvre, focus sur « Drawn first » | referme, focus rendu | — |
| Étapes de l'accueil | une par une | fait défiler jusqu'à l'état choisi | — | — |
| Photos des histoires | une par une | ouvre la visionneuse sur cette photo | — | — |
| Mots de la liste | un par un | montre (ou rend) la photo du métier | — | — |
| Vignettes du travail | une par une | ouvre le projet sur la photo de la vignette | — | — |
| Visionneuse | piégé dedans (dialog) | boutons | referme, focus rendu | photo précédente / suivante ; Début et Fin |

## Lecteurs d'écran (lecture attendue)

| Élément | Annoncé | Remarque |
|---|---|---|
| Accueil | titre de niveau 1 « We draw it. Then we build it. », le texte d'appui, puis la figure et ses trois images | pendant l'ouverture, le titre reste lu d'un bloc |
| Étapes | « 1 Sketched by hand, button, current step » | `aria-current="step"` suit le défilement |
| Photos des histoires | bouton nommé par le texte de remplacement, suivi de « (opens larger) », puis la légende numérotée | |
| Liste des camions | titre de niveau 2 fait de cinq boutons, « pressed » ou « not pressed » ; la légende de la photo est annoncée | `aria-live="polite"` |
| Bureau | « Closed now. We open today at 9 am. » ou « Open now, until 5 pm. », à l'heure de Boca Raton | mis à jour chaque minute |
| Visionneuse | dialogue nommé par le projet, « 2 of 3 » | |

## Ce qui reste à faire avant la mise en ligne

1. **Essai avec un vrai lecteur d'écran** (VoiceOver sur iPhone, NVDA sur Windows) : l'audit automatique et le clavier
   ne remplacent pas une écoute, en particulier pour la scène épinglée de l'accueil.
2. **Agrandissement à 200 %** dans Safari et Firefox : vérifié dans Chromium seulement.
