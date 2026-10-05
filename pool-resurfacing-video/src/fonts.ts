import {continueRender, delayRender, staticFile} from 'remotion';

// Les polices du site : Bricolage Grotesque (titres et texte, largeur variable) et DM Mono (étiquettes)
if (typeof document !== 'undefined') {
  const handle = delayRender('Polices Bricolage Grotesque et DM Mono');
  const faces = [
    new FontFace('Bricolage Grotesque', `url(${staticFile('fonts/BricolageGrotesque.woff2')}) format('woff2')`, {weight: '200 800', stretch: '75% 100%'}),
    new FontFace('DM Mono', `url(${staticFile('fonts/DMMono-400.woff2')}) format('woff2')`, {weight: '400'}),
    new FontFace('DM Mono', `url(${staticFile('fonts/DMMono-500.woff2')}) format('woff2')`, {weight: '500'}),
  ];
  faces.forEach((f) => document.fonts.add(f));
  Promise.all(faces.map((f) => f.load())).then(() => continueRender(handle)).catch((err) => { console.error(err); continueRender(handle); });
}
