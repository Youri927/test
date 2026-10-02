# L’Antre 2 Jeux — vidéos (Remotion)

## Présentation du nouveau site (16:9) — `npm run build:pres`

Vidéo de 50 s (1920×1080, 60 i/s) pour présenter la refonte du site à L'Antre 2 Jeux. Elle montre le **vrai site** (`../lantre2jeux-site/dist/index.html`), filmé image par image sur ordinateur et sur mobile, puis mis en scène dans un navigateur et des téléphones, avec des mouvements de caméra.

| Fichier | Usage |
| --- | --- |
| `renders/presentation-site-16x9.mp4` | présentation avec musique et bruitages (−14 LUFS) |
| `renders/presentation-site-16x9-muet.mp4` | même vidéo sans son |

| Temps | Séquence |
| --- | --- |
| 0 – 4,2 s | Ouverture : la torche du site révèle « Le nouveau site », escape game à Soissons, concept de refonte |
| 4,2 – 7,2 s | Le concept : « Une pièce plongée dans le noir », le parcours en six étapes |
| 7,2 – 14,4 s | 01 Le noir : la torche s'allume, balaie « Entrez. », puis suit la souris et révèle les indices du mur |
| 14,4 – 19,2 s | 02 L'affiche : les lignes se balaient de lumière, la date passe en « classée secrète » |
| 19,2 – 28,8 s | 03 Trois portes : Route 66 (néon), La Planque des Corleone (diamant 3D), Alerte Rouge (radar, compte à rebours) |
| 28,8 – 31,8 s | 04 Le verdict : 4,6/5 sur 62 avis, les mots des joueurs |
| 31,8 – 36 s | 05 Le cadenas : deux clics, le prix passe de 25 € à 21 € par joueur |
| 36 – 40,8 s | Sur mobile : la torche, une porte et le cadenas, au doigt |
| 40,8 – 44,4 s | L'identité : couleurs de lumière, Big Shoulders et Epilogue |
| 44,4 – 50,4 s | 06 La sortie : la porte s'ouvre sur la lumière, on la traverse, carton final |

Fabrication :

1. `npm run capture:site` filme le site avec Playwright (`capture/shots.mjs`). L'horloge de la page est simulée et avancée d'exactement 1/60 s entre deux images, et les animations CSS sont recalées dessus : les animations sont fluides et exactes. Les plans sont écrits dans `public/site/` (MP4 + trajectoire de la souris, redessinée nette par-dessus).
2. `npm run music:pres` synthétise la musique originale (`sound/music.mjs`, 100 BPM, aucun échantillon ni droit tiers). Les coupes du montage tombent sur les temps.
3. `npm run build:pres` rend la vidéo, normalise le son et crée la version muette.

Code : `src/pres/`. Après une modification du site, relancez `node build.mjs` dans `lantre2jeux-site`, puis `npm run capture:site`.

## Pub verticale v3 (charte du nouveau site) — `npm run build:pub`

| Fichier | Usage |
| --- | --- |
| `renders/pub-lantre2jeux-9x16.mp4` | pub 15 s avec son (−14 LUFS, prête pour Meta / TikTok) |
| `renders/pub-lantre2jeux-9x16-muet.mp4` | même pub sans son |

