// Captures pour la relecture et les planches. Le site est lu sur le serveur local :
//   python3 -m http.server 8795 --bind 127.0.0.1 --directory dist-web   puis   node tools/shots.mjs <dossier> [intro|scene|sections|phone]
//  - intro : l'ouverture, à des instants donnés depuis le chargement ;
//  - scene : la scène de l'accueil à cinq moments du défilement (ordinateur) ;
//  - sections : chaque partie à la taille d'un écran d'ordinateur (1440 × 900), et les états (une apparition en cours, la
//    liste survolée et choisie, la visionneuse, les erreurs du formulaire, la demande écrite), plus la tablette ;
//  - phone : des écrans de téléphone (390 × 844, en 2×).
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'shots';
const only = process.argv[3];
mkdirSync(out, {recursive: true});
const URL_ = process.env.SITE || 'http://127.0.0.1:8795/';
const b = await chromium.launch();
const want = (k) => !only || only === k;
const DESK = {viewport: {width: 1440, height: 900}};
const TAB = {viewport: {width: 768, height: 1024}, deviceScaleFactor: 1, isMobile: true, hasTouch: true};
const PHONE = {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true};
const shot = (p, name) => p.screenshot({path: `${out}/${name}.png`});

// amène un élément à un décalage donné sous l'en-tête, puis laisse les photos, les apparitions et Lenis se poser
const go = async (p, sel, off = 0, wait = 1900) => {
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
// la scène : une progression donnée, de 0 (l'esquisse) à 1 (la pièce construite)
const stageAt = async (p, v, wait = 900) => {
  await p.evaluate((x) => {
    const t = document.querySelector('.hero__track');
    const pin = document.querySelector('.hero__pin');
    const top = t.getBoundingClientRect().top + scrollY;
    const span = t.offsetHeight - pin.offsetHeight;
    const pinTop = parseFloat(getComputedStyle(pin).top) || 0;
    window.scrollTo({top: Math.max(0, top - pinTop + x * span), behavior: 'instant'});
  }, v);
  await p.waitForTimeout(wait);
};
const eager = (p) => p.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager')));
const ready = async (p) => {
  await p.goto(URL_, {waitUntil: 'load'});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(2400);
};

/* ——— l'ouverture, à des instants donnés ——— */
if (want('intro')) {
  for (const [ctxOpt, tag, times] of [
    [DESK, 'd', [150, 450, 800, 1500]],
    [PHONE, 'm', [450, 1500]],
  ]) {
    for (const t of times) {
      const ctx = await b.newContext(ctxOpt);
      const p = await ctx.newPage();
      await p.goto(URL_, {waitUntil: 'load'});
      await p.waitForTimeout(t);
      await shot(p, `o-${tag}-${String(t).padStart(4, '0')}`);
      await ctx.close();
    }
  }
}

/* ——— la scène de l'accueil au défilement ——— */
if (want('scene')) {
  const ctx = await b.newContext(DESK);
  const p = await ctx.newPage();
  await ready(p);
  for (const [i, v] of [[0, 0.3], [1, 0.48], [2, 0.75], [3, 1]].values()) {
    await stageAt(p, v);
    await shot(p, `1440-scene-${i}`);
  }
  await ctx.close();
}

/* ——— les parties de la page, sur ordinateur et tablette ——— */
if (want('sections')) {
  const ctx = await b.newContext(DESK);
  const p = await ctx.newPage();
  await ready(p);
  await shot(p, '1440-hero');
  // une apparition en cours : la cuisine, juste quand ses photos commencent à s'ouvrir
  await eager(p);
  await p.waitForTimeout(1500);
  await p.evaluate(() => window.scrollTo({top: document.getElementById('drawn-title').getBoundingClientRect().top + scrollY - 100, behavior: 'instant'}));
  await p.waitForTimeout(330);
  await shot(p, '1440-reveal-0');
  await p.waitForTimeout(260);
  await shot(p, '1440-reveal-1');
  await p.waitForTimeout(1800);
  await shot(p, '1440-kitchen');
  await go(p, '#drawn', 0);
  await shot(p, '1440-drawn');
  await go(p, '.story--step', -20);
  await shot(p, '1440-step');
  await go(p, '.story--kitchen .story__list', 120, 900);
  await p.click('.story--kitchen .story__item--built .ph');
  await p.waitForTimeout(1300);
  await shot(p, '1440-viewer');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(600);
  await go(p, '#trades', 0);
  await shot(p, '1440-trades');
  await p.hover('.trade[data-trade="pools"]');
  await p.waitForTimeout(1100);
  await shot(p, '1440-trades-pools');
  await p.click('.trade[data-trade="kitchens"]');
  await p.mouse.move(1380, 860);
  await p.waitForTimeout(1100);
  await shot(p, '1440-trades-kitchens');
  await p.click('.trade[data-trade="kitchens"]');
  await go(p, '#work', 0);
  await shot(p, '1440-work');
  await go(p, '.project--e', -80);
  await shot(p, '1440-work-2');
  await go(p, '#office', 0);
  await shot(p, '1440-office');
  await go(p, '#quote', 0);
  await shot(p, '1440-quote');
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(400);
  await go(p, '.form', -40, 700);
  await shot(p, '1440-errors');
  await p.fill('#f-name', 'Pat');
  await p.fill('#f-phone', '561-555-0142');
  await p.check('input[name="what"][value="Bathroom"]');
  await p.check('input[name="what"][value="Pool"]');
  await p.fill('#f-details', 'A primary bath, and a new finish for the pool.');
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(700);
  await go(p, '.form__done', -560, 700);
  await shot(p, '1440-sent');
  await go(p, '.foot', -300, 900);
  await shot(p, '1440-foot');
  await ctx.close();
  const tc = await b.newContext(TAB);
  const t = await tc.newPage();
  await ready(t);
  await shot(t, '768-hero');
  await go(t, '#work', 0);
  await shot(t, '768-work');
  await tc.close();
}

/* ——— des écrans de téléphone ——— */
if (want('phone')) {
  const ctx = await b.newContext(PHONE);
  const p = await ctx.newPage();
  await ready(p);
  await shot(p, 'm-hero');
  await stageAt(p, 0.48);
  await shot(p, 'm-scene-3d');
  await stageAt(p, 1);
  await shot(p, 'm-scene-built');
  await p.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
  await p.waitForTimeout(600);
  await p.tap('.menu-btn');
  await p.waitForTimeout(500);
  await shot(p, 'm-menu');
  await p.tap('.menu-btn');
  await p.waitForTimeout(400);
  await eager(p);
  for (const [name, sel, off] of [
    ['m-drawn', '#drawn', 0],
    ['m-kitchen', '.story--kitchen .story__item--site', -40],
    ['m-work', '#work', 0],
    ['m-office', '#office', 0],
    ['m-quote', '#quote', 0],
    ['m-foot', '.foot', 0],
  ]) {
    await go(p, sel, off);
    await shot(p, name);
  }
  await go(p, '#trades', 0);
  await p.tap('.trade[data-trade="roofs"]');
  await p.waitForTimeout(1200);
  await shot(p, 'm-trades');
  await go(p, '.project--c .project__ph', -60, 1600);
  await p.tap('.project--c .project__ph');
  await p.waitForTimeout(1200);
  await shot(p, 'm-viewer');
  await ctx.close();
}
await b.close();
console.log('captures dans', out);
