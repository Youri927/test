// Captures pour la relecture et les planches. Le site est lu sur le serveur local :
//   python3 -m http.server 8771 --bind 127.0.0.1 --directory dist-web   puis   node tools/shots.mjs <dossier> [intro|sections|phone|full]
//  - intro : l'ouverture image par image (ordinateur et téléphone), l'horloge des animations arrêtée et calée ;
//  - sections : chaque partie à la taille d'un écran d'ordinateur (1440 × 900), et quelques états (famille ouverte,
//    préoccupation choisie, filtre, visionneuse) ;
//  - phone : des écrans de téléphone (390 × 844, en 2×) ;
//  - full : la page entière, à 1440 et à 390 de large.
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'shots';
const only = process.argv[3];
mkdirSync(out, {recursive: true});
const URL_ = process.env.SITE || 'http://127.0.0.1:8771/';
const b = await chromium.launch();
const want = (k) => !only || only === k;

// amène un élément à un décalage donné sous le haut de l'écran, puis laisse les animations se terminer
const go = async (p, sel, off, wait = 900) => {
  await p.evaluate(
    ([s, o]) => {
      const e = document.querySelector(s);
      window.scrollTo({top: s === 'body' ? 0 : e.getBoundingClientRect().top + scrollY + o, behavior: 'instant'});
    },
    [sel, off],
  );
  await p.waitForTimeout(wait);
};
// les photos chargées à l'approche : on parcourt la page une fois, puis on remonte
const preload = async (p) => {
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 600) {
    await p.evaluate((t) => window.scrollTo({top: t, behavior: 'instant'}), y);
    await p.waitForTimeout(60);
  }
  await p.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
  await p.waitForTimeout(300);
};
// l'ouverture terminée : une touche l'achève
const skip = async (p) => {
  await p.waitForTimeout(400);
  await p.keyboard.press('Shift');
  await p.waitForTimeout(500);
};

/* ——— l'ouverture, image par image ——— */
if (want('intro')) {
  for (const [w, h, dpr, tag] of [
    [1440, 900, 1, 'd'],
    [390, 844, 2, 'm'],
  ]) {
    const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: dpr, isMobile: w < 700, hasTouch: w < 700});
    const p = await ctx.newPage();
    await p.goto(URL_, {waitUntil: 'load'});
    await p.evaluate(() => document.fonts.ready);
    // l'ouverture démarre après la police : on attend qu'elle ait posé ses animations
    await p.waitForFunction(() => document.getAnimations().length > 5);
    for (const ms of [0, 250, 500, 700, 800, 900, 1000, 1250, 1500, 1750, 2000, 2400]) {
      await p.evaluate((t) => document.getAnimations().forEach((a) => (a.pause(), (a.currentTime = t))), ms);
      await p.waitForTimeout(80);
      await p.screenshot({path: `${out}/o-${tag}-${String(ms).padStart(4, '0')}.png`});
    }
    await ctx.close();
  }
}

