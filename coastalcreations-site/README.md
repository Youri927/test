# Coastal Creations Pools and Lagoons : nouveau site (React + shadcn/ui)

Refonte complète de https://www.coastalcreationspoolsandlagoons.com, constructeur et rénovateur de piscines à Palmetto (Floride), entre Tampa Bay et Port Charlotte. L'analyse du site actuel est dans `ANALYSE.md`.

**À ouvrir** : `dist/index.html`, d'un double-clic (un seul fichier, sans serveur).

## L'idée : la cage

En Floride, presque chaque piscine vit sous une cage moustiquaire, une charpente d'aluminium tendue de toile. Leurs propres photos le montrent : les montants blancs au-dessus de l'eau, leur ombre en quadrillage sur le fond du bassin. Le nouveau site en fait son mouvement :

- **chaque photo se découvre panneau par panneau**, en diagonale, avec les montants blancs qui restent un instant puis s'effacent ;
- **les étapes de construction se montent comme une cage** : en faisant défiler, chaque nouvelle photo glisse panneau par panneau par-dessus la précédente ;
- le fond de l'accueil est le **bleu poudré de l'enduit frais** avant la mise en eau (leurs photos de chantier), le texte le **bleu nuit du logo**, les accents l'**aqua de ses vagues** et le **cobalt de la mosaïque de verre** ;
- les titres sont en **Archivo très large et très gras**, comme le « CREATIONS » du logo ; le texte en largeur normale, les dates et légendes en largeur étroite, comme sur un plan.

## La page

- **L'accueil** : « Pools built and rebuilt on the Gulf Coast. » ; leur vidéo de la location de Holmes Beach, qui se découvre panneau par panneau ; le devis gratuit et la détection de fuites (leurs deux formulaires Jobber) ; la licence, le BBB A+ et le numéro qui prend les SMS, dès le premier écran. Sur téléphone, la vidéo vient juste sous le titre.
- **Built / Rebuilt** : les deux mots du titre, en très grand, coiffent chacun leur famille de services ; le reste de leur liste (pavés, gaz, grottes, paillotes…) et la phrase « pas d'entretien hebdomadaire ».
- **Onze étapes, six à douze semaines** : leur page Build Process ; sur ordinateur, la section reste à l'écran pendant le défilement, l'étape en cours s'ouvre dans la liste et sa photo se monte panneau par panneau. Les photos viennent de leur construction neuve au bord d'un canal, à Bradenton, et de leur page Build Process.
- **Before, during, after** : leurs chantiers réels, photo par photo :
  - Holmes Beach (location de vacances) : avant, puis nouveau carrelage et nouvel enduit ;
  - comté de Manatee, sous cage : 20 mai, 4 juin et 8 juin 2026 (les dates de leurs photos) ;
  - Port Charlotte (piscine commerciale) : avant, puis nouvel enduit ;
  - Brandon : pendant la rénovation, puis la vidéo de la piscine terminée (avril 2026).
- **Choosing your pool finish** : leurs six enduits Stonescapes dans une rangée de nuanciers ; celui qu'on survole, touche ou atteint au clavier s'ouvre en entier, du rebord au grand fond ; leur explication de la couleur de l'eau (cage, profondeur, heure, saison) ; le carrelage Luv Tile et Aquabella.
- **Find it. Fix it. Done right.** (fond bleu nuit) : leurs tarifs de détection de fuites, enfermés dans une image sur l'ancien site, écrits en clair et calculés (piscine seule ou avec spa, jeux d'eau, buses de nettoyage au fond, petites réparations à l'époxy incluses) ; leurs méthodes, les endroits qui fuient, le test du seau, et leur FAQ complète de 15 questions.
- **Equipment above the surge** : les socles d'équipement surélevés après les ouragans de 2024, et une remise en état à Bradenton, du vert au bleu.
- **We won't stop until it's right.** : leur devise, Owen Kay et Alberto Labrada, les règles de l'équipe, les années de métier des associés (1986, 2011, 2020, 2021), la création de la société (2023) et l'accréditation BBB (2026) ; les licences écrites en grand, avec de quoi les vérifier.
- **Ten counties, Citrus to Charlotte** : leurs dix comtés du nord au sud, avec les villes de leurs pages.
- **Let's build your backyard paradise.** (leur phrase) : le numéro en très grand (appel ou SMS), le second numéro, l'e-mail, leurs deux formulaires, le financement Lyon Financial ; le pied de page avec leur logo, détouré de son fond.

