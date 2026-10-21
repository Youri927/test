# Stellar Living Homes : direction artistique

## Le sujet, le public, le but

Une petite entreprise générale de Naples, fondée en 2014, qui rénove surtout des condos et des maisons (cuisines,
salles de bain, logements entiers), construit des maisons neuves, répare après les ouragans et pose des cages de
piscine. Ses clients sont des propriétaires de Naples, souvent retraités, dans des condos de Pelican Bay, Park Shore ou
Bay Colony et des maisons de golf. Le site a un seul travail : qu'ils demandent une estimation gratuite (ou qu'ils
appellent).

Ce qu'ils ont de plus fort ne vient pas d'eux :
- **les mots de leurs clients** : douze avis longs et précis (« more than 5 stars », « careful to protect our floors »,
  « cleaned everyday », « on time and on budget » trois fois, « the customer's advocate », « better and cheaper and the
  architect always agreed ») ;
- **leurs photos de fin de chantier**, prises au téléphone en faisant le tour du logement : 25 photos d'un condo de
  Breakwater entre 10 h 38 et 10 h 45 le 3 novembre 2025, pièce après pièce ; le club-house en 90 secondes.

## L'idée : « ce qui compte ressort »

Une seule figure, appliquée partout : **le pâle et l'encre**. Le texte d'un client est posé en grand ; les mots qui
comptent sont à l'encre (le bleu de leur logo), le reste s'efface en gris-bleu pâle, sans disparaître (on peut tout
lire). C'est la façon dont on lit un avis : en diagonale, en retenant trois mots.

Elle sert trois fois, déclenchée trois fois différemment :
1. **À l'ouverture** : l'avis de Scott D. (« Wish we could give Dominic more than 5 stars… ») monte ligne par ligne,
   tout en pâle ; puis, l'un après l'autre, « more than 5 stars », « attention to detail », « protect our floors »,
   « cleaned everyday » passent à l'encre. Lu seul, ce qui ressort résume l'entreprise. C'est le seul moment qui se joue
   sans qu'on fasse rien.
2. **Dans la visite** (au défilement) : la liste des pièces et de leurs heures reste pâle, la pièce où l'on est passe à
   l'encre (en blanc sur le fond sombre) et la grande heure change (10:38, 10:39… 10:45).
3. **Dans les avis** (au clic) : on choisit un sujet (le temps et le budget, le soin de la maison, les échanges, les
   conseils, les ouragans, ceux qui reviennent) ; dans les douze avis, les passages qui en parlent ressortent, soulignés,
   et le reste pâlit. « 4 avis sur 12 en parlent. » Les prestations renvoient à ces sujets : « Storm repairs » ouvre les
   avis sur les ouragans.

### La visite : « Seven minutes in a finished condo »
Les photos de Breakwater dans l'ordre où elles ont été prises, avec leur heure (lue dans les fichiers, pas inventée) :
la cuisine, le coin repas, le mur de cuisson, l'évier de l'îlot, l'entrée, le lanai, la salle de bain, la douche, son sol
en mosaïque. Sur ordinateur, la section se fige à l'écran et la rangée de photos avance de droite à gauche quand on
descend : on avance dans l'appartement. Sur téléphone, la même rangée se parcourt au doigt. Un bouton ouvre les 24
photos de ce passage (la 25e de leur page, un placard photographié en mars 2026, n'est pas de cette visite).

### Les autres preuves, sans adjectifs
- « Five homes at Breakwater, and the clubhouse » : six des projets de leur liste sont dans la même communauté de Pelican
  Bay. Les photos le disent mieux qu'un slogan.
- Les autres chantiers (Trieste à Bay Colony, Hidden Lakes à Park Shore, Imperial Golf Club, Gulf Tower, Pistoia à
  Talis Park, les cages de piscine), chacun avec sa date.
- La licence de l'État, avec le lien pour la vérifier.

## Couleurs

Celles du logo, tenues : le bleu marine pour tout ce qui se lit, l'olive en touche, beaucoup de blanc (le blanc de leurs
cuisines).

