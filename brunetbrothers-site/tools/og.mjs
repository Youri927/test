// L'image de partage (web/og.jpg, 1200 × 630) : le geste de l'accueil, arrêté à mi-course. À droite, la planche (trois
// douches au-dessus de trois cuisines) ; la paroi de verre a traversé les deux premières colonnes, la troisième est
// encore sous le verre dépoli, avec le bord blanc de la paroi entre les deux. À gauche, le monogramme, la devise, le
// métier, la ville et les deux lignes. Composée en HTML avec les polices, les photos et le logo du site.
//   node tools/og.mjs
import {createRequire} from 'node:module';
import {readFileSync, writeFileSync, rmSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {markSvg} from './mark.mjs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const here = (p) => resolve(dirname(fileURLToPath(import.meta.url)), '..', p);
const lqip = JSON.parse(readFileSync(here('data/lqip.json'), 'utf8'));
const font = (f) => `url("file://${here('vendor/fonts/' + f)}") format("woff2")`;
const CELLS = ['h-1', 'h-2', 'h-3', 'h-4', 'h-5', 'h-6'];
// la paroi est arrêtée là (en px depuis le bord gauche de la planche)
const SWEEP = 436;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face { font-family: Chivo; src: ${font('Chivo.woff2')}; font-weight: 300 900; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #EEEFED; color: #191A1B; font-family: Chivo, sans-serif; }
.brand { position: absolute; left: 56px; top: 50px; display: flex; align-items: center; gap: 14px; }
.brand svg { width: 52px; height: auto; }
.brand span { font: 800 23px/1 Chivo; letter-spacing: -0.02em; }
.brand b { font-weight: 500; }
h1 { position: absolute; left: 56px; top: 150px; width: 520px; font: 850 70px/0.95 Chivo; letter-spacing: -0.035em; }
.k { position: absolute; left: 56px; bottom: 50px; font: 400 19px/1.45 Chivo; width: 500px; }
.k .tel { display: flex; gap: 30px; margin-top: 16px; }
.k .tel small { display: block; font: 500 14px/1.3 Chivo; color: #5B5F63; }
.k .tel strong { font: 750 22px/1.2 Chivo; word-spacing: 0.14em; }
.plate { position: absolute; right: 56px; top: 50%; transform: translateY(-50%); width: 552px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.ph { position: relative; aspect-ratio: 3 / 4; overflow: hidden; isolation: isolate; background-size: cover; background-position: center; }
.ph::before { content: ""; position: absolute; inset: -14%; z-index: -1; background: inherit; filter: blur(14px) saturate(1.06); }
.ph::after { content: ""; position: absolute; inset: 0; background: linear-gradient(104deg, rgba(255,255,255,.44), rgba(255,255,255,.2) 55%, rgba(255,255,255,.34)); }
.ph img { position: relative; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block; }
.edge { position: absolute; z-index: 3; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: #fff; box-shadow: 0 0 0 .5px rgba(255,255,255,.5), 0 0 22px 5px rgba(255,255,255,.55), 8px 0 26px rgba(255,255,255,.35); }
</style></head><body>
<div class="brand">${markSvg()}<span>Brunet Brothers <b>Construction</b></span></div>
<h1>Masters of consistency and quality.</h1>
<div class="k">Family-owned general contractor in Lake Worth, Florida. Kitchens, bathrooms and new construction, since 2008.
  <div class="tel"><p><small>Call in English</small><strong>(561) 904-1465</strong></p><p><small>Llame en español</small><strong>(561) 904-1893</strong></p></div></div>
<div class="plate">${CELLS.map((n) => `<div class="ph" style="background-image:url(${lqip[n]})"><img src="file://${here(`src/img/${n}-720.avif`)}" alt=""></div>`).join('')}<span class="edge" style="left:${SWEEP}px"></span></div>
<script>
// chaque photo est nette jusqu'au bord de la paroi
for (const ph of document.querySelectorAll('.ph')) {
  const x = Math.min(1, Math.max(0, (${SWEEP} - ph.offsetLeft) / ph.offsetWidth)) * 100;
  ph.querySelector('img').style.clipPath = 'inset(0 ' + (100 - x) + '% 0 0)';
}
</script>
</body></html>`;
const tmp = here('web/_og.html');
writeFileSync(tmp, html);
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1});
await p.goto('file://' + tmp, {waitUntil: 'load'});
await p.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => i.decode()));
});
// rien ne sort de l'image ; le texte ne touche ni la planche, ni le logo, ni le bas
const fit = await p.evaluate(() => {
  const r = (s) => document.querySelector(s).getBoundingClientRect();
  const h1 = r('h1'), k = r('.k'), pl = r('.plate'), brand = r('.brand');
  const right = [...document.querySelectorAll('h1, .k')].map((e) => {
    const g = document.createRange();
    g.selectNodeContents(e);
    return [...g.getClientRects()].reduce((m, x) => Math.max(m, x.right), 0);
  });
  return {inside: k.bottom <= 630 - 40 && h1.top > brand.bottom + 30 && pl.top >= 20 && pl.bottom <= 610, apart: Math.max(...right) < pl.left - 24 && k.top > h1.bottom + 24, right: Math.round(Math.max(...right)), plate: Math.round(pl.left)};
});
await p.screenshot({path: here('web/og.jpg'), type: 'jpeg', quality: 88});
await b.close();
rmSync(tmp);
if (!fit.inside || !fit.apart) throw new Error(`image de partage : ${JSON.stringify(fit)}`);
console.log('web/og.jpg : tout dans l’image', JSON.stringify(fit));
