# Brunet Brothers Construction : la direction

## L'idée : la série

Leur devise est « Masters of Consistency and Quality ». Le site actuel l'écrit sous le logo, puis ne la montre nulle
part. Le nouveau site la prouve avec leurs propres photos. Leur galerie compte 41 photos de salles de bain et 16 de
cuisines, prises du même point de vue, avec le même soin. Montrées côte à côte, au même format, dans une grille stricte,
elles forment une série. C'est le principe des « typologies » de Bernd et Hilla Becher : la répétition fait la preuve.
Une rangée de douches, une rangée de meubles-vasques, une rangée de cuisines. Le visiteur voit en deux secondes que ce
n'est pas une belle salle de bain chanceuse, mais un niveau qui se répète d'une maison à l'autre.

Trois choix soutiennent cette idée :

1. **La paroi de verre.** Leur produit le plus photographié est la douche à paroi de verre sans cadre. Chaque photo
   apparaît derrière un verre dépoli, une version floue et pâle d'elle-même, qui glisse de gauche à droite comme une
   paroi coulissante. Son bord est un trait blanc net, comme la tranche polie d'un verre. À l'ouverture, une seule paroi
   traverse toute la planche de l'accueil, les six photos d'un geste.
2. **Deux langues.** Ils ont une ligne en espagnol, mais leur site est seulement en anglais. Le nouveau site est entier
   dans les deux langues, en un clic, sans changer de page. Dès l'accueil, chaque numéro de téléphone est annoncé dans sa
   langue : « Call in English », « Llame en español ».
3. **Les preuves plutôt que les adjectifs.** Le site montre :
   - leurs quatre licences d'État, chacune liée à sa fiche au registre ;
   - leurs 18 témoignages, mot pour mot ;
   - leur FAQ, devenue le déroulé d'un chantier ;
   - leur flotte de camionnettes.

   Les superlatifs (« we are indeed the best ») disparaissent.

## Ce qui a été écarté

- **Une caméra qui plonge dans une photo de la grille.** C'était trop proche de la scène de Boca (la caméra qui passe
  par la porte). Ici, pas de section épinglée : la page défile librement. La seule animation orchestrée est l'ouverture.
- **Le logo comme cadre des photos** (déjà fait pour Hideout).
- **Les rangées qui se construisent une à une** (Mendieta) et les mosaïques de carreaux (Petri). La grille est posée
  d'un coup, c'est la paroi qui passe.
- **Des onglets pour filtrer la galerie** (proches des avis filtrés de Stellar). Les photos sont rangées en planches, par
  type de pièce.
- **Des compteurs** (« 41 bathrooms »). Plusieurs photos montrent souvent le même chantier : le chiffre exagérerait.
- **Un fond sombre partout avec l'orange en accent unique**, ou un fond crème avec une grande serif. Ce sont deux
  réflexes de page générée. Le fond est un gris quartz froid, et une seule bande est sombre : celle des licences.
- **Des numéros « Planche I, II »** au-dessus des grilles : de la décoration. Les titres disent simplement ce qu'on voit
  (« Showers », « Vanities »).

## Couleurs

| Nom | Valeur | Rôle |
|---|---|---|
| Quartz | `#EEEFED` | Le fond. Le gris très clair de leurs carrelages et de leurs plans en quartz, froid, ni blanc ni crème. |
| Graphite | `#191A1B` | Le texte et les titres. |
| Ardoise | `#5B5F63` | Le texte secondaire (contraste de 5,6:1 sur le quartz). |
| Orange BB | `#EA8A12` | L'orange de leur logo. En aplat sur le fond clair : les boutons, le crochet du logo, le trait actif. Le texte posé dessus est en graphite (6,8:1). Sur la bande sombre, il peut servir de texte (6,4:1). |
| Nuit | `#1D1F21` | La bande des licences et le pied de page. |
| Blanc | `#FFFFFF` | Le bord de la paroi de verre, les champs du formulaire. |

L'orange ne sert jamais de couleur de texte sur le quartz : son contraste y est trop faible. Un lien se signale par un
soulignement orange sous un texte graphite.

## Typographie

- **Chivo** (Omnibus-Type, Buenos Aires). Une linéale variable, de la graisse 300 à 900.
  - Les titres sont en 800 et 900, serrés à −0,03 em. Ses lettres larges et ramassées répondent aux « BB » carrés du
    logo.
  - Le texte et l'interface sont en 400 à 600.
- **Piazzolla** (Huerta Tipográfica, Buenos Aires), en italique, avec une taille optique variable. Elle sert seulement
  aux paroles des clients, pour leur donner une voix humaine, distincte de celle de l'entreprise.
