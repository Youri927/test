# Enhance® Medical Center : refonte du site (concept)

Proposition de refonte complète de https://www.enhanceplasticsurgery.com, le site du cabinet du Dr Charles S. Lee à Beverly Hills. L'analyse du site actuel et la direction choisie sont dans [ANALYSE.md](ANALYSE.md).

Le site est en anglais, comme le cabinet (Beverly Hills). Tout le contenu vient du site actuel et de ses pages indexées : soins, crédits du chirurgien, chiffres, avis, financement, adresse et horaires. Rien n'est inventé.

## Voir le site

- **Fichier unique.** Ouvrez `dist/index.html` dans un navigateur. Polices, styles et scripts sont intégrés : le fichier fonctionne hors ligne.
- **Mise en ligne.** Glissez le dossier `dist` sur Vercel ou Netlify (« drop »). Il ne contient que `index.html`.

## Le concept : « The face, layer by layer »

**Principe.** Une direction sobre et professionnelle : fond clair, encre presque noire, une seule couleur d'accent (un bleu d'encre) réservée aux tracés du chirurgien. La personnalité vient de la mise en page, pas des effets.

1. **Le hero.** Le nom du chirurgien, un titre clair (« Facial plastic surgery in Beverly Hills »), puis l'index des cinq couches du visage. À droite, un ovale de visage annoté comme une planche d'anatomie. Survoler une couche dans l'index l'affiche sur le visage.
2. **Les cinq couches.** Au scroll, l'ovale bascule en 3D et se sépare en cinq calques dessinés : la peau, les volumes, les muscles, le soutien, l'os. Tous les soins du visage sont rangés dans ces couches, en tableaux. À la lecture, la couche active se détache.
3. **Signature procedures**, en section sombre : quatre spécialités (mâchoire, paupières, nez, lifting endoscopique), chacune avec un dessin au trait qui se trace au scroll.
4. **Dr. Charles S. Lee** : son nom en grand, une carte avec ses certifications et, à côté, son parcours sur une ligne qui se remplit à la lecture.
5. **Body** : tableau des soins, titre dans la marge.
6. **Before & after** : cartes des galeries réelles du cabinet, note de 4,4/5, deux avis et quatre articles du journal.
7. **Your consultation is complimentary** : formulaire en trois étapes et informations pratiques (adresse, téléphone, horaires, paiement).
8. **« Your consultation ».** La case à cocher de chaque soin l'ajoute à une sélection. Le formulaire final est prérempli et prépare un SMS au cabinet, (310) 779-5488. Rien n'est stocké en ligne.

**Typographie.**
- **Fraunces** pour les titres, les noms de soins, les citations et les légendes en italique.
- **Geist** pour le texte et l'interface.
- Licences OFL dans `vendor/fonts`.

**Évité volontairement.**
- Étiquettes en petites capitales au-dessus des titres, mot coloré dans un titre.
- Rangée de gros chiffres dans le hero, boutons en pilule.
- Curseur personnalisé, apparitions en fondu sur chaque bloc.

**Couleurs.** Fond `#F7F6F3`, encre `#17161A`, gris `#67646D`, filets `#E1DED8`, accent `#2F4A63`, section sombre `#16151A`.

**Animations.** GSAP, ScrollTrigger et Lenis. La 3D est en CSS, sans WebGL. Le mouvement est limité à l'ouverture et à la pile de calques.

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

- Ajouter le portrait du Dr Lee (à côté de la liste des certifications) et, si le cabinet le souhaite, des photos du lieu.
- Vérifier le texte exact des deux avis cités, repris des extraits indexés de la page Reviews.
- Brancher le formulaire sur l'outil du cabinet (e-mail, CRM ou prise de rendez-vous), en plus de l'envoi par SMS.
- Confirmer la liste des soins med spa encore pratiqués.
