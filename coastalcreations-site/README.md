# Coastal Creations Pools and Lagoons : nouveau site (v3)

Refonte complète de https://www.coastalcreationspoolsandlagoons.com, constructeur et rénovateur de piscines à Palmetto (Floride), entre Tampa Bay et Port Charlotte. L'analyse du site actuel est dans `ANALYSE.md`.

- **À ouvrir** : `dist/index.html`, d'un double-clic (un seul fichier, sans serveur).
- **À mettre en ligne** : le dossier `dist-web/`.

## Pourquoi cette troisième version

Les deux premières versions étaient faites avec React, shadcn/ui et des bibliothèques de composants (21st.dev, Facade UI). Le résultat ressemblait trop à un modèle, et moins bien que nos sites d'avant.

Celle-ci revient à la méthode de ces sites-là (Scottsdale, WAVE, Frontline, Paradise) :
- du HTML, du CSS et du JavaScript écrits pour ce site ;
- GSAP et ScrollTrigger pour les animations au défilement, Lenis pour le défilement doux ;
- un script, `build.mjs`, qui assemble le tout ;
- aucun composant tout fait, aucune bibliothèque d'interface.

La direction est franche et colorée : les couleurs de l'eau du Golfe, une typographie qui a du caractère, leurs vraies photos partout, et des animations au défilement plus riches, qui suivent toutes le même rythme.

## La direction

