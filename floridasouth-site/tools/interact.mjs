// Essais des interactions : l'ouverture (la liste qui se barre, la phrase qui s'écrit), les liens de l'en-tête, les
// cadres qui s'ouvrent au défilement, les avis mot à mot, la visionneuse (souris, clavier, doigt, retour du focus), le
// formulaire qui rédige l'e-mail, le menu du téléphone, le clavier depuis le haut de la page, le mouvement réduit, et
// les débordements de 320 à 1920 px. Le site est lu depuis dist/index.html (fichier unique). Captures dans <dossier>.
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
const open = async (ctx) => {
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url, {waitUntil: 'load'});
  return p;
};
const DESK = {viewport: {width: 1440, height: 900}};
const PHONE = {viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true};
const jump = (p, sel, off = 0) =>
  p.evaluate(([sel, off]) => {
    const el = document.querySelector(sel);
    window.scrollTo(0, el.getBoundingClientRect().top + scrollY + off);
  }, [sel, off]);

/* ——— ordinateur ——— */
{
  const ctx = await b.newContext(DESK);
  const p = await open(ctx);
  await p.waitForTimeout(300);
  const early = await p.evaluate(() => document.querySelectorAll('.todo li.is-struck').length);
  ok(early === 0, `ouverture : la liste se lit d'abord, rien de barré (${early})`);
  await p.waitForTimeout(3000);
  const o = await p.evaluate(() => ({
    struck: document.querySelectorAll('.todo li.is-struck').length,
    done: document.querySelector('[data-done]').classList.contains('is-in'),
    clip: getComputedStyle(document.querySelector('[data-done]')).clipPath,
    lenis: document.documentElement.classList.contains('lenis'),
    bars: [...document.querySelectorAll('.todo span')].map((s) => getComputedStyle(s).backgroundSize),
  }));
  ok(o.struck === 5 && o.bars.every((s) => s.startsWith('100%')), 'ouverture : les cinq lignes barrées, traits complets');
  ok(o.done && !/100%/.test(o.clip), `ouverture : « Consider it done. » écrite (${o.clip})`);
  ok(o.lenis, 'défilement : Lenis actif');
  // le trait passe au milieu des minuscules (entre le pied et la hauteur d'x)
  const mid = await p.evaluate(() => {
    const s = document.querySelector('.todo li:last-child span');
    const fs = parseFloat(getComputedStyle(s).fontSize);
    const pos = getComputedStyle(s).backgroundPositionY;
    return {fs, pos};
  });
  ok(Math.abs(parseFloat(mid.pos) / mid.fs - (0.721 - 0.028)) < 0.02, `ouverture : trait à mi-hauteur d'x (${mid.pos} pour ${mid.fs}px)`);
  // l'accueil : le titre au-dessus de la photo, le débord blanc sous le texte (pas de chevauchement)
  const hero = await p.evaluate(() => {
    const foot = document.querySelector('.hero__foot').getBoundingClientRect();
    const img = document.querySelector('.hero__photo img').getBoundingClientRect();
    // le débord de gauche commence à 18 % de la hauteur de la photo
    return {footBottom: foot.bottom, eave: img.top + img.height * 0.18, firstScreen: img.top + img.height * 0.18 < innerHeight};
  });
  ok(hero.eave - hero.footBottom > 16, `accueil : le débord blanc commence sous le texte (${Math.round(hero.eave - hero.footBottom)} px d'écart)`);
  ok(hero.firstScreen, 'accueil : le débord blanc est dans le premier écran');
  await p.screenshot({path: `${out}/d-accueil.png`});

  // liens de l'en-tête
  await p.click('.nav a[href="#houses"]');
  await p.waitForTimeout(1500);
  const nav = await p.evaluate(() => ({
    top: Math.round(document.getElementById('houses').getBoundingClientRect().top),
    head: document.querySelector('[data-top]').offsetHeight,
    current: document.querySelector('.nav a[aria-current]')?.hash,
    focus: document.activeElement.id,
    hash: location.hash,
  }));
  ok(Math.abs(nav.top - nav.head - 12) < 4 && nav.focus === 'houses' && nav.hash === '#houses', `en-tête : « Two houses » mène aux maisons, le focus suit (haut ${nav.top}, en-tête ${nav.head})`);
  ok(nav.current === '#houses', `en-tête : le lien courant est marqué (${nav.current})`);

  // les cadres : fermés plus bas, ouverts une fois passés
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(500);
  const c0 = await p.evaluate(() => getComputedStyle(document.querySelector('[data-bleed] .frame')).getPropertyValue('--c').trim());
  await jump(p, '[data-bleed]', -120);
  await p.waitForTimeout(900);
  const c1 = await p.evaluate(() => getComputedStyle(document.querySelector('[data-bleed] .frame')).getPropertyValue('--c').trim());
  ok(c0 === '1.0000' && parseFloat(c1) < 0.05, `cadres : la maison fermée plus bas (${c0}), ouverte en haut de l'écran (${c1})`);
  await jump(p, '.m-palms', -500);
  await p.waitForTimeout(900);
  await p.screenshot({path: `${out}/d-mosaique.png`});

  // les avis : un mot par élément, le texte inchangé
  const q = await p.evaluate(() => {
    const ld = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@graph'][0].review;
    return [...document.querySelectorAll('.quote blockquote p')].map((el, i) => ({
      same: el.textContent === ld[i].reviewBody,
      words: el.querySelectorAll('.w').length,
      count: ld[i].reviewBody.split(/\s+/).length,
    }));
  });
  ok(q.every((x) => x.same && x.words === x.count), `avis : mot à mot, texte identique aux données (${q.map((x) => x.words).join(', ')} mots)`);
  await jump(p, '.quote--a', -380);
  await p.waitForTimeout(900);
  const lit = await p.evaluate(() => parseFloat(document.querySelector('.quote--a').style.getPropertyValue('--lit')));
  ok(lit > 5 && lit < 62, `avis : la lecture avance avec le défilement (--lit ${lit})`);
  await p.screenshot({path: `${out}/d-avis.png`});

  // la visionneuse
  await jump(p, '.m-sign', -200);
  await p.waitForTimeout(700);
  await p.click('.m-sign .ph');
  await p.waitForTimeout(700);
  const v = await p.evaluate(() => {
    const img = document.querySelector('[data-vimg]');
    const r = img.getBoundingClientRect();
    const thumb = document.querySelector('.m-sign img');
    return {
      open: document.querySelector('[data-viewer]').open,
      focus: document.activeElement.getAttribute('aria-label'),
      count: document.querySelector('[data-vcount]').textContent,
      cap: document.querySelector('[data-vcap]').textContent,
      ratio: r.width / r.height,
      nat: thumb.naturalWidth / thumb.naturalHeight,
      inside: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight,
    };
  });
  ok(v.open && v.focus === 'Close the viewer', 'visionneuse : ouverte, le focus sur « fermer »');
  ok(v.count === '2 of 15' && v.cap.startsWith('Our job sign'), `visionneuse : légende et compteur (${v.count}, ${v.cap})`);
  ok(Math.abs(v.ratio - v.nat) < 0.02 && v.inside, `visionneuse : la photo garde ses proportions et tient à l'écran (${v.ratio.toFixed(3)} / ${v.nat.toFixed(3)})`);
  await p.screenshot({path: `${out}/d-visionneuse.png`});
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(400);
  const next = await p.evaluate(() => document.querySelector('[data-vcount]').textContent);
  await p.keyboard.press('ArrowLeft');
  await p.keyboard.press('ArrowLeft');
  await p.waitForTimeout(400);
  const prev = await p.evaluate(() => document.querySelector('[data-vcount]').textContent);
  ok(next === '3 of 15' && prev === '1 of 15', `visionneuse : flèches du clavier (${next}, puis ${prev})`);
  // le focus reste dans la visionneuse (le reste de la page est inerte : au bout, il passe au navigateur, jamais à la page)
  const trap = [];
  for (let i = 0; i < 6; i++) {
    await p.keyboard.press('Tab');
    trap.push(await p.evaluate(() => document.activeElement === document.body || !!document.activeElement.closest('[data-viewer]')));
  }
  ok(trap.every(Boolean), 'visionneuse : Tab ne sort pas vers la page');
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(350);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(800);
  const back = await p.evaluate(() => ({open: document.querySelector('[data-viewer]').open, li: document.activeElement.closest('li')?.className, lenis: !document.documentElement.classList.contains('lenis-stopped')}));
  ok(!back.open && back.li?.startsWith('m-sign') && back.lenis, `visionneuse : Échap referme, le focus revient sur la photo (${back.li}), la page défile de nouveau`);
  // clic à côté de la photo
  await p.click('.m-eaves .ph');
  await p.waitForTimeout(700);
  await p.mouse.click(8, 300);
  await p.waitForTimeout(800);
  ok(!(await p.evaluate(() => document.querySelector('[data-viewer]').open)), 'visionneuse : un clic à côté de la photo referme');

  // le formulaire
  await jump(p, '#estimate', -80);
  await p.waitForTimeout(800);
  await p.click('.form button[type="submit"]');
  const e1 = await p.evaluate(() => ({
    shown: ['name', 'reach', 'list'].filter((k) => !document.getElementById(`err-${k}`).hidden),
    focus: document.activeElement.id,
    invalid: [...document.querySelectorAll('[aria-invalid="true"]')].map((x) => x.id),
  }));
  ok(e1.shown.join() === 'name,reach,list' && e1.focus === 'f-name', `formulaire vide : trois erreurs, le focus sur le nom (${e1.shown.join(', ')})`);
  ok(e1.invalid.join() === 'f-name,f-phone,f-email,f-list', `formulaire vide : champs marqués (${e1.invalid.join(', ')})`);
  await p.fill('#f-name', 'Pat Example');
  await p.fill('#f-email', 'pat@example');
  await p.fill('#f-list', 'Fix the screen door.\n\n- Paint the guest room.\nPrice a new kitchen.');
  await p.click('.form button[type="submit"]');
  const e2 = await p.evaluate(() => ({reach: document.getElementById('err-reach').textContent, focus: document.activeElement.id, list: document.getElementById('err-list').hidden, name: document.getElementById('err-name').hidden}));
  ok(/name@example\.com/.test(e2.reach) && e2.focus === 'f-email' && e2.list && e2.name, 'formulaire : e-mail mal écrit signalé, les autres erreurs effacées');
  await p.fill('#f-email', 'pat@example.com');
  await p.fill('#f-where', 'Golden Gate');
  await p.fill('#f-who', 'A neighbor');
  let mailto = '';
  p.on('framenavigated', (f) => f.url().startsWith('mailto:') && (mailto = f.url()));
  await p.evaluate(() => {
    // l'ouverture de la messagerie est relevée au lieu d'être suivie
    window.__mail = '';
  });
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(1200);
  const r = await p.evaluate(() => ({ready: !document.querySelector('[data-ready]').hidden, text: document.querySelector('[data-ready-text]').textContent, focus: document.activeElement.hasAttribute('data-ready')}));
  ok(r.ready && r.focus, 'formulaire : la demande prête s’affiche et prend le focus');
  ok(/To: Jwhite@floridasouth\.us/.test(r.text) && /Subject: My list for Florida South Construction, Golden Gate/.test(r.text), 'formulaire : destinataire et objet');
  ok(/- Fix the screen door\.\n- Paint the guest room\.\n- Price a new kitchen\./.test(r.text), 'formulaire : la liste, une ligne par travail, sans lignes vides ni tirets doublés');
  ok(/Sent your way by: A neighbor/.test(r.text) && /Email: pat@example\.com/.test(r.text) && !/Phone:/.test(r.text), 'formulaire : qui les a recommandés, l’e-mail, pas de téléphone vide');
  await p.screenshot({path: `${out}/d-demande.png`});
  await p.click('[data-copy]');
  await p.waitForTimeout(300);
  const copied = await p.evaluate(() => document.querySelector('[data-copied]').textContent);
  ok(/Copied|Selected/.test(copied), `formulaire : copier le texte (${copied})`);
  await ctx.close();
}

