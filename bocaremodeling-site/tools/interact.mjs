// Essais des interactions : l'ouverture (le titre, l'esquisse qui s'ouvre depuis sa porte), Lenis, la scène de
// l'accueil au défilement et par ses étapes, l'en-tête (liens, partie courante, se range et revient), les
// apparitions (titres, photos dans l'ordre des étapes), la cuisine finie qui reste en vue, la visionneuse (ouverte sur
// la photo touchée, clavier, retour du focus, jamais agrandie), la liste des camions (survol, clic, Windows), le
// bureau (ouvert ou fermé), le formulaire qui rédige l'e-mail, le menu du téléphone, la scène épinglée au doigt, le
// clavier depuis le haut de la page, le mouvement réduit, sans JavaScript, et les débordements de 320 à 1920 px.
// Le site est lu depuis dist/index.html (fichier unique). Captures dans <dossier>.
//   node tools/interact.mjs <dossier>
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
const viewer = (p) =>
  p.evaluate(() => ({
    open: document.querySelector('.viewer').open,
    title: document.querySelector('.viewer__title').textContent,
    count: document.querySelector('.viewer__count').textContent,
    focus: document.activeElement.textContent.trim(),
    src: (() => {
      const lis = [...document.querySelectorAll('.viewer__list > li')];
      const li = lis.find((x) => Math.abs(x.getBoundingClientRect().left) < 5);
      return li ? li.querySelector('img').alt.slice(0, 40) : '';
    })(),
  }));
// la scène : sa géométrie, et l'état à une progression donnée (0 l'esquisse, 1 la pièce construite)
const geo = (p) =>
  p.evaluate(() => {
    const t = document.querySelector('.hero__track');
    const pin = document.querySelector('.hero__pin');
    return {top: t.getBoundingClientRect().top + scrollY, span: t.offsetHeight - pin.offsetHeight, pinTop: parseFloat(getComputedStyle(pin).top) || 0};
  });
const stageAt = async (p, g, v) => {
  await p.evaluate((y) => window.scrollTo(0, y), Math.max(0, g.top - g.pinTop + v * g.span));
  await p.waitForTimeout(700);
  return p.evaluate(() => {
    const L = [...document.querySelectorAll('.stage__layer')].map((el) => ({clip: el.style.clipPath, hidden: getComputedStyle(el).visibility === 'hidden'}));
    return {
      L,
      edge: +getComputedStyle(document.querySelector('.stage__edge')).opacity,
      step: [...document.querySelectorAll('.steps__btn')].findIndex((x) => x.hasAttribute('aria-current')),
      pin: Math.round(document.querySelector('.hero__pin').getBoundingClientRect().top),
    };
  });
};

