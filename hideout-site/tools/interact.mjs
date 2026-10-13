// Essais des interactions : l'ouverture (le cadre du logo qui s'ouvre), les liens de l'en-tête, la carte des soins
// (familles, lettres qui s'élargissent, photo encadrée, préoccupations), les résultats (filtres, « Show all »,
// visionneuse), Beauty Bank, la réservation, les cadres qui se tracent, le clavier, le menu et la barre du
// téléphone, le mouvement réduit, l'arrivée au milieu de la page, les débordements de 320 à 1920 px.
// Le site est lu depuis dist/index.html (fichier unique). Captures dans <dossier>.
//   node tools/interact.mjs shots
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'shots';
mkdirSync(out, {recursive: true});
const url = 'file://' + resolve('dist/index.html');
const b = await chromium.launch();
const errs = [];
let fails = 0;
const ok = (cond, msg) => {
  if (!cond) fails++;
  console.log(cond ? '✓' : '✗', msg);
};
const open = async (ctx, u = url) => {
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(u, {waitUntil: 'load'});
  return p;
};
const topOf = (p, sel) => p.$eval(sel, (e) => Math.round(e.getBoundingClientRect().top));
const pad = (p) => p.evaluate(() => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop));
const isIntro = (p) => p.evaluate(() => document.documentElement.classList.contains('intro'));
const running = (p) => p.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.target?.closest?.('.hero, [data-top], [data-intro-logo]')).length);
const shown = (p) => p.$$eval('.res__item', (it) => it.filter((i) => !i.hidden).length);
const nameW = (p, fam) => p.$eval(`[data-fam="${fam}"] .fam__name [aria-hidden]`, (e) => Math.round(e.getBoundingClientRect().width));

/* ——— ordinateur ——— */
let ctx = await b.newContext({viewport: {width: 1440, height: 900}});
let p = await open(ctx);

// l'ouverture : le logo au centre ; son nom s'efface, la photo s'ouvre dans le cadre, le cadre s'agrandit jusqu'à elle
await p.waitForTimeout(250);
ok((await isIntro(p)) && (await p.$('[data-intro-logo]')) !== null, "ouverture : le logo est posé au centre de la page");
// au milieu de l'agrandissement du cadre (son horloge à 1,35 s), quel que soit le moment où l'ouverture a démarré
await p.waitForFunction(
  () => {
    const a = document.getAnimations().find((x) => x.effect?.target?.matches?.('[data-hero-frame]') && x.effect.getKeyframes().some((k) => k.transform));
    return a && a.currentTime >= 1350;
  },
  null,
  {polling: 'raf'},
);
const mid = await p.evaluate(() => {
  const f = document.querySelector('[data-hero-frame]').getBoundingClientRect();
  const m = document.querySelector('[data-hero-media]').getBoundingClientRect();
  return {fw: Math.round(f.width), mw: Math.round(m.width), op: +getComputedStyle(document.querySelector('[data-hero-photo]')).opacity};
});
ok(mid.fw > 300 && mid.fw < mid.mw && mid.op > 0, `ouverture, en cours : le cadre s'ouvre (${mid.fw} px sur ${mid.mw}), la photo apparaît (opacité ${mid.op.toFixed(2)})`);
await p.screenshot({path: `${out}/i-hero-mid.png`});
await p.waitForTimeout(2200);
const end = await p.evaluate(() => ({
  frameStyle: document.querySelector('[data-hero-frame]').getAttribute('style'),
  stretch: getComputedStyle(document.querySelector('[data-hero-title]')).fontStretch,
  logo: !!document.querySelector('[data-intro-logo]'),
}));
ok(!(await isIntro(p)) && !end.logo && !end.frameStyle && end.stretch === '125%' && (await running(p)) === 0, `ouverture terminée : le cadre à sa place, le titre à sa largeur (${end.stretch}), plus rien ne bouge`);
await p.screenshot({path: `${out}/i-hero.png`});

// un lien de l'en-tête amène la section sous l'en-tête
await p.click('.top__nav a[href="#treatments"]');
await p.waitForTimeout(1600);
const tTop = await topOf(p, '#treatments');
ok(Math.abs(tTop - (await pad(p))) <= 2, `« Treatments » : la section arrive juste sous l'en-tête (${tTop} px)`);
ok((await p.evaluate(() => location.hash)) === '#treatments', "l'adresse suit la section (#treatments)");

