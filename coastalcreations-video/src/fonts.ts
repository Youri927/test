import {continueRender, delayRender, staticFile} from 'remotion';

// Les polices du site : Unbounded (titres) et Figtree (texte), variables, licence OFL
if (typeof document !== 'undefined') {
  const handle = delayRender('Polices Unbounded et Figtree');
  const faces = [
    new FontFace('Unbounded', `url(${staticFile('fonts/Unbounded.woff2')}) format('woff2')`, {weight: '200 900'}),
    new FontFace('Figtree', `url(${staticFile('fonts/Figtree.woff2')}) format('woff2')`, {weight: '300 900'}),
  ];
  faces.forEach((f) => document.fonts.add(f));
  Promise.all(faces.map((f) => f.load()))
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}
