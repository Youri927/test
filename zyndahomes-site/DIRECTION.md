# Zynda : direction artistique

## L'idée : « votre année, notre été »

Ce qui distingue Zynda n'est pas d'être « luxe » (tous leurs concurrents le disent), c'est leur façon de travailler
avec les propriétaires de Naples, qui passent l'hiver ici et l'été dans le Nord :
- **l'hiver**, quand vous êtes là, on prépare ensemble (architecte, designer, choix des matériaux, devis, règlement de
  l'immeuble) ;
- **à partir de mai**, quand vous partez, on construit : démolition, ossature, réseaux, finitions ;
- **tout l'été**, on est sur place chaque jour, le chantier est nettoyé chaque jour, et vous recevez des photos et des
  e-mails d'avancement ;
- **le 1er octobre**, vous rentrez chez vous, et c'est fini.

Tout vient de leurs pages : « We start in May and finish October 1st! », « We're on-site daily », « From demolition and
framing to rough-ins and finishing details », « We appreciate your pictures and progress emails », « kept to the schedule
we needed Oct 1! ». Le site raconte cette année. Les photos (leurs vraies pièces) portent le luxe ; l'année porte la
confiance.

## Ce qu'on retient en voyant le site

1. **L'accueil en Z.** La première phrase en haut à gauche (« The people who show up. »), la maison blanche et sa piscine
   en bandeau panoramique, la fin de la phrase en bas à droite (« Every single day. »). L'œil lit en Z, comme le
   monogramme de leur logo, sans qu'on dessine de Z.
2. **Le cadran de l'année.** Un cadran rond (l'emblème de Zynda est rond) : les douze mois, 365 traits fins comme la
   minuterie d'une montre, l'hiver en pointillé, la saison des condos de mai au 1er octobre en arc couleur d'eau de
   piscine. Sur ordinateur, il reste à l'écran pendant qu'on lit les quatre temps de l'année ; un repère avance sur le
   cadran au fil du défilement, la date s'affiche au centre, l'arc de l'été se remplit, et le repère se pose sur le
   1er octobre. Un second repère marque **aujourd'hui** (la vraie date du visiteur), avec une ligne utile : hors saison,
   « la prochaine saison commence en mai : plus tôt on prépare, plus tôt on commence » (leur conseil) ; en saison, le
   nombre de jours jusqu'au 1er octobre.
3. **Les détails qui font la différence** (« Adding pop is what we do best », leur devise ; « the seemingly little but
   BIG details », un client) : un bandeau noir de gros plans tirés de leurs photos, la pierre bleue de la cheminée, les
   carreaux en écailles vert d'eau, le marbre et le robinet, l'escalier de verre. Un clic ouvre la pièce entière.
4. **« Quand êtes-vous absent ? »** Dans le formulaire, deux mois (départ, retour) dessinent votre fenêtre sur une
   petite frise de l'année, à côté de la saison des condos. C'est la question qu'ils posent de toute façon.

Le reste se tait : beaucoup de blanc, de grandes photos nettes, des légendes exactes.

## Couleurs

Le logo de Zynda est noir et blanc : le site aussi. La seule couleur vient de leurs photos.

| Nom | Hex | Rôle |
|---|---|---|
| Paper | `#FFFFFF` | fond, les murs blancs de leurs maisons |
| Ink | `#000000` | texte, boutons, traits du cadran, bandeau des détails, pied de page (le noir du logo) |
| Pool | `#89D0D4` | relevée sur la piscine de leur maison neuve : l'arc de la saison, la fenêtre du formulaire, les repères. Jamais pour du texte |
| Pool deep | `#2E8F96` | l'arc de la saison qui se remplit, le contour de focus sur fond noir (3,9:1 sur blanc) |
| Stone | `#EEF0F0` | fond de la section de l'année et des zones, le marbre blanc de leurs salles de bain |
| Vein | `#5C6366` | légendes et textes secondaires (6:1 sur blanc, 5,4:1 sur Stone) |

Pas de crème, pas de terre cuite, pas de dégradé, pas d'ombre portée. Pas de bleu « confiance » non plus : le bleu du
golfe reste dans les photos.

## Typographie

- **Montagu Slab** (Florian Karsten, OFL), variable en graisse et en taille optique. Une égyptienne contemporaine,
  claire et large ; en grande taille optique, ses pleins et déliés sont très contrastés et ses empattements très fins :
  elle s'accorde au mot « ZYNDA » de leur logo (un didone gras) sans le copier ni lui faire concurrence. Titres,
  phrase d'accueil, dates du cadran, citations des clients, noms des quartiers. Graisse 250 en très grand, 300 à 400
  en moyen ; la taille optique suit la taille (`font-optical-sizing: auto`). Casse de phrase, interlignage serré
  (0,98 à 1,05), approche légèrement resserrée en grand (−0,02 em).
