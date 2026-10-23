// Essais des interactions : l'arrivée (les mots montent, le « + » se trace, les deux moitiés s'ouvrent depuis le « + »),
// Lenis, l'accueil qui se recolle au défilement (la place exacte des deux moitiés au départ et à la fin), l'en-tête
// (liens, se range et revient), les six maisons (le nom, la scène, les vignettes, le repère), la visionneuse (ouverte sur
// la photo touchée, clavier, retour du focus, jamais agrandie), le choix terrain + maison qui remplit la demande, les
// boutons des packages, de la rénovation et des maisons, le formulaire qui rédige l'e-mail, les apparitions, le menu et
// l'accordéon du téléphone, la visionneuse au doigt, le mouvement réduit, sans JavaScript, et les débordements de 320 à
// 1920 px. Le site est lu depuis dist/index.html (fichier unique).
//   node tools/interact.mjs <dossier des captures>
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'shots';
mkdirSync(out, {recursive: true});
const url = 'file://' + resolve(dirname(fileURLToPath(import.meta.url)), '../dist/index.html');
const b = await chromium.launch();
const errs = [];
let fails = 0;
let n = 0;
const ok = (cond, msg) => {
  n++;
  if (!cond) fails++;
  console.log(cond ? '✓' : '✗', msg);
};
const open = async (ctx) => {
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url, {waitUntil: 'load'});
  return p;
};
const DESK = {viewport: {width: 1440, height: 900}};
const PHONE = {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true};
// ce que montre chacune des deux moitiés, à l'écran : sa boîte transformée moins sa découpe
const halves = (p) =>
  p.evaluate(() =>
    [...document.querySelectorAll('.hero__half')].map((h) => {
      const r = h.getBoundingClientRect();
      const s = r.width / h.offsetWidth;
      // inset() s'écrit en 1 à 4 valeurs, comme margin : le navigateur l'abrège quand les côtés sont égaux
      const m = (h.style.clipPath.match(/-?[\d.]+px/g) || []).map(parseFloat);
      const [t, ri, bo, l] = m.length === 4 ? m : m.length === 3 ? [m[0], m[1], m[2], m[1]] : m.length === 2 ? [m[0], m[1], m[0], m[1]] : m.length === 1 ? [m[0], m[0], m[0], m[0]] : [0, 0, 0, 0];
      return {x0: Math.round(r.left + l * s), x1: Math.round(r.right - ri * s), y0: Math.round(r.top + t * s), y1: Math.round(r.bottom - bo * s), vis: getComputedStyle(h).visibility};
    }),
  );
const box = (p, sel) => p.evaluate((s) => {
  const r = document.querySelector(s).getBoundingClientRect();
  return {x0: Math.round(r.left), x1: Math.round(r.right), y0: Math.round(r.top), y1: Math.round(r.bottom)};
}, sel);
const near = (a, b, d = 3) => Math.abs(a - b) <= d;
// descend toute la page pour jouer les apparitions
const walk = async (p, step = 420, pause = 110) => {
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += step) {
    await p.evaluate((yy) => window.scrollTo(0, yy), y);
    await p.waitForTimeout(pause);
  }
  await p.waitForTimeout(1600);
};

