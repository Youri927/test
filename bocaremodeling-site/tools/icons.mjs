// Les icônes, rendues depuis le logo redessiné (tools/mark.mjs) :
//  - web/favicon.png (64 px) : les deux toits, bleu azur et encre, sur fond plâtre, pour l'onglet ;
//  - web/apple-touch-icon.png (180 px) : le même, avec plus de marge, pour l'écran d'accueil des téléphones ;
//  - web/logo.png (600 px) : les toits et le nom en Mozilla Headline, le logo carré des données structurées.
//   node tools/icons.mjs
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {markSvg} from './mark.mjs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const here = (p) => new URL(p, import.meta.url);
mkdirSync(here('../web/'), {recursive: true});
const PAPER = '#F4F6F7';
const font = here('../vendor/fonts/MozillaHeadline.woff2').href;

const square = (size, pad) => `<div style="width:${size}px;height:${size}px;background:${PAPER};display:grid;place-items:center">${markSvg({attrs: ` width="${Math.round(size * (1 - pad * 2))}" height="${Math.round(size * (1 - pad * 2) * 0.625)}"`})}</div>`;
const full = (size) =>
  `<div style="width:${size}px;height:${size}px;background:${PAPER};display:grid;place-items:center;align-content:center;gap:${size * 0.04}px;color:#10233A">` +
  `${markSvg({attrs: ` width="${size * 0.5}" height="${size * 0.3125}"`})}` +
  `<div style="font:650 ${size * 0.083}px/1 'Mozilla Headline';font-stretch:84%;letter-spacing:-0.005em;text-align:center">Boca Remodeling Group</div></div>`;
const b = await chromium.launch();
for (const [file, size, html] of [
  ['favicon.png', 64, square(64, 0.04)],
  ['apple-touch-icon.png', 180, square(180, 0.16)],
  ['logo.png', 600, full(600)],
]) {
  const p = await b.newPage({viewport: {width: size, height: size}, deviceScaleFactor: 1});
  await p.setContent(`<!doctype html><html><head><style>@font-face{font-family:"Mozilla Headline";src:url(${font}) format("woff2");font-weight:400 700;font-stretch:75% 100%}body{margin:0}</style></head><body>${html}</body></html>`);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({path: new URL(`../web/${file}`, import.meta.url).pathname, clip: {x: 0, y: 0, width: size, height: size}});
  await p.close();
  console.log(file, size);
}
await b.close();
