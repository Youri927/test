// Essais des interactions : l'ouverture (la ligne d'horizon, la photo, les repères), les liens de l'en-tête, la cote
// du projet, la cuisine détail par détail, le plan des cages, la fourchette, le registre (huit chantiers, « Show all »,
// filtres), le formulaire, le clavier, le menu du téléphone, le mouvement réduit, l'arrivée par un lien, et les
// débordements de 320 à 1920 px.
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
let n = 0;
const ok = (cond, msg) => {
  n++;
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
const shown = (p) => p.$$eval('[data-ledger] li', (it) => it.filter((i) => !i.hidden).length);
// les liens mailto ouverts par le formulaire sont relevés au lieu d'être suivis
const catchMail = (p) =>
  p.evaluate(() => {
    window.__mail = [];
    document.addEventListener('click', (e) => {
      const a = e.target.closest?.('a[href^="mailto:"]');
      if (a && a.hidden) {
        e.preventDefault();
        window.__mail.push(a.href);
      }
    }, true);
  });

/* ——— ordinateur ——— */
let ctx = await b.newContext({viewport: {width: 1440, height: 900}});
let p = await open(ctx);

// l'ouverture : la ligne d'horizon se tend, la photo s'ouvre depuis elle, puis la légende
await p.waitForFunction(() => {
  const a = document.getAnimations().find((x) => x.effect?.target?.classList?.contains('hero__img'));
  return a && a.currentTime >= 1050;
}, null, {polling: 'raf'});
const mid = await p.evaluate(() => {
  const img = document.querySelector('.hero__img');
  const line = document.querySelector('.hero__line');
  return {clip: getComputedStyle(img).clipPath, line: +getComputedStyle(line).opacity};
});
const band = /inset\(([\d.]+)%/.exec(mid.clip);
ok(band && +band[1] > 3 && +band[1] < 38, `ouverture, en cours : la photo s'ouvre depuis l'horizon (${mid.clip})`);
ok(mid.line > 0.9, "ouverture, en cours : la ligne d'horizon est tendue sur la photo");
await p.screenshot({path: `${out}/i-hero-mid.png`});
await p.waitForTimeout(1900);
const end = await p.evaluate(() => ({
  clip: getComputedStyle(document.querySelector('.hero__img')).clipPath,
  line: +getComputedStyle(document.querySelector('.hero__line')).opacity,
  cap: getComputedStyle(document.querySelector('.hero__cap')).clipPath,
  title: getComputedStyle(document.querySelector('.hero__title')).maskPosition,
}));
ok(/^(inset\(0(%|px)?( 0(%|px)?)*\)|none)$/.test(end.clip), `ouverture, finie : la photo est entière (${end.clip})`);
ok(end.line === 0, "ouverture, finie : la ligne s'est effacée");
ok(/^(inset\(0(%|px)?( 0(%|px)?)*\)|none)$/.test(end.cap), `ouverture, finie : la légende « Park Shore, Naples » est découverte (${end.cap})`);
ok(/^0(%|px)? 0(%|px)?$/.test(end.title), `le titre est entièrement découvert (${end.title})`);
await p.screenshot({path: `${out}/i-hero.png`});

// les liens de l'en-tête amènent la section sous l'en-tête
for (const [href, sel] of [['#work', '#work-title'], ['#services', '#services-title'], ['#record', '#record-title'], ['#contact', '#contact-title']]) {
  await p.click(`.nav a[href="${href}"]`);
  await p.waitForTimeout(1500);
  const t = await topOf(p, href);
  ok(t >= 70 && t <= 110, `en-tête : « ${href} » amène la section sous l'en-tête (${t} px)`);
}
ok(await p.$eval('[data-top]', (e) => e.classList.contains('is-scrolled')), "en-tête : un filet dès qu'on a quitté le haut");
ok(await p.evaluate(() => document.activeElement?.id === 'contact'), 'le focus suit le lien (#contact)');

// la cote du projet : tracée à son arrivée
await p.evaluate(() => scrollTo(0, 0));
await p.waitForTimeout(400);
await p.$eval('[data-span]', (e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 500));
await p.waitForTimeout(1800);
ok(await p.$eval('[data-span]', (e) => e.classList.contains('is-drawn')), 'Rick : la cote « from start to finish » se trace à son arrivée');
const clipSpan = await p.$eval('.span__steps', (e) => getComputedStyle(e).clipPath);
ok(!/100%/.test(clipSpan), `Rick : la cote est entière (${clipSpan})`);

// la cuisine, détail par détail
const detail = async (k) => {
  await p.$eval(`[data-detail="${k}"]`, (e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY + e.offsetHeight / 2 - innerHeight / 2));
  await p.waitForTimeout(900);
  return p.evaluate((k) => {
    const item = document.querySelector(`[data-detail="${k}"]`);
    const box = document.querySelector('[data-box]:not(.read__box--halo)');
    const r = item.getBoundingClientRect();
    const m = document.querySelector('.read__media').getBoundingClientRect();
    return {
      on: item.classList.contains('is-on'),
      rect: ['x', 'y', 'width', 'height'].map((a) => box.getAttribute(a)).join(' '),
      want: item.dataset.rect,
      pin: document.querySelector(`[data-pin="${k}"]`).classList.contains('is-on'),
      others: [...document.querySelectorAll('[data-detail].is-on')].length,
      mediaTop: Math.round(m.top),
      itemMid: Math.round(r.top + r.height / 2),
    };
  }, k);
};
for (const k of ['1', '3', '5']) {
  const d = await detail(k);
  ok(d.on && d.pin && d.others === 1 && d.rect === d.want, `cuisine : le détail ${k} au milieu de l'écran est cadré sur la photo (${d.rect})`);
}
const d2 = await detail('2');
ok(d2.mediaTop >= 72 && d2.mediaTop <= 140, `cuisine : la photo reste à l'écran pendant la lecture (haut à ${d2.mediaTop} px)`);
await p.screenshot({path: `${out}/i-read.png`});

// le plan des cages et la fourchette : tracés à leur arrivée
await p.$eval('[data-plan]', (e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 400));
await p.waitForTimeout(2600);
const plan = await p.evaluate(() => ({
  drawn: document.querySelector('[data-plan]').classList.contains('is-drawn'),
  dash: getComputedStyle(document.querySelector('.plan__shape rect')).strokeDashoffset,
  dims: +getComputedStyle(document.querySelector('.plan__dims')).opacity,
}));
ok(plan.drawn && parseFloat(plan.dash) === 0 && plan.dims === 1, `services : le plan des deux cages se trace à son arrivée (trait ${plan.dash}, cotes ${plan.dims})`);
await p.$eval('[data-range]', (e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 500));
await p.waitForTimeout(1700);
ok(await p.$eval('[data-range]', (e) => e.classList.contains('is-drawn') && getComputedStyle(e.querySelector('i')).transform === 'none' || /matrix\(1, 0, 0, 1/.test(getComputedStyle(e.querySelector('i')).transform)), 'services : la ligne de cote de la fourchette se trace');

// le registre : huit chantiers, puis tous ; les filtres
ok((await shown(p)) === 8, `registre : huit chantiers d'abord (${await shown(p)})`);
await p.click('[data-ledger-more]');
await p.waitForTimeout(400);
ok((await shown(p)) === 16, `registre : « Show all 16 jobs » montre les seize (${await shown(p)})`);
ok(await p.$eval('[data-ledger-more]', (e) => e.hidden), 'registre : le bouton disparaît une fois tout montré');
ok(await p.evaluate(() => document.activeElement === document.querySelectorAll('[data-ledger] li')[8]), 'registre : le clavier repart du premier chantier ajouté');
for (const [k, want] of [['bath', 3], ['commercial', 4], ['storm', 1], ['all', 16]]) {
  await p.click(`[data-filters] [data-k="${k}"]`);
  await p.waitForTimeout(300);
  const s = await shown(p);
  const pressed = await p.$eval(`[data-filters] [data-k="${k}"]`, (e) => e.getAttribute('aria-pressed'));
  const st = await p.$eval('[data-ledger-status]', (e) => e.textContent);
  ok(s === want && pressed === 'true', `registre : « ${k} » montre ${s} chantier(s) ; annoncé « ${st} »`);
}
await p.screenshot({path: `${out}/i-record.png`});

// le formulaire : vérifié, puis rédigé dans la messagerie
await catchMail(p);
await p.$eval('[data-form]', (e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 200));
await p.click('[data-form] button[type="submit"]');
await p.waitForTimeout(200);
const errsShown = await p.$$eval('.field__err', (e) => e.filter((x) => !x.hidden).length);
ok(errsShown === 3 && (await p.evaluate(() => document.activeElement.id)) === 'f-name', `formulaire vide : trois erreurs, le focus sur le nom (${errsShown})`);
ok((await p.$eval('#f-email', (e) => e.getAttribute('aria-invalid'))) === 'true', 'formulaire : le champ fautif est signalé (aria-invalid)');
await p.fill('#f-name', 'Dana');
await p.fill('#f-email', 'dana@example.com');
await p.selectOption('#f-type', 'Condo');
await p.fill('#f-msg', 'Kitchen and two baths in a Park Shore condo, after the season.');
await p.click('[data-form] button[type="submit"]');
await p.waitForTimeout(200);
const mail = await p.evaluate(() => window.__mail);
if (mail.length !== 1) console.log('  relevé :', JSON.stringify(mail));
ok(mail.length === 1 && mail[0].startsWith('mailto:EhlersContracting@gmail.com?subject=Condo%20project%3A%20Dana') && decodeURIComponent(mail[0]).includes('Email: dana@example.com'), `formulaire rempli : la messagerie s'ouvre avec le message rédigé`);
ok((await p.$$eval('.field__err', (e) => e.filter((x) => !x.hidden).length)) === 0, 'formulaire rempli : plus aucune erreur');

await ctx.close();

// le clavier, sur une page neuve : le lien d'évitement, puis l'en-tête
ctx = await b.newContext({viewport: {width: 1440, height: 900}});
p = await open(ctx);
await p.keyboard.press('Tab');
ok((await p.evaluate(() => document.activeElement.className)) === 'skip', 'clavier : le premier arrêt est « Skip to content »');
await p.keyboard.press('Tab');
ok(await p.evaluate(() => document.activeElement.classList.contains('brand')), 'clavier : puis le nom Ehlers');
await ctx.close();

/* ——— arrivée par un lien vers une section ——— */
ctx = await b.newContext({viewport: {width: 1440, height: 900}});
p = await open(ctx, url + '#record');
await p.waitForTimeout(800);
const tr = await topOf(p, '#record');
ok(tr >= 60 && tr <= 120, `arrivée sur #record : la section est sous l'en-tête (${tr} px)`);
await ctx.close();

/* ——— mouvement réduit ——— */
ctx = await b.newContext({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
p = await open(ctx);
await p.waitForTimeout(300);
const rm = await p.evaluate(() => ({
  clip: getComputedStyle(document.querySelector('.hero__img')).clipPath,
  lenis: document.documentElement.classList.contains('lenis'),
  anims: document.getAnimations().length,
  cap: getComputedStyle(document.querySelector('.hero__cap')).clipPath,
}));
ok(rm.clip === 'none' && !rm.lenis && rm.anims === 0, `moins d'animations : tout est en place dès l'ouverture, sans défilement doux ni transition (${rm.anims} animation)`);
ok(rm.cap === 'none', 'moins d\'animations : la légende de la photo est là');
await p.$eval('[data-span]', (e) => e.scrollIntoView());
await p.waitForTimeout(300);
ok(await p.$eval('[data-span]', (e) => e.classList.contains('is-drawn')), "moins d'animations : la cote est là sans attendre");
await ctx.close();

/* ——— téléphone ——— */
ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true});
p = await open(ctx);
await p.waitForTimeout(2800);
const mp = await p.evaluate(() => ({
  src: document.querySelector('.hero__img').naturalHeight > document.querySelector('.hero__img').naturalWidth,
  cap: (() => {
    const r = document.querySelector('.hero__cap').getBoundingClientRect();
    const m = document.querySelector('.hero__media').getBoundingClientRect();
    return {l: Math.round(r.left), r: Math.round(r.right), inside: r.bottom <= m.bottom && r.top >= m.top};
  })(),
}));
ok(mp.src, 'téléphone : la photo en hauteur est chargée');
ok(mp.cap.inside && mp.cap.l >= 0 && mp.cap.r <= 390, `téléphone : la légende de la photo est dans l'écran (${mp.cap.l}-${mp.cap.r})`);
await p.screenshot({path: `${out}/i-phone-hero.png`});
// le menu
await p.click('[data-menu-open]');
await p.waitForTimeout(200);
ok(!(await p.$eval('[data-menu]', (e) => e.hidden)) && (await p.$eval('[data-menu-open]', (e) => e.getAttribute('aria-expanded'))) === 'true', 'menu ouvert');
ok(await p.evaluate(() => document.activeElement.hasAttribute('data-menu-close')), 'menu : le focus va sur « Close »');
ok(await p.evaluate(() => document.querySelector('main').inert), 'menu : la page dessous ne prend plus le focus');
for (let i = 0; i < 9; i++) await p.keyboard.press('Tab');
ok(await p.evaluate(() => !!document.activeElement.closest('[data-menu]')), 'menu : la tabulation reste dans le menu');
await p.keyboard.press('Escape');
ok((await p.$eval('[data-menu]', (e) => e.hidden)) && (await p.evaluate(() => document.activeElement.hasAttribute('data-menu-open'))), 'Échap ferme le menu et rend le focus au bouton');
await p.click('[data-menu-open]');
await p.click('.menu__nav a[href="#services"]');
await p.waitForTimeout(1500);
const ts = await topOf(p, '#services');
ok((await p.$eval('[data-menu]', (e) => e.hidden)) && ts >= 50 && ts <= 100, `un lien du menu le ferme et amène « Services » sous l'en-tête (${ts} px)`);
// la cuisine au téléphone : la photo reste en haut pendant la lecture, et le détail cadré est celui qu'on lit dessous
await p.$eval('[data-detail="3"]', (e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 400));
await p.waitForTimeout(700);
await p.$eval('[data-detail="3"]', (e) => {
  const band = document.querySelector('.read__media').getBoundingClientRect().bottom;
  window.scrollTo(0, e.getBoundingClientRect().top + scrollY - band - 20);
});
await p.waitForTimeout(900);
const mr = await p.evaluate(() => {
  const m = document.querySelector('.read__media').getBoundingClientRect();
  const h = document.querySelector('[data-detail="3"] h3').getBoundingClientRect();
  return {mt: Math.round(m.top), mb: Math.round(m.bottom), h: Math.round(h.top), on: document.querySelector('[data-detail="3"]').classList.contains('is-on')};
});
ok(mr.mt >= 55 && mr.mt <= 70 && mr.on && mr.h >= mr.mb, `téléphone : la photo de la cuisine reste en haut (${mr.mt} px) ; le détail 3, lu juste dessous (${mr.h} px), est cadré`);
await p.screenshot({path: `${out}/i-phone-read.png`});
await ctx.close();

/* ——— débordements, de 320 à 1920 px ——— */
ctx = await b.newContext({viewport: {width: 1440, height: 900}});
p = await open(ctx);
const bad = [];
for (const w of [320, 360, 375, 390, 414, 480, 600, 700, 768, 820, 860, 900, 1000, 1080, 1180, 1280, 1366, 1600, 1920]) {
  await p.setViewportSize({width: w, height: 900});
  await p.waitForTimeout(120);
  const r = await p.evaluate(() => {
    const over = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    const els = [...document.querySelectorAll('body *')].filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width && (r.right > document.documentElement.clientWidth + 1 || r.left < -1) && !e.closest('.read__pins, .sr, .skip, [hidden], .menu');
    }).slice(0, 3).map((e) => `${e.tagName.toLowerCase()}.${e.className}`);
    return {over, els};
  });
  if (r.over || r.els.length) bad.push(`${w}: ${r.els.join(' ')}`);
}
ok(bad.length === 0, `aucun débordement sur 19 largeurs, de 320 à 1920 px${bad.length ? ' : ' + bad.join(' | ') : ''}`);
await ctx.close();

await b.close();
ok(errs.length === 0, errs.length ? `erreurs de page : ${errs.join(' | ')}` : 'aucune erreur de page');
console.log(fails ? `${fails} essai(s) sur ${n} en échec` : `tout est bon (${n} essais)`);
process.exit(fails ? 1 : 0);