// les familles : fermées au départ ; au survol, les lettres s'élargissent et la photo de la famille passe dans le cadre
ok(await p.$$eval('[data-fam-panel]', (ps) => ps.every((x) => x.hidden)), 'les cinq familles sont fermées au départ');
const w0 = await nameW(p, 'injectables');
await p.hover('[data-fam="injectables"] .fam__btn');
await p.waitForTimeout(1100);
const w1 = await nameW(p, 'injectables');
const onImg = await p.$eval('[data-view] img.is-on', (i) => i.dataset.for);
ok(w1 > w0 * 1.15 && onImg === 'injectables', `survol de « Injectables » : le nom s'élargit (${w0} puis ${w1} px), sa photo passe dans le cadre`);
await p.screenshot({path: `${out}/i-hover.png`});
// une famille s'ouvre en douceur, se referme au clavier
const fb = '[data-fam="skin"] .fam__btn';
await p.click(fb);
await p.waitForTimeout(140);
const hMid = await p.$eval('#fam-skin', (e) => e.getBoundingClientRect().height);
await p.waitForTimeout(650);
const hEnd = await p.$eval('#fam-skin', (e) => ({hidden: e.hidden, h: e.getBoundingClientRect().height, n: e.querySelectorAll('.tx').length}));
ok((await p.getAttribute(fb, 'aria-expanded')) === 'true' && !hEnd.hidden && hMid > 0 && hMid < hEnd.h && hEnd.n === 20, `« Skin and lasers » s'ouvre en douceur (${Math.round(hMid)} puis ${Math.round(hEnd.h)} px), ses 20 soins`);
ok((await p.$eval('[data-view] img.is-on', (i) => i.dataset.for)) === 'skin', 'la photo de « Skin and lasers » est dans le cadre');
await p.screenshot({path: `${out}/i-family.png`});
await p.focus(fb);
await p.keyboard.press('Enter');
await p.waitForTimeout(600);
ok((await p.getAttribute(fb, 'aria-expanded')) === 'false' && (await p.$eval('#fam-skin', (e) => e.hidden)), 'Entrée la referme (le bouton garde le focus)');

// les préoccupations : leurs listes, les soins concernés soulignés, un clic ouvre la famille
await p.click('.chip[data-c="acne"]');
await p.waitForTimeout(300);
const ac = await p.evaluate(() => ({
  lead: document.querySelector('.concern__lead')?.textContent,
  fams: [...document.querySelectorAll('.concern__go')].map((x) => x.textContent),
  match: document.querySelectorAll('.tx.is-match').length,
  dim: document.querySelector('.svc').classList.contains('has-concern'),
}));
ok(ac.match === 10 && ac.dim && ac.fams.join() === 'Facials and body,Skin and lasers' && /10 treatments/.test(ac.lead), `« Acne » : ${ac.lead} (${ac.fams.join(', ')})`);
await p.screenshot({path: `${out}/i-concern.png`});
await p.click('.concern__go >> nth=1');
await p.waitForTimeout(1500);
ok((await p.getAttribute(fb, 'aria-expanded')) === 'true' && (await p.evaluate(() => document.activeElement.matches('[data-fam="skin"] .fam__btn'))), 'le lien de la famille l’ouvre et y amène le focus');
await p.click('.chip[data-c="acne"]');
await p.waitForTimeout(200);
ok((await p.$$eval('.tx.is-match', (x) => x.length)) === 0 && (await p.$eval('[data-concern-out]', (e) => e.children.length)) === 0, 'un second clic sur « Acne » efface la sélection');
await p.click(fb);
await p.waitForTimeout(500);

