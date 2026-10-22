// Essais des interactions : l'ouverture (la paroi de verre qui traverse la planche de l'accueil), Lenis, l'en-tête
// (liens, partie courante, se range et revient), les apparitions (titres sans décalage, photos dans l'ordre, une fois),
// la légende de la planche au survol, la visionneuse (ouverte sur la photo touchée, clavier, retour du focus, jamais
// agrandie), les témoignages, les deux langues (bouton, mémoire, adresse, visionneuse et erreurs en espagnol), le
// formulaire qui rédige l'e-mail, le menu du téléphone, la visionneuse au doigt, le mouvement réduit, sans JavaScript,
// et les débordements de 320 à 1920 px. Le site est lu depuis dist/index.html (fichier unique).
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
const open = async (ctx, q = '') => {
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url + q, {waitUntil: 'load'});
  return p;
};
const DESK = {viewport: {width: 1440, height: 900}};
const PHONE = {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true};
const viewer = (p) =>
  p.evaluate(() => ({
    open: document.querySelector('.viewer').open,
    title: document.querySelector('.viewer__title').textContent,
    count: document.querySelector('.viewer__count').textContent,
    focus: document.activeElement.textContent.trim(),
  }));
// descend toute la page pour jouer les apparitions, puis remonte
const walk = async (p, step = 420, pause = 120) => {
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += step) {
    await p.evaluate((yy) => window.scrollTo(0, yy), y);
    await p.waitForTimeout(pause);
  }
  await p.waitForTimeout(2400);
};
const xs = (p) => p.evaluate(() => [...document.querySelectorAll('.plate--hero .ph')].map((c) => getComputedStyle(c).getPropertyValue('--x').trim()));

