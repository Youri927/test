// Essais des interactions, sur la version en ligne servie en local (dist-web, port 8798) :
//  - l'enfilade : le mode choisi selon l'écran, la hauteur de défilement égale à la longueur de la maison, la marche de
//    côté, la barre continue d'un mot à l'autre, l'arrivée (le mot monte, la barre file, la photo s'ouvre) ;
//  - l'en-tête : les liens amènent chaque pièce au bord gauche, la barre sous la pièce en cours, le focus au clavier ;
//  - le clavier : Tab sur un lien hors de l'écran le fait venir, les flèches gauche et droite avancent ;
//  - la recherche dans la page (window.find) fait venir le mot trouvé ;
//  - le cadre d'un détail sur sa grande photo, au survol ;
//  - la date de réponse, le formulaire (erreurs, e-mail rédigé, sujet choisi par « Ask about Palmer Avenue ») ;
//  - le passage d'un mode à l'autre en redimensionnant ;
//  - rien ne dépasse de l'écran, de 1 280 × 720 à 1 920 × 1 080 dans l'enfilade, et de 320 à 1 024 px de haut en bas ;
//  - le téléphone (menu, en-tête qui se range), la tablette tactile, le mouvement réduit, sans JavaScript ;
//  - le fichier unique (dist/index.html) : les photos intégrées s'affichent.
//   node tools/interact.mjs
import {createRequire} from 'node:module';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const URL_ = process.env.SITE || 'http://127.0.0.1:8798/';
const ONE = 'file://' + resolve(dirname(fileURLToPath(import.meta.url)), '../dist/index.html');
const b = await chromium.launch();
const errs = [];
let fails = 0;
let n = 0;
const ok = (cond, msg) => {
  n++;
  if (!cond) fails++;
  console.log(cond ? '✓' : '✗', msg);
};
const open = async (opts, url = URL_) => {
  const ctx = await b.newContext(opts);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url, {waitUntil: 'load'});
  return {ctx, p};
};
const rect = (p, sel) =>
  p.evaluate((s) => {
    const r = document.querySelector(s).getBoundingClientRect();
    return {l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, h: r.height};
  }, sel);
const settle = (p, ms = 2200) => p.waitForTimeout(ms);
const near = (a, b, d = 2) => Math.abs(a - b) <= d;
const DESK = {viewport: {width: 1440, height: 900}};

