// L'image de partage (web/og.jpg, 1200 × 630) : l'accueil arrêté au repos. « Lot » + « Home » en très grand, et sous
// chaque mot sa moitié de la photo d'Oakes Estate (le jardin à gauche, la maison à droite), écartées autour du « + ».
// En bas, le logo, la phrase de l'accueil et le téléphone. Composée en HTML avec les polices, la photo et le logo du site.
//   node tools/og.mjs
import {createRequire} from 'node:module';
import {writeFileSync, rmSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {markSvg} from './mark.mjs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const here = (p) => resolve(dirname(fileURLToPath(import.meta.url)), '..', p);
const font = (f) => `url("file://${here('vendor/fonts/' + f)}") format("woff2")`;
// la photo, à la même échelle dans les deux moitiés ; chacune n'en montre que sa moitié, contre l'écart
const W = 1200;
const GAP = 44;
const IMG_W = 1340;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face { font-family: Petrona; src: ${font('Petrona.woff2')}; font-weight: 200 500; }
@font-face { font-family: Gantari; src: ${font('Gantari.woff2')}; font-weight: 400 700; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { position: relative; width: ${W}px; height: 630px; overflow: hidden; background: #F3F4F2; color: #1E1F21; font-family: Gantari, sans-serif; }
.words { position: absolute; left: 48px; right: 48px; top: 26px; display: flex; justify-content: space-between; align-items: flex-end; font: 200 156px/0.8 Petrona; letter-spacing: -0.035em; }
.plus { position: absolute; left: 50%; bottom: 46px; width: 58px; height: 58px; margin-left: -29px; }
.plus svg { width: 100%; height: 100%; overflow: visible; fill: none; stroke: #6B1D22; stroke-width: 6.5; }
.half { position: absolute; top: 172px; height: 328px; width: ${(W - 96 - GAP) / 2}px; overflow: hidden; }
.half--l { left: 48px; }
.half--r { right: 48px; }
.half img { position: absolute; top: 50%; width: ${IMG_W}px; height: auto; transform: translateY(-58%); }
.half--l img { right: ${-IMG_W / 2}px; }
.half--r img { left: ${-IMG_W / 2}px; }
.foot { position: absolute; left: 48px; right: 48px; bottom: 34px; display: flex; align-items: flex-end; gap: 28px; }
.foot svg { width: 96px; height: auto; flex: none; margin-bottom: 4px; }
.foot h1 { font: 300 37px/1.05 Petrona; letter-spacing: -0.015em; flex: 1; }
.foot p { font: 600 23px/1.2 Gantari; white-space: nowrap; }
.foot small { display: block; font: 400 15px/1.3 Gantari; color: #5D6065; }
</style></head><body>
<div class="words"><span>Lot</span><span>Home</span><span class="plus"><svg viewBox="0 0 100 100"><path d="M50 4V96M4 50H96"/></svg></span></div>
<div class="half half--l"><img src="file://${here('src/img/hero-w-1600.avif')}" alt=""></div>
<div class="half half--r"><img src="file://${here('src/img/hero-w-1600.avif')}" alt=""></div>
<div class="foot">${markSvg()}<h1>Custom homes in Naples, from the lot up.</h1><p><small>Free consultation</small>239-280-6428</p></div>
</body></html>`;
const tmp = here('web/_og.html');
writeFileSync(tmp, html);
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: W, height: 630}, deviceScaleFactor: 1});
await p.goto('file://' + tmp, {waitUntil: 'load'});
await p.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => i.decode()));
});
// rien ne sort de l'image ; les mots, la photo et la ligne du bas ne se touchent pas
const fit = await p.evaluate(() => {
  const r = (s) => document.querySelector(s).getBoundingClientRect();
  const words = r('.words'), half = r('.half--l'), foot = r('.foot'), plus = r('.plus'), l = r('.half--l'), rr = r('.half--r');
  return {
    inside: foot.bottom <= 630 - 24 && words.top >= 16 && foot.right <= 1200 - 40,
    apart: words.bottom <= half.top - 6 && half.bottom <= foot.top - 14,
    seam: Math.abs((plus.left + plus.right) / 2 - (l.right + rr.left) / 2) < 1,
  };
});
await p.screenshot({path: here('web/og.jpg'), type: 'jpeg', quality: 88});
await b.close();
rmSync(tmp);
if (!fit.inside || !fit.apart || !fit.seam) throw new Error(`image de partage : ${JSON.stringify(fit)}`);
console.log('web/og.jpg : tout dans l’image', JSON.stringify(fit));
