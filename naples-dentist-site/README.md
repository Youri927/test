# Implant and Comprehensive Dentistry of Naples : proposition de refonte

Maquette complète du nouveau site d'**Implant and Comprehensive Dentistry of Naples** (naplescomprehensivedentist.com), en anglais, sur ordinateur, tablette et téléphone.

**À ouvrir** : `dist/index.html`, d'un double-clic, sans serveur ni connexion.
- Un seul fichier d'1 Mo : police, photos et scripts sont dedans.
- L'analyse du site actuel est dans `ANALYSE.md`.
- Les planches de présentation sont dans `boards/`.

## L'idée : « Everything in between »

« Comprehensive » veut dire : tout. Dans ce cabinet, le même dentiste pose l'implant, endort les patients anxieux, conçoit et usine la couronne sur place. La page suit sa phrase d'ouverture, « Implants, same-day crowns and everything in between » : les implants, puis les couronnes du jour même, puis tout le reste, rangé par situation. Viennent ensuite la sédation, le dentiste et le cabinet.

**L'ouverture**
- La phrase en très grand. Au milieu, une pastille montre le sourire du Dr. Fakhoury ; à l'arrivée, elle s'ouvre comme un œil.
- Au défilement, la pastille grandit jusqu'à remplir l'écran : c'est son portrait entier. Son nom et son parcours apparaissent sur le mur, à droite du visage. Le mur se prolonge au-delà de la photo, de la même couleur, avec un bord fondu.
- Sur téléphone et tablette en portrait, la photo s'arrête en haut et le nom s'affiche dessous.
- Juste sous la phrase : l'appel en un geste, et une barre d'informations. Elle donne l'état du cabinet en direct, calculé à l'heure de Naples (« Open now, until 5:00 PM today », « Opens at 8:00 AM »…), l'adresse et la ligne d'urgence par SMS.

**Les implants**
- Leur logo, redessiné en vectoriel pièce par pièce, devient le schéma. Au défilement, la racine apparaît, la vis entre filet par filet, puis la couronne se pose.
- Les trois parties sont nommées à côté : couronne, pilier, implant.
- On y trouve aussi les trois cas, leurs trois promesses (« No slippage or movement… ») et les prothèses sur implants. Une note honnête vient de leur page Bridges : un implant demande du temps de cicatrisation, alors qu'un bridge se pose souvent en une journée.

**La couronne en une séance** (fond turquoise)
- Deux lignes de temps font la course au défilement. La méthode habituelle : empreinte, couronne provisoire, second rendez-vous. La leur, E4D : scan, conception, usinage, pose.
- La leur finit dès la première visite (« Walk out with your permanent crown »), pendant que l'autre attend encore avec une couronne provisoire. Sur grand écran, le cadre entier reste en place pendant la course.
- Le schéma ne donne aucune durée, seulement le nombre de visites, comme leur page.
- Ensuite viennent les quatre arguments E4D de leur page, et le bridge en une journée.

**And everything in between** : tous les autres soins, rangés par situation, avec les mots des patients.
- Par exemple « A tooth is missing », « My dentures are loose », « A tooth hurts », « I'm nervous about the dentist », « It's an emergency ».
- Chaque ligne donne une réponse courte et les soins concernés, puis ouvre leur fiche complète dans un panneau. Le texte vient de leurs pages ; des puces mènent à chaque soin.
- Dans le panneau, « Request a visit » ferme la fiche, descend jusqu'au formulaire et coche la situation.

**La sédation**
- La section reste en place pendant le défilement. On passe du protoxyde d'azote à la sédation consciente, puis intraveineuse, et la lumière baisse avec le niveau : gris clair, vert profond, presque noir.
- Un clic sur un niveau y mène directement ; les flèches du clavier marchent aussi.

**Dr. Fakhoury**, sur fond sombre
- Son parcours est tracé sur une vraie carte de l'est des États-Unis : le Michigan où il a grandi, New York (NYU, la formation implantaire, la chirurgie aux hôpitaux de Jamaica et de Brooklyn), puis Naples.
- Avec sa photo au travail, ses spécialités et ses autres formations.

