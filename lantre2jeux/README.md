# L'Antre 2 Jeux — motion design 9:16

## Pub verticale v2 (charte du nouveau site) — `npm run build:pub`

| Fichier | Usage |
| --- | --- |
| `renders/pub-lantre2jeux-9x16.mp4` | pub 15 s avec son (−14 LUFS, prête pour Meta / TikTok) |
| `renders/pub-lantre2jeux-9x16-muet.mp4` | même pub sans son |

| Temps | Séquence | Levier |
| --- | --- | --- |
| 0 – 1,8 s | Le noir, la torche révèle « Entrez. », « On ferme derrière vous. », la porte claque, la lumière meurt | accroche, curiosité, défi |
| 1,8 – 8,4 s | Couloir de trois portes de lumière : Route 66 (néon), La Planque des Corleone (diamant 3D), Alerte Rouge (radar, compte à rebours, date pixelisée) ; le compteur remonte le temps de 2026 à 1958, 1938, puis « 19▒▒ » | variété du choix, désir |
| 8,4 – 10,6 s | 4,6/5 sur 62 avis, « Accueil très amical », « Animateurs au top » | preuve sociale |
| 10,6 – 12,6 s | « Combien êtes-vous ? » : le cadenas passe de 3 à 6 joueurs, le prix descend de 29 € à 21 € | ancrage prix, réassurance |
| 12,6 – 15 s | La porte s'ouvre sur la lumière : « La porte est ouverte. », bouton « Réservez votre salle », URL, dès 21 € | appel à l'action, soulagement |

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
