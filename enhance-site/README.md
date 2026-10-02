# Enhance® Medical Center : refonte du site (concept)

Proposition de refonte complète de https://www.enhanceplasticsurgery.com, le site du cabinet du Dr Charles S. Lee à Beverly Hills. L'analyse du site actuel et la direction choisie sont dans [ANALYSE.md](ANALYSE.md).

Le site est en anglais, comme le cabinet (Beverly Hills). Tout le contenu vient du site actuel et de ses pages indexées : soins, crédits du chirurgien, chiffres, avis, financement, adresse et horaires. Rien n'est inventé.

## Voir le site

- **Fichier unique.** Ouvrez `dist/index.html` dans un navigateur. Polices, styles et scripts sont intégrés : le fichier fonctionne hors ligne.
- **Mise en ligne.** Glissez le dossier `dist` sur Vercel ou Netlify (« drop »). Il ne contient que `index.html`.

## Le concept : « The face, layer by layer »

1. **Le hero.** Les cinq couches du visage forment le titre, empilées : Surface, Volume, Motion, Support, Structure. La graisse et la largeur de la typo suivent la profondeur : la peau est fine et large, l'os dense et serré. À l'ouverture, les cinq mots apparaissent identiques puis rejoignent chacun leur profondeur. Survoler un mot affiche sa couche sur l'ovale du visage, annoté au violet du marqueur chirurgical comme une planche d'anatomie.
2. **L'éclatement.** Au scroll, l'ovale bascule en 3D et se sépare en cinq calques dessinés :
   - la peau ;
   - les compartiments de graisse ;
   - les muscles, dont les masséters ;
   - le réseau de soutien et les vecteurs de lifting ;
   - l'os et le cartilage.

   Chaque étiquette est écrite dans sa profondeur.
3. **Les soins.** Tous les soins du visage sont rangés dans ces cinq couches. À la lecture, la couche active se détache et la caméra la recentre.
4. **Les spécialités.** Chapitre sombre « Signature » : mâchoire, paupières, nez et lifting endoscopique, avec des planches au trait qui se dessinent au scroll.
5. **Le chirurgien.** Son parcours, des études à l'enseignement, et ses certifications.
6. **La suite de la page.**
   - Le corps.
   - Les galeries avant/après (liens vers les vraies galeries du cabinet).
   - La note de 4,4/5 et deux avis.
   - Le journal.
7. **« Your consultation ».** Le bouton + de chaque soin l'ajoute à une sélection. Le formulaire final est prérempli et prépare un SMS au cabinet, (310) 779-5488. Rien n'est stocké en ligne.

**Typographie.**
- **Anybody**, une grotesque variable (graisse 100 à 900, largeur 50 à 150 %), pour les titres et l'interface.
- **Newsreader**, un romain de lecture, pour le texte courant et les légendes de planche en italique.
- Licences OFL dans `vendor/fonts`.

**Évité volontairement.** Petites capitales monospace au-dessus des titres, mot coloré en italique dans un titre, rangée de gros chiffres, curseur personnalisé.

**Couleurs.** Gaze `#EDECE7`, encre `#1F1A24`, violet marqueur `#5B41E0`, nuit `#17121C`.

**Animations.** GSAP, ScrollTrigger et Lenis. La 3D est en CSS, sans WebGL. Le mouvement est réservé à trois choses : l'ouverture, la pile de calques et les planches qui se dessinent.

**Accessibilité.** HTML sémantique et navigation au clavier : le focus sur un mot du hero montre aussi sa couche. Le mode « réduire les animations » est respecté et la page reste lisible sans JavaScript.

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

- Ajouter le portrait du Dr Lee (à côté de la liste des certifications) et, si le cabinet le souhaite, des photos du lieu.
- Vérifier le texte exact des deux avis cités, repris des extraits indexés de la page Reviews.
- Brancher le formulaire sur l'outil du cabinet (e-mail, CRM ou prise de rendez-vous), en plus de l'envoi par SMS.
- Confirmer la liste des soins med spa encore pratiqués.
