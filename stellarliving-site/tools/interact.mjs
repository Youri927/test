// Essais des interactions : l'ouverture (la photo, l'avis en pâle, les quatre passages à l'encre), Lenis, l'en-tête
// (liens, partie courante, se range et revient), la visite figée qui avance au défilement, la visionneuse (souris,
// clavier, retour du focus), les avis par sujet et les liens des prestations qui y mènent, le formulaire qui rédige
// l'e-mail, le menu du téléphone, la visite et les chantiers au doigt, le clavier depuis le haut de la page, le
// mouvement réduit, sans JavaScript, les photos jamais agrandies, et les débordements de 320 à 1920 px.
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
const INK = 'rgb(42, 84, 114)';
const state = (p) =>
  p.evaluate(() => ({
    open: document.querySelector('[data-viewer]').open,
    title: document.querySelector('[data-v-title]').textContent,
    count: document.querySelector('[data-v-count]').textContent,
    focus: document.activeElement.textContent.trim(),
  }));

/* ——— ordinateur ——— */
{
  const ctx = await b.newContext(DESK);
  const p = await open(ctx);
  await p.waitForTimeout(150);
  const early = await p.evaluate(() => ({
    clip: getComputedStyle(document.querySelector('.hero__photo .ph')).clipPath,
    mark: getComputedStyle(document.querySelector('.skim mark')).color,
  }));
  const shut = parseFloat((early.clip.match(/inset\(([\d.]+)%/) || [])[1] || 0);
  ok(shut > 50 && early.mark !== 'rgb(42, 84, 114)', `ouverture : la photo commence fermée, les passages commencent en pâle (${early.clip})`);
  await p.waitForTimeout(3400);
  const o = await p.evaluate(() => ({
    in: document.querySelector('.hero').classList.contains('is-in'),
    clip: getComputedStyle(document.querySelector('.hero__photo .ph')).clipPath,
    marks: [...document.querySelectorAll('.skim mark')].map((m) => getComputedStyle(m).color),
    text: getComputedStyle(document.querySelector('.skim p')).color,
    lenis: document.documentElement.classList.contains('lenis'),
    quote: document.querySelector('.hero__quote').getBoundingClientRect(),
    h1: document.querySelector('.hero__h1').getBoundingClientRect(),
    photo: document.querySelector('.hero__photo').getBoundingClientRect(),
    cta: document.querySelector('.hero__act .btn').getBoundingClientRect(),
  }));
  ok(o.in && /inset\(0/.test(o.clip), 'ouverture : la photo est ouverte');
  ok(o.marks.length === 4 && o.marks.every((c) => c === 'rgb(42, 84, 114)') && o.text !== 'rgb(42, 84, 114)', `ouverture : les quatre passages à l’encre, le reste de l’avis en pâle (${o.text})`);
  ok(o.lenis, 'défilement : Lenis actif');
  ok(o.quote.bottom <= o.h1.top && o.photo.left > o.quote.right, 'accueil : l’avis, puis la phrase qui dit qui ils sont ; la photo à droite');
  ok(o.cta.bottom <= 900, `accueil : le bouton de demande visible sans défiler (${Math.round(o.cta.bottom)} px)`);
  await p.screenshot({path: `${out}/o-accueil.png`});

  // les liens de l'en-tête
  await p.click('.nav a[href="#services"]');
  await p.waitForTimeout(1700);
  const s = await p.evaluate(() => ({
    top: Math.round(document.getElementById('services').getBoundingClientRect().top),
    hash: location.hash,
    cur: document.querySelector('.nav a[aria-current]')?.getAttribute('href'),
    focus: document.activeElement.id,
  }));
  ok(Math.abs(s.top) < 40 && s.hash === '#services' && s.focus === 'svc-title', `en-tête : « Services » mène à la section et met le focus sur son titre (${s.top} px, ${s.hash})`);
  ok(s.cur === '#services', 'en-tête : la partie courante est marquée dans le menu');

  // l'en-tête se range en descendant, revient en remontant
  await p.mouse.move(700, 500);
  await p.evaluate(() => document.activeElement.blur());
  await p.mouse.wheel(0, 700);
  await p.waitForTimeout(1000);
  const hid = await p.evaluate(() => document.querySelector('[data-top]').classList.contains('is-hidden'));
  await p.mouse.wheel(0, -300);
  await p.waitForTimeout(1000);
  const back = await p.evaluate(() => !document.querySelector('[data-top]').classList.contains('is-hidden'));
  ok(hid && back, `en-tête : se range quand on descend (${hid}), revient quand on remonte (${back})`);
  await p.waitForTimeout(1500);

  // la visite : la section se fige, la rangée avance, l'heure et la pièce suivent
  const w = await p.evaluate(() => {
    const el = document.querySelector('[data-walk]');
    return {pinned: el.classList.contains('is-pinned'), top: el.getBoundingClientRect().top + scrollY, dist: parseFloat(getComputedStyle(el).getPropertyValue('--walk-dist'))};
  });
  ok(w.pinned && w.dist > 1000, `visite : figée sur ordinateur, ${Math.round(w.dist)} px de défilement`);
  const steps = [];
  for (const f of [0, 0.33, 0.66, 1]) {
    await p.evaluate(([t, d, ff]) => window.scrollTo(0, t + d * ff), [w.top, w.dist, f]);
    await p.waitForTimeout(900);
    steps.push(
      await p.evaluate(() => ({
        time: document.querySelector('[data-now-time]').textContent,
        room: document.querySelector('[data-now-room]').textContent,
        pin: Math.round(document.querySelector('[data-walk-pin]').getBoundingClientRect().top),
        x: new DOMMatrix(getComputedStyle(document.querySelector('[data-walk-track]')).transform).m41,
        cur: document.querySelectorAll('.stop.is-current').length,
      })),
    );
  }
  ok(steps[0].time === '10:38' && steps[0].room === 'Kitchen' && steps[3].time === '10:45' && steps[3].room === 'Shower floor', `visite : de 10:38 (cuisine) à 10:45 (sol de la douche) — ${steps.map((x) => `${x.time} ${x.room}`).join(', ')}`);
  ok(steps.every((x) => x.pin === 0 && x.cur === 1) && steps[1].x < steps[0].x && steps[3].x < steps[2].x, 'visite : la section reste à l’écran, la rangée avance, une seule pièce en cours');
  await p.evaluate(([t, d]) => window.scrollTo(0, t + d * 0.5), [w.top, w.dist]);
  await p.waitForTimeout(900);
  await p.screenshot({path: `${out}/o-visite.png`});
  // une étape ouvre la visionneuse à sa photo
  await p.click('.stop[data-room="Lanai"] .stop__ph');
  await p.waitForTimeout(700);
  const v1 = await state(p);
  ok(v1.open && v1.count === '15 of 24' && /November 3, 2025/.test(v1.title) && v1.focus === 'Close', `visionneuse : le lanai ouvre la 15e photo des 24, focus sur « Close » (${v1.count}, ${v1.title})`);
  const cap = await p.evaluate(() => document.querySelectorAll('.viewer__track figcaption')[14].textContent);
  ok(cap === 'Lanai, 10:43 am', `visionneuse : la légende dit la pièce et l’heure (« ${cap} »)`);
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(500);
  const v2 = await state(p);
  await p.keyboard.press('End');
  await p.waitForTimeout(500);
  const v3 = await p.evaluate(() => ({count: document.querySelector('[data-v-count]').textContent, next: document.querySelector('[data-v-next]').disabled, overflow: document.documentElement.style.overflow}));
  ok(v2.count === '16 of 24' && v3.count === '24 of 24' && v3.next && v3.overflow === 'hidden', `visionneuse : flèche et Fin, le bouton suivant s’éteint au bout, la page ne défile plus derrière (${v2.count}, ${v3.count})`);
  await p.screenshot({path: `${out}/o-visionneuse.png`});
  await p.keyboard.press('Escape');
  await p.waitForTimeout(500);
  const v4 = await p.evaluate(() => ({open: document.querySelector('[data-viewer]').open, focus: document.activeElement.closest('.stop')?.dataset.room, ov: document.documentElement.style.overflow}));
  ok(!v4.open && v4.focus === 'Lanai' && v4.ov === '', 'visionneuse : Échap referme, le focus revient sur la photo du lanai, la page défile à nouveau');

  // les chantiers : chaque carte ouvre son reportage
  await p.evaluate(() => document.querySelector('.card__ph[data-set="bw24"]').scrollIntoView({block: 'center'}));
  await p.waitForTimeout(1400);
  const reveal = await p.evaluate(() => document.querySelector('.card__ph[data-set="bw24"]').classList.contains('is-in'));
  await p.click('.card__ph[data-set="bw24"]');
  await p.waitForTimeout(700);
  const c1 = await state(p);
  ok(reveal && c1.open && c1.count === '1 of 14' && c1.title === 'Breakwater, Pelican Bay, November 1, 2024', `chantiers : la photo s’est découverte, la carte ouvre ses 14 photos (« ${c1.title} »)`);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);

  // les avis par sujet
  await p.evaluate(() => document.querySelector('#reviews .topics').scrollIntoView({block: 'start'}));
  await p.waitForTimeout(800);
  await p.click('[data-topic="time"]');
  await p.waitForTimeout(700);
  const r1 = await p.evaluate(() => ({
    status: document.querySelector('[data-status]').textContent,
    hits: [...document.querySelectorAll('.rev mark.is-hit')].map((m) => m.textContent),
    miss: document.querySelectorAll('.rev.is-miss').length,
    pressed: document.querySelector('[data-topic="time"]').getAttribute('aria-pressed'),
    hitColor: getComputedStyle(document.querySelector('.rev mark.is-hit')).color,
    line: getComputedStyle(document.querySelector('.rev mark.is-hit')).textDecorationColor,
    pale: getComputedStyle(document.querySelector('.rev.is-miss blockquote p')).color,
  }));
  ok(r1.status === 'Five of the twelve reviews talk about time and budget.' && r1.miss === 7 && r1.pressed === 'true', `avis : « Time and budget » fait ressortir cinq avis (« ${r1.status} »)`);
  ok(r1.hits.includes('came in on time and on budget') && r1.hitColor === INK && r1.line === 'rgb(144, 156, 66)' && r1.pale !== INK, `avis : les passages à l’encre, soulignés d’olive, le reste en pâle (${r1.hits.length} passages)`);
  await p.evaluate(() => window.scrollBy(0, 300));
  await p.waitForTimeout(600);
  await p.screenshot({path: `${out}/o-avis.png`});
  await p.click('[data-topic="all"]');
  await p.waitForTimeout(500);
  const r2 = await p.evaluate(() => ({status: document.querySelector('[data-status]').textContent, on: document.querySelector('[data-revs]').classList.contains('is-on')}));
  ok(r2.status === 'All twelve reviews.' && !r2.on, 'avis : « Everything » rend les douze avis tels quels');

  // les prestations renvoient à leurs preuves
  await p.evaluate(() => document.querySelector('[data-goto-topic="storm"]').scrollIntoView({block: 'center'}));
  await p.waitForTimeout(700);
  await p.click('[data-goto-topic="storm"]');
  await p.waitForTimeout(1900);
  const g = await p.evaluate(() => ({
    status: document.querySelector('[data-status]').textContent,
    focus: document.activeElement.dataset.topic,
    top: Math.round(document.querySelector('#reviews .topics').getBoundingClientRect().top),
  }));
  ok(g.status === 'Two of the twelve reviews talk about storm repairs.' && g.focus === 'storm' && g.top > 0 && g.top < 200, `prestations : « Read the two reviews » mène aux avis sur les ouragans (« ${g.status} », ${g.top} px)`);
  await p.evaluate(() => document.querySelector('.svc button[data-set="se"]').scrollIntoView({block: 'center'}));
  await p.waitForTimeout(600);
  await p.click('.svc button[data-set="se"]');
  await p.waitForTimeout(700);
  const se = await state(p);
  ok(se.open && se.count === '1 of 12' && /Screen enclosures/.test(se.title), `prestations : « See the photos » ouvre les cages de piscine (« ${se.title} »)`);
  // aucune photo n'est montrée plus grande que son fichier
  const big = await p.evaluate(async () => {
    const out = [];
    for (const li of document.querySelectorAll('.viewer__track li')) {
      li.scrollIntoView({inline: 'center'});
      const img = li.querySelector('img');
      img.loading = 'eager';
      if (!img.complete) await new Promise((r) => (img.onload = img.onerror = r));
      const r = img.getBoundingClientRect();
      if (r.width > img.naturalWidth + 1) out.push(`${img.alt.slice(0, 30)} ${Math.round(r.width)}>${img.naturalWidth}`);
    }
    return out;
  });
  ok(!big.length, `visionneuse : les petites photos des cages restent à leur taille${big.length ? ' — ' + big.join(', ') : ''}`);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);

  // le formulaire : erreurs, puis l'e-mail rédigé
  await p.evaluate(() => document.querySelector('[data-form]').scrollIntoView({block: 'center'}));
  await p.waitForTimeout(600);
  let mailto = '';
  p.on('framenavigated', (f) => f.url().startsWith('mailto:') && (mailto = f.url()));
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(250);
  const e1 = await p.evaluate(() => ({
    name: document.getElementById('e-name').textContent,
    phone: document.getElementById('e-phone').textContent,
    inv: document.getElementById('f-name').getAttribute('aria-invalid'),
    focus: document.activeElement.id,
  }));
  ok(e1.name === 'Enter your name.' && /phone number or an email/.test(e1.phone) && e1.inv === 'true' && e1.focus === 'f-name', 'demande : vide, les erreurs sont dites et le focus va au premier champ');
  await p.fill('#f-name', 'Pat');
  await p.fill('#f-email', 'pat@example');
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(250);
  const e2 = await p.evaluate(() => ({email: document.getElementById('e-email').textContent, nameErr: document.getElementById('e-name').hidden, phoneErr: document.getElementById('e-phone').hidden}));
  ok(/name@example\.com/.test(e2.email) && e2.nameErr && e2.phoneErr, 'demande : une adresse incomplète est signalée, le nom et le téléphone ne sont plus en erreur');
  await p.fill('#f-email', 'pat@example.com');
  await p.selectOption('#f-kind', 'Whole condo or home');
  await p.fill('#f-where', 'Pelican Bay');
  await p.fill('#f-msg', 'Kitchen and two baths.');
  await p.click('.form button[type="submit"]');
  await p.waitForTimeout(700);
  const done = await p.evaluate(() => ({shown: !document.querySelector('[data-done]').hidden, focus: document.activeElement.hasAttribute('data-done')}));
  ok(done.shown && done.focus, 'demande : la note d’envoi apparaît et reçoit le focus');
  if (mailto) {
    const body = decodeURIComponent(mailto.split('body=')[1] || '');
    const subject = decodeURIComponent((mailto.split('subject=')[1] || '').split('&')[0]);
    ok(/Name: Pat/.test(body) && /Project: Whole condo or home/.test(body) && /Where: Pelican Bay/.test(body) && /Kitchen and two baths\./.test(body) && /Free estimate request/.test(subject), 'demande : l’e-mail reprend le nom, le projet, le lieu et le message');
  } else console.log('· demande : navigation mailto non observée dans ce navigateur (contenu vérifié par la note)');
  await ctx.close();
}

