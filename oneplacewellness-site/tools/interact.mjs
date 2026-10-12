// Essais des interactions : l'ouverture (la lumière), les liens de l'en-tête, la ligne du temps et ses soins, les cas
// (filtres et « Show all »), la carte, la demande de consultation (courriel préparé), le menu et la barre d'appel du
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
// le lien mailto préparé par le formulaire, lu au passage sans ouvrir de messagerie
const catchMail = (p) =>
  p.evaluate(
    () =>
      new Promise((done) => {
        document.addEventListener(
          'click',
          (e) => {
            const a = e.target.closest('a');
            if (a && a.href.startsWith('mailto:')) {
              e.preventDefault();
              done(a.href);
            }
          },
          {capture: true, once: true},
        );
        document.querySelector('[data-form]').requestSubmit();
        setTimeout(() => done(''), 500);
      }),
  );
const topOf = (p, sel) => p.$eval(sel, (e) => Math.round(e.getBoundingClientRect().top));
// la place prévue sous l'en-tête (scroll-padding-top de la page)
const pad = (p) => p.evaluate(() => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop));
// l'ombre du titre : l'opacité de sa première ombre (0,42 sous la lumière rasante, 0,14 de face) et le nombre d'ombres visibles
const shadow = (p) =>
  p.$eval('[data-title]', (e) => {
    const s = getComputedStyle(e).textShadow;
    const parts = s.split(/,(?![^(]*\))/).map((x) => x.trim());
    const alpha = (x) => {
      const m = x.match(/rgba?\(([^)]+)\)/);
      if (!m) return 0;
      const v = m[1].split(',').map(Number);
      return v.length > 3 ? v[3] : 1;
    };
    return {first: alpha(parts[0]), seen: parts.filter((x) => alpha(x) > 0.001).length};
  });
const heroAnims = (p) => p.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && a.effect && a.effect.target && a.effect.target.closest('[data-hero]')).length);
const shown = (p) => p.$$eval('[data-ledger] .case', (cs) => cs.filter((c) => !c.hidden).length);

/* ——— ordinateur ——— */
let ctx = await b.newContext({viewport: {width: 1440, height: 900}});
let p = await open(ctx);

// l'ouverture : les ombres longues de la lumière rasante, puis l'ombre courte et douce de face
await p.waitForTimeout(150);
const s0 = await shadow(p);
ok((await p.evaluate(() => document.documentElement.classList.contains('intro'))) && s0.first > 0.38 && s0.seen === 5, `ouverture, au départ : la lumière rasante, cinq ombres (première ombre ${s0.first})`);
await p.waitForTimeout(1300);
const s1 = await shadow(p);
ok(s1.first < s0.first && s1.first > 0.14, `ouverture, en cours : l'ombre s'adoucit (${s1.first.toFixed(3)})`);
await p.screenshot({path: `${out}/i-hero-mid.png`});
await p.waitForTimeout(1700);
const s2 = await shadow(p);
ok(Math.abs(s2.first - 0.14) < 0.005 && s2.seen === 2 && (await heroAnims(p)) === 0, `ouverture terminée : l'ombre de face, deux ombres, plus rien ne bouge (${JSON.stringify(s2)})`);
const light = await p.$eval('[data-light]', (e) => getComputedStyle(e).transform);
ok(light.startsWith('matrix(1, 0, -0.249') || light.startsWith('matrix(1, 0, -0.24'), `la fenêtre de lumière est à sa place (${light})`);
await p.screenshot({path: `${out}/i-hero.png`});

// la ligne du temps attend d'être à l'écran pour se tracer
const before = await p.$eval('[data-tm]', (e) => e.style.getPropertyValue('--p'));
ok(before === '0', `ligne du temps hors de l'écran : pas encore tracée (--p = ${before})`);

// un lien de l'en-tête amène la section sous l'en-tête
await p.click('.top__nav a[href="#treatments"]');
await p.waitForTimeout(1600);
const tTop = await topOf(p, '#treatments');
const headH = await p.$eval('[data-top]', (e) => e.offsetHeight);
ok(Math.abs(tTop - (await pad(p))) <= 2 && tTop > headH, `« Treatments » : la section arrive juste sous l'en-tête (${tTop} px, en-tête ${headH} px)`);
ok((await p.evaluate(() => location.hash)) === '#treatments', "l'adresse de la page suit la section (#treatments)");