**Le cabinet**
- La photo de l'immeuble, l'adresse et l'itinéraire (Google Maps).
- Les horaires, avec le jour en cours signalé. Le téléphone, la ligne d'urgence, l'e-mail.

**Request a visit** (fond turquoise)
- Un formulaire court : la situation, le nom, le téléphone, l'e-mail facultatif, le moment préféré pour être rappelé et un message. Les coordonnées sont vérifiées, et un message de confirmation s'affiche.
- À côté, les trois questions fréquentes de leur page Contact.

- Sur téléphone, une barre « Call / Request a visit » suit la page, sauf sur l'ouverture, le formulaire et le pied de page.

**Forme**
- **Couleurs** :
  - le turquoise du cabinet `#23ACAC` en grands aplats ;
  - un vert-noir profond `#0B2326` pour le texte et les fonds sombres ;
  - un turquoise plus foncé `#0D7778` pour les liens sur blanc ;
  - le gris clair minéral `#EDF3F2`, le gris du logo `#C0C0C0`, et le gris du mur du portrait `#CCD0D1`, qui prolonge la photo.
- **Typographie** : **Instrument Sans** (licence OFL), une seule police variable, resserrée pour les titres (chasse 84 %), normale pour le texte.
- **À éviter, et évité** : italique décoratif, petites étiquettes en capitales, sections numérotées, dégradés visibles, effet verre, voile sombre sur les photos, titres terminés par un point, curseur personnalisé.

**Animations**
- Transformations et fondus, sauf le tracé du trajet sur la carte.
- Défilement fluide (Lenis) synchronisé avec GSAP ScrollTrigger.
- L'ouverture du portrait se fait sans masque à redessiner : le calque sert de fenêtre, déplacé et étiré, et la photo reçoit l'échelle inverse. Seuls les coins arrondis du tout début sont redessinés.
- Si le visiteur a réduit les animations sur son appareil :
  - tout s'affiche directement, rien n'est épinglé ;
  - le portrait et le nom du dentiste s'affichent sous l'ouverture ;
  - la sédation se choisit au clic.

## Rien d'inventé

- **Textes** : repris, raccourcis ou reformulés depuis leurs pages (accueil, services, les 11 pages de soins, Meet the Team, Contact).
  - **Repris de leurs pages** : « twice as strong as metal-filled crowns », les fillers de six à douze mois, les trois niveaux de sédation, « no slippage or movement, no eating difficulties, no need for regular repairs ».
  - **Corrigés** : leurs fautes (« Peroidontal », « cavitites »…).
  - **Laissés de côté** :
    - le Botox de la page Fillers, qui n'apparaît nulle part ailleurs ;
    - les liens trop appuyés entre bouche et maladies (« stroke », « a longer life ») ;
    - « our team of expert dentists », alors qu'un seul dentiste est présenté.
- **Avis** : aucun. Les quatre avis de leur page Testimonials (John D., Susan M., Richard B., Patricia K.) n'ont ni source ni détail, et nous n'avons trouvé aucun avis public. Il faudra ajouter leurs vrais avis Google.
- **Photos** : leurs trois photos du cabinet, sans retouche. Le portrait (2010 × 1500), le Dr. Fakhoury au travail (848 × 518, la seule version publiée) et l'immeuble. Les images de banque et les rendus 3D de leurs pages de soins sont écartés.
- **Logo** : le leur, redessiné en vectoriel d'après leur fichier PNG (tracé potrace, contours lissés), en trois pièces pour l'animation. Couleurs d'origine dans le pied de page (gris sur fond sombre) ; en vert-noir dans l'en-tête.
- **Carte** : contours des États du Census Bureau (domaine public, paquet us-atlas). Le Michigan est entier, sans ville, puisque leur page ne dit que « born and raised in Michigan ».
- **Horaires et état « Open now »** : ceux de la page Contact, calculés dans le navigateur à l'heure de Naples.
- **Formulaire** : c'est une démonstration, rien n'est envoyé.

