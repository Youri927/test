import {continueRender, delayRender, staticFile} from 'remotion';

// Les polices du site : Bodoni Moda (titres), Schibsted Grotesk (texte)
if (typeof document !== 'undefined') {
  const handle = delayRender('Polices Bodoni Moda et Schibsted Grotesk');
  const faces = [
    new FontFace('Bodoni Moda', `url(${staticFile('fonts/BodoniModa.woff2')}) format('woff2')`, {weight: '400 900'}),
    new FontFace('Bodoni Moda', `url(${staticFile('fonts/BodoniModa-Italic.woff2')}) format('woff2')`, {weight: '400 900', style: 'italic'}),
    new FontFace('Schibsted Grotesk', `url(${staticFile('fonts/SchibstedGrotesk.woff2')}) format('woff2')`, {weight: '400 900'}),
  ];
  faces.forEach((f) => document.fonts.add(f));
  Promise.all(faces.map((f) => f.load())).then(() => continueRender(handle)).catch((err) => { console.error(err); continueRender(handle); });
}