/* ——— l'enfilade, à 1 440 × 900 ——— */
{
  const {ctx, p} = await open(DESK);
  // l'arrivée : juste après la pose des polices, le mot est encore sous sa ligne et la photo pas encore ouverte
  await p.waitForFunction(() => document.querySelector('#design .frieze').classList.contains('is-seen'), null, {polling: 16});
  await p.waitForTimeout(120);
  const a0 = await p.evaluate(() => ({
    word: new DOMMatrix(getComputedStyle(document.querySelector('#design .frieze__word')).transform).m42,
    bar: new DOMMatrix(getComputedStyle(document.querySelector('#design .frieze__out')).transform).a,
    clip: getComputedStyle(document.querySelector('.plate--foyer .plate__frame')).clipPath,
  }));
  ok(a0.word > 4 && a0.bar < 0.9, `arrivée : « Design » monte de sous sa ligne (${Math.round(a0.word)} px) et la barre part (${a0.bar.toFixed(2)})`);
  await settle(p, 2400);
  const a1 = await p.evaluate(() => ({
    word: getComputedStyle(document.querySelector('#design .frieze__word')).transform,
    bar: getComputedStyle(document.querySelector('#design .frieze__out')).transform,
    clip: getComputedStyle(document.querySelector('.plate--foyer .plate__frame')).clipPath,
    vis: getComputedStyle(document.querySelector('.plate--foyer .plate__frame')).visibility,
  }));
  ok(a1.word === 'none' && a1.bar === 'none' && /inset\(0(px)?\)/.test(a1.clip) && a1.vis === 'visible', 'arrivée : le mot posé, la barre jusqu’au bout, la photo de l’entrée ouverte');

  const g = await p.evaluate(() => ({
    h: document.documentElement.classList.contains('h'),
    tw: document.querySelector('[data-track]').scrollWidth,
    sh: document.documentElement.scrollHeight,
    vw: innerWidth,
    vh: innerHeight,
  }));
  ok(g.h, 'grand écran en largeur, souris : l’enfilade');
  ok(near(g.sh - g.vh, g.tw - g.vw, 2), `la hauteur à défiler (${g.sh - g.vh} px) égale la longueur de la maison moins l’écran (${g.tw - g.vw} px)`);

  // la barre : du bout de « Design » jusqu'au B de « Build », sans rupture
  // (la barre de Build n'a pas encore paru : sa largeur se lit sans sa mise à l'échelle)
  const out1 = await rect(p, '#design .frieze__out');
  const in2 = await rect(p, '#build .frieze__in');
  in2.r = in2.l + (await p.evaluate(() => document.querySelector('#build .frieze__in').offsetWidth));
  const B = await rect(p, '#build .frieze__word');
  ok(near(out1.r, in2.l, 1.5) && near(out1.t, in2.t, 1) && near(out1.h, in2.h, 0.5), `la barre continue d’une pièce à l’autre (fin ${out1.r.toFixed(1)}, reprise ${in2.l.toFixed(1)})`);
  ok(B.l - in2.r >= -1 && B.l - in2.r < 12, `la barre entre dans le B de Build comme dans le E du logo (écart ${(B.l - in2.r).toFixed(1)} px avant la chasse du B)`);

  // la marche de côté
  await p.evaluate(() => window.scrollTo(0, 1000));
  await settle(p, 1800);
  const m = await p.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('[data-track]')).transform).m41);
  ok(near(m, -1000, 2), `descendre de 1 000 px fait avancer la maison de 1 000 px vers la gauche (${Math.round(m)})`);

  // les liens de l'en-tête amènent la pièce au bord gauche ; la barre passe sous son nom
  for (const id of ['live', 'homes', 'build']) {
    await p.click(`.top__nav a[href="#${id}"]`);
    await settle(p, 2600);
    const r = await rect(p, `#${id}`);
    const cur = await p.evaluate(() => document.querySelector('.top__nav [aria-current]')?.dataset.nav);
    const link = await rect(p, `.top__nav a[href="#${id}"]`);
    const bar = await rect(p, '.top__bar');
    ok(near(r.l, 0, 3) && cur === id && bar.l >= link.l - 1 && bar.r <= link.r + 1, `« ${id} » : la pièce au bord gauche (${Math.round(r.l)} px), le lien marqué, la barre sous son nom`);
  }
  // « Meet with Ryan » : la pièce du rendez-vous à l'écran, la barre du menu éteinte
  await p.click('.btn--top');
  await settle(p, 2600);
  const meet = await rect(p, '#meet');
  const barOn = await p.evaluate(() => document.querySelector('.top__bar').classList.contains('is-on'));
  ok(meet.l < 4 && meet.r > 600 && !barOn, `« Meet with Ryan » amène le rendez-vous (${Math.round(meet.l)} px), aucune pièce du menu n’est marquée`);
  // au bout, la fin touche le bord droit
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await settle(p, 1800);
  const end = await rect(p, '#end');
  ok(near(end.r, 1440, 2), `au bout, la fin s’arrête au bord droit de l’écran (${Math.round(end.r)})`);

  // au clavier : un lien de la construction, hors de l'écran, vient quand il prend le focus
  await p.evaluate(() => window.scrollTo(0, 0));
  await settle(p, 1600);
  await p.focus('.intro__cta .tel');
  let steps = 0;
  while (steps++ < 30) {
    await p.keyboard.press('Tab');
    if (await p.evaluate(() => document.activeElement.closest('.licenses'))) break;
  }
  await settle(p, 900);
  const lic = await p.evaluate(() => {
    const r = document.activeElement.getBoundingClientRect();
    return {l: r.left, r: r.right, txt: document.activeElement.textContent, sl: document.querySelector('[data-view]').scrollLeft};
  });
  ok(lic.l >= 0 && lic.r <= 1440 && lic.sl === 0, `Tab jusqu’à « ${lic.txt.trim()} » : le lien vient à l’écran (${Math.round(lic.l)}–${Math.round(lic.r)} px), la vue n’est pas décalée`);
  // les flèches avancent
  const y0 = await p.evaluate(() => scrollY);
  await p.evaluate(() => document.activeElement.blur());
  await p.keyboard.press('ArrowRight');
  await settle(p, 1400);
  const y1 = await p.evaluate(() => scrollY);
  ok(y1 - y0 > 300, `la flèche droite avance (${Math.round(y1 - y0)} px)`);
  // au clavier, un lien du menu donne le focus au titre de la pièce
  await p.focus('.top__nav a[href="#live"]');
  await p.keyboard.press('Enter');
  await settle(p, 2600);
  const foc = await p.evaluate(() => document.activeElement.id);
  ok(foc === 'live-title', `Entrée sur « Live » : le focus passe au titre de la pièce (${foc})`);

  // quand le navigateur décale la vue de côté (recherche dans la page, focus), le décalage passe au défilement
  await p.evaluate(() => window.scrollTo(0, 1000));
  await settle(p, 1500);
  await p.evaluate(() => (document.querySelector('[data-view]').scrollLeft = 600));
  await settle(p, 900);
  const moved = await p.evaluate(() => ({y: scrollY, sl: document.querySelector('[data-view]').scrollLeft, m: new DOMMatrix(getComputedStyle(document.querySelector('[data-track]')).transform).m41}));
  ok(near(moved.y, 1600, 2) && moved.sl === 0 && near(moved.m, -1600, 2), `un décalage de la vue (600 px, comme la recherche dans la page) passe au défilement : la maison avance d’autant, la vue revient à zéro`);

  // le détail : son cadre sur la grande photo
  await p.evaluate(() => window.scrollTo(0, 640));
  await settle(p, 1600);
  await p.hover('#design .details li:nth-child(3)');
  await p.waitForTimeout(450);
  const mk = await p.evaluate(() => {
    const m = document.querySelector('.plate--foyer .plate__mark');
    const f = document.querySelector('.plate--foyer .plate__frame').getBoundingClientRect();
    const r = m.getBoundingClientRect();
    return {op: +getComputedStyle(m).opacity, x: (r.left - f.left) / f.width, y: (r.top - f.top) / f.height, w: r.width / f.width};
  });
  // le chêne en chevrons : de 51 % à 73 % de la largeur, à partir de 73 % de la hauteur (l'image est agrandie de 7 %)
  ok(mk.op > 0.9 && mk.x > 0.45 && mk.x < 0.56 && mk.y > 0.68 && mk.w > 0.2 && mk.w < 0.26, `survol du chêne en chevrons : son cadre sur la photo de l’entrée (x ${mk.x.toFixed(2)}, y ${mk.y.toFixed(2)})`);
  await p.mouse.move(5, 5);
  await p.waitForTimeout(450);
  ok((await p.evaluate(() => +getComputedStyle(document.querySelector('.plate--foyer .plate__mark')).opacity)) < 0.1, 'le cadre disparaît quand la souris s’en va');

  // la date de réponse
  const reply = await p.evaluate(() => document.querySelector('[data-reply]').textContent);
  const when = reply.match(/by (\w+), (\w+) (\d+)/);
  let okDate = false;
  if (when) {
    const now = new Date(new Date().toLocaleString('en-US', {timeZone: 'America/New_York'}));
    const target = new Date(`${when[2]} ${when[3]}, ${now.getFullYear()}`);
    if (target < now) target.setFullYear(now.getFullYear() + 1);
    let wd = 0;
    for (let d = new Date(now); d < target; d.setDate(d.getDate() + 1)) if (d > now && d.getDay() % 6) wd++;
    okDate = wd >= 4 && wd <= 7 && target.toLocaleDateString('en-US', {weekday: 'long'}) === when[1];
  }
  ok(okDate, `la date de réponse : « ${reply} »`);

  // le formulaire
  await p.click('.home__end a[data-topic="palmer"]');
  await settle(p, 2600);
  const palmer = await p.evaluate(() => document.querySelector('input[name="topic"][value="palmer"]').checked);
  const meet2 = await rect(p, '#meet');
  ok(palmer && meet2.l < 4, '« Ask about Palmer Avenue » choisit le sujet et amène le rendez-vous');
  await p.click('.btn--send');
  const e1 = await p.evaluate(() => ({
    name: document.querySelector('#e-name').textContent,
    email: document.querySelector('#e-email').textContent,
    focus: document.activeElement.id,
    inv: document.querySelector('#f-name').getAttribute('aria-invalid'),
  }));
  ok(e1.name === 'Enter your name.' && e1.email === 'Enter your email address.' && e1.focus === 'f-name' && e1.inv === 'true', 'envoi vide : les deux erreurs, le focus sur le nom');
  await p.fill('#f-name', 'Pat Doe');
  await p.fill('#f-email', 'pat@example');
  await p.click('.btn--send');
  ok((await p.textContent('#e-email')).startsWith('Check your email address.'), 'e-mail incomplet : l’erreur dit quoi corriger');
  await p.fill('#f-email', 'pat@example.com');
  await p.fill('#f-phone', '407 555 0100');
  await p.fill('#f-msg', 'We own a lot near Lake Virginia.');
  await p.click('.btn--send');
  await p.waitForTimeout(300);
  const sent = await p.evaluate(() => ({vis: !document.querySelector('[data-sent]').hidden, href: document.querySelector('[data-sent]').dataset.mailto, focus: document.activeElement.matches('[data-sent]')}));
  const body = sent.href ? decodeURIComponent(sent.href) : '';
  ok(
    sent.vis && sent.focus && sent.href.startsWith('mailto:FeelyDev@gmail.com?subject=') && body.includes('Meeting request: the villa on Palmer Avenue') && body.includes('Phone: 407 555 0100') && body.includes('Lake Virginia'),
    'envoi : l’e-mail est rédigé pour Ryan (sujet, nom, e-mail, téléphone, message), la note reçoit le focus',
  );

  // du grand écran à une fenêtre étroite, et retour
  await p.setViewportSize({width: 900, height: 900});
  await settle(p, 1200);
  const v = await p.evaluate(() => ({h: document.documentElement.classList.contains('h'), t: document.querySelector('[data-track]').style.transform, sh: document.querySelector('[data-stage]').style.getPropertyValue('--stage-h')}));
  ok(!v.h && !v.t && !v.sh, 'fenêtre de 900 px : la page repasse de haut en bas, sans reste de l’enfilade');
  await p.setViewportSize({width: 1440, height: 900});
  await settle(p, 1400);
  const back = await p.evaluate(() => ({h: document.documentElement.classList.contains('h'), sh: document.documentElement.scrollHeight, tw: document.querySelector('[data-track]').scrollWidth}));
  ok(back.h && near(back.sh - 900, back.tw - 1440, 2), 'et de nouveau l’enfilade en revenant à 1 440 px');
  await ctx.close();
}

