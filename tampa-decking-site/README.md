# Tampa Decking & Pools : proposition de refonte

Maquette complète du nouveau site de **Tampa Decking & Pools** (tampadeckingandpools.com), en anglais, sur ordinateur et sur mobile.

**À ouvrir** : `dist/index.html`, d'un double-clic, sans serveur ni connexion.
- Un seul fichier de 4,3 Mo : polices, photos et scripts sont dedans.
- L'analyse du site actuel est dans `ANALYSE.md`.
- Les planches de présentation sont dans `boards/`.

## L'idée : « From the deck to the deep end »

Leur métier, ce sont les surfaces autour et dans l'eau : la plage où l'on marche, la margelle, la ligne de carrelage, l'enduit du bassin. Le site se lit de haut en bas, comme on descend de la plage jusqu'au fond du bassin. Les fonds passent du blanc à un bleu d'eau, puis au bleu nuit du « grand bain ».

**L'ouverture**
- Le titre en très grand. « From the deck » est posé sur le blanc ; « to the deep end » passe sur la photo, comme sous la ligne d'eau.
- La photo, un de leurs spas en pierre, monte à l'arrivée comme l'eau qui remplit un bassin.
- Juste dessous : téléphone, devis gratuit, et les faits qui comptent (vétéran, chrétien, famille, 30 ans, réponse sous 24 h).

**La coupe**, le cœur du site
- Un dessin technique du bord d'un bassin : plage, margelle, carrelage de ligne d'eau, enduit, coque, eau.
- Sur ordinateur, la scène reste en place pendant le défilement : le dessin se construit, puis chaque couche s'allume en jaune à son tour.
- En même temps, le dessin se recadre sur la couche et le panneau de droite montre une vraie photo, ce qu'ils proposent pour cette couche et les options (marques de finitions, styles de plage…).
- Sur téléphone et tablette, on touche les couches ou les onglets.