/* ——— ordinateur ——— */
{
  const ctx = await b.newContext(DESK);
  const p = await open(ctx);
  // l'ouverture : d'abord le verre dépoli sur les six photos, puis la paroi passe de gauche à droite
  await p.waitForTimeout(120);
  const x0 = await xs(p);
  const cls0 = await p.evaluate(() => document.documentElement.className);
  ok(/intro/.test(cls0) && x0.every((v) => parseFloat(v) === 0), `ouverture : les six photos commencent sous le verre dépoli (${x0.join(' ')})`);
  await p.waitForTimeout(950);
  const mid = await p.evaluate(() => {
    const x = [...document.querySelectorAll('.plate--hero .ph')].map((c) => parseFloat(getComputedStyle(c).getPropertyValue('--x')));
    const line = document.querySelector('.plate--hero .sweep');
    return {x, line: !!line, op: line ? +getComputedStyle(line).opacity : 0, title: +getComputedStyle(document.querySelector('.hero__title')).opacity};
  });
  // à mi-course, la colonne de gauche est plus nette que celle de droite, dans les deux rangées
  ok(mid.line && mid.x[0] >= mid.x[1] && mid.x[1] >= mid.x[2] && mid.x[3] === mid.x[0] && mid.x[5] === mid.x[2] && mid.x[0] > mid.x[2], `ouverture : une seule paroi traverse les deux rangées de gauche à droite (${mid.x.map(Math.round).join(' ')})`);
  ok(mid.title === 1, 'ouverture : le titre n’est jamais caché (c’est l’élément principal de la page)');
  await p.waitForTimeout(1600);
  const end = await p.evaluate(() => ({
    cls: document.documentElement.className,
    line: !!document.querySelector('.sweep'),
    x: [...document.querySelectorAll('.plate--hero .ph')].map((c) => getComputedStyle(c).getPropertyValue('--x').trim()),
    clip: getComputedStyle(document.querySelector('.plate--hero .ph img')).clipPath,
  }));
  ok(!/intro/.test(end.cls) && !end.line && end.x.every((v) => v === '100%'), `ouverture : finie, la paroi retirée, les six photos nettes (${end.clip})`);
  ok(/lenis/.test(end.cls), 'Lenis : le défilement doux est actif');
  await p.screenshot({path: `${out}/d-accueil.png`});

  // les apparitions : on descend toute la page depuis le haut, sans lien du menu
  const before = await p.evaluate(() => ({
    wait: document.querySelectorAll('.rv-wait').length,
    gw: document.querySelectorAll('.gw').length,
    h2: [...document.querySelectorAll('main .h2')].map((h) => Math.round(h.getBoundingClientRect().height)),
  }));
  // l'ordre des photos d'une rangée : on note le moment où chacune commence
  await p.evaluate(() => {
    window.__order = [];
    const mo = new MutationObserver((ms) => {
      for (const m of ms) if (m.target.classList.contains('is-in') && m.target.classList.contains('ph')) window.__order.push([m.target.querySelector('img').getAttribute('src').length > 200 ? m.target.dataset.set + m.target.dataset.at : m.target.dataset.set + m.target.dataset.at, performance.now()]);
    });
    for (const ph of document.querySelectorAll('.gw')) mo.observe(ph, {attributes: true, attributeFilter: ['class']});
  });
  // une descente au rythme d'une lecture rapide (300 px toutes les 0,45 s)
  await walk(p, 300, 450);
  const after = await p.evaluate(() => ({
    wait: document.querySelectorAll('.rv-wait, .is-in').length,
    gw: document.querySelectorAll('.gw, .ph__edge').length,
    h2: [...document.querySelectorAll('main .h2')].map((h) => Math.round(h.getBoundingClientRect().height)),
    broken: [...document.querySelectorAll('img')].filter((i) => i.complete && !i.naturalWidth).length,
    order: window.__order,
  }));
  ok(before.wait === 7 && before.gw === 29 && after.wait === 0 && after.gw === 0, `apparitions : 7 titres et 29 photos attendaient ; tous apparus une fois, plus rien en attente`);
  ok(JSON.stringify(before.h2) === JSON.stringify(after.h2), `apparitions : les titres gardent leur hauteur (aucun décalage) ${after.h2.join('/')}`);
  const sh = after.order.filter((o) => o[0].startsWith('showers')).map((o) => o[0]);
  const gaps = after.order.slice(1).map((o, i) => o[1] - after.order[i][1]);
  ok(sh.join(',') === 'showers0,showers1,showers2,showers3' && gaps.every((g) => g > 130), `apparitions : les douches dans l’ordre de lecture (${sh.join(' ')}), au moins 140 ms entre deux photos (min ${Math.round(Math.min(...gaps))} ms)`);
  ok(after.broken === 0, 'photos : aucune image cassée');

  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(600);
  // la légende sous la planche suit la photo survolée, et revient
  await p.hover('.plate--hero li:nth-child(3) .ph');
  await p.waitForTimeout(150);
  const c1 = await p.textContent('.hero__cap-text');
  await p.mouse.move(200, 120);
  await p.waitForTimeout(150);
  const c2 = await p.textContent('.hero__cap-text');
  ok(/black tile/.test(c1) && /Three of our showers/.test(c2), `accueil : la légende dit ce que montre la photo survolée (« ${c1.slice(0, 40)}… »), puis revient`);

  // un lien du menu : la section arrive sous l'en-tête, son titre prend le focus
  await p.click('.nav__list a[href="#clients"]');
  await p.waitForTimeout(1900);
  const nav1 = await p.evaluate(() => ({
    focus: document.activeElement.id,
    top: Math.round(document.getElementById('clients').getBoundingClientRect().top),
    current: document.querySelector('.nav__list a[aria-current]')?.getAttribute('href'),
    hash: location.hash,
  }));
  ok(nav1.focus === 'clients-title' && Math.abs(nav1.top - 72) < 12 && nav1.current === '#clients' && nav1.hash === '#clients', `menu : « Clients » amène la section sous l’en-tête (${nav1.top} px), son titre prend le focus, le lien est marqué`);
  // l'en-tête se range quand on descend, revient quand on remonte
  await p.mouse.wheel(0, 600);
  await p.waitForTimeout(900);
  const hid = await p.evaluate(() => document.querySelector('.top').classList.contains('is-hidden'));
  await p.mouse.wheel(0, -200);
  await p.waitForTimeout(900);
  const back = await p.evaluate(() => document.querySelector('.top').classList.contains('is-hidden'));
  ok(hid && !back, 'en-tête : il se range quand on descend et revient quand on remonte');

  // la visionneuse : ouverte sur la photo touchée
  await p.evaluate(() => document.querySelector('.plate--showers').scrollIntoView({block: 'center'}));
  await p.waitForTimeout(700);
  await p.click('.plate--showers li:nth-child(3) .ph');
  await p.waitForTimeout(1200);
  const v1 = await viewer(p);
  ok(v1.open && v1.title === 'Showers' && v1.count === '3 of 4' && v1.focus === 'Close', `visionneuse : ouverte sur la photo touchée (« ${v1.title} », ${v1.count}), le focus sur « Close »`);
  const cap1 = await p.evaluate(() => {
    const li = [...document.querySelectorAll('.viewer__list > li')].find((x) => Math.abs(x.getBoundingClientRect().left) < 5);
    const img = li.querySelector('img');
    const r = img.getBoundingClientRect();
    return {cap: li.querySelector('figcaption').textContent, w: r.width, nat: img.naturalWidth, bottom: li.querySelector('figcaption').getBoundingClientRect().bottom};
  });
  ok(/hexagon/.test(cap1.cap) && cap1.w <= cap1.nat + 1 && cap1.bottom <= 900, `visionneuse : la légende de la photo, jamais agrandie (${Math.round(cap1.w)} ≤ ${cap1.nat} px), tout dans l’écran`);
  await p.screenshot({path: `${out}/d-visionneuse.png`});
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(700);
  const v2 = await viewer(p);
  const nextOff = await p.evaluate(() => document.querySelector('.viewer__next').disabled);
  await p.keyboard.press('Home');
  await p.waitForTimeout(1200);
  const v3 = await viewer(p);
  ok(v2.count === '4 of 4' && nextOff && v3.count === '1 of 4', `visionneuse : flèche droite (${v2.count}, « suivante » désactivée), Début (${v3.count})`);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(500);
  const v4 = await p.evaluate(() => ({open: document.querySelector('.viewer').open, focus: document.activeElement.getAttribute('aria-labelledby'), overflow: document.documentElement.style.overflow}));
  ok(!v4.open && v4.focus === 'cap-s-3 open-hint' && v4.overflow === '', 'visionneuse : Échap la ferme, le focus revient sur la photo ouverte, la page défile de nouveau');

  // les témoignages : les douze autres derrière un bouton
  const q0 = await p.evaluate(() => ({top: document.querySelectorAll('.quotes__top .q').length, more: document.querySelectorAll('.quotes__more .q').length, hidden: document.getElementById('quotes-more').hidden}));
  await p.click('.quotes__btn');
  await p.waitForTimeout(300);
  const q1 = await p.evaluate(() => ({hidden: document.getElementById('quotes-more').hidden, exp: document.querySelector('.quotes__btn').getAttribute('aria-expanded'), text: document.querySelector('.quotes__btn').textContent}));
  ok(q0.top === 6 && q0.more === 12 && q0.hidden && !q1.hidden && q1.exp === 'true' && q1.text === 'Show fewer', `témoignages : 6 en avant, les 12 autres s’ouvrent (« ${q1.text} »)`);
  await p.click('.quotes__btn');

  // le formulaire
  await p.evaluate(() => document.getElementById('estimate').scrollIntoView());
  await p.waitForTimeout(500);
  await p.click('.btn--submit');
  await p.waitForTimeout(250);
  const e1 = await p.evaluate(() => ({name: document.getElementById('e-name').textContent, phone: document.getElementById('e-phone').textContent, inv: document.getElementById('f-name').getAttribute('aria-invalid'), focus: document.activeElement.id}));
  ok(e1.name === 'Enter your name.' && /phone number or an email/.test(e1.phone) && e1.inv === 'true' && e1.focus === 'f-name', 'demande : vide, les erreurs sont dites et le focus va au premier champ');
  await p.fill('#f-name', 'Pat');
  await p.fill('#f-phone', '561-555');
  await p.fill('#f-email', 'pat@example');
  await p.click('.btn--submit');
  await p.waitForTimeout(250);
  const e2 = await p.evaluate(() => ({phone: document.getElementById('e-phone').textContent, email: document.getElementById('e-email').textContent, nameErr: document.getElementById('e-name').hidden, focus: document.activeElement.id}));
  ok(/10 digits/.test(e2.phone) && /name@example\.com/.test(e2.email) && e2.nameErr && e2.focus === 'f-phone', 'demande : un numéro trop court et une adresse incomplète sont signalés, le nom n’est plus en erreur');
  await p.fill('#f-phone', '561-555-0142');
  await p.fill('#f-email', 'pat@example.com');
  await p.fill('#f-city', 'Lake Worth');
  await p.check('input[name="what"][value="Bathroom"]');
  await p.check('input[name="what"][value="Kitchen"]');
  await p.fill('#f-details', 'A primary bath and the kitchen.');
  await p.waitForTimeout(350);
  const chip = await p.evaluate(() => getComputedStyle(document.querySelector('input[value="Kitchen"] + span')).backgroundColor);
  await p.click('.btn--submit');
  await p.waitForTimeout(600);
  const done = await p.evaluate(() => ({shown: !document.querySelector('.form__done').hidden, focus: document.activeElement.classList.contains('form__done'), mail: document.querySelector('.form__done').dataset.mailto || ''}));
  const body = decodeURIComponent(done.mail.split('body=')[1] || '');
  const subject = decodeURIComponent((done.mail.split('subject=')[1] || '').split('&')[0]);
  ok(chip === 'rgb(234, 138, 18)' && done.shown && done.focus, 'demande : les sujets choisis passent à l’orange ; la note d’envoi apparaît et reçoit le focus');
  ok(/^mailto:brunetbrothersconstruction@gmail\.com/.test(done.mail) && subject === 'Free estimate request: Bathroom, Kitchen' && /Name: Pat/.test(body) && /Phone: 561-555-0142/.test(body) && /City: Lake Worth/.test(body) && /Call me in: English/.test(body) && /primary bath/.test(body), `demande : l’e-mail reprend le nom, le téléphone, la ville, les sujets, la langue et le message (« ${subject} »)`);
  await ctx.close();
}