## Outils utilisés

- **React 19, TypeScript, Tailwind CSS 4 et shadcn/ui**, avec la même chaîne de fabrication que le site de Tampa.
  - Composants shadcn (Radix) pour la mécanique, entièrement redessinés : la fiche des soins et le menu mobile (Sheet), les champs du formulaire (Input, Label, Textarea), le choix de la situation et du moment (RadioGroup de Radix), les questions fréquentes (Accordion de Radix).
- **Catalogue 21st.dev** (serveur MCP), consulté pour la mécanique. Tout est réécrit ici, sans reprendre leur style :
  - « Super Hover List » et « Features With Panel » pour l'index des situations ;
  - « Information Drawer » pour l'entrée de la fiche (glissement, contenu échelonné, défilement bloqué) ;
  - « Segmented Control » pour le choix du niveau de sédation, accessible au clavier.
- **Chrome DevTools** (serveur MCP) : audits Lighthouse et traces de performance, sur le site actuel puis sur le nouveau.
- **Playwright** : 38 vérifications automatiques, plus les tests au clavier (voir plus bas).
- **potrace** (portage Python) pour le logo, **d3-geo** et **topojson** pour la carte, **fontTools** pour les polices des planches.
- **Relecture du code** : bugs certains, commentaires exacts, simplifications. Les points trouvés par la relecture et les tests sont tous corrigés :
  - **Fiche des soins** : sur téléphone, elle ne prenait que 75 % de la largeur, et 384 px sur ordinateur (classes de shadcn prioritaires sur les nôtres).
  - **Focus** : après la fermeture d'une fiche, il ne revenait pas sur la ligne qui l'avait ouverte. Il y revient maintenant.
  - **Sédation au clavier** : les flèches changeaient de niveau, mais le focus restait sur l'ancien bouton.
  - **Ancres vers les sections épinglées** (couronnes, sédation) : elles arrivaient 80 px trop tôt, sous l'en-tête. Elles arrivent maintenant au début exact de l'épinglage.
  - **Tablette tournée** : la course des couronnes gardait l'épinglage de l'autre format (refait avec `gsap.matchMedia`).
  - **Ouverture** : un masque redessiné à chaque image (clip-path) ralentissait l'ouverture du portrait. Elle est refaite en transformations seules.
  - **Carte** : les États étaient repeints à chaque image du tracé. Le fond de carte est maintenant une image, dessinée une seule fois.
  - **Audit Lighthouse** : le libellé du logo de l'en-tête ne contenait pas son texte visible (« & » contre « and »). Et la photo d'ouverture était jugée trop petite, à cause de sa taille de mise en page ; elle est maintenant mise en page à demi-taille.

## Fabrication

