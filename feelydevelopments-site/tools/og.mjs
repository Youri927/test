// L'image de partage (web/og.jpg, 1200 × 630) : la frise du site en une ligne, « Design », « Build » et « Live » reliés
// par leurs barres de trait d'union, au-dessus de l'entrée en brique blanchie. En bas, le logo, la phrase de l'accueil
// et le téléphone. Composée en HTML avec les polices, la photo et le logo du site.
//   node tools/og.mjs
import {createRequire} from 'node:module';
import {writeFileSync, rmSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {markSvg} from './mark.mjs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const here = (p) => resolve(dirname(fileURLToPath(import.meta.url)), '..', p);
const font = (f) => `url("file://${here('vendor/fonts/' + f)}") format("woff2")`;
const W = 1200;
const H = 630;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face { font-family: Spectral; src: ${font('Spectral-200.woff2')}; font-weight: 200; }
@font-face { font-family: Spectral; src: ${font('Spectral-300.woff2')}; font-weight: 300; }
@font-face { font-family: Jost; src: ${font('Jost.woff2')}; font-weight: 400 600; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; background: #F2F1EE; color: #1F201E; font-family: Jost, sans-serif; }
/* la frise : la barre est à la hauteur du trait d'union de Spectral, comme sur le site */
.frieze { position: absolute; left: 46px; right: 48px; top: 34px; display: flex; align-items: flex-start; font: 200 116px/1 Spectral; letter-spacing: -0.03em; }
.frieze span { flex: none; }
.frieze i { flex: 1; height: 0.075em; margin: 0.5035em 0.03em 0 0.06em; background: currentColor; }
.photo { position: absolute; left: 48px; right: 48px; top: 186px; height: 316px; overflow: hidden; }
.photo img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 46%; display: block; }
.foot { position: absolute; left: 48px; right: 48px; bottom: 30px; display: flex; align-items: flex-end; gap: 30px; }
.foot svg { width: 150px; height: auto; flex: none; margin-bottom: 9px; }
.foot h1 { flex: 1; font: 300 32px/1.1 Spectral; white-space: nowrap; letter-spacing: -0.01em; }
.foot p { font: 600 24px/1.2 Jost; white-space: nowrap; text-align: right; }
.foot small { display: block; font: 400 16px/1.3 Jost; color: #5B5D59; }
</style></head><body>
<p class="frieze"><span>Design</span><i></i><span>Build</span><i></i><span>Live</span></p>
<div class="photo"><img src="file://${here('src/img/foyer-1920.avif')}" alt=""></div>
<div class="foot">${markSvg()}<h1>Custom homes and renovations in Winter&nbsp;Park.</h1><p><small>Meet with Ryan</small>(321) 663-1433</p></div>
</body></html>`;
const tmp = here('web/_og.html');
writeFileSync(tmp, html);
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: W, height: H}, deviceScaleFactor: 1});
await p.goto('file://' + tmp, {waitUntil: 'load'});
await p.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => i.decode()));
});
// rien ne sort de l'image ; la frise, la photo et la ligne du bas ne se touchent pas ; les barres gardent de la longueur
const fit = await p.evaluate(([w, h]) => {
  const r = (s) => document.querySelector(s).getBoundingClientRect();
  const words = [...document.querySelectorAll('.frieze span')].map((s) => s.getBoundingClientRect());
  const bars = [...document.querySelectorAll('.frieze i')].map((s) => s.getBoundingClientRect().width);
  const photo = r('.photo'), foot = r('.foot'), mark = r('.foot svg');
  // le bas du « g » de Design : la ligne de base de Spectral est à 0,798 em du haut quand l'interligne vaut 1
  const c = document.createElement('canvas').getContext('2d');
  c.font = '200 116px Spectral';
  const ink = words[0].top + 0.798 * 116 + c.measureText('Design').actualBoundingBoxDescent;
  return {
    inside: foot.bottom <= h - 24 && words[0].top >= 12 && words[2].right <= w - 40 && mark.left >= 40,
    apart: ink <= photo.top - 8 && photo.bottom <= foot.top - 14,
    bars: bars.map(Math.round),
  };
}, [W, H]);
await p.screenshot({path: here('web/og.jpg'), type: 'jpeg', quality: 88});
await b.close();
rmSync(tmp);
if (!fit.inside || !fit.apart || Math.min(...fit.bars) < 120) throw new Error(`image de partage : ${JSON.stringify(fit)}`);
console.log('web/og.jpg : tout dans l’image', JSON.stringify(fit));
