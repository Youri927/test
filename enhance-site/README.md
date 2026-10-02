# Enhance® Medical Center : refonte du site (concept)

Proposition de refonte complète de https://www.enhanceplasticsurgery.com, le site du cabinet du Dr Charles S. Lee à Beverly Hills. L'analyse du site actuel et la direction choisie sont dans [ANALYSE.md](ANALYSE.md).

Le site est en anglais, comme le cabinet (Beverly Hills). Tout le contenu vient du site actuel et de ses pages indexées : soins, crédits du chirurgien, chiffres, avis, financement, adresse et horaires. Rien n'est inventé.

## Voir le site

- **Fichier unique.** Ouvrez `dist/index.html` dans un navigateur. Polices, styles et scripts sont intégrés : le fichier fonctionne hors ligne.
- **Mise en ligne.** Glissez le dossier `dist` sur Vercel ou Netlify (« drop »). Il ne contient que `index.html`.

## Le concept : « The face, layer by layer »

1. **Le hero.** Un ovale de visage abstrait, annoté au violet du marqueur chirurgical : axe médian, tiers du visage, contour de la mâchoire.
2. **L'éclatement.** Au scroll, l'ovale bascule en 3D et se sépare en cinq calques dessinés :
   - Surface : la peau ;
   - Volume : les compartiments de graisse ;
   - Motion : les muscles, dont les masséters ;
   - Support : le réseau de soutien et les vecteurs de lifting ;
   - Structure : l'os et le cartilage.
3. **Les soins.** Tous les soins du visage sont rangés dans ces cinq couches. À la lecture, la couche active se détache, les couches au-dessus s'envolent et la caméra la recentre.
4. **Les spécialités.** Chapitre sombre « Signature » : mâchoire, paupières, nez et lifting endoscopique, avec des planches au trait qui se dessinent au scroll.
5. **Le chirurgien.** Ses deux certifications et sa formation racontées comme un parcours, de Washington University jusqu'à l'enseignement.
6. **La suite de la page.**
   - Le corps.
   - Les galeries avant/après (liens vers les vraies galeries du cabinet).
   - La note de 4,4/5 et deux avis.
   - Le journal.
7. **« Your consultation ».** Le bouton + de chaque soin l'ajoute à une sélection, signalée par une pastille flottante. Le formulaire final est prérempli et prépare un SMS au numéro du cabinet (310) 779-5488. Rien n'est stocké en ligne.

**Typographie.** Fraunces pour les titres, Geist pour le texte, Geist Mono pour les annotations (licences OFL dans `vendor/fonts`).

**Couleurs.** Porcelaine `#F3EFE9`, encre `#16141B`, violet marqueur `#5B41E0`, nuit `#0F0E13`.

**Animations.** GSAP, ScrollTrigger et Lenis. La 3D est en CSS, sans WebGL : c'est léger et fluide.

**Accessibilité.** HTML sémantique et navigation au clavier. Le mode « réduire les animations » est respecté et la page reste lisible sans JavaScript.

## Modifier

Les sources sont dans `src/` :

| Fichier | Rôle |
| --- | --- |
| `index.html` | contenu |
| `styles.css` | design |
| `art.js` | dessins SVG des calques et des glyphes |
| `main.js` | animations et formulaire |

Après une modification, régénérez le fichier final :

```
node build.mjs
```

## Avant une vraie mise en ligne

- Ajouter le portrait du Dr Lee (la carte « CSL » de la section The surgeon peut l'accueillir) et, si le cabinet le souhaite, des photos du lieu.
- Vérifier le texte exact des deux avis cités, repris des extraits indexés de la page Reviews.
- Brancher le formulaire sur l'outil du cabinet (e-mail, CRM ou prise de rendez-vous), en plus de l'envoi par SMS.
- Confirmer la liste des soins med spa encore pratiqués.
