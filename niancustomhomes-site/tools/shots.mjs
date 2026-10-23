// Captures pour la relecture et les planches. Le site est lu sur le serveur local (dist-web, port 8797) :
//   node tools/shots.mjs <dossier>
//  - l'arrivée (les mots qui montent, les deux moitiés qui s'ouvrent depuis le « + ») ;
//  - l'accueil au repos, à mi-course et recollé, sur ordinateur, tablette et téléphone ;
//  - chaque partie à la taille d'un écran d'ordinateur (1440 × 900), et les états (une maison choisie, une vignette,
//    la visionneuse, le choix rempli, la demande remplie, les erreurs, la demande écrite) ;
//  - des écrans de téléphone (390 × 844, en 2×) : le menu, l'accordéon des maisons, la visionneuse, le choix, la demande.
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'shots';
mkdirSync(out, {recursive: true});
const URL_ = process.env.SITE || 'http://127.0.0.1:8797/';
const b = await chromium.launch();
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
  await p.waitForTimeout(wait);
};
const ready = async (p) => {
  await p.goto(URL_, {waitUntil: 'load'});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(2300);
};
// fait défiler toute la page une fois, pour que chaque titre et chaque photo ait déjà joué son apparition
const settle = async (p) => {
  const [H, step] = await p.evaluate(() => [document.documentElement.scrollHeight, Math.round(innerHeight * 0.6)]);
  for (let y = 0; y < H; y += step) {
    await p.evaluate((yy) => window.scrollTo({top: yy, behavior: 'instant'}), y);
    await p.waitForTimeout(200);
  }
  await p.waitForTimeout(1600);
  await p.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
  await p.waitForTimeout(700);
};
const runOf = (p) => p.evaluate(() => document.querySelector('.hero').offsetHeight - document.querySelector('.hero__stage').offsetHeight);
const at = async (p, y, wait = 900) => {
  await p.evaluate((v) => window.scrollTo({top: v, behavior: 'instant'}), y);
  await p.waitForTimeout(wait);
};

/* ——— l'arrivée, sur ordinateur et au téléphone ——— */
// les moments sont comptés depuis le début de l'arrivée (la classe is-in posée par le script)
for (const [opt, tag] of [[DESK, 'd'], [PHONE, 'm']]) {
  const ctx = await b.newContext(opt);
  const p = await ctx.newPage();
  await p.goto(URL_, {waitUntil: 'commit'});
  await p.waitForFunction(() => document.querySelector('.hero')?.classList.contains('is-in'), null, {polling: 16});
  const t0 = Date.now();
  for (const ms of [150, 450, 900]) {
    await p.waitForTimeout(Math.max(0, ms - (Date.now() - t0)));
    await shot(p, `o-${tag}-${ms}`);
  }
  await ctx.close();
}