// la ligne du temps : le curseur la balaie (essai sur une page à part, arrivée directe sur les pistes), puis tout est tracé
{
  const q = await open(ctx);
  await q.evaluate(() => scrollTo({top: document.querySelector('.tm__rows').getBoundingClientRect().top + scrollY - 140, behavior: 'instant'}));
  await q.waitForTimeout(1300);
  const mid = await q.$eval('[data-tm]', (e) => ({p: +e.style.getPropertyValue('--p'), sweeping: e.classList.contains('is-sweeping')}));
  ok(mid.sweeping && mid.p > 0.1 && mid.p < 0.95, `ligne du temps : le curseur passe (--p = ${mid.p})`);
  await q.screenshot({path: `${out}/i-sweep.png`});
  await q.waitForTimeout(2600);
  const done = await q.$eval('[data-tm]', (e) => ({p: e.style.getPropertyValue('--p'), sweeping: e.classList.contains('is-sweeping'), seg: getComputedStyle(e.querySelector('.seg--last')).clipPath}));
  ok(!done.sweeping && done.p === '' && /inset\(-12px 0(px|%)? -12px -12px\)/.test(done.seg), `ligne du temps tracée, le curseur effacé (${done.seg})`);
  await q.close();
}
await p.locator('.tm__rows').scrollIntoViewIfNeeded();
await p.waitForTimeout(300);

// un soin s'ouvre en douceur, se referme
const btn = '[aria-controls="tm-thread"]';
await p.click(btn);
await p.waitForTimeout(120);
const opening = await p.$eval('#tm-thread', (e) => e.getBoundingClientRect().height);
await p.waitForTimeout(500);
const opened = await p.$eval('#tm-thread', (e) => ({hidden: e.hidden, h: e.getBoundingClientRect().height}));
ok((await p.getAttribute(btn, 'aria-expanded')) === 'true' && !opened.hidden && opening > 0 && opening < opened.h, `Threadlift : le texte se déplie en douceur (${Math.round(opening)} px puis ${Math.round(opened.h)} px)`);
await p.screenshot({path: `${out}/i-panel.png`});
await p.keyboard.press('Enter');
await p.waitForTimeout(450);
ok((await p.getAttribute(btn, 'aria-expanded')) === 'false' && (await p.$eval('#tm-thread', (e) => e.hidden)), 'Threadlift : Entrée le referme (le bouton garde le focus)');

// les cas : six d'abord, un filtre, puis les seize
await p.locator('#cases').scrollIntoViewIfNeeded();
await p.waitForTimeout(400);
ok((await shown(p)) === 6 && !(await p.isHidden('[data-more]')), `cas : six cas, puis « Show all 16 cases » (${await shown(p)})`);
const kinds = await p.$$eval('[data-ledger] .case:not([hidden])', (cs) => [...new Set(cs.map((c) => c.dataset.kind))].sort().join(','));
ok(kinds === 'botox,fillers,laser,thread', `les six premiers montrent tous les soins (${kinds})`);
await p.click('[data-filter="botox"]');
await p.waitForTimeout(300);
ok((await shown(p)) === 3 && (await p.getAttribute('[data-filter="botox"]', 'aria-pressed')) === 'true' && (await p.getAttribute('[data-filter="all"]', 'aria-pressed')) === 'false', 'filtre « Botox and Xeomin » : trois cas, le bouton enfoncé');
ok((await p.textContent('[data-count]')) === 'Showing 3 Botox and Xeomin cases.' && (await p.isHidden('[data-more]')), `annonce : « ${await p.textContent('[data-count]')} », pas de « Show all »`);
await p.click('[data-filter="laser"]');
await p.waitForTimeout(200);
ok((await shown(p)) === 1 && (await p.textContent('[data-count]')) === 'Showing 1 laser case.', `filtre « Laser » : « ${await p.textContent('[data-count]')} »`);
await p.click('[data-filter="all"]');
await p.waitForTimeout(200);
ok((await shown(p)) === 6 && !(await p.isHidden('[data-more]')), 'retour à « All » : six cas et « Show all »');
await p.click('[data-more]');
await p.waitForTimeout(500);
ok((await shown(p)) === 16 && (await p.isHidden('[data-more]')), 'Show all : les seize cas');
ok(await p.evaluate(() => document.activeElement === document.querySelectorAll('[data-ledger] .case')[6]), 'le focus passe au septième cas, le premier des nouveaux');
await p.click('[data-filter="thread"]');
await p.click('[data-filter="all"]');
await p.waitForTimeout(200);
ok((await shown(p)) === 16, 'les seize restent affichés après un filtre');
await p.screenshot({path: `${out}/i-cases.png`});

