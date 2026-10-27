// Captures pour la relecture et les planches. Le site est lu sur le serveur local (dist-web, port 8798) :
//   node tools/shots.mjs <dossier>
//  - l'arrivée, sur ordinateur et au téléphone (le mot qui monte, la barre qui se tire, la photo qui s'ouvre) ;
//  - sur ordinateur (1440 × 900), l'enfilade : chaque pièce à son début et à sa fin, une jonction entre deux pièces, le
//    survol des détails, Palmer Avenue qui remplit la demande, les erreurs, la demande écrite, la fin ;
//  - sur tablette (768 × 1024) et au téléphone (390 × 844, en 2×), la page de haut en bas, et le menu.
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'shots';
mkdirSync(out, {recursive: true});
const URL_ = process.env.SITE || 'http://127.0.0.1:8798/';
const b = await chromium.launch();
const DESK = {viewport: {width: 1440, height: 900}};
const TAB = {viewport: {width: 768, height: 1024}, deviceScaleFactor: 1, isMobile: true, hasTouch: true};
const PHONE = {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true};
const errs = [];
const page = async (ctx) => {
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(e.message));
  return p;
};
const shot = (p, name) => p.screenshot({path: `${out}/${name}.png`});
const ready = async (p) => {
  await p.goto(URL_, {waitUntil: 'load'});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(2400);
};
const at = async (p, y, wait = 1700) => {
  await p.evaluate((v) => window.scrollTo({top: v, behavior: 'instant'}), y);
  await p.waitForTimeout(wait);
};
// dans l'enfilade, le défilement vertical de la page devient le déplacement de côté : une pièce est à x = offsetLeft
const room = (p, id) => p.evaluate((i) => {
  const r = document.getElementById(i);
  return {left: r.offsetLeft, w: r.offsetWidth, max: document.documentElement.scrollHeight - innerHeight};
}, id);
// de haut en bas : amène un élément sous l'en-tête, avec un décalage
const go = async (p, sel, off = 0, wait = 1700) => {
  await p.evaluate(([s, o]) => {
    const top = document.querySelector('.top').offsetHeight;
    const e = document.querySelector(s);
    window.scrollTo({top: Math.max(0, e.getBoundingClientRect().top + scrollY - top + o), behavior: 'instant'});
  }, [sel, off]);
  await p.waitForTimeout(wait);
};
// fait défiler toute la page une fois, pour que chaque titre et chaque photo ait déjà joué son apparition
const settle = async (p) => {
  const [H, step] = await p.evaluate(() => [document.documentElement.scrollHeight, Math.round(innerHeight * 0.6)]);
  for (let y = 0; y < H; y += step) await at(p, y, 160);
  await at(p, 0, 900);
};

/* ——— l'arrivée ——— */
for (const [opt, tag] of [[DESK, 'd'], [PHONE, 'm']]) {
  const ctx = await b.newContext(opt);
  const p = await page(ctx);
  await p.goto(URL_, {waitUntil: 'commit'});
  await p.waitForFunction(() => document.querySelector('.room--design .frieze')?.classList.contains('is-seen') && document.getAnimations().length > 0, null, {polling: 'raf', timeout: 8000});
  // les transitions sont arrêtées, puis posées à chaque moment : la capture ne dépend pas du temps qu'elle prend
  await p.evaluate(() => document.getAnimations().forEach((a) => a.pause()));
  for (const ms of [150, 450, 800, 1600]) {
    await p.evaluate((t) => document.getAnimations().forEach((a) => (a.currentTime = t)), ms);
    await shot(p, `o-${tag}-${ms}`);
  }
  await ctx.close();
}

/* ——— ordinateur : l'enfilade ——— */
{
  const ctx = await b.newContext(DESK);
  const p = await page(ctx);
  await ready(p);
  if (!(await p.evaluate(() => document.documentElement.classList.contains('h')))) throw new Error('pas d’enfilade à 1440 × 900');
  await shot(p, '1440-design');
  // les détails de l'entrée, et leur cadre sur la grande photo au survol
  const design = await room(p, 'design');
  await at(p, Math.min(design.max, design.left + design.w - 1440));
  await shot(p, '1440-design-end');
  await p.locator('.room--design .details li').first().hover();
  await p.waitForTimeout(600);
  await shot(p, '1440-detail-doors');
  await p.locator('.room--design .details li').nth(2).hover();
  await p.waitForTimeout(600);
  await shot(p, '1440-detail-oak');
  await p.mouse.move(720, 60);
  // la jonction : la barre de Design passe sous l'en-tête et devient celle de Build
  const build = await room(p, 'build');
  await at(p, build.left - 560);
  await shot(p, '1440-seam');
  for (const id of ['build', 'live', 'homes']) {
    const r = await room(p, id);
    await at(p, Math.min(r.max, r.left));
    await shot(p, `1440-${id}`);
    if (r.w > 1440) {
      await at(p, Math.min(r.max, r.left + r.w - 1440));
      await shot(p, `1440-${id}-end`);
    }
  }
  // « Ask about Palmer Avenue » : la demande s'ouvre sur le bon sujet
  const homes = await room(p, 'homes');
  await at(p, homes.left);
  await p.click('[data-topic="palmer"]');
  await p.waitForTimeout(2600);
  await shot(p, '1440-meet-palmer');
  await p.fill('#f-email', 'pat@example');
  await p.click('.btn--send');
  await p.waitForTimeout(600);
  await shot(p, '1440-meet-errors');
  await p.fill('#f-name', 'Pat');
  await p.fill('#f-email', 'pat@example.com');
  await p.fill('#f-msg', 'We would like to see the plans of the villa.');
  await p.click('.btn--send');
  await p.waitForTimeout(800);
  await shot(p, '1440-meet-sent');
  const end = await room(p, 'end');
  await at(p, end.max);
  await shot(p, '1440-end');
  await ctx.close();
}

/* ——— tablette ——— */
{
  const ctx = await b.newContext(TAB);
  const p = await page(ctx);
  await ready(p);
  await shot(p, '768-top');
  await settle(p);
  await go(p, '#homes', 0);
  await shot(p, '768-homes');
  await ctx.close();
}

/* ——— téléphone ——— */
{
  const ctx = await b.newContext(PHONE);
  const p = await page(ctx);
  await ready(p);
  await shot(p, 'm-top');
  await p.tap('.menu-btn');
  await p.waitForTimeout(600);
  await shot(p, 'm-menu');
  await p.tap('.menu-btn');
  await p.waitForTimeout(400);
  await settle(p);
  await go(p, '.room--design .plate', -24);
  await shot(p, 'm-plate');
  await go(p, '.room--design .say', -24);
  await shot(p, 'm-design-details');
  await go(p, '#build', 0);
  await shot(p, 'm-build');
  await go(p, '.steps-block', -24);
  await shot(p, 'm-steps');
  await go(p, '#live', 0);
  await shot(p, 'm-live');
  await go(p, '#homes', 0);
  await shot(p, 'm-homes');
  await go(p, '.home--whipple', -24);
  await shot(p, 'm-whipple');
  await go(p, '#meet', 0);
  await shot(p, 'm-meet');
  await go(p, '.form .topics', -24);
  await shot(p, 'm-form');
  await at(p, 1e6, 1200);
  await shot(p, 'm-end');
  await ctx.close();
}
await b.close();
console.log(errs.length ? `erreurs dans la page :\n${errs.join('\n')}` : 'aucune erreur dans la page');
console.log('captures dans', out);
