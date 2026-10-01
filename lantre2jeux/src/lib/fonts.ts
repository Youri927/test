import {continueRender, delayRender, staticFile} from 'remotion';

/**
 * Polices auto-hébergées (public/fonts) : aucun accès réseau au rendu.
 * ⚠️ Provisoire (voir theme.ts) — remplacer par les polices du site.
 */
export const fonts = {
  display: 'L2J Display',
  body: 'L2J Body',
};

const faces: [string, string, string][] = [
  [fonts.display, 'fonts/BebasNeue-400.woff2', '400'],
  [fonts.body, 'fonts/Inter-400.woff2', '400'],
  [fonts.body, 'fonts/Inter-600.woff2', '600'],
  [fonts.body, 'fonts/Inter-800.woff2', '800'],
];

if (typeof document !== 'undefined') {
  const handle = delayRender('Chargement des polices');
  Promise.all(
    faces.map(([family, file, weight]) => {
      const face = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, {weight});
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
