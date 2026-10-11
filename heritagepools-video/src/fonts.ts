import {continueRender, delayRender, staticFile} from 'remotion';

// Les polices du site : Ultra (titres, licence Apache 2.0) et Libre Franklin (texte, variable, OFL)
if (typeof document !== 'undefined') {
  const handle = delayRender('Polices Ultra et Libre Franklin');
  const faces = [
    new FontFace('Ultra', `url(${staticFile('fonts/Ultra.woff2')}) format('woff2')`, {weight: '400'}),
    new FontFace('Libre Franklin', `url(${staticFile('fonts/LibreFranklin.woff2')}) format('woff2')`, {weight: '300 900'}),
  ];
  faces.forEach((f) => document.fonts.add(f));
  Promise.all(faces.map((f) => f.load()))
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}
