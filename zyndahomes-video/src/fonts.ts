import {continueRender, delayRender, staticFile} from 'remotion';

// Les polices du site, licence OFL, réduites au latin : Montagu Slab (Florian Karsten), variable en graisse (200 à 500)
// et en taille optique ; Reddit Sans (Pentagram), variable de 400 à 700.
if (typeof document !== 'undefined') {
  const faces = [
    new FontFace('Montagu Slab', `url(${staticFile('fonts/MontaguSlab.woff2')}) format('woff2')`, {weight: '200 500'}),
    new FontFace('Reddit Sans', `url(${staticFile('fonts/RedditSans.woff2')}) format('woff2')`, {weight: '400 700'}),
  ];
  const handle = delayRender('Polices Montagu Slab et Reddit Sans');
  Promise.all(
    faces.map((face) => {
      document.fonts.add(face);
      return face.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}