// la carte : deux ondes autour du cabinet quand elle arrive à l'écran
await p.locator('.map').scrollIntoViewIfNeeded();
await p.waitForTimeout(500);
ok(await p.$eval('.map', (m) => m.classList.contains('is-seen')), 'carte : le cabinet signalé à son arrivée');
const wide = await p.$eval('.map__wide', (e) => getComputedStyle(e).display);
ok(wide === 'block', 'ordinateur : la carte large');

// la demande : erreurs, puis courriel préparé
await p.locator('[data-form]').scrollIntoViewIfNeeded();
await p.waitForTimeout(400);
await p.click('.request__send');
await p.waitForTimeout(200);
ok(!(await p.isHidden('#e-name')) && !(await p.isHidden('#e-phone')) && (await p.isHidden('#e-email')), 'formulaire vide : erreurs du nom et du téléphone, pas du courriel (facultatif)');
ok((await p.evaluate(() => document.activeElement.id)) === 'f-name', 'le curseur va au premier champ à corriger');
ok((await p.getAttribute('#f-name', 'aria-invalid')) === 'true' && (await p.getAttribute('#f-name', 'aria-describedby')) === 'e-name', 'le champ est signalé et renvoie à son message');
await p.screenshot({path: `${out}/i-form-error.png`});
await p.fill('#f-name', 'Jamie Example');
ok(await p.isHidden('#e-name'), 'le message du nom disparaît dès que le nom est écrit');
await p.fill('#f-phone', '239-555-01');
await p.fill('#f-email', 'jamie@example');
await p.click('.request__send');
await p.waitForTimeout(200);
ok(!(await p.isHidden('#e-phone')) && !(await p.isHidden('#e-email')), 'téléphone à 8 chiffres et courriel incomplet : refusés');
await p.fill('#f-phone', '(239) 555-0100');
await p.fill('#f-email', 'jamie@example.com');
await p.fill('#f-when', 'Tuesday morning');
await p.fill('#f-note', 'Lines around the mouth.');
await p.check('input[name="topic"][value="Threadlift"]', {force: true});
const mail = await catchMail(p);
const dec = decodeURIComponent(mail);
ok(mail.startsWith('mailto:Oneplacewellness@gmail.com?subject=Consultation%20request%3A%20Threadlift'), `courriel : ${mail.slice(0, 92)}…`);
ok(dec.includes('About: Threadlift') && dec.includes('Name: Jamie Example') && dec.includes('Phone: (239) 555-0100') && dec.includes('Email: jamie@example.com') && dec.includes('Best time: Tuesday morning') && dec.includes('Lines around the mouth.'), 'le courriel reprend le sujet, le nom, le téléphone, le courriel, le moment et le message');
ok(!(await p.isHidden('[data-done]')), 'la confirmation s’affiche');
ok(await p.$eval('[data-dock]', (d) => getComputedStyle(d).display === 'none'), 'ordinateur : pas de barre d’appel');
await ctx.close();

