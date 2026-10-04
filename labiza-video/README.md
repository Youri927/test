# La Biza : « Une journée à la Biza », vidéo de présentation du nouveau site (Remotion)

Vidéo de 68 s en français (1920 × 1080, 60 i/s) qui présente la refonte du site de la Ferme de la Biza (`../labiza-site/dist/index.html`).

**Le parti pris : un plan-séquence.**
- **Le site est filmé plein cadre**, sans navigateur ni téléphone autour, en un seul mouvement continu.
- **Aucune coupe ni transition** : la seule transition, c'est l'heure qui passe, puisque le site se lit comme une journée de mariage. On accélère entre les moments, avec un flou de mouvement, et on ralentit sur chacun, où la caméra avance doucement.
- **Pas de voix off** : des sous-titres en tiennent lieu.
- **La bande-son est celle d'une journée au domaine**, plutôt qu'une musique seule.
- **À la fin, la journée se rembobine** jusqu'au nom qui se lève de l'eau.

| Fichier | Usage |
| --- | --- |
| `renders/journee-a-la-biza-16x9.mp4` | la vidéo, avec le son (−14 LUFS) |
| `renders/journee-a-la-biza-16x9-muet.mp4` | la même, sans son |

| Temps | Heure | Ce qu'on voit | Ce qu'on entend |
| --- | --- | --- | --- |
| 0 – 4,6 s | 15 h | « La Biza » se lève de l'Aisne, au ralenti | la rivière, des oiseaux, le piano commence |
| 4,6 – 12,6 s | 15 h 30 | on descend vers le porche, on s'en approche, on entre | des pas sur le gravier, sous la voûte |
| 12,6 – 20,6 s | 16 h 30 | l'îlot, ses reflets ; la caméra avance vers l'arche et les chaises | le clapotis, une cloche au loin |
| 20,6 – 26 s | 18 h | le préau se dessine | des verres qui trinquent |
| 26 – 32 s | 20 h | la carte des trois menus s'incline sous la souris | les premiers grillons |
| 32 – 38 s | 23 h | la guirlande s'allume, ampoule par ampoule | une valse de guinguette au loin ; chaque ampoule claque |
| 38 – 43 s | 2 h | le gîte : les cinq chambres s'allument | une chouette, les interrupteurs, une nappe |
| 43 – 45,4 s | l'aube | le jour se lève pendant qu'on descend | le chœur de l'aube |
| 45,4 – 55 s | le lendemain | les portes « familles » et « entreprises » s'ouvrent au survol ; la note de 4,9/5 | le piano, plus clair |
| 55 – 61,4 s | — | une fente s'ouvre au milieu du plan : le même site sur mobile | — |
| 61 – 64 s | — | la journée se rembobine jusqu'au début | toute la journée réentendue à l'envers, très vite |
| 64 – 68 s | 15 h | le nom, à nouveau | le dernier accord |

Fabrication :

1. **Capture.** `npm run capture:site` filme le site avec Playwright (`capture/shots.mjs`), en temps simulé : l'horloge de la page avance d'exactement 1/60 s par image. Elle est ralentie au début du premier plan, pour que le nom se lève lentement.
   - La trajectoire de la journée (`capture/day.mjs`) donne la position de défilement à chaque instant du film.
   - Le trajet est découpé en cinq plans pour la sûreté de la capture, mais la page n'est jamais rechargée : la vidéo les enchaîne sans coupe.
   - Ordinateur en 2880 × 1620 (1920 × 1080 en 1,5×), mobile en 780 × 1688, dans `public/site/`. La position de défilement et la souris sont notées image par image.
2. **Son.** `npm run sound` synthétise toute la bande-son (`sound/day.mjs`), sans aucun échantillon ni droit tiers :
   - une valse lente au piano (Fa majeur) ;
   - les ambiances heure par heure, et une valse à l'accordéon au loin à 23 h ;
   - des souffles qui suivent la vitesse du défilement ;
   - les ampoules et les fenêtres, calées sur la même trajectoire que l'image ;
   - pour le retour en arrière, à chaque instant, le son du moment où la page était à la même hauteur à l'aller.
3. **Rendu.** `npm run build` rend la vidéo, normalise le son et crée la version muette.

Dans Remotion Studio (`npm run studio`) : `Journee` et `Journee-Muet`.

Après une modification du site, relancez `node build.mjs` dans `labiza-site`, puis `npm run capture:site`. Si la trajectoire change, relancez aussi `npm run sound`.