| Temps | Séquence | Levier |
| --- | --- | --- |
| 0 – 2 s | « ESCAPE GAME » révélé à la torche, « SOISSONS » qui claque avec un repère de carte, chrono 60:00 qui défile, « Saurez-vous sortir à temps ? » | quoi et où dès la première seconde, défi |
| 2 – 3,6 s | « Fouillez. » (un code caché sur le mur), « Réfléchissez. » (le mot SORTIE se déchiffre), « Manipulez. » (un cadenas s'ouvre sur 1958) | on se projette dans la partie |
| 3,6 – 9,6 s | Trois portes de lumière : Route 66, La Planque des Corleone, Alerte Rouge, chacune avec sa mission en une phrase ; le compteur remonte le temps de 2026 à 1958, 1938, puis « 19▒▒ » | variété du choix, désir |
| 9,6 – 11,3 s | 4,6/5 sur 62 avis, « Accueil très amical », « Animateurs au top » | preuve sociale |
| 11,3 – 12,8 s | « Combien êtes-vous ? » : le cadenas passe de 3 à 6 joueurs, le prix descend de 29 € à 21 € | ancrage prix, réassurance |
| 12,8 – 15 s | La caméra traverse la porte : « La porte est ouverte. », bouton « Réservez votre salle », URL, adresse, dès 21 € | appel à l'action, soulagement |

Caméra : chaque plan a son mouvement (punch-in, whip panoramique d'une porte à l'autre avec flou de mouvement, zoom sur le décor de chaque salle, bascule 3D, orbite, travelling à travers la porte finale), avec un léger effet caméra à l'épaule dans les salles. Le bandeau « Escape game à Soissons » reste affiché de 2 s à 12,8 s.

Bande-son : nappe grave et battements de cœur qui accélèrent jusqu'à l'ouverture de la dernière porte, puis accord majeur de délivrance. Tous les sons sont synthétisés (`public/sfx/ad/`), sans droits tiers. Code : `src/ad/`.

## Vidéo v1 (charte provisoire)

Vidéo promo verticale (1080×1920, 30 i/s, **15 s**) pour [L'Antre 2 Jeux](https://www.lantre2jeux-escapegame.com), escape game à Soissons. Réalisée avec [Remotion](https://www.remotion.dev).

| Fichier | Usage |
| --- | --- |
| `renders/lantre2jeux-9x16.mp4` | version avec habillage sonore (whooshs, impacts, taps) |
| `renders/lantre2jeux-9x16-muet.mp4` | version muette, pour poser une musique tendance dans TikTok ou Reels |

## Storyboard

| Temps | Scène | Mouvement caméra |
| --- | --- | --- |
| 0 – 1,9 s | **Accroche** « Saurez-vous vous échapper ? » + serrure lumineuse | lent push-in, puis plongée ×16 dans la serrure (flash) |
| 1,9 – 3,7 s | **Marque** : L'ANTRE 2 JEUX · Escape Game · Soissons | zoom avant qui décélère, reflet lumineux, whip vers la droite |
| 3,7 – 9,7 s | **3 salles** : Route 66, La Planque des Corleone, Alerte Rouge (thème, niveau, note) | whips horizontaux de carte en carte avec flou de mouvement, rotation 3D |
| 9,7 – 12,3 s | **Réservation mobile** : 3 à 6 joueurs, dès 21 €/joueur, jusqu'à 4,8/5, choix du créneau puis tap « Réserver » | arrivée verticale, orbite 3D, zoom sur le bouton |
| 12,3 – 15 s | **CTA** : « Prêts à relever le défi ? » + bouton « Réservez votre mission » + URL + adresse | l'onde du tap se rétracte en bouton, léger push-in |

Les contenus importants restent hors des zones couvertes par l'interface TikTok/Reels (haut ≈150 px, bas ≈400 px, colonne de droite).

## ⚠️ Charte graphique : provisoire

Le site officiel n'était pas accessible depuis l'environnement de build (réseau filtré). Les couleurs et polices actuelles reprennent une ambiance « escape game » (noir chaud + ambre), et le logo est un lockup typographique. Pour appliquer la vraie charte :

1. **Couleurs** : `src/theme.ts`
2. **Logo** : déposer le fichier dans `public/brand/logo.png`, puis renseigner `logo: 'brand/logo.png'` dans `src/brand.ts`
3. **Polices** : déposer les `.woff2` dans `public/fonts/` et mettre à jour `src/lib/fonts.ts`
4. **Textes** : `src/content.ts`

Puis `npm run build`.

Sources du contenu (oct. 2026) : the-escapers.com, escapegame.fr (notes : Alerte Rouge 4,8/5, Route 66 4,6/5, Corleone 4,5/5 ; tarifs dégressifs de 29 € à 21 €/joueur ; 3 à 6 joueurs).

## Commandes

```bash
npm install
npm run studio    # prévisualisation interactive
npm run build     # rendu + export final dans renders/ (nécessite ffmpeg)
```

## Structure

```
src/
  theme.ts / content.ts / brand.ts   ← charte, textes, logo
  lib/camera.tsx                     ← caméra virtuelle (keyframes x/y/zoom/rotations 3D, flou de mouvement directionnel)
  lib/ease.ts, lib/anim.ts           ← courbes d'accélération, ressorts
  components/                        ← cartes salles, téléphone, emblèmes, typographie animée, ambiance (braises, grain)
  scenes/                            ← Hook, Brand, Rooms, Booking, Cta
  Sound.tsx                          ← placement des effets sonores
public/
  fonts/   Bebas Neue + Inter (OFL), auto-hébergées
  sfx/     effets synthétisés avec ffmpeg (aucun droit tiers)
```
