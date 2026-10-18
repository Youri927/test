# Revue de design et relecture des textes

Revue faite sur le site construit (`dist-web`, servi en local), en captures de 320 à 1920 px, au défilement animé et en
mouvement réduit, comme le ferait un directeur artistique qui découvre le travail. Ce qui a été trouvé a été corrigé
avant la livraison ; ce qui reste dépend de Zynda (photos, confirmations).

## Première impression (2 secondes)

L'œil va d'abord à la phrase « The people who show up. », puis à la maison blanche et sa piscine, puis à « Every single
day. » en bas à droite : la lecture fait un Z, c'est voulu, et c'est le bon ordre (qui ils sont, ce qu'ils construisent,
leur promesse). En dessous, à gauche, ce qu'ils font et le bouton de demande, visibles sans défiler sur un écran de
1440 × 900. L'impression est calme, chère et précise ; rien n'évoque un modèle de site.

## Hiérarchie

- **Ce qui attire l'œil** : la phrase d'accueil en Montagu Slab très fine et très grande, puis les photos, puis le cadran.
  C'est la bonne hiérarchie pour un constructeur haut de gamme : le ton, la preuve, la méthode.
- **Rythme** : on alterne une photo pleine largeur (accueil), un texte seul (ce qui les distingue), un objet (le cadran),
  une suite de photos (les pièces), un bandeau noir (les détails), une liste (les prestations), un portrait, une liste
  de noms en grand (les quartiers), le formulaire. Aucune section ne ressemble à la précédente.
- **Typographie** : une seule égyptienne pour tout ce qui est grand, une seule linéale pour le reste ; quatre tailles
  utiles en pratique. Pas de capitales espacées, pas de mot mis en couleur dans un titre, pas de numérotation décorative.

## Ce qui a été corrigé pendant la revue

| Constat | Gravité | Correction |
|---|---|---|
| À 1920 px, le bandeau photo de l'accueil s'arrêtait à 40 px des bords (limité par la largeur maximale de la page) : le Z perdait sa coupure franche | 🟡 | Le bandeau sort du conteneur et va d'un bord à l'autre de la fenêtre à toutes les largeurs |
| Sur tablette (700 à 899 px), la fin de la phrase repassait à gauche : le Z disparaissait | 🟡 | Alignée à droite dès 700 px |
| Le bandeau des détails : huit vignettes, dont deux presque blanches (mosaïque, pomme de douche), lisaient comme une grille de miniatures | 🟡 | Six gros plans plus grands (3 × 2), choisis pour leur matière et leur couleur : la pierre bleue et la flamme, les écailles vert d'eau, le verre, le marbre veiné, l'acier, le chrome |
| Le cadran était trop petit dans sa colonne, et la ligne du jour flottait loin dessous | 🟡 | Cadran agrandi (jusqu'à 660 px), marges du dessin resserrées, ligne du jour juste sous le cercle, l'ensemble centré dans la hauteur de l'écran pendant qu'il reste à l'écran |
| Sur téléphone, les étiquettes du cadran tombaient à 7 px | 🔴 | Tailles propres au téléphone : environ 12 px pour les mois, la saison et les repères, 28 px pour la date du centre (elle tient entre « Oct » et « Mar ») |
| Titres des étapes coupés au mauvais endroit (« June to September. On / site, every day. ») | 🟢 | Lignes équilibrées (`text-wrap: balance`) |
| Le titre de l'année et son paragraphe se répétaient (« we plan the work with you in winter and build while you're gone ») | 🟢 | Titre en deux phrases parallèles, « We plan in winter. We build while you're away. » ; le paragraphe ne dit plus que le fait (condos, mai, 1er octobre) |
| Les photos de l'année et de la famille restaient blanches au défilement (le masque d'ouverture empêchait leur chargement) | 🔴 | Volet de la couleur du fond posé sur le cadre ; voir ACCESSIBILITE.md |

## Cohérence

