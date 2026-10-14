// Essais des interactions : l'ouverture, les liens de l'en-tête, la coupe qui se monte couche par couche (ordinateur
// et téléphone), le filtre et la visionneuse des photos, « Check your city » et la carte, le formulaire qui rédige le
// SMS, le clavier, le menu du téléphone, la barre d'appel, le mouvement réduit, l'arrivée par un lien, et les
// débordements de 320 à 1920 px.
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
const topOf = (p, sel) => p.$eval(sel, (e) => Math.round(e.getBoundingClientRect().top));
const visible = (p) => p.$$eval('[data-work] li', (it) => it.filter((i) => !i.hidden).length);
// la place dans la partie « couche par couche » (0 à 1), sur ordinateur
const toLayers = async (p, v) => {
  await p.evaluate((v) => {
    const l = document.querySelector('[data-layers]');
    window.scrollTo(0, l.getBoundingClientRect().top + scrollY + v * (l.offsetHeight - innerHeight));
  }, v);
  await p.waitForTimeout(700);
  return p.evaluate(() => {
    const d = document.querySelector('[data-drawing]');
    const svg = d.querySelector('svg');
    return {
      stage: d.dataset.stage,
      off: +getComputedStyle(svg).getPropertyValue('--off'),
      under: +svg.querySelector('[data-clip="under"]').getAttribute('width'),
      drip: +getComputedStyle(svg.querySelector('.xs__drip')).opacity,
      set: svg.querySelectorAll('.xs__tile.is-set').length,
      tiles: svg.querySelectorAll('.xs__tile').length,
      labels: [...svg.querySelectorAll('.xs__lab.is-shown')].map((g) => g.dataset.layer).join(' '),
      photo: document.querySelector('[data-photos] figure.is-on')?.dataset.step,
      step: document.querySelector('[data-steps] li[aria-current="step"]')?.dataset.step,
      pin: Math.round(document.querySelector('.layers__pin').getBoundingClientRect().top),
    };
  });
};
// les liens sms: ouverts par le formulaire sont relevés au lieu d'être suivis
const catchSms = (p) =>
  p.evaluate(() => {
    window.__sms = [];
    document.addEventListener('click', (e) => {
      const a = e.target.closest?.('a[href^="sms:"]');
      if (a && a.hidden) {
        e.preventDefault();
        window.__sms.push(a.href);
      }
    }, true);
  });

/* ——— ordinateur ——— */
let ctx = await b.newContext({viewport: {width: 1440, height: 900}});
let p = await open(ctx);

