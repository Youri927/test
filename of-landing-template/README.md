# Modèle de landing page OnlyFans (lien en bio)

Deux pages d'une seule vue, pensées pour le téléphone (ouverture depuis la bio Instagram). Chaque fichier est autonome : polices intégrées, aucune dépendance. On le dépose tel quel sur n'importe quel hébergement statique (Netlify Drop, GitHub Pages, Vercel…).

| Fichier | Mécanique |
| --- | --- |
| `landing-gratter.html` | Un ticket à gratter : la photo est cachée sous une couche argentée holographique. On gratte au doigt ; à la moitié, la couche disparaît, des cœurs jaillissent et le bouton rebondit. Le bouton (pulsation, halo, reflet) est cliquable à tout moment. |
| `landing-deverrouiller.html` | Un écran verrouillé de téléphone, avec l'heure et la date réelles du visiteur. On fait glisser le verrou : la photo se défloute au fur et à mesure ; au bout, flash, cœurs, puis ouverture de la page. Un simple appui sur le verrou le fait glisser tout seul. |

## À remplir

En haut du second `<script>` de chaque fichier :

```js
const CONFIG = {
  NAME: 'Prénom',
  PHOTO: '',                       // URL https://… ou image intégrée data:image/jpeg;base64,…
  OF_URL: 'https://onlyfans.com',  // le lien de sa page
  PRICE: '',                       // facultatif, ex. '$9.99 / month'
  PROMO: {PRICE: '', OLD: '', ENDS: ''}, // facultatif : vraie promo et sa date de fin
};
```

- Sans photo, un emplacement « ta photo ici » s'affiche.
- La ligne de promo n'apparaît que si `ENDS` est renseigné ; le compte à rebours va jusqu'à cette date, puis la ligne disparaît.

Volontairement absents : faux compte à rebours qui se relance, faux statut « en ligne », redirection anti-robots.

Polices : Unbounded et Figtree (SIL Open Font License, licences jointes).
