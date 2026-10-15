// Essais des interactions : l'ouverture (le pignon de mots), les liens de l'en-tête, les trois toits (dessin qui se
// trace, onglets à la souris et au clavier, ligne de toit qui se transforme, repères reliés à la liste), les photos qui
// se découvrent, la règle des garanties, la ligne du temps, les questions, le formulaire qui rédige l'e-mail, le toit du
// pied de page, le menu du téléphone, le mouvement réduit, et les débordements de 320 à 1920 px. Le site est lu depuis
// dist/index.html (fichier unique). Captures dans <dossier>.
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
const ROOFS = {
  home: 'M90 250 L230 180 L300 215 L470 130 L590 190 L650 220 L710 250',
  mobile: 'M70 232 L180 229 L290 227 L400 226 L510 227 L620 229 L730 232',
  commercial: 'M60 196 L84 196 L84 224 L400 224 L716 224 L716 196 L740 196',
};
const state = (p) =>
  p.evaluate(() => {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    const sel = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
    const bar = document.querySelector('[data-bar]').getBoundingClientRect();
    const sr = sel.getBoundingClientRect();
    return {
      tab: sel.id,
      focus: document.activeElement.id,
      tabindex: tabs.map((t) => t.tabIndex).join(','),
      panels: [...document.querySelectorAll('[data-panel-of]')].filter((x) => !x.hidden).map((x) => x.dataset.panelOf),
      roof: document.querySelector('[data-roof]').getAttribute('d'),
      body: document.querySelector('[data-body]').getAttribute('d'),
      sets: [...document.querySelectorAll('[data-set].is-on')].map((g) => g.dataset.set + (g.hasAttribute('data-late') ? '+' : '')),
      dots: document.querySelectorAll('[data-dots] .dot').length,
      out: document.querySelector('[data-dots]').classList.contains('is-out'),
      bar: Math.abs(bar.left - sr.left) < 1.5 && Math.abs(bar.width - sr.width) < 1.5,
    };
  });

