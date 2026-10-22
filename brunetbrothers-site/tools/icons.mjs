// Les icônes, rendues depuis le monogramme redessiné (tools/mark.mjs) :
//  - web/favicon.png (64 px) : le monogramme sur fond blanc, pour l'onglet ;
//  - web/apple-touch-icon.png (180 px) : le même, avec plus de marge, pour l'écran d'accueil des téléphones ;
//  - web/logo.png (600 px) : le monogramme et le nom en Chivo, le logo carré des données structurées.
//   node tools/icons.mjs
import {createRequire} from 'node:module';
import {mkdirSync, readFileSync} from 'node:fs';
import {markSvg} from './mark.mjs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const here = (p) => new URL(p, import.meta.url);
mkdirSync(here('../web/'), {recursive: true});
// la police en data: (une page vide ne peut pas lire un fichier local)
const font = `data:font/woff2;base64,${readFileSync(here('../vendor/fonts/Chivo.woff2')).toString('base64')}`;
const square = (size, pad) => {
  const w = Math.round(size * (1 - pad * 2));
  return `<div style="width:${size}px;height:${size}px;background:#fff;display:grid;place-items:center">${markSvg({attrs: ` width="${w}" height="${Math.round((w * 208) / 230)}"`})}</div>`;
};
const full = (size) =>
  `<div style="width:${size}px;height:${size}px;background:#fff;display:grid;place-items:center;align-content:center;gap:${size * 0.06}px;color:#191A1B">` +
  `${markSvg({attrs: ` width="${size * 0.46}" height="${(size * 0.46 * 208) / 230}"`})}` +
  `<div style="font:800 ${size * 0.074}px/1.08 Chivo;letter-spacing:-0.02em;text-align:center">Brunet Brothers<br>Construction</div></div>`;
const b = await chromium.launch();
for (const [file, size, html] of [
  ['favicon.png', 64, square(64, 0.06)],
  ['apple-touch-icon.png', 180, square(180, 0.16)],
  ['logo.png', 600, full(600)],
]) {
  const p = await b.newPage({viewport: {width: size, height: size}, deviceScaleFactor: 1});
  await p.setContent(`<!doctype html><html><head><style>@font-face{font-family:Chivo;src:url(${font}) format("woff2");font-weight:300 900}body{margin:0}</style></head><body>${html}</body></html>`);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({path: new URL(`../web/${file}`, import.meta.url).pathname, clip: {x: 0, y: 0, width: size, height: size}});
  await p.close();
  console.log(file, size);
}
await b.close();
