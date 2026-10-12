// Essais des interactions : ouverture, liens de l'en-tête, mots expliqués, soins, équipe, cas d'orthodontie, demande de
// rendez-vous (courriel préparé), menu et barre d'appel du téléphone, mouvement réduit, débordements de 320 à 1920 px.
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
// les animations de l'ouverture en cours (sur la façade ; les petites transitions du reste de la page ne comptent pas)
const running = (p) => p.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && a.effect && a.effect.target && a.effect.target.closest('[data-facade]')).length);

/* ——— ordinateur ——— */
let ctx = await b.newContext({viewport: {width: 1440, height: 900}});
let p = await open(ctx);

// l'ouverture : l'enseigne se pose, puis tout redevient la photo seule
await p.waitForTimeout(250);
const early = await p.evaluate(() => ({sign: getComputedStyle(document.querySelector('[data-sign]')).opacity, photo: getComputedStyle(document.querySelector('[data-photo]')).opacity}));
ok(+early.sign === 1 && +early.photo < 0.05, `ouverture, au départ : l'enseigne seule (enseigne ${early.sign}, photo ${(+early.photo).toFixed(2)})`);
await p.waitForTimeout(1050);
const mid = await p.evaluate(() => ({plate: +getComputedStyle(document.querySelector('[data-plate]')).opacity, photo: +getComputedStyle(document.querySelector('[data-photo]')).opacity}));
ok(mid.plate === 1 && mid.photo > 0.5, `ouverture, à 1,3 s : la photo et la plaque sous l'enseigne (photo ${mid.photo.toFixed(2)}, plaque ${mid.plate})`);
await p.waitForTimeout(1600);
const end = await p.evaluate(() => ({
  shown: document.querySelector('[data-facade]').classList.contains('is-shown'),
  sign: getComputedStyle(document.querySelector('[data-sign]')).opacity,
  plate: getComputedStyle(document.querySelector('[data-plate]')).opacity,
  photo: getComputedStyle(document.querySelector('[data-photo]')).opacity,
  cam: getComputedStyle(document.querySelector('[data-cam]')).transform,
}));
end.anims = await running(p);
ok(end.shown && +end.sign === 0 && +end.plate === 0 && +end.photo === 1 && end.cam === 'none' && end.anims === 0, `ouverture terminée : la photo seule, cadrage final (${JSON.stringify(end)})`);
await p.screenshot({path: `${out}/i-hero.png`});

// un lien de l'en-tête amène la section sous l'en-tête
await p.click('.top__nav a[href="#team"]');
await p.waitForTimeout(1600);
const teamTop = await topOf(p, '#team');
const headH = await p.$eval('[data-top]', (e) => e.offsetHeight);
ok(Math.abs(teamTop - (await pad(p))) <= 2 && teamTop > headH, `« Team » : la section arrive juste sous l'en-tête (${teamTop} px, en-tête ${headH} px)`);
ok((await p.evaluate(() => location.hash)) === '#team', 'l’adresse de la page suit la section (#team)');

// au clavier, un lien de l'en-tête amène aussi la tabulation dans la section
await p.focus('.top__nav a[href="#reviews"]');
await p.keyboard.press('Enter');
await p.waitForTimeout(1500);
await p.keyboard.press('Tab');
ok(await p.evaluate(() => !!document.activeElement.closest('#reviews, #costs')), `après « Reviews » au clavier, Tab continue dans la section (« ${await p.evaluate(() => document.activeElement.textContent.trim().slice(0, 30))} »)`);

// l'équipe : un visage, sa biographie
await p.click('.face[data-person="denise"]');
await p.waitForTimeout(300);
ok((await p.getAttribute('.face[data-person="denise"]', 'aria-pressed')) === 'true' && (await p.getAttribute('.face[data-person="castor"]', 'aria-pressed')) === 'false', 'équipe : Denise choisie, Dr. Castor non');
const bios = await p.$$eval('.bio', (bs) => bs.filter((x) => getComputedStyle(x).display !== 'none').map((x) => x.dataset.person));
ok(bios.length === 1 && bios[0] === 'denise', `équipe : une seule biographie visible (${bios.join(', ')})`);
await p.screenshot({path: `${out}/i-team.png`});

// les soins : un soin s'ouvre en douceur, se referme
await p.locator('#care').scrollIntoViewIfNeeded();
await p.waitForTimeout(500);
await p.click('details.item >> nth=0 >> summary');
await p.waitForTimeout(120);
const opening = await p.$eval('details.item', (d) => d.querySelector('.item__body').getBoundingClientRect().height);
await p.waitForTimeout(400);
const opened = await p.$eval('details.item', (d) => ({open: d.open, h: d.querySelector('.item__body').getBoundingClientRect().height}));
ok(opened.open && opening > 0 && opening < opened.h, `soins : « Cleanings » s'ouvre en douceur (${Math.round(opening)} px puis ${Math.round(opened.h)} px)`);
await p.screenshot({path: `${out}/i-care.png`});

