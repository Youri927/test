# Accessibilité : nouveau site Brunet Brothers Construction

**Référence :** WCAG 2.1 niveau AA (et 2.2 pour la taille des cibles et le focus jamais masqué)
**Date :** 22 octobre 2026
**Outils :**
- `tools/a11y.mjs` (Chromium, sur `dist-web` servi en local) ;
- `tools/interact.mjs` (43 essais) ;
- Lighthouse 13.5.

## En bref

**Points trouvés : 7. Bloquants : 2. Corrigés : 7.**

- **Clavier.** Le site se parcourt entièrement au clavier, dans l'ordre de lecture : 75 arrêts sur ordinateur, 71 sur
  téléphone.
- **Focus.** Il se voit partout : un contour plein de 3 px, graphite sur le quartz (15,1:1), orange sur la bande sombre
  et le pied de page (6,4:1). Il ne passe jamais sous l'en-tête fixe.
- **Contrastes.** Les 79 textes mesurés passent les seuils, sur les vrais pixels de la page. C'est vrai en anglais et en
  espagnol, à 1 440 px et à 390 px.
- **Au doigt.** Aucune cible ne fait moins de 44 px.
- **Deux langues.** La page se lit en anglais ou en espagnol. L'attribut `lang` de la page suit la langue choisie, et les
  passages qui restent dans l'autre langue (les témoignages, les lignes téléphoniques) portent leur propre `lang`.
- **Lighthouse.** Accessibilité 100 sur ordinateur et sur téléphone.

## Ce qui a été corrigé pendant l'audit

| # | Problème | Critère | Correction |
|---|---|---|---|
| 1 | La note « Your email app should now show the request » était affichée et lue avant tout envoi : une règle de mise en page l'emportait sur son attribut `hidden` | 1.3.1, 4.1.2 (bloquant) | `[hidden]` l'emporte toujours. Un essai vérifie que la note n'apparaît qu'après l'envoi, avec le focus. |
| 2 | À 320 et 360 px, le nom « Brunet Brothers » passait sous le choix de la langue | 1.4.10 (bloquant) | Sous 420 px, le nom s'écrit sur deux lignes (« Brunet » / « Brothers ») à côté du monogramme |
| 3 | Le focus du choix de la langue était un contour orange à l'intérieur du bouton, sur le quartz : 2,24:1 | 1.4.11, 2.4.7 | Un contour graphite de 3 px autour du bouton : 15,1:1 |
| 4 | À 320 px, les numéros de téléphone de l'accueil se coupaient au milieu (« (561) 904- » / « 1465 ») | 1.4.10 | Un numéro ne se coupe plus ; c'est le second numéro entier qui passe à la ligne |
| 5 | Avec l'espacement du texte élargi, les deux numéros de l'accueil débordaient de 4 px sur téléphone | 1.4.12 | Les numéros se rangent sur deux lignes quand la place manque |
| 6 | Au doigt, des cibles de 26 à 42 px de haut : les quatre numéros de licence, les boutons de langue, les liens du pied de page, les téléphones du menu | 2.5.8 (AA : 24 px, respecté) | 44 px au moins sur les écrans tactiles, au-delà du minimum AA |
| 7 | Le titre « Free in-home estimate. » se coupait sur le trait d'union au téléphone (« Free in- » / « home… ») | lisibilité | « in-home » ne se coupe plus, y compris pendant l'apparition du titre |

## Constats par principe

### Perceptible

