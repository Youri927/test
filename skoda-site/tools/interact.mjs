// Essais des interactions : l'ouverture, le nom épinglé derrière les photos, les liens de l'en-tête, les étapes du
// terrain à la maison, l'histoire de la maison restaurée (ordinateur et téléphone), la visionneuse des pièces, le
// formulaire qui rédige l'e-mail, le menu du téléphone, le clavier, le mouvement réduit, et les débordements de 320 à
// 1920 px. Le site est lu depuis dist/index.html (fichier unique). Captures dans <dossier>.
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
const DESK = {viewport: {width: 1440, height: 900}};
const PHONE = {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true};
const scrollToEl = (p, sel, off = 0) =>
  p.evaluate(([sel, off]) => {
    const el = document.querySelector(sel);
    window.scrollTo(0, el.getBoundingClientRect().top + scrollY + off);
  }, [sel, off]);

/* ——— ordinateur ——— */
{
  const ctx = await b.newContext(DESK);
  const p = await open(ctx);
  await p.waitForTimeout(1800);
  ok(await p.evaluate(() => document.documentElement.classList.contains('is-ready')), 'ouverture : la page est prête (is-ready)');
  const letters = await p.$$eval('.name__word > span', (s) => s.map((e) => getComputedStyle(e).transform));
  ok(letters.length === 5 && letters.every((t) => t === 'none'), 'ouverture : les cinq lettres du nom sont montées');
  const fit = await p.evaluate(() => {
    const r = document.querySelector('.name__word').getBoundingClientRect();
    return {l: r.left, r: r.right, w: innerWidth};
  });
  ok(fit.l >= 40 && fit.r <= fit.w - 40, `le nom tient dans les marges (${Math.round(fit.l)} → ${Math.round(fit.r)} sur ${fit.w})`);
  await p.screenshot({path: `${out}/d-open.png`});

  // au milieu de l'accueil, le nom est centré dans l'écran et une photo passe devant lui
  await scrollToEl(p, '.flow__i--4', -300);
  await p.waitForTimeout(500);
  const mid = await p.evaluate(() => {
    const n = document.querySelector('.name__word').getBoundingClientRect();
    const top = document.querySelector('[data-top]').offsetHeight;
    const center = top + (innerHeight - top) / 2;
    return {c: n.top + n.height / 2, center};
  });
  ok(Math.abs(mid.c - mid.center) < 30, `le nom reste épinglé au milieu de l'écran (${Math.round(mid.c)} pour ${Math.round(mid.center)})`);
  const front = await p.evaluate(() => {
    const imgs = [...document.querySelectorAll('.flow img')];
    const n = document.querySelector('.name__word').getBoundingClientRect();
    for (const img of imgs) {
      const r = img.getBoundingClientRect();
      const x = Math.max(r.left, n.left) + 10, y = Math.max(r.top, n.top) + 10;
      if (x < Math.min(r.right, n.right) && y < Math.min(r.bottom, n.bottom)) return document.elementFromPoint(x, y) === img;
    }
    return null;
  });
  ok(front === true, 'une photo qui croise le nom passe devant lui');
  await p.screenshot({path: `${out}/d-flow.png`});

  // les liens de l'en-tête
  for (const [label, id] of [['Commercial', 'commercial'], ['Our family', 'family']]) {
    await p.click(`.nav a[href="#${id}"]`);
    await p.waitForTimeout(1500);
    const t = await p.$eval(`#${id}`, (e) => Math.round(e.getBoundingClientRect().top));
    ok(t >= 60 && t <= 110, `« ${label} » amène la partie sous l'en-tête (${t} px)`);
    ok(await p.$eval(`.nav a[href="#${id}"]`, (a) => a.getAttribute('aria-current') === 'true'), `« ${label} » est marqué comme partie courante`);
  }
  // la carte n'est pas dans le menu : plus aucun lien allumé
  await scrollToEl(p, '#area', 0);
  await p.waitForTimeout(900);
  ok((await p.$$eval('.nav a[aria-current]', (a) => a.length)) === 0, 'sur la carte, aucun lien du menu n’est marqué');

  // du terrain à la maison : les trois photos se découvrent
  await scrollToEl(p, '.steps', 0);
  await p.waitForTimeout(400);
  for (let i = 0; i < 3; i++) {
    await scrollToEl(p, `.steps__i:nth-child(${i + 1})`, -300);
    await p.waitForTimeout(500);
  }
  await p.waitForTimeout(1300);
  ok((await p.$$eval('.steps__i.is-in', (s) => s.length)) === 3, 'les trois étapes se sont découvertes');
  const sticky = await p.evaluate(() => getComputedStyle(document.querySelector('.homes .chapter__text')).position);
  ok(sticky === 'sticky', 'le texte des maisons reste en place pendant les photos');

  // l'histoire de la maison : le défilement fait passer le temps
  const at = async (f) => {
    await p.evaluate((f) => {
      const s = document.querySelector('[data-story]');
      const top = document.querySelector('[data-top]').offsetHeight;
      const run = s.offsetHeight - (innerHeight - top);
      window.scrollTo(0, s.getBoundingClientRect().top + scrollY - top + f * run);
    }, f);
    await p.waitForTimeout(1100);
    return p.evaluate(() => ({
      on: [...document.querySelectorAll('.story__step')].findIndex((s) => s.classList.contains('is-on')),
      p: +getComputedStyle(document.querySelector('[data-story]')).getPropertyValue('--p'),
      pinned: Math.round(document.querySelector('.story__pin').getBoundingClientRect().top),
    }));
  };
  let s = await at(0.1);
  ok(s.on === 0 && s.pinned === 76, `novembre 2022 au début (étape ${s.on}, épinglée à ${s.pinned} px)`);
  await p.screenshot({path: `${out}/d-story-0.png`});
  s = await at(0.5);
  ok(s.on === 1 && s.p > 0.45 && s.p < 0.55, `le séchage au milieu (étape ${s.on}, barre ${s.p.toFixed(2)})`);
  await p.screenshot({path: `${out}/d-story-1.png`});
  s = await at(0.95);
  ok(s.on === 2 && s.p > 0.9, `décembre 2023 à la fin (étape ${s.on}, barre ${s.p.toFixed(2)})`);
  await p.screenshot({path: `${out}/d-story-2.png`});
  const overlap = await p.evaluate(() => {
    const imgs = [...document.querySelectorAll('.story__step.is-on img')].map((i) => i.getBoundingClientRect());
    const copy = document.querySelector('.story__step.is-on .story__copy').getBoundingClientRect();
    const pin = document.querySelector('.story__pin').getBoundingClientRect();
    const hit = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
    return {copy: imgs.some((r) => hit(r, copy)), out: imgs.some((r) => r.bottom > pin.bottom + 1 || r.right > pin.right + 1)};
  });
  ok(!overlap.copy && !overlap.out, 'décembre 2023 : les photos ne couvrent pas le texte et restent dans le cadre');
  for (const f of [0.1, 0.5]) {
    await at(f);
    const o = await p.evaluate(() => {
      const imgs = [...document.querySelectorAll('.story__step.is-on img')].map((i) => i.getBoundingClientRect());
      const pin = document.querySelector('.story__pin').getBoundingClientRect();
      const hit = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
      let pairs = 0;
      for (let i = 0; i < imgs.length; i++) for (let j = i + 1; j < imgs.length; j++) if (hit(imgs[i], imgs[j])) pairs++;
      return {pairs, out: imgs.some((r) => r.bottom > pin.bottom + 1)};
    });
    ok(o.pairs === 0 && !o.out, `étape ${f === 0.1 ? 'novembre 2022' : 'séchage'} : photos sans chevauchement, dans le cadre`);
  }

  // la visionneuse des pièces
  await scrollToEl(p, '.rooms', -100);
  await p.waitForTimeout(600);
  await p.click('.r--b .ph');
  await p.waitForTimeout(500);
  let v = await p.evaluate(() => ({
    open: document.querySelector('[data-viewer]').open,
    count: document.querySelector('[data-viewer-count]').textContent,
    cap: document.querySelector('[data-viewer-cap]').textContent,
    w: document.querySelector('[data-viewer-img]').naturalWidth,
  }));
  ok(v.open && v.count === '2 of 12' && v.cap === 'A waterfall island in gray stone', `visionneuse ouverte sur la bonne photo (${v.count}, « ${v.cap} »)`);
  ok(v.w >= 1300, `la grande photo est la plus grande version (${v.w} px)`);
  await p.screenshot({path: `${out}/d-viewer.png`});
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(200);
  ok((await p.$eval('[data-viewer-count]', (e) => e.textContent)) === '3 of 12', 'flèche droite : photo suivante');
  await p.keyboard.press('ArrowLeft');
  await p.keyboard.press('ArrowLeft');
  await p.waitForTimeout(200);
  ok((await p.$eval('[data-viewer-count]', (e) => e.textContent)) === '1 of 12', 'flèche gauche : photo précédente');
  await p.keyboard.press('ArrowLeft');
  await p.waitForTimeout(200);
  ok((await p.$eval('[data-viewer-count]', (e) => e.textContent)) === '12 of 12', 'avant la première, la dernière');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  v = await p.evaluate(() => ({open: document.querySelector('[data-viewer]').open, focus: document.activeElement.closest('.r')?.className}));
  ok(!v.open && /r--b/.test(v.focus || ''), 'Échap ferme la visionneuse et rend le focus à la photo');

  // le formulaire
  await scrollToEl(p, '#consultation', -80);
  await p.waitForTimeout(600);
  await p.click('[data-form] button[type="submit"]');
  await p.waitForTimeout(200);
  let f = await p.evaluate(() => ({
    project: !document.getElementById('err-project').hidden,
    name: !document.getElementById('err-name').hidden,
    reach: !document.getElementById('err-reach').hidden,
    focus: document.activeElement.name,
    ready: !document.querySelector('[data-ready]').hidden,
  }));
  ok(f.project && f.name && f.reach && !f.ready, 'envoi vide : trois erreurs, pas de message');
  ok(f.focus === 'project', 'envoi vide : le focus va au premier champ en erreur');
  await p.screenshot({path: `${out}/d-form-errors.png`});
  const budgets = async (label) => {
    await p.click(`.chips label:has(input[value="${label}"])`);
    await p.waitForTimeout(100);
    return p.evaluate(() => ({hidden: document.querySelector('[data-budget]').hidden, list: [...document.querySelectorAll('[data-budget-list] input')].map((i) => i.value)}));
  };
  let bud = await budgets('Remodel');
  ok(!bud.hidden && bud.list[0] === '$250,000 to $500,000' && bud.list.length === 4, 'rénovation : leurs fourchettes de 250 000 $ à plus de 1 M$');
  bud = await budgets('New custom home');
  ok(!bud.hidden && bud.list[0] === '$1 million to $5 million' && bud.list[2] === '$10 million or more', 'maison neuve : de 1 M$ à plus de 10 M$');
  bud = await budgets('Storm damage restoration');
  ok(bud.hidden, 'tempête : pas de fourchette de budget');
  bud = await budgets('Building on my lot');
  ok(!bud.hidden && bud.list[0] === '$1 million to $5 million', 'construire sur mon terrain : les fourchettes des maisons neuves');
  await p.click('.chips label:has(input[value="$5 million to $10 million"])');
  await p.fill('#f-where', 'Sanibel');
  await p.fill('#f-name', 'Dana');
  await p.fill('#f-email', 'dana@example');
  await p.click('[data-form] button[type="submit"]');
  await p.waitForTimeout(200);
  f = await p.evaluate(() => ({reach: document.getElementById('err-reach').textContent, hidden: document.getElementById('err-reach').hidden, focus: document.activeElement.id}));
  ok(!f.hidden && /Check the email/.test(f.reach) && f.focus === 'f-email', 'e-mail mal formé : erreur précise, focus sur le champ');
  await p.fill('#f-email', 'dana@example.com');
  await p.fill('#f-phone', '(239) 555-0123');
  await p.fill('#f-msg', 'A four-bedroom home on our lot.');
  // l'ouverture de l'application d'e-mail est interceptée
  await p.evaluate(() => {
    window.__mailto = null;
    const set = Object.getOwnPropertyDescriptor(Location.prototype, 'href');
    document.addEventListener('click', () => {}, true);
  });
  const nav = p.waitForEvent('request', {predicate: (r) => r.url().startsWith('mailto:'), timeout: 1500}).catch(() => null);
  await p.click('[data-form] button[type="submit"]');
  await p.waitForTimeout(1600);
  f = await p.evaluate(() => ({ready: !document.querySelector('[data-ready]').hidden, text: document.querySelector('[data-ready-text]').textContent}));
  ok(f.ready, 'la demande est prête');
  ok(/To: skodabuilding@gmail\.com/.test(f.text) && /Subject: Consultation request: building on my lot in Sanibel/.test(f.text), 'le message est adressé et titré');
  ok(/Budget: \$5 million to \$10 million/.test(f.text) && /Name: Dana/.test(f.text) && /Phone: \(239\) 555-0123/.test(f.text) && /A four-bedroom home/.test(f.text), 'le message reprend les champs');
  await nav;
  await p.screenshot({path: `${out}/d-form-ready.png`});
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
  await p.click('[data-copy]');
  await p.waitForTimeout(300);
  ok(/^Copied/.test(await p.$eval('[data-copied]', (e) => e.textContent)), 'le bouton copie la demande');

  // le clavier : le lien d'évitement, sur une page fraîche (sans l'ancre laissée par les liens, qui déplacerait le
  // point de départ du Tab)
  await p.goto(url, {waitUntil: 'load'});
  await p.waitForTimeout(400);
  await p.keyboard.press('Tab');
  const skip = await p.evaluate(() => ({cls: document.activeElement.className, top: Math.round(document.activeElement.getBoundingClientRect().top)}));
  ok(skip.cls === 'skip' && skip.top >= 0, 'Tab : le lien « Skip to content » apparaît en premier');
  await ctx.close();
}