- **Pourquoi ces deux-là.** Deux fonderies argentines pour une entreprise familiale qui répond au téléphone en
  espagnol. Les deux couvrent tous les accents de l'espagnol.
- **L'échelle** (rapport de 1,25) :
  - le texte : 18 px, interligne 1,6, 68 caractères au plus par ligne ;
  - les légendes : 14,5 px ;
  - le h1 : de 46 à 104 px, interligne 0,94 ;
  - le h2 : de 34 à 68 px ;
  - les témoignages : de 22 à 31 px.
- **Les chiffres.** Ceux des licences et des téléphones sont tabulaires.
- **Pas de capitales espacées** : aucun sur-titre, aucune étiquette en capitales.

## La mise en page

Le texte est aligné à gauche partout. La gouttière va de 20 à 64 px, et le contenu fait au plus 1 800 px de large.

```
ORDINATEUR (1440)
┌──────────────────────────────────────────────────────────────────────────────┐
│ [BB] Brunet Brothers Construction   Our work  Company  How it works  Clients  EN|ES  [Free estimate] │
├───────────────────────────┬──────────────────────────────────────────────────┤
│ Masters of                │ ┌────────┐ ┌────────┐ ┌────────┐                  │
│ consistency               │ │ douche │ │ douche │ │ douche │   la planche     │
│ and quality.              │ └────────┘ └────────┘ └────────┘   de l'accueil   │
│ Famille, Lake Worth, 2008 │ ┌────────┐ ┌────────┐ ┌────────┐   (3 × 2, 3:4)   │
│ [Get a free estimate]     │ │cuisine │ │cuisine │ │cuisine │                  │
│ Call in English (561)…    │ └────────┘ └────────┘ └────────┘                  │
│ Llame en español (561)…   │ légende de la photo survolée                      │
├───────────────────────────┴──────────────────────────────────────────────────┤
│ Interior remodeling            texte (visite, mesures, conception)  « citation »│
│ Showers   [ ][ ][ ][ ]   ← une rangée par type, 4 photos de même format        │
│ Vanities  [ ][ ][ ][ ]                                                       │
│ Tubs …    [ ][ ][ ][ ]                                                       │
│ Kitchens  [    ][    ][    ]  ← 4:3, 3 × 2                                    │
│           [    ][    ][    ]                                                 │
│ Other rooms [  ][  ][  ][  ]                                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│ Exterior remodeling   [ grande photo de la cuisine d'été    ] [ foyer ]      │
│                                                            [ piscine ]       │
├──────────────────────────────────────────────────────────────────────────────┤
│ New construction   texte   [ fermes ] [ story en espagnol ] [ salon ]       │
├──────────────────────────────────────────────────────────────────────────────┤
│ (bande nuit) Family-owned. Licensed…   [ camionnettes ]                      │
│ Certified General Contractor     CGC1524915  ← chaque numéro ouvre sa fiche  │
│ Certified Plumbing Contractor    CFC1430197                                  │
│ …                                                                            │
├──────────────────────────────────────────────────────────────────────────────┤
│ From the first visit to the last payment.   1 … 6 (le déroulé, en liste)     │
├──────────────────────────────────────────────────────────────────────────────┤
│ « Our clients are our toughest critics… »   six témoignages, puis les 18     │
├──────────────────────────────────────────────────────────────────────────────┤
│ Free in-home estimate.  formulaire          téléphones, e-mail, zone        │
├──────────────────────────────────────────────────────────────────────────────┤
│ pied de page (nuit) : logo, devise, licences, contacts, langue               │
└──────────────────────────────────────────────────────────────────────────────┘

TÉLÉPHONE (390)
┌──────────────────────┐
│ [BB]      EN|ES  ☰   │
│ Masters of           │
│ consistency and      │
│ quality.             │
│ texte court          │
│ [Get a free estimate]│
│ Call in English …    │
│ Llame en español …   │
│ [ ][ ][ ]  planche   │
│ [ ][ ][ ]  3 × 2     │
│ Showers  [ ][ ]      │
│          [ ][ ]      │
│ …                    │
└──────────────────────┘
```

**Les planches.**
- Les cellules d'une même rangée ont le même format et la même taille. Les écarts sont de 8 à 12 px, sans bordure ni
  arrondi : ce sont des tirages.
- Sous chaque planche, une **légende-index** numérotée décrit chaque photo. Les numéros renvoient aux photos, c'est un
  vrai index.
- Survoler ou parcourir une photo au clavier met sa légende en avant, et l'inverse.
- Un clic ouvre la visionneuse sur la photo touchée.

## Le mouvement

