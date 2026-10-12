import {continueRender, delayRender, staticFile} from 'remotion';

// La police du site : Commissioner (100 à 900, axes FLAR et VOLM), licence OFL. Comme sur le site, les petites capitales
// de l'enseigne sont dessinées par Chrome à partir des capitales (la police n'en a pas).
if (typeof document !== 'undefined') {
  const handle = delayRender('Police Commissioner');
  const face = new FontFace('Commissioner', `url(${staticFile('fonts/Commissioner.woff2')}) format('woff2')`, {weight: '100 900'});
  document.fonts.add(face);
  face
    .load()
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}
