import {continueRender, delayRender, staticFile} from 'remotion';

// La police du site : Familjen Grotesk (variable, graisse 400–700), licence OFL
if (typeof document !== 'undefined') {
  const handle = delayRender('Police Familjen Grotesk');
  const face = new FontFace('Familjen Grotesk', `url(${staticFile('fonts/FamiljenGrotesk.woff2')}) format('woff2')`, {weight: '400 700'});
  document.fonts.add(face);
  face.load().then(() => continueRender(handle)).catch((err) => { console.error(err); continueRender(handle); });
}