/* ——— les deux langues ——— */
{
  const ctx = await b.newContext(DESK);
  const p = await open(ctx);
  await p.waitForTimeout(2600);
  await p.click('.top .langs__btn[data-lang="es"]');
  await p.waitForTimeout(700);
  const es = await p.evaluate(() => ({
    lang: document.documentElement.lang,
    h1: document.querySelector('h1').textContent,
    title: document.title,
    pressed: [...document.querySelectorAll('.langs__btn[data-lang="es"]')].every((b) => b.getAttribute('aria-pressed') === 'true'),
    q: location.search,
    saved: localStorage.getItem('bb-lang'),
    cap: document.getElementById('cap-k-1').textContent,
    note: document.querySelector('.clients__note').textContent,
    callin: document.querySelector('input[name="callin"]:checked').value,
    quote: document.querySelector('.quotes__top .q p').textContent.slice(0, 20),
  }));
  ok(es.lang === 'es' && es.h1 === 'Maestros de la constancia y la calidad.' && /Remodelación/.test(es.title) && es.pressed && es.q === '?lang=es' && es.saved === 'es', `espagnol : un clic change la page, le titre de l’onglet, les deux boutons ; la langue est gardée (${es.q})`);
  ok(/^Una cocina abierta/.test(es.cap) && /en inglés/.test(es.note) && es.callin === 'Spanish' && /^“Brunet Brothers/.test(es.quote), 'espagnol : les légendes traduites, les témoignages en anglais avec une note, « Llámenme en » passe à l’espagnol');
  await p.evaluate(() => document.querySelector('.plate--kitchens').scrollIntoView({block: 'center'}));
  await p.waitForTimeout(1600);
  await p.click('.plate--kitchens li:nth-child(1) .ph');
  await p.waitForTimeout(1100);
  const v = await viewer(p);
  ok(v.title === 'Cocinas' && v.count === '1 de 6' && v.focus === 'Cerrar', `espagnol : la visionneuse aussi (« ${v.title} », ${v.count}, « ${v.focus} »)`);
  // en espagnol pendant que la visionneuse est ouverte, puis retour en anglais : tout suit
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById('estimate').scrollIntoView());
  await p.waitForTimeout(300);
  await p.click('.btn--submit');
  await p.waitForTimeout(250);
  const err = await p.textContent('#e-name');
  await p.click('.foot .langs__btn[data-lang="en"]');
  await p.waitForTimeout(700);
  const err2 = await p.textContent('#e-name');
  ok(err === 'Escriba su nombre.' && err2 === 'Enter your name.', `langues : les erreurs du formulaire changent de langue avec la page (« ${err} » → « ${err2} »)`);
  const en = await p.evaluate(() => ({lang: document.documentElement.lang, h1: document.querySelector('h1').textContent, q: location.search, saved: localStorage.getItem('bb-lang')}));
  ok(en.lang === 'en' && /^Masters/.test(en.h1) && en.q === '' && en.saved === 'en', 'anglais : le bouton du pied de page ramène tout en anglais');
  await ctx.close();
  // une adresse avec ?lang=es s'ouvre directement en espagnol
  const c2 = await b.newContext(DESK);
  const p2 = await open(c2, '?lang=es');
  await p2.waitForTimeout(300);
  const d = await p2.evaluate(() => ({lang: document.documentElement.lang, ready: document.documentElement.classList.contains('i18n-ready'), h1: document.querySelector('h1').textContent}));
  ok(d.lang === 'es' && d.ready && /^Maestros/.test(d.h1), 'espagnol : l’adresse ?lang=es ouvre la page directement en espagnol');
  await p2.screenshot({path: `${out}/d-espagnol.png`});
  await c2.close();
  // un navigateur réglé en espagnol
  const c3 = await b.newContext({...DESK, locale: 'es-US'});
  const p3 = await open(c3);
  await p3.waitForTimeout(300);
  ok((await p3.evaluate(() => document.documentElement.lang)) === 'es', 'espagnol : un navigateur réglé en espagnol reçoit la page en espagnol');
  await c3.close();
}

