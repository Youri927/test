import {continueRender, delayRender, staticFile} from 'remotion';

// Les polices du site : Instrument Serif (titres) et Mona Sans (texte, largeur variable)
if (typeof document !== 'undefined') {
  const handle = delayRender('Polices Instrument Serif et Mona Sans');
  const faces = [
    new FontFace('Instrument Serif', `url(${staticFile('fonts/InstrumentSerif.woff2')}) format('woff2')`, {weight: '400'}),
    new FontFace('Instrument Serif', `url(${staticFile('fonts/InstrumentSerif-Italic.woff2')}) format('woff2')`, {weight: '400', style: 'italic'}),
    new FontFace('Mona Sans', `url(${staticFile('fonts/MonaSans.woff2')}) format('woff2')`, {weight: '200 900', stretch: '75% 125%'}),
  ];
  faces.forEach((f) => document.fonts.add(f));
  Promise.all(faces.map((f) => f.load())).then(() => continueRender(handle)).catch((err) => { console.error(err); continueRender(handle); });
}