/* ——— clavier depuis le haut de la page ——— */
{
  const ctx = await b.newContext(DESK);
  const p = await open(ctx);
  await p.waitForTimeout(300);
  const order = [];
  for (let i = 0; i < 10; i++) {
    await p.keyboard.press('Tab');
    order.push(await p.evaluate(() => {
      const a = document.activeElement;
      const cs = getComputedStyle(a);
      return `${a.textContent.trim().replace(/\s+/g, ' ').slice(0, 24) || a.getAttribute('aria-label')}${cs.outlineStyle === 'none' ? ' [sans contour]' : ''}`;
    }));
  }
  console.log('  ordre :', order.join(' › '));
  ok(order[0].startsWith('Skip to content'), 'clavier : le lien d’évitement en premier');
  ok(order.slice(1, 10).every((x) => !x.includes('[sans contour]')), 'clavier : chaque arrêt a un contour visible');
  await p.keyboard.press('Shift+Tab');
  await p.keyboard.press('Shift+Tab');
  await p.keyboard.press('Shift+Tab');
  await p.keyboard.press('Shift+Tab');
  await p.keyboard.press('Shift+Tab');
  await p.keyboard.press('Shift+Tab');
  await p.keyboard.press('Shift+Tab');
  await p.keyboard.press('Shift+Tab');
  await p.keyboard.press('Shift+Tab');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(1200);
  ok(await p.evaluate(() => document.activeElement.id === 'main'), 'clavier : le lien d’évitement mène au contenu');
  await ctx.close();
}