| Nom | Hex | Rôle |
|---|---|---|
| Paper | `#FFFFFF` | fond |
| Ink | `#2A5472` | le bleu du logo : titres, texte, boutons (8 : 1 sur blanc) |
| Haze | `#8494A4` | les mots qui s'effacent, seulement en grand (3 : 1 sur blanc, au-dessus du minimum des grands textes) |
| Slate | `#55687A` | textes secondaires, légendes |
| Deep | `#11283B` | la visite, le formulaire, le pied de page : le bleu du logo, très assombri |
| Olive | `#909C42` | l'olive du logo : le soulignement des passages, le repère de la pièce en cours, le focus sur fond sombre. Jamais du texte |
| Mist | `#EEF2F4` | fond des avis et de l'entreprise |

Pas de crème, pas de terre cuite, pas de dégradé, pas d'ombre portée, pas d'or « luxe ».

## Typographie

- **Imbue** (Tyler Finck, Etcetera Type Co, OFL), didone étroit, variable en graisse et en taille optique. Ses hautes
  lettres serrées vont aux photos en hauteur (toutes leurs photos sont en portrait) et aux tours de Naples ; ses
  empattements fins répondent aux romaines du monogramme SLH sans le copier. Avis mis en avant, titres, heures de la
  visite, noms des lieux, numéro de téléphone. Graisse 250 à 320, taille optique automatique, interlignage 0,95 à 1,05.
- **Zalando Sans** (2025, OFL), linéale nette et ouverte : texte, interface, légendes, formulaire. 400 pour le texte,
  550 pour l'interface. Bien lisible pour un public de plus de 60 ans.

Échelle en quarte juste (1,333), en `clamp()` du téléphone à l'écran large : 13,5 · 15 · 18 (texte, 17 sur téléphone)
· 24 · 32 · 43 · 57 · 76 · 101 · 135. Lignes de texte de 55 à 70 signes. Pas de capitales espacées (sauf dans le logo,
qui est le leur), pas de mot isolé en couleur ou en italique dans un titre, pas de numérotation 01/02/03 (les seules
marques de suite sont les heures de la visite, qui sont une vraie suite), pas de flèche ajoutée aux liens, pas de police
à chasse fixe, pas de points médians entre les mots.

## Mise en page

Grille de 12 colonnes, 1440 px au plus, marges de 20 px (téléphone), 40 px (tablette), 64 px (ordinateur). Tout est aligné
à gauche. Les photos en portrait donnent le rythme : hautes, serrées, jamais recadrées en bandeau quand elles ne le
supportent pas.

```
ACCUEIL
 [SLH] STELLAR LIVING HOMES        Work  Reviews  Services  About     908-507-2088  [Free estimate]
 A general contractor for condos and homes in Naples, Florida.          ┌──────────────┐
 “Wish we could give Dominic more than 5 stars. … His attention          │              │
  to detail and his expectation of his workers is at the highest        │  la cuisine   │
  level. He was very careful to protect our floors during               │  de Breakwater│
  construction and his workers made sure our home was cleaned           │  (3:4)        │
  everyday upon leaving.”                                    Scott D.   └──────────────┘
 Kitchens, baths and whole condos. Custom homes. Storm repairs.          Kitchen, Breakwater,
 Screen enclosures.     [Get a free estimate]   Call 908-507-2088        Pelican Bay. Nov 2024

LA VISITE (fond Deep, figée à l'écran sur ordinateur)
 Seven minutes in a               ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌──      ← la rangée avance
 finished condo.                  │    │ │    │ │    │ │    │ │           quand on descend
 10:41                            └────┘ └────┘ └────┘ └────┘ └──
 Cooktop wall                     10:38   10:39  10:41  10:43
 (les neuf pièces, la courante à l'encre)          [See all 25 photos]

BREAKWATER : six photos hautes en 3 × 2, chacune ouvre son reportage ; puis les autres chantiers, en paires.
AVIS (fond Mist) : les sujets en boutons, les douze avis en trois colonnes, en Imbue.
PRESTATIONS : six lignes (nom en Imbue, une phrase, un lien vers la preuve : visite, photos ou avis).
ENTREPRISE (fond Mist) : 2014, Naples, 38 ans de métier, la phrase de John T. sur les sous-traitants, la licence.
CONTACT (fond Deep) : le formulaire et, à côté, le téléphone en grand, l'e-mail, le bureau.
```

## Mouvement

Lenis pour le défilement. Courbe `cubic-bezier(.2, .7, .1, 1)` ; 0,8 à 1,1 s pour les ouvertures, 0,25 s pour les
survols.
- **Ouverture** (une fois, 2 s) : la photo se découvre de bas en haut (de 1,06 à 1), les lignes de l'avis montent de
  leur masque en pâle, les quatre passages passent à l'encre l'un après l'autre, les boutons apparaissent.
