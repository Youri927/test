# Le kit de marque Respray

Tout ce qu'il faut pour publier sans montrer son visage : des séquences vidéo prêtes à monter et un studio pour les visuels.

## Les vidéos (`videos/`)

Format vertical 1080 × 1920 en 30 images par seconde, prêtes pour TikTok, Reels et Shorts.

| Fichier | Durée | Où la placer |
|---|---|---|
| `intro.mp4` | 2,4 s | Au début d'une vidéo : le symbole se trace, le jet part, puis « respray » apparaît. |
| `fin-vendeurs.mp4` | 3,6 s | À la fin des vidéos pour les vendeurs : « Vends tes parfums sans commission. » puis respray.fr/fondateurs et le sceau. |
| `fin-acheteurs.mp4` | 3,6 s | À la fin des vidéos pour les acheteurs : « Le parfum de seconde main, sans le doute. » puis respray.fr. |
| `serie-on-a-verifie.mp4` | 2,4 s | Ouverture de la série « On a vérifié » (vert). |
| `serie-vrai-ou-faux.mp4` | 2,4 s | Ouverture de la série « Vrai ou faux ? » (rose). |
| `serie-combien-ca-vaut.mp4` | 2,4 s | Ouverture de la série « Combien ça vaut ? » (ambre). |
| `serie-vide-ton-placard.mp4` | 2,4 s | Ouverture de la série « Vide ton placard » (bleu-vert). |
| `serie-astuce-parfum.mp4` | 2,4 s | Ouverture de la série « Astuce parfum » (bois). |

**Pour monter une vidéo dans CapCut :**

1. Mettez l'ouverture de la série.
2. Ajoutez vos plans : les mains, le flacon, le dessous du flacon, l'écran de l'équipe.
3. Terminez par la fin vendeurs ou la fin acheteurs.

Chaque série garde toujours sa couleur, pour qu'on la reconnaisse avant même de lire.

## Les visuels : le studio

Le studio se trouve dans `studio.html`. Il est aussi publié en page privée. On y choisit un modèle, un format et un fond, on remplit les textes, on ajoute ses photos, puis on télécharge un PNG.

- **Les modèles :** les cinq séries, avec leurs couleurs.
  - « On a vérifié » : la photo de l'annonce, le verdict (Publiée avec le sceau, ou Refusée avec le tampon) et ce que l'équipe a vu.
  - « Vrai ou faux ? » : deux photos, A et B, et la question. La réponse est facultative, pour la garder pour la vidéo suivante.
  - « Combien ça vaut ? » : le prix au millilitre, neuf contre Respray, calculé tout seul.
  - « Vide ton placard » : l'appel aux vendeurs fondateurs.
  - « Astuce parfum » : un numéro, un titre et trois points.
- **Les formats :** story (9:16), publication (4:5) et carré.
- **Les fonds :** clair (crème) ou encre (le gris chaud du mode sombre).

Les photos et les textes de départ sont des exemples : remplacez-les toujours par les vôtres.

## Refaire ou modifier

Les sources sont dans `source/` :

- `video.html` : les scènes animées.
- `rendre-videos.cjs` : le rendu image par image et l'assemblage par ffmpeg.
- `studio.html` : le studio.
- `construire-studio.py` : y injecte le logo et les photos d'exemple.
- `mot.txt` : le tracé du mot « respray ».

Pour refaire les vidéos (il faut Playwright et ffmpeg) :

```bash
NODE_PATH=$(npm root -g) node kit/source/rendre-videos.cjs
```

Pour reconstruire le studio :

```bash
python3 kit/source/construire-studio.py
```