- **Reddit Sans** (Pentagram pour Reddit, OFL), variable en graisse, avec italiques. Une linéale nette et ouverte,
  bien lisible pour une clientèle qui a souvent plus de 60 ans : texte, interface, légendes. 400 pour le texte, 500 à
  600 pour l'interface.

Échelle (quarte juste, 1,333), en `clamp()` du téléphone à l'écran large : 13,5 (légendes) · 15 (petit) · 18 (texte,
17 sur téléphone) · 24 (chapeau) · 32 · 43 · 57 · 76 (titres de section) · 101 · 135 (accueil). Lignes de texte de 60 à
70 signes. Chiffres tabulaires dans les dates du cadran.

À éviter, et pourquoi : pas de capitales espacées au-dessus des titres, pas de mot isolé mis en couleur ou en
italique dans un titre, pas de numérotation 01/02/03 (seules les quatre étapes de l'année sont une vraie suite, et ce
sont des dates), pas de flèche ajoutée aux liens, pas de police à chasse fixe pour les petites étiquettes, pas de points
médians entre des mots.

## Mise en page

Grille de 12 colonnes, 1440 px au plus, marges de 16 px (téléphone), 40 px (tablette), 56 à 64 px (ordinateur),
gouttières de 24 px. Tout est aligné à gauche, sauf la fin de la phrase d'accueil, alignée à droite pour fermer le Z.
Les photos débordent souvent jusqu'au bord de l'écran ; le texte jamais.