/* ——— chaque partie, sur ordinateur ——— */
if (want('sections')) {
  for (const W of [1440, 1180]) {
    const p = await b.newPage({viewport: {width: W, height: 900}});
    await p.goto(URL_, {waitUntil: 'load'});
    await skip(p);
    await p.screenshot({path: `${out}/${W}-hero.png`});
    await go(p, '#treatments', -40);
    await p.screenshot({path: `${out}/${W}-svc.png`});
    await p.hover('[data-fam="injectables"] .fam__btn');
    await p.waitForTimeout(900);
    await p.screenshot({path: `${out}/${W}-svc-hover.png`});
    await p.click('[data-fam="skin"] .fam__btn');
    await p.waitForTimeout(900);
    await go(p, '[data-fam="skin"]', -120, 900);
    await p.screenshot({path: `${out}/${W}-svc-open.png`});
    await p.click('[data-fam="skin"] .fam__btn');
    await p.waitForTimeout(700);
    await go(p, '.concern', -120, 300);
    await p.click('[data-c="acne"].chip');
    await p.waitForTimeout(600);
    await p.screenshot({path: `${out}/${W}-concern.png`});
    await p.click('[data-c="acne"].chip');
    await go(p, '#results', -40);
    await p.screenshot({path: `${out}/${W}-res.png`});
    await go(p, '.res__grid', -120);
    await p.screenshot({path: `${out}/${W}-res-2.png`});
    await p.click('[data-k="pmu"].chip');
    await p.waitForTimeout(900);
    await p.screenshot({path: `${out}/${W}-res-pmu.png`});
    await p.click('.res__item:not([hidden]) .res__open');
    await p.waitForTimeout(600);
    await p.screenshot({path: `${out}/${W}-viewer.png`});
    await p.keyboard.press('Escape');
    await p.waitForTimeout(300);
    for (const [name, sel, off] of [
      ['team', '#team', -40],
      ['team-2', '.leads', -100],
      ['team-3', '.crew', -100],
      ['team-4', '.team__end', -300],
      ['mem', '#memberships', -40],
      ['mem-2', '.plans', -300],
      ['visit', '#visit', -40],
      ['visit-2', '.visit__grid', -200],
      ['foot', '.foot', -200],
    ]) {
      await go(p, sel, off, 1300);
      await p.screenshot({path: `${out}/${W}-${name}.png`});
    }
    await p.close();
  }
}

/* ——— téléphone ——— */
if (want('phone')) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true});
  const p = await ctx.newPage();
  await p.goto(URL_, {waitUntil: 'load'});
  await skip(p);
  await p.screenshot({path: `${out}/m-hero.png`});
  const PH = [
    ['svc', '#treatments', -70],
    ['svc-2', '.svc__list', -90],
    ['res', '#results', -70],
    ['res-2', '.res__grid', -90],
    ['team', '#team', -70],
    ['team-2', '.leads', -90],
    ['team-3', '.crew', -90],
    ['mem', '#memberships', -70],
    ['mem-2', '.bank__meter', -90],
    ['mem-3', '.plans', -90],
    ['visit', '#visit', -70],
    ['visit-2', '.visit__grid', -90],
    ['foot', '.foot', -200],
  ];
  for (const [name, sel, off] of PH) {
    await go(p, sel, off, 1100);
    await p.screenshot({path: `${out}/m-${name}.png`});
  }
  await go(p, '[data-fam="facials"]', -90, 300);
  await p.tap('[data-fam="facials"] .fam__btn');
  await p.waitForTimeout(900);
  await p.screenshot({path: `${out}/m-svc-open.png`});
  await p.evaluate(() => scrollTo({top: 0, behavior: 'instant'}));
  await p.waitForTimeout(400);
  await p.tap('[data-menu-open]');
  await p.waitForTimeout(300);
  await p.screenshot({path: `${out}/m-menu.png`});
  await ctx.close();
}

/* ——— la page entière ——— */
if (want('full')) {
  for (const [w, dpr] of [
    [1440, 1],
    [390, 1],
  ]) {
    const p = await b.newPage({viewport: {width: w, height: 900}, deviceScaleFactor: dpr});
    await p.goto(URL_, {waitUntil: 'load'});
    await skip(p);
    await preload(p);
    // les cadres qui se tracent au défilement : déjà tracés pour la vue d'ensemble
    await p.evaluate(() => document.querySelectorAll('[data-draw], [data-map]').forEach((e) => e.classList.add('is-drawn')));
    // la barre fixe du téléphone apparaîtrait au milieu d'une capture de toute la page
    await p.addStyleTag({content: '[data-dock]{display:none!important}'});
    await p.waitForTimeout(1500);
    await p.screenshot({path: `${out}/full-${w}.png`, fullPage: true});
    await p.close();
  }
}

await b.close();
