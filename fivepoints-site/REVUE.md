## Revue de design : nouveau site Five Points Roofing

Revue faite sur des captures écran par écran et en défilant pour de vrai :
- ordinateur : 1440 × 900, la page entière, puis 1000, 1024, 1100, 1180, 1280, 1680 et 1920 px de large ;
- téléphone : 390 × 844 (et 320, 360 px pour l'en-tête), la page entière ;
- contrôles automatiques à toutes les largeurs de 320 à 1920 px ;
- les états : l'ouverture, les trois toits (dessin qui se trace, onglets, repères survolés), les photos qui se
  découvrent, les questions ouvertes, les erreurs du formulaire, le message prêt, le menu du téléphone, le mouvement
  réduit.

Stade : version finale. Tout ce qui est marqué « corrigé » est fait dans cette version.

### Impression générale
On comprend en deux secondes chez qui l'on est :
- leur phrase, « Roofing is in our blood », écrite en grand sur les deux pentes d'un toit, avec l'étoile du logo au
  faîte (la pointe du haut de leur étoile est déjà un toit) ;
- sous ce toit, ce qu'ils font et où : « Roofs for homes, mobile homes and businesses across Polk County. » ;
- deux façons de les joindre : « Get a free estimate » et le téléphone ;
- trois preuves, alignées sous la photo d'une inspection : la licence de l'État, 10 ans de garantie, sur place sous
  cinq jours.

Le moment dont on se souvient vient ensuite, dans la partie des toits : une seule ligne de toit dorée qui passe des
deux pignons d'une maison au toit bas d'un mobile-home, puis au toit plat d'un bâtiment commercial entre ses
acrotères. Le bâtiment se transforme avec elle, et les repères numérotés montrent où chaque toit fuit, d'après leurs
propres textes. C'est leur vraie singularité dans le comté de Polk (les mobile-homes) mise en forme, pas un effet.

Le reste est calme :
- un fond clair et froid, l'asphalte et l'or de leur logo ;
- une seule famille de lettres, Saira, condensée pour les titres, étendue dans le logo ;
- de vraies photos, petites (leur site n'en a pas de plus grandes), légendées pour ce qu'elles montrent ;
- deux parties sombres seulement : la tempête, et le pied de page, où le toit de l'accueil revient au-dessus du
  numéro de téléphone.

Les plus gros défauts trouvés par cette revue :
- les photos ne s'affichaient jamais (le navigateur ne charge pas une image entièrement masquée) ;
- après le premier tracé du dessin, les détails de la maison restaient affichés sur le mobile-home et le commercial ;
- le texte des étapes de la tempête était invisible (asphalte sur asphalte).

### Utilisabilité
| Constat | Gravité | Correction |
|---------|---------|------------|
| Les photos qui se découvrent à la pente restaient vides : Chrome ne charge pas une image en chargement différé tant qu'elle est entièrement masquée. | 🔴 Critique | Corrigé : chaque photo est demandée un peu avant d'arriver à l'écran, et ne se découvre qu'une fois décodée. Un essai vérifie les 8 photos. |
| Les trois toits : après le premier tracé, la cheminée, le tuyau et le puits de lumière de la maison restaient visibles sur le mobile-home et le commercial (l'animation gardait son état final). | 🔴 Critique | Corrigé : les animations du tracé sont annulées une fois finies. Un essai vérifie que rien de la maison ne reste à l'écran. |
| Les quatre étapes de la tempête n'avaient pas de texte visible : une règle prévue pour les étapes sans titre les passait en asphalte, sur fond asphalte. | 🔴 Critique | Corrigé : la règle ne vise plus que les étapes sans titre. |
| Pied de page : le numéro de téléphone touchait les deux rampants du toit. | 🟡 Moyen | Corrigé : le numéro est en bas, là où le toit est le plus large. Un essai vérifie, de 1000 à 1920 px, que le titre de l'accueil et le numéro restent sous leurs toits. |
| Le dessin des toits était petit et maigre, avec des repères de 8 px au téléphone. | 🟡 Moyen | Corrigé : cadré sur le dessin, le bâtiment a un corps qui suit la ligne de toit ; les repères gardent au moins 13 px de rayon à l'écran. |
| Au téléphone, aucun moyen d'appeler depuis l'en-tête : seulement le menu. | 🟡 Moyen | Corrigé : un bouton « Call » sous 1000 px, à côté du menu, de 320 à 999 px. |
| L'estimation : sous les coordonnées, une grande colonne vide à côté du formulaire. | 🟢 Mineur | Corrigé : « What happens next », trois étapes tirées de leurs engagements (le rappel, l'inspection gratuite sous cinq jours, le devis détaillé). |
| Entre 1100 et 1280 px, l'en-tête (le logo, cinq liens, le téléphone, le bouton) se serrait. | 🟢 Mineur | Corrigé : le numéro de l'en-tête se retire entre 1100 et 1280 px. Un essai vérifie la ligne à 1100, 1180 et 1280 px. |
| Téléphone : l'adresse e-mail se coupait au milieu d'un mot. | 🟢 Mineur | Corrigé : elle passe à la ligne après « @ ». |
| Réponses des questions jusqu'à 91 caractères par ligne à 1440 px. | 🟢 Mineur | Corrigé : 71 caractères par ligne au plus, de 320 à 1920 px. |
| La règle des garanties : les grandes graduations ne tombaient pas sous 10, 20 et 30 ans. | 🟢 Mineur | Corrigé : chaque graduation est accrochée à son chiffre. |

### Hiérarchie visuelle
- **Ce qui attire l'œil d'abord** : les mots sur les pentes du toit, puis le titre posé dessous. C'est juste : la phrase
  de la famille d'abord, l'offre tout de suite après, sans bandeau photo générique.
- **Le parcours de lecture** : le toit, le titre, la phrase d'accueil et les deux boutons, la photo de l'inspection,
  puis les trois preuves. Ensuite, une partie par question qu'un propriétaire se pose : quel toit, que faire après une
  tempête, réparer ou remplacer, ce qui est garanti, qui ils sont, ce que disent les clients, où, combien de temps.
- **L'accent** : l'or est réservé au toit (l'accueil, la ligne de toit, le pied de page), aux barres des garanties et
  au numéro de licence. Il n'écrit jamais de texte sur fond clair (il y devient or foncé, 5,3:1).
- **Corrigé** : trop d'air entre les parties (près de 300 px) ; la licence en carte blanche à liseré, trop « modèle »,
  devenue une plaque asphalte au numéro d'or ; le logo de l'en-tête trop petit (« ROOFING » faisait 7 px).

### Cohérence
| Élément | Constat | Correction |
|---------|---------|------------|
| Titres | Les titres de partie et les panneaux suivent la même échelle (Saira condensée, 760). | — |
| Photos | Toutes légendées de la même façon, toutes affichées à 60 % de leur largeur au plus sur ordinateur, jamais agrandies (vérifié au téléphone). | — |
| Mouvement | Un seul geste pour toutes les photos : un bord à la pente du toit (6/12) qui monte, une fois. Les boutons répondent au survol par le même biais. | — |
| Contours | Les champs et les choix du formulaire avaient un contour gris trop pâle (2,61:1). | Corrigé : 3,6:1. |
| Avis | Le premier avis, en grand, laissait vide la moitié droite. | Corrigé : la photo d'un toit fini, la camionnette encore dans l'allée. |

### Accessibilité
- **Contrastes** : tout le texte au-dessus du seuil, mesuré sur les vrais pixels (le pire : 3,75:1 pour « Lakeland »
  en or foncé de 47 px, grand texte).
- **Cibles** : toutes au-dessus de 24 px ; les boutons et les onglets font 44 à 54 px.
- **Lisibilité** : texte courant en 18 px, interligne 1,6, 71 caractères par ligne au plus.
- **Textes alternatifs** : les 9 photos sont décrites ; le dessin des toits est décoratif (sa liste dit tout).
- Détail dans `ACCESSIBILITE.md`.

### Ce qui marche
- Le toit de mots est leur phrase, leur logo et leur métier en une seule image, sans illustration : rien qui fasse
  « dessin d'IA ».
- La ligne de toit qui se transforme répond à un geste et explique quelque chose (chaque toit fuit à sa façon).
- Les preuves sont vérifiables : la licence est sur le site de l'État (lien direct), et sur la camionnette en photo.
- Tout tient dans un fichier de 760 Ko, sans bibliothèque à part Lenis ; 0,31 s pour l'affichage du contenu principal
  sur un téléphone ralenti, aucun décalage.

### Recommandations restantes
1. **Les photos d'origine** : leur site ne sert que des images de 550 à 750 px. Avec leurs originaux, la rangée des
   chantiers et l'accueil pourraient montrer les photos deux fois plus grandes, sans rien changer d'autre.
2. **Des photos de mobile-homes et de toits plats** : ils n'en ont aucune en ligne. Le dessin les remplace ; une vraie
   photo par onglet ferait encore mieux.
3. **Avant la mise en ligne** : faire valider par Angela Ray les engagements repris de leur site (sur place sous cinq
   jours, les durées de garantie, le financement), et tester la page avec un vrai lecteur d'écran.

---

## Relecture des textes d'interface

Contexte : des propriétaires du comté de Polk, souvent après une fuite ou une tempête, parfois inquiets, sur leur
téléphone. Ton : direct, concret, rassurant sans promesse en l'air. Les textes reprennent leur site, raccourcis ;
rien n'est inventé.

### Les textes retenus
- **Titre de l'accueil** : « Roofs for homes, mobile homes and businesses across Polk County. »
- **Bouton principal** : « Get a free estimate » (le même mot dans l'en-tête, « Free estimate », et en titre du
  formulaire).
- **Lien secondaire** : « or call 863-660-5834 » ; au téléphone, le bouton « Call ».
- **Onglets** : « Homes », « Mobile homes », « Commercial ».
- **Aide du dessin** : « The numbers on the drawing match the list. »
- **Bouton du formulaire** : « Write my request », puis « Your request is ready. » et « Copy the request » →
  « Copied. Paste it into an email to fivepointsroofingfl@gmail.com. »
- **Erreurs** : ce qui manque et comment le corriger :
  - « Choose the kind of property. » ;
  - « Enter the address of the property. » ;
  - « Enter your name. » ;
  - « Enter a phone number or an email address, so we can reach you. » ;
  - « Check the email address: it should look like name@example.com. »
- **Note du formulaire** : « This opens your email app with your request filled in, addressed to
  fivepointsroofingfl@gmail.com. Nothing is sent from this page. » (honnête : il n'y a pas de serveur).

### Variantes écartées
| Option | Texte | Pourquoi pas |
|--------|-------|--------------|
| A | « Submit » | Ne dit pas ce qui se passe (l'application d'e-mail s'ouvre). |
| B | « Send my request » | Faux : rien n'est envoyé depuis la page. |
| C | « Get your free quote today! » | Ton publicitaire ; « estimate » est le mot de leur site. |
| D | « The top rated roofing company in Lakeland » | Leur ancien bandeau : invérifiable. |

### Corrigé à la relecture
- « And the communities around these towns. » (phrase sans verbe sous le titre de la zone) → « We work in these
  towns, and in the communities around them. »
- Les engagements écrits partout de la même façon : « within five days or less », « free inspection », « 10-year
  workmanship warranty ».

### Notes pour la traduction
- « Reroof » (une couche neuve sur l'ancienne) n'a pas d'équivalent court : à traduire par une périphrase.
- « No Dollar Limit » est le nom de la garantie du fabricant : à garder tel quel.
