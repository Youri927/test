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
| `src/visuels.js` | Les dessins qui tiennent la place des photos : de face, dessous, niveau, vue de dessus avec le spray, tige, preuve, boîte, ticket |
| `dist/index.html` | Le prototype en un seul fichier (176 Ko, police comprise), à ouvrir d'un double-clic |
| `dist/artifact.html` | Le même, sans l'enveloppe HTML, pour la publication en page Claude |
| `vendor/fonts/` | Figtree (licence OFL) |

## Le prototype

| Adresse | Ce qu'on y voit |
|---|---|
| `#accueil` | La promesse, la recherche, les dernières annonces, le module vendre / acheter (brume du spray, éventail d'annonces), les chiffres, le guide (vérifier à la réception, code lot, conservation, concentrations), les maisons |
| `#recherche` | Les annonces, avec des filtres (genre, état, contenance, prix, marque, main propre) et un tri |
| `#annonce-a101` | Une annonce : les photos obligatoires (vue de dessus et tige comprises), le prix au ml, les détails, la livraison, le total, l'achat, l'offre, la protection acheteur, le vendeur, ce que l'équipe a vérifié |
| `#vendre` | Le formulaire de vente : maison et parfum choisis dans la liste ou proposés (avec « Vouliez-vous dire… ? »), l'état, les 6 photos obligatoires avec leur exemple, le prix |
| `#fonctionnement` | Le parcours vendeur et acheteur en défilement, avec une scène animée par étape ; les photos obligatoires, la vérification, les 7 jours, les signalements, un calculateur des frais, les interdits, la FAQ |
| `#panel` | Le panel équipe : les annonces à vérifier (contrôles, publier, refuser avec une raison) et les maisons ou parfums proposés (correction des majuscules, détection des doublons, ajout à la liste) |

Le catalogue reprend de vrais parfums (maison, nom, année) ; les prix neufs sont indicatifs. Les annonces, les
vendeurs et les avis sont inventés. Les visuels sont dessinés et tiennent la place des photos que prendront les
vendeurs ; aucun visuel de marque n'est reproduit. Aucun paiement n'est possible.

Le site fonctionne en clair et en sombre, sur téléphone comme sur ordinateur. Les changements de page sont fondus
(View Transitions), et toutes les animations s'arrêtent si l'appareil demande moins de mouvement. Ce que fait
l'équipe dans le panel est gardé dans le navigateur : « Remettre l'exemple à zéro » repart de l'état initial.

## Reconstruire

```bash
node build.mjs
```