/* ——— téléphone ——— */
{
  const ctx = await b.newContext(PHONE);
  const p = await open(ctx);
  await p.waitForTimeout(1600);
  const fit = await p.evaluate(() => {
    const r = document.querySelector('.name__word').getBoundingClientRect();
    return {l: r.left, r: r.right, w: innerWidth};
  });
  ok(fit.l >= 14 && fit.r <= fit.w - 14, `téléphone : le nom tient dans l'écran (${Math.round(fit.l)} → ${Math.round(fit.r)})`);
  await p.screenshot({path: `${out}/m-open.png`});
  // le menu
  await p.tap('[data-menu]');
  await p.waitForTimeout(200);
  let m = await p.evaluate(() => ({open: !document.querySelector('[data-panel]').hidden, exp: document.querySelector('[data-menu]').getAttribute('aria-expanded'), label: document.querySelector('[data-menu]').textContent}));
  ok(m.open && m.exp === 'true' && m.label === 'Close', 'le menu s’ouvre (aria-expanded, « Close »)');
  await p.screenshot({path: `${out}/m-menu.png`});
  await p.tap('[data-panel] a[href="#restoration"]');
  await p.waitForTimeout(1600);
  m = await p.evaluate(() => ({open: !document.querySelector('[data-panel]').hidden, top: Math.round(document.getElementById('restoration').getBoundingClientRect().top)}));
  ok(!m.open && m.top >= 50 && m.top <= 90, `un lien du menu le ferme et amène la partie (${m.top} px)`);
  // l'histoire, en une colonne : les trois étapes visibles l'une après l'autre
  const st = await p.evaluate(() => [...document.querySelectorAll('.story__step')].map((s) => ({pos: getComputedStyle(s).position, vis: getComputedStyle(s).visibility})));
  ok(st.every((s) => s.pos === 'static' && s.vis === 'visible'), 'téléphone : l’histoire se lit en une colonne, sans épinglage');
  // les photos de dégâts ne sont jamais agrandies au-delà de leur taille
  const up = await p.$$eval('.story__media--before img', (im) => im.filter((i) => i.getBoundingClientRect().width > i.naturalWidth / 1 + 1 && i.naturalWidth < 700).map((i) => i.alt.slice(0, 30)));
  ok(up.length === 0, `téléphone : les petites photos de dégâts ne sont pas agrandies ${up.join(', ')}`);
  await scrollToEl(p, '#consultation', -60);
  await p.waitForTimeout(600);
  await p.screenshot({path: `${out}/m-form.png`});
  await ctx.close();
}

