import {continueRender, delayRender, staticFile} from 'remotion';

// Les polices du site : Syne (titres, 400 à 800) et Onest (texte, 100 à 900), licences OFL
if (typeof document !== 'undefined') {
  const handle = delayRender('Polices Syne et Onest');
  const faces = [
    new FontFace('Syne', `url(${staticFile('fonts/Syne.woff2')}) format('woff2')`, {weight: '400 800'}),
    new FontFace('Onest', `url(${staticFile('fonts/Onest.woff2')}) format('woff2')`, {weight: '100 900'}),
  ];
  for (const face of faces) document.fonts.add(face);
  Promise.all(faces.map((face) => face.load()))
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}
