import {continueRender, delayRender, staticFile} from 'remotion';

// La police du site : Archivo (variable, graisse 100–900, largeur 62–125 %), licence OFL
if (typeof document !== 'undefined') {
  const handle = delayRender('Police Archivo');
  const face = new FontFace('Archivo', `url(${staticFile('fonts/Archivo.woff2')}) format('woff2')`, {weight: '100 900', stretch: '62% 125%'});
  document.fonts.add(face);
  face.load().then(() => continueRender(handle)).catch((err) => { console.error(err); continueRender(handle); });
}