/* ——— ordinateur ——— */
{
  const ctx = await b.newContext(DESK);
  const p = await open(ctx);
  // l'ouverture : au début, l'esquisse n'est visible que dans le cadre de sa porte
  await p.waitForTimeout(250);
  const early = await p.evaluate(() => ({
    cls: document.documentElement.className,
    clip: document.querySelector('.stage__layer[data-layer="0"]').style.clipPath,
    masked: document.querySelectorAll('.hero__title .ln__in').length,
  }));
  const ins = (early.clip.match(/[\d.]+/g) || []).map(Number);
  ok(/intro/.test(early.cls) && early.masked === 2 && ins.length === 4 && ins.every((x) => x > 40), `ouverture : le titre monte derrière son cache, l'esquisse commence dans le cadre de sa porte (${early.clip})`);
  await p.waitForTimeout(2200);
  const o = await p.evaluate(() => ({
    cls: document.documentElement.className,
    clip: document.querySelector('.stage__layer[data-layer="0"]').style.clipPath,
    h1: document.querySelector('.hero__title').innerHTML,
    edge: getComputedStyle(document.querySelector('.stage__edge')).opacity,
    lenis: document.documentElement.classList.contains('lenis'),
    title: document.querySelector('.hero__title').getBoundingClientRect(),
    fs: parseFloat(getComputedStyle(document.querySelector('.hero__title')).fontSize),
    stage: document.querySelector('.stage').getBoundingClientRect(),
    copy: document.querySelector('.hero__copy').getBoundingClientRect(),
    cta: document.querySelector('.hero__cta .btn').getBoundingClientRect(),
    steps: document.querySelector('.steps').getBoundingClientRect(),
  }));
  ok(!/intro/.test(o.cls) && o.clip === '' && o.edge === '0' && !/class="ln/.test(o.h1), 'ouverture : terminée, l’esquisse remplit la scène, le titre est rendu tel quel');
  ok(o.lenis, 'défilement : Lenis actif');
  ok(o.title.height < o.fs * 1.2 && o.copy.left >= o.stage.right && o.steps.bottom <= 900, `accueil : le titre sur une ligne, la scène à gauche, le texte et les étapes à droite (${Math.round(o.title.height)} px de haut)`);
  ok(o.cta.bottom <= 900, `accueil : le bouton de devis visible sans défiler (${Math.round(o.cta.bottom)} px)`);
  await p.screenshot({path: `${out}/o-accueil.png`});

  // la scène au défilement : l'esquisse, la 3D qui s'ouvre depuis sa porte, la 3D, la photo qui s'ouvre, la photo
  const g = await geo(p);
  const s0 = await stageAt(p, g, 0);
  const s1 = await stageAt(p, g, 0.3);
  const s2 = await stageAt(p, g, 0.48);
  const s3 = await stageAt(p, g, 0.75);
  await p.screenshot({path: `${out}/o-scene-photo-qui-s-ouvre.png`});
  const s4 = await stageAt(p, g, 1);
  ok(s0.step === 0 && s0.L[1].hidden && s0.L[2].hidden, 'scène : au début, l’esquisse seule, étape 1');
  ok(/^inset\(/.test(s1.L[1].clip) && s1.edge === 1 && s1.step === 1, `scène : la 3D s’ouvre dans un rectangle bordé de bleu (${s1.L[1].clip.slice(0, 40)}…)`);
  ok(s2.step === 1 && s2.L[1].clip === '' && !s2.L[1].hidden && s2.L[0].hidden && s2.L[2].hidden, 'scène : la 3D seule, étape 2');
  ok(/^inset\(/.test(s3.L[2].clip) && s3.step === 2, 'scène : la photo s’ouvre à son tour, étape 3');
  ok(s4.L[2].clip === '' && !s4.L[2].hidden && s4.step === 2, 'scène : à la fin, la pièce construite');
  ok([s0, s1, s2, s3, s4].every((s) => s.pin === 0), 'scène : épinglée pendant tout le passage');
  // les étapes sont des boutons
  await p.click('.steps__btn[data-step="0"]');
  await p.waitForTimeout(1700);
  const back0 = await p.evaluate(() => [...document.querySelectorAll('.steps__btn')].findIndex((x) => x.hasAttribute('aria-current')));
  await p.click('.steps__btn[data-step="1"]');
  await p.waitForTimeout(1700);
  const to1 = await p.evaluate(() => ({step: [...document.querySelectorAll('.steps__btn')].findIndex((x) => x.hasAttribute('aria-current')), clip: document.querySelector('.stage__layer[data-layer="1"]').style.clipPath, hidden: getComputedStyle(document.querySelector('.stage__layer[data-layer="1"]')).visibility}));
  ok(back0 === 0 && to1.step === 1 && to1.clip === '' && to1.hidden === 'visible', 'scène : « Drawn in 3D » fait défiler jusqu’à la 3D entière');

  // les liens de l'en-tête
  await p.click('.nav a[href="#work"]');
  await p.waitForTimeout(1900);
  const s = await p.evaluate(() => ({
    top: Math.round(document.getElementById('work').getBoundingClientRect().top),
    hash: location.hash,
    cur: document.querySelector('.nav a[aria-current]')?.getAttribute('href'),
    focus: document.activeElement.id,
  }));
  ok(Math.abs(s.top - 72) < 40 && s.hash === '#work' && s.focus === 'work-title', `en-tête : « Our work » mène à la section et met le focus sur son titre (${s.top} px, ${s.hash})`);
  ok(s.cur === '#work', 'en-tête : la partie courante est marquée dans le menu');
  await p.mouse.move(700, 500);
  await p.evaluate(() => document.activeElement.blur());
  await p.mouse.wheel(0, 700);
  await p.waitForTimeout(1000);
  const hid = await p.evaluate(() => document.querySelector('.top').classList.contains('is-hidden'));
  await p.mouse.wheel(0, -300);
  await p.waitForTimeout(1000);
  const shown = await p.evaluate(() => !document.querySelector('.top').classList.contains('is-hidden'));
  ok(hid && shown, `en-tête : se range quand on descend (${hid}), revient quand on remonte (${shown})`);

  // les apparitions de la cuisine, sur une page neuve où l'on saute directement aux photos : titres montés et rendus
  // tels quels, photos ouvertes dans l'ordre des étapes
  const q = await open(ctx);
  await q.waitForTimeout(2300);
  await q.evaluate(() => {
    for (const i of document.querySelectorAll('.story img')) i.loading = 'eager';
  });
  await q.waitForTimeout(800);
  const drawnH = await q.evaluate(() => document.getElementById('drawn').offsetHeight);
  await q.evaluate(() => window.scrollTo(0, document.getElementById('kitchen-title').getBoundingClientRect().top + scrollY - 110));
  const order = [];
  const heights = [];
  for (let i = 0; i < 12; i++) {
    await q.waitForTimeout(70);
    const st = await q.evaluate(() => [...document.querySelectorAll('.story--kitchen .ph')].map((x) => x.classList.contains('is-in') || !x.classList.contains('gw')));
    order.push(st.map(Number).join(''));
    heights.push(await q.evaluate(() => document.getElementById('drawn').offsetHeight));
  }
  await q.waitForTimeout(1800);
  const after = await q.evaluate(() => ({
    gw: document.querySelectorAll('.story--kitchen .gw').length,
    edges: document.querySelectorAll('.story--kitchen .gw__edge').length,
    h3: document.getElementById('kitchen-title').innerHTML,
    wait: document.querySelectorAll('.story--kitchen .rv-wait').length,
  }));
  const seq = [...new Set(order)];
  const monotone = seq.every((x) => /^1*0*$/.test(x));
  ok(monotone && seq.length >= 3, `apparitions : les photos de la cuisine s’ouvrent dans l’ordre 1, 2, 3, 4 (${seq.join(' → ')})`);
  ok(after.gw === 0 && after.edges === 0 && after.wait === 0 && after.h3 === 'A kitchen with two quartzite islands', 'apparitions : une fois jouées, titres et photos sont rendus tels quels');
  ok(heights.every((x) => x === drawnH), `apparitions : rien ne bouge dans la page pendant qu’elles jouent (${[...new Set([drawnH, ...heights])].join(', ')} px)`);
  await q.close();
  // les deux tirages ont le même format : leurs légendes sont alignées ; la cuisine finie reste en vue
  const k = await p.evaluate(() => {
    const caps = [...document.querySelectorAll('.story--kitchen .story__item--doc figcaption')].map((c) => Math.round(c.getBoundingClientRect().top));
    const list = document.querySelector('.story--kitchen .story__list');
    const built = document.querySelector('.story--kitchen .story__item--built');
    return {caps, listTop: list.getBoundingClientRect().top + scrollY, builtTop: built.getBoundingClientRect().top - list.getBoundingClientRect().top};
  });
  await p.evaluate((y) => window.scrollTo(0, y), k.listTop + 120);
  await p.waitForTimeout(900);
  const k2 = await p.evaluate(() => {
    const list = document.querySelector('.story--kitchen .story__list').getBoundingClientRect();
    const built = document.querySelector('.story--kitchen .story__item--built').getBoundingClientRect();
    return {offset: Math.round(built.top - list.top), top: Math.round(built.top)};
  });
  ok(k.caps[0] === k.caps[1], `cuisine : les légendes des deux tirages sont alignées (${k.caps.join(' / ')})`);
  ok(k2.offset > 100 && k2.top > 60 && k2.top < 140, `cuisine : la photo finie reste en vue pendant qu’on lit les étapes (décalée de ${k2.offset} px, à ${k2.top} px du haut)`);
  await p.screenshot({path: `${out}/o-cuisine.png`});

  // une photo d'histoire ouvre la visionneuse sur elle-même
  await p.click('.story--kitchen .story__item--built .ph');
  await p.waitForTimeout(900);
  const v1 = await viewer(p);
  ok(v1.open && v1.count === '5 of 5' && v1.title === 'A kitchen with two quartzite islands' && v1.focus === 'Close' && /finished kitchen/.test(v1.src), `visionneuse : la cuisine finie ouvre la 5e photo des 5, focus sur « Close » (${v1.count})`);
  await p.keyboard.press('ArrowLeft');
  await p.waitForTimeout(600);
  const v2 = await viewer(p);
  await p.keyboard.press('Home');
  await p.waitForTimeout(600);
  const v3 = await p.evaluate(() => ({count: document.querySelector('.viewer__count').textContent, prev: document.querySelector('.viewer__prev').disabled, next: document.querySelector('.viewer__next').disabled, ov: document.documentElement.style.overflow}));
  ok(v2.count === '4 of 5' && v3.count === '1 of 5' && v3.prev && !v3.next && v3.ov === 'hidden', `visionneuse : flèche gauche et Début, « Previous » s’éteint au bout, la page ne défile plus derrière (${v2.count}, ${v3.count})`);
  await p.screenshot({path: `${out}/o-visionneuse.png`});
  await p.keyboard.press('Escape');
  await p.waitForTimeout(600);
  const v4 = await p.evaluate(() => ({open: document.querySelector('.viewer').open, focus: document.activeElement.dataset.at, set: document.activeElement.dataset.set, ov: document.documentElement.style.overflow}));
  ok(!v4.open && v4.set === 'kitchen' && v4.focus === '4' && v4.ov === '', 'visionneuse : Échap referme, le focus revient sur la photo de la cuisine finie, la page défile à nouveau');

  // la liste des camions : survol, clic, Windows
  await p.evaluate(() => document.querySelector('.trades').scrollIntoView({block: 'start'}));
  await p.waitForTimeout(1900);
  await p.hover('.trade[data-trade="pools"]');
  await p.waitForTimeout(900);
  const t1 = await p.evaluate(() => ({cap: document.querySelector('.trades__cap').textContent, top: document.querySelector('.trades__img.is-top')?.dataset.tradeImg, stretch: getComputedStyle(document.querySelector('.trade[data-trade="pools"]')).fontStretch}));
  await p.mouse.move(1300, 120);
  await p.waitForTimeout(900);
  const t2 = await p.evaluate(() => document.querySelector('.trades__cap').textContent);
  ok(t1.top === 'pools' && /screen cage/.test(t1.cap) && t2 === 'The list on our truck doors, at a roof job.', `liste : survoler « Pools. » montre la piscine (${t1.stretch}), la quitter revient aux camions`);
  await p.click('.trade[data-trade="kitchens"]');
  await p.waitForTimeout(900);
  await p.mouse.move(1300, 120);
  await p.waitForTimeout(500);
  const t3 = await p.evaluate(() => ({
    pressed: document.querySelector('.trade[data-trade="kitchens"]').getAttribute('aria-pressed'),
    cap: document.querySelector('.trades__cap').textContent,
    dim: getComputedStyle(document.querySelector('.trade[data-trade="roofs"]')).color,
    hint: !document.querySelector('.trades__hint').hidden,
  }));
  ok(t3.pressed === 'true' && /kitchen going in/i.test(t3.cap) && t3.dim !== 'rgb(16, 35, 58)' && t3.hint, 'liste : un clic garde « Kitchens, » choisi, les autres mots pâlissent, l’indication est affichée');
  await p.screenshot({path: `${out}/o-liste.png`});
  await p.click('.trade[data-trade="windows"]');
  await p.waitForTimeout(900);
  const t4 = await p.evaluate(() => ({cap: document.querySelector('.trades__cap').textContent, top: document.querySelector('.trades__img.is-top')?.dataset.tradeImg}));
  await p.click('.trade[data-trade="windows"]');
  await p.waitForTimeout(900);
  const t5 = await p.evaluate(() => ({pressed: [...document.querySelectorAll('.trade')].filter((x) => x.getAttribute('aria-pressed') === 'true').length, cap: document.querySelector('.trades__cap').textContent}));
  ok(t4.top === 'trucks' && /Windows are on the list too/.test(t4.cap) && t5.pressed === 0 && /truck doors/.test(t5.cap), 'liste : « Windows, » montre les camions (pas de photo de fenêtres inventée) ; un second clic rend la liste');

  // le travail : chaque vignette ouvre son projet, sur la photo de la vignette
  await p.evaluate(() => document.querySelector('.project--b .project__ph').scrollIntoView({block: 'center'}));
  await p.waitForTimeout(1600);
  await p.click('.project--b .project__ph');
  await p.waitForTimeout(900);
  const w1 = await viewer(p);
  ok(w1.open && w1.count === '2 of 3' && w1.title === 'A bath in blue-gray stone' && /Inside a shower/.test(w1.src), `travail : la vignette en pierre ouvre son projet sur sa photo (« ${w1.title} », ${w1.count})`);
  // aucune photo n'est montrée plus grande que son fichier
  const big = await p.evaluate(async () => {
    const res = [];
    for (const li of document.querySelectorAll('.viewer__list > li')) {
      li.scrollIntoView({inline: 'center'});
      const img = li.querySelector('img');
      img.loading = 'eager';
      if (!img.complete) await new Promise((r) => (img.onload = img.onerror = r));
      const r = img.getBoundingClientRect();
      if (r.width > img.naturalWidth + 1) res.push(`${img.alt.slice(0, 30)} ${Math.round(r.width)}>${img.naturalWidth}`);
    }
    return res;
  });
  ok(!big.length, `visionneuse : aucune photo affichée plus grande que son fichier${big.length ? ' — ' + big.join(', ') : ''}`);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(500);

  // le bureau : l'état du moment, l'itinéraire, la licence
  const off = await p.evaluate(() => ({
    status: document.querySelector('[data-status]').textContent,
    hidden: document.querySelector('[data-status]').hidden,
    dir: document.querySelector('.office__go a').getAttribute('href'),
    lic: document.querySelector('.facts a[href*="myfloridalicense"]').getAttribute('href'),
    rel: [...document.querySelectorAll('a[target="_blank"]')].every((a) => /noopener/.test(a.rel)),
  }));
  ok(!off.hidden && /^(Open now, until 5 pm\.|Closed now\. We open (today|tomorrow|Monday) at 9 am\.)$/.test(off.status), `bureau : ouvert ou fermé à l’heure de Boca Raton (« ${off.status} »)`);
  ok(/google\.com\/maps\/dir/.test(off.dir) && /0FBFAAEFC1719C352CF00E0F73808757/.test(off.lic) && off.rel, 'bureau : l’itinéraire, la fiche de la licence ; les liens externes ouvrent un onglet en noopener');

  // le formulaire : erreurs, puis l'e-mail rédigé
  await p.evaluate(() => document.querySelector('#quote-form').scrollIntoView({block: 'center'}));
  await p.waitForTimeout(800);
  let mailto = '';
  p.on('framenavigated', (f) => f.url().startsWith('mailto:') && (mailto = f.url()));
  p.on('request', (r) => r.url().startsWith('mailto:') && (mailto = r.url()));
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(250);
  const e1 = await p.evaluate(() => ({
    name: document.getElementById('e-name').textContent,
    phone: document.getElementById('e-phone').textContent,
    inv: document.getElementById('f-name').getAttribute('aria-invalid'),
    focus: document.activeElement.id,
  }));
  ok(e1.name === 'Enter your name.' && /phone number or an email/.test(e1.phone) && e1.inv === 'true' && e1.focus === 'f-name', 'devis : vide, les erreurs sont dites et le focus va au premier champ');
  await p.fill('#f-name', 'Pat');
  await p.fill('#f-phone', '561-555');
  await p.fill('#f-email', 'pat@example');
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(250);
  const e2 = await p.evaluate(() => ({phone: document.getElementById('e-phone').textContent, email: document.getElementById('e-email').textContent, nameErr: document.getElementById('e-name').hidden, focus: document.activeElement.id}));
  ok(/10 digits/.test(e2.phone) && /name@example\.com/.test(e2.email) && e2.nameErr && e2.focus === 'f-phone', 'devis : un numéro trop court et une adresse incomplète sont signalés, le nom n’est plus en erreur');
  await p.fill('#f-phone', '561-555-0142');
  await p.fill('#f-email', 'pat@example.com');
  await p.check('input[name="what"][value="Kitchen"]');
  await p.check('input[name="what"][value="Pool"]');
  await p.fill('#f-details', 'Two islands, maybe a new pool finish.');
  await p.waitForTimeout(400);
  const chip = await p.evaluate(() => getComputedStyle(document.querySelector('input[value="Kitchen"] + span')).backgroundColor);
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(700);
  const done = await p.evaluate(() => ({shown: !document.querySelector('.form__done').hidden, focus: document.activeElement.classList.contains('form__done')}));
  ok(chip === 'rgb(16, 35, 58)' && done.shown && done.focus, 'devis : les sujets choisis passent à l’encre ; la note d’envoi apparaît et reçoit le focus');
  if (mailto) {
    const body = decodeURIComponent(mailto.split('body=')[1] || '');
    const subject = decodeURIComponent((mailto.split('subject=')[1] || '').split('&')[0]);
    ok(/^mailto:bocarcg@gmail\.com/.test(mailto) && subject === 'Free quote request: Kitchen, Pool' && /Name: Pat/.test(body) && /Phone: 561-555-0142/.test(body) && /About: Kitchen, Pool/.test(body) && /Two islands/.test(body), `devis : l’e-mail à bocarcg@gmail.com reprend le nom, le téléphone, les sujets et le message (« ${subject} »)`);
  } else console.log('· devis : navigation mailto non observée dans ce navigateur (contenu vérifié par la note)');
  await ctx.close();
}

/* ——— téléphone ——— */
{
  const ctx = await b.newContext(PHONE);
  const p = await open(ctx);
  await p.waitForTimeout(2400);
  const h = await p.evaluate(() => ({
    title: document.querySelector('.hero__title').getBoundingClientRect(),
    cta: document.querySelector('.hero__cta .btn').getBoundingClientRect(),
    menu: getComputedStyle(document.querySelector('.menu-btn')).display,
    tel: getComputedStyle(document.querySelector('.top__tel')).display,
  }));
  ok(h.title.right <= 390 && h.cta.bottom <= 844 && h.menu !== 'none' && h.tel === 'none', `téléphone : le titre tient, le bouton de devis visible sans défiler (${Math.round(h.cta.bottom)} px), le menu remplace les liens`);
  await p.screenshot({path: `${out}/t-accueil.png`});
  // la scène épinglée sous l'en-tête
  const g = await geo(p);
  const a = await stageAt(p, g, 0.2);
  const c = await stageAt(p, g, 0.95);
  const head = await p.evaluate(() => Math.round(document.querySelector('.top').getBoundingClientRect().bottom));
  const stageTop = await p.evaluate(() => Math.round(document.querySelector('.stage').getBoundingClientRect().top));
  ok(a.step === 0 && c.step === 2 && stageTop >= head && stageTop - head < 30, `téléphone : la scène reste sous l’en-tête pendant le passage (${stageTop - head} px dessous), de l’esquisse à la pièce construite`);
  await p.screenshot({path: `${out}/t-scene.png`});
  // le menu
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(600);
  await p.tap('.menu-btn');
  await p.waitForTimeout(400);
  const m1 = await p.evaluate(() => ({open: document.querySelector('.top').classList.contains('is-open'), exp: document.querySelector('.menu-btn').getAttribute('aria-expanded'), focus: document.activeElement.textContent, ov: document.documentElement.style.overflow, inert: document.querySelector('main').inert}));
  ok(m1.open && m1.exp === 'true' && m1.focus === 'Drawn first' && m1.ov === 'hidden' && m1.inert, 'téléphone : le menu s’ouvre, focus sur le premier lien, la page ne défile plus et ne se lit plus derrière');
  await p.screenshot({path: `${out}/t-menu.png`});
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
  const m2 = await p.evaluate(() => ({open: document.querySelector('.top').classList.contains('is-open'), focus: document.activeElement.className}));
  ok(!m2.open && /menu-btn/.test(m2.focus), 'téléphone : Échap referme le menu et rend le focus au bouton');
  await p.tap('.menu-btn');
  await p.waitForTimeout(400);
  await p.tap('.nav a[href="#office"]');
  await p.waitForTimeout(1900);
  const m3 = await p.evaluate(() => ({open: document.querySelector('.top').classList.contains('is-open'), top: Math.round(document.getElementById('office').getBoundingClientRect().top), ov: document.documentElement.style.overflow, inert: document.querySelector('main').inert}));
  ok(!m3.open && Math.abs(m3.top - 64) < 50 && m3.ov === '' && !m3.inert, `téléphone : un lien du menu le referme et mène au bureau (${m3.top} px)`);
  // la liste au doigt
  await p.evaluate(() => document.querySelector('.trades').scrollIntoView({block: 'start'}));
  await p.waitForTimeout(1900);
  await p.tap('.trade[data-trade="bathrooms"]');
  await p.waitForTimeout(900);
  const tl = await p.evaluate(() => ({top: document.querySelector('.trades__img.is-top')?.dataset.tradeImg, pressed: document.querySelector('.trade[data-trade="bathrooms"]').getAttribute('aria-pressed'), panel: document.querySelector('.trades__frame').getBoundingClientRect().bottom}));
  ok(tl.top === 'bathrooms' && tl.pressed === 'true' && tl.panel <= 844, `téléphone : toucher « Bathrooms, » change la photo, visible sur le même écran (bas à ${Math.round(tl.panel)} px)`);
  await p.screenshot({path: `${out}/t-liste.png`});
  // la visionneuse au doigt
  await p.evaluate(() => document.querySelector('.project--a .project__ph').scrollIntoView({block: 'center'}));
  await p.waitForTimeout(1600);
  await p.tap('.project--a .project__ph');
  await p.waitForTimeout(800);
  await p.evaluate(() => {
    const t = document.querySelector('.viewer__list');
    t.scrollTo({left: t.clientWidth * 3, behavior: 'instant'});
  });
  await p.waitForTimeout(600);
  const sv = await viewer(p);
  ok(sv.open && sv.count === '4 of 5', `téléphone : glisser dans la visionneuse passe aux photos suivantes (${sv.count})`);
  const fit = await p.evaluate(() => {
    const lis = [...document.querySelectorAll('.viewer__list > li')];
    const cur = lis.find((li) => Math.abs(li.getBoundingClientRect().left) < 5);
    const cap = cur.querySelector('figcaption').getBoundingClientRect();
    const img = cur.querySelector('img').getBoundingClientRect();
    return {widths: [...new Set(lis.map((li) => Math.round(li.getBoundingClientRect().width)))], cap: [Math.round(cap.left), Math.round(cap.right)], gap: Math.round(cap.top - img.bottom)};
  });
  ok(fit.widths.length === 1 && fit.widths[0] === 390 && fit.cap[0] >= 0 && fit.cap[1] <= 390 && fit.gap < 40, `téléphone : chaque photo de la visionneuse tient dans l’écran, sa légende juste dessous (${fit.widths} px, écart ${fit.gap} px)`);
  await p.screenshot({path: `${out}/t-visionneuse.png`});
  await p.tap('.viewer__close');
  await p.waitForTimeout(500);
  ok(!(await p.evaluate(() => document.querySelector('.viewer').open)), 'téléphone : la visionneuse se referme');
  await ctx.close();
}

/* ——— le clavier depuis le haut de la page ——— */
{
  const ctx = await b.newContext(DESK);
  const p = await open(ctx);
  await p.waitForTimeout(2300);
  const seq = [];
  for (let i = 0; i < 13; i++) {
    await p.keyboard.press('Tab');
    seq.push(
      await p.evaluate(() => {
        const el = document.activeElement;
        const cs = getComputedStyle(el);
        return {t: (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 34), ring: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2};
      }),
    );
  }
  const names = seq.map((s) => s.t);
  ok(
    names[0] === 'Skip to content' && /^Boca Remodeling Group/.test(names[1]) && names[2] === 'Drawn first' && names[5] === 'Visit us' && names[6] === '561-247-2727' && names[7] === 'Free quote' && names[8] === 'Get a free quote' && names[10] === '1 Sketched by hand',
    `clavier : évitement, logo, menu, téléphone, devis, puis l’accueil et ses étapes (${names.slice(0, 11).join(' › ')})`,
  );
  ok(seq.every((s) => s.ring), 'clavier : chaque élément atteint montre un contour de focus');
  // l'évitement mène au contenu : le titre de l'accueil prend le focus
  await p.focus('.skip');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(1600);
  const skip = await p.evaluate(() => document.activeElement.id);
  ok(skip === 'hero-title', `clavier : « Skip to content » met le focus sur le titre de l’accueil (${skip})`);
  await ctx.close();
}

/* ——— mouvement réduit ——— */
{
  const ctx = await b.newContext({...DESK, reducedMotion: 'reduce'});
  const p = await open(ctx);
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => ({
    cls: document.documentElement.className,
    pin: getComputedStyle(document.querySelector('.hero__pin')).position,
    track: document.querySelector('.hero__track').offsetHeight,
    wait: document.querySelectorAll('.rv-wait, .gw').length,
    clip: document.querySelector('.stage__layer[data-layer="0"]').style.clipPath,
  }));
  ok(r.cls === 'js' && r.pin === 'static' && r.track < 1100 && r.wait === 0 && r.clip === '', `mouvement réduit : défilement natif, pas d’ouverture, scène non épinglée, rien à faire apparaître (${r.track} px)`);
  await p.click('.steps__btn[data-step="2"]');
  await p.waitForTimeout(200);
  const r2 = await p.evaluate(() => ({step: [...document.querySelectorAll('.steps__btn')].findIndex((x) => x.hasAttribute('aria-current')), photo: getComputedStyle(document.querySelector('.stage__layer[data-layer="2"]')).visibility, y: scrollY}));
  ok(r2.step === 2 && r2.photo === 'visible' && r2.y === 0, 'mouvement réduit : « Built » montre la pièce construite tout de suite, sans faire défiler');
  await p.screenshot({path: `${out}/r-accueil.png`});
  await ctx.close();
}

/* ——— sans JavaScript ——— */
{
  const ctx = await b.newContext({...DESK, javaScriptEnabled: false});
  const p = await ctx.newPage();
  await p.goto(url);
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => ({
    imgs: [...document.querySelectorAll('.stage__img')].map((i) => Math.round(i.getBoundingClientRect().width)),
    title: getComputedStyle(document.querySelector('.hero__title')).opacity,
    copy: getComputedStyle(document.querySelector('.hero__copy')).opacity,
    texts: getComputedStyle(document.querySelectorAll('.steps__text')[2]).display,
    hint: document.querySelector('.trades__hint').hidden,
  }));
  ok(r.imgs.every((w) => w > 200) && r.title === '1' && r.copy === '1' && r.texts !== 'none' && r.hint, `sans JavaScript : les trois états côte à côte, le texte et les étapes lisibles (${r.imgs.join(', ')} px)`);
  await p.screenshot({path: `${out}/s-accueil.png`});
  await ctx.close();
}

/* ——— débordements ——— */
{
  const widths = [320, 360, 375, 390, 414, 480, 600, 700, 768, 820, 900, 1024, 1100, 1180, 1280, 1366, 1440, 1536, 1680, 1920];
  const bad = [];
  const hero = [];
  for (const w of widths) {
    const mobile = w < 700;
    const ctx = await b.newContext({viewport: {width: w, height: 900}, isMobile: mobile, hasTouch: mobile});
    const p = await ctx.newPage();
    await p.goto(url);
    await p.waitForTimeout(2200);
    const r = await p.evaluate((vw) => {
      const box = (s) => document.querySelector(s).getBoundingClientRect();
      const visible = [...document.querySelectorAll('.top > *')].filter((e) => getComputedStyle(e).display !== 'none' && !e.classList.contains('nav'));
      return {
        over: document.documentElement.scrollWidth - vw,
        title: Math.round(box('.hero__title').right),
        cta: Math.round(box('.hero__cta').right),
        head: Math.round(Math.max(...visible.map((e) => e.getBoundingClientRect().right))),
      };
    }, w);
    if (r.over > 0) bad.push(`${w}px (+${r.over})`);
    if (r.title > w || r.cta > w || r.head > w) hero.push(`${w}px (titre ${r.title}, en-tête ${r.head})`);
    await ctx.close();
  }
  ok(!bad.length, `débordements : aucun de 320 à 1920 px${bad.length ? ' — ' + bad.join(', ') : ''}`);
  ok(!hero.length, `en-tête et accueil : tout tient dans la page à toutes les largeurs${hero.length ? ' — ' + hero.join(', ') : ''}`);
}

ok(!errs.length, `aucune erreur dans la console${errs.length ? ' : ' + errs.join(' | ') : ''}`);
console.log(`\n${n - fails}/${n} essais réussis`);
await b.close();
process.exit(fails ? 1 : 0);