/* ——— téléphone ——— */
{
  const ctx = await b.newContext(PHONE);
  const p = await open(ctx);
  await p.waitForTimeout(2700);
  const h = await p.evaluate(() => ({
    title: document.querySelector('.hero__title').getBoundingClientRect(),
    cta: document.querySelector('.hero .btn').getBoundingClientRect(),
    plate: document.querySelector('.plate--hero').getBoundingClientRect(),
    menu: getComputedStyle(document.querySelector('.menu-btn')).display,
    cta2: getComputedStyle(document.querySelector('.btn--top')).display,
  }));
  ok(h.title.right <= 390 && h.cta.bottom <= 844 && h.plate.top < 844 && h.menu !== 'none' && h.cta2 === 'none', `téléphone : le titre tient, le bouton visible sans défiler (${Math.round(h.cta.bottom)} px), la planche commence dans le premier écran`);
  await p.screenshot({path: `${out}/t-accueil.png`});
  // le menu
  await p.tap('.menu-btn');
  await p.waitForTimeout(500);
  const m1 = await p.evaluate(() => ({exp: document.querySelector('.menu-btn').getAttribute('aria-expanded'), focus: document.activeElement.textContent, inert: document.querySelector('main').inert, vis: getComputedStyle(document.querySelector('.nav')).visibility}));
  ok(m1.exp === 'true' && m1.focus === 'Our work' && m1.inert && m1.vis === 'visible', 'téléphone : le menu s’ouvre, le focus va au premier lien, la page derrière est inerte');
  await p.screenshot({path: `${out}/t-menu.png`});
  await p.tap('.nav__list a[href="#process"]');
  await p.waitForTimeout(1800);
  const m2 = await p.evaluate(() => ({open: document.querySelector('.top').classList.contains('is-open'), inert: document.querySelector('main').inert, top: Math.round(document.getElementById('process').getBoundingClientRect().top)}));
  ok(!m2.open && !m2.inert && Math.abs(m2.top - 60) < 14, `téléphone : un lien du menu le ferme et amène la section sous l’en-tête (${m2.top} px)`);
  // la visionneuse au doigt
  await p.evaluate(() => document.querySelector('.plate--vanities').scrollIntoView({block: 'center'}));
  await p.waitForTimeout(1800);
  await p.tap('.plate--vanities li:nth-child(1) .ph');
  await p.waitForTimeout(1200);
  await p.evaluate(() => {
    const l = document.querySelector('.viewer__list');
    l.scrollTo({left: l.clientWidth, behavior: 'instant'});
  });
  await p.waitForTimeout(500);
  const v = await viewer(p);
  const fit = await p.evaluate(() => {
    const li = [...document.querySelectorAll('.viewer__list > li')].find((x) => Math.abs(x.getBoundingClientRect().left) < 5);
    const r = li.querySelector('img').getBoundingClientRect();
    return r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight;
  });
  ok(v.open && v.count === '2 of 4' && fit, `téléphone : on glisse d’une photo à l’autre (${v.count}), la photo tient dans l’écran`);
  await p.screenshot({path: `${out}/t-visionneuse.png`});
  await p.tap('.viewer__close');
  await p.waitForTimeout(400);
  await ctx.close();
}