/* ——— ordinateur ——— */
{
  const ctx = await b.newContext(DESK);
  const p = await open(ctx);
  // l'arrivée
  await p.waitForTimeout(140);
  const a0 = await p.evaluate(() => ({
    cls: document.querySelector('.hero').className,
    word: getComputedStyle(document.querySelector('.hero__word > span')).transform,
    dash: +getComputedStyle(document.querySelector('.hero__plus path')).strokeDashoffset.replace('px', ''),
  }));
  const ty = (m) => (m === 'none' ? 0 : +m.split(',')[5].replace(')', ''));
  ok(/is-in/.test(a0.cls) && !/is-pre/.test(a0.cls) && ty(a0.word) > 5 && a0.dash > 0.2, `arrivée : les mots montent de sous leur ligne (encore ${Math.round(ty(a0.word))} px) et le « + » se trace`);
  const h0 = await halves(p);
  await p.waitForTimeout(2300);
  const bx = await box(p, '.hero__box');
  const h1 = await halves(p);
  const gap = h1[1].x0 - h1[0].x1;
  ok(h0[0].x1 - h0[0].x0 < (h1[0].x1 - h1[0].x0) * 0.6, `arrivée : les deux moitiés s'ouvrent depuis le « + » (${h0[0].x1 - h0[0].x0} px puis ${h1[0].x1 - h1[0].x0} px)`);
  ok(near(h1[0].x0, bx.x0) && near(h1[1].x1, bx.x1) && near(h1[0].y0, bx.y0) && near(h1[0].y1, bx.y1) && near(h1[0].x1 + gap / 2, 720, 2) && gap > 50 && h1[0].vis === 'visible', `au repos : les deux moitiés remplissent la boîte (${h1[0].x0}–${h1[1].x1} × ${h1[0].y0}–${h1[0].y1}), écartées de ${gap} px autour du milieu`);
  const plus = await box(p, '.hero__plus');
  ok(near((plus.x0 + plus.x1) / 2, 720, 2), 'au repos : le « + » est au-dessus de l’écart entre les deux moitiés');
  ok(/lenis/.test(await p.evaluate(() => document.documentElement.className)), 'Lenis : le défilement doux est actif');
  await p.screenshot({path: `${out}/d-accueil.png`});
  // le défilement : à mi-course, puis recollées et plein cadre
  const run = await p.evaluate(() => document.querySelector('.hero').offsetHeight - document.querySelector('.hero__stage').offsetHeight);
  await p.evaluate((y) => window.scrollTo(0, y), Math.round(run / 2));
  await p.waitForTimeout(900);
  const hm = await halves(p);
  const em = await p.evaluate(() => +getComputedStyle(document.querySelector('.hero')).getPropertyValue('--e'));
  ok(em > 0.35 && em < 0.65 && hm[1].x0 - hm[0].x1 < gap && hm[0].x0 < h1[0].x0, `défilement : à mi-course l’écart se resserre (${hm[1].x0 - hm[0].x1} px) et la photo s’agrandit (e = ${em})`);
  await p.evaluate((y) => window.scrollTo(0, y), run);
  await p.waitForTimeout(900);
  const he = await halves(p);
  const end = await p.evaluate(() => ({
    e: +getComputedStyle(document.querySelector('.hero')).getPropertyValue('--e'),
    cap: +getComputedStyle(document.querySelector('.hero__cap')).opacity,
    words: +getComputedStyle(document.querySelector('.hero__words')).opacity,
    up: document.querySelector('.top').classList.contains('is-up'),
  }));
  ok(end.e === 1 && he[0].x0 <= 0 && he[1].x1 >= 1440 && he[0].y0 <= 0 && he[0].y1 >= 900 && near(he[0].x1, he[1].x0, 2), `défilement : recollées, plein cadre (${he[0].x0}–${he[1].x1} × ${he[0].y0}–${he[0].y1})`);
  ok(end.cap === 1 && end.words === 0, 'défilement : la légende « Oakes Estate Home » paraît, les mots se sont effacés');
  ok(end.up, 'en-tête : il se range quand on descend');
  await p.screenshot({path: `${out}/d-recollee.png`});
  await p.evaluate((y) => window.scrollTo(0, y), run - 300);
  await p.waitForTimeout(700);
  ok(!(await p.evaluate(() => document.querySelector('.top').classList.contains('is-up'))), 'en-tête : il revient quand on remonte');
  // les liens de l'en-tête
  await p.click('.nav__list a[href="#homes"]');
  await p.waitForTimeout(1900);
  const th = await p.evaluate(() => Math.round(document.getElementById('homes').getBoundingClientRect().top));
  ok(near(th, 76, 12), `en-tête : « Homes » amène les maisons sous l’en-tête (${th} px)`);

  // les six maisons
  const villa = await p.evaluate(() => {
    document.getElementById('hb-villa').click();
    return null;
  });
  await p.waitForTimeout(800);
  const v1 = await p.evaluate(() => ({
    exp: [...document.querySelectorAll('.home__btn')].map((x) => x.getAttribute('aria-expanded')).join(),
    open: [...document.querySelectorAll('.home__panel.is-open')].map((x) => x.id).join(),
    inert: [...document.querySelectorAll('.home__panel')].filter((x) => x.inert).length,
    vis: getComputedStyle(document.getElementById('hp-park')).visibility,
    my: getComputedStyle(document.querySelector('[data-homes]')).getPropertyValue('--my'),
    btn: Math.round(document.getElementById('hb-villa').getBoundingClientRect().top - document.querySelector('[data-homes]').getBoundingClientRect().top),
  }));
  ok(v1.exp === 'false,true,false,false,false,false' && v1.open === 'hp-villa' && v1.inert === 5 && v1.vis === 'hidden', 'maisons : choisir « Villa Estate Home » ouvre sa scène et ferme les autres (inertes)');
  ok(parseFloat(v1.my) > v1.btn && parseFloat(v1.my) < v1.btn + 60, `maisons : le chevron du logo glisse devant le nom choisi (${v1.my})`);
  await p.click('#hp-villa .thumb[data-at="2"]');
  await p.waitForTimeout(900);
  const v2 = await p.evaluate(() => ({
    cap: document.getElementById('hc-villa').textContent,
    count: document.querySelector('#hp-villa [data-count]').textContent,
    pressed: [...document.querySelectorAll('#hp-villa .thumb')].map((t) => t.getAttribute('aria-pressed')).join(),
    imgs: document.querySelectorAll('#hp-villa .home__photo img').length,
  }));
  ok(v2.count === '3 of 6' && /double doors in leaded glass/.test(v2.cap) && v2.pressed === 'false,false,true,false,false,false' && v2.imgs === 1, `maisons : la vignette 3 change la photo, sa légende et le rang (« ${v2.count} »)`);
  await p.screenshot({path: `${out}/d-maisons.png`});
  // la visionneuse
  await p.click('#hp-villa .home__photo');
  await p.waitForTimeout(900);
  const w1 = await p.evaluate(() => {
    const img = document.querySelector('.viewer__frame img:last-child');
    return {open: document.querySelector('.viewer').open, title: document.getElementById('viewer-title').textContent, count: document.querySelector('.viewer__count').textContent, cap: document.querySelector('.viewer__cap').textContent, w: img.getBoundingClientRect().width, nat: img.naturalWidth};
  });
  ok(w1.open && w1.title === 'Villa Estate Home' && w1.count === '3 of 6' && /leaded glass/.test(w1.cap), `visionneuse : ouverte sur la photo touchée (« ${w1.title} », ${w1.count})`);
  ok(w1.w <= w1.nat + 1, `visionneuse : la photo n’est jamais plus grande que son fichier (${Math.round(w1.w)} px pour ${w1.nat})`);
  await p.screenshot({path: `${out}/d-visionneuse.png`});
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(600);
  const w2 = await p.evaluate(() => document.querySelector('.viewer__count').textContent);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(700);
  const w3 = await p.evaluate(() => ({open: document.querySelector('.viewer').open, focus: document.activeElement.closest('#hp-villa .home__photo') !== null, count: document.querySelector('#hp-villa [data-count]').textContent, locked: document.documentElement.classList.contains('is-locked')}));
  ok(w2 === '4 of 6' && !w3.open && w3.focus && !w3.locked, 'visionneuse : la flèche avance, Échap ferme, le focus revient sur la photo, la page défile de nouveau');
  ok(w3.count === '4 of 6', 'visionneuse : la scène reprend la dernière photo vue');

  // le choix terrain + maison
  await p.evaluate(() => document.getElementById('how').scrollIntoView());
  await p.waitForTimeout(900);
  await p.click('.opt:has(input[value="lots"])');
  await p.click('.opt:has(input[value="plans"])');
  const c1 = await p.evaluate(() => ({sum: document.getElementById('choose-sum').textContent, btn: document.querySelector('[data-start]').textContent}));
  ok(c1.sum === 'Your starting point: one of our lots + one of our proven plans.' && c1.btn === 'Ask about this starting point', `choix : « ${c1.sum} »`);
  await p.click('[data-start]');
  await p.waitForTimeout(1900);
  const c2 = await p.evaluate(() => ({
    topic: document.querySelector('input[name="topic"]:checked').value,
    lot: document.getElementById('f-lot').value,
    plan: document.getElementById('f-plan').value,
    top: Math.round(document.getElementById('consultation').getBoundingClientRect().top),
  }));
  ok(c2.topic === 'home' && c2.lot === 'lots' && c2.plan === 'plans' && near(c2.top, 76, 14), `choix : « Ask about this starting point » remplit la demande (terrain, maison) et y amène (${c2.top} px)`);
  // la rénovation, puis les agents
  await p.click('[data-topic="remodel"]');
  await p.waitForTimeout(1500);
  const r1 = await p.evaluate(() => ({
    topic: document.querySelector('input[name="topic"]:checked').value,
    hidden: [...document.querySelectorAll('[data-for]')].every((f) => f.hidden),
    note: document.querySelector('.form__note').textContent,
  }));
  ok(r1.topic === 'remodel' && r1.hidden && /contact@niancustomhomes\.com/.test(r1.note), 'rénovation : « Ask about a remodel » choisit le sujet et retire les questions du terrain et de la maison');
  await p.click('.chip:has(input[value="realtor"])');
  const r2 = await p.evaluate(() => document.querySelector('.form__note').textContent);
  ok(/sales@niancorp\.com/.test(r2), 'agents : la demande d’un agent est adressée à sales@niancorp.com');
  // « Ask about a home like this one »
  await p.evaluate(() => document.getElementById('homes').scrollIntoView());
  await p.waitForTimeout(600);
  await p.click('#hp-villa [data-liked]');
  await p.waitForTimeout(1500);
  const l1 = await p.evaluate(() => ({topic: document.querySelector('input[name="topic"]:checked').value, liked: document.getElementById('f-liked').value, vis: !document.getElementById('f-liked').closest('.field').hidden}));
  ok(l1.topic === 'home' && l1.liked === 'villa' && l1.vis, 'maisons : « Ask about a home like this one » reprend la maison dans la demande');

  // le formulaire
  await p.fill('#f-name', '');
  await p.fill('#f-email', '');
  await p.click('.btn--send');
  await p.waitForTimeout(300);
  const f1 = await p.evaluate(() => ({
    e1: document.getElementById('e-name').textContent,
    e2: document.getElementById('e-email').textContent,
    inv: document.getElementById('f-name').getAttribute('aria-invalid'),
    focus: document.activeElement.id,
  }));
  ok(f1.e1 === 'Enter your name.' && f1.e2 === 'Enter your email address.' && f1.inv === 'true' && f1.focus === 'f-name', 'demande : les champs vides disent quoi corriger, le focus va au premier');
  await p.fill('#f-name', 'Pat');
  await p.fill('#f-email', 'pat@example');
  await p.click('.btn--send');
  await p.waitForTimeout(200);
  const f2 = await p.evaluate(() => ({e1: document.getElementById('e-name').hidden, e2: document.getElementById('e-email').textContent}));
  ok(f2.e1 && /name@example\.com/.test(f2.e2), 'demande : une adresse incomplète est signalée avec un exemple');
  await p.fill('#f-email', 'pat@example.com');
  await p.fill('#f-phone', '239-555-0142');
  await p.fill('#f-time', 'Weekday mornings');
  await p.fill('#f-msg', 'We own a lot in Golden Gate Estates.');
  await p.click('.btn--send');
  await p.waitForTimeout(500);
  const f3 = await p.evaluate(() => ({shown: !document.getElementById('form-sent').hidden, focus: document.activeElement.id, mail: document.getElementById('form-sent').dataset.mailto || ''}));
  const q = new URL(f3.mail.replace('mailto:', 'http://x/'));
  const subject = q.searchParams.get('subject');
  const body = q.searchParams.get('body') || '';
  ok(f3.shown && f3.focus === 'form-sent', 'demande : après l’envoi, la note s’affiche et reçoit le focus');
  ok(f3.mail.startsWith('mailto:contact@niancustomhomes.com') && subject === 'Free consultation: a custom home' && /My lot: One of our lots/.test(body) && /My home: One of our proven plans/.test(body) && /A home I liked: Villa Estate Home/.test(body) && /Name: Pat/.test(body) && /Phone: 239-555-0142/.test(body) && /Best time to reach me: Weekday mornings/.test(body) && /Golden Gate/.test(body), `demande : l’e-mail reprend le sujet, le terrain, la maison, la maison aimée, le contact et le message (« ${subject} »)`);
  await p.screenshot({path: `${out}/d-demande.png`});

  // les apparitions : toutes jouées, une fois
  await p.evaluate(() => window.scrollTo(0, 0));
  await walk(p);
  const rv = await p.evaluate(() => ({all: document.querySelectorAll('[data-rv]').length, pre: document.querySelectorAll('.rv-pre').length, inn: document.querySelectorAll('.rv-in').length}));
  // les photos des scènes fermées restent en attente : elles n'ont jamais été vues
  ok(rv.inn >= rv.all - 5 && rv.inn > 15, `apparitions : ${rv.inn} sur ${rv.all} jouées en descendant la page (titres, photos, filets)`);
  await ctx.close();
}