/* ——— téléphone ——— */
{
  const ctx = await b.newContext(PHONE);
  const p = await open(ctx);
  await p.waitForTimeout(3300);
  await p.screenshot({path: `${out}/t-accueil.png`});
  await p.tap('[data-menu-btn]');
  await p.waitForTimeout(300);
  const m1 = await p.evaluate(() => ({open: !document.querySelector('[data-menu]').hidden, exp: document.querySelector('[data-menu-btn]').getAttribute('aria-expanded'), focus: document.activeElement.textContent, ov: document.documentElement.style.overflow}));
  ok(m1.open && m1.exp === 'true' && m1.focus === 'Work' && m1.ov === 'hidden', 'téléphone : le menu s’ouvre, focus sur le premier lien, la page ne défile plus');
  await p.screenshot({path: `${out}/t-menu.png`});
  await p.tap('.menu a[href="#contact"]');
  await p.waitForTimeout(1600);
  const m2 = await p.evaluate(() => ({open: !document.querySelector('[data-menu]').hidden, top: Math.round(document.getElementById('contact').getBoundingClientRect().top), ov: document.documentElement.style.overflow}));
  ok(!m2.open && Math.abs(m2.top) < 50 && m2.ov === '', `téléphone : un lien du menu le referme et mène à la section (${m2.top} px)`);
  const strips = await p.evaluate(() => {
    const t = document.querySelector('[data-walk-track]');
    const bw = document.querySelector('.bw');
    return {pinned: document.querySelector('[data-walk]').classList.contains('is-pinned'), t: t.scrollWidth > t.clientWidth + 200, bw: bw.scrollWidth > bw.clientWidth + 100, doc: document.documentElement.scrollWidth};
  });
  ok(!strips.pinned && strips.t && strips.bw && strips.doc === 390, 'téléphone : la visite et les chantiers défilent au doigt, sans élargir la page');
  // la visite au doigt : la pièce en cours suit la rangée
  await p.evaluate(() => {
    const t = document.querySelector('[data-walk-track]');
    t.scrollTo({left: t.querySelectorAll('.stop')[5].offsetLeft - t.offsetLeft, behavior: 'instant'});
  });
  await p.waitForTimeout(400);
  const room = await p.evaluate(() => document.querySelector('[data-now-room]').textContent);
  ok(room === 'Lanai', `téléphone : la pièce en cours suit la rangée (« ${room} »)`);
  // la visionneuse au doigt
  await p.evaluate(() => document.querySelector('.card__ph[data-set="bwc"]').scrollIntoView({block: 'center', inline: 'center'}));
  await p.waitForTimeout(900);
  await p.tap('.card__ph[data-set="bwc"]');
  await p.waitForTimeout(600);
  await p.evaluate(() => {
    const t = document.querySelector('[data-v-track]');
    t.scrollTo({left: t.clientWidth * 2, behavior: 'instant'});
  });
  await p.waitForTimeout(500);
  const sv = await state(p);
  ok(sv.open && sv.count === '3 of 16', `téléphone : glisser dans la visionneuse passe aux photos suivantes (${sv.count})`);
  await p.screenshot({path: `${out}/t-visionneuse.png`});
  await p.tap('[data-v-close]');
  await p.waitForTimeout(400);
  ok(!(await p.evaluate(() => document.querySelector('[data-viewer]').open)), 'téléphone : la visionneuse se referme');
  await ctx.close();
}