- **La visite** : liée au défilement sur ordinateur (la rangée, l'heure, la pièce) ; au doigt sur téléphone.
- **Grandes photos et grands titres** : ils s'ouvrent ou montent une fois en entrant à l'écran. Les paragraphes et les
  petits éléments ne bougent pas.
- **Avis** : le passage du pâle à l'encre, 0,35 s, au clic sur un sujet.
- **Survols** : soulignés qui se tracent, boutons qui s'inversent. Rien ne flotte, rien ne suit la souris, pas de
  curseur rond.
- **Mouvement réduit** : pas de Lenis, rien n'anime, la visite devient une rangée qu'on fait défiler, l'avis de
  l'ouverture s'affiche déjà lu.

## Photos

Seulement les leurs (voir ANALYSE.md) : jamais agrandies, servies au plus à leur taille d'origine, en AVIF, en plusieurs
largeurs. Les légendes disent la pièce, le lieu tel qu'ils le nomment (« Breakwater, Pelican Bay ») et la date de prise de
vue lue dans le fichier. Aucun numéro de logement, aucun nom de client : leurs pages en portent (dans les adresses), le
nouveau site non.

## Textes

En anglais, pour des propriétaires américains. Les avis mot pour mot (fautes comprises : « everyday »), signés comme sur
leur site (prénom et initiale). Leurs phrases quand elles sont bonnes (« FREE estimate », « over 38 years of custom home
building and remodeling experience »), raccourcies quand elles sont longues. Aucun adjectif de notre cru : pas de
« luxury », « premier », « best-in-class » ; les seuls compliments sont entre guillemets.

## Relecture du plan face au brief

Ce que j'ai changé en relisant, parce que c'était le réflexe de n'importe quel site semblable :
- **Une couverture de magazine** pour l'accueil (le mot « Stellar » en titre de journal, des accroches autour d'une
  photo) : abandonnée ; c'est un déguisement, et il imite une presse qui n'a jamais parlé d'eux.
- **Une sixième étoile** pour jouer avec « more than 5 stars » et le nom : abandonnée, trop mignonne.
- **Le carrousel d'avis** (et les composants de 21st.dev qui font défiler une citation à la fois, ou passent un coup de
  surligneur sur une phrase) : remplacé par les douze avis visibles et les sujets qu'on choisit ; le pâle et l'encre à la
  place du surligneur, qui fait feutre.
- **La rangée de chiffres** (2014, 38 ans, 12 avis) : remplacée par une phrase dans la section de l'entreprise.
- **La photo de la prestation qui apparaît au survol** (déjà faite pour Zynda) : remplacée par un lien vers la preuve.
- **Une visite en fondu enchaîné dans un cadre fixe** : c'est un diaporama ; remplacée par la rangée qui avance, plus
  proche d'une visite.
- **Des fenêtres qui s'allument** sur la façade de Breakwater : déjà vu (Prestige, One Place), et inventé ; les six photos
  suffisent.

Déjà utilisé ailleurs et évité ici : l'enseigne sur la façade (Castor), le jour et la nuit (Prestige), le cadre du logo
(Hideout), le cordeau et les plans (Ehlers), le toit couche par couche, les rangs de tuiles et la carte (Mendieta), la
mosaïque (Petri), la lumière et l'ombre (One Place), le nom épinglé, la fenêtre en arc et le bloc gris (Skoda), le toit
de mots, la pente et la règle (Five Points), la liste barrée et les cadres qui s'ouvrent (Florida South), l'accueil en Z
et le cadran (Zynda) ; et toutes les polices déjà prises.

## Les extensions consultées

- **frontend-design** : la méthode (plan, relecture face au brief, critique sur captures).
- **21st.dev** : recherches « testimonials with highlighted phrases », « editorial text highlight », « portrait photo
  gallery ». On y trouve des carrousels de citations, des surligneurs « feutre », des galeries en 3D ou en éventail : rien
  de juste pour ce sujet, et tout en React. Rien n'est repris ; la recherche a confirmé ce qu'il fallait éviter.
- **design:accessibility-review**, **design:ux-copy**, **design:design-critique** : pour les essais et la relecture
  (ACCESSIBILITE.md, REVUE.md).
- **maquinable-geo:seo-audit** : l'audit du site actuel.