/* ——— téléphone ——— */
{
  const ctx = await b.newContext(PHONE);
  const p = await open(ctx);
  await p.waitForTimeout(2400);
  const bx = await box(p, '.hero__box');
  const h1 = await halves(p);
  const words = await box(p, '.hero__words');
  ok(near(h1[0].x0, bx.x0) && near(h1[1].x1, bx.x1) && near(h1[0].y0, bx.y0) && near(h1[0].y1, bx.y1) && words.x1 <= 390 && h1[0].vis === 'visible', `téléphone : les deux moitiés remplissent la boîte (${h1[0].x0}–${h1[1].x1}), « Lot + Home » tient sur une ligne`);
  const cta = await box(p, '.hero .btn');
  ok(cta.y1 <= 844, `téléphone : le bouton de la consultation est visible sans défiler (${cta.y1} px)`);
  await p.screenshot({path: `${out}/m-accueil.png`});
  const run = await p.evaluate(() => document.querySelector('.hero').offsetHeight - document.querySelector('.hero__stage').offsetHeight);
  await p.evaluate((y) => window.scrollTo(0, y), run);
  await p.waitForTimeout(900);
  const he = await halves(p);
  ok(he[0].x0 <= 0 && he[1].x1 >= 390 && near(he[0].x1, he[1].x0, 2) && he[0].y1 - he[0].y0 > 400, `téléphone : recollées, sur toute la largeur (${he[0].y1 - he[0].y0} px de haut)`);
  // le menu
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(500);
  await p.tap('.menu-btn');
  await p.waitForTimeout(500);
  const m1 = await p.evaluate(() => ({exp: document.querySelector('.menu-btn').getAttribute('aria-expanded'), vis: getComputedStyle(document.getElementById('menu')).visibility, inert: document.getElementById('main').inert}));
  ok(m1.exp === 'true' && m1.vis === 'visible' && m1.inert, 'menu : il s’ouvre, la page derrière devient inerte');
  await p.screenshot({path: `${out}/m-menu.png`});
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
  const m2 = await p.evaluate(() => ({exp: document.querySelector('.menu-btn').getAttribute('aria-expanded'), inert: document.getElementById('main').inert, focus: document.activeElement.classList.contains('menu-btn')}));
  ok(m2.exp === 'false' && !m2.inert && m2.focus, 'menu : Échap le ferme et rend le focus au bouton');
  await p.tap('.menu-btn');
  await p.waitForTimeout(400);
  await p.tap('#menu a[href="#realtors"]');
  await p.waitForTimeout(1700);
  const m3 = await p.evaluate(() => ({exp: document.querySelector('.menu-btn').getAttribute('aria-expanded'), top: Math.round(document.getElementById('realtors').getBoundingClientRect().top)}));
  ok(m3.exp === 'false' && m3.top < 120 && m3.top >= 0, `menu : un lien ferme le menu et amène sa section (${m3.top} px)`);
  // l'accordéon des maisons
  await p.evaluate(() => document.getElementById('homes').scrollIntoView());
  await p.waitForTimeout(600);
  await p.tap('#hb-gates');
  await p.waitForTimeout(900);
  const a1 = await p.evaluate(() => ({open: [...document.querySelectorAll('.home__panel.is-open')].map((x) => x.id).join(), park: getComputedStyle(document.getElementById('hp-park')).display, top: Math.round(document.getElementById('hb-gates').getBoundingClientRect().top)}));
  ok(a1.open === 'hp-gates' && a1.park === 'none' && a1.top >= 0 && a1.top < 844 * 0.6, `téléphone : une maison s’ouvre sous son nom, l’autre se ferme, et elle reste sous les yeux (${a1.top} px)`);
  await p.screenshot({path: `${out}/m-maisons.png`});
  await p.tap('#hb-gates');
  await p.waitForTimeout(400);
  ok(!(await p.evaluate(() => document.querySelectorAll('.home__panel.is-open').length)), 'téléphone : toucher une maison ouverte la referme');
  // la visionneuse au doigt
  await p.tap('#hb-park');
  await p.waitForTimeout(900);
  await p.evaluate(() => document.querySelector('#hp-park .home__photo').click());
  await p.waitForTimeout(800);
  // un vrai glissé du doigt (événements tactiles)
  const fr = await box(p, '.viewer__frame');
  const cdp = await ctx.newCDPSession(p);
  const y = (fr.y0 + fr.y1) / 2;
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: fr.x1 - 40, y}]});
  for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: fr.x1 - 40 - ((fr.x1 - fr.x0 - 80) * i) / 6, y}]});
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await p.waitForTimeout(600);
  const sw = await p.evaluate(() => document.querySelector('.viewer__count').textContent);
  ok(sw === '2 of 6', `téléphone : glisser vers la gauche montre la photo suivante (« ${sw} »)`);
  await p.screenshot({path: `${out}/m-visionneuse.png`});
  await p.tap('.viewer__close');
  await p.waitForTimeout(500);
  await ctx.close();
}

