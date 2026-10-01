import {continueRender, delayRender, staticFile} from 'remotion';

const faces: [string, string, string, string][] = [
  ['AD Display', 'fonts/ad/BigShoulders.woff2', '100 900', 'normal'],
  ['AD Stencil', 'fonts/ad/BigShouldersStencil.woff2', '100 900', 'normal'],
  ['AD Body', 'fonts/ad/Epilogue.woff2', '100 900', 'normal'],
  ['AD Body', 'fonts/ad/Epilogue-Italic.woff2', '100 900', 'italic'],
];

if (typeof document !== 'undefined') {
  const handle = delayRender('Polices de la pub');
  Promise.all(
    faces.map(([family, file, weight, style]) => {
      const face = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, {weight, style});
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
