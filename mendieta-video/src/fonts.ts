import {continueRender, delayRender, staticFile} from 'remotion';

// La police du site : Encode Sans (Impallari Type et al., licence OFL), variable en graisse (100 à 900) et en chasse
// (75 à 125 %).
if (typeof document !== 'undefined') {
  const handle = delayRender('Police Encode Sans');
  const face = new FontFace('Encode Sans', `url(${staticFile('fonts/EncodeSans.woff2')}) format('woff2')`, {weight: '100 900', stretch: '75% 125%'});
  document.fonts.add(face);
  face
    .load()
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}