**La suite de la page**
- **Our work** : 15 photos en trois colonnes qui glissent à des vitesses différentes. Chaque photo s'ouvre dans une visionneuse plein écran (flèches du clavier, glissé du doigt).
- **Pick your surface** : huit échantillons découpés dans leurs photos (galets, mosaïque de verre, galets de rivière, travertin, pavés, deux revêtements décoratifs, la rosace). Au survol, l'échantillon s'ouvre ; sur téléphone, on les fait défiler du doigt.
- **What resurfacing costs** : les fourchettes de leur page de prix sur une même échelle, avec des barres et des compteurs.
- **Keep it looking new** : le scellement des pavés en six étapes sur une ligne qui se remplit au défilement, puis le nettoyage haute pression.
- **About** (fond bleu nuit) : le titre se révèle mot à mot. On y trouve ensuite Mark Haskins et sa femme, leur histoire (ils ont commencé par l'entretien de piscines) et les deux avis signés de leur site.
- **Areas** : les 23 villes, et un champ « Do you work in my city? » qui répond tout de suite (il reconnaît aussi « Town and Country » ou « Land O Lakes »).
- **Free estimate** (fond jaune) : un formulaire qui fonctionne, alors que l'actuel affiche du code brut. Il comprend le type de projet, les coordonnées vérifiées, la ville, les détails et le moyen de contact préféré. À côté, les quatre étapes d'un chantier, tirées de leur page Hillsborough.
- Sur téléphone, une barre « Call / Free estimate » suit la page, sauf sur l'ouverture et sur le formulaire.

**Forme**
- **Couleurs du logo** :
  - bleu marine `#04426F` pour le texte ;
  - jaune soleil `#F2D64B` pour les actions et la couche active ;
  - fonds blanc, bleu d'eau `#EEF5F7` et `#DCEBF0`, bleu nuit `#062C48` et `#031D31`.
- **Typographie** : **Mona Sans** (licence OFL), une seule police variable. Les titres sont élargis, le texte est en chasse normale.
- **À éviter, et évité** : italique décoratif, petites étiquettes en capitales, sections numérotées, dégradés, effet verre, titres terminés par un point.

**Animations**
- Uniquement des transformations et des fondus. Défilement fluide (Lenis) synchronisé avec GSAP ScrollTrigger.
- Si le visiteur a réduit les animations sur son appareil :
  - tout s'affiche directement ;
  - rien n'est épinglé ;
  - la coupe se pilote au toucher.

## Rien d'inventé

- **Textes** : repris ou raccourcis depuis leurs pages (accueil, About, services, prix, scellement, zones, page Hillsborough).
  - Les chiffres viennent de chez eux : 30 ans, 1 500 couleurs, 30 % plus frais sous le pied, 2 à 5 jours, 24 à 48 h de séchage, 4 000 à 10 000 $.
  - Les 30 ans sont ceux de l'accueil et d'About ; leurs pages se contredisent (voir `ANALYSE.md`).
- **Avis** : seulement les deux avis signés, Robert Essex (cinq étoiles) et Anthony Sacks. Une seule faute de frappe est corrigée dans le premier (« a pools » devient « a pool »). Les avis génériques des pages par ville ne sont pas repris.
- **Photos** : celles de leur médiathèque, recadrées, sans retouche. Ce qu'on voit sur chaque photo est décrit, sans lieu ni adresse.
  - La galerie de 2022 est présentée sur leur page Gallery comme leur travail.
  - Les photos de 2025 sont des plages refaites et des finitions en galets.
  - Écartées : photos avec le filigrane d'une autre entreprise, images d'autres piscinistes, images de banque, captures d'écran.
  - L'origine de la galerie 2022 reste à confirmer avec eux.
- **Logo** : le leur, agrandi ×2 par super-résolution (EDSR) pour rester net. Le texte blanc de leur version pour fond sombre est passé en bleu marine pour les fonds clairs.
- **Adresse** : seulement « Tampa, FL 33624 ». L'adresse complète n'apparaît que dans une carte Google et pourrait être une boîte postale.
- **Formulaire** : c'est une démonstration, rien n'est envoyé.

## Outils utilisés

- **React 19, TypeScript, Tailwind CSS 4 et shadcn/ui**, à partir de `starter-shadcn/`.
  - Composants shadcn (Radix) pour la mécanique, entièrement redessinés : la visionneuse (Dialog), le menu mobile (Sheet), les champs du formulaire (Input, Label, Textarea), le choix du moyen de contact (RadioGroup de Radix).
- **Catalogues consultés pour la mécanique**, réécrite ici avec GSAP ou en CSS, sans reprendre leur style :
  - « Parallax Scroll » d'Aceternity UI pour les colonnes de la galerie ;
  - « Timeline » d'Aceternity UI pour la ligne du scellement ;
  - « Text Reveal » de Magic UI pour le titre de la famille ;
  - « Hover Expand Gallery » du catalogue 21st.dev pour les échantillons.
- **Context7** : documentation à jour de GSAP (matchMedia, ScrollTrigger).
- **Chrome DevTools** (serveur MCP) : audits Lighthouse et traces de performance, avant et après.
- **Playwright** : 28 vérifications automatiques (voir plus bas).
- **Relecture du code** selon les critères des plugins Code Review (bugs certains, commentaires exacts) et Code Simplifier (plus simple sans changer le comportement).
  - Ces plugins prévoient une pull request GitHub et des sous-agents ; leurs critères ont été appliqués directement.
  - Bugs trouvés par la relecture et les tests, tous corrigés :
    - **Changement de format d'écran** (tablette tournée) : la section « coupe » perdait l'apparition de son introduction et le soulignement du menu.
    - **Ville recherchée** : React effaçait la marque d'apparition de la ville trouvée, qui retombait sur ses voisines.
    - **Ancres** : la hauteur de l'en-tête était décomptée deux fois.
    - **Menu mobile** : un lien restait sans effet tant que le défilement était verrouillé.
  - Simplifications : une seule aide de navigation, des titres découpés sans `innerHTML`, plus de ternaires imbriqués. Après une ancre, le clavier repart de la section atteinte.

## Fabrication

| Fichier | Rôle |
| --- | --- |
| `src/App.tsx`, `src/components/*.tsx` | la page, une section par fichier |
| `src/components/section-drawing.tsx` | la coupe du bord de bassin (SVG en deux calques) |
| `src/data/content.ts` | services, photos, prix, villes, avis, étapes |
| `src/lib/motion.ts` | défilement fluide, apparitions, points de rupture |
| `data/photos.json` | les 31 photos : fichier d'origine, recadrage, largeur |
| `tools/images.py` | export AVIF (2,6 Mo pour les 31 photos) |
| `tools/prerender.mjs` | version de production : HTML pré-généré |
| `tools/boards.py` | planches de présentation |

```
npm install
npm run build        # dist/index.html, le fichier unique à ouvrir d'un double-clic
npm run build:web    # dist-web/, la version de production à mettre en ligne
python3 tools/images.py <dossier des photos d'origine>
python3 tools/boards.py <captures du site actuel> <nouvelles captures> <TTF de Mona Sans>
```

**La version de production** (`npm run build:web`) :
- le HTML de la page est rendu au moment du build, puis React le reprend ;
- la photo d'ouverture et la police sont préchargées ;
- les autres photos se chargent au fur et à mesure.

Le premier écran s'affiche donc sans attendre le JavaScript.

## Vérifié

**Largeurs testées** : 360, 390, 820 × 1180, 1024 × 768, 1280, 1440 et 1920 px.
- Aucun débordement horizontal, aucune erreur JavaScript.
- Testé automatiquement : menu et ancres, menu mobile, couches (onglets, défilement épinglé), visionneuse, échantillons, recherche de ville, validation et envoi du formulaire, barre d'appel mobile.
- Testés aussi : le passage d'un format d'écran à l'autre et le mode « animations réduites ».

**Mesures** (audit Lighthouse mobile, trace de performance Chrome en 4G rapide avec un processeur 4× plus lent) :

| | Site actuel | Nouvelle version (production) |
| --- | --- | --- |
| Accessibilité | 89 | 100 |
| Bonnes pratiques | 96 | 100 |
| Référencement | 85 | 100 |
| Premier écran (LCP) sur mobile | 0,85 s | 0,67 s |
| Décalage de mise en page (CLS) | 0,02 | 0 |

**Fluidité** : mesurée ici en rendu logiciel, sans carte graphique.
- **Le code ne bloque pas le navigateur.** Les rares tâches longues relevées viennent de l'émulateur graphique de la machine de test.
- **Images par seconde** :
  - la plupart des sections tournent à 60 images par seconde ;
  - la section épinglée tient 61 images par seconde à l'arrêt comme en défilant, et 53 pendant un changement de couche ;
  - la construction du dessin, jouée une fois à l'arrivée, est le moment le plus chargé.
- **À vérifier sur un vrai téléphone et un vrai ordinateur.**

## À fournir par l'entreprise pour aller plus loin

- La confirmation que les photos de la galerie 2022 sont les leurs, et des photos récentes de chantiers, idéalement avant / après.
- Le nombre exact d'années d'activité, le numéro de licence s'il existe, l'attestation d'assurance.
- L'adresse à afficher, ou non.
- Des avis Google, avec l'accord de leurs auteurs.
- La liste des finitions qu'ils posent réellement.
- Une adresse d'envoi pour le formulaire (e-mail ou outil de suivi des demandes).