// les résultats : douze, un filtre, « Show all », la visionneuse
await p.locator('#results').scrollIntoViewIfNeeded();
await p.waitForTimeout(400);
ok((await shown(p)) === 12 && (await p.isVisible('[data-res-more]')) && (await p.textContent('[data-res-more]')) === 'Show all 38', `résultats : douze, puis « Show all 38 » (${await shown(p)})`);
await p.click('.chip[data-k="lash"]');
await p.waitForTimeout(400);
ok((await shown(p)) === 5 && (await p.isHidden('.res__foot')) && (await p.getAttribute('.chip[data-k="lash"]', 'aria-pressed')) === 'true', 'filtre « Lashes » : cinq résultats, pas de « Show all »');
ok((await p.textContent('[data-res-status]')) === '5 results: lashes.', `annonce : « ${await p.textContent('[data-res-status]')} »`);
await p.click('.chip[data-k="all"]');
await p.waitForTimeout(300);
await p.click('[data-res-more]');
await p.waitForTimeout(500);
ok((await shown(p)) === 38 && (await p.isHidden('.res__foot')), 'Show all : les 38 résultats');
ok(await p.evaluate(() => document.activeElement === document.querySelectorAll('.res__item')[12].querySelector('.res__open')), 'le focus passe au treizième, le premier des nouveaux');
await p.click('.chip[data-k="pmu"]');
await p.waitForTimeout(400);
await p.click('.res__item:not([hidden]) .res__open >> nth=1');
await p.waitForTimeout(400);
const v1 = await p.evaluate(() => ({open: document.querySelector('[data-viewer]').open, cap: document.querySelector('[data-viewer-cap]').textContent, count: document.querySelector('[data-viewer-count]').textContent, nw: document.querySelector('[data-viewer-img]').style.getPropertyValue('--nw')}));
ok(v1.open && v1.count === '2 of 9' && /Jessica Mostacero/.test(v1.cap), `visionneuse : « ${v1.cap} », ${v1.count}, jamais plus grande que ${v1.nw}`);
await p.screenshot({path: `${out}/i-viewer.png`});
await p.keyboard.press('ArrowRight');
await p.waitForTimeout(150);
ok((await p.textContent('[data-viewer-count]')) === '3 of 9', 'flèche droite : le suivant (3 of 9)');
await p.keyboard.press('Escape');
await p.waitForTimeout(300);
ok(!(await p.$eval('[data-viewer]', (d) => d.open)) && (await p.evaluate(() => !!document.activeElement.closest('.res__item'))), 'Échap ferme la visionneuse, le focus revient sur la photo');

// Beauty Bank : douze mois, 1 188 $
await p.locator('[data-bank-range]').scrollIntoViewIfNeeded();
await p.$eval('[data-bank-range]', (r) => {
  r.value = 12;
  r.dispatchEvent(new Event('input', {bubbles: true}));
});
const bank = await p.evaluate(() => ({t: document.querySelector('[data-bank-total]').textContent, m: document.querySelector('[data-bank-months]').textContent, on: document.querySelectorAll('[data-bank-cells] .is-on').length, vt: document.querySelector('[data-bank-range]').getAttribute('aria-valuetext')}));
ok(bank.t === '$1,188' && bank.on === 12 && bank.vt === '12 months, $1,188 to spend', `Beauty Bank, 12 mois : ${bank.t}, ${bank.on} mois remplis (« ${bank.vt} »)`);
await p.focus('[data-bank-range]');
await p.keyboard.press('ArrowLeft');
ok((await p.textContent('[data-bank-total]')) === '$1,089', 'au clavier : un mois de moins, $1,089');

// les cadres qui se tracent
await p.locator('.team__group').scrollIntoViewIfNeeded();
await p.waitForTimeout(500);
ok(await p.$eval('[data-draw]', (e) => e.classList.contains('is-drawn')), "équipe : le cadre se trace autour de la photo de groupe à son arrivée");
await p.locator('.map').scrollIntoViewIfNeeded();
await p.waitForTimeout(500);
ok(await p.$eval('.map', (e) => e.classList.contains('is-drawn')), "carte : le cadre se pose sur l'adresse");
ok((await p.$eval('.map__wide', (e) => getComputedStyle(e).display)) === 'block', 'ordinateur : la carte large');

// la réservation : hors ligne (fichier local), le bouton ouvre leur page Boulevard dans un onglet
const [tab] = await Promise.all([ctx.waitForEvent('page'), p.click('.visit__cta [data-book]')]);
ok(tab.url().startsWith('https://www.joinblvd.com/b/hideout-boutique/widget') || (await tab.evaluate(() => location.href)).includes('joinblvd'), `« Book now » ouvre leur réservation Boulevard (${tab.url().slice(0, 60)})`);
await tab.close();
ok(await p.$eval('[data-dock]', (d) => getComputedStyle(d).display === 'none'), 'ordinateur : pas de barre du téléphone');
await ctx.close();