| # | Constat | Critère | État |
|---|---|---|---|
| 1 | **Les photos.** Chacune est un bouton nommé par sa légende, suivie de « , open the photo » (« , abrir la foto » en espagnol). L'image elle-même a un `alt=""`, puisque le bouton porte déjà la description. | 1.1.1 | ✅ |
| 2 | **Les légendes** décrivent ce qu'on voit : carrelage, paroi, meubles, lumière, en anglais et en espagnol. Sous la planche de l'accueil, la ligne qui suit la photo survolée est cachée aux lecteurs d'écran (`aria-hidden`), car elle redit le nom des boutons. | 1.1.1 | ✅ |
| 3 | **La structure des titres.** Un seul h1, sept h2, des h3 pour les rangées de photos, les licences et les six questions, sans niveau sauté. Les repères `header`, `nav`, `main` et `footer` sont présents. | 1.3.1 | ✅ |
| 4 | **Les contrastes du texte.** Le graphite fait 15,1:1 sur le quartz. Le gris ardoise des légendes fait 5,6:1. Le texte des boutons orange, en graphite, fait 6,8:1. Sur la bande sombre, le texte gris clair fait 8,4 à 12,1:1. | 1.4.3 | ✅ |
| 5 | **L'orange n'est jamais une couleur de texte sur le quartz** (2,24:1). Il ne sert qu'en aplat, avec du texte graphite dessus, et en soulignement sous un texte graphite. | 1.4.3 | ✅ |
| 6 | **Les contours.** Champs et sujets du formulaire : 4,27:1 sur le blanc. Choix de la langue et boutons : 15,1:1. Boutons de la visionneuse : 6,1:1. | 1.4.11 | ✅ |
| 7 | **Les repères décoratifs.** Le filet orange au-dessus des témoignages (2,24:1) et le bord blanc de la paroi de verre (mouvement) ne portent aucune information. Le sujet coché est en orange, mais la coche est aussi annoncée par l'état de la case. | 1.4.11 | ✅ non exigé |
| 8 | **Le zoom à 400 % et l'espacement élargi** (interligne 1,5, lettres +0,12 em, mots +0,16 em). Aucun texte coupé ni débordement, de 320 à 1 920 px, dans les deux langues. | 1.4.4, 1.4.10, 1.4.12 | ✅ |

### Utilisable

| # | Constat | Critère | État |
|---|---|---|---|
| 1 | **Au clavier**, tout est atteignable : le menu, la langue, les photos (qui ouvrent la visionneuse), les licences, les témoignages et le formulaire. | 2.1.1 | ✅ |
| 2 | **Le premier Tab** montre « Skip to content » (« Ir al contenido ») ; Entrée envoie le focus au titre de l'accueil. | 2.4.1 | ✅ |
| 3 | **Les liens du menu** amènent la section sous l'en-tête, et son titre prend le focus. | 2.4.3 | ✅ |
| 4 | **La visionneuse** est une `<dialog>` modale. Le focus va sur « Close » ; Échap la ferme et le focus revient sur la photo ouverte. Elle répond aux flèches, à Début et à Fin, et au glissement du doigt. | 2.1.2, 2.4.3 | ✅ |
| 5 | **Le menu du téléphone.** Le focus va au premier lien, la page derrière devient inerte (`inert`), Échap le ferme. | 2.4.3 | ✅ |
| 6 | **Le focus visible** (3 px, 15,1:1 ou 6,4:1) n'est jamais masqué par l'en-tête fixe, qui revient dès qu'un de ses liens reçoit le focus. | 2.4.7, 2.4.11 | ✅ |
| 7 | **Les cibles au doigt** font 44 px au moins. | 2.5.8 | ✅ |
| 8 | **Le mouvement.** L'ouverture dure 1,5 s, une fois. Les apparitions jouent une fois chacune, et rien ne bouge en continu. En mouvement réduit, il n'y a ni ouverture, ni apparitions, ni défilement doux : tout est net d'emblée (vérifié par un essai). | 2.3.3, 2.2.2 | ✅ |

### Compréhensible