/* ——— rien ne dépasse du bas de l'écran, dans chaque pièce de l'enfilade ——— */
for (const [w, h] of [[1280, 720], [1366, 768], [1440, 900], [1536, 864], [1920, 1080], [2560, 1440]]) {
  const {ctx, p} = await open({viewport: {width: w, height: h}});
  await settle(p, 1500);
  const over = await p.evaluate(() => {
    const vh = innerHeight;
    const bad = [];
    for (const el of document.querySelectorAll('.track *')) {
      if (!el.getClientRects().length || el.closest('svg') || el.matches('.plate__mark')) continue;
      const r = el.getBoundingClientRect();
      if (r.height && r.bottom > vh + 1) bad.push(`${el.className || el.tagName} ${Math.round(r.bottom)}`);
      if (r.height && r.top < 0) bad.push(`${el.className || el.tagName} haut ${Math.round(r.top)}`);
    }
    // et rien ne passe sous l'en-tête
    const top = document.querySelector('.top').getBoundingClientRect().bottom;
    for (const el of document.querySelectorAll('.room > *')) {
      const r = el.getBoundingClientRect();
      if (r.height && r.top < top - 1 && !el.matches('.wall')) bad.push(`${el.className} sous l’en-tête ${Math.round(r.top)}`);
    }
    return [document.documentElement.classList.contains('h'), bad.slice(0, 4)];
  });
  ok(over[0] && !over[1].length, `${w} × ${h} : enfilade, et tout tient entre l’en-tête et le bas de l’écran${over[1].length ? ' — ' + over[1].join(', ') : ''}`);
  await ctx.close();
}