/* ——— mouvement réduit, et sans JavaScript ——— */
{
  const ctx = await b.newContext({...DESK, reducedMotion: 'reduce'});
  const p = await open(ctx);
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => ({
    cls: document.documentElement.className,
    gw: document.querySelectorAll('.gw, .rv-wait, .sweep').length,
    x: getComputedStyle(document.querySelector('.plate--hero .ph')).getPropertyValue('--x').trim(),
  }));
  ok(!/intro|lenis/.test(r.cls) && r.gw === 0 && r.x === '100%', 'mouvement réduit : ni ouverture, ni apparitions, ni défilement doux ; tout est net d’emblée');
  await ctx.close();
  const c2 = await b.newContext({...DESK, javaScriptEnabled: false});
  const p2 = await c2.newPage();
  await p2.goto(url, {waitUntil: 'load'});
  await p2.waitForTimeout(3000);
  const j = await p2.evaluate(() => ({
    x: getComputedStyle(document.querySelector('.plate--hero .ph')).getPropertyValue('--x').trim(),
    title: getComputedStyle(document.querySelector('.hero__title')).opacity,
    quotes: document.querySelectorAll('.quotes__top .q').length,
  }));
  ok(j.x === '100%' && j.title === '1' && j.quotes === 6, 'sans JavaScript : l’accueil est net au bout de 2,6 s, le texte et les témoignages se lisent');
  await c2.close();
}