// l'ouverture : le titre monte, la photo se découvre du bas vers le haut
await p.waitForFunction(() => {
  const a = document.getAnimations().find((x) => x.animationName === 'cover' && x.effect?.target?.closest?.('.hero__photo'));
  return a && a.currentTime >= 650;
}, null, {polling: 'raf'});
const mid = await p.evaluate(() => getComputedStyle(document.querySelector('.hero__photo picture')).clipPath);
const top = /inset\(([\d.]+)%/.exec(mid);
ok(top && +top[1] > 2 && +top[1] < 60, `ouverture, en cours : la photo se découvre du bas vers le haut (${mid})`);
await p.screenshot({path: `${out}/i-hero-mid.png`});
await p.waitForTimeout(1300);
const end = await p.evaluate(() => ({
  clip: getComputedStyle(document.querySelector('.hero__photo picture')).clipPath,
  lines: [...document.querySelectorAll('.hero__title .ln > span')].map((s) => getComputedStyle(s).transform),
  side: +getComputedStyle(document.querySelector('.hero__side')).opacity,
}));
ok(/^(inset\(0(%|px)?( 0(%|px)?)*\)|none)$/.test(end.clip), `ouverture, finie : la photo est entière (${end.clip})`);
ok(end.lines.every((t) => t === 'none' || /matrix\(1, 0, 0, 1, 0, 0\)/.test(t)) && end.side === 1, 'ouverture, finie : les trois lignes du titre et le texte sont en place');
await p.screenshot({path: `${out}/i-hero.png`});

// les liens de l'en-tête amènent la partie sous l'en-tête
for (const href of ['#roofs', '#reviews', '#license', '#area']) {
  await p.click(`.nav a[href="${href}"]`);
  await p.waitForTimeout(1600);
  const t = await topOf(p, href);
  ok(t >= 60 && t <= 80, `en-tête : « ${href} » amène la partie sous l'en-tête (${t} px)`);
}
ok(await p.$eval('[data-top]', (e) => e.classList.contains('is-scrolled')), "en-tête : un filet dès qu'on a quitté le haut");
ok(await p.evaluate(() => document.activeElement?.id === 'area'), 'le focus suit le lien (#area)');
await p.click('.brand');
await p.waitForTimeout(1600);
ok((await p.evaluate(() => Math.round(scrollY))) === 0, 'le nom ramène tout en haut');

// couche par couche
let L = await toLayers(p, 0.02);
ok(L.stage === '1' && L.off < 0.1 && L.under === 0 && L.set === 0 && L.labels === 'deck', `coupe, au début : l'ancien toit est encore là, le voligeage est nommé (étape ${L.stage}, ancien toit ${L.off.toFixed(2)})`);
L = await toLayers(p, 0.2);
ok(L.stage === '1' && L.off === 1 && L.photo === '1' && L.step === '1', `coupe, étape 1 : l'ancien toit est parti ; photo et texte de l'étape 1 (${L.off})`);
ok(L.pin >= -1 && L.pin <= 1, `coupe : la partie reste épinglée pendant le défilement (${L.pin} px)`);
L = await toLayers(p, 0.4);
ok(L.stage === '2' && L.under > 0 && L.drip === 1 && L.photo === '2' && L.labels === 'under deck drip', `coupe, étape 2 : la bavette, puis la sous-couche qui monte depuis l'égout (${L.under.toFixed(0)} unités)`);
L = await toLayers(p, 0.6);
ok(L.stage === '3' && L.set > 0 && L.set < L.tiles && L.photo === '3', `coupe, étape 3 : les tuiles se posent du bas vers le haut (${L.set} sur ${L.tiles})`);
await p.screenshot({path: `${out}/i-layers-3.png`});
L = await toLayers(p, 0.97);
ok(L.stage === '4' && L.set === L.tiles && L.labels.split(' ').length === 4 && L.photo === '4' && L.step === '4', `coupe, étape 4 : tout est posé, les quatre couches nommées, les deux maisons pendant et terminées (${L.labels})`);
await p.screenshot({path: `${out}/i-layers-4.png`});
L = await toLayers(p, 0.2);
ok(L.stage === '1' && L.set === 0 && L.under === 0, 'coupe : en remontant, le dessin revient en arrière');

// les photos : filtre
await p.$eval('#roofs', (e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY + 600));
await p.waitForTimeout(700);
for (const [k, want] of [['tile', 10], ['shingle', 9], ['job', 6], ['all', 21]]) {
  await p.click(`[data-tabs] [data-k="${k}"]`);
  await p.waitForTimeout(300);
  const s = await visible(p);
  const sel = await p.$eval(`[data-tabs] [data-k="${k}"]`, (e) => e.getAttribute('aria-selected'));
  const st = await p.$eval('[data-tabs-status]', (e) => e.textContent);
  ok(s === want && sel === 'true', `photos : « ${k} » montre ${s} photo(s) ; annoncé « ${st} »`);
}
await p.focus('[data-tabs] [data-k="all"]');
await p.keyboard.press('ArrowRight');
await p.waitForTimeout(200);
ok((await p.evaluate(() => document.activeElement.dataset.k)) === 'tile' && (await visible(p)) === 10, 'photos : la flèche droite passe au filtre suivant (Tile)');
await p.keyboard.press('End');
await p.waitForTimeout(200);
ok((await p.evaluate(() => document.activeElement.dataset.k)) === 'job', 'photos : Fin va au dernier filtre');
await p.click('[data-tabs] [data-k="all"]');
await p.waitForTimeout(800);
const shownAll = await p.$$eval('[data-work] li', (it) => it.every((li) => li.classList.contains('is-in')));
ok(shownAll, 'photos : toutes les photos visibles se sont découvertes');

// la visionneuse
await p.click('[data-work] li:nth-child(3) .ph');
await p.waitForTimeout(500);
let lb = await p.evaluate(() => {
  const img = document.querySelector('[data-lb-img]');
  return {
    open: document.querySelector('[data-lb]').open,
    count: document.querySelector('[data-lb-count]').textContent,
    cap: document.querySelector('[data-lb-cap]').textContent,
    alt: img.alt,
    w: Math.round(img.getBoundingClientRect().width),
    natural: img.naturalWidth,
    focus: document.activeElement.hasAttribute('data-lb-close'),
  };
});
ok(lb.open && lb.count === '3 of 21' && lb.cap === 'Terracotta tile, crew at the ridge' && lb.alt.length > 20, `visionneuse : la photo 3 s'ouvre avec sa légende (${lb.count}, « ${lb.cap} »)`);
ok(lb.w <= lb.natural && lb.natural === 800, `visionneuse : la photo n'est jamais affichée plus grande que l'originale (${lb.w} px pour ${lb.natural})`);
ok(lb.focus, 'visionneuse : le focus va sur « Close »');
await p.screenshot({path: `${out}/i-lightbox.png`});
await p.keyboard.press('ArrowRight');
await p.waitForTimeout(250);
ok((await p.$eval('[data-lb-count]', (e) => e.textContent)) === '4 of 21', 'visionneuse : la flèche droite passe à la suivante');
await p.keyboard.press('ArrowLeft');
await p.keyboard.press('ArrowLeft');
await p.keyboard.press('ArrowLeft');
await p.keyboard.press('ArrowLeft');
await p.waitForTimeout(250);
ok((await p.$eval('[data-lb-count]', (e) => e.textContent)) === '21 of 21', 'visionneuse : on boucle de la première à la dernière');
await p.keyboard.press('Escape');
await p.waitForTimeout(300);
ok(!(await p.$eval('[data-lb]', (e) => e.open)) && (await p.evaluate(() => document.activeElement.closest('li') === document.querySelector('[data-work] li:nth-child(3)'))), 'visionneuse : Échap la ferme et rend le focus à la photo');
// avec un filtre, la visionneuse ne parcourt que les photos filtrées
await p.click('[data-tabs] [data-k="shingle"]');
await p.waitForTimeout(300);
await p.click('[data-work] li:not([hidden]) .ph');
await p.waitForTimeout(400);
ok((await p.$eval('[data-lb-count]', (e) => e.textContent)) === '1 of 9', 'visionneuse : avec le filtre Shingle, elle parcourt les 9 photos de bardeaux');
await p.click('[data-lb-close]');
await p.click('[data-tabs] [data-k="all"]');

// le secteur : la carte et « Check your city »
await p.$eval('#area', (e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 72));
await p.waitForTimeout(1500);
const map = await p.evaluate(() => ({
  cities: document.querySelectorAll('.map__city').length,
  anchors: document.querySelectorAll('.map__lab.is-anchor').length,
  in: document.querySelector('[data-area]').classList.contains('is-in'),
  lists: document.querySelectorAll('.counties li').length,
}));
ok(map.cities === 25 && map.lists === 25 && map.anchors === 5 && map.in, `carte : 25 villes dessinées et listées, 5 noms de repère (${map.cities}, ${map.lists}, ${map.anchors})`);
const check = async (q) => {
  await p.fill('#city', q);
  await p.press('#city', 'Enter');
  await p.waitForTimeout(250);
  return p.evaluate(() => ({
    out: document.querySelector('[data-check-out]').textContent,
    hit: [...document.querySelectorAll('.map__city.is-hit')].map((c) => c.dataset.city).join(),
    lab: [...document.querySelectorAll('.map__lab.is-hit')].map((c) => c.dataset.city).join(),
  }));
};
let c = await check('boca raton');
ok(c.out === 'Yes, Boca Raton is on our list, in Palm Beach County.' && c.hit === 'Boca Raton' && c.lab === 'Boca Raton', `ville : « boca raton » → ${c.out}`);
await p.screenshot({path: `${out}/i-area.png`});
c = await check('Lake Worth Beach');
ok(c.hit === 'Lake Worth' && /Lake Worth/.test(c.out), `ville : « Lake Worth Beach » est reconnue (${c.out})`);
c = await check('Ft. Lauderdale');
ok(c.hit === 'Fort Lauderdale' && /Broward County/.test(c.out), `ville : « Ft. Lauderdale » est reconnue (${c.out})`);
c = await check('Miami');
ok(c.hit === '' && c.out === 'Miami is not on our list of 25 cities. Call the office at (561) 797-5457 to ask.', `ville hors liste : ${c.out}`);
c = await check('');
ok(c.out === 'Type the name of your city.', `ville vide : ${c.out}`);
await p.hover('.counties li:nth-child(3)');
await p.waitForTimeout(200);
ok((await p.evaluate(() => [...document.querySelectorAll('.map__city.is-hit')].map((x) => x.dataset.city).join())) === 'West Palm Beach', 'carte : survoler un nom de la liste allume la ville');

// le formulaire : vérifié, puis le message rédigé (ordinateur : à copier)
await p.$eval('[data-form]', (e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 120));
await p.click('[data-form] button[type="submit"]');
await p.waitForTimeout(200);
const errsShown = await p.$$eval('[data-error]', (e) => e.filter((x) => x.textContent.trim()).length);
ok(errsShown === 3 && (await p.evaluate(() => document.activeElement.id)) === 'f-name', `formulaire vide : trois erreurs, le focus sur le nom (${errsShown})`);
ok((await p.$eval('#f-phone', (e) => e.getAttribute('aria-invalid'))) === 'true', 'formulaire : le champ fautif est signalé (aria-invalid)');
await p.screenshot({path: `${out}/i-form-errors.png`});
await p.click('.chips label:has(input[value="Tile"])');
await p.click('.chips label:has(input[value="A leak fixed"])');
await p.fill('#f-name', 'Dana');
await p.fill('#f-phone', '561 555 0123');
await p.fill('#f-city', 'Wellington');
await p.fill('#f-msg', 'Water stain on the ceiling after the last storm.');
await p.click('[data-form] button[type="submit"]');
await p.waitForTimeout(300);
const ready = await p.evaluate(() => ({
  hidden: document.querySelector('[data-ready]').hidden,
  msg: document.querySelector('[data-msg]').textContent,
  focus: document.activeElement === document.querySelector('[data-ready]'),
  errs: [...document.querySelectorAll('[data-error]')].filter((x) => x.textContent.trim()).length,
}));
ok(!ready.hidden && ready.focus && ready.errs === 0, 'formulaire rempli (ordinateur) : le message est prêt à copier, le focus y va');
ok(ready.msg === "Hi Mendieta Roofing, this is Dana. I'd like a free estimate.\nRoof: Tile. I need: A leak fixed.\nCity: Wellington. My number: 561 555 0123.\nWater stain on the ceiling after the last storm.", 'formulaire : le message reprend les choix et les champs');
await p.screenshot({path: `${out}/i-form-ready.png`});
await ctx.close();

// le clavier, sur une page neuve : le lien d'évitement, puis le nom
ctx = await b.newContext({viewport: {width: 1440, height: 900}});
p = await open(ctx);
await p.keyboard.press('Tab');
ok((await p.evaluate(() => document.activeElement.className)) === 'skip', 'clavier : le premier arrêt est « Skip to content »');
await p.keyboard.press('Tab');
ok(await p.evaluate(() => document.activeElement.classList.contains('brand')), 'clavier : puis le nom Mendieta');
await ctx.close();

/* ——— arrivée par un lien vers une partie ——— */
ctx = await b.newContext({viewport: {width: 1440, height: 900}});
p = await open(ctx, url + '#license');
await p.waitForTimeout(900);
const tr = await topOf(p, '#license');
ok(tr >= 50 && tr <= 110, `arrivée sur #license : la partie est sous l'en-tête (${tr} px)`);
await ctx.close();

/* ——— mouvement réduit ——— */
ctx = await b.newContext({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
p = await open(ctx);
await p.waitForTimeout(400);
const rm = await p.evaluate(() => ({
  clip: getComputedStyle(document.querySelector('.hero__photo picture')).clipPath,
  lenis: document.documentElement.classList.contains('lenis'),
  anims: document.getAnimations().length,
  stage: document.querySelector('[data-drawing]').dataset.stage,
  set: document.querySelectorAll('.xs__tile.is-set').length,
  pin: getComputedStyle(document.querySelector('.layers__pin')).position,
  ph: getComputedStyle(document.querySelector('[data-work] .ph')).clipPath,
}));
ok(rm.clip === 'none' && !rm.lenis && rm.anims === 0, `moins d'animations : tout est en place dès l'ouverture, sans défilement doux (${rm.anims} animation)`);
ok(rm.stage === '4' && rm.set === 3 && rm.pin === 'static', `moins d'animations : la coupe est complète et la partie n'est pas épinglée (${rm.pin})`);
ok(rm.ph === 'none', "moins d'animations : les photos sont visibles sans attendre");
await ctx.close();

/* ——— téléphone ——— */
ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true});
p = await open(ctx);
await p.waitForTimeout(1800);
const mp = await p.evaluate(() => {
  const img = document.querySelector('.hero__photo img');
  return {
    tall: img.naturalHeight > img.naturalWidth,
    cta: getComputedStyle(document.querySelector('.top__cta')).display,
    name: document.querySelector('.brand__name').getBoundingClientRect().right < document.querySelector('.menu-btn').getBoundingClientRect().left,
  };
});
ok(mp.tall, 'téléphone : la photo en hauteur est chargée');
ok(mp.cta === 'none' && mp.name, "téléphone : l'en-tête garde le nom entier et le menu");
await p.screenshot({path: `${out}/i-phone-hero.png`});
// la barre d'appel : absente sur l'accueil, présente ensuite, absente sur le devis
ok(!(await p.$eval('[data-callbar]', (e) => e.classList.contains('is-on'))), "barre d'appel : absente sur l'accueil");
await p.evaluate(() => window.scrollTo(0, document.querySelector('#roofs').offsetTop));
await p.waitForTimeout(600);
ok(await p.$eval('[data-callbar]', (e) => e.classList.contains('is-on')), "barre d'appel : présente après l'accueil");
await p.evaluate(() => window.scrollTo(0, document.querySelector('#estimate').offsetTop + 200));
await p.waitForTimeout(600);
ok(!(await p.$eval('[data-callbar]', (e) => e.classList.contains('is-on'))), "barre d'appel : absente sur le devis");
// le menu
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(300);
await p.click('[data-menu-open]');
await p.waitForTimeout(200);
ok(!(await p.$eval('[data-menu]', (e) => e.hidden)) && (await p.$eval('[data-menu-open]', (e) => e.getAttribute('aria-expanded'))) === 'true', 'menu ouvert');
ok(await p.evaluate(() => document.activeElement.hasAttribute('data-menu-close')), 'menu : le focus va sur « Close »');
ok(await p.evaluate(() => document.querySelector('main').inert), 'menu : la page dessous ne prend plus le focus');
for (let i = 0; i < 10; i++) await p.keyboard.press('Tab');
ok(await p.evaluate(() => !!document.activeElement.closest('[data-menu]')), 'menu : la tabulation reste dans le menu');
await p.keyboard.press('Escape');
ok((await p.$eval('[data-menu]', (e) => e.hidden)) && (await p.evaluate(() => document.activeElement.hasAttribute('data-menu-open'))), 'Échap ferme le menu et rend le focus au bouton');
await p.click('[data-menu-open]');
await p.click('.menu nav a[href="#reviews"]');
await p.waitForTimeout(1600);
const ts = await topOf(p, '#reviews');
ok((await p.$eval('[data-menu]', (e) => e.hidden)) && ts >= 50 && ts <= 80, `un lien du menu le ferme et amène les avis sous l'en-tête (${ts} px)`);
// la coupe au téléphone : elle reste en haut, et suit l'étape qu'on lit dessous
const mStep = async (k, frac) => {
  await p.evaluate(([k, frac]) => {
    const li = document.querySelector(`.layers__steps [data-step="${k}"]`);
    const band = document.querySelector('.layers__stage').getBoundingClientRect().height + 62;
    const line = band + (innerHeight - band) * 0.42;
    const r = li.getBoundingClientRect();
    window.scrollTo(0, r.top + scrollY - line + r.height * 0.8 * frac);
  }, [k, frac]);
  await p.waitForTimeout(800);
  return p.evaluate(() => ({
    stage: document.querySelector('[data-drawing]').dataset.stage,
    top: Math.round(document.querySelector('.layers__stage').getBoundingClientRect().top),
    set: document.querySelectorAll('.xs__tile.is-set').length,
    vb: document.querySelector('.xs').getAttribute('viewBox'),
  }));
};
let ms = await mStep(2, 0.5);
ok(ms.stage === '2' && ms.top >= 55 && ms.top <= 70, `téléphone : la coupe reste en haut (${ms.top} px) et montre l'étape lue (${ms.stage})`);
ok(ms.vb === '252 112 712 488', 'téléphone : la coupe est recadrée sur le toit (les étiquettes sont dans le texte)');
ms = await mStep(3, 0.9);
ok(ms.stage === '3' && ms.set === 3, `téléphone : à l'étape 3, les tuiles sont posées (${ms.set})`);
await p.screenshot({path: `${out}/i-phone-layers.png`});
// le formulaire au téléphone : la messagerie s'ouvre avec le texte, adressée au portable
await catchSms(p);
await p.$eval('[data-form]', (e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 80));
await p.fill('#f-name', 'Dana');
await p.fill('#f-phone', '(561) 555-0123');
await p.fill('#f-city', 'Jupiter');
await p.click('[data-form] button[type="submit"]');
await p.waitForTimeout(300);
const sms = await p.evaluate(() => window.__sms);
ok(sms.length === 1 && sms[0].startsWith('sms:+15615436287?&body=') && decodeURIComponent(sms[0]).includes('City: Jupiter. My number: (561) 555-0123.'), `téléphone : « Write my text to Mendieta » ouvre la messagerie avec la demande, vers le portable`);
await ctx.close();

/* ——— débordements, de 320 à 1920 px ——— */
ctx = await b.newContext({viewport: {width: 1440, height: 900}});
p = await open(ctx);
const bad = [];
for (const w of [320, 360, 375, 390, 414, 480, 600, 700, 768, 820, 900, 1000, 1080, 1180, 1280, 1366, 1600, 1920]) {
  await p.setViewportSize({width: w, height: 900});
  await p.waitForTimeout(150);
  const r = await p.evaluate(() => {
    const over = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    const els = [...document.querySelectorAll('body *')].filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width && (r.right > document.documentElement.clientWidth + 1 || r.left < -1) && !e.closest('.sr, .skip, [hidden], .menu, svg, dialog');
    }).slice(0, 3).map((e) => `${e.tagName.toLowerCase()}.${e.className}`);
    return {over, els};
  });
  if (r.over || r.els.length) bad.push(`${w}: ${r.els.join(' ')}`);
}
ok(bad.length === 0, `aucun débordement sur 18 largeurs, de 320 à 1920 px${bad.length ? ' : ' + bad.join(' | ') : ''}`);
await ctx.close();

await b.close();
ok(errs.length === 0, errs.length ? `erreurs de page : ${errs.join(' | ')}` : 'aucune erreur de page');
console.log(fails ? `${fails} essai(s) sur ${n} en échec` : `tout est bon (${n} essais)`);
process.exit(fails ? 1 : 0);
