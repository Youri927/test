import {continueRender, delayRender, staticFile} from 'remotion';

// Les polices du site : Besley (Owen Earl, licence OFL), un Clarendon variable de 400 à 900, pour le nom, les titres et
// les citations ; Rethink Sans (licence OFL), variable de 400 à 800, pour le reste.
if (typeof document !== 'undefined') {
  const faces = [
    new FontFace('Besley', `url(${staticFile('fonts/Besley.woff2')}) format('woff2')`, {weight: '400 900'}),
    new FontFace('Besley', `url(${staticFile('fonts/Besley-Italic.woff2')}) format('woff2')`, {weight: '400 900', style: 'italic'}),
    new FontFace('Rethink Sans', `url(${staticFile('fonts/RethinkSans.woff2')}) format('woff2')`, {weight: '400 800'}),
  ];
  const handle = delayRender('Polices Besley et Rethink Sans');
  for (const face of faces) document.fonts.add(face);
  Promise.all(faces.map((f) => f.load()))
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}
