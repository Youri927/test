import {continueRender, delayRender, staticFile} from 'remotion';

// Les polices du site : Fraunces (titres) et Geist (texte)
if (typeof document !== 'undefined') {
  const handle = delayRender('Polices Fraunces et Geist');
  const faces = [
    new FontFace('Fraunces', `url(${staticFile('fonts/Fraunces.woff2')}) format('woff2')`, {weight: '100 900'}),
    new FontFace('Fraunces', `url(${staticFile('fonts/Fraunces-Italic.woff2')}) format('woff2')`, {weight: '100 900', style: 'italic'}),
    new FontFace('Geist', `url(${staticFile('fonts/Geist.woff2')}) format('woff2')`, {weight: '100 900'}),
  ];
  faces.forEach((f) => document.fonts.add(f));
  Promise.all(faces.map((f) => f.load())).then(() => continueRender(handle)).catch((err) => { console.error(err); continueRender(handle); });
}
