# Boca Remodeling Group : direction artistique

## Le sujet, le public, le but

- **Le sujet** : une entreprise de rénovation de Boca Raton qui dessine les pièces avant de les construire. Elle
  esquisse à la main, modélise en 3D, puis ses équipes construisent. Ses camions annoncent cinq métiers : kitchens,
  bathrooms, windows, roofs, pools.
- **Le public** : des propriétaires de Boca Raton, maisons de golf et résidences fermées, souvent à la retraite, et des
  familles. Ce qu'ils craignent : un entrepreneur qui ne livre pas ce qui était prévu, ou qui disparaît.
- **Le but** : une demande de devis gratuit, un appel, ou une visite au bureau de West Palmetto Park Road.

## L'idée : « We draw it. Then we build it. »

Leur meilleure preuve est cachée dans leurs galeries : **la même salle de bain dessinée aux crayons de couleur, puis en
3D quinze jours plus tard, puis construite**, vue du même endroit. Le site s'ouvre là-dessus et ne montre rien d'autre
au premier écran : la pièce passe du dessin à la 3D, puis à la photo, à mesure qu'on fait défiler la page.

Le passage d'un état à l'autre reprend la construction d'une perspective à un point de fuite, celle de l'esquisse :
- on dessine d'abord le mur du fond, puis on tire les lignes vers soi ;
- ici, l'état suivant apparaît dans un rectangle qui part de la porte, au fond de la pièce, et s'agrandit jusqu'aux
  bords du cadre ;
- le bord du rectangle est un trait bleu, le bleu du crayon qui trace la paroi de douche sur l'esquisse (et le bleu
  du logo).

La caméra accompagne ce passage :
- **de l'esquisse à la 3D**, elle avance dans le dessin jusqu'à ce que la porte dessinée ait la taille de la porte en
  3D, et la 3D s'ouvre autour ;
- **de la 3D à la photo**, la photo apparaît d'abord cadrée sur la porte, à l'échelle de la 3D, puis la caméra recule
  et montre toute la pièce construite.

Les trois images sont calées entre elles par la porte du fond : son axe, le bas de la porte (la ligne du sol) et sa
hauteur. L'esquisse est faite à main levée, la 3D et la photo ne sont pas prises du même point exact : le calage est
juste au fond de la pièce et approximatif sur les bords. C'est là que le rectangle passe en dernier.

Le reste du site applique la même règle de lecture : **petit, c'est dessiné ; grand, c'est construit**. Les documents
de conception (esquisse, plans, 3D) sont présentés comme des tirages, petits, avec une marge blanche. Les photos de ce
qui a été construit sont grandes, sans cadre.

## Ce qui est gardé, ce qui part

- **Gardé** :
  - leurs trois histoires « dessiné puis construit » ;
  - leurs photos de chantiers en Floride (2024 à 2026), y compris en cours de pose, avec leurs équipes et leurs
    camions ;
  - la liste de leurs camions ;
  - leurs textes (« Over 30 years experience in construction », « 3D design », « everything from repairs to major
    renovations », « Our customers are welcome to visit us ») ;
  - la licence, le bureau, les horaires, le téléphone, le devis gratuit ;
  - le bleu du logo.
- **Écarté** :
  - les photos d'annonces de maisons californiennes, les images générées, l'image de banque d'images, les rendus de
    jeu vidéo ;
  - leurs chantiers de Californie (voir ANALYSE.md) ;
  - « Reviews coming soon! », la lettre d'information, la bannière de cookies, l'écriture manuscrite.
- **Pas de dates** sur les chantiers : la licence date de décembre 2025 et la plupart des photos sont antérieures (voir
  ANALYSE.md). Les histoires disent seulement l'écart entre deux étapes (« deux semaines plus tard », « le même
  après-midi »).

## Couleurs

| Nom | Hex | Rôle |
|---|---|---|
| Plâtre | `#F4F6F7` | Fond de la page : un blanc froid, celui des murs et du papier de l'esquisse |
| Blanc | `#FFFFFF` | Marges des tirages (esquisse, plans), champs du formulaire |
| Encre | `#10233A` | Texte, et fond de la section du bureau ; c'est le bleu marine du logo |
| Crayon | `#1269B3` | Liens et bouton (5,2:1 sur le plâtre ; texte blanc dessus à 5,7:1) |
| Azur | `#1BA2E6` | Le trait : bord du rectangle de l'accueil, progression, focus sur fond sombre. Jamais pour du texte sur clair |
| Graphite | `#56616C` | Texte secondaire et légendes (5,8:1 sur le plâtre) |

Sur la section sombre (encre), les liens sont en `#9FCDF2` (9,6:1).

## Typographie

- **Mozilla Headline** (2025, licence OFL). Linéale variable en graisse et en chasse. Le site en garde les graisses 400
  à 700 et les chasses 75 à 100 (fichier réduit à 31 Ko). On l'emploie étroite (76 à 86) et grasse pour les titres,
  la liste des camions et l'adresse ; un mot de la liste s'élargit jusqu'à 100 quand on le choisit. L'étroite donne
  la verticalité d'un cartouche de plan d'architecte et tient une phrase entière sur une ligne. Elle est jeune sans
  être à la mode.
