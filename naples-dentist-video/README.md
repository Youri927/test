# Implant and Comprehensive Dentistry of Naples : vidéo de présentation du nouveau site (Remotion)

Vidéo de 108 s en anglais (1920 × 1080, 60 i/s) pour présenter la refonte du site au cabinet du Dr. Fady Fakhoury.

**Le fil rouge : la pastille du sourire.** Sur le nouveau site, le titre « Implants, same-day crowns and everything in between » porte une pastille avec le sourire du Dr. Fakhoury, qui s'ouvre au défilement jusqu'à son portrait entier. La vidéo reprend ce geste partout.
- Elle montre d'abord le site actuel, puis le **vrai nouveau site** (`../naples-dentist-site/dist/index.html`).
- Le nouveau site est filmé image par image en 2×, sur ordinateur et sur téléphone, puis mis en scène dans un navigateur et des téléphones, avec des mouvements de caméra.
- D'une section à l'autre, la scène suivante s'ouvre dans une pastille qui grandit jusqu'à remplir l'image ; le fond prend la couleur de la section (turquoise, vert-noir…).
- Les légendes naissent pastille, s'étirent, puis s'ouvrent en panneau.
- La vidéo s'ouvre sur leur logo qui se construit comme le schéma de la section Implants, et finit sur le sourire qui s'ouvre en grand portrait, à côté du téléphone du cabinet.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-naples-16x9.mp4` | présentation avec musique et bruitages (−14 LUFS) |
| `renders/presentation-naples-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 6,7 s | Leur logo se construit (la racine, les sept filets de la vis, la couronne qui se pose sur le temps), puis le nom du cabinet et la phrase du pied de page du nouveau site |
| 6,7 – 21,3 s | Today : le site actuel (vraies captures de quatre pages) et trois constats tirés de l'analyse. La caméra va chercher chaque preuve : un implant vendu 0,00 $ avec « Add to cart » et PayPal, la diapositive « Image slide » du modèle sur la page de rendez-vous, un numéro qu'on ne peut pas toucher et « [Contact Form…] » à la place du formulaire |
| 21,3 – 24,7 s | Sur le turquoise du cabinet : « The new site starts with his smile », avec la pastille du sourire |
| 24,7 – 36 s | La pastille s'ouvre sur l'accueil : les mots montent, survol du bouton d'appel, puis la pastille du titre grandit jusqu'au portrait et son nom apparaît sur le mur |
| 36 – 44 s | Sans coupure, la page continue : leur logo devient le schéma d'un implant (la vis entre filet par filet, la couronne se pose), puis les trois parties se nomment |
| 44 – 53,3 s | La couronne en une séance : la course entre la méthode habituelle et leurs couronnes E4D |
| 53,3 – 63,3 s | Les soins rangés par situation : survol des lignes, « A tooth is missing » ouvre sa fiche, survol du bouton d'appel |
| 63,3 – 72 s | La sédation : trois niveaux, la lumière de la section baisse à chaque niveau ; la musique baisse avec elle |
| 72 – 80 s | Le parcours du Dr. Fakhoury tracé sur la carte : Michigan, New York, Naples |
| 80 – 90,7 s | Le nouveau cabinet (mardi signalé dans les horaires), puis la demande de rendez-vous : la situation, le nom, le téléphone, l'e-mail, le matin, l'envoi, « Thanks, Maria. Your request is in. » |
| 90,7 – 98,7 s | Trois téléphones : l'arrivée, la course des couronnes, une fiche ouverte au toucher |
| 98,7 – 108 s | Le logo, le nom, le téléphone, l'adresse ; le sourire s'ouvre en grand portrait ; fondu |

**Rien d'inventé.**
- Les phrases viennent du site actuel ou du nouveau site (titres, soins, parcours, horaires, adresse, téléphone).
- Les pages « Today » sont des captures complètes du site actuel, faites le 8 octobre 2026 (`capture/before.mjs`) ; les constats viennent de `../naples-dentist-site/ANALYSE.md`.
- Les photos sont celles de leur site (portrait du Dr. Fakhoury), avec le recadrage du sourire du nouveau site.
- Le formulaire est rempli avec un nom fictif, un numéro en 555 et une adresse `example.com`.