/* ——— ordinateur ——— */
{
  const ctx = await b.newContext(DESK);
  const p = await open(ctx);
  await p.waitForTimeout(2000);
  ok(await p.evaluate(() => document.documentElement.classList.contains('is-ready')), 'ouverture : la page est prête (is-ready)');
  const g = await p.evaluate(() => ({
    words: [...document.querySelectorAll('.gable__word')].map((w) => [getComputedStyle(w).opacity, getComputedStyle(w).transform]),
    lines: [...document.querySelectorAll('.gable__line')].map((l) => parseFloat(getComputedStyle(l).strokeDashoffset)),
    star: getComputedStyle(document.querySelector('.gable__star')).opacity,
  }));
  ok(g.words.every(([o, t]) => o === '1' && t === 'none') && g.lines.every((x) => x === 0) && g.star === '1', 'ouverture : les rampants tracés, les mots posés, l’étoile au faîte');
  const fit = await p.evaluate(() => {
    const ws = [...document.querySelectorAll('.gable__word')].map((w) => w.getBoundingClientRect());
    const h1 = document.querySelector('.gable__h1').getBoundingClientRect();
    // le titre est sous le toit : ses coins du haut sont sous les rampants (les mots sont posés dessus)
    const svg = document.querySelector('.gable__svg');
    const inv = svg.getScreenCTM().inverse();
    const toSvg = (x, y) => new DOMPoint(x, y).matrixTransform(inv);
    const rake = (x) => (x <= 600 ? 430 - (x - 40) * 0.5 : 430 - (1160 - x) * 0.5);
    // les lignes du texte (pas la boîte, plus large que l'encre)
    const r = document.createRange();
    r.selectNodeContents(document.querySelector('.gable__h1'));
    const lines = [...r.getClientRects()].filter((q) => q.width > 4).map((q) => [toSvg(q.left, q.top), toSvg(q.right, q.top)]);
    return {
      l: Math.min(...ws.map((w) => w.left)),
      r: Math.max(...ws.map((w) => w.right)),
      w: innerWidth,
      under: h1.width > 0 && lines.length > 0 && lines.every(([a, c]) => a.y > rake(a.x) + 4 && c.y > rake(c.x) + 4),
      inside: lines.every(([a, c]) => a.x > 40 && c.x < 1160),
    };
  });
  ok(fit.l >= 40 && fit.r <= fit.w - 40, `le pignon tient dans les marges (${Math.round(fit.l)} → ${Math.round(fit.r)} sur ${fit.w})`);
  ok(fit.under && fit.inside, 'le titre est sous le toit, entre les rampants');
  await p.screenshot({path: `${out}/d-open.png`});

  // les liens de l'en-tête
  for (const [label, id] of [['Roofs', 'roofs'], ['Our family', 'family']]) {
    await p.click(`.nav a[href="#${id}"]`);
    await p.waitForTimeout(1500);
    const t = await p.$eval(`#${id}`, (e) => Math.round(e.getBoundingClientRect().top));
    ok(t >= 60 && t <= 110, `« ${label} » amène la partie sous l'en-tête (${t} px)`);
    ok(await p.$eval(`.nav a[href="#${id}"]`, (a) => a.getAttribute('aria-current') === 'true'), `« ${label} » est marqué comme partie courante`);
  }
  await scrollToEl(p, '#area', 0);
  await p.waitForTimeout(900);
  ok((await p.$$eval('.nav a[aria-current]', (a) => a.length)) === 0, 'sur la zone, aucun lien du menu n’est marqué');

  // les trois toits : le dessin se trace la première fois qu'on le voit
  await p.goto(url, {waitUntil: 'load'});
  await p.waitForTimeout(600);
  const before = await p.evaluate(() => ({dash: document.querySelector('[data-roof]').style.strokeDasharray, op: document.querySelector('[data-body]').style.opacity}));
  ok(before.dash !== '' && before.op === '0', 'avant d’arriver aux toits, le dessin attend (ligne masquée, maison effacée)');
  await scrollToEl(p, '#roofs', -40);
  await p.waitForTimeout(700);
  const mid = await p.evaluate(() => document.querySelector('[data-roof]').getAnimations().length + document.querySelector('[data-body]').getAnimations().length);
  ok(mid >= 2, 'le dessin se trace : la ligne de toit, puis la maison');
  await p.waitForTimeout(2200);
  let s = await state(p);
  const after = await p.evaluate(() => ({dash: document.querySelector('[data-roof]').style.strokeDasharray, op: getComputedStyle(document.querySelector('[data-body]')).opacity}));
  ok(after.dash === '' && after.op === '1' && s.dots === 4 && s.tab === 'tab-home', 'le dessin est fini : la maison, sa ligne de toit, quatre repères');
  ok(s.roof === ROOFS.home && s.bar && s.panels.join() === 'home', 'au départ : les maisons, l’indicateur sous l’onglet');
  ok((await p.evaluate(() => getComputedStyle(document.querySelector('.profile')).position)) === 'sticky', 'le dessin reste sous les yeux pendant qu’on lit la liste');
  await p.screenshot({path: `${out}/d-roofs-home.png`});

  // les repères reliés à la liste
  await p.hover('#panel-home .spots li:nth-child(2)');
  await p.waitForTimeout(150);
  ok(await p.evaluate(() => document.querySelector('[data-dot="1"]').classList.contains('is-hot') && document.querySelector('#panel-home .spots li:nth-child(2)').classList.contains('is-hot')), 'survoler un point de la liste allume son repère sur le dessin');
  await p.hover('[data-dot="3"] .dot__n', {force: true});
  await p.waitForTimeout(150);
  ok(await p.evaluate(() => document.querySelector('#panel-home .spots li:nth-child(4)').classList.contains('is-hot') && !document.querySelector('[data-dot="1"]').classList.contains('is-hot')), 'survoler un repère allume sa ligne dans la liste');

  // à la souris : le mobile-home
  await p.click('#tab-mobile');
  await p.waitForTimeout(60);
  const moving = await p.evaluate(() => ({bar: document.querySelector('[data-bar]').getAnimations().length, out: document.querySelector('[data-dots]').classList.contains('is-out'), w: document.querySelector('[data-bar]').getAnimations()[0]?.effect.getKeyframes().map((k) => parseFloat(k.width))}));
  ok(moving.bar === 1 && moving.out, 'l’indicateur part, les repères s’effacent');
  ok(moving.w && moving.w[1] > moving.w[0] && moving.w[1] > moving.w[2], `l’indicateur s’étire jusqu’au nouvel onglet, puis le rejoint (${(moving.w || []).map(Math.round).join(' → ')} px)`);
  await p.waitForTimeout(320);
  const halfway = await p.evaluate(() => document.querySelector('[data-roof]').getAttribute('d'));
  ok(halfway !== ROOFS.home && halfway !== ROOFS.mobile, 'la ligne de toit se transforme (à mi-chemin)');
  await p.waitForTimeout(1100);
  s = await state(p);
  ok(s.roof === ROOFS.mobile && s.body.startsWith('M96 334 L96') && s.dots === 4 && !s.out, 'mobile-home : la ligne de toit basse, la caisse sur sa jupe, quatre repères');
  ok(s.sets.includes('mobile') && s.sets.includes('mobile+') && s.sets.length === 2, 'mobile-home : ses détails et les joints de la membrane');
  const shown = await p.evaluate(() => [...document.querySelectorAll('[data-set]')].filter((g) => +getComputedStyle(g).opacity > 0.01).map((g) => g.dataset.set));
  ok(shown.every((k) => k === 'mobile'), `mobile-home : plus rien de la maison à l’écran (${shown.join(', ')})`);
  ok(s.panels.join() === 'mobile' && s.bar && s.tab === 'tab-mobile', 'mobile-home : le bon panneau, l’indicateur sous l’onglet');
  await p.screenshot({path: `${out}/d-roofs-mobile.png`});

  // au clavier : flèches, début, fin (le choix suit le focus)
  await p.focus('#tab-mobile');
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(1300);
  s = await state(p);
  ok(s.tab === 'tab-commercial' && s.focus === 'tab-commercial' && s.tabindex === '-1,-1,0', 'flèche droite : le commercial, focus et tabindex suivent');
  ok(s.roof === ROOFS.commercial && s.body.includes('L60 196 L84 196') && s.sets.includes('commercial+'), 'commercial : le toit plat entre ses acrotères');
  await p.screenshot({path: `${out}/d-roofs-commercial.png`});
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(100);
  ok((await state(p)).tab === 'tab-home', 'après le dernier onglet, le premier');
  await p.keyboard.press('End');
  await p.waitForTimeout(100);
  ok((await state(p)).tab === 'tab-commercial', 'Fin : le dernier onglet');
  await p.keyboard.press('Home');
  await p.waitForTimeout(1400);
  s = await state(p);
  ok(s.tab === 'tab-home' && s.roof === ROOFS.home && s.dots === 4 && s.bar, 'Début : retour aux maisons, la ligne de toit d’origine');
  await p.keyboard.press('Tab');
  ok((await p.evaluate(() => document.activeElement.id)) === 'panel-home', 'Tab depuis les onglets : le panneau affiché');

  // les photos se découvrent à la pente du toit, une fois
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 450) {
    await p.evaluate((y) => window.scrollTo(0, y), y);
    await p.waitForTimeout(90);
  }
  await p.waitForTimeout(1500);
  const wipe = await p.evaluate(() =>
    [...document.querySelectorAll('.shot--wipe')].map((f) => ({in: f.classList.contains('is-in'), clip: getComputedStyle(f.querySelector('img')).clipPath, k: f.style.getPropertyValue('--k')})),
  );
  ok(wipe.length === 8 && wipe.every((w) => w.in && /^polygon\(0px 0(px|%)/.test(w.clip)), `les ${wipe.length} photos se sont découvertes`);
  ok(wipe.every((w) => parseFloat(w.k) > 40 && parseFloat(w.k) < 120), `le biais suit la pente 6/12 à la taille affichée (${wipe.map((w) => Math.round(parseFloat(w.k))).join(', ')} %)`);
  const once = await p.evaluate(() => ['[data-ruler]', '[data-line]', '[data-call]'].map((x) => document.querySelector(x).classList.contains('is-in')));
  // le numéro du pied de page est sous le toit : chaque ligne de texte sous les rampants
  const call = await p.evaluate(() => {
    const svg = document.querySelector('.call__gable');
    const inv = svg.getScreenCTM().inverse();
    const toSvg = (x, y) => new DOMPoint(x, y).matrixTransform(inv);
    const rake = (x) => (x <= 600 ? 320 - (x - 60) * 0.5 : 320 - (1140 - x) * 0.5);
    const lines = [...document.querySelectorAll('.call__text p')].flatMap((el) => {
      const r = document.createRange();
      r.selectNodeContents(el);
      // la hauteur des chiffres et des lettres, pas toute la boîte de la ligne
      return [...r.getClientRects()].filter((q) => q.width > 4).map((q) => [toSvg(q.left, q.top + q.height * 0.22), toSvg(q.right, q.top + q.height * 0.22)]);
    });
    return lines.every(([a, c]) => a.y > rake(a.x) + 2 && c.y > rake(c.x) + 2);
  });
  ok(call, 'pied de page : le numéro et ses deux lignes sont sous le toit, sans toucher les rampants');
  ok(once.every(Boolean), 'la règle des garanties, la ligne du temps et le toit du pied de page se sont tracés');
  const bars = await p.$$eval('.ruler__bar', (bs) => bs.map((x) => getComputedStyle(x).transform));
  ok(bars.every((t) => t === 'none'), 'les trois barres des garanties ont atteint leur durée');

  // les questions s'ouvrent en douceur
  await scrollToEl(p, '#faq', -80);
  await p.waitForTimeout(500);
  await p.click('.faq details:nth-of-type(3) summary');
  await p.waitForTimeout(60);
  let q = await p.evaluate(() => {
    const d = document.querySelector('.faq details:nth-of-type(3)');
    return {open: d.open, anim: d.getAnimations().length};
  });
  ok(q.open && q.anim === 1, 'une question s’ouvre en glissant');
  await p.waitForTimeout(600);
  q = await p.evaluate(() => {
    const d = document.querySelector('.faq details:nth-of-type(3)');
    return {open: d.open, h: d.getBoundingClientRect().height, p: d.querySelector('p').getBoundingClientRect().height};
  });
  ok(q.open && q.h > q.p + 40, 'la réponse est entièrement visible');
  await p.click('.faq details:nth-of-type(3) summary');
  await p.waitForTimeout(60);
  q = await p.evaluate(() => ({open: document.querySelector('.faq details:nth-of-type(3)').open, closing: document.querySelector('.faq details:nth-of-type(3)').classList.contains('is-closing')}));
  ok(q.open && q.closing, 'elle se referme en glissant (encore ouverte pendant le mouvement)');
  await p.waitForTimeout(600);
  ok(!(await p.evaluate(() => document.querySelector('.faq details:nth-of-type(3)').open)), 'puis elle est fermée');

  // le formulaire
  await scrollToEl(p, '#estimate', -80);
  await p.waitForTimeout(600);
  await p.click('[data-form] button[type="submit"]');
  await p.waitForTimeout(200);
  let f = await p.evaluate(() => ({
    kind: !document.getElementById('err-kind').hidden,
    address: !document.getElementById('err-address').hidden,
    name: !document.getElementById('err-name').hidden,
    reach: !document.getElementById('err-reach').hidden,
    focus: document.activeElement.name,
    ready: !document.querySelector('[data-ready]').hidden,
  }));
  ok(f.kind && f.address && f.name && f.reach && !f.ready, 'envoi vide : quatre erreurs, pas de message');
  ok(f.focus === 'kind', 'envoi vide : le focus va au premier champ en erreur');
  await p.screenshot({path: `${out}/d-form-errors.png`});
  await p.click('.chips label:has(input[value="Mobile home"])');
  await p.click('.chips label:has(input[value="Roof repair"])');
  ok(await p.evaluate(() => document.getElementById('err-kind').hidden), 'choisir le type de bien efface son erreur');
  await p.fill('#f-address', '123 Example Rd, Lakeland');
  await p.fill('#f-name', 'Dana');
  await p.fill('#f-email', 'dana@example');
  await p.click('[data-form] button[type="submit"]');
  await p.waitForTimeout(200);
  f = await p.evaluate(() => ({reach: document.getElementById('err-reach').textContent, hidden: document.getElementById('err-reach').hidden, focus: document.activeElement.id, addr: document.getElementById('err-address').hidden}));
  ok(!f.hidden && /Check the email/.test(f.reach) && f.focus === 'f-email' && f.addr, 'e-mail mal formé : erreur précise, focus sur le champ');
  await p.fill('#f-email', 'dana@example.com');
  await p.fill('#f-phone', '(863) 555-0123');
  await p.fill('#f-msg', 'A leak around the vent after the last storm.');
  const nav = p.waitForEvent('request', {predicate: (r) => r.url().startsWith('mailto:'), timeout: 1500}).catch(() => null);
  await p.click('[data-form] button[type="submit"]');
  const rise = await p.$eval('[data-ready]', (x) => x.getAnimations().length);
  await p.waitForTimeout(1600);
  f = await p.evaluate(() => ({ready: !document.querySelector('[data-ready]').hidden, text: document.querySelector('[data-ready-text]').textContent, focus: document.activeElement.matches('[data-ready]')}));
  ok(f.ready && rise === 1 && f.focus, 'la demande est prête, elle arrive en fondu et prend le focus');
  ok(/To: fivepointsroofingfl@gmail\.com/.test(f.text) && /Subject: Free estimate request: roof repair, mobile home/.test(f.text), 'le message est adressé et titré');
  ok(/Property: Mobile home/.test(f.text) && /Need: Roof repair/.test(f.text) && /Address: 123 Example Rd, Lakeland/.test(f.text) && /Phone: \(863\) 555-0123/.test(f.text) && /leak around the vent/.test(f.text), 'le message reprend les champs');
  const req = await nav;
  ok(!!req && /subject=Free%20estimate%20request/.test(req.url()), 'l’application d’e-mail est appelée avec le message');
  await p.screenshot({path: `${out}/d-form-ready.png`});
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
  await p.click('[data-copy]');
  await p.waitForTimeout(300);
  ok(/^Copied/.test(await p.$eval('[data-copied]', (e) => e.textContent)), 'le bouton copie la demande');

  // le bouton : au survol, l'or passe en travers
  await scrollToEl(p, '#top', 0);
  await p.waitForTimeout(400);
  const pos0 = await p.$eval('.hero .btn', (x) => getComputedStyle(x).backgroundPosition);
  await p.hover('.hero .btn');
  await p.waitForTimeout(700);
  const pos1 = await p.$eval('.hero .btn', (x) => ({bp: getComputedStyle(x).backgroundPosition, c: getComputedStyle(x).color}));
  ok(pos0 === '100% 50%' && pos1.bp === '0% 50%' && pos1.c === 'rgb(28, 30, 33)', 'survol d’un bouton : l’or passe en biais, le texte devient asphalte');

  // le clavier : le lien d'évitement, sur une page fraîche
  await p.goto(url, {waitUntil: 'load'});
  await p.waitForTimeout(400);
  await p.keyboard.press('Tab');
  const skip = await p.evaluate(() => ({cls: document.activeElement.className, top: Math.round(document.activeElement.getBoundingClientRect().top)}));
  ok(skip.cls === 'skip' && skip.top >= 0, 'Tab : le lien « Skip to content » apparaît en premier');
  await ctx.close();
}