**Mouvement** : défilement fluide (Lenis) et animations liées au défilement (GSAP ScrollTrigger) :
- à l'ouverture, le titre monte ligne par ligne et la vidéo se découvre panneau par panneau ;
- en quittant l'accueil, la vidéo se resserre et le titre file plus vite que la page ;
- « Built » et « Rebuilt » glissent légèrement en sens contraire ;
- les étapes de construction : la section reste en place, les photos se montent en cage, l'étape en cours s'ouvre ;
- chaque photo de chantier se découvre en entrant à l'écran, les photos d'une même rangée l'une après l'autre ;
- le calculateur de fuites fait défiler son total ; la frise des années se trace ; le menu souligne le chapitre en cours ;
- l'en-tête devient blanc au défilement, se cache quand on descend et revient quand on remonte.

Tout est coupé avec « réduire les animations » : les photos sont là d'emblée, les étapes s'affichent l'une sous l'autre, la vidéo de Brandon attend qu'on la lance. Si le script ne démarrait pas, la page s'affiche quand même au bout de 4 secondes, sans animation.

**Composants** :
- shadcn/ui : l'accordéon de la FAQ et le panneau du menu sur téléphone (primitives Radix) ;
- 21st.dev : la rangée de nuanciers est adaptée de « Hover Expand Gallery » (kedhareswer) : panneaux fermés qui montrent la teinte du grand fond, nuancier entier à l'ouverture, une seule légende ; le dévoilement en cage s'inspire de « Shutter Reveal » ;
- Facade UI a été regardé : ses sections (cartes, grilles de fonctionnalités) auraient rendu le site générique, il n'est pas utilisé ;
- le reste est fait pour ce site : la cage, les étapes épinglées, le calculateur, les rangées de photos datées.

## Rien d'inventé

