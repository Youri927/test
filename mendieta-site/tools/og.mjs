// L'image de partage (web/og.jpg, 1200 × 630) : l'accueil du site en petit. La photo en hauteur de l'accueil (un toit
// de tuiles plates, leur panneau sur la pelouse), le titre en Encode Sans large, le blason, le nom et la licence.
// Composée en HTML avec la police et les images du site ; le titre prend la plus grande taille qui tient dans sa
// colonne.
//   node tools/og.mjs
import {createRequire} from 'node:module';
import {writeFileSync, rmSync} from 'node:fs';
import {resolve} from 'node:path';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const file = (p) => 'file://' + resolve(p);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face { font-family: "Encode Sans"; src: url("${file('vendor/fonts/EncodeSans.woff2')}") format("woff2"); font-weight: 100 900; font-stretch: 75% 125%; }
* { box-sizing: border-box; margin: 0; }
body { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #fff; color: #0b1b4d; font-family: "Encode Sans", sans-serif; }
.shot { position: absolute; right: 0; top: 0; width: 470px; height: 630px; overflow: hidden; }
.shot img { width: 100%; height: 100%; display: block; object-fit: cover; object-position: 50% 50%; }
.brand { position: absolute; left: 56px; top: 52px; display: flex; align-items: center; gap: 14px; }
.brand img { width: 62px; height: auto; display: block; }
.brand p { font-size: 25px; font-weight: 780; font-stretch: 112%; letter-spacing: -0.01em; }
.brand p span { font-weight: 420; font-stretch: 100%; }
h1 { position: absolute; left: 54px; top: 214px; width: 620px; font-weight: 790; font-stretch: 125%; line-height: 0.98; letter-spacing: -0.02em; }
h1 span { display: block; width: max-content; white-space: nowrap; }
.lic { position: absolute; left: 56px; bottom: 52px; font-size: 21px; font-weight: 420; color: #3d4b6e; }
.lic b { font-weight: 680; color: #0b1b4d; }
.bar { position: absolute; left: 56px; bottom: 100px; width: 64px; height: 6px; background: #ffc93c; }
</style></head><body>
<div class="shot"><img src="${file('src/img/hero-tall.avif')}" alt=""></div>
<div class="brand"><img src="${file('src/img/crest.avif')}" alt=""><p>Mendieta <span>Roofing Corp.</span></p></div>
<h1><span>Family roofers</span><span>in West Palm Beach</span><span>since 1988.</span></h1>
<div class="bar"></div>
<p class="lic"><b>Florida license CCC1328504</b>, Certified Roofing Contractor</p>
</body></html>`;
const tmp = resolve('web/_og.html');
writeFileSync(tmp, html);
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1});
await p.goto('file://' + tmp, {waitUntil: 'load'});
await p.evaluate(() => document.fonts.ready);
// la plus grande taille de titre qui tient entre la marge et la photo, et au-dessus du trait jaune
const size = await p.evaluate(() => {
  const h = document.querySelector('h1');
  const limit = document.querySelector('.shot').getBoundingClientRect().left - 48;
  const floor = document.querySelector('.bar').getBoundingClientRect().top - 40;
  let s = 84;
  const fits = () => {
    const r = h.getBoundingClientRect();
    return Math.max(...[...h.children].map((c) => c.getBoundingClientRect().right)) <= limit && r.bottom <= floor;
  };
  for (h.style.fontSize = `${s}px`; !fits() && s > 30; s--) h.style.fontSize = `${s - 1}px`;
  return parseFloat(h.style.fontSize);
});
await p.screenshot({path: 'web/og.jpg', type: 'jpeg', quality: 88});
await b.close();
rmSync(tmp);
console.log(`web/og.jpg : 1200 × 630 (titre à ${size} px)`);