// les mots expliqués : au survol, au clic (épinglé), au clavier
const term = p.locator('details.item >> nth=0 >> .term >> nth=0');
await term.hover();
await p.waitForTimeout(200);
ok(!(await p.isHidden('[data-def]')) && (await p.textContent('[data-def-text]')) === 'The action of cleaning teeth below the gumline.', `survol de « scaling » : « ${await p.textContent('[data-def-text]')} »`);
ok((await term.getAttribute('aria-describedby')) === 'def', 'le mot renvoie à sa définition (aria-describedby)');
const box = await p.$eval('[data-def]', (d) => {const r = d.getBoundingClientRect(); return {l: r.left, r: r.right, t: r.top, b: r.bottom};});
const tb = await term.boundingBox();
ok(box.b <= tb.y + 1 || box.t >= tb.y + tb.height - 1, 'la définition ne couvre pas le mot');
await p.screenshot({path: `${out}/i-term.png`});
await p.mouse.move(10, 10);
await p.waitForTimeout(300);
ok(await p.isHidden('[data-def]'), 'la souris s’en va : la définition se ferme');
await term.click();
await p.mouse.move(10, 10);
await p.waitForTimeout(300);
ok(!(await p.isHidden('[data-def]')), 'au clic, la définition reste ouverte');
await p.keyboard.press('Escape');
await p.waitForTimeout(100);
ok(await p.isHidden('[data-def]'), 'Échap la ferme');
await p.click('details.item >> nth=0 >> summary');
await p.waitForTimeout(500);
ok(!(await p.$eval('details.item', (d) => d.open)), 'soins : « Cleanings » se referme');

// le cas d'orthodontie : la ligne du temps se trace une fois la section visible
await p.locator('[data-case]').scrollIntoViewIfNeeded();
await p.waitForTimeout(2200);
const steps = await p.$$eval('.case__step', (s) => s.filter((x) => x.classList.contains('is-on')).length);
ok(steps === 3, `cas d'orthodontie : les 3 étapes affichées (${steps})`);
await p.screenshot({path: `${out}/i-case.png`});

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
await p.check('input[name="topic"][value="Something hurts"]', {force: true});
ok(!(await p.isHidden('[data-urgent-note]')), '« Something hurts » : la note propose d’appeler');
await p.check('input[name="topic"][value="Straightening my teeth"]', {force: true});
ok(await p.isHidden('[data-urgent-note]'), 'un autre sujet : la note se retire');
const mail = await catchMail(p);
const dec = decodeURIComponent(mail);
ok(mail.startsWith('mailto:Castordentalassociates@gmail.com?subject=Appointment%20request%3A%20Straightening%20my%20teeth'), `courriel : ${mail.slice(0, 96)}…`);
ok(dec.includes('Name: Jamie Example') && dec.includes('Phone: (239) 555-0100') && dec.includes('Email: jamie@example.com') && dec.includes('Best time: Tuesday morning'), 'le courriel reprend le nom, le téléphone, le courriel et le moment');
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
await ctx.close();

