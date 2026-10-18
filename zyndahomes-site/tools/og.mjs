// L'image de partage (web/og.jpg, 1200 × 630) : l'accueil du site en petit, lu en Z. La première phrase en haut à
// gauche, la maison et sa piscine en bandeau, la fin de la phrase en bas à droite ; le logo, le métier et le téléphone.
// Composée en HTML avec les polices, la photo et le logo du site.
//   node tools/og.mjs
import {createRequire} from 'node:module';
import {readFileSync, writeFileSync, rmSync} from 'node:fs';
import {resolve} from 'node:path';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const logo = JSON.parse(readFileSync(resolve('data/logo.json'), 'utf8'));
const svg = (k, cls) => `<svg class="${cls}" viewBox="0 0 ${logo[k].w} ${logo[k].h}"><path d="${logo[k].d}" fill="#000" fill-rule="evenodd"/></svg>`;
const font = (f) => `url("file://${resolve('vendor/fonts/' + f)}") format("woff2")`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face { font-family: "Montagu Slab"; src: ${font('MontaguSlab.woff2')}; font-weight: 200 500; }
@font-face { font-family: "Reddit Sans"; src: ${font('RedditSans.woff2')}; font-weight: 400 700; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #fff; color: #000; font-family: "Reddit Sans", sans-serif; }
.brand { position: absolute; left: 56px; top: 40px; display: flex; align-items: center; gap: 12px; }
.emblem { width: 46px; height: auto; } .word { width: 118px; height: auto; }
.k { position: absolute; right: 56px; top: 52px; font: 500 17px/1.3 "Reddit Sans"; text-align: right; }
.l { position: absolute; font: 250 76px/1 "Montagu Slab"; letter-spacing: -0.026em; white-space: nowrap; }
.l1 { left: 52px; top: 108px; }
.band { position: absolute; left: 0; top: 214px; width: 1200px; height: 272px; object-fit: cover; object-position: 50% 58%; }
.l2 { right: 56px; top: 506px; }
.tel { position: absolute; left: 56px; bottom: 44px; font: 600 21px/1.3 "Reddit Sans"; }
.tel small { display: block; font: 400 16px/1.3 "Reddit Sans"; color: #5c6366; }
</style></head><body>
<div class="brand">${svg('emblem', 'emblem')}${svg('word', 'word')}</div>
<p class="k">Custom homes and renovations<br>Naples and Marco Island, since 2001</p>
<p class="l l1">The people who show up.</p>
<img class="band" src="file://${resolve('src/img/hero-1600.avif')}" alt="">
<p class="l l2">Every single day.</p>
<p class="tel">(239) 213-1314<small>License CGC056812</small></p>
</body></html>`;
const tmp = resolve('web/_og.html');
writeFileSync(tmp, html);
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1});
await p.goto('file://' + tmp, {waitUntil: 'load'});
await p.evaluate(() => document.fonts.ready);
// rien ne sort de l'image ; la phrase ne touche ni le logo, ni la photo, ni le téléphone
const fit = await p.evaluate(() => {
  const r = (s) => document.querySelector(s).getBoundingClientRect();
  const l1 = r('.l1'), l2 = r('.l2'), band = r('.band'), tel = r('.tel'), k = r('.k'), brand = r('.brand');
  return {inside: l1.right <= 1200 && l2.left >= 0 && l2.bottom <= 630, apart: l1.bottom <= band.top && l2.top >= band.bottom && tel.right < l2.left && brand.bottom < l1.top + 12 && k.left > brand.right};
});
await p.screenshot({path: resolve('web/og.jpg'), type: 'jpeg', quality: 88});
await b.close();
rmSync(tmp);
if (!fit.inside || !fit.apart) throw new Error(`image de partage : ${JSON.stringify(fit)}`);
console.log('web/og.jpg : tout dans l’image');