/* ——— mouvement réduit, et sans JavaScript ——— */
{
  const ctx = await b.newContext({...DESK, reducedMotion: 'reduce'});
  const p = await open(ctx);
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => ({
    cls: document.documentElement.className,
    pinned: document.querySelector('.hero').classList.contains('is-pinned'),
    pre: document.querySelectorAll('.rv-pre, .is-pre').length,
    vis: getComputedStyle(document.querySelector('.hero__half')).visibility,
  }));
  const h = await halves(p);
  ok(!/motion|lenis/.test(r.cls) && !r.pinned && !r.pre && r.vis === 'visible' && h[1].x0 - h[0].x1 > 40, 'mouvement réduit : pas de Lenis, l’accueil reste séparé avec son « + », rien n’attend d’apparaître');
  await ctx.close();
  const c2 = await b.newContext({...DESK, javaScriptEnabled: false});
  const p2 = await open(c2);
  await p2.waitForTimeout(400);
  const j = await p2.evaluate(() => {
    const hs = [...document.querySelectorAll('.hero__half')].map((x) => x.getBoundingClientRect());
    return {halves: hs.every((x) => x.width > 200 && x.height > 200), title: getComputedStyle(document.querySelector('.hero__title')).opacity, panels: [...document.querySelectorAll('.home__panel')].filter((x) => getComputedStyle(x).display !== 'none').length};
  });
  ok(j.halves && j.title === '1' && j.panels === 6, 'sans JavaScript : l’accueil montre ses deux moitiés, le texte se lit, les six maisons sont dépliées');
  await c2.close();
}