/* ——— mouvement réduit : pas d'ouverture, pas de défilement doux ——— */
ctx = await b.newContext({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
p = await open(ctx);
await p.waitForTimeout(300);
const rm = await p.evaluate(() => ({photo: getComputedStyle(document.querySelector('[data-photo]')).opacity, sign: getComputedStyle(document.querySelector('[data-sign]')).opacity, lenis: document.documentElement.classList.contains('lenis')}));
rm.anims = await running(p);
ok(+rm.photo === 1 && +rm.sign === 0 && rm.anims === 0 && !rm.lenis, `mouvement réduit : la photo tout de suite, aucune animation (${JSON.stringify(rm)})`);
await ctx.close();

/* ——— arrivée au milieu de la page (lien vers #visit) : pas d'ouverture ——— */
ctx = await b.newContext({viewport: {width: 1440, height: 900}});
p = await open(ctx, url + '#visit');
await p.waitForTimeout(400);
ok(+(await p.$eval('[data-photo]', (e) => getComputedStyle(e).opacity)) === 1 && (await running(p)) === 0, 'arrivée sur #visit : la façade est déjà là, sans ouverture');
await ctx.close();

/* ——— téléphone ——— */
ctx = await b.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2});
p = await open(ctx);
await p.waitForTimeout(2900);
ok(!(await p.$eval('[data-dock]', (d) => d.classList.contains('is-on'))), 'téléphone, en haut : pas de barre d’appel (les boutons sont à l’écran)');
await p.click('[data-menu-open]');
await p.waitForTimeout(300);
ok(!(await p.isHidden('#menu')) && (await p.getAttribute('[data-menu-open]', 'aria-expanded')) === 'true', 'menu ouvert');
ok((await p.evaluate(() => document.activeElement.matches('[data-menu-close]'))), 'menu : le focus va sur « Close »');
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
await p.click('.menu__nav a[href="#costs"]');
await p.waitForTimeout(1600);
const costsTop = await topOf(p, '#costs');
ok((await p.isHidden('#menu')) && Math.abs(costsTop - (await pad(p))) <= 2, `un lien du menu ferme le menu et amène « Costs » sous l’en-tête (${costsTop} px)`);
ok(await p.$eval('[data-dock]', (d) => d.classList.contains('is-on') && d.getAttribute('aria-hidden') === 'false'), 'au milieu de la page : la barre d’appel est là');
await p.screenshot({path: `${out}/i-dock.png`});
await p.click('[data-dock] a[href="#visit"]');
await p.waitForTimeout(1700);
ok(!(await p.$eval('[data-dock]', (d) => d.classList.contains('is-on'))), 'sur la section visite : la barre d’appel se retire');
ok((await p.$$eval('[data-dock] a', (as) => as.every((a) => a.tabIndex === -1))), 'barre retirée : ses liens sortent de la tabulation');
// les définitions au toucher
await p.locator('#straight .term').scrollIntoViewIfNeeded();
await p.waitForTimeout(400);
await p.tap('#straight .term');
await p.waitForTimeout(200);
ok(!(await p.isHidden('[data-def]')), 'au toucher : la définition de « lingual » s’ouvre');
const defBox = await p.$eval('[data-def]', (d) => {const r = d.getBoundingClientRect(); return [r.left, r.right];});
ok(defBox[0] >= 15 && defBox[1] <= 375, `elle tient dans l'écran (${defBox.map(Math.round).join('–')} px)`);
await p.screenshot({path: `${out}/i-term-m.png`});
await p.tap('h2#straight-title');
await p.waitForTimeout(200);
ok(await p.isHidden('[data-def]'), 'toucher ailleurs la ferme');
// la bande de l'équipe et le cas défilent de côté, sans faire déborder la page
for (const sel of ['.strip-wrap', '.case']) {
  const s = await p.$eval(sel, (e) => ({sw: e.scrollWidth, cw: e.clientWidth, ox: getComputedStyle(e).overflowX}));
  ok(s.sw > s.cw && /auto|scroll/.test(s.ox), `${sel} : défile de côté (${s.sw} px dans ${s.cw} px)`);
}
await ctx.close();

/* ——— débordements, de 320 à 1920 px ——— */
const widths = [320, 360, 375, 390, 414, 430, 600, 700, 768, 820, 960, 1024, 1100, 1280, 1366, 1440, 1600, 1920];
const over = [];
for (const w of widths) {
  ctx = await b.newContext({viewport: {width: w, height: 900}, isMobile: w < 960, hasTouch: w < 960});
  p = await open(ctx);
  await p.waitForTimeout(150);
  const o = await p.evaluate(() => {
    const doc = document.documentElement.scrollWidth - innerWidth;
    // un texte coupé net (sans retour à la ligne) qui dépasse de son bloc
    const cut = [...document.querySelectorAll('h1, h2, h3, p, a.btn, button, dt, dd, li, label, legend, figcaption, .board__name, .board__line')]
      .filter((e) => e.offsetParent && !e.closest('.strip, .case, [aria-hidden="true"]:not(.board)') && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX === 'visible' && e.clientWidth > 0)
      .map((e) => `${e.tagName.toLowerCase()}.${e.className || ''} « ${e.textContent.trim().slice(0, 30)} » ${e.scrollWidth}>${e.clientWidth}`);
    return {doc, cut: cut.slice(0, 4)};
  });
  if (o.doc > 0 || o.cut.length) over.push(`${w}px : page ${o.doc} px ${o.cut.join(' ; ')}`);
  await ctx.close();
}
ok(!over.length, over.length ? `débordements :\n   ${over.join('\n   ')}` : `aucun débordement sur ${widths.length} largeurs, de 320 à 1920 px`);

await b.close();
console.log(errs.length ? `erreurs de page : ${errs.join(' | ')}` : 'aucune erreur de page');
console.log(fails ? `${fails} échec(s)` : 'tout est bon');
process.exit(fails ? 1 : 0);
