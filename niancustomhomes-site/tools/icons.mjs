// Les icônes, rendues depuis le logo redessiné (tools/mark.mjs) :
//  - web/favicon.png (64 px) : le toit sur le premier N, sur fond blanc, pour l'onglet ;
//  - web/apple-touch-icon.png (180 px) : le même, avec plus de marge, pour l'écran d'accueil des téléphones ;
//  - web/logo.png (600 px) : le logo entier et « Custom Homes » en Gantari, le logo carré des données structurées.
//   node tools/icons.mjs
import {createRequire} from 'node:module';
import {mkdirSync, readFileSync} from 'node:fs';
import {markSvg, iconSvg} from './mark.mjs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const here = (p) => new URL(p, import.meta.url);
mkdirSync(here('../web/'), {recursive: true});
// la police en data: (une page vide ne peut pas lire un fichier local)
const font = `data:font/woff2;base64,${readFileSync(here('../vendor/fonts/Gantari.woff2')).toString('base64')}`;
// le toit et le N font 793 × 732 : on les centre sur leur boîte
const square = (size, pad) => {
  const w = Math.round(size * (1 - pad * 2));
  return `<div style="width:${size}px;height:${size}px;background:#fff;display:grid;place-items:center">${iconSvg({attrs: ` width="${w}" height="${Math.round((w * 732) / 793)}"`})}</div>`;
};
const full = (size) =>
  `<div style="width:${size}px;height:${size}px;background:#fff;display:grid;place-items:center;align-content:center;gap:${size * 0.05}px">` +
  `${markSvg({attrs: ` width="${size * 0.7}" height="${(size * 0.7 * 736) / 1958}"`})}` +
  `<div style="font:600 ${size * 0.052}px/1 Gantari;letter-spacing:0.34em;margin-right:-0.34em;color:#5D6065;text-align:center">CUSTOM HOMES</div></div>`;
const b = await chromium.launch();
for (const [file, size, html] of [
  ['favicon.png', 64, square(64, 0.07)],
  ['apple-touch-icon.png', 180, square(180, 0.17)],
  ['logo.png', 600, full(600)],
]) {
  const p = await b.newPage({viewport: {width: size, height: size}, deviceScaleFactor: 1});
  await p.setContent(`<!doctype html><html><head><style>@font-face{font-family:Gantari;src:url(${font}) format("woff2");font-weight:400 700}body{margin:0}</style></head><body>${html}</body></html>`);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({path: new URL(`../web/${file}`, import.meta.url).pathname, clip: {x: 0, y: 0, width: size, height: size}});
  await p.close();
  console.log(file, size);
}
await b.close();
