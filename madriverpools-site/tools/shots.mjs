// Captures du site : page entière et écran d'accueil, ordinateur et téléphone.
//   node tools/shots.mjs <dossier de sortie> [desktop|mobile|both] [page]
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const [out = 'shots', which = 'both', file = 'dist/index.html'] = process.argv.slice(2);
mkdirSync(out, {recursive: true});
const url = 'file://' + resolve(file);
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const runs = {desktop: {viewport: {width: 1440, height: 900}, deviceScaleFactor: 1}, mobile: {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true}};
for (const name of which === 'both' ? ['desktop', 'mobile'] : [which]) {
  const ctx = await b.newContext(runs[name]);
  const p = await ctx.newPage();
  const logs = [];
  p.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && logs.push(m.text()));
  p.on('pageerror', (e) => logs.push('pageerror: ' + e.message));
  await p.goto(url, {waitUntil: 'load'});
  await p.waitForTimeout(3200);
  await p.screenshot({path: `${out}/${name}-hero.png`});
  // faire défiler toute la page pour déclencher les apparitions, puis revenir en haut
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) {
    await p.evaluate((y) => window.scrollTo(0, y), y);
    await p.waitForTimeout(140);
  }
  await p.waitForTimeout(1600);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(600);
  await p.screenshot({path: `${out}/${name}-full.png`, fullPage: true});
  console.log(name, 'hauteur', h, logs.length ? logs : 'aucune erreur');
  await ctx.close();
}
await b.close();