/* ——— le clavier, la tablette, les données, la langue en cours de lecture ——— */
{
  const ctx = await b.newContext(DESK);
  const p = await open(ctx);
  await p.waitForTimeout(2700);
  // le premier Tab montre « Skip to content » ; Entrée envoie le focus au contenu
  await p.keyboard.press('Tab');
  const k1 = await p.evaluate(() => ({text: document.activeElement.textContent, top: document.activeElement.getBoundingClientRect().top}));
  await p.keyboard.press('Enter');
  await p.waitForTimeout(1400);
  const k2 = await p.evaluate(() => document.activeElement.id);
  ok(k1.text === 'Skip to content' && k1.top >= 0 && k2 === 'hero-title', `clavier : le premier Tab montre « ${k1.text} », Entrée mène au titre de l’accueil`);
  // depuis le haut de la page : le lien d'évitement, puis la marque, le menu, la langue, le bouton
  await p.reload({waitUntil: 'load'});
  await p.waitForTimeout(800);
  const order = [];
  await p.keyboard.press('Tab');
  for (let i = 0; i < 9; i++) {
    await p.keyboard.press('Tab');
    order.push(await p.evaluate(() => (document.activeElement.getAttribute('aria-label') || document.activeElement.textContent).trim().slice(0, 40)));
  }
  ok(order.join('|').startsWith('Brunet Brothers Construction, home|Our work|The company|How it works|Clients|English|Español|Free estimate'), `clavier : l’en-tête dans l’ordre de lecture (${order.slice(0, 8).join(', ')})`);
  // le bouton « Free estimate » mène au formulaire
  await p.click('.btn--top');
  await p.waitForTimeout(1900);
  const k3 = await p.evaluate(() => ({focus: document.activeElement.id, top: Math.round(document.getElementById('estimate').getBoundingClientRect().top)}));
  ok(k3.focus === 'estimate-title' && Math.abs(k3.top - 72) < 12, `« Free estimate » amène la demande de visite sous l’en-tête (${k3.top} px)`);
  // changer de langue au milieu de la page ne fait pas sauter la lecture
  await p.evaluate(() => document.getElementById('process').scrollIntoView());
  await p.waitForTimeout(800);
  const y0 = await p.evaluate(() => Math.round(document.getElementById('process-title').getBoundingClientRect().top));
  await p.evaluate(() => document.querySelector('.foot .langs__btn[data-lang="es"]').click());
  await p.waitForTimeout(700);
  const y1 = await p.evaluate(() => Math.round(document.getElementById('process-title').getBoundingClientRect().top));
  ok(Math.abs(y1 - y0) < 40, `langues : en changeant de langue au milieu de la page, le titre de la section reste en place (${y0} → ${y1} px)`);
  // les données structurées
  const ld = await p.evaluate(() => JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent));
  const biz = ld['@graph'].find((x) => x['@type'] === 'GeneralContractor');
  const faq = ld['@graph'].find((x) => x['@type'] === 'FAQPage');
  ok(biz && biz.hasCredential.length === 4 && biz.contactPoint.map((c) => c.availableLanguage).join() === 'English,Spanish' && faq?.mainEntity.length === 6 && !biz.address.streetAddress, 'données : l’entreprise, ses 4 licences, ses deux lignes (anglais, espagnol), la FAQ du déroulé ; pas d’adresse de rue');
  const links = await p.evaluate(() => [...document.querySelectorAll('.licenses__num')].map((a) => [a.target, a.rel, a.href.startsWith('https://www.myfloridalicense.com/LicenseDetail.asp')]));
  ok(links.length === 4 && links.every(([t, r, u]) => t === '_blank' && /noopener/.test(r) && u), 'licences : chaque numéro ouvre sa fiche au registre de l’État, dans un nouvel onglet');
  await ctx.close();
  // la tablette : quatre photos par rangée de salle de bain, deux cuisines par rangée
  const c2 = await b.newContext({viewport: {width: 768, height: 1024}, isMobile: true, hasTouch: true});
  const p2 = await open(c2);
  await p2.waitForTimeout(500);
  const t = await p2.evaluate(() => ({
    sh: getComputedStyle(document.querySelector('.plate--showers')).gridTemplateColumns.split(' ').length,
    ki: getComputedStyle(document.querySelector('.plate--kitchens')).gridTemplateColumns.split(' ').length,
    hero: getComputedStyle(document.querySelector('.plate--hero')).gridTemplateColumns.split(' ').length,
  }));
  ok(t.sh === 4 && t.ki === 2 && t.hero === 3, `tablette : ${t.hero} colonnes à l’accueil, ${t.sh} par rangée de salle de bain, ${t.ki} pour les cuisines`);
  await c2.close();
}