- **Mozilla Text**, sa sœur de texte, pour tout le reste : paragraphes, légendes, interface.
- **Polices de secours** ajustées sur les vraies (taille, hauteurs) : le texte ne bouge presque pas quand elles
  arrivent.
- **Échelle** :
  - titre d'accueil : jusqu'à 136 px sur une ligne (40 à 84 px sur deux lignes, sur téléphone et tablette) ;
  - titres de section : 40 à 84 px ;
  - liste des camions : 64 à 156 px (54 à 110 px sur téléphone) ;
  - texte : 18 px (interligne 1,55) ; légendes : 15 px ; interface : 15 à 17 px.
- **Écartées après essai** sur les vrais textes du site, dans une trentaine de polices :
  - les autres étroites, Pathway Extreme (trop routière) et Stack Sans Headline (trop « start-up ») ;
  - les didones et les serifs de magazine : Hedvig Letters Serif, élégante mais trop sage pour « jeune », et
    Ibarra Real Nova, belle mais historique ;
  - les géométriques arrondies, Parkinsans et Gabarito, trop enfantines pour le sujet.

## Mise en page

Grille de 12 colonnes, marges de 64 px (20 px sur téléphone). Texte aligné à gauche, jamais centré.

```
ACCUEIL (épinglé pendant environ deux écrans de défilement)
+------------------------------------------------------------------------------------------+
| [toits] Boca Remodeling Group   Drawn first  What we do  Our work  Visit us  561…  [Free quote] |
| We draw it. Then we build it.                         (une ligne, Mozilla Headline étroite) |
| +--------------------------------------------+   Boca Remodeling Group designs your         |
| |                                            |   kitchen, bathroom or back yard in 3D…      |
| |      LA SCÈNE                              |   [Get a free quote]  or call 561-247-2727   |
| |      esquisse -> 3D -> construite          |                                              |
| |      (rectangle bleu qui part de la porte) |   | (1) Sketched by hand + sa phrase          |
| |                                            |   | (2) Drawn in 3D + sa phrase                |
| +--------------------------------------------+   | (3) Built + sa phrase     (trait de progression) |
+------------------------------------------------------------------------------------------+

DEUX AUTRES PIÈCES, DESSINÉES D'ABORD                     (fond plâtre)
  La cuisine : [1 plan] [2 3D]   +----------------------------+
               petits tirages    | 4 la cuisine finie         |  reste en vue (collante)
  +------------------------+     |   (grande)                 |  pendant qu'on lit 1, 2, 3
  | 3 le polissage de l'îlot |   +----------------------------+
  +------------------------+
  La salle de bain : [1 la 3D cotée]  [2 la douche]  [3 la pièce]   en escalier, comme l'estrade

LA LISTE DES CAMIONS (le titre est la liste)              (fond blanc)
| Kitchens,                    |  +------------------------+ |
| Bathrooms,                   |  | photo du métier choisi | |   collante sur ordinateur
| Windows,                     |  | (même rectangle bleu)  | |
| Roofs,                       |  +------------------------+ |
| Pools.                       |  légende                    |
| Choose a word to see one of our jobs.                      |
| « It's what we paint on our trucks. We also take on… »     |

LE TRAVAIL : huit projets en quinconce, de tailles différentes ; chacun ouvre la visionneuse   (fond plâtre)
LE BUREAU (fond encre) : l'adresse en très grand, « ouvert maintenant » ou « fermé », l'itinéraire ; à droite
  téléphone, e-mail, licence vérifiable, plus de 30 ans, avis Google, et leur pick-up sur un chantier de toit
LE DEVIS : le formulaire ; la demande s'écrit dans la messagerie du visiteur
PIED DE PAGE (fond blanc)
```

Les toits de l'été n'ont pas leur propre section : ils sont dans la liste (Roofs, et la photo des camions par
défaut), dans le travail et au bureau. Une section de plus aurait allongé la page sans rien prouver de neuf.

Sur téléphone : le titre sur deux lignes, puis le texte et le bouton ; la scène s'épingle sous l'en-tête, avec les
trois étapes dessous (seule la phrase de l'étape en cours s'affiche). Les histoires et le travail passent sur une
colonne. La liste des camions reste une liste : on touche un mot, la photo change juste dessous.

## Mouvement

1. **L'ouverture**, une fois, à l'arrivée sur la page (1,3 s) : le titre monte derrière son cache, phrase par phrase ;
   l'esquisse apparaît dans un petit rectangle bleu à l'endroit de sa porte, qui s'agrandit jusqu'aux bords de la
   scène. Le texte d'appui et les étapes sont là d'emblée (c'est aussi ce que la page affiche en premier, ce qui compte
   pour la vitesse mesurée). Le visiteur voit le geste de toute la page avant de faire défiler.
2. **La scène de l'accueil**, liée au défilement : c'est le grand mouvement du site.
   - Les trois étapes sont aussi des boutons : on peut y aller sans faire défiler.
   - En mouvement réduit, la scène change d'état sans animation, au clic sur les étapes.