### Accueil
```
 ◎ ZYNDA                 Work  Your year  Services  About  Contact   (239) 213-1314  [Plan a consultation]

 Custom homes and renovations in Naples and Marco Island
 The people who show up.
 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ la maison blanche et sa piscine, bord à bord, en bandeau ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
 A family-owned general contractor                                         Every single day.
 since 2001. A few projects at a time…
 [Plan a consultation]  (239) 213-1314         Waterfront home, new construction, Naples
```
Le bandeau est un recadrage de la photo à 2500 px : affiché à 1440 px, il reste net (1,7 pixel d'image par pixel
d'écran). Sur téléphone : la phrase, la photo en 4:3, la fin de la phrase, le texte, les boutons pleine largeur.

### Ce qui les distingue (juste après)
```
 We intentionally take on only a few projects at a time.          (leur phrase, en grand)

 On site daily          Clean, organized sites     Trusted subcontractors     Referrals and reputation
 (une ligne chacun)                                                  Florida license CGC056812, check it
```

### L'année (fond Stone)
```
 We plan in winter, and build while you're away.

   ┌──────── cadran ────────┐        Winter. You're here.            ← le texte défile,
   │  Jan  Feb  …   (traits) │        …                                 le cadran reste
   │        October 18       │        May. We start.                   (repère, date au
   │    arc de mai au 1er oct│        … photo du condo démoli face     centre, arc qui se
   └─────────────────────────┘          au golfe                       remplit)
    Today is October 18. The next        June to September. On site, every day.
    season starts in May.                October 1st. You're home.
```
Sous 1100 px : le cadran entier, fixe, en tête de section, puis les quatre temps les uns sous les autres.
Suit un court bloc sur les condos (approbations de la copropriété, règles de l'immeuble, logistique, parties communes
protégées) avec les immeubles où ils ont travaillé.

### Les pièces
Une suite éditoriale, pas une grille de cartes : de grandes photos de tailles différentes, posées sur la grille avec
du blanc autour, chacune avec une légende courte (la pièce, et le lieu quand leur site le donne). Les avis des clients
sont posés entre les photos, là où ils parlent de la même chose (la maison de vacances de Park Shore à côté du séjour,
« Can't wait for our stay! » à côté des salles de bain), jamais en légende d'une photo qui ne serait pas la leur. Un
clic ouvre la visionneuse.

### Les détails (bandeau noir)
Huit gros plans carrés, en rangée qui défile au doigt sur téléphone ; la devise « Adding pop is what we do best. » et
l'avis de Marco Island sur les « BIG details ».

### Ce qu'ils construisent
Sept lignes, une par prestation (le nom en Montagu, une phrase de leur texte). Au survol ou au focus, la photo de la
prestation apparaît à droite de la ligne, à sa place (elle ne suit pas la souris). Puis les fourchettes (100 000 $ à plus
de 7 000 000 $) et le travail avec l'architecte et le designer du client.

### La famille, les quartiers, le contact
Le portrait des propriétaires (sans nom), Buffalo, 2001, leur citation sur les détails, l'offre d'emploi. Les quartiers
en grand dans Montagu, les immeubles et les rues en plus petit. Le formulaire, avec la frise « quand êtes-vous
absent ? », et à côté : téléphone, e-mail, adresse, horaires, licence.

## Mouvement

Lenis pour le défilement. Un seul moment orchestré au chargement, puis seulement ce qui raconte quelque chose.
- **Chargement** (1,6 s) : la première ligne monte de son masque, le bandeau photo s'ouvre depuis sa ligne d'horizon
  (de 0 à toute sa hauteur, la photo se pose de 1,06 à 1), la fin de la phrase monte, le texte et les boutons
  apparaissent.
- **Cadran** : lié au défilement sur ordinateur (le repère, la date, l'arc) ; la date change par jours entiers.
- **Grandes photos** : elles s'ouvrent une fois, de bas en haut, en entrant à l'écran ; les petites ne bougent pas.
- **Titres de section** : leurs lignes montent une fois de leur masque. Les paragraphes ne bougent pas.
- **Survols** : soulignés qui se tracent, photo de la prestation qui apparaît, bouton qui s'inverse. Rien ne flotte,
  rien ne suit la souris, pas de curseur rond.
- **Mouvement réduit** : pas de Lenis, rien n'anime, le cadran est montré entier et fixe.
- Courbe : `cubic-bezier(.2, .7, .1, 1)` ; 0,7 à 1,1 s pour les ouvertures, 0,25 s pour les survols.

## Photos

Seulement leurs vraies photos (voir ANALYSE.md), jamais agrandies : chaque image est servie au plus à sa taille
d'origine, en AVIF, en plusieurs largeurs. Les recadrages (bandeau, gros plans) sont pris dans les fichiers à 2500 px et
affichés plus petits que leur taille réelle. Légendes : la pièce, et le lieu seulement quand leur site le donne (la
maison neuve au bord de l'eau, la cuisine d'extérieur de Gulf Shore Drive). Le portrait des propriétaires sans nom.

## Textes

En anglais, pour des propriétaires américains. Leurs phrases quand elles sont bonnes (« The people who show up. Every
single day. », « Adding pop is what we do best. », « Ready for the inside view to match the outside view! »), raccourcies
quand elles sont longues, jamais de promesse qu'ils ne font pas : pas de garantie inventée, pas de délai autre que le
leur, pas de chiffre autre que les leurs (2001, 100 000 $ à plus de 7 000 000 $, mai, 1er octobre).

## Relecture du plan face au brief

Ce que j'ai changé en relisant, parce que c'était le réflexe de n'importe quel site semblable :
- **L'accueil** était d'abord une photo plein écran avec le titre posé dessus : c'est le modèle de tous les
  constructeurs. Remplacé par la phrase coupée par le bandeau photo, qui fait lire en Z.
- **La « méthode en quatre étapes numérotées »** (01 Consultation, 02 Design…) : remplacée par les quatre temps réels de
  leur année, datés, sur un cadran qui sait quel jour on est.
- **Le carrousel d'avis** : supprimé ; les sept avis sont posés là où ils prouvent quelque chose (le 1er octobre, les
  photos d'avancement, les détails).
- **Une première idée de palette** (vert d'eau pâle et sarcelle profonde) ressemblait à celle d'Ehlers : remplacée par
  le noir et blanc de leur logo, avec la seule couleur de leur piscine.
- **Une première idée de révélation** (des cases du calendrier qui découvrent une photo) rappelait la mosaïque de Petri,
  et des cadres qui s'agrandissent rappelaient Florida South : abandonnées.

Déjà utilisé ailleurs et évité ici : l'enseigne sur la façade (Castor), le jour et la nuit (Prestige), le cadre du logo
(Hideout), le cordeau et les plans (Ehlers), le toit couche par couche, les rangs de tuiles et la carte (Mendieta), la
mosaïque (Petri), la lumière et l'ombre (One Place), le nom épinglé, la fenêtre en arc et le bloc gris (Skoda), le toit
de mots, la pente et la règle (Five Points), la liste barrée et les cadres qui s'ouvrent (Florida South) ; et toutes les
polices déjà prises.
