# Accessibilité : nouveau site Zynda

**Référence :** WCAG 2.1 niveau AA (et 2.2 pour la taille des cibles) · **Date :** 18 octobre 2026
**Outils :** `tools/a11y.mjs` (Chromium, sur `dist-web` servi en local), `tools/interact.mjs` (40 essais), Lighthouse 13.

## En bref

**Points trouvés : 6 · bloquants : 0 · corrigés : 6.**

Le site se parcourt entièrement au clavier, le focus se voit partout (contour de 2 px, noir sur clair, couleur piscine
sur noir) et n'est jamais caché sous l'en-tête, tous les textes passent les seuils de contraste, mesurés sur les vrais
pixels de la page, y compris sur le gris Stone de la section de l'année. Lighthouse : accessibilité 100 sur ordinateur
et sur téléphone.

## Ce qui a été corrigé pendant l'audit

| # | Problème | Critère | Correction |
|---|---|---|---|
| 1 | Les photos de l'année, de la famille et des prestations ne se chargeaient pas : le masque d'ouverture (`clip-path`) posé sur l'image la rendait « invisible » pour le chargement différé | 1.1.1 (le contenu n'apparaissait pas) | Le masque est devenu un volet de la couleur du fond posé par-dessus le cadre de l'image ; l'image n'est plus jamais masquée |
| 2 | Pendant l'animation des titres, les lignes découpées perdaient l'espace entre elles (« take ononly ») dans le texte lu | 1.3.1, 4.1.2 | Une espace est gardée entre les lignes ; après l'animation, le titre redevient un texte ordinaire |
| 3 | Le logo de l'en-tête faisait 43 px de haut sur téléphone | 2.5.8 (24 px, passé), confort 44 px | Hauteur minimale de 44 px |
| 4 | Le lien du téléphone de l'accueil (26 px) et celui du menu (28 px) | 2.5.8, confort | Hauteur minimale de 44 px |
| 5 | Les étiquettes du cadran (mois, « Today », « Oct 1 ») tombaient à 7 px sur téléphone | 1.4.4 | Tailles propres au téléphone : environ 12 px pour les mois, la saison et les repères, 28 px pour la date du centre |
| 6 | Deux paragraphes trop étroits sur téléphone (année, demande) | 1.4.10 | Pleine largeur sous 1100 px |

## Résultats par principe

### Perceptible
| Point | Critère | Résultat |
|---|---|---|
| Toutes les photos ont un texte de remplacement descriptif ; celles des prestations sont décoratives (alt vide) : le nom de la prestation est écrit à côté | 1.1.1 | ✅ |
| Le cadran est décoratif (`aria-hidden`) : tout ce qu'il montre est écrit dans la page (« we start in May and finish by October 1st », les quatre temps en titres, la ligne du jour) | 1.1.1, 1.3.1 | ✅ |
| Titres en ordre (1 h1, des h2 par section, des h3 dedans), sans niveau sauté ; repères `header`, `nav` (2), `main`, `footer` | 1.3.1 | ✅ |
| Langue de la page : `en` | 3.1.1 | ✅ |
| Contrastes du texte : 62 éléments mesurés, tous au-dessus du seuil (le plus faible : légendes Vein sur Stone, 5,35:1) | 1.4.3 | ✅ |
| Contours et repères : champs du formulaire 3,42:1, contour de la saison 3,35:1, arc qui se remplit 3,35:1, repère du cadran 18,4:1, boutons de la visionneuse 7,37:1 | 1.4.11 | ✅ |
| L'arc couleur piscine du cadran (1,53:1) et la fenêtre d'absence sont doublés par du texte : non exigé, signalé par honnêteté | 1.4.11 | ℹ️ |
| Espacement du texte élargi (interligne 1,5, lettres +0,12 em, mots +0,16 em) : rien n'est coupé, rien ne sort de l'écran, à 1440 et à 390 px | 1.4.12 | ✅ |
| De 320 à 1920 px : aucun défilement horizontal (la rangée des gros plans défile au doigt dans son propre cadre) | 1.4.10 | ✅ |