## Fabrication

1. **Captures.**
   - `npm run capture:site` filme le nouveau site avec Playwright (`capture/shots.mjs`). On peut filmer un seul plan : `node capture/shots.mjs d-implants`.
   - L'horloge de la page est simulée : elle avance d'exactement 1/60 s entre deux images. GSAP tourne sur ce temps, les animations CSS sont recalées dessus, et Lenis et ScrollTrigger sont mis à jour à chaque défilement. La date simulée est le mardi 6 octobre 2026 à 10 h (cabinet « Open now », mardi signalé).
   - `npm run capture:probe` rejoue les plans sans filmer et relève les repères (filets de la vis, fin de la course E4D, niveaux de sédation, étapes de la carte, envoi du formulaire) dans les fichiers JSON des plans.
   - Le plan des implants repart exactement de la position où finit celui de l'accueil : le raccord entre les deux ne se voit pas.
   - Rendu processeur (`--disable-gpu`) : l'émulateur graphique du conteneur laisse des bandes dupliquées sur les grands dessins SVG.
   - Les plans sont écrits en 2880 × 1800 (ordinateur) et 780 × 1688 (téléphone) dans `public/site/`, avec la trajectoire de la souris, redessinée nette par-dessus (sur téléphone, un vrai toucher d'écran).
   - `npm run capture:before` capture le site actuel en entier, en 2× (`public/before/`), avec la position des textes cités.
2. **Son.** `npm run sound` synthétise la musique (`sound/music.mjs`) et les bruitages (`sound/sfx.mjs`). Aucun échantillon, aucun droit tiers.
   - **Musique** : 90 BPM, fa majeur : piano feutré, cordes pincées, basse ronde, grosse caisse douce, rim et shaker.
     - L'ouverture se pose sur fa majeur au moment où la couronne du logo se pose.
     - Le site actuel passe en ré mineur, sur une pulsation sourde ; la bascule monte vers l'accueil.
     - Sédation : le groove passe dans un filtre qui se referme en deux fois, avec les deux niveaux ; la batterie s'efface, puis revient en demi-temps pour le parcours du Dr. Fakhoury.
   - **Bruitages** : les filets de la vis (tintements qui montent), la couronne qui se pose, les pastilles qui s'ouvrent, les pages et le surligneur du site actuel, une cloche quand E4D arrive, la lumière qui baisse, une note par étape de la carte, les clics, la frappe au clavier, le carillon du formulaire envoyé.
   - Tous les points de synchronisation sont dans `src/beats.ts` : les coupes, les filets de la vis, la couronne, l'arrivée d'E4D, les niveaux de sédation, les étapes de la carte et l'envoi du formulaire tombent sur les temps de la musique. Les repères des bruitages sont partagés entre l'aperçu Remotion et le mixage (`src/cues.ts`).
3. **Rendu.**
   - `bash tools/render.sh` : rendu muet par segments (`out/seg/`), raccord avec ffmpeg, bande-son mixée à part (`npm run mix`), puis assemblage dans `out/presentation-naples.mp4`.
   - Un limiteur ne prend que les crêtes (grosse caisse, couronne qui se pose) : la normalisation finale reste un simple gain, sans compression.
   - Finalisation : `npm run finalize` normalise le son à −14 LUFS (crête vraie sous −1,5 dB), crée la version muette et une version légère de moins de 30 Mo pour l'envoi (`out/`).
   - `node tools/stills.mjs <dossier> <image> …` sort des images fixes pour vérifier une scène.

Dans Remotion Studio (`npm run studio`), trois compositions : `Presentation-Naples` (complète), `-Bruitages` (sans musique) et `-Muet`.

Après une modification du site : relancer `npm run build` dans `naples-dentist-site`, puis `npm run capture:site` et `npm run capture:probe`.

`node_modules` est un lien vers celui de `../enhance-video` (mêmes versions de Remotion) ; sinon, `npm install`.

Police : Instrument Sans, licence OFL (`public/fonts/`).