/* ——— le clavier, les données ——— */
{
  const ctx = await b.newContext(DESK);
  const p = await open(ctx);
  await p.waitForTimeout(2300);
  await p.keyboard.press('Tab');
  const k1 = await p.evaluate(() => ({text: document.activeElement.textContent, top: document.activeElement.getBoundingClientRect().top}));
  await p.keyboard.press('Enter');
  await p.waitForTimeout(600);
  const k2 = await p.evaluate(() => document.activeElement.id);
  ok(k1.text === 'Skip to content' && k1.top >= 0 && k2 === 'main', `clavier : le premier Tab montre « ${k1.text} », Entrée mène au contenu`);
  await p.reload({waitUntil: 'load'});
  await p.waitForTimeout(800);
  const order = [];
  await p.keyboard.press('Tab');
  for (let i = 0; i < 8; i++) {
    await p.keyboard.press('Tab');
    order.push(await p.evaluate(() => (document.activeElement.getAttribute('aria-label') || document.activeElement.textContent).trim().slice(0, 40)));
  }
  ok(order.join('|') === 'NIAN Custom Homes, back to the top|Homes|How it works|Packages|Realtors|About|Call 239-280-6428|Free consultation', `clavier : l’en-tête dans l’ordre de lecture (${order.join(', ')})`);
  // les données structurées
  const ld = await p.evaluate(() => JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent));
  const biz = ld['@graph'][0];
  ok(biz['@type'].includes('HomeAndConstructionBusiness') && biz.hasCredential.identifier === 'CBC1260134' && biz.address.streetAddress === '2055 Trade Center Way' && biz.department.address.streetAddress === '6020 Radio Rd.' && biz.contactPoint.length === 2, 'données : l’entreprise, sa licence, son bureau et sa succursale, ses deux contacts');
  const links = await p.evaluate(() => [...document.querySelectorAll('a[href*="myfloridalicense.com"]')].map((a) => [a.target, a.rel]));
  ok(links.length === 3 && links.every(([t, r]) => t === '_blank' && /noopener/.test(r)), 'licence : chaque mention ouvre sa fiche au registre de l’État, dans un nouvel onglet');
  await ctx.close();
}

