// L'image de partage (web/og.jpg, 1200 × 630) : l'accueil une fois la lumière posée, le nom du cabinet, le titre dans
// la fenêtre de lumière, l'adresse. Composée en HTML avec les polices du site.
//   node tools/og.mjs
import {createRequire} from 'node:module';
import {writeFileSync, rmSync} from 'node:fs';
import {resolve} from 'node:path';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const font = (f) => 'file://' + resolve(`vendor/fonts/${f}.woff2`);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face { font-family: "Bodoni Moda"; src: url("${font('BodoniModa')}") format("woff2"); font-weight: 400 900; }
@font-face { font-family: "Hanken Grotesk"; src: url("${font('HankenGrotesk')}") format("woff2"); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; }
body { position: relative; width: 1200px; height: 630px; overflow: hidden; background: linear-gradient(180deg, #f3f0f4, #ede8ef); color: #271b2d; font-family: "Hanken Grotesk", sans-serif; }
.light { --sun: #fffdfb; position: absolute; top: 34px; right: 70px; width: 560px; aspect-ratio: 1.22; filter: blur(10px); opacity: 0.95; transform: skewX(-14deg); transform-origin: 50% 0;
  background: linear-gradient(var(--sun), var(--sun)) 0 0 / 48.5% 48% no-repeat, linear-gradient(var(--sun), var(--sun)) 100% 0 / 48.5% 48% no-repeat,
    linear-gradient(var(--sun), var(--sun)) 0 100% / 48.5% 48% no-repeat, linear-gradient(var(--sun), var(--sun)) 100% 100% / 48.5% 48% no-repeat; }
.mark { position: absolute; left: 64px; top: 50px; display: grid; gap: 5px; }
.mark b { font-family: "Bodoni Moda", serif; font-size: 30px; font-weight: 500; letter-spacing: -0.01em; }
.mark span { color: #5e4e63; font-size: 16px; font-weight: 500; letter-spacing: 0.02em; }
h1 { position: absolute; left: 60px; top: 168px; font-family: "Bodoni Moda", serif; font-size: 98px; font-weight: 450; line-height: 0.98; letter-spacing: -0.022em;
  text-shadow: 0.004em 0.01em 0.012em rgba(39, 27, 45, 0.14), 0.012em 0.05em 0.11em rgba(39, 27, 45, 0.1); }
h1 span { display: block; }
.where { position: absolute; left: 64px; right: 64px; bottom: 50px; padding-top: 18px; border-top: 1px solid #d8d0db; color: #5e4e63; font-size: 22px; }
</style></head><body>
<div class="light"></div>
<p class="mark"><b>One Place Wellness</b><span>Elizabeth Fox, M.D.</span></p>
<h1><span>Look as healthy</span><span>and happy as you feel.</span></h1>
<p class="where">Non-surgical rejuvenation by a plastic surgeon. 827 Myrtle Terrace, Naples, FL.</p>
</body></html>`;
const tmp = resolve('web/_og.html');
writeFileSync(tmp, html);
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1});
await p.goto('file://' + tmp, {waitUntil: 'load'});
await p.evaluate(() => document.fonts.ready);
await p.screenshot({path: 'web/og.jpg', type: 'jpeg', quality: 88});
await b.close();
rmSync(tmp);
console.log('web/og.jpg : 1200 × 630');