/* ——— une touche achève l'ouverture ——— */
ctx = await b.newContext({viewport: {width: 1440, height: 900}});
p = await open(ctx);
await p.waitForTimeout(700);
await p.keyboard.press('Shift');
await p.waitForTimeout(250);
ok(!(await isIntro(p)) && (await running(p)) === 0, "une touche pendant l'ouverture l'achève aussitôt");
await ctx.close();

/* ——— au clavier : le lien d'évitement mène au contenu ——— */
ctx = await b.newContext({viewport: {width: 1440, height: 900}});
p = await open(ctx);
await p.waitForTimeout(3600);
await p.keyboard.press('Tab');
ok((await p.evaluate(() => document.activeElement.className)) === 'skip', 'Tab : le lien « Skip to content » d’abord');
await p.keyboard.press('Enter');
await p.waitForTimeout(1300);
await p.keyboard.press('Tab');
const afterSkip = await p.evaluate(() => ({inMain: !!document.activeElement.closest('main'), text: document.activeElement.textContent.trim()}));
ok(afterSkip.inMain && afterSkip.text === 'Book now', `après l'évitement, Tab va dans le contenu (« ${afterSkip.text} »)`);
await p.focus('.top__nav a[href="#results"]');
await p.keyboard.press('Enter');
await p.waitForTimeout(1500);
await p.keyboard.press('Tab');
ok(await p.evaluate(() => !!document.activeElement.closest('#results')), `après « Results » au clavier, Tab continue dans la section (« ${await p.evaluate(() => document.activeElement.textContent.trim().slice(0, 30))} »)`);
await ctx.close();

/* ——— mouvement réduit : pas d'ouverture, pas de défilement doux, tout est en place ——— */
ctx = await b.newContext({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
p = await open(ctx);
await p.waitForTimeout(300);
const rm = await p.evaluate(() => ({intro: document.documentElement.classList.contains('intro'), lenis: document.documentElement.classList.contains('lenis'), drawn: document.querySelector('[data-draw]').classList.contains('is-drawn')}));
ok(!rm.intro && !rm.lenis && rm.drawn, `mouvement réduit : pas d'ouverture ni de défilement doux, les cadres déjà tracés (${JSON.stringify(rm)})`);
await p.click('[data-fam="lashes"] .fam__btn');
ok(!(await p.$eval('#fam-lashes', (e) => e.hidden)), 'mouvement réduit : une famille s’ouvre aussitôt');
await ctx.close();

/* ——— arrivée au milieu de la page (lien vers #visit) : pas d'ouverture ——— */
ctx = await b.newContext({viewport: {width: 1440, height: 900}});
p = await open(ctx, url + '#visit');
await p.waitForTimeout(300);
ok(!(await isIntro(p)) && (await running(p)) === 0, 'arrivée sur #visit : pas d’ouverture');
await ctx.close();

/* ——— téléphone ——— */
ctx = await b.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2});
p = await open(ctx);
await p.waitForTimeout(3600);
ok(!(await p.$eval('[data-dock]', (d) => d.classList.contains('is-on'))), 'téléphone, en haut : pas de barre (les boutons sont à l’écran)');
ok((await p.$eval('.map__tall', (e) => getComputedStyle(e).display)) === 'block' && (await p.$eval('.map__wide', (e) => getComputedStyle(e).display)) === 'none', 'téléphone : la carte en hauteur');
await p.tap('[data-menu-open]');
await p.waitForTimeout(300);
ok(!(await p.isHidden('#sheet')) && (await p.getAttribute('[data-menu-open]', 'aria-expanded')) === 'true', 'menu ouvert');
ok(await p.evaluate(() => document.activeElement.matches('[data-menu-close]')), 'menu : le focus va sur « Close »');
ok(await p.$eval('main', (m) => m.inert), 'menu : la page dessous ne prend plus le focus');
const trap = [];
for (let i = 0; i < 10; i++) {
  await p.keyboard.press('Tab');
  trap.push(await p.evaluate(() => !!document.activeElement.closest('#sheet')));
}
ok(trap.every(Boolean), 'menu : la tabulation reste dans le menu');
await p.screenshot({path: `${out}/i-menu.png`});
await p.keyboard.press('Escape');
await p.waitForTimeout(200);
ok((await p.isHidden('#sheet')) && (await p.evaluate(() => document.activeElement.matches('[data-menu-open]'))), 'Échap ferme le menu et rend le focus au bouton');
ok(!(await p.$eval('main', (m) => m.inert)), 'la page redevient utilisable');
await p.tap('[data-menu-open]');
await p.waitForTimeout(250);
await p.tap('.sheet__nav a[href="#treatments"]');
await p.waitForTimeout(1600);
const svcTop = await topOf(p, '#treatments');
ok((await p.isHidden('#sheet')) && Math.abs(svcTop - (await pad(p))) <= 2, `un lien du menu le ferme et amène « Treatments » sous l’en-tête (${svcTop} px)`);
ok(await p.$eval('[data-dock]', (d) => d.classList.contains('is-on') && d.getAttribute('aria-hidden') === 'false'), 'au milieu de la page : la barre du téléphone est là');
await p.tap('[data-fam="pmu"] .fam__btn');
await p.waitForTimeout(800);
const shot = await p.$eval('#fam-pmu .fam__shot', (f) => ({d: getComputedStyle(f).display, cap: f.querySelector('figcaption')?.textContent, frame: !!f.querySelector('.frame')}));
ok(shot.d === 'block' && shot.frame && shot.cap === 'Permanent makeup at Hideout.', `téléphone : la famille ouverte montre sa photo dans le cadre (« ${shot.cap} »)`);
await p.screenshot({path: `${out}/i-phone-family.png`});
await p.screenshot({path: `${out}/i-dock.png`});
await p.locator('#visit').scrollIntoViewIfNeeded();
await p.waitForTimeout(700);
ok(!(await p.$eval('[data-dock]', (d) => d.classList.contains('is-on'))), 'sur la visite : la barre se retire');
ok(await p.$$eval('[data-dock] a', (as) => as.every((a) => a.tabIndex === -1)), 'barre retirée : ses liens sortent de la tabulation');
await ctx.close();