| # | Constat | Critère | État |
|---|---|---|---|
| 1 | **La langue de la page.** `lang` vaut « en » ou « es », selon le choix du visiteur. Le choix est gardé d'une visite à l'autre et dans l'adresse (`?lang=es`). Un navigateur réglé en espagnol reçoit l'espagnol. | 3.1.1 | ✅ |
| 2 | **Les passages dans l'autre langue** portent leur `lang` : les 18 témoignages (`lang="en"`, une note le dit en espagnol), « Call in English » et « Llame en español ». | 3.1.2 | ✅ |
| 3 | **Les champs du formulaire** ont une étiquette visible au-dessus, jamais un texte gris qui disparaît. Les champs facultatifs sont marqués « (optional) ». Une phrase dit qu'il faut un téléphone ou un e-mail. | 3.3.2 | ✅ |
| 4 | **Les erreurs** disent quoi corriger (« Check the phone number: it should have 10 digits, like 561-555-0142. »). Elles sont liées à leur champ (`aria-describedby`, `aria-invalid`), le focus va au premier champ en erreur, et elles changent de langue avec la page. | 3.3.1, 3.3.3 | ✅ |
| 5 | **L'envoi.** Avant le bouton, une phrase dit ce qui va se passer : la messagerie s'ouvre avec la demande écrite. Après, une note reçoit le focus et donne les deux numéros si rien ne s'est ouvert. | 3.2.2 | ✅ |

### Robuste

| # | Constat | Critère | État |
|---|---|---|---|
| 1 | **Les noms des contrôles.** Tous en ont un, dans les deux langues : 0 contrôle sans nom en anglais comme en espagnol. Aucun identifiant en double, aucune référence `aria-*` cassée. | 4.1.2 | ✅ |
| 2 | **Les boutons de langue** sont dans un groupe nommé (« Language » / « Idioma ») et indiquent leur état (`aria-pressed`). Chacun porte le nom de sa langue, dans sa langue. | 4.1.2 | ✅ |
| 3 | **Les témoignages repliés.** Le bouton annonce `aria-expanded` et contrôle la liste (`aria-controls`). | 4.1.2 | ✅ |
| 4 | **Le compteur de la visionneuse** (« 3 of 4 », « 3 de 4 ») est annoncé poliment (`aria-live="polite"`). | 4.1.3 | ✅ |
| 5 | **Sans JavaScript**, la page se lit en entier. Les photos de l'accueil sont nettes au bout de 2,6 s (une sécurité en CSS), et les témoignages et le formulaire restent lisibles. | 4.1.1 | ✅ |

## Clavier

| Élément | Tab | Entrée / Espace | Échap | Flèches |
|---|---|---|---|---|
| Lien d'évitement | 1er arrêt | va au titre de l'accueil | — | — |
| Menu (ordinateur) | 4 liens, la langue, « Free estimate » | va à la section, son titre prend le focus | — | — |
| Menu (téléphone) | bouton, puis les liens | ouvre ou ferme | ferme | — |
| Langue | deux boutons | change la langue de toute la page | — | — |
| Photos | une par photo, dans l'ordre de lecture | ouvre la visionneuse sur elle | — | — |
| Visionneuse | Close, précédente, suivante | — | ferme, focus rendu | photo précédente ou suivante ; Début, Fin |
| Licences | les quatre numéros | ouvre la fiche de l'État (nouvel onglet) | — | — |
| Témoignages | un bouton | montre ou cache les 12 autres | — | — |
| Formulaire | champs, sujets, langue de rappel, envoi | coche, envoie | — | entre les deux langues de rappel |

## Ce qu'il reste à vérifier sur de vrais appareils

1. **VoiceOver (iPhone) et NVDA.** Il faut écouter la page en espagnol : la prononciation des passages anglais marqués,
   et l'annonce des photos (légende puis « abrir la foto »).
2. **Le zoom du navigateur à 200 %** sur un vrai ordinateur portable, avec l'en-tête fixe.
3. **L'envoi par e-mail.** Sur un appareil sans messagerie configurée, la note qui suit l'envoi est la seule aide :
   c'est pourquoi elle redonne les deux numéros. Un vrai formulaire envoyé par un service serait plus sûr (voir le
   README).
