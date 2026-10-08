import {continueRender, delayRender, staticFile} from 'remotion';

// La police du site : Instrument Sans (variable, graisse 400–700, chasse 75–100 %), licence OFL
if (typeof document !== 'undefined') {
  const handle = delayRender('Police Instrument Sans');
  const face = new FontFace('Instrument Sans', `url(${staticFile('fonts/InstrumentSans.woff2')}) format('woff2')`, {weight: '400 700', stretch: '75% 100%'});
  document.fonts.add(face);
  face.load().then(() => continueRender(handle)).catch((err) => { console.error(err); continueRender(handle); });
}