/* ——— débordements, de 320 à 1920 px ——— */
{
  const bad = [];
  for (const w of [320, 360, 390, 414, 600, 768, 820, 1024, 1180, 1280, 1440, 1920]) {
    const ctx = await b.newContext({viewport: {width: w, height: 900}, isMobile: w < 1024, hasTouch: w < 1024});
    const p = await open(ctx);
    await p.waitForTimeout(500);
    const r = await p.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const wide = [...document.querySelectorAll('main *, .top *, .foot *')].filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width && (r.right > W + 1 || r.left < -1) && !e.closest('.viewer, .sr, .nav, .hero__half, .home__thumbs, .strip');
      });
      return {sw: document.documentElement.scrollWidth, W, wide: wide.slice(0, 3).map((e) => `${e.tagName.toLowerCase()}.${[...e.classList].join('.')}`)};
    });
    if (r.sw > r.W || r.wide.length) bad.push(`${w}: ${r.sw}>${r.W} ${r.wide.join(' ')}`);
    await ctx.close();
  }
  ok(!bad.length, `débordements : rien ne dépasse de 320 à 1920 px${bad.length ? ` (${bad.join(' ; ')})` : ''}`);
}

ok(!errs.length, `aucune erreur dans la console${errs.length ? ` (${[...new Set(errs)].slice(0, 3).join(' | ')})` : ''}`);
console.log(`\n${n - fails}/${n} essais réussis`);
await b.close();
process.exit(fails ? 1 : 0);
