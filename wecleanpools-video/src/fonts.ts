import {continueRender, delayRender, staticFile} from 'remotion';

// La police du site : Overpass, variable en graisse (licence OFL)
if (typeof document !== 'undefined') {
  const handle = delayRender('Police Overpass');
  const face = new FontFace('Overpass', `url(${staticFile('fonts/Overpass.woff2')}) format('woff2')`, {weight: '100 900'});
  document.fonts.add(face);
  face
    .load()
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}