/* ——— au clavier, dès l'arrivée : le lien d'évitement mène au contenu ——— */
ctx = await b.newContext({viewport: {width: 1440, height: 900}});
p = await open(ctx);
await p.waitForTimeout(400);
await p.keyboard.press('Tab');
ok((await p.evaluate(() => document.activeElement.className)) === 'skip', 'Tab : le lien « Skip to content » d’abord');
await p.keyboard.press('Enter');
await p.waitForTimeout(1300);
await p.keyboard.press('Tab');
const afterSkip = await p.evaluate(() => ({inMain: !!document.activeElement.closest('main'), text: document.activeElement.textContent.trim()}));
ok(afterSkip.inMain && afterSkip.text.startsWith('Call'), `après l'évitement, Tab va dans le contenu (« ${afterSkip.text} »)`);
// un lien de l'en-tête au clavier : la tabulation repart de la section
await p.focus('.top__nav a[href="#cases"]');
await p.keyboard.press('Enter');
await p.waitForTimeout(1500);
await p.keyboard.press('Tab');
ok(await p.evaluate(() => !!document.activeElement.closest('#cases')), `après « Cases » au clavier, Tab continue dans la section (« ${await p.evaluate(() => document.activeElement.textContent.trim().slice(0, 30))} »)`);
await ctx.close();

/* ——— mouvement réduit : pas d'ouverture, pas de défilement doux, la ligne du temps déjà tracée ——— */
ctx = await b.newContext({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
p = await open(ctx);
await p.waitForTimeout(300);
const rm = await p.evaluate(() => ({intro: document.documentElement.classList.contains('intro'), lenis: document.documentElement.classList.contains('lenis'), p: document.querySelector('[data-tm]').style.getPropertyValue('--p')}));
const rs = await shadow(p);
ok(!rm.intro && !rm.lenis && rm.p === '' && Math.abs(rs.first - 0.14) < 0.005, `mouvement réduit : l'ombre de face tout de suite, ligne du temps tracée, sans défilement doux (${JSON.stringify(rm)})`);
await p.click('[aria-controls="tm-botox"]');
ok(!(await p.$eval('#tm-botox', (e) => e.hidden)), 'mouvement réduit : un soin s’ouvre aussitôt');
await ctx.close();

/* ——— arrivée au milieu de la page (lien vers #visit) : pas d'ouverture ——— */
ctx = await b.newContext({viewport: {width: 1440, height: 900}});
p = await open(ctx, url + '#visit');
await p.waitForTimeout(300);
ok(!(await p.evaluate(() => document.documentElement.classList.contains('intro'))) && (await heroAnims(p)) === 0, 'arrivée sur #visit : pas d’ouverture');
await ctx.close();

/* ——— téléphone ——— */
ctx = await b.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2});
p = await open(ctx);
await p.waitForTimeout(2900);
ok(!(await p.$eval('[data-dock]', (d) => d.classList.contains('is-on'))), 'téléphone, en haut : pas de barre d’appel (les boutons sont à l’écran)');
ok((await p.$eval('.map__tall', (e) => getComputedStyle(e).display)) === 'block' && (await p.$eval('.map__wide', (e) => getComputedStyle(e).display)) === 'none', 'téléphone : la carte en hauteur');
await p.click('[data-menu-open]');
await p.waitForTimeout(300);
ok(!(await p.isHidden('#menu')) && (await p.getAttribute('[data-menu-open]', 'aria-expanded')) === 'true', 'menu ouvert');
ok(await p.evaluate(() => document.activeElement.matches('[data-menu-close]')), 'menu : le focus va sur « Close »');
ok(await p.$eval('main', (m) => m.inert), 'menu : la page dessous ne prend plus le focus');
const trap = [];
for (let i = 0; i < 10; i++) {
  await p.keyboard.press('Tab');
  trap.push(await p.evaluate(() => !!document.activeElement.closest('#menu')));
}
ok(trap.every(Boolean), 'menu : la tabulation reste dans le menu');
await p.screenshot({path: `${out}/i-menu.png`});
await p.keyboard.press('Escape');
await p.waitForTimeout(200);
ok((await p.isHidden('#menu')) && (await p.evaluate(() => document.activeElement.matches('[data-menu-open]'))), 'Échap ferme le menu et rend le focus au bouton');
ok(!(await p.$eval('main', (m) => m.inert)), 'la page redevient utilisable');
await p.click('[data-menu-open]');
await p.waitForTimeout(250);
await p.click('.menu__nav a[href="#cases"]');
await p.waitForTimeout(1600);
const casesTop = await topOf(p, '#cases');
ok((await p.isHidden('#menu')) && Math.abs(casesTop - (await pad(p))) <= 2, `un lien du menu ferme le menu et amène « Cases » sous l’en-tête (${casesTop} px)`);
ok(await p.$eval('[data-dock]', (d) => d.classList.contains('is-on') && d.getAttribute('aria-hidden') === 'false'), 'au milieu de la page : la barre d’appel est là');
await p.screenshot({path: `${out}/i-dock.png`});
// la ligne du temps au téléphone : les faits en texte sous chaque piste, sans étiquettes ni curseur
const facts = await p.$eval('.tm__facts', (e) => getComputedStyle(e).position);
const labs = await p.$eval('.lab', (e) => getComputedStyle(e).display);
ok(facts === 'static' && labs === 'none', `téléphone : les faits de chaque soin en texte (${facts}), les étiquettes de la piste masquées (${labs})`);
await p.click('[data-dock] a[href="#request"]');
await p.waitForTimeout(1700);
ok(!(await p.$eval('[data-dock]', (d) => d.classList.contains('is-on'))), 'sur la section visite : la barre d’appel se retire');
ok(await p.$$eval('[data-dock] a', (as) => as.every((a) => a.tabIndex === -1)), 'barre retirée : ses liens sortent de la tabulation');
await ctx.close();

