import {continueRender, delayRender, staticFile} from 'remotion';

// Les polices du site, licence OFL, réduites au latin : Gloock (Duarte Pires), une graisse ; Albert Sans, variable de
// 400 à 700.
if (typeof document !== 'undefined') {
  const faces = [
    new FontFace('Gloock', `url(${staticFile('fonts/Gloock.woff2')}) format('woff2')`, {weight: '400'}),
    new FontFace('Albert Sans', `url(${staticFile('fonts/AlbertSans.woff2')}) format('woff2')`, {weight: '400 700'}),
  ];
  const handle = delayRender('Polices Gloock et Albert Sans');
  Promise.all(
    faces.map((face) => {
      document.fonts.add(face);
      return face.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}