/* ——— de haut en bas : aucun débordement de côté ——— */
for (const [w, h, touch] of [[320, 640, true], [390, 844, true], [768, 1024, true], [1024, 768, true]]) {
  const {ctx, p} = await open({viewport: {width: w, height: h}, isMobile: touch, hasTouch: touch});
  await settle(p, 900);
  const r = await p.evaluate(() => ({h: document.documentElement.classList.contains('h'), sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}));
  ok(!r.h && r.sw <= r.cw, `${w} × ${h}${touch ? ' tactile' : ''} : de haut en bas, rien ne dépasse sur le côté (${r.sw} px pour ${r.cw})`);
  await ctx.close();
}

/* ——— le téléphone ——— */
{
  const {ctx, p} = await open({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true});
  await settle(p, 1200);
  await p.tap('.menu-btn');
  await p.waitForTimeout(300);
  const m1 = await p.evaluate(() => ({exp: document.querySelector('.menu-btn').getAttribute('aria-expanded'), hid: document.querySelector('#menu').hidden, inert: document.querySelector('[data-stage]').inert, focus: document.activeElement.closest('#menu') !== null}));
  ok(m1.exp === 'true' && !m1.hid && m1.inert && m1.focus, 'menu ouvert : le reste de la page est inerte, le focus dans le menu');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(200);
  const m2 = await p.evaluate(() => ({hid: document.querySelector('#menu').hidden, inert: document.querySelector('[data-stage]').inert, focus: document.activeElement.matches('.menu-btn')}));
  ok(m2.hid && !m2.inert && m2.focus, 'Échap ferme le menu et rend le focus au bouton');
  await p.tap('.menu-btn');
  await p.waitForTimeout(250);
  await p.tap('#menu a[href="#homes"]');
  await settle(p, 1800);
  const hm = await p.evaluate(() => ({hid: document.querySelector('#menu').hidden, t: document.querySelector('#homes').getBoundingClientRect().top}));
  ok(hm.hid && hm.t >= -2 && hm.t < 120, `un lien du menu le ferme et amène la pièce sous l’en-tête (${Math.round(hm.t)} px)`);
  // l'en-tête se range en descendant, revient en remontant
  await p.evaluate(() => window.scrollTo(0, 400));
  await p.waitForTimeout(300);
  await p.evaluate(() => window.scrollTo(0, 1200));
  await p.waitForTimeout(700);
  const hid = await p.evaluate(() => document.querySelector('.top').classList.contains('is-hidden'));
  await p.evaluate(() => window.scrollTo(0, 900));
  await p.waitForTimeout(700);
  const shown = await p.evaluate(() => !document.querySelector('.top').classList.contains('is-hidden'));
  ok(hid && shown, 'l’en-tête se range quand on descend et revient quand on remonte');
  // les cibles au doigt : aucune de moins de 44 px de haut, hors des liens pris dans une phrase
  const small = await p.evaluate(() =>
    [...document.querySelectorAll('a, button, input, textarea, label.chip')]
      .filter((el) => el.getClientRects().length && !el.closest('#menu[hidden]') && !el.closest('p:not(.intro__cta):not(.end__base)') && el.getBoundingClientRect().height < 44)
      .map((el) => el.textContent.trim().slice(0, 30)),
  );
  ok(!small.length, `au doigt, toutes les cibles font au moins 44 px de haut${small.length ? ' — ' + small.join(', ') : ''}`);
  await ctx.close();
}

