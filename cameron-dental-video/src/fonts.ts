import {continueRender, delayRender, staticFile} from 'remotion';

// Les polices du site : Bricolage Grotesque (titres) et Hanken Grotesk (texte), licence OFL
if (typeof document !== 'undefined') {
  const handle = delayRender('Polices Bricolage Grotesque et Hanken Grotesk');
  const faces = [
    new FontFace('Bricolage Grotesque', `url(${staticFile('fonts/BricolageGrotesque.woff2')}) format('woff2')`, {weight: '200 800', stretch: '75% 100%'}),
    new FontFace('Hanken Grotesk', `url(${staticFile('fonts/HankenGrotesk.woff2')}) format('woff2')`, {weight: '100 900'}),
  ];
  faces.forEach((f) => document.fonts.add(f));
  Promise.all(faces.map((f) => f.load())).then(() => continueRender(handle)).catch((err) => { console.error(err); continueRender(handle); });
}