/* ——— débordements, de 320 à 1920 px ——— */
{
  const bad = [];
  for (const w of [320, 360, 390, 414, 600, 768, 820, 1024, 1180, 1280, 1440, 1920]) {
    const ctx = await b.newContext({viewport: {width: w, height: 900}, isMobile: w < 1024, hasTouch: w < 1024});
    const p = await open(ctx);
    await p.waitForTimeout(400);
    for (const lang of ['en', 'es']) {
      if (lang === 'es') {
        await p.evaluate(() => document.querySelector('.langs__btn[data-lang="es"]').click());
        await p.waitForTimeout(500);
      }
      const r = await p.evaluate(() => {
        const W = document.documentElement.clientWidth;
        const wide = [...document.querySelectorAll('main *, .top *, .foot *')].filter((e) => {
          const r = e.getBoundingClientRect();
          return r.width && (r.right > W + 1 || r.left < -1) && !e.closest('.viewer, .sr, .nav');
        });
        return {sw: document.documentElement.scrollWidth, W, wide: wide.slice(0, 3).map((e) => `${e.tagName.toLowerCase()}.${[...e.classList].join('.')}`)};
      });
      if (r.sw > r.W || r.wide.length) bad.push(`${w}/${lang}: ${r.sw}>${r.W} ${r.wide.join(' ')}`);
    }
    await ctx.close();
  }
  ok(!bad.length, `débordements : rien ne dépasse de 320 à 1920 px, en anglais et en espagnol${bad.length ? ` (${bad.join(' ; ')})` : ''}`);
}

ok(!errs.length, `aucune erreur dans la console${errs.length ? ` (${[...new Set(errs)].slice(0, 3).join(' | ')})` : ''}`);
console.log(`\n${n - fails}/${n} essais réussis`);
await b.close();
process.exit(fails ? 1 : 0);
