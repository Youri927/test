# Idoine Piscines : maquette de refonte

Proposition de refonte du site d’Idoine Piscines, constructeur de piscines et de spas sur mesure à Paris et en Île-de-France depuis 1966. L’analyse du site actuel, les sources et le parti pris créatif sont dans [`ANALYSE.md`](ANALYSE.md).

**Pour voir le site** : ouvrez `dist/index.html` dans un navigateur. C’est un fichier unique (polices, styles et scripts intégrés), qui fonctionne hors ligne.

## Le concept en bref

« L’eau, là où Paris ne l’attend pas. » Plus des trois quarts des bassins d’Idoine sont à l’intérieur : caves, immeubles anciens, lofts, verrières, toits.

- **L’eau vivante** : la page s’ouvre sur une surface d’eau calculée en direct (WebGL), avec mosaïque, reflets de lumière et ondes sous la souris ou le doigt.
- **Paris, en coupe** : une coupe d’immeuble parisien dessinée comme un plan d’architecte. Au scroll, la caméra s’arrête sur la piscine de toit, la piscine sous verrière, le spa d’hôtel et la piscine en cave voûtée.
- **La ligne d’eau** : débordement, goulotte et reprise classique, en coupes animées. Le fond mobile se manipule avec un curseur.
- **Les références** : les palaces et les hôtels du portfolio, en grand.
- **Le projet** : trois questions qui préparent un e-mail prêt à envoyer.

## Structure

```
src/index.html    contenu de la page
src/styles.css    styles (couleurs et typographie en tête de fichier)
src/water.js      l’eau en WebGL et la texture des reflets
src/main.js       coupe d’immeuble, bords de bassin, fond mobile, formulaire
vendor/           GSAP + ScrollTrigger, Lenis, police Archivo
build.mjs         assemble dist/index.html
```

Après une modification dans `src/`, lancez `node build.mjs` (Node 18 ou plus récent).

## Avant la mise en ligne

- **Photos** : ajouter de vraies photos de réalisations. La maquette n’utilise aucune photo, ni de banque d’images ni d’autres piscinistes.
- **Logo** : remplacer le logotype typographique (`.mark`) par le logo officiel.
- **À faire confirmer par Idoine** :
  - la date de création (1966 au registre, 1967 dans la presse) ;
  - le nombre de réalisations (« plus de 2 000 ») ;
  - les horaires ;
  - l’adresse parisienne ;
  - l’adhésion à la FPP ;
  - l’accord pour citer chaque établissement de la liste de références.
- **Formulaire** : il ouvre la messagerie du visiteur avec un e-mail pré-rempli, adressé à info@idoine-piscines.com. Pour un envoi direct, il faudra le brancher sur un service d’envoi.
- **Mention « Maquette de refonte non officielle »** dans le pied de page : à retirer.

## Accessibilité et repli

- La préférence « mouvement réduit » est respectée : l’eau est figée et le contenu reste entièrement lisible.
- Sans WebGL, l’eau est remplacée par un dégradé et des reflets en CSS.
- Navigation au clavier, focus visible.
- Mise en page vérifiée de 390 px à 1 920 px de large.

## Crédits

- Police : Archivo (Omnibus-Type), licence SIL Open Font License (`vendor/fonts/`).
- Animations : GSAP 3 et ScrollTrigger (licence standard GSAP, gratuite) ; défilement : Lenis (MIT).
