// Essais des interactions : l'ouverture en Z, Lenis, l'en-tête (liens, partie courante, se range et revient), le cadran
// lié au défilement et la vraie date du jour, les photos qui s'ouvrent, la visionneuse (souris, clavier, doigt, retour
// du focus) et les gros plans qui y mènent, la fenêtre d'absence, le formulaire qui rédige l'e-mail, le menu du
// téléphone, le clavier depuis le haut de la page, le mouvement réduit, sans JavaScript, et les débordements de 320 à
// 1920 px. Le site est lu depuis dist/index.html (fichier unique). Captures dans <dossier>.
//   node tools/interact.mjs <dossier>
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
const jump = (p, sel, frac = 0) =>
  p.evaluate(([sel, frac]) => {
    const el = document.querySelector(sel);
    const r = el.getBoundingClientRect();
    window.scrollTo(0, r.top + scrollY + r.height * frac - innerHeight / 2);
  }, [sel, frac]);

/* ——— ordinateur ——— */
{
  const ctx = await b.newContext(DESK);
  const p = await open(ctx);
  await p.waitForTimeout(120);
  const early = await p.evaluate(() => getComputedStyle(document.querySelector('.hero__band')).clipPath);
  ok(/50%/.test(early), `ouverture : le bandeau photo commence fermé sur sa ligne d'horizon (${early})`);
  await p.waitForTimeout(3200);
  const o = await p.evaluate(() => ({
    in: document.querySelector('[data-hero]').classList.contains('is-in'),
    clip: getComputedStyle(document.querySelector('.hero__band')).clipPath,
    l2: getComputedStyle(document.querySelector('.hero__l2 .mask > span')).transform,
    lenis: document.documentElement.classList.contains('lenis'),
    l1: document.querySelector('.hero__l1').getBoundingClientRect(),
    l2box: document.querySelector('.hero__l2').getBoundingClientRect(),
    band: document.querySelector('.hero__band').getBoundingClientRect(),
    lede: document.querySelector('.hero__lede').getBoundingClientRect(),
    cta: document.querySelector('.hero__ctas .btn').getBoundingClientRect(),
  }));
  ok(o.in && /inset\(0/.test(o.clip) && (o.l2 === 'none' || o.l2 === 'matrix(1, 0, 0, 1, 0, 0)'), 'ouverture : la photo ouverte, les deux lignes en place');
  ok(o.lenis, 'défilement : Lenis actif');
  ok(o.l1.bottom <= o.band.top + 1 && o.l2box.top >= o.band.bottom - 1, 'accueil : la phrase au-dessus du bandeau, la fin en dessous');
  ok(o.l2box.right > 1300 && o.lede.left < 100 && o.lede.right <= o.l2box.left + 2, 'accueil : la fin de la phrase à droite, le texte et les boutons à gauche (le Z)');
  ok(o.cta.bottom <= 900, `accueil : le bouton de demande visible sans défiler (${Math.round(o.cta.bottom)} px)`);
  await p.screenshot({path: `${out}/o-accueil.png`});

  // les liens de l'en-tête
  await p.click('.nav a[href="#services"]');
  await p.waitForTimeout(1600);
  const s = await p.evaluate(() => ({
    top: Math.round(document.getElementById('services').getBoundingClientRect().top),
    hash: location.hash,
    cur: document.querySelector('.nav a[aria-current]')?.hash,
    focus: document.activeElement.id,
  }));
  ok(Math.abs(s.top - 80) < 40 && s.hash === '#services' && s.focus === 'services', `en-tête : « Services » mène à la section et y met le focus (${s.top} px, ${s.hash})`);
  ok(s.cur === '#services', 'en-tête : la partie courante est marquée dans le menu');

  // l'en-tête se range en descendant, revient en remontant
  await p.mouse.move(700, 500);
  await p.evaluate(() => document.activeElement.blur());
  await p.mouse.wheel(0, 600);
  await p.waitForTimeout(900);
  const hid = await p.evaluate(() => document.querySelector('[data-top]').classList.contains('is-hidden'));
  await p.mouse.wheel(0, -300);
  await p.waitForTimeout(900);
  const back = await p.evaluate(() => !document.querySelector('[data-top]').classList.contains('is-hidden'));
  ok(hid && back, `en-tête : se range quand on descend (${hid}), revient quand on remonte (${back})`);

  // le cadran : le repère avance au fil des quatre temps (on laisse d'abord la molette de Lenis finir sa course)
  await p.waitForTimeout(1800);
  const dates = [];
  for (const [i, f] of [[0, 0.5], [1, 0.5], [2, 0.5], [3, 0.6]]) {
    await jump(p, `[data-step="${i}"]`, f);
    await p.waitForTimeout(700);
    dates.push(await p.evaluate(() => ({
      date: document.querySelector('[data-date]').textContent,
      label: document.querySelector('[data-label]').textContent,
      marker: getComputedStyle(document.querySelector('[data-marker]')).display !== 'none',
      fill: document.querySelector('[data-fill]').getAttribute('d'),
      sticky: Math.round(document.querySelector('.year__dial').getBoundingClientRect().top),
    })));
  }
  const months = dates.map((d) => d.date.split(' ')[0]);
  ok(['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'].includes(months[0]) && months[1] === 'May' && ['Jun', 'Jul', 'Aug', 'Sep'].includes(months[2]) && dates[3].date === 'Oct 1',
    `cadran : la date suit les quatre temps (${dates.map((d) => d.date).join(', ')})`);
  ok(dates.every((d) => d.marker) && !dates[0].fill && dates[2].fill.length > 10, 'cadran : le repère est là, l’arc de l’été se remplit pendant l’été seulement');
  ok(dates.map((d) => d.label).join('|') === 'You’re here|We start|On site, every day|You’re home', 'cadran : l’étiquette du centre suit le temps de l’année');
  ok(dates.every((d) => Math.abs(d.sticky - dates[0].sticky) < 4), `cadran : il reste à l’écran pendant les quatre temps (${dates.map((d) => d.sticky).join(', ')} px)`);
  await jump(p, '[data-step="2"]', 0.5);
  await p.waitForTimeout(600);
  await p.screenshot({path: `${out}/o-cadran.png`});
  const today = await p.evaluate(() => ({t: document.querySelector('[data-today]').textContent, mark: document.querySelector('[data-today-mark]').getAttribute('visibility'), d: document.querySelector('[data-today-mark] path').getAttribute('d')}));
  const fmt = new Date().toLocaleDateString('en-US', {month: 'long', day: 'numeric'});
  ok(today.t.includes(fmt) && today.mark === null && today.d.length > 10, `cadran : la date du jour est marquée et dite (« ${today.t} »)`);

  // les photos des pièces s'ouvrent en entrant à l'écran (et se chargent)
  await jump(p, '.w--fire', 0.5);
  await p.waitForTimeout(1700);
  const fire = await p.evaluate(() => {
    const ph = document.querySelector('.w--fire .ph');
    const img = ph.querySelector('img');
    return {cls: ph.className, cover: getComputedStyle(ph, '::after').transform, loaded: img.complete && img.naturalWidth > 0};
  });
  ok(/is-in/.test(fire.cls) && /matrix\(1, 0, 0, 0,/.test(fire.cover) && fire.loaded, `pièces : la photo s’ouvre et se charge (${fire.cover})`);

  // la visionneuse : souris, clavier, retour du focus
  await p.click('.w--living .ph');
  await p.waitForTimeout(400);
  const v1 = await p.evaluate(() => ({open: document.querySelector('[data-viewer]').open, cap: document.querySelector('[data-vcap]').textContent, count: document.querySelector('[data-vcount]').textContent, focus: document.activeElement.textContent}));
  ok(v1.open && v1.cap === 'Living room, glass staircase' && v1.count === '1 of 12' && v1.focus === 'Close', `visionneuse : s’ouvre sur la photo choisie, focus sur « Close » (${v1.count})`);
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(150);
  const v2 = await p.evaluate(() => document.querySelector('[data-vcount]').textContent);
  await p.keyboard.press('ArrowLeft');
  await p.keyboard.press('ArrowLeft');
  await p.waitForTimeout(150);
  const v3 = await p.evaluate(() => document.querySelector('[data-vcount]').textContent);
  ok(v2 === '2 of 12' && v3 === '12 of 12', `visionneuse : flèches du clavier, et on boucle (${v2}, ${v3})`);
  await p.screenshot({path: `${out}/o-visionneuse.png`});
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  const v4 = await p.evaluate(() => ({open: document.querySelector('[data-viewer]').open, focus: document.activeElement.closest('.w--living') !== null, ov: document.documentElement.style.overflow}));
  ok(!v4.open && v4.focus && v4.ov === '', 'visionneuse : Échap referme, le focus revient sur la photo, la page défile à nouveau');

  // les gros plans mènent à leur pièce
  await jump(p, '.swatches', 0.5);
  await p.waitForTimeout(400);
  await p.click('[data-open="w-fire"]');
  await p.waitForTimeout(400);
  const g1 = await p.evaluate(() => ({cap: document.querySelector('[data-vcap]').textContent, count: document.querySelector('[data-vcount]').textContent}));
  ok(g1.cap === 'Fireplace wall' && g1.count === '4 of 12', `gros plans : la flamme ouvre la cheminée, dans la suite des pièces (${g1.count})`);
  await p.click('[data-vclose]');
  await p.waitForTimeout(300);
  await p.click('[data-open="d-vanity"]');
  await p.waitForTimeout(400);
  const g2 = await p.evaluate(() => ({cap: document.querySelector('[data-vcap]').textContent, count: document.querySelector('[data-vcount]').textContent, nav: document.querySelector('[data-vnext]').hidden}));
  ok(g2.count === '' && g2.nav && g2.cap.length > 3, 'gros plans : une photo hors de la suite s’ouvre seule, sans « Previous » ni « Next »');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);

  // les prestations : la photo se découvre au survol, à sa place
  await jump(p, '.svc__item:nth-child(4)', 0.5);
  await p.waitForTimeout(400);
  await p.hover('.svc__item:nth-child(4) .svc__name');
  await p.waitForTimeout(800);
  const sv = await p.evaluate(() => getComputedStyle(document.querySelector('.svc__item:nth-child(4) .svc__ph'), '::after').transform);
  ok(/matrix\(1, 0, 0, 0,/.test(sv), `prestations : la photo des cuisines se découvre au survol (${sv})`);

  // la fenêtre d'absence
  await jump(p, '[data-away]', 0.5);
  await p.selectOption('[data-leave]', '4');
  await p.selectOption('[data-back]', '9');
  await p.waitForTimeout(600);
  const aw = await p.evaluate(() => {
    const w = document.querySelector('[data-win]');
    const bar = document.querySelector('[data-bar]').getBoundingClientRect();
    const r = w.getBoundingClientRect();
    return {note: document.querySelector('[data-note]').textContent, on: w.classList.contains('is-on'), l: (r.left - bar.left) / bar.width, wd: r.width / bar.width};
  });
  ok(aw.on && Math.abs(aw.l - 4 / 12) < 0.01 && Math.abs(aw.wd - 5 / 12) < 0.01 && /whole condo season/.test(aw.note), `absence : de mai à octobre, la fenêtre couvre la saison (« ${aw.note} »)`);
  await p.selectOption('[data-leave]', '0');
  await p.selectOption('[data-back]', '2');
  await p.waitForTimeout(200);
  const aw2 = await p.evaluate(() => document.querySelector('[data-note]').textContent);
  ok(/outside the condo season/.test(aw2), `absence : un hiver ailleurs est hors saison (« ${aw2} »)`);
  await p.screenshot({path: `${out}/o-absence.png`});

  // le formulaire : erreurs, puis l'e-mail rédigé
  let mailto = '';
  p.on('framenavigated', (f) => f.url().startsWith('mailto:') && (mailto = f.url()));
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(200);
  const e1 = await p.evaluate(() => ({
    name: document.getElementById('e-name').textContent,
    email: document.getElementById('e-email').textContent,
    inv: document.getElementById('f-name').getAttribute('aria-invalid'),
    focus: document.activeElement.id,
  }));
  ok(e1.name === 'Enter your name.' && /email/.test(e1.email) && e1.inv === 'true' && e1.focus === 'f-name', 'demande : vide, les deux erreurs sont dites et le focus va au premier champ');
  await p.fill('#f-name', 'Pat');
  await p.fill('#f-email', 'pat@example');
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(200);
  const e2 = await p.evaluate(() => ({email: document.getElementById('e-email').textContent, nameErr: document.getElementById('e-name').hidden}));
  ok(/name@example\.com/.test(e2.email) && e2.nameErr, 'demande : une adresse incomplète est signalée, le nom n’est plus en erreur');
  await p.fill('#f-email', 'pat@example.com');
  await p.fill('#f-where', 'Pelican Bay');
  await p.fill('#f-msg', 'Kitchen and two baths.');
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(600);
  const done = await p.evaluate(() => ({shown: !document.querySelector('[data-done]').hidden, focus: document.activeElement.hasAttribute('data-done')}));
  ok(done.shown && done.focus, 'demande : la note d’envoi apparaît et reçoit le focus');
  if (mailto) {
    const body = decodeURIComponent(mailto.split('body=')[1] || '');
    ok(/Name: Pat/.test(body) && /Pelican Bay/.test(body) && /January to March/.test(body) && /Kitchen and two baths\./.test(body), 'demande : l’e-mail reprend le nom, le lieu, la fenêtre d’absence et le message');
  } else console.log('· demande : navigation mailto non observée dans ce navigateur (contenu vérifié par la note)');
  await ctx.close();
}

/* ——— téléphone ——— */
{
  const ctx = await b.newContext(PHONE);
  const p = await open(ctx);
  await p.waitForTimeout(3000);
  await p.screenshot({path: `${out}/t-accueil.png`});
  await p.tap('[data-menu]');
  await p.waitForTimeout(300);
  const m1 = await p.evaluate(() => ({open: !document.querySelector('[data-panel]').hidden, exp: document.querySelector('[data-menu]').getAttribute('aria-expanded'), focus: document.activeElement.textContent, ov: document.documentElement.style.overflow}));
  ok(m1.open && m1.exp === 'true' && m1.focus === 'Work' && m1.ov === 'hidden', 'téléphone : le menu s’ouvre, focus sur le premier lien, la page ne défile plus');
  await p.screenshot({path: `${out}/t-menu.png`});
  await p.tap('.panel__nav a[href="#contact"]');
  await p.waitForTimeout(1500);
  const m2 = await p.evaluate(() => ({open: !document.querySelector('[data-panel]').hidden, top: Math.round(document.getElementById('contact').getBoundingClientRect().top)}));
  ok(!m2.open && Math.abs(m2.top - 80) < 50, `téléphone : un lien du menu le referme et mène à la section (${m2.top} px)`);
  const d = await p.evaluate(() => ({date: document.querySelector('[data-date]').textContent, marker: getComputedStyle(document.querySelector('[data-marker]')).display, month: getComputedStyle(document.querySelector('.dial .month')).fontSize}));
  ok(d.date === 'May–Oct 1' && d.marker === 'none', 'téléphone : le cadran montre la saison entière, sans repère');
  const sw = await p.evaluate(() => {
    const s = document.querySelector('[data-swatches]');
    return {sw: s.scrollWidth, cw: s.clientWidth, doc: document.documentElement.scrollWidth};
  });
  ok(sw.sw > sw.cw + 100 && sw.doc === 390, 'téléphone : les gros plans défilent au doigt, sans élargir la page');
  // la visionneuse au doigt
  await jump(p, '.w--kitchen', 0.5);
  await p.waitForTimeout(800);
  await p.tap('.w--kitchen .ph');
  await p.waitForTimeout(400);
  const before = await p.evaluate(() => document.querySelector('[data-vcount]').textContent);
  await p.evaluate(() => {
    const img = document.querySelector('[data-vimg]');
    const r = img.getBoundingClientRect();
    const ev = (type, x) => img.dispatchEvent(new PointerEvent(type, {clientX: x, clientY: r.top + r.height / 2, bubbles: true, pointerType: 'touch'}));
    ev('pointerdown', r.left + r.width * 0.8);
    ev('pointerup', r.left + r.width * 0.2);
  });
  await p.waitForTimeout(300);
  const after = await p.evaluate(() => document.querySelector('[data-vcount]').textContent);
  ok(before === '2 of 12' && after === '3 of 12', `téléphone : glisser passe à la photo suivante (${before} → ${after})`);
  await p.screenshot({path: `${out}/t-visionneuse.png`});
  await p.tap('[data-vclose]');
  await p.waitForTimeout(400);
  ok(!(await p.evaluate(() => document.querySelector('[data-viewer]').open)), 'téléphone : la visionneuse se referme');
  await ctx.close();
}

/* ——— le clavier depuis le haut de la page ——— */
{
  const ctx = await b.newContext(DESK);
  const p = await open(ctx);
  await p.waitForTimeout(400);
  const seq = [];
  for (let i = 0; i < 10; i++) {
    await p.keyboard.press('Tab');
    seq.push(await p.evaluate(() => {
      const el = document.activeElement;
      const cs = getComputedStyle(el);
      return {t: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 28), ring: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2};
    }));
  }
  ok(seq[0].t === 'Skip to content' && /^Zynda Custom Homes/.test(seq[1].t) && seq[2].t === 'Work', `clavier : lien d’évitement, logo, puis le menu (${seq.slice(0, 4).map((s) => s.t).join(' › ')})`);
  ok(seq.every((s) => s.ring), 'clavier : chaque élément atteint montre un contour de focus');
  await ctx.close();
}

/* ——— mouvement réduit ——— */
{
  const ctx = await b.newContext({...DESK, reducedMotion: 'reduce'});
  const p = await open(ctx);
  await p.waitForTimeout(250);
  const r = await p.evaluate(() => ({
    lenis: document.documentElement.classList.contains('lenis'),
    band: getComputedStyle(document.querySelector('.hero__band')).clipPath,
    split: document.querySelectorAll('[data-lines] .mask').length,
    reveal: document.querySelectorAll('.reveal').length,
    date: document.querySelector('[data-date]').textContent,
  }));
  ok(!r.lenis && r.band === 'none' && r.split === 0 && r.reveal === 0, 'mouvement réduit : défilement natif, accueil en place, titres et photos sans animation');
  ok(r.date === 'May–Oct 1', 'mouvement réduit : le cadran montre la saison entière');
  await ctx.close();
}

/* ——— sans JavaScript ——— */
{
  const ctx = await b.newContext({...DESK, javaScriptEnabled: false});
  const p = await ctx.newPage();
  await p.goto(url);
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => ({
    band: getComputedStyle(document.querySelector('.hero__band')).clipPath,
    l2: getComputedStyle(document.querySelector('.hero__l2 .mask > span')).transform,
    lede: getComputedStyle(document.querySelector('.hero__lede')).opacity,
  }));
  ok(r.band === 'none' && r.l2 === 'none' && r.lede === '1', 'sans JavaScript : la phrase, la photo et le texte de l’accueil sont visibles');
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
    await p.waitForTimeout(200);
    const r = await p.evaluate((vw) => {
      const box = (s) => document.querySelector(s).getBoundingClientRect();
      return {
        over: document.documentElement.scrollWidth - vw,
        l1: Math.round(box('.hero__l1 .mask > span').width),
        l1w: Math.round(box('.hero__l1').width),
        l2r: Math.round(box('.hero__l2').right),
      };
    }, w);
    if (r.over > 0) bad.push(`${w}px (+${r.over})`);
    if (r.l1 > r.l1w + 1 || r.l2r > w) hero.push(`${w}px`);
    await ctx.close();
  }
  ok(!bad.length, `débordements : aucun de 320 à 1920 px${bad.length ? ' — ' + bad.join(', ') : ''}`);
  ok(!hero.length, `accueil : la phrase tient dans la page à toutes les largeurs${hero.length ? ' — ' + hero.join(', ') : ''}`);
}

ok(!errs.length, `aucune erreur dans la console${errs.length ? ' : ' + errs.join(' | ') : ''}`);
console.log(`\n${n - fails}/${n} essais réussis`);
await b.close();
process.exit(fails ? 1 : 0);