/* ——— mouvement réduit ——— */
{
  const ctx = await b.newContext({...DESK, reducedMotion: 'reduce'});
  const p = await open(ctx);
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => ({
    letters: [...document.querySelectorAll('.name__word > span')].every((e) => getComputedStyle(e).transform === 'none'),
    lenis: document.documentElement.classList.contains('lenis'),
  }));
  ok(r.letters, 'mouvement réduit : le nom est là d’emblée');
  ok(!r.lenis, 'mouvement réduit : pas de défilement amorti');
  const st = await p.evaluate(() => [...document.querySelectorAll('.story__step')].map((s) => ({pos: getComputedStyle(s).position, vis: getComputedStyle(s).visibility, h: s.getBoundingClientRect().height})));
  ok(st.every((x) => x.pos === 'static' && x.vis === 'visible' && x.h > 200), 'mouvement réduit : les trois étapes de l’histoire sont visibles, l’une sous l’autre');
  const imgs = await p.$$eval('.story img', (im) => im.filter((i) => getComputedStyle(i).opacity !== '1').length);
  ok(imgs === 0, 'mouvement réduit : toutes les photos de l’histoire sont visibles');
  await ctx.close();
}

/* ——— débordements, de 320 à 1920 px ——— */
for (const w of [320, 375, 414, 768, 1024, 1280, 1440, 1920]) {
  const ctx = await b.newContext({viewport: {width: w, height: 900}});
  const p = await open(ctx);
  await p.waitForTimeout(300);
  const o = await p.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const wide = [...document.querySelectorAll('body *')].filter((e) => {
      const r = e.getBoundingClientRect();
      // les tracés de la carte dépassent son cadre, qui les coupe : on mesure la carte elle-même, pas ses tracés
      return r.width > 0 && (r.right > W + 1 || r.left < -1) && !e.closest('.name, dialog, .skip') && !(e.closest('svg') && e.tagName !== 'svg');
    });
    return {W, sw: document.documentElement.scrollWidth, wide: wide.slice(0, 3).map((e) => `${e.tagName.toLowerCase()}.${e.getAttribute('class') || ''} (${Math.round(e.getBoundingClientRect().right)})`)};
  });
  ok(o.sw <= o.W && o.wide.length === 0, `${w} px : pas de débordement ${o.wide.join(', ')}`);
  await ctx.close();
}

/* ——— les images : toutes décrites, toutes chargées ——— */
{
  const ctx = await b.newContext(DESK);
  const p = await open(ctx);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 700) {
    await p.evaluate((y) => window.scrollTo(0, y), y);
    await p.waitForTimeout(60);
  }
  await p.waitForTimeout(800);
  const im = await p.$$eval('img', (all) => all.filter((i) => !i.closest('dialog')).map((i) => ({alt: i.alt, ok: i.complete && i.naturalWidth > 0})));
  ok(im.every((i) => i.alt && i.alt.length > 10), `${im.length} photos, toutes avec un texte de remplacement`);
  ok(im.every((i) => i.ok), 'toutes les photos sont chargées');
  await ctx.close();
}

ok(errs.length === 0, `aucune erreur dans la console ${errs.slice(0, 3).join(' | ')}`);
console.log(`\n${n - fails}/${n} essais réussis`);
await b.close();
process.exit(fails ? 1 : 0);
