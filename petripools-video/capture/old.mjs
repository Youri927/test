// Le site actuel (www.petripools.com), filmé une fois en 2× pour l'ouverture : l'accueil tel qu'il s'affiche au chargement.
// Usage : node capture/old.mjs  →  public/old/home.jpg (2880 × 1800)
import {mkdirSync} from 'node:fs';
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
  await page.goto('https://www.petripools.com/', {waitUntil: 'networkidle', timeout: 60000});
} catch {
  console.log('chargement long : capture quand même');
}
// le diaporama reste sur sa première photo
await page.evaluate(() => {
  for (const el of document.querySelectorAll('*')) {
    const s = getComputedStyle(el);
    if (s.animationName !== 'none') el.style.animationPlayState = 'paused';
  }
});
await page.waitForTimeout(2500);
await page.screenshot({path: resolve(out, 'home.jpg'), type: 'jpeg', quality: 92});
console.log('✓ public/old/home.jpg');
await browser.close();
