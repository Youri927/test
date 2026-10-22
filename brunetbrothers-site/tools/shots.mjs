// Captures pour la relecture et les planches. Le site est lu sur le serveur local :
//   python3 -m http.server 8796 --bind 127.0.0.1 --directory dist-web   puis   node tools/shots.mjs <dossier> [intro|sections|es|phone]
//  - intro : l'ouverture arrêtée à des moments précis de la course de la paroi (l'horloge de la page est contrôlée), sur
//    ordinateur et au téléphone ;
//  - sections : chaque partie à la taille d'un écran d'ordinateur (1440 × 900), et les états (la légende de la photo
//    survolée, une apparition en cours, la visionneuse, les erreurs du formulaire, la demande écrite), plus la tablette ;
//  - es : la page en espagnol ;
//  - phone : des écrans de téléphone (390 × 844, en 2×).
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'shots';
const only = process.argv[3];
mkdirSync(out, {recursive: true});
const URL_ = process.env.SITE || 'http://127.0.0.1:8796/';
const b = await chromium.launch();
const want = (k) => !only || only === k;
const DESK = {viewport: {width: 1440, height: 900}};
const TAB = {viewport: {width: 768, height: 1024}, deviceScaleFactor: 1, isMobile: true, hasTouch: true};
const PHONE = {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true};
const shot = (p, name) => p.screenshot({path: `${out}/${name}.png`});

// amène un élément à un décalage donné sous l'en-tête, puis laisse les photos, les apparitions et Lenis se poser
const go = async (p, sel, off = 0, wait = 2100) => {
  await p.evaluate(
    ([s, o]) => {
      const top = document.querySelector('.top').offsetHeight;
      const e = document.querySelector(s);
      window.scrollTo({top: Math.max(0, e.getBoundingClientRect().top + scrollY - top + o), behavior: 'instant'});
    },
    [sel, off],
  );
  await p.waitForTimeout(350);
  // l'en-tête se range quand on descend : on ne laisse pas sa place vide en haut de la capture
  await p.evaluate(() => {
    const t = document.querySelector('.top');
    if (t.classList.contains('is-hidden')) window.scrollBy({top: t.offsetHeight, behavior: 'instant'});
  });
  await p.waitForTimeout(wait);
};
const ready = async (p, url = URL_) => {
  await p.goto(url, {waitUntil: 'load'});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(2600);
};
// fait défiler toute la page une fois, pour que chaque titre et chaque photo ait déjà joué son apparition
const settle = async (p) => {
  const [H, step] = await p.evaluate(() => [document.documentElement.scrollHeight, Math.round(innerHeight * 0.6)]);
  for (let y = 0; y < H; y += step) {
    await p.evaluate((yy) => window.scrollTo({top: yy, behavior: 'instant'}), y);
    await p.waitForTimeout(240);
  }
  await p.waitForTimeout(1800);
  await p.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
  await p.waitForTimeout(700);
};
const spanish = async (p) => {
  await p.click('.top .langs__btn[data-lang="es"]');
  await p.waitForTimeout(700);
};

// l'ouverture arrêtée à un moment donné de la course de la paroi (0 à 1) : l'horloge de la page est installée et
// arrêtée avant le chargement, puis avancée de la durée voulue une fois les photos décodées
const sweepAt = async (opt, at, name) => {
  const ctx = await b.newContext(opt);
  const p = await ctx.newPage();
  await p.clock.install({time: new Date('2026-10-22T15:00:00')});
  await p.clock.pauseAt(new Date('2026-10-22T15:00:01'));
  await p.goto(URL_, {waitUntil: 'load'});
  await p.evaluate(() => document.fonts.ready);
  let started = false;
  for (let i = 0; i < 60 && !started; i++) {
    started = await p.evaluate(() => document.documentElement.classList.contains('intro-run'));
    if (!started) await p.waitForTimeout(50);
  }
  if (!started) throw new Error('l’ouverture n’a pas commencé');
  await p.clock.runFor(140 + Math.round(at * 1500));
  await shot(p, name);
  await ctx.close();
};

/* ——— l'ouverture ——— */
if (want('intro')) {
  for (const at of [0.36, 0.5, 0.62]) await sweepAt(DESK, at, `o-d-${String(Math.round(at * 100)).padStart(3, '0')}`);
  for (const at of [0.5]) await sweepAt(PHONE, at, `o-m-${String(Math.round(at * 100)).padStart(3, '0')}`);
}

