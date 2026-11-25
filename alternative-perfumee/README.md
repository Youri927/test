# Respray : l'alternative à Perfumee

Respray est une plateforme de revente de parfums entre particuliers. Respray est l'intermédiaire : chaque annonce
comporte des photos imposées, vérifiées par l'équipe avant publication, et l'acheteur a 7 jours après la livraison
pour vérifier son parfum. Pendant ce temps, l'argent reste bloqué.

| Fichier | Contenu |
|---|---|
| `ANALYSE.md` | Perfumee de A à Z : la société, l'activité mesurée, la technique, le parcours, les frais, ce que disent leurs CGU, ce qui leur manque, les concurrents, les sources |
| `STRATEGIE.md` | Le principe de Respray, ce qui change par rapport à Perfumee, les photos obligatoires, la vérification, l'après-achat, les frais, ce qu'il faut régler avant de lancer |
| `src/` | Le prototype (HTML, CSS et JavaScript, sans dépendance) |
| `dist/index.html` | Le prototype en un seul fichier (99 Ko, police comprise), à ouvrir d'un double-clic |
| `dist/artifact.html` | Le même, sans l'enveloppe HTML, pour la publication en page Claude |
| `vendor/fonts/` | Figtree (licence OFL) |

## Le prototype

| Adresse | Ce qu'on y voit |
|---|---|
| `#accueil` | La promesse, la recherche, les dernières annonces, les marques, comment ça marche |
| `#recherche` | Les annonces, avec des filtres (genre, état, contenance, prix, marque, main propre) et un tri |
| `#annonce-a101` | Une annonce : les photos obligatoires, le prix au ml, les détails, la livraison, le total, l'achat, l'offre, la protection acheteur, le vendeur, ce que l'équipe a vérifié |
| `#vendre` | Le formulaire de vente : le parfum choisi dans la liste, l'état, les photos obligatoires, le prix |
| `#fonctionnement` | Les photos obligatoires, la vérification, l'après-achat, les signalements, les frais, les interdits, la FAQ |

Le catalogue reprend de vrais parfums (maison, nom, année) ; les prix neufs sont indicatifs. Les annonces, les
vendeurs et les avis sont inventés. Les visuels sont dessinés et tiennent la place des photos que prendront les
vendeurs ; aucun visuel de marque n'est reproduit. Aucun paiement n'est possible.

Le site fonctionne en clair et en sombre, sur téléphone comme sur ordinateur.

## Reconstruire

```bash
node build.mjs
```