/* ——— téléphone ——— */
{
  const ctx = await b.newContext(PHONE);
  const p = await open(ctx);
  await p.waitForTimeout(3000);
  await p.screenshot({path: `${out}/t-accueil.png`});
  const call = await p.evaluate(() => {
    const a = document.querySelector('.top__call');
    const r = a.getBoundingClientRect();
    return {href: a.getAttribute('href'), visible: r.width > 0 && r.top < 80, h: r.height};
  });
  ok(call.href === 'tel:+12394494477' && call.visible && call.h >= 44, 'téléphone : « Call » en haut de l’écran, 44 px');
  await p.tap('[data-menu]');
  await p.waitForTimeout(300);
  const m = await p.evaluate(() => ({
    open: !document.querySelector('[data-panel]').hidden,
    exp: document.querySelector('[data-menu]').getAttribute('aria-expanded'),
    label: document.querySelector('[data-menu]').textContent,
    focus: document.activeElement.textContent,
  }));
  ok(m.open && m.exp === 'true' && m.label === 'Close' && m.focus === 'What we do', 'téléphone : le menu s’ouvre, le focus sur le premier lien');
  await p.screenshot({path: `${out}/t-menu.png`});
  await p.tap('.menu a[href="#judson"]');
  await p.waitForTimeout(1500);
  const m2 = await p.evaluate(() => ({open: !document.querySelector('[data-panel]').hidden, top: Math.round(document.getElementById('judson').getBoundingClientRect().top)}));
  ok(!m2.open && Math.abs(m2.top - 62 - 12) < 6, `téléphone : un lien du menu le referme et mène à la section (${m2.top})`);
  await p.tap('[data-menu]');
  await p.keyboard.press('Escape');
  ok(await p.evaluate(() => document.querySelector('[data-panel]').hidden && document.activeElement.hasAttribute('data-menu')), 'téléphone : Échap referme le menu, le focus revient au bouton');
  // la visionneuse au doigt
  await jump(p, '.m-pines', -100);
  await p.waitForTimeout(600);
  await p.tap('.m-pines .ph');
  await p.waitForTimeout(700);
  const before = await p.evaluate(() => document.querySelector('[data-vcount]').textContent);
  await p.evaluate(() => {
    const st = document.querySelector('[data-stage]');
    const ev = (type, x) => st.dispatchEvent(new PointerEvent(type, {pointerType: 'touch', clientX: x, clientY: 400, bubbles: true}));
    ev('pointerdown', 300);
    ev('pointermove', 220);
    ev('pointermove', 120);
    ev('pointerup', 120);
  });
  await p.waitForTimeout(500);
  const after = await p.evaluate(() => document.querySelector('[data-vcount]').textContent);
  ok(before === '8 of 15' && after === '9 of 15', `téléphone : glisser passe à la photo suivante (${before} → ${after})`);
  await p.screenshot({path: `${out}/t-visionneuse.png`});
  await p.tap('[data-vclose]');
  await p.waitForTimeout(700);
  ok(!(await p.evaluate(() => document.querySelector('[data-viewer]').open)), 'téléphone : la visionneuse se referme');
  await ctx.close();
}