/* ——— les parties de la page, sur ordinateur et tablette ——— */
if (want('sections')) {
  const ctx = await b.newContext(DESK);
  const p = await ctx.newPage();
  await ready(p);
  await shot(p, '1440-hero');
  // la ligne sous la planche dit ce que montre la photo survolée
  await p.hover('.plate--hero .cell:nth-child(5) .ph');
  await p.waitForTimeout(500);
  await shot(p, '1440-hover');
  await p.mouse.move(700, 880);
  await go(p, '#work', 0);
  await shot(p, '1440-work');
  // une apparition en cours : les vasques, juste quand la paroi commence à glisser sur la première photo
  await p.evaluate(() => {
    const r = document.querySelector('.plate--vanities');
    window.scrollTo({top: r.getBoundingClientRect().top + scrollY - 300, behavior: 'instant'});
  });
  await p.waitForTimeout(420);
  await shot(p, '1440-reveal-0');
  await p.waitForTimeout(380);
  await shot(p, '1440-reveal-1');
  await p.waitForTimeout(1800);
  await settle(p);
  await go(p, '.plate--showers', -90);
  await shot(p, '1440-showers');
  await go(p, '.plate--vanities', -90);
  await shot(p, '1440-vanities');
  await go(p, '.plate--tubs', -90);
  await shot(p, '1440-tubs');
  await go(p, '.plate--kitchens', -90);
  await shot(p, '1440-kitchens');
  // les rangements, sous la fin des cuisines ; le jardin commence juste après le bas de l'écran
  await go(p, '.plate--rooms', -560);
  await shot(p, '1440-rooms');
  await p.click('.plate--kitchens .cell:nth-child(3) .ph');
  await p.waitForTimeout(1300);
  await shot(p, '1440-viewer');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(700);
  for (const [name, sel, off] of [
    ['1440-outside', '#outside', 0],
    ['1440-outside-2', '#outside', 420],
    ['1440-build', '#build', 0],
    ['1440-company', '#company', 0],
    ['1440-licenses', '.licenses', -120],
    ['1440-process', '#process', 0],
    ['1440-clients', '#clients', 0],
  ])
    await go(p, sel, off), await shot(p, name);
  await p.click('.quotes__btn');
  await p.waitForTimeout(700);
  await go(p, '#quotes-more', -32, 900);
  await shot(p, '1440-clients-more');
  await go(p, '#estimate', 0);
  await shot(p, '1440-estimate');
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(400);
  await go(p, '.form', -40, 700);
  await shot(p, '1440-errors');
  await p.fill('#f-name', 'Pat');
  await p.fill('#f-phone', '561-555-0142');
  await p.check('input[name="what"][value="Bathroom"]');
  await p.check('input[name="what"][value="Kitchen"]');
  await p.fill('#f-details', 'The guest bathroom and the kitchen.');
  await p.waitForTimeout(400);
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(700);
  await go(p, '.form__done', -520, 700);
  await shot(p, '1440-sent');
  await go(p, '.foot', -260, 900);
  await shot(p, '1440-foot');
  await ctx.close();
  const tc = await b.newContext(TAB);
  const t = await tc.newPage();
  await ready(t);
  await shot(t, '768-hero');
  await settle(t);
  await go(t, '.plate--showers', -90);
  await shot(t, '768-work');
  await tc.close();
}

/* ——— en espagnol ——— */
if (want('es')) {
  const ctx = await b.newContext(DESK);
  const p = await ctx.newPage();
  await ready(p);
  await spanish(p);
  await shot(p, '1440-es-hero');
  await settle(p);
  for (const [name, sel, off] of [
    ['1440-es-work', '#work', 0],
    ['1440-es-company', '#company', 80],
    ['1440-es-process', '#process', 0],
    ['1440-es-estimate', '#estimate', 0],
  ])
    await go(p, sel, off), await shot(p, name);
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(400);
  await go(p, '.form', -40, 700);
  await shot(p, '1440-es-errors');
  await go(p, '.plate--kitchens', -90, 900);
  await p.click('.plate--kitchens .cell:nth-child(1) .ph');
  await p.waitForTimeout(1300);
  await shot(p, '1440-es-viewer');
  await ctx.close();
}

/* ——— des écrans de téléphone ——— */
if (want('phone')) {
  const ctx = await b.newContext(PHONE);
  const p = await ctx.newPage();
  await ready(p);
  await shot(p, 'm-hero');
  await p.tap('.menu-btn');
  await p.waitForTimeout(500);
  await shot(p, 'm-menu');
  await p.tap('.menu-btn');
  await p.waitForTimeout(400);
  await settle(p);
  for (const [name, sel, off] of [
    ['m-plate', '.plate--hero', -16],
    ['m-work', '#work', 0],
    ['m-showers', '.plate--showers', -60],
    ['m-kitchens', '.plate--kitchens', -60],
    ['m-build', '#build', 0],
    ['m-company', '#company', 0],
    ['m-licenses', '.licenses', -40],
    ['m-process', '#process', 0],
    ['m-clients', '#clients', 0],
    ['m-estimate', '#estimate', 0],
    ['m-form', '.form', -20],
    ['m-foot', '.foot', 0],
  ])
    await go(p, sel, off), await shot(p, name);
  await go(p, '.plate--kitchens', -60, 900);
  await p.tap('.plate--kitchens .cell:nth-child(2) .ph');
  await p.waitForTimeout(1300);
  await shot(p, 'm-viewer');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(600);
  await p.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
  await p.waitForTimeout(700);
  await p.tap('.top .langs__btn[data-lang="es"]');
  await p.waitForTimeout(800);
  await shot(p, 'm-es-hero');
  await go(p, '#process', 0);
  await shot(p, 'm-es-process');
  await ctx.close();
}
await b.close();
console.log('captures dans', out);