/* ——— 1100 à 1280 px : l'en-tête tient sur une ligne ——— */
for (const w of [1100, 1180, 1280]) {
  const ctx = await b.newContext({viewport: {width: w, height: 800}});
  const p = await open(ctx);
  await p.waitForTimeout(300);
  const h = await p.evaluate(() => {
    const items = [...document.querySelectorAll('.top__in > *')].filter((e) => getComputedStyle(e).display !== 'none');
    const rs = items.map((e) => e.getBoundingClientRect());
    const tops = new Set(rs.map((r) => Math.round(r.top + r.height / 2)));
    let overlap = false;
    for (let i = 1; i < rs.length; i++) if (rs[i].left < rs[i - 1].right - 1) overlap = true;
    return {lines: tops.size, overlap, h: document.querySelector('[data-top]').offsetHeight};
  });
  ok(h.lines === 1 && !h.overlap && h.h <= 80, `${w} px : l’en-tête tient sur une ligne, rien ne se chevauche`);
  await ctx.close();
}

/* ——— de 1000 à 1920 px : le titre et le numéro restent sous leurs toits ——— */
for (const w of [1000, 1024, 1280, 1680, 1920]) {
  const ctx = await b.newContext({viewport: {width: w, height: 900}});
  const p = await open(ctx);
  await p.waitForTimeout(400);
  const under = await p.evaluate(() => {
    const check = (svgSel, textSel, x0, y0, x1, yTop, k) => {
      const svg = document.querySelector(svgSel);
      const inv = svg.getScreenCTM().inverse();
      const toSvg = (x, y) => new DOMPoint(x, y).matrixTransform(inv);
      const mid = (x0 + x1) / 2;
      const rake = (x) => (x <= mid ? y0 - (x - x0) * 0.5 : y0 - (x1 - x) * 0.5);
      const lines = [...document.querySelectorAll(textSel)].flatMap((el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        return [...r.getClientRects()].filter((q) => q.width > 4).map((q) => [toSvg(q.left, q.top + q.height * k), toSvg(q.right, q.top + q.height * k)]);
      });
      return lines.length > 0 && lines.every(([a, c]) => a.y > rake(a.x) + 2 && c.y > rake(c.x) + 2);
    };
    const callAbs = getComputedStyle(document.querySelector('.call__text')).position === 'absolute';
    return {hero: check('.gable__svg', '.gable__h1', 40, 430, 1160, 150, 0), call: !callAbs || check('.call__gable', '.call__text p', 60, 320, 1140, 50, 0.22)};
  });
  ok(under.hero && under.call, `${w} px : le titre sous le toit de l'accueil, le numéro sous celui du pied de page`);
  await ctx.close();
}

