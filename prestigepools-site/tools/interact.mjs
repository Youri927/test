// Essais des interactions : lumières (jour / nuit, mémorisées), couleurs des projecteurs, filtres, visionneuse, menu, formulaire.
// Captures dans <dossier>. Le site est lu depuis dist/index.html (fichier unique).
//   node tools/interact.mjs shots
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'shots';
mkdirSync(out, {recursive: true});
const url = 'file://' + resolve('dist/index.html');
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const errs = [];
let fails = 0;
const ok = (cond, msg) => {
  if (!cond) fails++;
  console.log(cond ? '✓' : '✗', msg);
};

/* ——— ordinateur, en plein jour à Wilmington (horloge figée le 12 octobre 2026 à 11 h) ——— */
let ctx = await b.newContext({viewport: {width: 1440, height: 900}});
await ctx.addInitScript(() => {
  const T = Date.parse('2026-10-12T11:00:00-04:00');
  const D = Date;
  // Date figée, pour que le coucher du soleil calculé et l'état « ouvert » soient reproductibles
  globalThis.Date = class extends D {
    constructor(...a) { super(...(a.length ? a : [T + (performance.now() | 0)])); }
    static now() { return T + (performance.now() | 0); }
  };
});
let p = await ctx.newPage();
p.on('pageerror', (e) => errs.push(e.message));
await p.goto(url, {waitUntil: 'load'});
await p.waitForTimeout(1800);
ok(!(await p.evaluate(() => document.documentElement.classList.contains('night'))), 'de jour à 11 h : lumières éteintes');
const sun = await p.textContent('[data-sunset]');
ok(/^Sunset in Wilmington today: 6:\d\d pm\.$/.test(sun), `coucher du soleil affiché : « ${sun} »`);
ok((await p.textContent('[data-open]')) === 'Open now', 'lundi 11 h : « Open now »');
await p.screenshot({path: `${out}/i-hero-day.png`});

// allumer : le ciel passe par le crépuscule, la photo de nuit apparaît, le choix est gardé
await p.click('.lights--big');
const frames = [];
for (const t of [120, 450, 800, 1300]) {
  await p.waitForTimeout(t - (frames.length ? [120, 450, 800, 1300][frames.length - 1] : 0));
  frames.push(await p.evaluate(() => getComputedStyle(document.body).backgroundColor));
  await p.screenshot({path: `${out}/i-switch-${t}.png`, clip: {x: 0, y: 0, width: 1440, height: 900}});
}
console.log('  fond pendant l’allumage :', frames.join(' → '));
ok(await p.evaluate(() => document.documentElement.classList.contains('night')), 'lumières allumées');
ok((await p.$$eval('[data-lights]', (bs) => bs.map((x) => x.getAttribute('aria-pressed')))).every((v) => v === 'true'), 'les deux interrupteurs disent « on »');
ok((await p.getAttribute('.hero__night', 'aria-hidden')) === null && (await p.getAttribute('.hero__day', 'aria-hidden')) === 'true', 'seule la photo de nuit est décrite');
ok((await p.evaluate(() => localStorage.getItem('ppw-lights'))) === 'on', 'choix mémorisé');
await p.screenshot({path: `${out}/i-hero-night.png`});
await p.reload({waitUntil: 'load'});
await p.waitForTimeout(800);
ok(await p.evaluate(() => document.documentElement.classList.contains('night')), 'au rechargement, les lumières restent allumées');
// la galerie de nuit : les photos de nuit d'abord
const firstTags = await p.$$eval('[data-grid] li:not([hidden])', (ls) => ls.slice(0, 6).map((l) => l.dataset.tags));
ok(firstTags.every((t) => t.includes('night')), `de nuit, la galerie commence par les photos de nuit (${firstTags.length})`);
await p.click('.top .lights');
await p.waitForTimeout(1500);
ok(!(await p.evaluate(() => document.documentElement.classList.contains('night'))), 'éteint depuis l’en-tête');
ok((await p.evaluate(() => localStorage.getItem('ppw-lights'))) === 'off', 'choix « off » mémorisé');

// les couleurs des projecteurs
await p.locator('#after-dark').scrollIntoViewIfNeeded();
await p.waitForTimeout(1200);
for (const hue of ['blue', 'red', 'white']) {
  await p.check(`input[name="hue"][value="${hue}"]`, {force: true});
  await p.waitForTimeout(900);
  const on = await p.$$eval('[data-hue].is-on', (is) => is.map((i) => i.dataset.hue));
  ok(on.length === 1 && on[0] === hue, `projecteurs : ${hue}`);
  if (hue !== 'white') await p.screenshot({path: `${out}/i-hue-${hue}.png`, clip: await p.$eval('.dark__in', (s) => {const r = s.getBoundingClientRect(); return {x: 0, y: Math.max(0, r.top - 40), width: 1440, height: Math.min(900, r.height + 80)};})});
}

