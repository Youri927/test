// Essais des interactions : menu, formes, onglets de rénovation, filtres, visionneuse, formulaire. Captures dans <dossier>.
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'shots';
mkdirSync(out, {recursive: true});
const url = 'file://' + resolve('dist/index.html');
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const errs = [];
const ok = (cond, msg) => console.log(cond ? '✓' : '✗', msg);

/* ordinateur */
let ctx = await b.newContext({viewport: {width: 1440, height: 900}});
let p = await ctx.newPage();
p.on('pageerror', (e) => errs.push(e.message));
await p.goto(url, {waitUntil: 'load'});
await p.waitForTimeout(2600);
// formes
await p.locator('#shapes').scrollIntoViewIfNeeded();
await p.waitForTimeout(1600);
await p.click('[data-shape="18x75"]');
await p.waitForTimeout(800);
ok((await p.textContent('[data-shape-name]')) === 'Rectangle' && (await p.textContent('[data-shape-size]')) === '18 × 75 ft', 'forme : légende mise à jour');
ok(await p.$eval('[data-shape-photo="18x75"]', (i) => i.classList.contains('is-on')), 'forme : bonne photo affichée');
await p.screenshot({path: `${out}/i-shapes.png`, clip: await p.$eval('#shapes', (s) => {const r = s.getBoundingClientRect(); return {x: 0, y: Math.max(0, r.top), width: 1440, height: Math.min(900, r.height)};})});
// rénovation
await p.locator('#renovation').scrollIntoViewIfNeeded();
await p.waitForTimeout(600);
await p.click('#tab-concrete');
await p.waitForTimeout(400);
ok(!(await p.$eval('#panel-concrete', (e) => e.hidden)) && (await p.$eval('#panel-liner', (e) => e.hidden)), 'onglets : le bon panneau');
await p.focus('#tab-concrete');
await p.keyboard.press('ArrowRight');
ok((await p.evaluate(() => document.activeElement.id)) === 'tab-look' && !(await p.$eval('#panel-look', (e) => e.hidden)), 'onglets : flèche droite');
await p.click('#tab-concrete');
await p.click('#panel-concrete .ba__pick button:nth-child(2)');
await p.waitForTimeout(1500);
ok(!(await p.$eval('#panel-concrete [data-pair]:nth-of-type(2)', (e) => e.hidden)), 'avant/après : deuxième projet');
await p.screenshot({path: `${out}/i-reno.png`});
// filtres
await p.locator('#work').scrollIntoViewIfNeeded();
await p.click('[data-filter="fiberglass"]');
await p.waitForTimeout(900);
const vis = await p.$$eval('[data-grid] .tile', (ts) => ts.filter((t) => !t.hidden).map((t) => t.dataset.cat));
ok(vis.length > 0 && vis.every((c) => c.includes('fiberglass')), `filtres : ${vis.length} photos en fibre de verre`);
await p.screenshot({path: `${out}/i-filter.png`});
// visionneuse
await p.click('[data-grid] .tile:not([hidden]) button');
await p.waitForTimeout(700);
ok(await p.$eval('[data-lightbox]', (d) => d.open), 'visionneuse ouverte');
await p.keyboard.press('ArrowRight');
await p.waitForTimeout(500);
ok((await p.textContent('[data-lightbox-count]')).startsWith('2 of'), 'visionneuse : flèche droite');
await p.screenshot({path: `${out}/i-lightbox.png`});
await p.keyboard.press('Escape');
await p.waitForTimeout(400);
ok(!(await p.$eval('[data-lightbox]', (d) => d.open)), 'visionneuse fermée avec Échap');
// formulaire : erreurs puis courriel préparé
await p.locator('#visit').scrollIntoViewIfNeeded();
await p.click('.form button[type=submit]');
await p.waitForTimeout(300);
ok(!(await p.$eval('[data-error]', (e) => e.hidden)), 'formulaire : message ' + JSON.stringify(await p.textContent('[data-error]')));
ok((await p.evaluate(() => document.activeElement.id)) === 'f-first', 'formulaire : le curseur va au premier champ manquant');
await p.screenshot({path: `${out}/i-form-error.png`});
await p.fill('#f-first', 'Jamie');
await p.fill('#f-last', 'Rivera');
await p.fill('#f-email', 'jamie@example.com');
await p.fill('#f-phone', '407 555 0100');
await p.check('input[value="Spa"]');
await p.fill('#f-msg', 'We would like a spa next to our pool.');
await p.click('.form button[type=submit]');
await p.waitForTimeout(400);
ok(await p.$eval('[data-error]', (e) => e.hidden), 'formulaire rempli : plus de message d\'erreur, le courriel est préparé');
await ctx.close();

/* téléphone : menu */
ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true});
p = await ctx.newPage();
p.on('pageerror', (e) => errs.push(e.message));
await p.goto(url, {waitUntil: 'load'});
await p.waitForTimeout(2400);
await p.click('[data-menu]');
await p.waitForTimeout(600);
ok((await p.getAttribute('[data-menu]', 'aria-expanded')) === 'true', 'menu ouvert');
await p.screenshot({path: `${out}/i-menu.png`});
await p.click('#nav a[href="#renovation"]');
await p.waitForTimeout(2200);
ok((await p.getAttribute('[data-menu]', 'aria-expanded')) === 'false', 'menu refermé après un lien');
const top = await p.$eval('#renovation', (s) => Math.round(s.getBoundingClientRect().top));
ok(top >= 0 && top < 120, `ancre : la section arrive en haut (${top} px)`);
await p.evaluate(() => window.scrollTo(0, 3000));
await p.waitForTimeout(900);
ok(await p.$eval('[data-dock]', (d) => d.classList.contains('is-on')), 'barre d\'appel visible plus bas');
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(900);
ok(!(await p.$eval('[data-dock]', (d) => d.classList.contains('is-on'))), 'barre d\'appel cachée en haut');
await ctx.close();
await b.close();
console.log(errs.length ? errs : 'aucune erreur de page');