/* ——— téléphone ——— */
{
  const ctx = await b.newContext(PHONE);
  const p = await open(ctx);
  await p.waitForTimeout(1800);
  const fit = await p.evaluate(() => {
    const ws = [...document.querySelectorAll('.gable__word')].map((w) => w.getBoundingClientRect());
    return {l: Math.min(...ws.map((w) => w.left)), r: Math.max(...ws.map((w) => w.right)), w: innerWidth};
  });
  ok(fit.l >= 10 && fit.r <= fit.w - 10, `téléphone : le pignon tient dans l'écran (${Math.round(fit.l)} → ${Math.round(fit.r)})`);
  await p.screenshot({path: `${out}/m-open.png`});
  // le menu
  await p.tap('[data-menu]');
  await p.waitForTimeout(200);
  let m = await p.evaluate(() => ({open: !document.querySelector('[data-panel]').hidden, exp: document.querySelector('[data-menu]').getAttribute('aria-expanded'), label: document.querySelector('[data-menu]').textContent}));
  ok(m.open && m.exp === 'true' && m.label === 'Close', 'le menu s’ouvre (aria-expanded, « Close »)');
  await p.screenshot({path: `${out}/m-menu.png`});
  await p.tap('[data-panel] a[href="#warranty"]');
  await p.waitForTimeout(1600);
  m = await p.evaluate(() => ({open: !document.querySelector('[data-panel]').hidden, top: Math.round(document.getElementById('warranty').getBoundingClientRect().top)}));
  ok(!m.open && m.top >= 50 && m.top <= 90, `un lien du menu le ferme et amène la partie (${m.top} px)`);
  // les toits : les onglets sur une ligne, des repères assez grands pour le doigt et l'œil
  await scrollToEl(p, '#roofs', 0);
  await p.waitForTimeout(2600);
  const t = await p.evaluate(() => {
    const tops = new Set([...document.querySelectorAll('[role="tab"]')].map((x) => Math.round(x.getBoundingClientRect().top)));
    const c = document.querySelector('[data-dots] .dot__n');
    return {rows: tops.size, r: c.getBoundingClientRect().width / 2, min: Math.min(...[...document.querySelectorAll('[role="tab"]')].map((x) => x.getBoundingClientRect().height))};
  });
  ok(t.rows === 1 && t.min >= 44, `téléphone : les trois onglets sur une ligne, ${Math.round(t.min)} px de haut`);
  ok(t.r >= 12, `téléphone : les repères gardent ${t.r.toFixed(1)} px de rayon`);
  await p.tap('#tab-commercial');
  await p.waitForTimeout(1400);
  ok((await state(p)).roof === ROOFS.commercial, 'téléphone : le commercial au doigt');
  await p.screenshot({path: `${out}/m-roofs.png`});
  // la rangée de photos se fait défiler du doigt
  await scrollToEl(p, '.job', -200);
  await p.waitForTimeout(1500);
  const job = await p.evaluate(() => {
    const j = document.querySelector('.job');
    return {scroll: j.scrollWidth > j.clientWidth, tab: j.getAttribute('tabindex'), snap: getComputedStyle(j).scrollSnapType};
  });
  ok(job.scroll && job.tab === '0' && /x/.test(job.snap), 'téléphone : la rangée de photos défile du doigt, avec arrêts, et prend le focus du clavier');
  await p.evaluate(() => document.querySelector('.job').scrollTo({left: 9999}));
  await p.waitForTimeout(1600);
  ok(await p.evaluate(() => document.querySelector('.job li:last-child .shot--wipe').classList.contains('is-in')), 'téléphone : la dernière photo de la rangée se découvre quand on y arrive');
  // aucune photo agrandie au-delà de sa taille
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 700) {
    await p.evaluate((y) => window.scrollTo(0, y), y);
    await p.waitForTimeout(60);
  }
  const up = await p.$$eval('img', (im) => im.filter((i) => i.getBoundingClientRect().width > i.naturalWidth + 1).map((i) => i.alt.slice(0, 30)));
  ok(up.length === 0, `téléphone : aucune photo agrandie au-delà de sa taille ${up.join(', ')}`);
  await scrollToEl(p, '#estimate', -60);
  await p.waitForTimeout(600);
  await p.screenshot({path: `${out}/m-form.png`});
  await scrollToEl(p, '.foot', 0);
  await p.waitForTimeout(1800);
  await p.screenshot({path: `${out}/m-foot.png`});
  await ctx.close();
}

