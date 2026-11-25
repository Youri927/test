# Respray : la direction artistique

Une marque calme et précise : du blanc, des gris, de l'encre, une seule police, et des photos de flacons nettes, sur
fond uni. Ce qui rassure, ce n'est pas le décor, c'est la clarté. Le site est toujours clair : pas de mode sombre.

## Le symbole

Un « r » dont l'épaule devient un jet de spray : un point, puis deux, puis trois. Re-spray : le parfum qui repart pour
quelqu'un d'autre.

- Grille de 110 × 100 unités. Trait de 13 unités, bouts arrondis. Fût du r de y 58 à 86, épaule en arc jusqu'au
  point (54, 36).
- Le jet : un cône de 1, 2 puis 3 points, de rayon 5,5, 4 et 2,8.
- Le dessin exact est dans `tools/logo.py`, qui produit tous les fichiers de ce dossier.

## Les fichiers

| Fichier | Usage |
|---|---|
| `logo.svg` | Logo complet, encre (#1D1D1F), sur fond clair |
| `logo-blanc.svg` | Logo complet, blanc, sur fond sombre |
| `logo-site.svg` | Logo complet dont la couleur suit le texte (le site l'utilise, en clair comme en sombre) |
| `symbole.svg`, `symbole-blanc.svg` | Le symbole seul |
| `mot.svg` | Le mot seul |
| `icone.svg` | Icône d'application, 1024 × 1024, coins continus, symbole blanc sur encre |
| `favicon.svg` | Icône d'onglet : la même, avec un symbole un peu plus grand pour rester lisible à 16 px |

Le mot « respray » est en Inter SemiBold (taille optique 32), vectorisé, approché de −0,04 em. Le pied du « r » du
symbole est posé sur la ligne de base du mot ; l'espace entre le symbole et le mot vaut 0,26 em.

## Les règles

- Autour du logo, gardez au moins la moitié de la hauteur du symbole.
- En dessous de 80 px de large (ou 20 mm imprimé), utilisez le symbole seul.
- Le logo est en encre ou en blanc. Jamais en couleur, jamais déformé, jamais en ombre portée, jamais posé sur une
  photo chargée.

## Les couleurs

| Nom | Code | Usage |
|---|---|---|
| Encre | #1D1D1F | Texte, logo, boutons principaux |
| Gris clair | #F5F5F7 | Fonds de section |
| Gris photo | #F2F2F2 | Fond des photos |
| Gris porte | #E9E8EE | La porte « Vendre » de l'accueil |
| Gris | #6E6E73 | Textes secondaires |
| Trait | #D2D2D7 | Bordures, séparations |
| Blanc | #FFFFFF | Fond |
| Vert vérifié | #1A7F4B | Seulement pour ce qui est vérifié ou validé |

Pas de mode sombre : le site reste clair, même quand l'appareil est en sombre. Le logo blanc ne sert que sur une photo
ou un support sombre, hors du site.

## La typographie

Inter, une seule famille, deux graisses : normale (400) pour le texte, semi-grasse (600) pour les titres et les
boutons. Titres serrés (−3,5 %), texte courant à 16 px.

| Rôle | Taille | Graisse |
|---|---|---|
| Titre | 48 px | 600, −3,5 % |
| Sous-titre | 22 px | 600 |
| Texte | 16 px | 400 |
| Légende | 13 px | 500 |

## Les photos

Sur le vrai site, ce sont celles des vendeurs ; le guide de la page Vendre leur dit comment les prendre. Dans le
prototype, des rendus 3D (`tools/rendus`) tiennent leur place, et servent d'exemples dans le formulaire de vente.

- Le flacon seul, sur un fond clair et uni (#F2F2F2), à la lumière du jour, avec son ombre posée. Aucun décor.
- Toujours les mêmes vues, dans le même ordre : de face, dessous (code lot), niveau, dessus avec le spray, tige,
  photo preuve, puis la boîte et le ticket s'il y en a.
- Aucun filtre, aucune retouche.
- Un repère seulement quand il sert à vérifier : sur la vue « niveau », un trait et le pourcentage annoncé.
- Sous la grande photo d'une annonce, une légende dit ce que la vue prouve.
- Formes génériques : aucun flacon de marque n'est reproduit.
- La brume du spray (porte « Vendre ») reprend le cône de points du symbole.

## Les éléments

Boutons en pilule (encre plein, ou contour), filtres en pastilles, champs arrondis à 12 px, cartes à 18–28 px. Le
vert ne sert qu'aux badges de vérification.

## Le ton

Précis, calme, sans promesse qu'on ne tient pas.

| On dit | On ne dit pas |
|---|---|
| « Vérifiée en 1 h 12. » | « Qualité premium garantie ! » |
| « Il reste environ 85 %. » | « Presque plein ! » |
| « Vous avez 7 jours pour vérifier. » | « Achetez en toute sérénité ! » |