/* ——— le clavier depuis le haut de la page ——— */
{
  const ctx = await b.newContext(DESK);
  const p = await open(ctx);
  await p.waitForTimeout(500);
  const seq = [];
  for (let i = 0; i < 12; i++) {
    await p.keyboard.press('Tab');
    seq.push(
      await p.evaluate(() => {
        const el = document.activeElement;
        const cs = getComputedStyle(el);
        return {t: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30), ring: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2};
      }),
    );
  }
  ok(seq[0].t === 'Skip to content' && /^Stellar Living Homes/.test(seq[1].t) && seq[2].t === 'Work' && seq[6].t === '908-507-2088' && seq[7].t === 'Free estimate', `clavier : évitement, logo, menu, téléphone, demande (${seq.slice(0, 8).map((s) => s.t).join(' › ')})`);
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
    clip: getComputedStyle(document.querySelector('.hero__photo .ph')).clipPath,
    mark: getComputedStyle(document.querySelector('.skim mark')).color,
    pinned: document.querySelector('[data-walk]').classList.contains('is-pinned'),
    rise: getComputedStyle(document.querySelector('.rise > span')).transform,
  }));
  ok(!r.lenis && r.clip === 'none' && r.mark === INK && (r.rise === 'none' || r.rise === 'matrix(1, 0, 0, 1, 0, 0)'), 'mouvement réduit : défilement natif, accueil en place et déjà lu, titres sans animation');
  ok(!r.pinned, 'mouvement réduit : la visite devient une rangée qu’on fait défiler');
  await ctx.close();
}