// filtres
await p.locator('#work').scrollIntoViewIfNeeded();
await p.waitForTimeout(400);
for (const f of ['water', 'night', 'spa', 'rect', 'free']) {
  await p.click(`[data-filter="${f}"]`);
  await p.waitForTimeout(700);
  const vis = await p.$$eval('[data-grid] li', (ls) => ls.filter((l) => !l.hidden).map((l) => l.dataset.tags));
  ok(vis.length > 0 && vis.every((t) => t.split(' ').includes(f)), `filtre ${f} : ${vis.length} photos (${await p.textContent('[data-count]')})`);
}
await p.click('[data-filter="water"]');
await p.waitForTimeout(800);
await p.screenshot({path: `${out}/i-filter.png`});
await p.click('[data-filter="all"]');
await p.waitForTimeout(600);
ok(!(await p.isHidden('[data-more]')), 'tout : bouton « Show all » visible');
await p.click('[data-more]');
await p.waitForTimeout(500);
ok((await p.$$eval('[data-grid] li', (ls) => ls.filter((l) => l.offsetParent).length)) === 34, 'tout : les 34 photos affichées');

// visionneuse
await p.click('[data-grid] li:not([hidden]) button');
await p.waitForTimeout(700);
ok(await p.$eval('[data-box]', (d) => d.open), 'visionneuse ouverte');
ok((await p.$eval('[data-box-img]', (i) => i.naturalWidth)) >= 1200, 'visionneuse : la photo entière (1280 px)');
await p.keyboard.press('ArrowRight');
await p.waitForTimeout(400);
ok((await p.textContent('[data-box-n]')).startsWith('2 of 34'), 'visionneuse : flèche droite');
await p.screenshot({path: `${out}/i-lightbox.png`});
await p.keyboard.press('Escape');
await p.waitForTimeout(400);
ok(!(await p.$eval('[data-box]', (d) => d.open)), 'visionneuse fermée avec Échap');

// formulaire : erreurs, puis courriel préparé vers le bon service
await p.locator('#plan').scrollIntoViewIfNeeded();
await p.click('[data-form] button[type="submit"]');
await p.waitForTimeout(300);
const errText = await p.textContent('#f-error');
ok(errText.includes('first name') && errText.includes('phone number'), `erreur : « ${errText} »`);
ok((await p.evaluate(() => document.activeElement.id)) === 'f-first', 'erreur : le curseur va au premier champ');
ok((await p.getAttribute('#f-first', 'aria-describedby')) === 'f-error', 'erreur : le champ renvoie au message');
await p.screenshot({path: `${out}/i-form-error.png`});
await p.fill('#f-first', 'Jamie');
await p.fill('#f-last', 'Example');
await p.fill('#f-email', 'jamie@example.com');
await p.fill('#f-phone', '(910) 555-0100');
await p.check('input[name="topic"][value="service"]', {force: true});
ok((await p.textContent('[data-note]')).includes('service.ppow@gmail.com'), 'service choisi : la note annonce service.ppow@gmail.com');
const mail = await p.evaluate(() => {
  let to = '';
  // le lien mailto est lu au passage, sans l'ouvrir
  document.addEventListener('click', (e) => {
    if (e.target.href && e.target.href.startsWith('mailto:')) {
      e.preventDefault();
      to = e.target.href;
    }
  }, {capture: true, once: true});
  document.querySelector('[data-form]').requestSubmit();
  return to;
});
ok(mail.startsWith('mailto:service.ppow@gmail.com?subject=Service%20request%20from%20Jamie%20Example'), `courriel : ${mail.slice(0, 80)}…`);
await ctx.close();

/* ——— après le coucher du soleil, sans choix : les lumières s'allument seules ——— */
ctx = await b.newContext({viewport: {width: 1440, height: 900}});
await ctx.addInitScript(() => {
  const T = Date.parse('2026-10-12T21:30:00-04:00');
  const D = Date;
  globalThis.Date = class extends D {
    constructor(...a) { super(...(a.length ? a : [T + (performance.now() | 0)])); }
    static now() { return T + (performance.now() | 0); }
  };
});
p = await ctx.newPage();
p.on('pageerror', (e) => errs.push(e.message));
await p.goto(url, {waitUntil: 'load'});
await p.waitForTimeout(800);
ok(await p.evaluate(() => document.documentElement.classList.contains('night')), '21 h 30 à Wilmington : lumières allumées toutes seules');
ok((await p.textContent('[data-sunset]')).startsWith('The sun set at'), `phrase du soir : « ${await p.textContent('[data-sunset]')} »`);
ok((await p.textContent('[data-open]')) === 'Closed now', '21 h 30 : « Closed now »');
await ctx.close();

/* ——— téléphone ——— */
ctx = await b.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2});
p = await ctx.newPage();
p.on('pageerror', (e) => errs.push(e.message));
await p.goto(url + '?lights=off', {waitUntil: 'load'});
await p.waitForTimeout(1500);
await p.click('.menu-btn');
await p.waitForTimeout(400);
ok(!(await p.isHidden('#menu')) && (await p.getAttribute('.menu-btn', 'aria-expanded')) === 'true', 'menu ouvert');
ok(await p.$eval('main', (m) => m.inert), 'menu : la page dessous ne prend plus le focus');
await p.screenshot({path: `${out}/i-menu.png`});
await p.keyboard.press('Escape');
await p.waitForTimeout(300);
ok(await p.isHidden('#menu'), 'menu fermé avec Échap');
const vis10 = await p.$$eval('[data-grid] li', (ls) => ls.filter((l) => l.offsetParent).length);
ok(vis10 === 10, `téléphone : 10 photos avant « Show all » (${vis10})`);
const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
ok(overflow <= 0, `téléphone : pas de défilement horizontal (${overflow} px)`);
await ctx.close();

await b.close();
console.log(errs.length ? `erreurs de page : ${errs.join(' | ')}` : 'aucune erreur de page');
console.log(fails ? `${fails} échec(s)` : 'tout est bon');