1. **L'ouverture**, la seule animation qui ne répond pas à un geste du visiteur.
   - Le titre monte ligne par ligne derrière son cache.
   - Puis une paroi de verre dépoli traverse la planche de l'accueil, de gauche à droite, en 1,4 s : les six photos
     passent du flou au net sous son bord blanc.
   - Si l'ouverture ne peut pas se jouer, tout s'affiche à 2,5 s quoi qu'il arrive. Le titre, l'élément principal de la
     page, n'est jamais caché.
2. **Les autres photos.**
   - La même paroi passe sur chacune quand elle entre à l'écran, une seule fois.
   - Au moins 140 ms séparent deux photos, dans l'ordre de lecture.
   - Le flou de départ sert aussi d'aperçu pendant le chargement : il n'y a jamais de case grise.
3. **Les titres de section** montent derrière leur cache. Le texte courant n'est pas animé.
4. **La langue.** Le texte s'efface puis revient dans l'autre langue en 0,3 s. La légende de la planche suit.
5. **La visionneuse.** La vignette devient la grande photo (transition de vue). On passe d'une photo à l'autre au
   clavier, avec les boutons ou au doigt.
6. **L'en-tête** se range quand on descend et revient quand on remonte.

Rien ne flotte, rien ne suit la souris. Il n'y a ni parallaxe ni curseur personnalisé. Quand le mouvement est réduit,
aucune de ces animations ne se joue : les photos sont là, nettes.

## Les textes

- On garde leurs mots quand ils sont précis :
  - la devise ;
  - « free in-home design consultation and work estimate » ;
  - « Since 2008 », « family-owned » ;
  - « Residential or commercial… clients, architects and engineers » ;
  - « We will take on any project, no matter how large or small » ;
  - la phrase de leur page d'avis, « Our clients are our toughest critics and our best salespeople », qui devient le
    titre des témoignages ;
  - les réponses de leur FAQ.
- On retire les superlatifs, les redites et les formules creuses (« Welcome to », « Find Out More »).
- **Les légendes** décrivent ce qu'on voit : le carrelage, la paroi, le meuble, la lumière. Elles n'inventent ni lieu,
  ni date, ni matériau incertain.
- **Les témoignages** sont cités mot pour mot, coquilles comprises, et restent en anglais dans la version espagnole. Une
  note le dit.
- **L'espagnol** est un espagnol neutre des États-Unis, au vouvoiement (« usted »), comme on parle à un client.

## Revue du plan avant le code (méthode frontend-design)

- **Le premier écran est-il générique ?** Un titre à gauche et une grille de photos à droite, beaucoup de portfolios le
  font. Ce qui le rend propre à eux :
  - la grille est une typologie (une rangée de douches au-dessus d'une rangée de cuisines, au même format) ;
  - leur propre devise sert de titre ;
  - la paroi de verre rappelle leur produit ;
  - les deux lignes téléphoniques sont annoncées dans leur langue.

  *Révisé* : la première version mélangeait les photos sans ordre. Les rangées par type rendent la série lisible.
- **Une seule audace.** Les planches et la paroi sont l'élément mémorable. Le reste est calme : texte en graphite,
  aplats orange rares, une seule bande sombre, pas de cartes.
  *Révisé* : une deuxième animation de défilement (une ligne de progression pour le déroulé du chantier) a été retirée.
- **Les tics de page générée.** Le plan n'a pas de sur-titres en capitales ni de chaînes « A · B · C ». Pas de chasse
  fixe pour les étiquettes, pas de flèches « → » dans les boutons, pas d'ombres grises sous des cartes arrondies.
  Les numéros n'apparaissent que là où l'ordre existe : le déroulé du chantier et l'index des légendes.
- **La copie.** *Révisé* : le titre « Interior Remodeling », sous-titré « It's All in the Details », était une formule
  creuse. Le sous-titre est remplacé par ce que contient la section (salles de bain, cuisines, autres pièces).

## Les extensions consultées

- **21st.dev (MCP)** est connecté, mais sa recherche répond « catalog search failed ». Nous l'avons essayée deux fois,
  avec deux outils (search et get_inspiration), sans résultat : rien n'en est repris.
- **Facade UI et shadcn** sont faits pour React et Tailwind. Ce site est en HTML, CSS et JavaScript sans framework,
  avec Lenis : ils ne s'appliquent pas.
- **frontend-design** a servi pour ce plan et sa revue.
- **design:accessibility-review, design:design-critique et design:ux-copy** servent à la relecture (REVUE.md,
  ACCESSIBILITE.md).
- **maquinable-geo:seo-audit** sert pour l'audit du site actuel.
