import {continueRender, delayRender, staticFile} from 'remotion';

// Les polices du site : Anybody (titres), Instrument Sans (texte), Geist Mono (incrustations de régie)
if (typeof document !== 'undefined') {
  const handle = delayRender('Polices Anybody, Instrument Sans et Geist Mono');
  const faces = [
    new FontFace('Anybody', `url(${staticFile('fonts/Anybody.woff2')}) format('woff2')`, {weight: '100 900', stretch: '50% 150%'}),
    new FontFace('Instrument Sans', `url(${staticFile('fonts/InstrumentSans.woff2')}) format('woff2')`, {weight: '400 700', stretch: '75% 100%'}),
    new FontFace('Geist Mono', `url(${staticFile('fonts/GeistMono.woff2')}) format('woff2')`, {weight: '100 900'}),
  ];
  faces.forEach((f) => document.fonts.add(f));
  Promise.all(faces.map((f) => f.load())).then(() => continueRender(handle)).catch((err) => { console.error(err); continueRender(handle); });
}
