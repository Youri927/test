// Captures fixes du nouveau site, en 2× (ordinateur 1440 × 900, téléphone 390 × 844), pour la vidéo de présentation.
// Le site tourne en temps réel : on descend par petits pas jusqu'à chaque position, puis on laisse les animations finir.
// Usage : node capture/stills.mjs   →  public/stills/*.jpg
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node-tools/node_modules/playwright');
const here = dirname(fileURLToPath(import.meta.url));
const SITE = 'file://' + resolve(here, '../../coastalcreations-site/dist/index.html');
const OUT = resolve(here, '../public/stills');
mkdirSync(OUT, {recursive: true});

const browser = await chromium.launch({args: ['--hide-scrollbars', '--force-color-profile=srgb']});
const errors = [];

async function goto(page, y, wait = 1500) {
  const from = await page.evaluate(() => scrollY);
  for (let k = 1; k <= 12; k++) {
    await page.evaluate((v) => window.scrollTo(0, v), from + ((y - from) * k) / 12);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(wait);
}
const top = (page, sel, off = 0) => page.evaluate(([s, o]) => Math.round(document.querySelector(s).getBoundingClientRect().top + scrollY - o), [sel, off]);
const shot = (page, name) => page.screenshot({path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 92});
const open = async (opts) => {
  const ctx = await browser.newContext({deviceScaleFactor: 2, locale: 'en-US', colorScheme: 'light', ...opts});
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(SITE, {waitUntil: 'load'});
  await page.waitForTimeout(3000);
  return {ctx, page};
};

{
  const {ctx, page} = await open({viewport: {width: 1440, height: 900}});
  await shot(page, 'd-hero');
  // la phrase allumée en entier et les chiffres comptés
  await goto(page, await top(page, '.intro__text', 160), 2200); await shot(page, 'd-intro');
  // la carte « Leak detection » posée sur les deux premières
  await goto(page, await top(page, '.card:nth-child(3)', 220)); await shot(page, 'd-cards');
  const b = await top(page, '.build', 0);
  await goto(page, b + 10); await shot(page, 'd-build-1');
  await goto(page, b + Math.round(900 * 0.7 * 3.4)); await shot(page, 'd-build-2');
  await goto(page, await top(page, '.reno__head', 80)); await shot(page, 'd-reno');
  await goto(page, await top(page, '.job', 80), 1800); await shot(page, 'd-holmes');
  await goto(page, await top(page, '.finish__head', 70), 1800);
  await page.click('button.pill[data-finish="3"]');
  await page.mouse.move(1380, 880);
  await page.evaluate(() => document.activeElement?.blur());
  await page.waitForTimeout(1400); await shot(page, 'd-finish');
  await goto(page, await top(page, '.prices', 96), 2200);
  await page.click('[data-spa="1"]');
  await page.click('[data-step="features"][data-by="1"]');
  await page.click('[data-step="features"][data-by="1"]');
  await page.click('[data-step="heads"][data-by="1"]');
  await page.mouse.move(1380, 880);
  await page.evaluate(() => document.activeElement?.blur());
  await page.waitForTimeout(1400); await shot(page, 'd-leaks');
  await goto(page, await top(page, '.contact__title', 40), 1800); await shot(page, 'd-contact');
  await ctx.close();
}
{
  const {ctx, page} = await open({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
  await shot(page, 'm-hero');
  await goto(page, await top(page, '.card:nth-child(3)', 110)); await shot(page, 'm-cards');
  await goto(page, await top(page, '.prices', 120), 2200); await shot(page, 'm-leaks');
  await goto(page, 0, 900);
  await page.tap('[data-menu]');
  await page.waitForTimeout(900); await shot(page, 'm-menu');
  await ctx.close();
}
console.log('erreurs', JSON.stringify(errors));
await browser.close();