/* ——— le mouvement réduit, sans JavaScript ——— */
{
  const {ctx, p} = await open({...DESK, reducedMotion: 'reduce'});
  await settle(p, 900);
  const r = await p.evaluate(() => ({h: document.documentElement.classList.contains('h'), lenis: document.documentElement.classList.contains('lenis'), word: getComputedStyle(document.querySelector('#build .frieze__word')).transform, clip: getComputedStyle(document.querySelector('.plate--house .plate__frame')).clipPath}));
  ok(!r.h && !r.lenis && r.word === 'none' && r.clip === 'none', 'réduire les animations : la page de haut en bas, sans défilement lissé, tout est déjà en place');
  await ctx.close();
}
{
  const {ctx, p} = await open({...DESK, javaScriptEnabled: false});
  const r = await p.evaluate(() => ({
    h: document.documentElement.classList.contains('h'),
    imgs: [...document.querySelectorAll('img')].every((i) => i.currentSrc || i.src),
    words: [...document.querySelectorAll('.frieze__word')].every((w) => getComputedStyle(w).transform === 'none'),
    reply: document.querySelector('[data-reply]').textContent,
  }));
  ok(!r.h && r.imgs && r.words && /five business days/.test(r.reply), 'sans JavaScript : la page de haut en bas, toutes les photos et la promesse des cinq jours ouvrés');
  await ctx.close();
}

/* ——— le fichier unique ——— */
{
  const {ctx, p} = await open(DESK, ONE);
  await settle(p, 1500);
  const r = await p.evaluate(async () => {
    const imgs = [...document.querySelectorAll('img')];
    for (const i of imgs) i.loading = 'eager';
    await Promise.race([Promise.all(imgs.map((i) => (i.complete ? 0 : new Promise((res) => i.addEventListener('load', res, {once: true}))))), new Promise((res) => setTimeout(res, 5000))]);
    return {n: imgs.length, okImgs: imgs.filter((i) => i.naturalWidth > 0).length, h: document.documentElement.classList.contains('h')};
  });
  ok(r.n === r.okImgs && r.n === 9 && r.h, `dist/index.html : les ${r.okImgs} photos intégrées s’affichent, et l’enfilade marche hors ligne`);
  await ctx.close();
}

await b.close();
console.log(`\n${n - fails}/${n} essais passés${errs.length ? '\nErreurs de la page : ' + errs.join(' | ') : ', aucune erreur dans la page'}`);
process.exit(fails || errs.length ? 1 : 0);