/* ——— ordinateur ——— */
{
  const ctx = await b.newContext(DESK);
  const p = await ctx.newPage();
  await ready(p);
  await shot(p, '1440-hero');
  const run = await runOf(p);
  await at(p, Math.round(run * 0.3));
  await shot(p, '1440-join-30');
  await at(p, Math.round(run * 0.62));
  await shot(p, '1440-join-62');
  await at(p, run);
  await shot(p, '1440-joined');
  await at(p, 0, 600);
  await settle(p);
  await go(p, '.intro', 90);
  await shot(p, '1440-intro');
  await go(p, '#homes', 0);
  await shot(p, '1440-homes');
  await p.click('#hb-villa');
  await p.waitForTimeout(700);
  await p.click('#hp-villa .thumb[data-at="1"]');
  await p.waitForTimeout(900);
  await go(p, '#homes', 0, 600);
  await shot(p, '1440-homes-villa');
  await p.click('#hb-gates');
  await p.waitForTimeout(800);
  await shot(p, '1440-homes-gates');
  await p.click('#hp-gates .home__photo');
  await p.waitForTimeout(900);
  await shot(p, '1440-viewer');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(500);
  await go(p, '#how', 0);
  await shot(p, '1440-how');
  await p.click('.opt:has(input[value="find"])');
  await p.click('.opt:has(input[value="scratch"])');
  await p.waitForTimeout(400);
  await go(p, '.choose', -60, 500);
  await shot(p, '1440-how-picked');
  await go(p, '.finish', -40);
  await shot(p, '1440-finish');
  await go(p, '#packages', 0);
  await shot(p, '1440-packages');
  await go(p, '#realtors', 0);
  await shot(p, '1440-realtors');
  await go(p, '#about', -60);
  await shot(p, '1440-about');
  // « Ask about this starting point » remplit la demande, qui brille un instant
  await go(p, '.choose__out', -300, 400);
  await p.click('[data-start]');
  await p.waitForTimeout(1500);
  await shot(p, '1440-ask-filled');
  await p.fill('#f-email', 'pat@example');
  await p.click('.btn--send');
  await p.waitForTimeout(500);
  await go(p, '.form__set:nth-of-type(2)', -40, 500);
  await shot(p, '1440-ask-errors');
  await p.fill('#f-name', 'Pat');
  await p.fill('#f-email', 'pat@example.com');
  await p.fill('#f-time', 'Weekday mornings');
  await p.click('.btn--send');
  await p.waitForTimeout(600);
  await go(p, '.form__end', -380, 500);
  await shot(p, '1440-ask-sent');
  await go(p, '.foot', -200, 800);
  await shot(p, '1440-foot');
  await ctx.close();
}

/* ——— tablette ——— */
{
  const ctx = await b.newContext(TAB);
  const p = await ctx.newPage();
  await ready(p);
  await shot(p, '768-hero');
  await ctx.close();
}

/* ——— téléphone ——— */
{
  const ctx = await b.newContext(PHONE);
  const p = await ctx.newPage();
  await ready(p);
  await shot(p, 'm-hero');
  const run = await runOf(p);
  await at(p, Math.round(run * 0.5));
  await shot(p, 'm-join');
  await at(p, run);
  await shot(p, 'm-joined');
  await at(p, 0, 600);
  await p.tap('.menu-btn');
  await p.waitForTimeout(500);
  await shot(p, 'm-menu');
  await p.tap('.menu-btn');
  await p.waitForTimeout(400);
  await settle(p);
  await go(p, '.intro', -20);
  await shot(p, 'm-intro');
  await go(p, '#homes', 0);
  await shot(p, 'm-homes');
  await p.tap('#hb-oakes-estate');
  await p.waitForTimeout(1500);
  await go(p, '#hb-oakes-estate', -10, 900);
  await shot(p, 'm-homes-open');
  await p.evaluate(() => document.querySelector('#hp-oakes-estate .home__photo').click());
  await p.waitForTimeout(900);
  await shot(p, 'm-viewer');
  await p.tap('.viewer__close');
  await p.waitForTimeout(500);
  await go(p, '#how', 0);
  await p.tap('.opt:has(input[value="land"])');
  await shot(p, 'm-how');
  await go(p, '.choose__set:nth-of-type(2)', -60);
  await p.tap('.opt:has(input[value="plans"])');
  await p.waitForTimeout(400);
  await go(p, '.choose__out', -260, 500);
  await shot(p, 'm-how-picked');
  await go(p, '.finish', 0);
  await shot(p, 'm-finish');
  await go(p, '#packages', 0);
  await shot(p, 'm-packages');
  await go(p, '#realtors', 0);
  await shot(p, 'm-realtors');
  await go(p, '#about', 0);
  await shot(p, 'm-about');
  await go(p, '#consultation', 0);
  await shot(p, 'm-ask');
  await go(p, '.foot', 0, 800);
  await shot(p, 'm-foot');
  await ctx.close();
}
await b.close();
console.log('captures dans', out);
