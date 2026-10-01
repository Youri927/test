# L'Antre 2 Jeux : maquette de refonte

Proposition de refonte du site de L'Antre 2 Jeux, escape game à Soissons. L'analyse du site actuel et le parti pris créatif sont dans [`ANALYSE.md`](ANALYSE.md).

**Pour voir le site** : ouvrez `dist/index.html` dans un navigateur. C'est un fichier unique (polices, styles et scripts intégrés), qui fonctionne hors ligne.

## Structure

```
src/index.html    contenu de la page
src/styles.css    styles (variables de la charte en tête de fichier)
src/main.js       interactions : torche, portes, diamant 3D, compte à rebours, cadenas des tarifs
vendor/           GSAP + ScrollTrigger, Lenis, polices (Big Shoulders, Epilogue)
build.mjs         assemble dist/index.html
```

Après une modification dans `src/` : `node build.mjs` (Node 18 ou plus récent).

## Avant la mise en ligne

- **Réservation** : remplacer l'URL des liens `data-booking` dans `src/index.html` par celle du module de réservation.
- **Logo** : remplacer le logotype typographique (`.wordmark`) par le logo officiel.
- **Photos** : ajouter les photos des salles dans les blocs `.room__art`.
- **Horaires et durées** : à confirmer avec l'établissement (sources dans `ANALYSE.md`).
- **Mention « Maquette de refonte non officielle »** dans le pied de page : à retirer.

## Crédits

- Polices : Big Shoulders et Epilogue, licence SIL Open Font License (`vendor/fonts/`).
- Animations : GSAP 3.15 et ScrollTrigger (licence standard GSAP, gratuite) ; défilement : Lenis 1.3 (MIT).
