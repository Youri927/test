# Gracie Pools : nouveau site (React + shadcn/ui)

Refonte complète de https://graciepools.com, constructeur de piscines à Altamonte Springs (Floride). L'analyse du site actuel est dans `ANALYSE.md`.

**À ouvrir** : `dist/index.html`, d'un double-clic (un seul fichier, sans serveur).

## L'idée : « Every model, drawn to scale »

Le site actuel héberge la fiche officielle 2025 du fabricant Barrier Reef, dont Gracie Pools pose les coques. Ses dessins vus de dessus sont vectoriels. Le nouveau site les reprend tels quels (marges, parois, marches, banquettes, fosses), les remplit avec les vraies textures d'eau des six coloris, et les pose tous sur la même grille en pieds.

- **L'accueil** : leur salut, « Hello Florida », en très grand ; à côté, un bassin présenté comme un produit, avec ses cotes, qui passe d'une forme à l'autre (forme libre, rectangle, haricot, romaine, petit bassin). Pause, choix direct, coupé si le visiteur demande moins d'animations.
- **La coque d'un seul tenant** : leurs arguments et ceux du fabricant, puis le chemin de l'usine au jardin, dessiné avec le contour du Coral Sea (le moule en pointillés, trois couches de gelcoat, la stratification, les anneaux de levage, le gabarit, la fouille hachurée, le bassin fini).
- **Le comparateur** :
  - 23 modèles et 7 spas et plages immergées, filtrés par forme (contrôle segmenté adapté de 21st.dev).
  - Le bassin choisi part du même coin que tous les autres : sa longueur se lit sur la règle du haut, sa largeur sur celle de gauche.
  - Au changement de modèle, il s'étire depuis la taille du précédent jusqu'à la sienne, et les barres des règles suivent.
  - On peut épingler un bassin : son contour reste en pointillés pendant qu'on en regarde un autre.
  - Les mesures sont celles de la fiche ; les volumes viennent de leurs pages modèles, seulement quand les dimensions y concordent.
  - Les six coloris sont présentés par leur vraie pastille de gelcoat ; le coloris choisi teinte le reste du site (survol des boutons, règles, sélection de texte) et la gamme du pied de page.
  - « Ask about this pool » joint le modèle, la taille et le coloris à la demande de devis.
- **Les photos des modèles** (photos du fabricant, signées comme telles), avec le dessin du modèle à côté de sa légende : un clic ouvre le comparateur sur lui.
- **Le béton sur mesure**, **l'ensemble autour du bassin** et le **financement** Lyon Financial (leur vraie page partenaire).
- **Les piscines existantes** : liners (avec la liste de ce que comprend leur prestation), enduit et carrelage, pompes et sel, domotique, spas ; et leur offre la plus simple, mise en avant partout : une photo par SMS pour une estimation gratuite (le SMS s'ouvre avec un début de message, sur iPhone comme sur Android).
- **Les questions fréquentes** (celles de leur page liners, et des réponses tirées de la fiche) et **la demande**.
- **Le pied de page** : toute la gamme, côte à côte à la même échelle, dans le coloris choisi.

**Mouvement** : défilement fluide (Lenis) ; titres qui montent ligne par ligne ; photos qui se découvrent ; l'eau qui dérive lentement dans les grands bassins ; les fonds sombres qui s'élargissent comme des panneaux au défilement ; au survol, l'eau du coloris monte dans les boutons. Tout est coupé avec « réduire les animations ».

**Typographie et couleurs** : Familjen Grotesk (OFL), choisie parce qu'elle a les signes pieds et pouces (′ ″) et des chiffres tabulaires. Encre bleu nuit, blanc, l'azur de leur favicon (#0894FC) pour le financement et la marque, et l'eau des textures pour tout le reste.

## Rien d'inventé

- Textes : leurs pages (services, licence, 20 ans, réponse sous 24 h, liner en 1 à 2 jours, garantie de 20 ans, ce que comprend un remplacement, Pentair, financement) et la fiche Barrier Reef 2025 (mesures, coloris, fabrication). Les textes du fabricant lui sont attribués.
- Écartés : les textes de modèle (« Daily Specials », toboggan, carte cadeau), les badges BBB et Google non vérifiables, la gamme Sun Pools (à confirmer), les photos de banque d'images.
- Photos : celles de leur site. Les photos de modèles sont signées « Photo: Barrier Reef ». Les photos béton et travertin ont une légende neutre (origine à confirmer).
- Licence CPC1458515 : retrouvée active à Altamonte Springs dans un registre tiers, à confirmer sur myfloridalicense.com.
- **Le formulaire est une démonstration** : rien n'est envoyé. À brancher avant la mise en ligne (Netlify Forms, Formspree ou leur messagerie).

## Fabrication

- `npm run build` : `dist/index.html`, un seul fichier avec tout dedans (4 Mo).
- `npm run build:web` : version de production dans `dist-web/` (HTML pré-rendu, photos et police en fichiers séparés, chargés au fur et à mesure ; la police et l'eau du premier bassin sont préchargées).
- **Netlify** : `npm run build:web`, puis glisser le dossier `dist-web/` sur https://app.netlify.com/drop. Le fichier `public/_headers` y est copié : cache d'un an pour les fichiers versionnés, et `noindex` tant que c'est une maquette (à retirer à la mise en ligne).
- **Vercel** : `vercel.json` lance `npm run build:web` et sert `dist-web/`.
- `python3 tools/drawings.py <fiche.pdf>` : extrait les dessins de la fiche Barrier Reef 2025 (page 2, vectorielle) dans `src/data/drawings.json`. Chaque zone garde sa clarté d'origine ; le contour de l'eau est recalculé sur une grille fine (certaines parois sont tracées en anneau d'un seul trait). Il faut `pdftocairo` (poppler), OpenCV et NumPy. La fiche : https://img1.wsimg.com/blobby/go/3c088145-d2f5-4a3c-b546-e6ddb4ebd919/Barrier%20Reef%20Fiberglass%20Pools%202025%20Model%20Sheet.pdf
- `python3 tools/images.py <dossier des originaux>` : photos, textures d'eau et pastilles de gelcoat en AVIF, d'après `data/photos.json`.

## À confirmer avec Gracie Pools

- La gamme Sun Pools est-elle encore vendue ? Le Castaway (nouveau sur la fiche 2025) est-il proposé ?
- Des photos de leurs propres chantiers, pour remplacer celles du fabricant.
- L'origine des photos béton et travertin ; leurs horaires ; le lien vers leurs avis Google.