/* ——— mouvement réduit ——— */
{
  const ctx = await b.newContext({...DESK, reducedMotion: 'reduce'});
  const p = await open(ctx);
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => ({
    words: [...document.querySelectorAll('.gable__word')].every((e) => getComputedStyle(e).opacity === '1' && getComputedStyle(e).transform === 'none'),
    lines: [...document.querySelectorAll('.gable__line')].every((l) => parseFloat(getComputedStyle(l).strokeDashoffset) === 0),
    lenis: document.documentElement.classList.contains('lenis'),
    roof: document.querySelector('[data-roof]').style.strokeDasharray,
  }));
  ok(r.words && r.lines, 'mouvement réduit : le pignon est là d’emblée');
  ok(!r.lenis, 'mouvement réduit : pas de défilement amorti');
  ok(r.roof === '', 'mouvement réduit : le dessin des toits est entier, sans tracé');
  const imgs = await p.$$eval('.shot--wipe img', (im) => im.filter((i) => getComputedStyle(i).clipPath !== 'none').length);
  ok(imgs === 0, 'mouvement réduit : toutes les photos sont visibles, sans biais');
  await scrollToEl(p, '#roofs', 0);
  await p.click('#tab-commercial');
  const calm = await p.evaluate(() => ({
    roof: document.querySelector('[data-roof]').getAttribute('d'),
    // (la règle du mouvement réduit donne 0,01 ms de transition à tout : on ne compte que les vrais mouvements)
    moves: [document.querySelector('[data-bar]'), document.querySelector('[data-panel-of="commercial"]')].flatMap((e) => e.getAnimations()).filter((a) => a.effect.getTiming().duration > 1).length,
    dots: document.querySelectorAll('[data-dots] .dot').length,
  }));
  ok(calm.roof === ROOFS.commercial && calm.moves === 0 && calm.dots === 4, 'mouvement réduit : le toit change d’un coup, sans glisser');
  await scrollToEl(p, '#faq', 0);
  await p.click('.faq details:nth-of-type(1) summary');
  const faq = await p.evaluate(() => ({open: document.querySelector('.faq details').open, anim: document.querySelector('.faq details').getAnimations().filter((a) => a.effect.getTiming().duration > 1).length}));
  ok(faq.open && faq.anim === 0, 'mouvement réduit : la question s’ouvre sans glisser');
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
      // la rangée de photos défile d'elle-même au téléphone : ses photos dépassent, dans son cadre
      return r.width > 0 && (r.right > W + 1 || r.left < -1) && !e.closest('.skip, .job li') && !(e.closest('svg') && e.tagName !== 'svg');
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
  for (let y = 0; y < H; y += 600) {
    await p.evaluate((y) => window.scrollTo(0, y), y);
    await p.waitForTimeout(80);
  }
  await p.waitForTimeout(900);
  const im = await p.$$eval('img', (all) => all.map((i) => ({alt: i.alt, ok: i.complete && i.naturalWidth > 0})));
  ok(im.every((i) => i.alt && i.alt.length > 10), `${im.length} photos, toutes avec un texte de remplacement`);
  ok(im.every((i) => i.ok), 'toutes les photos sont chargées');
  await ctx.close();
}

ok(errs.length === 0, `aucune erreur dans la console ${errs.slice(0, 3).join(' | ')}`);
console.log(`\n${n - fails}/${n} essais réussis`);
await b.close();
process.exit(fails ? 1 : 0);