/* ——— mouvement réduit ——— */
{
  const ctx = await b.newContext({...DESK, reducedMotion: 'reduce'});
  const p = await open(ctx);
  await p.waitForTimeout(250);
  const r = await p.evaluate(() => ({
    done: document.querySelector('[data-todo]').classList.contains('is-done') && document.querySelector('[data-done]').classList.contains('is-in'),
    lenis: document.documentElement.classList.contains('lenis'),
    words: document.querySelectorAll('.quote .w').length,
    clip: getComputedStyle(document.querySelector('[data-bleed] .frame')).clipPath,
    bars: [...document.querySelectorAll('.todo span')].every((s) => getComputedStyle(s).backgroundSize.startsWith('100%')),
  }));
  ok(r.done && r.bars, 'mouvement réduit : la liste déjà barrée, la phrase déjà là');
  ok(!r.lenis && r.words === 0 && r.clip === 'none', 'mouvement réduit : défilement natif, avis entiers, cadres ouverts');
  await p.click('.m-sign .ph');
  await p.waitForTimeout(100);
  ok(await p.evaluate(() => document.querySelector('[data-viewer]').open), 'mouvement réduit : la visionneuse s’ouvre sans animation');
  await ctx.close();
}

/* ——— sans JavaScript ——— */
{
  const ctx = await b.newContext({...DESK, javaScriptEnabled: false});
  const p = await ctx.newPage();
  await p.goto(url);
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => ({
    bars: [...document.querySelectorAll('.todo span')].every((s) => getComputedStyle(s).backgroundSize.startsWith('100%')),
    clip: getComputedStyle(document.querySelector('[data-done]')).clipPath,
  }));
  ok(r.bars && r.clip === 'none', 'sans JavaScript : la liste barrée et la phrase visibles');
  await ctx.close();
}

/* ——— débordements ——— */
{
  const widths = [320, 360, 375, 390, 414, 480, 600, 700, 768, 820, 900, 1024, 1100, 1180, 1280, 1366, 1440, 1536, 1680, 1920];
  const bad = [];
  for (const w of widths) {
    const mobile = w < 700;
    const ctx = await b.newContext({viewport: {width: w, height: 900}, isMobile: mobile, hasTouch: mobile});
    const p = await ctx.newPage();
    await p.goto(url);
    await p.waitForTimeout(150);
    const over = await p.evaluate((vw) => document.documentElement.scrollWidth - vw, w);
    if (over > 0) bad.push(`${w}px (+${over})`);
    await ctx.close();
  }
  ok(!bad.length, `débordements : aucun de 320 à 1920 px${bad.length ? ' — ' + bad.join(', ') : ''}`);
}

ok(!errs.length, `aucune erreur dans la console${errs.length ? ' : ' + errs.join(' | ') : ''}`);
console.log(`\n${n - fails}/${n} essais réussis`);
await b.close();
process.exit(fails ? 1 : 0);