| Fichier | Rôle |
| --- | --- |
| `src/App.tsx`, `src/components/*.tsx` | la page, une section par fichier |
| `src/components/hero.tsx` | l'ouverture : la pastille, le portrait qui s'ouvre, le nom sur le mur |
| `src/components/logo.tsx`, `src/data/logo.json` | le logo vectoriel, en pièces (couronne, racine, sept filets) |
| `src/data/content.ts` | tous les textes : soins, situations, niveaux de sédation, horaires, FAQ |
| `src/data/east-map.json` | la carte (tracés SVG des États de l'est, trois étapes) |
| `src/lib/office.ts` | l'état du cabinet en direct, à l'heure de Naples |
| `src/lib/sheet.ts` | la fiche des soins et le motif transmis au formulaire |
| `src/lib/motion.ts` | défilement fluide, apparitions, points de rupture |
| `data/photos.json`, `tools/images.py` | export AVIF des trois photos (230 Ko en tout) |
| `tools/map.mjs` | génère la carte depuis us-atlas |
| `tools/prerender.mjs` | version de production : HTML pré-généré |
| `tools/boards.py` | planches de présentation |

```
npm install
npm run build        # dist/index.html, le fichier unique à ouvrir d'un double-clic
npm run build:web    # dist-web/, la version de production à mettre en ligne (Vercel : vercel.json)
python3 tools/images.py <dossier des photos d'origine>
node tools/map.mjs
python3 tools/boards.py <captures du site actuel> <nouvelles captures> <TTF d'Instrument Sans>
```

**La version de production** (`npm run build:web`) :
- le HTML de la page est rendu au moment du build, puis React le reprend ;
- la police et le portrait sont préchargés ;
- les autres photos se chargent au fur et à mesure.

L'état « Open now » n'est pas figé dans le HTML pré-généré : il est calculé à la visite.

## Vérifié

**Largeurs testées** : 360 × 740, 375 × 667, 390 × 844, 768 × 1024, 820 × 1180, 1024 × 768, 1280 × 800, 1440 × 900, 1920 × 1080 et 2560 × 1440.
- Aucun débordement horizontal, aucune erreur JavaScript.
- **Testé automatiquement** :
  - l'ouverture : épinglage, relais pastille-calque, nom sur le mur, retour en haut ;
  - les ancres du menu, et le menu mobile ;
  - la sédation : au défilement, au clic, au clavier ;
  - la course des couronnes et le tracé de la carte ;
  - les fiches des soins : ouverture, puces, Échap, focus, et passage vers le formulaire avec la situation cochée ;
  - le formulaire : champs vides, téléphone trop court, e-mail incomplet, envoi ;
  - les questions fréquentes, le jour en cours dans les horaires, la barre d'appel mobile ;
  - le mode « animations réduites ».

**Mesures**, sur les deux sites avec les mêmes réglages : audit Lighthouse mobile, et trace de performance Chrome en 4G lente, avec un processeur 4× plus lent.

| | Site actuel | Nouvelle version (production) |
| --- | --- | --- |
| Accessibilité | 93 | 100 |
| Bonnes pratiques | 100 | 100 |
| Référencement | 100 | 100 |
| Premier écran (LCP) sur mobile | 4,4 s | 1,8 s |
| Décalage de mise en page (CLS) | 0 | 0 |

La nouvelle version est mesurée sur un petit serveur local, sans compression. Un hébergeur comme Vercel compresse les fichiers, ce qui devrait encore réduire ce temps.

**Fluidité**, mesurée ici en rendu logiciel, sans carte graphique :
- la sédation, le cabinet et la carte tournent entre 50 et 60 images par seconde, une fois la carte affichée ;
- l'ouverture du portrait et la course des couronnes tournent entre 20 et 40 images par seconde dans ces conditions : sans carte graphique, chaque grande surface est recomposée par le processeur ;
- le premier affichage de la carte et de la photo du dentiste coûte un à-coup, le temps de les dessiner une première fois.

Le code lui-même ne bloque pas le navigateur : le temps passé en scripts et en mise en page reste faible. **À vérifier sur un vrai téléphone et un vrai ordinateur.**

## À fournir par le cabinet pour aller plus loin

- **Leurs vrais avis Google**, pour remplacer les quatre avis non sourcés de leur page Testimonials.
- **L'original de la photo au travail** (la version publiée ne fait que 848 px de large), et des photos du nouveau cabinet : l'accueil, la salle de soins, la machine E4D, le laboratoire.
- **Confirmer** :
  - le numéro (239-495-9900) et l'adresse e-mail de leur politique de confidentialité, différents de ceux de la page Contact ;
  - Invisalign et le Botox, cités dans leurs pages mais pas dans leurs soins ;
  - la présence d'autres dentistes (« our team of expert dentists »).
- **Le formulaire** : le relier à leur e-mail ou à leur logiciel de rendez-vous (par exemple un service de formulaires ou une fonction Vercel).
- **Les fiches des soins** pourraient devenir de vraies pages (une adresse par soin), pour le référencement.
