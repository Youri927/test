## Revue de design : nouveau site Mad River Pools

Revue faite sur des captures écran par écran, en défilant pour de vrai :
- ordinateur : 1440 × 900 ;
- téléphone : 390 × 844 ;
- contrôles ponctuels à 320, 768 et 1024 px.

Stade : version finale. Tout ce qui est marqué « corrigé » est fait dans cette version.

### Impression générale
On comprend en deux secondes qu'on est chez un constructeur de piscines sérieux :
- le slogan en très grand ;
- le plan de la piscine qui se dessine puis se remplit d'une vraie photo ;
- un seul bouton orange.

Le plus gros manque était sur téléphone : les preuves les plus fortes (avant/après, photos des formes) y étaient trop petites ou hors de l'écran.

### Utilisabilité
| Constat | Gravité | Correction |
|---------|---------|------------|
| Téléphone : les photos avant/après faisaient environ 150 px de large, côte à côte. La meilleure preuve de la rénovation était vue en vignette. | 🟡 Moyen | Corrigé : l'avant et l'après passent l'un sous l'autre, en pleine largeur. L'après se dévoile toujours sur place. |
| Téléphone et tablette : la photo de « Vinyl liner shapes » était au-dessus de la liste. En choisissant une forme plus bas, la photo changeait hors de l'écran. | 🟡 Moyen | Corrigé : la photo reste en haut de l'écran, avec sa légende, pendant qu'on parcourt les formes. Elle suit l'en-tête quand il s'efface, et sa hauteur est limitée à 38 % de l'écran sur tablette. |
| Téléphone : 22 photos de chantiers sur deux colonnes, soit trois écrans de galerie avant la suite. | 🟢 Mineur | Corrigé : 11 photos (une rangée pleine), puis un bouton « Show all 22 photos ». Un filtre montre toujours toutes les photos du type choisi. |
| 320 px : « Free home visit » passait sur deux lignes dans la barre d'appel, ainsi qu'un onglet de la rénovation. | 🟢 Mineur | Corrigé : marges intérieures réduites sur les petits écrans. Aucun bouton ne passe à la ligne de 320 à 1440 px. |
| Formulaire : « Send my request » laissait croire à un envoi direct, alors que le bouton ouvre la messagerie. | 🟢 Mineur | Corrigé : « Email my request », avec la note juste à côté (voir « Textes d'interface »). |

### Hiérarchie visuelle
- **Ce qui attire l'œil d'abord :** le slogan, puis le plan photo de la piscine et du spa. C'est le bon ordre : la marque, puis la preuve.
- **Parcours de lecture :**
  1. trois façons de construire ;
  2. délais ;
  3. formes à l'échelle ;
  4. spas et terrasses ;
  5. rénovation ;
  6. galerie ;
  7. propriétaire et licence ;
  8. financement ;
  9. questions ;
  10. visite gratuite.

  Chaque section répond à la question que la précédente fait naître.
- **Mise en avant :**
  - un seul orange par écran, réservé à la demande de visite ;
  - le reste en encre et en bleu « pool ».
- **Corrigé :** l'en-tête « Spas, decks and everything around the pool. » n'avait pas de texte à droite, contrairement aux autres sections, d'où un grand vide sur ordinateur. Une phrase d'introduction tirée du contenu réel a été ajoutée.
- **Corrigé :** la photo de nuit derrière « Book a free home visit » était trop assombrie pour se lire. Le voile est plus léger : on voit la piscine éclairée en bleu et les transats. Tous les textes de la section restent au-dessus de 4,5:1, mesurés sur les pixels réels, sur ordinateur et sur téléphone.

### Cohérence
| Élément | Constat | Correction |
|---------|---------|------------|
| Verbes d'action | « Talk about a new look » au milieu de « Ask about your liner / fiberglass pool / concrete pool ». | Corrigé : « Ask about a new look ». |
| Contours de focus | Bleu canard partout, y compris sur les fonds sombres où il ne se voyait plus. | Corrigé : bleu clair sur les fonds sombres. Triple contour sur les photos de la galerie. |
| Bords sur fond sombre | Cases et champs à 28–30 % de blanc, trop discrets. | Corrigé : 50 %, au même niveau partout (cases, champs, visionneuse, barre d'appel). |
| Typographie | Une seule famille (Mona Sans) : la largeur varie avec le rôle (titres larges, texte normal). Échelle tenue d'un bout à l'autre. | Rien à changer. |
| Rayons | Photos à 28 px, petites photos à 18 px, boutons en pilule : trois rayons, chacun pour un rôle. | Rien à changer. |

### Fluidité de l'ouverture
Elle a été mesurée image par image en filmant la vidéo de présentation.

**Le slogan s'élargissait par petits sauts**, avec des arrêts : des pas de 2 à 6 px au lieu d'un mouvement continu. Il y avait deux causes :
- Chrome arrondit `font-stretch` par crans de 0,25 % ;
- sous Linux et Android, les chasses des lettres sont arrondies au pixel.

**Corrigé :** l'axe de largeur de la police est animé directement (`font-variation-settings: "wdth"`), et le titre utilise `text-rendering: geometricPrecision`. Mesuré sur la capture, le bord du slogan avance maintenant par pas qui décroissent régulièrement (22, 20, 19… 1 px), sans arrêt.

### Accessibilité
- **Contrastes :** tout le texte passe de 4,77:1 à 17,7:1 (détail dans `ACCESSIBILITE.md`).
- **Cibles tactiles :** 44 px partout sur téléphone, sauf trois liens dans des phrases (exemptés) et deux liens du pied de page à 29 px.
- **Lisibilité :**
  - texte courant à 17 px, interligne 1,55, lignes de moins de 75 caractères ;
  - les petites mentions (13 à 14,5 px) restent au-dessus de 4,5:1.

### Ce qui marche bien
- **Le plan de la piscine :** il se dessine à l'ouverture puis se remplit de vraies photos. Le même langage revient ensuite :
  - le graphique « From dig to deck » ;
  - les formes de liner dessinées à l'échelle ;
  - le logo.
  
  On ne le confond avec aucun autre site de piscinier.
- **« Vinyl liner shapes, drawn to scale » :** 8 vrais bassins installés, à la même échelle en pieds, avec leur photo. C'est un contenu que les concurrents n'ont pas, et il répond à la vraie question du client : « quelle taille pour mon jardin ? ».
- **La phrase « One call covers the whole project »** et ses 9 éléments surlignés : un argument fort mis en forme comme un titre, pas comme une liste de puces.
- **La confiance est donnée par des faits vérifiables :**
  - 1998 ;
  - la licence CPC 1457780 avec le lien vers le registre de Floride ;
  - le revendeur Latham ;
  - les délais par type de piscine.

### Recommandations prioritaires
1. **Photos du propriétaire et de l'équipe :** la section « The owner supervises every job » n'a pas de visage. Une vraie photo de Mike Ramée sur un chantier renforcerait la confiance plus que n'importe quel texte. À demander au client : aucune n'est publiée aujourd'hui.
2. **Avis clients :** le site actuel n'en affiche aucun. Si le client a des avis Google, un bloc d'avis réels, cités tels quels avec leur source, compléterait les faits.
3. **Logo vectoriel :** le logo du site est redessiné à partir du plan (rectangle et cercle). Il faut le valider avec le client ou le remplacer par son logo officiel en SVG.

---

## Textes d'interface

Contexte :
- lecteurs : propriétaires de maisons du centre de la Floride qui envisagent une piscine, un spa ou une rénovation ;
- ton : direct, chaleureux, sans jargon ;
- langue : anglais (américain) ;
- vocabulaire du métier gardé tel quel (gunite, vinyl liner, spool, Kool Deck).

### Textes retenus
- **Bouton principal (en-tête, accueil, barre d'appel) :** « Free home visit » / « Book a free home visit ».
- **Envoi du formulaire :** « Email my request ».
- **Note sous le bouton :** « Opens your email app with the request written out, ready to send to madriverpool@gmail.com. »
- **Erreur du formulaire :** « To send your request, add your first name, your last name, a valid email address and a phone number with its area code. »
  - le message ne cite que les champs manquants ;
  - le curseur va au premier d'entre eux.
- **Délai de réponse :** « Tell us about your project. We aim to reply within 48 hours. » Le site actuel dit « we will do our best to respond within 48 hours » : on ne promet pas plus.
- **Galerie sur téléphone :** « Show all 22 photos » (le nombre est calculé).
- **Statut :** « Open now » / « Closed now », à l'heure de Maitland (lundi au vendredi, 9 h à 17 h).
- **Liens de section :** « Ask about a concrete pool », « Ask about your liner », « Ask about a new look »… Ils mènent au formulaire et y cochent le bon sujet.

### Variantes étudiées pour le bouton d'envoi
| Option | Texte | Ton | Quand l'utiliser |
|--------|-------|-----|------------------|
| A (retenue) | Email my request | Direct, honnête | Tant que le formulaire ouvre la messagerie (`mailto:`) |
| B | Send my request | Neutre | Si le formulaire est branché à un vrai envoi (service de formulaires, CRM) |
| C | Request my free visit | Engageant | Avec un vrai envoi, pour reprendre le mot « visit » du titre |

### Pourquoi
- Le bouton dit exactement ce qui va se passer : la messagerie s'ouvre.
- La note juste à côté évite la surprise.
- Le même verbe (« Ask about… ») mène partout au formulaire.
- Le même nom (« free home visit ») suit tout le parcours, du bouton de l'en-tête au titre du formulaire.
- Les erreurs disent quoi corriger, sans s'excuser.

### Notes pour une traduction
- « Kool Deck », « PebbleTec », « Diamond Brite », « Beadcrete » et « Latham » sont des marques : à garder telles quelles.
- « Dig to deck » est une expression du métier (du terrassement à la terrasse finie). En français : « du terrassement à la plage finie ».
- Les tailles sont en pieds (ft). Pour un public hors des États-Unis, ajouter les mètres entre parenthèses plutôt que convertir, car les formes viennent des catalogues américains.
- Prévoir +20 à 30 % de longueur en français et en espagnol. Les onglets de la rénovation et le bouton de la barre d'appel sont déjà à la limite à 320 px.
