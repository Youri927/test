# Coastal Creations Pools and Lagoons : vidéo de présentation du nouveau site (Remotion)

Vidéo de 42,7 s en anglais (1920 × 1080, 60 i/s), faite pour Coastal Creations : elle leur présente leur nouveau site et leur parle directement (« your work », « your prices »). Version courte et rapide à produire : le site est montré en captures fixes haute résolution, mises en scène dans un navigateur et des téléphones avec des mouvements de caméra.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-coastal-16x9.mp4` | présentation avec musique (−14 LUFS) |
| `renders/presentation-coastal-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 4 s | Leur photo de Bradenton en plein cadre ; leur logo monte, puis « Your new website » |
| 4 – 8 s | L'accueil du site dans le navigateur ; « Your work, first » |
| 8 – 12,7 s | La phrase qui s'allume et les chiffres, puis la carte « Leak detection » posée sur les autres ; « What you do » |
| 12,7 – 17,3 s | La construction : étape 01–02 (le plan d'ingénieur), puis étape 06 (la coque gunite) ; « Eleven steps » |
| 17,3 – 22 s | Avant / après, puis Holmes Beach ; « Before. After. » |
| 22 – 26 s | Le nuancier Stonescapes, Caribbean Blue Mini choisi ; « Pick a water color » |
| 26 – 30,7 s | Les tarifs de détection de fuites, puis gros plan sur le calcul (spa, deux jeux d'eau, une buse : 570 $) ; « Readable prices » |
| 30,7 – 34 s | Le contact sur le corail : le numéro, les deux formulaires, le financement |
| 34 – 38,7 s | Trois téléphones : l'accueil, les tarifs, le menu ; « On a phone » |
| 38,7 – 42,7 s | La photo, le logo, « Built with your photos, your prices and your pages. » ; fondu au noir |

**Rien d'inventé** : tout ce qui est à l'écran vient du nouveau site (`../coastalcreations-site/dist/index.html`), écrit à partir de leurs pages ; les légendes décrivent ce que fait le site. Le calcul de la détection de fuites est un exemple fait avec leurs propres tarifs.

## Fabrication

1. **Captures** : `npm run capture` (`capture/stills.mjs`) ouvre le site avec Playwright, descend jusqu'à chaque position, laisse finir les animations et enregistre les images en 2× dans `public/stills/` (ordinateur 1440 × 900, téléphone 390 × 844).
2. **Musique** : `npm run music` la synthétise (`sound/music.mjs`), sans échantillon ni droit tiers : 90 BPM, mi bémol majeur, piano électrique, vibraphone, basse ronde, batterie douce. Les accords changent sur les coupes ; dans les scènes sombres (la construction, le nuancier), le groove passe dans un filtre qui se referme à moitié. Pas de bruitages.
3. **Rendu** : `bash tools/render.sh` rend l'image par segments, les raccorde, mixe la musique (`sound/mix.mjs`) et assemble `out/presentation-coastal.mp4`. Puis `npm run finalize` normalise le son à −14 LUFS et crée la version muette et une version légère de moins de 30 Mo pour l'envoi (`out/`).

`node tools/stills.mjs <dossier> <image> …` sort des images fixes du montage pour vérifier une scène.

Dans Remotion Studio (`npm run studio`), deux compositions : `Presentation-Coastal` et `Presentation-Coastal-Muet`.

Après une modification du site : `node build.mjs` dans `coastalcreations-site`, puis `npm run capture`.

`node_modules` est un lien vers celui de `../enhance-video` (mêmes versions de Remotion) ; sinon, `npm install`.

Polices : Unbounded et Figtree, licence OFL (`public/fonts/`).