3. **Les apparitions**, une seule fois chacune, quand on arrive dessus :
   - les titres de section montent ligne à ligne derrière leur cache ; les cinq mots de la liste montent l'un après
     l'autre, comme on les lit sur la porte du camion ;
   - les photos des projets s'ouvrent depuis leur centre, bordées du trait bleu : le même geste que la scène. Dans
     une histoire, elles s'ouvrent dans l'ordre des étapes (1, 2, 3, 4), au moins 140 ms entre deux.
   On a écarté l'apparition en fondu de chaque section : c'est le réflexe de tous les sites, et il ne dit rien du
   sujet. Ici, chaque apparition reprend le rectangle de l'accueil.
4. **Ce qui répond au visiteur** :
   - la liste des camions change la photo avec le même rectangle bleu, et le mot choisi s'élargit (axe de chasse de
     76 à 100) ;
   - les photos des histoires et du travail s'ouvrent dans une visionneuse, sur la photo touchée, par une transition
     de vue (la vignette devient la photo) ;
   - la cuisine finie reste en vue pendant qu'on lit comment elle a été faite ;
   - l'en-tête se cache quand on descend et revient quand on remonte.
5. **Rien d'autre** : rien qui flotte, pas de parallaxe, pas de curseur. En mouvement réduit, aucune ouverture ni
   apparition : tout est là d'emblée.

## Principes

1. **Montrer le dessin à côté de ce qui a été construit.** C'est la preuve que le visiteur cherche : ce qu'on lui
   montrera sera ce qu'il aura.
2. **Un seul ornement**, le trait bleu du crayon : bord du rectangle, progression, soulignés, focus.
3. **Leurs photos seulement**, prises en Floride, jamais agrandies au-delà de leur taille réelle. Aucune image générée.
4. **Leurs mots** : free quote, 3D design, over 30 years, la liste des camions. Des phrases courtes, à la voix
   active, comme un entrepreneur parle.
5. **Une entreprise qu'on peut aller voir** : l'adresse en très grand, les horaires vivants, la licence vérifiable en
   un clic.

## Revue du plan face à la consigne (ce qui a changé)

- **Première idée : ouvrir sur l'esquisse en plein écran.** Abandonnée : le site actuel n'a pas d'avis, et un dessin
  au crayon seul en ouverture risquait de paraître amateur (la consigne écarte tout ce qui fait enfantin). L'esquisse
  ouvre toujours la scène, mais encadrée, avec le titre et la promesse à côté. La photo construite arrive dans le même
  geste de défilement.
- **Deuxième idée : un fondu entre les trois états.** Remplacée par le rectangle qui part du mur du fond. Un fondu
  aurait répété le passage jour/nuit de Prestige ; le rectangle reprend la perspective de l'esquisse et dit « on
  construit à partir du fond ».
- **Mise en page de l'accueil** : au départ, texte à gauche et image à droite, le défaut de toutes les pages
  d'accueil. Le titre passe sur une seule ligne au-dessus de la scène, comme le cartouche d'une planche d'architecte,
  et le texte d'appui va dans une colonne à droite de la scène.
- **Couleur** : on a d'abord pensé au rose de Boca Raton (le Boca Resort) pour l'ancrage local. Écarté : trop
  « boutique de plage » pour un entrepreneur, et étranger à leur marque. Le bleu de leur logo suffit, réduit à un
  trait.
- **Typographie** : une serif de magazine avait été envisagée pour faire « haut de gamme ». Écartée : c'est le réflexe
  par défaut des sites de rénovation de luxe. L'étroite grasse est plus jeune et plus architecturale.
- **Dates** : retirées des chantiers (voir plus haut), ce qui empêche de reprendre la visite horodatée de Stellar.
- **Après la première version** : sous l'accueil, la page était propre mais immobile. Plutôt que d'ajouter un fondu
  à chaque section, le rectangle bleu de la scène devient le geste de toute la page (ouverture, photos, liste).
  Dans la cuisine, la grande photo laissait un vide sous elle : elle reste maintenant en vue à côté des étapes. Les
  deux tirages de l'écran du bureau ont pris le même format, leurs légendes s'alignent. Les photos des histoires
  s'ouvrent en grand, comme celles du travail.

## Extensions explorées

- **21st.dev** : la recherche du catalogue a échoué trois fois le 22 octobre 2026 (« catalog search failed », côté
  serveur). Rien n'en vient : la scène, la liste et la visionneuse sont écrites à la main, en JavaScript sans
  bibliothèque, avec Lenis pour le défilement.
- **Facade UI** (sections React et shadcn) : hors sujet ici, le site est en HTML, CSS et JavaScript sans framework.
- **frontend-design** : méthode suivie pour ce document (plan, revue face à la consigne, corrections).
- Pour la suite : **design:accessibility-review** et **design:ux-copy** (relecture), **design:design-critique**
  (revue), **maquinable-geo:seo-audit** (audit du site actuel).