/* ——— débordements, de 320 à 1920 px ——— */
const widths = [320, 360, 375, 390, 414, 430, 600, 700, 768, 820, 960, 1024, 1100, 1180, 1280, 1366, 1440, 1600, 1920];
const over = [];
for (const w of widths) {
  ctx = await b.newContext({viewport: {width: w, height: 900}, isMobile: w < 960, hasTouch: w < 960});
  p = await open(ctx);
  await p.evaluate(() => document.querySelector('[data-tm]').style.removeProperty('--p'));
  await p.waitForTimeout(150);
  const o = await p.evaluate(() => {
    const doc = document.documentElement.scrollWidth - innerWidth;
    // un texte coupé net (sans retour à la ligne) qui dépasse de son bloc
    const cut = [...document.querySelectorAll('h1, h2, h3, p, a.btn, button, dt, dd, li, label, legend, figcaption')]
      .filter((e) => e.offsetParent && !e.closest('[aria-hidden="true"]') && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX === 'visible' && e.clientWidth > 0)
      .map((e) => `${e.tagName.toLowerCase()}.${e.className || ''} « ${e.textContent.trim().slice(0, 30)} » ${e.scrollWidth}>${e.clientWidth}`);
    // les étiquettes de la ligne du temps : dans leur piste, sans se chevaucher sur une même rangée
    const lab = [];
    for (const t of document.querySelectorAll('.tm__track')) {
      const r = t.getBoundingClientRect();
      const ls = [...t.querySelectorAll('.lab')].filter((l) => getComputedStyle(l).display !== 'none').map((l) => ({el: l, b: l.getBoundingClientRect()}));
      for (const l of ls) if (l.b.left < r.left - 3 || l.b.right > r.right + 3) lab.push(`« ${l.el.textContent} » sort de sa piste`);
      for (let i = 0; i < ls.length; i++)
        for (let j = i + 1; j < ls.length; j++) {
          const A = ls[i].b;
          const B = ls[j].b;
          if (A.left < B.right + 6 && B.left < A.right + 6 && A.top < B.bottom && B.top < A.bottom) lab.push(`« ${ls[i].el.textContent} » touche « ${ls[j].el.textContent} »`);
        }
    }
    return {doc, cut: cut.slice(0, 4), lab: lab.slice(0, 4)};
  });
  if (o.doc > 0 || o.cut.length || o.lab.length) over.push(`${w}px : page ${o.doc} px ${o.cut.concat(o.lab).join(' ; ')}`);
  await ctx.close();
}
ok(!over.length, over.length ? `débordements :\n   ${over.join('\n   ')}` : `aucun débordement ni chevauchement d'étiquettes sur ${widths.length} largeurs, de 320 à 1920 px`);

await b.close();
console.log(errs.length ? `erreurs de page : ${errs.join(' | ')}` : 'aucune erreur de page');
console.log(fails ? `${fails} échec(s)` : 'tout est bon');
process.exit(fails ? 1 : 0);
