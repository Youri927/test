# Twitch Redif — extension Chrome

Récupère les rediffusions (VOD) Twitch : liste les vidéos d'une chaîne, choisit la qualité
et éventuellement un passage précis, puis enregistre la vidéo sur le disque.

## Installation

1. Ouvre `chrome://extensions` (marche aussi sur Edge, Brave, Opera, Vivaldi…).
2. Active le **Mode développeur** (en haut à droite).
3. Clique sur **Charger l'extension non empaquetée** et sélectionne ce dossier `twitch-vod-extension`.
4. Épingle l'icône violette dans la barre d'outils.

## Utilisation

- **Sur une chaîne** (`twitch.tv/zerator`, `twitch.tv/zerator/videos`) : ouvre l'extension,
  la liste des dernières rediffusions s'affiche. Le menu permet de passer aux temps forts,
  aux mises en ligne ou à tout voir.
- **Sur une VOD** (`twitch.tv/videos/123456789`) : l'extension l'ouvre directement.
- Ailleurs : tape un nom de chaîne, colle un lien ou un ID de VOD dans le champ de recherche.

Sur la fiche d'une VOD :

- **Qualité** : de la source (1080p60, voire 1440p) jusqu'à « Audio Only », avec une estimation
  du poids par heure.
- **Début / Fin** : pour ne récupérer qu'un passage (format `1:23:45`, `83:45` ou `5025`).
  Le découpage se fait au segment près (environ 10 s).
- **Télécharger** : ouvre un onglet de téléchargement. Clique sur le bouton, choisis où enregistrer,
  et laisse l'onglet ouvert. La vidéo est écrite sur le disque au fil de l'eau : une rediffusion de
  8 h en 1080p (~25 Go) ne remplit pas la mémoire.
- **Copier le m3u8** : copie le lien de la playlist, à ouvrir dans VLC, mpv, ou à passer à ffmpeg :
  `ffmpeg -i "<lien>" -c copy redif.mp4`.

## Format des fichiers

Les VOD récentes sont servies en MP4 fragmenté : le fichier obtenu est un `.mp4` lisible
directement (VLC, mpv, navigateurs, la plupart des logiciels de montage). Les VOD plus
anciennes donnent un `.ts`. Si un logiciel de montage n'aime pas le fichier, ou pour remettre
les horodatages à zéro, un réempaquetage sans perte suffit :

```
ffmpeg -i entree.mp4 -c copy -movflags +faststart sortie.mp4
```

## Bon à savoir

- **VOD réservées aux abonnés** : si tu es connecté sur twitch.tv avec un compte qui y a accès,
  l'extension utilise ta session (permission `cookies`) pour les récupérer, comme le ferait
  le lecteur Twitch. Sans abonnement, Twitch refuse l'accès et l'extension l'indique.
- **Passages en sourdine** : Twitch coupe le son de certains passages (musique sous droits).
  L'extension récupère automatiquement la version en sourdine, la seule que Twitch fournit.
- **VOD en cours de live** : la vidéo s'arrête là où en était le live au moment du téléchargement.
- Les rediffusions expirent au bout de 7 jours (60 jours pour les partenaires, Turbo et Prime).
  Les temps forts et les mises en ligne restent.
- Respecte les droits des créateurs : garde les vidéos pour un usage personnel, sauf accord du streamer.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `manifest.json` | Déclaration de l'extension (Manifest V3) |
| `lib/twitch.js` | API Twitch (GQL, jeton de lecture, playlists HLS) et utilitaires |
| `popup.html` / `popup.js` | Fenêtre de l'extension : liste des VOD, fiche, choix qualité/plage |
| `download.html` / `download.js` | Onglet de téléchargement : 6 segments en parallèle, écriture dans l'ordre, reprise sur erreur |
| `style.css` | Styles communs (thème sombre Twitch) |