/* ——— sans JavaScript ——— */
{
  const ctx = await b.newContext({...DESK, javaScriptEnabled: false});
  const p = await ctx.newPage();
  await p.goto(url);
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => ({
    clip: getComputedStyle(document.querySelector('.hero__photo .ph')).clipPath,
    quote: getComputedStyle(document.querySelector('.skim p')).opacity,
    mark: getComputedStyle(document.querySelector('.skim mark')).color,
    act: getComputedStyle(document.querySelector('.hero__act')).opacity,
    card: getComputedStyle(document.querySelector('.card__ph')).clipPath,
  }));
  ok(r.clip === 'none' && r.quote === '1' && r.mark === INK && r.act === '1' && r.card === 'none', 'sans JavaScript : l’avis, la photo, les boutons et les chantiers sont visibles');
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
    await p.waitForTimeout(300);
    const r = await p.evaluate((vw) => {
      const box = (s) => document.querySelector(s).getBoundingClientRect();
      return {over: document.documentElement.scrollWidth - vw, quote: Math.round(box('.skim').right), cta: Math.round(box('.hero__act').right)};
    }, w);
    if (r.over > 0) bad.push(`${w}px (+${r.over})`);
    if (r.quote > w || r.cta > w) hero.push(`${w}px`);
    await ctx.close();
  }
  ok(!bad.length, `débordements : aucun de 320 à 1920 px${bad.length ? ' — ' + bad.join(', ') : ''}`);
  ok(!hero.length, `accueil : l’avis et les boutons tiennent dans la page à toutes les largeurs${hero.length ? ' — ' + hero.join(', ') : ''}`);
}

ok(!errs.length, `aucune erreur dans la console${errs.length ? ' : ' + errs.join(' | ') : ''}`);
console.log(`\n${n - fails}/${n} essais réussis`);
await b.close();
process.exit(fails ? 1 : 0);
