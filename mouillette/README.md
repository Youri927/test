# Mouillette : l'alternative à Perfumee

Mouillette (nom de travail) est une marketplace de parfums de seconde main où chaque flacon est **pesé**, son code
lot **décodé**, sa **cote** affichée, et son authenticité **garantie par la plateforme**. Elle répond à ce qui
manque à Perfumee.fr, analysé en détail dans ce dossier.

| Fichier | Contenu |
|---|---|
| `ANALYSE.md` | Perfumee de A à Z : la société, l'activité mesurée (7 401 annonces, ≈ 1 000 par mois), la technique (Sharetribe), le parcours, les frais (15 %), ce que disent les CGU, les 18 manques, les concurrents (Reflaco, Mïron, Vinted, Spritz…), les sources |
| `STRATEGIE.md` | Le positionnement, la réponse à « Perfumee existe déjà ? », le nom, les 7 piliers, le comparatif, le modèle économique chiffré, le cadre légal, la technique, le lancement, le calendrier, les risques |
| `src/` | Le prototype (HTML, CSS, JavaScript sans dépendance) |
| `dist/index.html` | Le prototype en un seul fichier (335 Ko, polices comprises), à ouvrir d'un double-clic |
| `dist/artifact.html` | Le même, sans l'enveloppe HTML, pour la publication en page Claude |
| `vendor/fonts/` | Bodoni Moda, Instrument Sans, Martian Mono (licence OFL, sous-ensemble latin) |

## Le prototype

À ouvrir : `dist/index.html`. Toutes les vues ont leur adresse :

| Adresse | Ce qu'on y voit |
|---|---|
| `#accueil` | La promesse, la fiche d'évaluation d'un flacon, la cote du jour, les flacons authentifiés, les trois niveaux de vérification, la vente en une minute, ce qu'on refuse, le comparatif des frais |
| `#recherche` | Par parfum ou par flacon ; filtres : vérification, état, niveau minimum, maison, main propre ; tri au prix par millilitre ou à l'écart à la cote |
| `#parfum-baccarat-rouge-540` | La fiche d'un parfum : cote, courbe sur 12 mois avec le prix neuf, toutes les offres triées au millilitre, notes, tenue, « à savoir », alerte |
| `#annonce-m4127` | Une annonce : flacon gradué au niveau mesuré, photos guidées, livraison, option Atelier, récapitulatif au centime, offre, garantie, rapport de vérification, vendeur noté sur des faits |
| `#vendre` | La vente guidée : scan, pesée (les ml se calculent), photos, prix conseillé avec la chance de vendre, mode de vente |
| `#passeport-MO-004127` | Le passeport d'un flacon scellé : identité, mesures, historique, sans donnée personnelle |
| `#confiance` | L'Atelier étape par étape, la garantie, la dilution, le transport, les marques, la Conciergerie |
| `#tarifs` | Tous les frais, et un simulateur face au modèle 10 % + 5 % |
| `#etagere` | L'étagère d'une utilisatrice : valeur à la cote, vente en un geste, alertes, une proposition d'échange |

**Ce qui est réel et ce qui ne l'est pas** : le catalogue reprend de vrais parfums (maison, année, parfumeur, notes)
pour que le prototype se lise comme le vrai site ; les prix neufs sont indicatifs. Les annonces, les vendeurs, les
cotes, les codes lot et les passeports sont inventés, et le site le dit sur chaque page. Les flacons sont dessinés,
de formes génériques : aucun visuel ni flacon de marque n'est reproduit. Aucun paiement n'est possible.

Mode clair et sombre, téléphone et ordinateur, navigation au clavier, animations coupées si l'appareil le demande.

## Reconstruire

```bash
node build.mjs
```

## Avant d'aller plus loin

1. **Le transport** : trouver le transporteur qui accepte les flacons de parfum en « quantités limitées » pour des
   envois de particuliers, sous le compte de la plateforme. C'est le point qui conditionne tout le reste.
2. **L'avocat** : CGU, garantie commerciale, statut d'hébergeur, droit des marques (Chanel c. Easy Cash, 2023).
3. **Le nom** : dépôt INPI et EUIPO, domaines, comptes Instagram et TikTok.
4. **La base de parfums** : licence (Fragella ou équivalent).
5. **L'assureur** : colis et fonds de garantie.
