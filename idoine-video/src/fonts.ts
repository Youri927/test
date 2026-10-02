import {continueRender, delayRender, staticFile} from 'remotion';

// Archivo, la police du site : graisses 100 à 900, chasses 62 % à 125 %
if (typeof document !== 'undefined') {
  const handle = delayRender('Police Archivo');
  const face = new FontFace('Archivo', `url(${staticFile('fonts/Archivo.woff2')}) format('woff2')`, {weight: '100 900', stretch: '62% 125%'});
  document.fonts.add(face);
  face.load().then(() => continueRender(handle)).catch((err) => { console.error(err); continueRender(handle); });
}
