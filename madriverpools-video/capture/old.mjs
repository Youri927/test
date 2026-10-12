// Le site actuel (madriverpools.com), filmé une fois en 2× pour l'ouverture : l'accueil tel qu'il s'affiche au chargement.
// Usage : node capture/old.mjs [image.jpg]  →  public/old/home.jpg (2880 × 1800)
// Le Chromium de Playwright ne lit pas le H.264 : leur vidéo d'accueil y affiche « Media error », ce qu'un visiteur ne voit
// pas dans Chrome ou Safari. On la remplace donc par une image tirée de cette même vidéo (MRP2_6.mp4), passée en argument.
import {mkdirSync, readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node-tools/node_modules/playwright');
const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/old');
mkdirSync(out, {recursive: true});

const browser = await chromium.launch({args: ['--hide-scrollbars', '--force-color-profile=srgb']});
const ctx = await browser.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: 2, locale: 'en-US'});
const page = await ctx.newPage();
try {
  await page.goto('https://madriverpools.com/', {waitUntil: 'networkidle', timeout: 60000});
} catch {
  console.log('chargement long : capture quand même');
}
// les animations du thème restent sur leur premier état
await page.evaluate(() => {
  for (const el of document.querySelectorAll('*')) {
    const s = getComputedStyle(el);
    if (s.animationName !== 'none') el.style.animationPlayState = 'paused';
  }
});
const poster = process.argv[2];
if (poster) {
  const where = await page.evaluate((b64) => {
    const v = document.querySelector('video');
    if (!v) return 'pas de vidéo';
    const box = v.closest('.et_pb_section_video_bg') || v.parentElement;
    const img = document.createElement('img');
    img.src = 'data:image/jpeg;base64,' + b64;
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
    box.replaceChildren(img);
    return box.className || box.tagName;
  }, readFileSync(poster).toString('base64'));
  console.log('vidéo remplacée par son image dans :', where);
}
await page.waitForTimeout(2500);
await page.screenshot({path: resolve(out, 'home.jpg'), type: 'jpeg', quality: 92});
console.log('✓ public/old/home.jpg');
await browser.close();
