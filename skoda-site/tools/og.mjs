// L'image de partage (web/og.jpg, 1200 × 630) : l'accueil du site en petit. Le nom « Skoda » en grand, en bleu, et
// la maison blanche au palmier qui passe devant ; la fenêtre en arc, le nom de l'entreprise et le titre de l'accueil.
// Composée en HTML avec les polices et la photo du site (affichée plus petite que son original, jamais agrandie).
//   node tools/og.mjs
import {createRequire} from 'node:module';
import {writeFileSync, rmSync} from 'node:fs';
import {resolve} from 'node:path';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const file = (p) => 'file://' + resolve(p);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face { font-family: "Besley"; src: url("${file('vendor/fonts/Besley.woff2')}") format("woff2"); font-weight: 400 900; }
@font-face { font-family: "Rethink Sans"; src: url("${file('vendor/fonts/RethinkSans.woff2')}") format("woff2"); font-weight: 400 800; }
* { box-sizing: border-box; margin: 0; }
body { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #fff; color: #17212e; font-family: "Rethink Sans", sans-serif; }
.brand { position: absolute; left: 56px; top: 50px; display: flex; align-items: center; gap: 14px; }
.brand svg { width: 34px; height: 41px; fill: none; stroke: #0253a0; stroke-width: 2.6; stroke-linejoin: round; }
.brand p { font: 700 27px/1 "Besley", serif; letter-spacing: -0.005em; }
.name { position: absolute; left: 44px; top: 128px; font: 900 330px/1 "Besley", serif; letter-spacing: -0.02em; color: #0253a0; white-space: nowrap; }
.shot { position: absolute; left: 520px; top: 226px; width: 520px; }
.shot img { display: block; width: 100%; height: auto; }
.lead { position: absolute; left: 56px; bottom: 50px; width: 420px; font: 700 31px/1.12 "Besley", serif; letter-spacing: -0.012em; }
</style></head><body>
<div class="brand"><svg viewBox="0 0 40 48" aria-hidden="true"><path d="M3 46V21a17 17 0 0 1 34 0v25z"/><path d="M3 21h34M20 4v42M11.5 21v25M28.5 21v25M3 29.5h34M3 38h34M20 21 8 9M20 21 32 9"/></svg><p>Skoda Construction</p></div>
<p class="name">Skoda</p>
<div class="shot"><img src="${file('src/img/st-house.avif')}" alt=""></div>
<p class="lead">Custom homes on Florida’s Gulf coast, built by the Skoda family.</p>
</body></html>`;
const tmp = resolve('web/_og.html');
writeFileSync(tmp, html);
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1});
await p.goto('file://' + tmp, {waitUntil: 'load'});
await p.evaluate(() => document.fonts.ready);
// le nom tient dans la largeur, entre les deux marges
const fit = await p.evaluate(() => {
  const n = document.querySelector('.name');
  let s = 330;
  while (n.getBoundingClientRect().right > 1200 - 44 && s > 200) n.style.fontSize = `${--s}px`;
  const img = document.querySelector('.shot img');
  return {size: s, shown: Math.round(img.getBoundingClientRect().width), natural: img.naturalWidth};
});
await p.screenshot({path: resolve('web/og.jpg'), type: 'jpeg', quality: 88});
await b.close();
rmSync(tmp);
console.log(`web/og.jpg : nom à ${fit.size} px, photo affichée à ${fit.shown} px (original ${fit.natural} px)`);
