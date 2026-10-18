// Les icônes, rendues depuis l'emblème vectorisé (data/logo.json) :
//  - web/favicon.png (64 px) : l'emblème blanc sur noir, pour l'onglet ;
//  - web/apple-touch-icon.png (180 px) : le même, pour l'écran d'accueil des téléphones ;
//  - web/logo.png (512 px) : l'emblème noir sur blanc, le logo carré des données structurées.
//   node tools/icons.mjs
import {createRequire} from 'node:module';
import {readFileSync, mkdirSync} from 'node:fs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const here = (p) => new URL(p, import.meta.url);
const {emblem: E} = JSON.parse(readFileSync(here('../data/logo.json'), 'utf8'));
mkdirSync(here('../web/'), {recursive: true});

const svg = (size, fg, bg, pad) => {
  const s = Math.max(E.w, E.h) * (1 + pad * 2);
  const ox = (s - E.w) / 2;
  const oy = (s - E.h) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${s} ${s}"><rect width="${s}" height="${s}" fill="${bg}"/><path transform="translate(${ox} ${oy})" d="${E.d}" fill="${fg}" fill-rule="evenodd"/></svg>`;
};
const b = await chromium.launch();
for (const [file, size, fg, bg, pad] of [
  ['favicon.png', 64, '#fff', '#000', 0.08],
  ['apple-touch-icon.png', 180, '#fff', '#000', 0.16],
  ['logo.png', 512, '#000', '#fff', 0.1],
]) {
  const p = await b.newPage({viewport: {width: size, height: size}, deviceScaleFactor: 1});
  await p.setContent(`<!doctype html><html><body style="margin:0">${svg(size, fg, bg, pad)}</body></html>`);
  await p.screenshot({path: new URL(`../web/${file}`, import.meta.url).pathname, clip: {x: 0, y: 0, width: size, height: size}});
  await p.close();
  console.log(file, size);
}
await b.close();