| Élément | Règle | Vérifié |
|---|---|---|
| Couleurs | noir, blanc, Stone, et la couleur de leur piscine seulement pour la saison (arc, fenêtre d'absence, focus sur noir) | ✅ |
| Boutons | un seul style plein (noir), inversé au survol ; les liens secondaires soulignés | ✅ |
| Photos | jamais agrandies ; une légende courte sous chaque photo des pièces ; le lieu seulement quand leur site le donne | ✅ |
| Avis | les sept, mot pour mot, chacun une seule fois, à l'endroit où il prouve quelque chose | ✅ |
| Mouvement | une seule courbe pour les ouvertures, une seule pour les survols ; rien ne flotte, rien ne suit la souris | ✅ |

## Ce qui marche bien

- **L'accueil en Z** : la photo devient une ponctuation de la phrase. On n'a jamais vu ça chez un constructeur de Naples.
- **Le cadran** : il dit en une image ce que leur ancien site enterrait dans un paragraphe (mai, 1er octobre, chaque jour
  sur place), et il sait quel jour on est. En octobre, il dit que c'est le moment de préparer l'été suivant, ce qui est
  exactement le conseil de Zynda (« the earlier the better »).
- **Les avis mis en situation** : « on time » et « Oct 1 » sous le 1er octobre, « pictures and progress emails » sous
  l'été. Ils prouvent la méthode au lieu de décorer un carrousel.
- **Le logo** : leur vrai emblème et leur vrai mot « ZYNDA », vectorisés au pixel près, nets à toutes les tailles.

## Relecture des textes d'interface

| Élément | Texte | Pourquoi |
|---|---|---|
| Bouton principal (en-tête, accueil, menu) | **Plan a consultation** | Le même partout ; c'est aussi le titre de la section où il mène |
| Bouton du formulaire | **Email my request** | Dit ce qui se passe vraiment (la messagerie s'ouvre), au lieu de « Submit » |
| Sous le bouton | This opens your email app with your request written out, addressed to Zynda. Nothing is sent until you press send. | Rassure avant le clic |
| Après le clic | Your email app should open with your request written out. If it didn't, email Zyndacustomhomes@gmail.com or call (239) 213-1314. | Donne la sortie si rien ne s'ouvre |
| Erreurs | Enter your name. / Enter your email so we can reply. / Check the email address: it should look like name@example.com. | Ce qui manque et comment corriger, sans excuse |
| Fenêtre d'absence | Away from May to October. That covers the whole condo season. | Reformule le choix en clair, et dit ce qu'il implique |
| Ligne du jour (hors saison) | Today is October 18. The next condo season starts in May, and the earlier we plan, the sooner we start. | Leur conseil, au bon moment de l'année |
| Ligne du jour (en saison) | Today is July 7: condo season is under way, 86 days until October 1st. | Un fait utile, calculé |
| Visionneuse | Previous / Next / Close, « 3 of 12 » | Les mots attendus |
| Menu du téléphone | Menu / Close | Le bouton dit ce qu'il fera |
| Licence | Check the state record | Une action, vers la fiche officielle de la licence |
| Recrutement | We're hiring experienced labor and carpenters. Apply by email | Leur annonce, avec l'action |

**Alternatives écartées** pour le bouton principal : « Get a free estimate » (un des boutons de leur accueil actuel, mais
leurs projets vont de 100 000 à plus de 7 000 000 $ et commencent par une rencontre ; leur site dit d'ailleurs surtout
« Schedule a Consultation » et « Request a Remodeling Consultation », repris ici), « Contact us » (vague), « Start your
project » (trop générique).

## À fournir par Zynda (pour aller plus loin)

1. **Des photos récentes de condos finis**, idéalement d'un même appartement avant et après l'été : c'est leur cœur de
   métier, et le site n'en montre qu'une (le chantier face au golfe).
2. **Les lieux des photos** (quartier ou immeuble) quand le client est d'accord : les légendes deviendraient des preuves.
3. **La confirmation de l'adhésion à la CBIA**, pour pouvoir l'afficher.
4. **L'accord des clients** pour signer les avis d'un prénom.
