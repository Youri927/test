# Coastal Creations Pools and Lagoons : nouveau site (React + shadcn/ui)

Refonte complète de https://www.coastalcreationspoolsandlagoons.com, constructeur et rénovateur de piscines à Palmetto (Floride), entre Tampa Bay et Port Charlotte. L'analyse du site actuel est dans `ANALYSE.md`.

**À ouvrir** : `dist/index.html`, d'un double-clic (un seul fichier, sans serveur).

## Pourquoi cette deuxième version

La première version (la cage moustiquaire) gardait le même squelette que nos autres sites de piscinistes :
- une barre de navigation au milieu, avec des boutons en pilule ;
- un très gros titre gras à côté d'une photo ;
- dans chaque section, le titre à gauche et le paragraphe à droite ;
- le bleu nuit et le bleu clair ;
- un contact avec le numéro en très grand.

Celle-ci repart d'une autre base, de la structure jusqu'aux détails :
- **pas de barre de navigation en haut**, mais un en-tête de papier à lettres : leur logo en grand, le numéro, le devis, un bouton Menu. Une fois l'accueil passé, un bandeau fin descend avec le titre de la partie en cours, comme le titre courant d'un livre ;
- **un seul très grand titre**, celui de l'accueil. Les sections ont des titres modestes, et chacune une composition à elle (voir la page, plus bas) ;
- des **typographies légères** (Jost, l'héritière de Futura), en bas de casse ;
- des **boutons carrés**, sans arrondi ;
- du **blanc, du graphite, l'eau du Golfe et un jaune soleil**, au lieu du bleu nuit ;
- un **contact en annuaire**, sur la couleur de l'eau.

## L'idée : le moderne de Sarasota

Leur région est celle de l'école de Sarasota, l'architecture moderne de la côte du Golfe dans les années 1950 : maisons blanches, toits plats, et des claustras, ces murs de blocs ajourés qui laissent passer l'air et la lumière. Le site en tire :
- **l'accueil** : leur piscine de Holmes Beach vue à travers un mur de claustras ronds (joints, chaperon, l'épaisseur des blocs dans l'ombre). En faisant défiler, les ouvertures s'élargissent jusqu'à ce que le mur disparaisse et laisse la piscine ;
- la **police** : Jost, géométrique comme les enseignes de l'époque, en graisse légère pour les titres ;
- les **couleurs** :
  - le blanc des murs ;
  - le graphite des menuiseries ;
  - l'ombre fraîche sous l'avancée du toit (#edf3f1) ;
  - l'eau du Golfe (#0c767e) ;
  - le jaune soleil (#f6c344) pour les actions.

## La page

- **L'accueil** : « Gulf Coast pools, built and rebuilt. », puis le mur de claustras sur leur vidéo de Holmes Beach. Sur téléphone, le mur fait trois blocs de large.
- **Ce qu'ils font, en une phrase** : « We build new pools, bring tired ones back, find leaks from $350 and raise equipment above the storm surge, across ten counties… ». Chaque morceau mène à sa partie. Dessous :
  - le devis gratuit et la détection de fuites (leurs deux formulaires Jobber) ;
  - la licence, le BBB A+ ;
  - le reste de leur liste, et ce qu'ils ne font pas (l'entretien hebdomadaire).
- **Onze étapes, six à douze semaines** : une rangée de chantier qui défile de côté, au doigt, à la souris (on attrape et on tire), au clavier ou avec les flèches. Le titre ouvre la rangée ; un filet dessous indique l'étape en cours. Les photos viennent de leur construction neuve au bord d'un canal, à Bradenton, et de leur page Build Process.
- **Renovations, photographed on the job** : leurs chantiers, composés comme des tirages posés sur la table :
  - Holmes Beach, où le titre de la partie rejoint le chantier ;
  - le comté de Manatee en trois dates (20 mai, 4 et 8 juin 2026) ;
  - Port Charlotte, la piscine commerciale ;
  - Brandon, avec sa vidéo.
  Puis leurs six enduits Stonescapes : on pointe un nom, le nuancier du fabricant change.
- **Find it. Fix it. Done right.** : leurs tarifs de détection de fuites en blanc sur un panneau graphite, comme une enseigne. Ils étaient enfermés dans une image sur l'ancien site. Suivent :
  - le calcul selon la piscine, avec le total en jaune ;
  - leurs méthodes, les endroits qui fuient, le test du seau ;
  - leur FAQ complète de 15 questions.
- **Equipment above the surge** : une remise en état à Bradenton, en trois photos bord à bord, puis les socles d'équipement surélevés après les ouragans de 2024.
- **We won't stop until it's right.** : leur devise, Owen Kay et Alberto Labrada. Les règles de l'équipe et les années de métier tiennent en deux phrases. Leurs licences suivent, chacune avec de quoi la vérifier.
- **Ten counties, Citrus to Charlotte** : leurs dix comtés et leurs villes, en un seul texte courant.
- **Let's build your backyard paradise.** (leur phrase), sur la couleur de l'eau : un annuaire, une ligne par façon de les joindre :
  - appel ou SMS, au même numéro ;
  - devis, détection de fuites, financement Lyon ;
  - seconde ligne, e-mail, ville.
  Le pied de page suit, sur la même couleur, avec leur logo.

**Sur téléphone et tablette** : une barre en bas (Menu, Appeler, SMS, Devis) apparaît une fois l'accueil passé et se cache au contact, qui offre les mêmes choix.

**Mouvement** : un seul moment orchestré, le mur qui s'ouvre au défilement. Le reste répond à ce que fait le visiteur :
- le bandeau du haut descend une fois l'accueil passé ;
- les tirages des rénovations se posent en entrant à l'écran ;
- le total du calcul défile jusqu'à sa nouvelle valeur ;
- le nuancier change en fondu ;
- les liens se surlignent en jaune au survol.

Avec « réduire les animations », il n'y a pas de mur : la vidéo attend qu'on la lance, les tirages sont posés d'emblée. Si le script ne démarrait pas, la page s'affiche quand même au bout de 4 secondes, sans animation.

**Composants** :
- **shadcn/ui** : l'accordéon de la FAQ et le panneau du menu (primitives Radix) ;
- **21st.dev** : regardé. Son « Hover Expand Gallery » servait aux nuanciers de la première version ; il n'est plus utilisé ;
- **Facade UI** : regardé, mais ses sections (cartes, grilles de fonctionnalités) sont justement le gabarit à éviter ;
- **fait pour ce site** : le mur de claustras, l'en-tête et son titre courant, la rangée de chantier, les tirages, le panneau des prix et son calcul, l'annuaire du contact.

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

- `npm run build` : `dist/index.html`, un seul fichier avec tout dedans (7,4 Mo, vidéos comprises).
- `npm run build:web` : version de production dans `dist-web/`. Le HTML est pré-rendu, les styles sont dans la page, et les photos, vidéos et police sont en fichiers séparés. La police et l'image d'attente de la vidéo d'accueil sont préchargées. Les grandes photos ont une version allégée pour les téléphones.
- **Netlify** : `npm run build:web`, puis glisser le dossier `dist-web/` sur https://app.netlify.com/drop. Le fichier `public/_headers` y est copié : cache d'un an pour les fichiers versionnés, et `noindex` tant que c'est une maquette (à retirer à la mise en ligne).
- **Vercel** : `vercel.json` lance `npm run build:web` et sert `dist-web/`.
- `python3 tools/images.py <dossier des originaux>` : les photos en AVIF (et leurs versions allégées), d'après `data/photos.json`.
- `python3 -I tools/logo.py <logo d'origine> src/assets/brand` : leur logo sans son fond bleu nuit. Deux versions sortent : `logo.avif` pour les fonds sombres (le pied de page), et `logo-light.avif`, avec « CREATIONS » en bleu nuit, pour les fonds clairs (l'en-tête).
- `python3 -I tools/boards.py <captures> <image de tarifs> <dossier des TTF>` : les planches de présentation de `boards/`, en anglais pour le client (voir l'en-tête du script).
- Les vidéos :
  - Holmes Beach : 1280 × 720, 24 images/s, débruitée (2,1 Mo) ;
  - Brandon : 540 × 960 (0,6 Mo).

## Mesures

Lighthouse 12, nouveau site servi en local et compressé comme sur Netlify, le 9 octobre 2026. Le site actuel ne peut pas être mesuré de la même façon : il est derrière une vérification Cloudflare qui bloque les navigateurs automatisés.

| | Téléphone (médiane de 3) | Ordinateur |
|---|---|---|
| Performance | 96 | 100 |
| Accessibilité | 100 | 100 |
| Bonnes pratiques | 100 | 100 |
| Référencement | 100 | 100 |
| Affichage principal (LCP) | 2,7 s | 0,6 s |
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
