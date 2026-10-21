# Accessibilité : nouveau site Stellar Living Homes

**Référence :** WCAG 2.1 niveau AA (et 2.2 pour la taille des cibles)
**Date :** 21 octobre 2026
**Outils :**
- `tools/a11y.mjs` (Chromium, sur `dist-web` servi en local) ;
- `tools/interact.mjs` (40 essais) ;
- Lighthouse 13.5.

## En bref

**Points trouvés : 9. Bloquants : 1. Corrigés : 9.**

- Le site se parcourt entièrement au clavier.
- Le focus se voit partout : un contour de 2 px, bleu sur clair, olive sur le bleu nuit. Il n'est jamais caché sous
  l'en-tête.
- Tous les textes passent les seuils de contraste, mesurés sur les vrais pixels de la page, à 1440 px et sur téléphone.
- Au doigt, plus aucune cible ne fait moins de 44 px.
- Lighthouse : accessibilité 100 sur ordinateur et sur téléphone.

## Ce qui a été corrigé pendant l'audit

| # | Problème | Critère | Correction |
|---|---|---|---|
| 1 | Sur téléphone et tablette, les avis pâlis par un sujet tombaient à 23 px : le gris-bleu pâle (3,27:1) n'est permis qu'à partir de 24 px | 1.4.3 (bloquant) | Les avis ne descendent plus sous 24 px ; l'outil d'audit remesure maintenant les textes pâles à 390 px |
| 2 | Le gris-bleu pâle sur la brume des avis : 2,76:1 | 1.4.3 | Une teinte propre à ce fond, `#76879A` (3,27:1, grand texte) ; les signatures des avis écartés passent en `#55687A` (5,11:1) |
| 3 | Le contour des sujets des avis, des champs du formulaire et du bouton « Close » de la visionneuse était trop clair | 1.4.11 | Respectivement 3,03:1, 4,02:1 et 4,70:1 |
| 4 | Liens soulignés seuls (29 px de haut), logo de l'en-tête (34 px), lien d'appel du menu (43 px) | 2.5.8, confort 44 px | Au doigt (`pointer: coarse`), chaque lien seul fait 44 px de haut ; des marges négatives gardent la mise en page, et le trait reste collé au texte |
| 5 | Téléphone et e-mail du pied de page (19 px) | 2.5.8 (passait par l'espacement), confort | 44 px au doigt, lignes de 44 px |
| 6 | Le pied de page perdait ses espaces au téléphone (« ©2026Stellar ») après la correction précédente | 1.3.1 | Rembourrage au lieu d'une boîte flexible |
| 7 | Les mesures de contraste relançaient les fondus (texte masqué puis rendu) | outil | Les transitions sont coupées pendant les mesures |
| 8 | Les légendes de la visite, hors de l'écran dans la rangée figée, étaient comptées comme illisibles | outil | Contrôle des bords horizontaux : seules les légendes visibles sont mesurées |
| 9 | Les sujets des avis préparés après la recherche de l'élément : mesure faite sur l'état précédent | outil | L'état (un sujet choisi, une erreur affichée) est préparé avant la mesure |

## Résultats par principe

### Perceptible
| Point | Critère | Résultat |
|---|---|---|
| Toutes les photos ont un texte de remplacement descriptif (134 dans la visionneuse, plus les cartes et la visite) | 1.1.1 | ✅ |
| Le logo de l'en-tête est un lien nommé « Stellar Living Homes, back to the top » ; celui du pied de page porte le nom en texte caché | 1.1.1 | ✅ |
| Titres en ordre : un h1, des h2 par section, des h3 et h4 dedans, sans niveau sauté. Repères `header`, `nav`, `main`, `footer` | 1.3.1 | ✅ |
| Langue de la page : `en` | 3.1.1 | ✅ |
| Contrastes du texte : 70 éléments mesurés, tous au-dessus du seuil. Le plus faible des petits textes : les légendes de la visite qui ne sont pas en cours, 4,70:1 | 1.4.3 | ✅ |
| Le pâle n'est utilisé qu'en grand : l'avis de l'accueil (33 à 64 px, 3,11:1) et les avis écartés par un sujet (24 à 29 px, 3,27:1) | 1.4.3 | ✅ |
| Contours et repères : champs 4,02:1, sujets des avis 3,03:1, bouton « Close » 4,70:1, repère olive de la pièce en cours 5,05:1 | 1.4.11 | ✅ |
| Le soulignement olive des passages (2,66:1) et les filets des listes (1,36:1) sont doublés par la couleur du texte ou décoratifs : non exigé, signalé par honnêteté | 1.4.11 | ℹ️ |
| Les passages qui parlent d'un sujet sont signalés par la couleur et par un soulignement, pas par la couleur seule | 1.4.1 | ✅ |
| Espacement du texte élargi (interligne 1,5, lettres +0,12 em, mots +0,16 em) : rien n'est coupé, à 1440 et à 390 px | 1.4.12 | ✅ |
| De 320 à 1920 px : aucun défilement horizontal de la page. La visite et les chantiers défilent au doigt dans leur propre rangée | 1.4.10 | ✅ |

### Utilisable
| Point | Critère | Résultat |
|---|---|---|
| Tout se fait au clavier : 66 arrêts sur ordinateur, 62 sur téléphone, dans l'ordre de lecture | 2.1.1, 2.4.3 | ✅ |
| Lien d'évitement « Skip to content » en premier arrêt | 2.4.1 | ✅ |
| Focus visible partout (2 px plein, 8,05:1 sur blanc, 5,05:1 olive sur bleu nuit) et jamais caché sous l'en-tête | 2.4.7, 2.4.11 | ✅ |
| Liens du menu : le focus suit le lien jusqu'au titre de la section | 2.4.3 | ✅ |
| Visionneuse (`dialog`) : focus sur « Close » à l'ouverture ; flèches, Début et Fin ; Échap referme et rend le focus à la photo d'origine ; la page est bloquée derrière | 2.1.2, 2.4.3 | ✅ |
| Menu du téléphone : `aria-expanded`, focus sur le premier lien, Échap le referme | 4.1.2 | ✅ |
| Cibles au doigt : aucune sous 44 px | 2.5.8 | ✅ |
| Mouvement : l'ouverture se joue une fois et dure moins de 3 s. La visite figée n'avance que si l'on fait défiler. En mouvement réduit : pas de Lenis, pas d'animation, l'avis déjà à l'encre, la visite en rangée qu'on fait défiler | 2.2.2, 2.3.3 | ✅ |
| Glisser dans la visionneuse : les boutons « Previous » et « Next » font la même chose | 2.5.1 | ✅ |

### Compréhensible
| Point | Critère | Résultat |
|---|---|---|
| Chaque champ a son étiquette visible ; les champs facultatifs le disent (« Optional ») ; une phrase dit qu'il faut un téléphone ou un e-mail | 3.3.2 | ✅ |
| Erreurs dites en clair, reliées au champ (`aria-describedby`, `aria-invalid`), focus sur le premier champ en erreur | 3.3.1, 3.3.3 | ✅ |
| Le bouton dit ce qui se passe (« Email my request ») et la note dit que rien n'est envoyé sans le geste du visiteur ; après le clic, une note reçoit le focus | 3.2.2 | ✅ |
| Le choix d'un sujet annonce le résultat (« Five of the twelve reviews talk about time and budget. ») sans déplacer le focus | 4.1.3 | ✅ |

### Robuste
| Point | Critère | Résultat |
|---|---|---|
| Aucun contrôle sans nom, aucun identifiant en double, aucune référence `aria-*` cassée | 4.1.2 | ✅ |
| Boutons des sujets : `aria-pressed` | 4.1.2 | ✅ |
| Liens qui ouvrent un nouvel onglet : annoncés (« opens in a new tab ») | 3.2.5 | ✅ |
| Sans JavaScript : l'avis, la photo, les boutons, les chantiers et tout le texte sont visibles | — | ✅ |

## Contrastes principaux

| Élément | Texte | Fond | Rapport | Seuil |
|---|---|---|---|---|
| Texte courant, titres, boutons | #2A5472 | #FFFFFF | 8,05:1 | 4,5:1 ✅ |
| Le même sur la brume | #2A5472 | #EEF2F4 | 7,14:1 | 4,5:1 ✅ |
| Textes secondaires, légendes | #55687A | #FFFFFF | 5,76:1 | 4,5:1 ✅ |
| Textes secondaires sur la brume | #55687A | #EEF2F4 | 5,11:1 | 4,5:1 ✅ |
| L'avis pâle de l'accueil (grand) | #8494A4 | #FFFFFF | 3,11:1 | 3:1 ✅ |
| Les avis écartés (grand) | #76879A | #EEF2F4 | 3,27:1 | 3:1 ✅ |
| Texte sur le bleu nuit | #FFFFFF | #11283B | 15,1:1 | 4,5:1 ✅ |
| Secondaire sur le bleu nuit | #B9C7D4 | #11283B | 8,76:1 | 4,5:1 ✅ |
| Légendes de la visite figée | #7D92A6 | #11283B | 4,70:1 | 4,5:1 ✅ |
| Erreurs du formulaire | #FFB4A6 | #11283B | 8,87:1 | 4,5:1 ✅ |

## Clavier

| Élément | Tabulation | Entrée / Espace | Échap | Flèches |
|---|---|---|---|---|
| Lien d'évitement | 1er | va au contenu | — | — |
| Menu (téléphone) | dans l'en-tête | ouvre, focus sur « Work » | referme | — |
| Photos de la visite | une par une | ouvre la visionneuse à cette photo | — | — |
| Cartes et lieux | un par un | ouvre le reportage | — | — |
| Sujets des avis | un par un | filtre, annonce le nombre | — | — |
| Visionneuse | piégé dedans (dialog) | boutons | referme, focus rendu | photo précédente / suivante ; Début et Fin |

## Lecteurs d'écran (lecture attendue)

| Élément | Annoncé | Remarque |
|---|---|---|
| Accueil | la citation, puis « Scott D. », puis le titre de niveau 1 : « Stellar Living Homes is a general contractor in Naples, Florida… » | les quatre passages sont des `mark` |
| Visite | titre de niveau 2, puis chaque photo comme un bouton nommé par son texte de remplacement | l'heure et la pièce sont écrites en légende |
| Sujets des avis | bouton, « pressed » ou « not pressed », puis le nombre d'avis annoncé | `aria-live="polite"` |
| Visionneuse | dialogue nommé par le reportage, « 15 of 24 » | |

## Ce qui reste à faire avant la mise en ligne

1. **Essai avec un vrai lecteur d'écran** (VoiceOver sur iPhone, NVDA sur Windows) : l'audit automatique et le clavier ne
   remplacent pas une écoute.
2. **Agrandissement à 200 %** dans Safari et Firefox : vérifié dans Chromium seulement.
