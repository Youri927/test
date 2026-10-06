import {continueRender, delayRender, staticFile} from 'remotion';

// Les polices du site : Funnel Display (titres) et Funnel Sans (texte), Dicotype, licence OFL
if (typeof document !== 'undefined') {
  const handle = delayRender('Polices Funnel Display et Funnel Sans');
  const faces = [
    new FontFace('Funnel Display', `url(${staticFile('fonts/FunnelDisplay.woff2')}) format('woff2')`, {weight: '300 800'}),
    new FontFace('Funnel Sans', `url(${staticFile('fonts/FunnelSans.woff2')}) format('woff2')`, {weight: '300 800'}),
  ];
  faces.forEach((f) => document.fonts.add(f));
  Promise.all(faces.map((f) => f.load())).then(() => continueRender(handle)).catch((err) => { console.error(err); continueRender(handle); });
}