/* ——— débordements, de 320 à 1920 px ——— */
const widths = [320, 360, 375, 390, 414, 430, 600, 700, 768, 820, 960, 1024, 1100, 1180, 1280, 1366, 1440, 1600, 1920];
const over = [];
for (const w of widths) {
  ctx = await b.newContext({viewport: {width: w, height: 900}, isMobile: w < 960, hasTouch: w < 960});
  p = await open(ctx);
  await p.keyboard.press('Shift');
  // toutes les familles ouvertes, pour vérifier leur contenu aussi
  await p.evaluate(() => document.querySelectorAll('[data-fam-panel]').forEach((x) => (x.hidden = false)));
  await p.waitForTimeout(250);
  const o = await p.evaluate(() => {
    const doc = document.documentElement.scrollWidth - innerWidth;
    const cut = [...document.querySelectorAll('h1, h2, h3, h4, p, a.btn, button, dt, dd, li, label, figcaption, b, address')]
      .filter((e) => e.offsetParent && !e.closest('[aria-hidden="true"]') && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX === 'visible' && e.clientWidth > 0)
      .map((e) => `${e.tagName.toLowerCase()}.${e.className || ''} « ${e.textContent.trim().slice(0, 30)} » ${e.scrollWidth}>${e.clientWidth}`);
    // le titre de l'accueil tient dans la page
    const h = document.querySelector('.hero__title').getBoundingClientRect();
    const wrap = document.querySelector('.hero .wrap');
    const inner = wrap.getBoundingClientRect().right - parseFloat(getComputedStyle(wrap).paddingRight);
    const title = h.right > inner + 1 ? [`titre de l'accueil : ${Math.round(h.right)} > ${Math.round(inner)}`] : [];
    // une ligne à l'ordinateur et à la tablette, deux au téléphone
    const lines = Math.round(h.height / parseFloat(getComputedStyle(document.querySelector('.hero__title')).lineHeight));
    if (lines !== (innerWidth > 700 ? 1 : 2)) title.push(`titre de l'accueil sur ${lines} ligne(s)`);
    return {doc, cut: cut.slice(0, 4).concat(title)};
  });
  if (o.doc > 0 || o.cut.length) over.push(`${w}px : page ${o.doc} px ${o.cut.join(' ; ')}`);
  await ctx.close();
}
ok(!over.length, over.length ? `débordements :\n   ${over.join('\n   ')}` : `aucun débordement sur ${widths.length} largeurs, de 320 à 1920 px (familles ouvertes)`);

await b.close();
console.log(errs.length ? `erreurs de page : ${errs.join(' | ')}` : 'aucune erreur de page');
console.log(fails ? `${fails} échec(s)` : 'tout est bon');
process.exit(fails ? 1 : 0);
