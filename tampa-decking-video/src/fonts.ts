import {continueRender, delayRender, staticFile} from 'remotion';

// La police du site : Mona Sans (variable, graisse 200–900, largeur 75–125 %), licence OFL
if (typeof document !== 'undefined') {
  const handle = delayRender('Police Mona Sans');
  const face = new FontFace('Mona Sans', `url(${staticFile('fonts/MonaSans.woff2')}) format('woff2')`, {weight: '200 900', stretch: '75% 125%'});
  document.fonts.add(face);
  face.load().then(() => continueRender(handle)).catch((err) => { console.error(err); continueRender(handle); });
}
