import {continueRender, delayRender, staticFile} from 'remotion';

// Les polices du site : Sofia Sans et Sofia Sans Extra Condensed (variables), licence OFL
if (typeof document !== 'undefined') {
  const handle = delayRender('Polices Sofia Sans');
  const faces = [
    new FontFace('Sofia Sans', `url(${staticFile('fonts/SofiaSans.woff2')}) format('woff2')`, {weight: '1 1000'}),
    new FontFace('Sofia Sans Extra Condensed', `url(${staticFile('fonts/SofiaSansExtraCondensed.woff2')}) format('woff2')`, {weight: '1 1000'}),
  ];
  faces.forEach((f) => document.fonts.add(f));
  Promise.all(faces.map((f) => f.load()))
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}
