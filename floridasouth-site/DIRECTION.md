# Florida South Construction : direction artistique

## L'idée : « Give us your list, and consider the job done »

C'est leur phrase, dans leur page de services : « We know you're busy, and we will gladly take on your "to do" list
[…] Call us today, give us your list, and consider the job done. » Et c'est ce qui les distingue : un seul entrepreneur,
licencié, pour toute la liste, du trou rebouché à la maison neuve. L'avis de Carol le dit à sa façon : « No job is too
small! ».

Le site s'ouvre donc sur une liste de travaux, écrite sur le ciel de leurs photos. Les lignes grandissent avec la taille
du chantier (rebouche le trou dans le mur, change les luminaires, refais la cuisine, ajoute une véranda, construis la
maison), puis elles se barrent une à une, et la phrase arrive : « Consider it done. »

Le ciel, c'est celui de leurs photos de 2015 : un bleu de cobalt profond, sans nuage, que coupent les débords de toit
blancs. La photo de l'accueil (les deux angles de débords, IMG_0343) monte du bas de l'écran, et son ciel *devient* le
fond de la page : on ne voit pas où la photo commence.

## Ce que j'ai cherché dans les extensions

- **21st.dev** (recherche dans le catalogue) :
  - « Strikethrough Replace » (framecn) : une ligne qui barre un texte puis le remplace. Confirme l'idée de la liste
    barrée ; refaite ici en CSS pur (un trait en arrière-plan qui s'allonge, sur plusieurs lignes s'il le faut), sans
    React ni bibliothèque.
  - « Scroll Reveal Image » (unlumen) : une image qui s'élargit en entrant à l'écran. Repris pour la maison neuve, mais
    sans zoom ni ressort : seul le cadre s'ouvre, la photo ne bouge pas (rien qui flotte).
  - « Thumbnail image viewer » (ibrandify) : la navigation au clavier et le compteur de la visionneuse.
  - Écartés : la galerie « Lighthouse Spotlight » (un faisceau qui balaie les photos : un gadget), la grille en
    maçonnerie avec zoom au survol (le modèle de partout), les témoignages en carrousel 3D, la « liste de services
    éditoriale » numérotée (des numéros sur ce qui n'est pas une suite).
- **Facade UI** et **shadcn** : des sections React + Tailwind. Pas pour ce site (vanilla demandé), et leur découpage
  (héros, grille de services, chiffres, témoignages, CTA) est justement le gabarit à éviter.
- **Design** (critique, accessibilité, textes d'interface), **SEO + GEO** (audit du site actuel) : utilisés pour la revue,
  l'accessibilité et l'audit (REVUE.md, ACCESSIBILITE.md, seo-audit-floridasouth.us-2026-10-17.md).

## Couleurs

Toutes prises sur leurs photos, converties en sRGB (leurs photos de 2015 sont en Adobe RGB : sans conversion, le ciel
paraîtrait terne et ne raccorderait pas avec le fond).

| Nom | Hex | Où |
|---|---|---|
| Ciel | `#2E5AB2` (dégradé `#254EA9` → `#3F65B7`, de gauche à droite, comme sur la photo) | l'accueil, l'en-tête, la demande de devis ; liens et boutons |
| Débord blanc | `#FFFFFF` | le fond des sections |
| Stuc vert d'eau | `#DDE4E2` (les colonnes au soleil : `#D0D8D6`) | la section de Judson et de la licence |
| Encre | `#18213A` | le texte, le pied de page |
| Ardoise | `#4E5A6C` | le texte secondaire, les légendes |

Blanc sur ciel : 6,5:1 (7,9:1 à gauche, 6:1 à droite). Ardoise sur blanc : 7:1, sur stuc : 5,5:1.

Le bleu est un ciel, pas une couleur d'interface posée partout : il n'apparaît que là où il prolonge la photo (l'accueil,
la demande en bas de page qui referme le ciel) et sur les liens et boutons. Le reste est blanc, stuc et encre ; le pied
de page est à l'encre. (Skoda et Castor étaient déjà bleus, en aplat : ici c'est un dégradé de ciel photographique, en
fond plein écran, avec un texte blanc.)

## Typographie

- **Gloock** (Duarte Pires, OFL) : la liste, « Consider it done. », les titres, les citations, le nom dans le logo. Un
  serif très contrasté, aux empattements tranchants, qui a l'air d'une enseigne peinte mais reste net en très grand.
- **Albert Sans** (OFL, 400 à 700) : le texte, l'interface, les légendes. Une grotesque géométrique simple, qui s'efface.
- Échelle : liste de l'accueil en cinq tailles (de 1 à 2,3 fois), « Consider it done. » jusqu'à 132 px, titres 38 à
  68 px, intertitres 26 à 34 px, texte 17 à 18 px (interligne 1,6), légendes 14,5 px. Lignes de texte sous 70 signes.
- Aucune capitale d'étiquette, aucun sur-titre : les titres sont des phrases, et ce sont les leurs (« No job is too
  small. », « Another quality home. » — ce qu'écrit le panneau de leur chantier —, « Send us your list. »).

## Mise en page

Tout est aligné à gauche, sur douze colonnes (contenu jusqu'à 1 320 px, marges de 20 à 64 px).

### L'accueil (ordinateur)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ ◎ Florida South       What we do   Two houses   About   Reviews   (239) 449-4477  [Get an estimate] │
│   Construction                                                                        │
│                                                                                       │
│   Give us your list.                                                                  │
│   P̶a̶t̶c̶h̶ ̶t̶h̶e̶ ̶h̶o̶l̶e̶ ̶i̶n̶ ̶t̶h̶e̶ ̶w̶a̶l̶l̶.̶                                     petit       │
│   R̶e̶p̶l̶a̶c̶e̶ ̶t̶h̶e̶ ̶l̶i̶g̶h̶t̶ ̶f̶i̶x̶t̶u̶r̶e̶s̶.̶                                              │
│   R̶e̶d̶o̶ ̶t̶h̶e̶ ̶k̶i̶t̶c̶h̶e̶n̶.̶                                                       │
│   A̶d̶d̶ ̶a̶ ̶s̶u̶n̶r̶o̶o̶m̶.̶                                                            │
│   B̶u̶i̶l̶d̶ ̶t̶h̶e̶ ̶h̶o̶u̶s̶e̶.̶                                         grand       │
│   Consider it done.                                       (Gloock, jusqu'à 132 px)    │
│                                                                                       │
│   Florida South Construction is a general       [Get an estimate]                     │
│   contractor in Naples, Florida… (h1)           (239) 449-4477                        │
│░░░░░░░ le ciel de la photo, sans raccord ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│▓▓▓▓▓▓▓ les débords blancs montent dans le ciel ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
```

La ligne du titre et des boutons est posée sur la bande de ciel de la photo (uniforme : écart-type de 5 à 8 sur 255) ;
le débord blanc de gauche apparaît en bas du premier écran, le reste de la photo en descendant.

### L'accueil (téléphone)

```
┌───────────────────────────┐
│ ◎ Florida South  [Call][≡]│
│ Give us your list.        │
│ P̶a̶t̶c̶h̶ ̶t̶h̶e̶ ̶h̶o̶l̶e̶…           │
│ R̶e̶p̶l̶a̶c̶e̶ ̶t̶h̶e̶…             │
│ R̶e̶d̶o̶ ̶t̶h̶e̶ ̶k̶i̶t̶c̶h̶e̶n̶.̶         │
│ A̶d̶d̶ ̶a̶ ̶s̶u̶n̶r̶o̶o̶m̶.̶            │
│ B̶u̶i̶l̶d̶ ̶t̶h̶e̶ ̶h̶o̶u̶s̶e̶.̶          │
│ Consider it               │
│ done.                     │
│ h1 + texte                │
│ [Get an estimate]         │
│ [Call (239) 449-4477]     │
│░░░ ciel de la photo ░░░░░░│
│▓▓▓ l'angle du débord ▓▓▓▓▓│  (recadrée sur l'angle de gauche et la colonne)
└───────────────────────────┘
```

Le numéro est en haut de l'écran du téléphone (bouton « Call »), ce qui manquait au site actuel.

### Ce qu'on fait : la taille des photos suit la taille du chantier

```
No job is too small.                         (h2, Gloock)
One licensed general contractor for the whole list…

Maintenance and home repair        [petite photo : la scie à onglets sur le chantier]
We know you're busy…

Remodeling and renovation                         [photo moyenne : l'ossature d'un couloir]
cuisines et salles de bain · plans de travail …   (en deux colonnes de liste)
And the artistic ones…

New construction
From the block walls to the white eaves.
[████████ la maison sur pilotis : le cadre s'ouvre jusqu'aux bords de l'écran en défilant ████████]
```

Trois rangées, pas trois cartes. Chaque photo garde ses proportions ; c'est son cadre qui s'agrandit d'une rangée à
l'autre, et qui s'ouvre un peu en entrant à l'écran (un peu pour la petite, entièrement pour la maison). Les légendes
disent ce qu'on voit, avec l'année.

### Deux maisons : « Another quality home. »

```
Another quality home.                                        [le panneau du chantier]
That's what the sign said at this one…

The raised house                        photographiée en 2015
[ grande ][ moyenne ]
[ haute ][ moyenne ][ moyenne ]          mosaïque à placements écrits pour chaque photo
légende sous chaque photo

The block house in the pines            photographiée en 2016
[ grande extérieure ][ haute ]
[ moyenne ][ moyenne ][ haute ]
```

Les photos de 2016 ont été prises le même jour, au même stade (murs, fermes et ossature en place, avant les plaques) :
ce n'est pas une suite d'étapes, donc pas de numéros. Un clic (ou Entrée) ouvre la visionneuse : la photo grandit depuis
sa vignette jusqu'au plein écran, flèches, clavier, glisser au doigt, Échap pour revenir.

### Judson et la licence (fond stuc)

```
Judson White, president                      [portrait]
Judson is the president… et le titulaire de la licence.
« From the most basic kitchen or bathroom renovation to an artistic redesign… » (son message, mot pour mot)

An eye for detail            [les étriers de la terrasse, chaque clou à sa place]
Your home and your family
References on request        [Judson (à droite) avec un membre de l'équipe]

┌ Certified General Contractor, State of Florida ┐
│ CGC1515532                                       │  la licence vérifiée, avec le lien pour la vérifier
│ Judson Gregory White, Florida South Construction │
│ Licensed since June 2, 2008. Active until …      │
└──────────────────────────────────────────────────┘
```

### Avis, demande, pied de page

- **Avis** : les deux, en grand (Gloock), décalés l'un sous l'autre, signés « Carol F. » et « Marti L. ». Les mots
  s'éclairent au fil de la lecture quand la citation passe au milieu de l'écran.
- **« Send us your list. »** (sur le ciel) : nom, téléphone, e-mail, ville, la liste (un grand champ réglé comme une
  feuille, à fines lignes), « Who sent you our way? » (facultatif, « so we can thank them », leur question). L'envoi
  prépare un e-mail à Jwhite@floridasouth.us. À côté : téléphone, fax, e-mail, bureau.
- **Pied de page** (encre) : l'emblème, le nom complet, le bureau, les numéros, la licence, Lee et Collier, Facebook.

## Le logo

Leur emblème est gardé (il est sur leurs polos, leur casquette et leur panneau de chantier) mais redessiné proprement :
- la Floride d'après les contours du Recensement américain (us-atlas, 1:10 000 000), simplifiée, avec le lac
  Okeechobee (Natural Earth, domaine public) en réserve, comme sur l'original ;
- l'anneau elliptique et ses quatre pointes de rose des vents, tracés à la main en courbes ; l'anneau passe *derrière*
  la Floride (une fine réserve autour de la côte) ;
- le lettrage western de 2015 est remplacé par « Florida South » en Gloock et « Construction » en Albert Sans.

## Le mouvement

Quatre choses, chacune liée au sens :
1. **À l'ouverture** (une fois) : les cinq lignes se barrent l'une après l'autre (un trait blanc qui s'allonge de gauche
   à droite, plus épais pour les grandes lignes), puis « Consider it done. » s'écrit dans le même sens. 2,4 s en tout.
2. **Les cadres qui s'ouvrent** avec le défilement, à la mesure du chantier (la petite photo un peu, la maison jusqu'aux
   bords). La photo elle-même ne bouge pas et ne zoome pas.
3. **La visionneuse** grandit depuis la vignette touchée, et y retourne.
4. **Les avis** : les mots s'éclairent au passage.

Le reste ne bouge pas tout seul : pas d'apparition en fondu à chaque section. Survols : couleur et soulignement.
« Réduire les animations » : tout est en place d'emblée, barré et visible. Sans JavaScript : pareil.

## Principes

1. Leurs mots d'abord : chaque titre vient de leur site, de leur panneau ou de leurs avis.
2. Le ciel est la photo : le bleu ne sert que là où il continue un ciel.
3. L'échelle comme idée : la taille des lignes et des cadres dit la taille du travail.
4. Les vraies photos, jamais agrandies, légendées avec ce qu'on y voit et l'année.
5. Judson nommé, la licence vérifiable.
6. Une seule chose spectaculaire (la liste barrée sur le ciel) ; le reste calme et précis.

## Relecture contre les réflexes génériques

| Premier jet | Pourquoi c'était un réflexe | Ce que j'ai fait |
|---|---|---|
| La liste à gauche, une photo à droite | le héros coupé en deux de tous les sites | une affiche pleine largeur ; la photo monte du bas et son ciel devient le fond |
| Le bleu partout (en-tête, sections, pied) | le site bleu « entreprise » ; Skoda et Castor l'étaient déjà | le ciel seulement où il prolonge une photo ; blanc, stuc, encre ailleurs |
| Trois cartes de services avec icônes | le kit de cartes identiques | trois rangées dont les photos grandissent avec le chantier |
| Une grille de galerie avec zoom au survol | le modèle de partout | une mosaïque écrite pour ces photos, des légendes toujours visibles, une visionneuse qui part de la vignette |
| Les photos de 2016 numérotées en étapes | elles ont été prises le même jour : ce n'est pas une suite | des légendes descriptives, sans numéros |
| Un sur-titre en capitales sur chaque section | la marque des pages générées | aucun ; des titres-phrases tirés de leurs mots |
| Des apparitions en fondu à chaque section | le mouvement par défaut | quatre mouvements, chacun lié au sens (barrer, ouvrir, agrandir, lire) |

## Ce qui n'est pas repris des sites précédents

Ni l'enseigne sur la façade (Castor), ni le jour et la nuit (Prestige), ni le cadre du logo (Hideout), ni le cordeau et
les plans (Ehlers), ni le toit couche par couche, les rangs de tuiles et la carte des villes (Mendieta), ni la mosaïque de
ligne d'eau (Petri), ni la lumière et l'ombre (One Place), ni le nom épinglé, la fenêtre en arc et le bloc gris (Skoda),
ni le toit de mots, la pente 6/12 et la règle des garanties (Five Points). Pas de carte du secteur non plus (Skoda et
Mendieta en avaient une). Polices jamais utilisées jusqu'ici.
