# Respray : l'alternative à Perfumee

Respray est une plateforme de revente de parfums entre particuliers. Respray est l'intermédiaire : chaque annonce
comporte 6 photos imposées (dont le flacon vu de dessus avec le spray, puis la tige sans le spray), vérifiées par
l'équipe avant publication, et l'acheteur a 7 jours après la livraison pour vérifier son parfum. Pendant ce temps,
l'argent reste bloqué.

| Fichier | Contenu |
|---|---|
| `ANALYSE.md` | Perfumee de A à Z : la société, l'activité mesurée, la technique, le parcours, les frais, ce que disent leurs CGU, ce qui leur manque, les concurrents, les sources |
| `STRATEGIE.md` | Le principe de Respray, ce qui change par rapport à Perfumee, les photos obligatoires, la vérification, l'après-achat, les frais, ce qu'il faut régler avant de lancer |
| `src/` | Le prototype (HTML, CSS et JavaScript, sans dépendance) |
| `src/atelier3d.js` | L'atelier 3D : les flacons, leurs matières et la lumière, partagés par l'outil de rendu et l'animation de la vérification |
| `src/verif3d.js` | La vérification en 3D (page « Comment ça marche ») : le flacon en direct, la caméra qui va d'un point de contrôle à l'autre |
| `src/visuels.js` | L'affichage des photos des annonces (de face, dessous, niveau, vue de dessus avec le spray, tige, preuve, boîte, ticket) et du flacon qui vaporise |
| `photos/` | Les photos du prototype : 157 rendus 3D de flacons génériques (une image par annonce et par vue, le flacon opaque à contre-jour, la porte « Vendre » en clair et en sombre), et `mesures.json` |
| `tools/rendus/` | Le programme qui produit ces rendus (three.js dans Chromium, sans carte graphique) |
| `dist/index.html` | Le prototype en un seul fichier (1,3 Mo, police, logo et photos compris), à ouvrir d'un double-clic |
| `dist/artifact.html` | Le même, sans l'enveloppe HTML, pour la publication en page Claude |
| `marque/` | Le logo (symbole, mot, logo complet clair et sombre, icône d'application, favicon) et `DA.md`, la direction artistique |
| `tools/logo.py` | Le programme qui dessine le logo et toutes ses déclinaisons |
| `vendor/fonts/` | Inter (licence OFL) |

## Le prototype

| Adresse | Ce qu'on y voit |
|---|---|
| `#accueil` | Deux portes côte à côte, Acheter (recherche, fil des dernières vérifications) et Vendre (le flacon qui vaporise) : celle qu'on survole s'agrandit. Puis le ruban des annonces, filtrable par maison ; une annonce décortiquée qui montre, point par point, ce qui protège la vente ; et la liste « vérifiez-le en 5 gestes » à cocher, avec le reste du guide en panneau |
| `#recherche` | Les annonces, avec des filtres (genre, état, contenance, prix, marque, main propre) et un tri |
| `#annonce-a101` | Une annonce : les photos obligatoires (vue de dessus et tige comprises), chacune avec une légende qui dit ce qu'elle prouve, le prix au ml, les détails, la livraison, le total, l'achat, l'offre, la protection acheteur, le vendeur (ventes conformes, délai d'envoi, avis vérifiés), ce que l'équipe a vérifié |
| `#vendre` | Le formulaire de vente : maison et parfum choisis dans la liste ou proposés (avec « Vouliez-vous dire… ? »), l'état, les 6 photos obligatoires avec leur exemple, le prix |
| `#fonctionnement` | Le parcours vendeur et acheteur en défilement, avec une scène animée par étape ; les photos obligatoires et l'astuce du flacon opaque ; la vérification en 3D (le bouchon se lève, le spray s'enlève, le niveau, le code lot) ; les 7 jours, les signalements, les avis, un calculateur des frais, les interdits, la FAQ |
| `#marque` | L'identité : le symbole et sa construction, les versions du logo, l'icône, les couleurs (code copiable), la typographie, les photos, les éléments, le ton |
| `#panel` | Le panel équipe : les annonces à vérifier (contrôles, publier, refuser avec une raison) et les maisons ou parfums proposés (correction des majuscules, détection des doublons, ajout à la liste) |

Le catalogue reprend de vrais parfums (maison, nom, année) ; les prix neufs sont indicatifs. Les annonces, les
vendeurs et les avis sont inventés. Les photos sont des rendus 3D de flacons génériques : elles tiennent la place des
photos que prendront les vendeurs, et aucun flacon de marque n'est reproduit. Aucun paiement n'est possible.

Le site suit l'appareil, en clair ou en sombre (un graphite chaud, pas du noir) ; le bouton de l'en-tête force l'un ou
l'autre, et le choix est gardé. Il marche sur téléphone comme sur ordinateur. Les changements de page sont fondus
(View Transitions), et toutes les animations s'arrêtent si l'appareil demande moins de mouvement. Ce que fait
l'équipe dans le panel est gardé dans le navigateur : « Remettre l'exemple à zéro » repart de l'état initial.

La vérification en 3D charge three.js (0.169.0) depuis cdn.jsdelivr.net quand on arrive dessus. Sans connexion, ou
sans WebGL, la photo et ses repères fixes restent à la place, et les points se choisissent de la même façon.

## Reconstruire

```bash
node build.mjs
```

Le logo se redessine avec `python3 tools/logo.py` (il faut `pip install fonttools brotli`).

Les photos se refont avec les commandes ci-dessous (environ 40 secondes ; il faut Playwright et son Chromium). Elles
sont relues dans `src/data.js` : une nouvelle annonce y a ses photos au prochain rendu.

```bash
cd tools/rendus && npm install && node rendre.cjs
```
