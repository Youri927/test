import {continueRender, delayRender, staticFile} from 'remotion';

// La police du site : Saira (Omnibus-Type, licence OFL), variable en graisse (400 à 800) et en largeur (62,5 à 125 %),
// réduite aux caractères du site.
if (typeof document !== 'undefined') {
  const face = new FontFace('Saira', `url(${staticFile('fonts/Saira.woff2')}) format('woff2')`, {weight: '400 800', stretch: '62.5% 125%'});
  const handle = delayRender('Police Saira');
  document.fonts.add(face);
  face
    .load()
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}