- **Couleurs** :
  - l'encre, un bleu canard très sombre (#052a30), pour les fonds sombres et le texte ;
  - le bleu profond (#0a3c44) ;
  - l'aqua de l'eau de piscine (#35c4cc), pour la partie fuites ;
  - le sable (#f4eee4), pour les fonds clairs ;
  - le corail (#ff6a4c), pour les boutons d'action et le contact. Les petits textes corail passent en #b33a1b, lisible sur le sable.
- **Typographies** : Unbounded pour les titres, large et ronde, très lisible en grand ; Figtree pour le texte. Ce sont deux polices variables libres (licence OFL), intégrées au site.
- **Formes** : boutons en pilule, dont le fond glisse au survol ; coins arrondis sur les photos et les cartes.

## La page

- **L'accueil** : leur deuxième construction de Bradenton en plein écran, une photo nette en pleine résolution : l'eau claire, la plage en pavés multicolores, la piscine entière. Par-dessus, le titre « Gulf Coast pools, built and rebuilt. », le devis gratuit, l'appel et le SMS. Sur téléphone, la même photo est recadrée sur l'eau et l'angle de la plage.
- **Ce qu'ils font, en une phrase** : « We build new pools, bring tired ones back, find leaks from $350 and raise equipment above the storm surge, across ten counties of the Gulf Coast. » Les mots s'allument au fil de la lecture. Dessous, quatre chiffres qui défilent :
  - 50 ans de métier à deux associés ;
  - 10 comtés ;
  - A+ au BBB ;
  - la garantie de satisfaction à 100 %.
- **Four things we do well** : quatre grandes cartes qui s'empilent en défilant, chacune avec une de leurs photos :
  - la construction ;
  - la rénovation ;
  - la détection de fuites, avec « $350 » en très grand ;
  - les tempêtes et l'équipement.

  Dessous, le reste de leur liste, et ce qu'ils ne font pas : l'entretien hebdomadaire.
- **Eleven steps. Six to twelve weeks.** : sur ordinateur, l'écran reste en place pendant que le chantier avance, en sept étapes :
  - plan ;
  - terrassement ;
  - ferraillage ;
  - coque gunite ;
  - carrelage et plage ;
  - enduit ;
  - mise en eau.

  Le compteur (01–02, 03… sur 11) et une barre suivent. Chaque étape a une photo : leur construction de Bradenton, et un plan d'ingénieur de leur page Build Process. Sur téléphone, les étapes se suivent, chacune avec sa photo.
- **Before. After.** : les deux mots glissent en sens contraire. Suivent leurs chantiers :
  - Holmes Beach : l'après en grand, qui s'ouvre, et l'avant à côté, qui dérive ;
  - Port Charlotte, la piscine commerciale ;
  - le comté de Manatee en trois dates (20 mai, 4 juin et 8 juin 2026) ;
  - Brandon, avec sa vidéo (terminée en avril 2026).
- **Pick your water color.** : leurs six enduits Stonescapes. On choisit un nom, et le nuancier du fabricant change.
- **Find it. Fix it. Done right.**, sur l'aqua :
  - leurs tarifs de détection de fuites en très grand (350 $, 450 $, +50 $, +20 $), qui étaient enfermés dans une image sur l'ancien site ;
  - le calcul selon la piscine (spa, jeux d'eau, buses de nettoyage), avec le bouton de réservation vers leur formulaire Jobber ;
  - leurs méthodes ;
  - leur FAQ complète de 15 questions.
- **From green to blue.** : leur remise en état à Bradenton, en trois photos qui se dévoilent dans l'ordre. Puis les équipements surélevés au-dessus de la marée de tempête, après les ouragans de 2024.
- **We won't stop until it's right.** : leur devise, Owen Kay et Alberto Labrada. Viennent ensuite :
  - leurs règles sur chaque chantier ;
  - leurs années de métier (1986–2026) ;
  - leurs licences, chacune avec de quoi la vérifier.
- **Ten counties, Citrus to Charlotte.** : leurs villes qui défilent, puis les dix comtés avec leurs villes.
- **Let's build your backyard paradise.** (leur phrase), sur le corail :
  - le numéro en très grand, pour un appel ou un SMS ;
  - leurs deux formulaires et le financement Lyon ;
  - la seconde ligne, l'e-mail et Palmetto.

  Le pied de page suit, avec « Coastal Creations » en très grand.

**Sur téléphone** : une barre en bas (Appeler, SMS, Devis gratuit) apparaît une fois l'accueil passé, et s'efface au contact. Le menu s'ouvre en plein écran.

**Mouvement** : tout est lié au défilement.
- à l'ouverture, la photo de l'accueil se pose et le titre monte un peu ; au défilement, la photo glisse moins vite que la page ;
- les titres qui montent ligne par ligne, la phrase d'introduction qui s'allume mot à mot, les chiffres qui défilent ;
- les cartes qui s'empilent, le chantier qui avance ;
- les photos « après » qui s'ouvrent, les « avant » qui dérivent ;
- les photos de la tempête dévoilées dans l'ordre ;
- le total du calcul qui défile jusqu'à sa nouvelle valeur, le nuancier qui change en fondu.

Il n'y a ni WebGL, ni curseur personnalisé, ni fond animé, ni vidéo à l'accueil. Avec « réduire les animations », il n'y a pas d'écran épinglé : tout est affiché d'emblée, et la vidéo de Brandon attend qu'on la lance.

## Rien d'inventé

- **Textes** : leurs pages, raccourcis ou reformulés : accueil, services, Build Process, détection de fuites et FAQ, couleurs d'enduit, carrelage, tempêtes, équipement, rénovations commerciales, comtés, financement, à propos.
- **Photos et vidéos** : les leurs, tirées de leur médiathèque Wix. Les nuanciers sont des visuels du fabricant Stonescapes, présentés comme tels.
- **Vérifié** :
  - la licence CPC1461058 est active (registre des licences de Floride, relevé du 4 octobre 2026) ;
  - l'accréditation BBB A+ date du 22 avril 2026 (bbb.org).
- **Écarté** :
  - les images générées présentées comme des chantiers. L'« après » de la rénovation résidentielle est un fichier « ChatGPT Image ». Celui de St. Pete est un fichier « Designer », qui ne correspond pas à son « avant » ;
  - les deux photos de la page À propos au format typique des images générées, l'affiche de détection de fuites, la carte des comtés et les boutons en images ;
  - les trois témoignages de modèle Wix (l'un remercie « America's Home Services » pour une peinture de maison) ;
  - les photos d'un autre compte Wix sur la page de financement, et la photo produit d'une pompe à chaleur ;
  - les notes Angi et Google, faute de pouvoir les vérifier : le site renvoie vers les deux pages, sans chiffre.
- **Corrigé** : « Gaurantee », « Coastal Creational », « Sumpter », « Citus », « sourrounding », « Equipoment », « Lightening », « Bradneton », le mot russe de la page des enduits, et « Steps 1-9 » au-dessus de 11 étapes.

## Fabrication

`node build.mjs` fait deux sorties :
- `dist/index.html` : un seul fichier avec tout dedans (4,4 Mo, vidéo comprise), à ouvrir d'un double-clic. La vidéo est en fin de fichier, pour que l'accueil s'affiche sans l'attendre.
- `dist-web/` : la version à mettre en ligne. La page pèse 225 Ko ; les photos, la vidéo et les polices sont en fichiers séparés. Les polices et la photo d'accueil sont préchargées, chaque écran ne chargeant que sa version (2560 px pour l'ordinateur, 1000 px pour le téléphone). L'image d'attente de la vidéo de Brandon n'arrive qu'à son approche.

Il n'y a rien à installer : Node suffit. GSAP 3.15, ScrollTrigger et Lenis 1.3 sont dans `vendor/`, avec les deux polices et leurs licences.

Pour la mise en ligne :
- **Netlify** : glisser le dossier `dist-web/` sur https://app.netlify.com/drop. Son fichier `_headers` donne un an de cache aux fichiers de `assets/`, et `noindex` tant que c'est une maquette (à retirer à la mise en ligne).
- **Vercel** : choisir `coastalcreations-site` comme dossier racine du projet ; `vercel.json` sert `dist-web/` avec les mêmes en-têtes.

Les outils :
- `python3 -I tools/images.py <dossier des originaux>` : les photos en AVIF dans `src/img/`, d'après `data/photos.json` (recadrage, taille, qualité, et pour la photo d'accueil une couleur légèrement relevée). `--only hero,hero-m` n'exporte que ces photos ; `--sizes` recalcule seulement `data/photo-sizes.json`.
- `python3 -I tools/logo.py <logo d'origine> src/img` : leur logo sans son fond bleu nuit. Le site utilise `logo-sm.avif` dans l'en-tête et `logo.avif` dans le pied de page.
- `python3 -I tools/boards.py <captures> <image des anciens tarifs> <dossier des TTF>` : les planches de `boards/`, en anglais pour le client.

La vidéo de Brandon : 540 × 960 (0,6 Mo). La vidéo de Holmes Beach n'est plus utilisée : sa qualité ne tenait pas en plein écran.

## Mesures

Lighthouse 12.8, le 10 octobre 2026, sur `dist-web/` servi en local et compressé comme sur Netlify (trois passages sur téléphone, un sur ordinateur). Le site actuel ne peut pas être mesuré de la même façon : il est derrière une vérification Cloudflare qui bloque les navigateurs automatisés.

| | Téléphone | Ordinateur |
|---|---|---|
| Performance | 95 à 97 | 100 |
| Accessibilité | 100 | 100 |
| Bonnes pratiques | 100 | 100 |
| Référencement | 100 | 100 |
| Affichage principal (LCP) | 2,6 s | 0,8 s |
| Blocage pendant le chargement (TBT) | 0 à 0,04 s | 0 |
| Décalages de mise en page (CLS) | 0 | 0 |
| Poids chargé à l'ouverture | 336 Ko | 624 Ko |

Le fichier unique `dist/index.html` est fait pour être ouvert en local. En ligne, il faut publier `dist-web/` : les 4,4 Mo d'un seul tenant seraient beaucoup trop lents sur un téléphone.

Les planches de `boards/` reprennent ces chiffres.

## À confirmer avec Coastal Creations

- **Angi** : une capture sur leur page de financement montre « 5.0 (6) ». La page Angi refuse les outils automatiques ; à vérifier avant de l'afficher.
- **Aqua White** : leur page lui donne la teinte « Medium Blue », ce qui semble être une erreur. Le site n'affiche de teinte pour aucun enduit.
- **« Gondolas »** dans leur liste de services : peu clair, non repris.
- **LinkedIn** : leur lien mène au profil personnel de Renee Hall, pas à une page de l'entreprise ; non repris.
- **Les photos de chantier** :
  - l'excavation et la pose des pavés (page Build Process) viennent-elles de la même construction de Bradenton ? Les légendes ne le disent pas ;
  - à Brandon, la photo du spa et la vidéo montrent-elles la même piscine ? Leur page les montre ensemble.
- **St. Pete et la rénovation résidentielle** : de vraies photos « après » remplaceraient les images générées de l'ancien site.
- **Les avis** : de vrais avis (Google, avec l'accord des clients) pourront remplacer les témoignages de modèle.
- **La certification CPO** F4AH6JX : est-elle au nom d'Owen Kay ? Le site l'affiche sans nom.
- **Hardee et DeSoto** : aucune ville n'est citée sur leurs pages.
- **L'assurance** : leur site écrit « Licensed & Insured » à côté de LI45304, qui est leur licence gaz. Une attestation d'assurance pourrait être citée.
- **Les formulaires** : le site renvoie vers leurs deux formulaires Jobber existants, tels quels.