- **Textes** : leurs pages (accueil, services, Build Process, détection de fuites et FAQ, couleurs d'enduit, carrelage, tempêtes, équipement, rénovations commerciales, comtés, financement, à propos), raccourcis ou reformulés.
- **Photos et vidéos** : les leurs, tirées de leur médiathèque Wix. Les nuanciers sont des visuels du fabricant Stonescapes, présentés comme tels.
- **Vérifié** : la licence CPC1461058 est active (registre des licences de Floride, relevé du 4 octobre 2026) ; l'accréditation BBB A+ depuis le 22 avril 2026 (bbb.org).
- **Écarté** :
  - les images générées présentées comme des chantiers (l'« après » de la rénovation résidentielle est un fichier « ChatGPT Image », celui de St. Pete un fichier « Designer », qui ne correspond pas à son « avant ») ;
  - les deux photos de la page À propos au format typique des images générées, l'affiche de détection de fuites, la carte des comtés et les boutons en images ;
  - les trois témoignages de modèle Wix (l'un remercie « America's Home Services » pour une peinture de maison) ;
  - les photos d'un autre compte Wix sur la page de financement et la photo produit d'une pompe à chaleur ;
  - les notes Angi et Google, faute de pouvoir les vérifier : le site renvoie vers les deux pages, sans chiffre.
- **Corrigé** : « Gaurantee », « Coastal Creational », « Sumpter », « Citus », « sourrounding », « Equipoment », « Lightening », « Bradneton », le mot russe de la page des enduits et « Steps 1-9 » au-dessus de 11 étapes.

## Fabrication

- `npm run build` : `dist/index.html`, un seul fichier avec tout dedans (7,6 Mo, vidéos comprises).
- `npm run build:web` : version de production dans `dist-web/` (HTML pré-rendu, styles dans la page, photos, vidéos et police en fichiers séparés ; la police et l'image d'attente de la vidéo d'accueil sont préchargées ; les grandes photos ont une version allégée pour les téléphones).
- **Netlify** : `npm run build:web`, puis glisser le dossier `dist-web/` sur https://app.netlify.com/drop. Le fichier `public/_headers` y est copié : cache d'un an pour les fichiers versionnés, et `noindex` tant que c'est une maquette (à retirer à la mise en ligne).
- **Vercel** : `vercel.json` lance `npm run build:web` et sert `dist-web/`.
- `python3 tools/images.py <dossier des originaux>` : les photos en AVIF (et leurs versions allégées), d'après `data/photos.json`.
- `python3 -I tools/logo.py <logo d'origine> src/assets/brand/logo.avif` : leur logo sans son fond bleu nuit.
- `python3 -I tools/boards.py <captures> <image de tarifs> <dossier des TTF>` : les planches de présentation de `boards/`, en anglais pour le client (voir l'en-tête du script).
- Les vidéos : celle de Holmes Beach en 1280 × 720, 24 images/s, débruitée (2,1 Mo) ; celle de Brandon en 540 × 960 (0,6 Mo).

## Mesures

Lighthouse 12, nouveau site servi en local et compressé comme sur Netlify, le 9 octobre 2026. Le site actuel ne peut pas être mesuré de la même façon : il est derrière une vérification Cloudflare qui bloque les navigateurs automatisés.

| | Téléphone (médiane de 3) | Ordinateur |
|---|---|---|
| Performance | 92 | 100 |
| Accessibilité | 100 | 100 |
| Bonnes pratiques | 100 | 100 |
| Référencement | 100 | 100 |
| Affichage principal (LCP) | 3,1 s | 0,7 s |
| Blocage pendant le chargement (TBT) | 0,09 s | 0,01 s |
| Décalages de mise en page (CLS) | 0 | 0 |

Sur téléphone, la vidéo de l'accueil (2,1 Mo) se charge au démarrage. Les planches de `boards/` reprennent ces chiffres.

## À confirmer avec Coastal Creations

- **Angi** : une capture sur leur page de financement montre « 5.0 (6) » ; la page Angi refuse les outils automatiques. À vérifier avant de l'afficher.
- **Aqua White** : leur page lui donne la teinte « Medium Blue », qui semble être une erreur ; le site n'affiche pas de teinte pour celui-ci.
- **« Gondolas »** dans leur liste de services : peu clair, non repris.
- **LinkedIn** : leur lien mène au profil personnel de Renee Hall, pas à une page de l'entreprise ; non repris.
- **Les photos de chantier** : l'excavation et la pose des pavés (page Build Process) sont-elles de la même construction de Bradenton ? Les légendes ne le disent pas. À Brandon, la photo du spa et la vidéo sont-elles la même piscine (leur page les montre ensemble) ?
- **St. Pete et la rénovation résidentielle** : de vraies photos « après » remplaceraient les images générées de l'ancien site.
- **Les avis** : de vrais avis (Google, avec l'accord des clients) pourront remplacer les témoignages de modèle.
- **La certification CPO** F4AH6JX : au nom d'Owen Kay ? Le site l'affiche sans nom.
- **Hardee et DeSoto** : aucune ville citée sur leurs pages.
- **L'assurance** : leur site écrit « Licensed & Insured » à côté de LI45304, qui est leur licence gaz ; une attestation d'assurance pourrait être citée.
- **Les formulaires** : le site renvoie vers leurs deux formulaires Jobber existants, tels quels.