### Utilisable
| Point | Critère | Résultat |
|---|---|---|
| Tout se fait au clavier : 48 arrêts sur ordinateur, 42 sur téléphone, dans l'ordre de lecture | 2.1.1, 2.4.3 | ✅ |
| Lien d'évitement « Skip to content » en premier arrêt | 2.4.1 | ✅ |
| Focus visible partout (2 px plein, 21:1 sur blanc, 12:1 couleur piscine sur noir) et jamais caché sous l'en-tête (il revient quand le focus y entre) | 2.4.7, 2.4.11 | ✅ |
| Liens du menu : le focus suit le lien jusqu'à la section, sans saut | 2.4.3 | ✅ |
| Visionneuse (`dialog`) : focus sur « Close » à l'ouverture, flèches gauche et droite, Échap, focus rendu à la photo d'origine, page bloquée derrière | 2.1.2, 2.4.3 | ✅ |
| Menu du téléphone : `aria-expanded`, focus sur le premier lien, Échap le referme et rend le focus au bouton | 4.1.2 | ✅ |
| Cibles tactiles : aucune cible seule sous 44 px ; 18 liens dans des phrases (exemptés), aucun sous 24 px | 2.5.8 | ✅ |
| Mouvement : rien ne bouge seul plus de 5 s (l'ouverture de l'accueil dure 2,2 s, une fois) ; en mouvement réduit, pas de Lenis, pas d'animation, cadran entier | 2.2.2, 2.3.3 | ✅ |
| Glisser dans la visionneuse : les boutons « Previous » et « Next » font la même chose | 2.5.1 | ✅ |

### Compréhensible
| Point | Critère | Résultat |
|---|---|---|
| Chaque champ a son étiquette visible ; les champs facultatifs le disent (« optional ») | 3.3.2 | ✅ |
| Erreurs dites en clair, reliées au champ (`aria-describedby`, `aria-invalid`), focus sur le premier champ en erreur : « Enter your name. », « Check the email address: it should look like name@example.com. » | 3.3.1, 3.3.3 | ✅ |
| Le bouton dit ce qui se passe (« Email my request ») et une phrase explique qu'il ouvre la messagerie ; après l'envoi, une note reçoit le focus | 3.2.2 | ✅ |
| La fenêtre d'absence se lit aussi en texte (« Away from May to October. That covers the whole condo season. »), annoncée poliment (`aria-live`) | 4.1.3 | ✅ |

### Robuste
| Point | Critère | Résultat |
|---|---|---|
| Aucun contrôle sans nom, aucun identifiant en double, aucune référence `aria-*` cassée | 4.1.2 | ✅ |
| Liens qui ouvrent un nouvel onglet : annoncés (« opens in a new tab ») | 3.2.5 | ✅ |
| Sans JavaScript : la phrase d'accueil, la photo et tout le texte sont visibles | — | ✅ |

## Contrastes principaux

| Élément | Texte | Fond | Rapport | Seuil |
|---|---|---|---|---|
| Texte courant, titres | #000000 | #FFFFFF | 21:1 | 4,5:1 ✅ |
| Texte sur la section de l'année | #000000 | #EEF0F0 | 18,4:1 | 4,5:1 ✅ |
| Légendes, textes secondaires | #5C6366 | #FFFFFF | 6,1:1 | 4,5:1 ✅ |
| Légendes sur Stone | #5C6366 | #EEF0F0 | 5,35:1 | 4,5:1 ✅ |
| Texte du bandeau des détails et du pied de page | #FFFFFF | #000000 | 21:1 | 4,5:1 ✅ |
| Secondaire sur noir | #B9BFBF | #000000 | 11,3:1 | 4,5:1 ✅ |
| Erreurs du formulaire | #B3261E | #FFFFFF | 6,5:1 | 4,5:1 ✅ |
| Bouton noir, texte blanc | #FFFFFF | #000000 | 21:1 | 4,5:1 ✅ |

## Clavier

| Élément | Tabulation | Entrée / Espace | Échap | Flèches |
|---|---|---|---|---|
| Lien d'évitement | 1er | va au contenu | — | — |
| Menu (téléphone) | dans l'en-tête | ouvre, focus sur « Work » | referme, focus sur « Menu » | — |
| Photos des pièces | une par une | ouvre la visionneuse | — | — |
| Gros plans | un par un | ouvre la pièce dans la visionneuse | — | — |
| Visionneuse | piégé dedans (dialog) | boutons | referme, focus rendu | photo précédente / suivante |
| Mois de départ et de retour | listes natives | ouvre la liste | — | choisit le mois |

## Lecteurs d'écran (lecture attendue)

| Élément | Annoncé | Remarque |
|---|---|---|
| Accueil | titre de niveau 1 : « Custom homes and renovations in Naples and Marco Island The people who show up. Every single day. » | la phrase entière, la photo à part avec son texte |
| Cadran | ignoré | son contenu est écrit dans la section |
| Ligne du jour | « Today is October 18. The next condo season starts in May… » | calculée à l'ouverture, en texte |
| Photo des pièces | bouton : texte de remplacement de la photo, « popup dialog » | |
| Avis | citation, puis l'auteur | guillemets ajoutés par la feuille de style |

## Ce qui reste à faire avant la mise en ligne

1. **Essai avec un vrai lecteur d'écran** (VoiceOver sur iPhone, NVDA sur Windows) : l'audit automatique et le clavier ne
   remplacent pas une écoute.
2. **Agrandissement à 200 %** dans Safari et Firefox : vérifié dans Chromium seulement.
