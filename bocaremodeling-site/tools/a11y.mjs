// Audit d'accessibilité sur le site servi en local (http://127.0.0.1:8795/) :
// 1. ordre de tabulation, focus visible et jamais caché sous l'en-tête ; 2. cibles tactiles sur téléphone ;
// 3. contrastes du texte, mesurés sur les vrais pixels ; 4. contrastes des contours, des repères et du focus
// (WCAG 1.4.11) ; 5. espacement du texte élargi (WCAG 1.4.12) ; 6. titres, noms et textes de remplacement.
//   python3 -m http.server 8795 --bind 127.0.0.1 --directory dist-web   puis   node tools/a11y.mjs
import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const URL_ = process.argv[2] || 'http://127.0.0.1:8795/';
const b = await chromium.launch();
let problems = 0;
// l'ouverture de l'accueil dure 1,4 s ; les apparitions plus bas, 1 s chacune
const ready = async (p, hash = '') => {
  await p.goto(URL_ + hash, {waitUntil: 'load'});
  await p.waitForTimeout(2300);
};
// toutes les apparitions jouées d'avance (on mesure la page telle qu'on la lit)
const settle = async (p) => {
  await p.evaluate(async () => {
    for (const i of document.querySelectorAll('img[loading="lazy"]')) i.loading = 'eager';
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
  });
  await p.waitForTimeout(1800);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(600);
};

/* 1. Clavier, sur ordinateur puis sur téléphone */
for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
  const p = await b.newPage({viewport: {width: w, height: h}, isMobile: mobile, hasTouch: mobile});
  await ready(p);
  const seen = [];
  for (let i = 0; i < 200; i++) {
    await p.keyboard.press('Tab');
    await p.waitForTimeout(mobile ? 90 : 70);
    const info = await p.evaluate(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return null;
      const cs = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      const cx = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2));
      const cy = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
      const over = document.elementFromPoint(cx, cy);
      const covered = !!over && !e.contains(over) && !over.contains(e) && !!over.closest('.top') && !e.closest('.top');
      const label = (e.getAttribute('aria-label') || e.innerText || e.querySelector('img[alt]')?.alt || e.value || e.name || e.id || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      const visible = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || cs.boxShadow !== 'none';
      return {
        tag: e.tagName.toLowerCase(),
        label,
        visible,
        hidden: covered || r.bottom < 0 || r.top > innerHeight,
        sec: e.closest('section[id]')?.id || e.closest('header, footer')?.className.split(' ')[0] || '',
      };
    });
    if (!info) break;
    if (seen.length && seen[0].label === info.label && seen[0].tag === info.tag) break;
    seen.push(info);
  }
  const bySec = {};
  for (const s of seen) (bySec[s.sec] ||= []).push(s);
  console.log(`— tabulation, ${mobile ? 'téléphone' : 'ordinateur'} : ${seen.length} arrêts`);
  for (const [sec, list] of Object.entries(bySec)) console.log('  ', (sec || 'hero').padEnd(12), String(list.length).padStart(3), 'arrêts :', list.slice(0, 4).map((x) => x.label).join(' | '));
  const invisible = seen.filter((s) => !s.visible);
  const hidden = seen.filter((s) => s.hidden);
  problems += invisible.length + hidden.length;
  console.log('   focus non visible :', invisible.length ? invisible.map((s) => s.tag + ' ' + s.label).join(', ') : 'aucun');
  console.log('   focus caché sous l’en-tête :', hidden.length ? hidden.map((s) => s.label).join(', ') : 'aucun');
  await p.close();
}

/* 2. Cibles tactiles, sur téléphone (la page, puis le menu ouvert) */
let p = await b.newPage({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
await ready(p);
const targets = () =>
  p.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll('a[href], button, input, select, textarea, summary')) {
      if (e.closest('[hidden], [inert], dialog:not([open])')) continue;
      // les cases des sujets du devis sont couvertes par leur étiquette, qui fait la cible
      const t = e.matches('.chip input') ? e.closest('.chip').querySelector('span') : e;
      const r = t.getBoundingClientRect();
      if (!r.width || !r.height || getComputedStyle(t).visibility === 'hidden') continue;
      if (e.classList.contains('skip')) continue;
      // un lien dans une phrase est exempté par le critère 2.5.8
      const inline = getComputedStyle(e).display === 'inline';
      if (r.width < 44 || r.height < 44) out.push({label: (e.innerText || e.getAttribute('aria-label') || e.value || e.id || '').trim().replace(/\s+/g, ' ').slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), inline, under24: r.width < 24 || r.height < 24});
    }
    return out;
  });
const small = await targets();
await p.click('.menu-btn');
await p.waitForTimeout(400);
small.push(...(await targets()).map((s) => ({...s, label: `menu : ${s.label}`})));
const blocking = small.filter((s) => s.under24 && !s.inline);
problems += blocking.length;
console.log(`— cibles de moins de 44 px sur téléphone : ${small.length} (dont sous 24 px hors phrases : ${blocking.length})`);
const grouped = {};
for (const s of small) {
  const k = `${s.inline ? 'dans une phrase' : 'seule'}${s.under24 ? ', < 24 px' : ''}`;
  (grouped[k] ||= []).push(`${s.label} ${s.w}×${s.h}`);
}
for (const [k, v] of Object.entries(grouped)) console.log('  ', k.padEnd(28), v.length, ':', v.slice(0, 8).join(' | '));
await p.close();

/* 3. Contrastes : la couleur du texte contre le fond réellement peint derrière lui (texte de la page masqué) */
const lum = (r, g, bl) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
};
const ratio = (a, c) => {
  const [x, y] = [lum(...a), lum(...c)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
// [sélecteur, préparation éventuelle exécutée dans la page avant la mesure]
const ERR = `(() => { for (const e of document.querySelectorAll('.field__error')) { e.hidden = false; e.textContent = 'Enter your name.'; } })()`;
const DONE = `(() => { const d = document.querySelector('.form__done'); d.hidden = false; })()`;
const CHIP = `(() => { const c = document.querySelector('input[value="Kitchen"]'); c.checked = true; })()`;
const PRESS = `(() => { document.querySelector('.trade[data-trade="kitchens"]').click(); })()`;
const UNPRESS = `(() => { const k = document.querySelector('.trade[data-trade="kitchens"]'); if (k.getAttribute('aria-pressed') === 'true') k.click(); })()`;
const checks = [
  ['.brand__name'], ['.nav a'], ['.top__tel'], ['.top__cta'],
  ['.hero__title'], ['.hero__lede'], ['.hero__cta .btn'], ['.tel'], ['.tel span'],
  ['.steps__btn[aria-current] .steps__label'], ['.steps__btn:not([aria-current]) .steps__label'], ['.steps__item:has([aria-current]) .steps__text'], ['.steps__item:not(:has([aria-current])) .steps__text'],
  ['#drawn-title'], ['.drawn__intro'], ['.story__title'], ['.story__item figcaption'], ['.n'], ['.story__more .link'],
  ['.trade', UNPRESS], ['.trades__hint'], ['.trades__text'], ['.trades__cta .link'], ['.trades__cap'],
  ['.trade[aria-pressed="true"]', PRESS], ['.trade[aria-pressed="false"]', PRESS],
  ['#work-title'], ['.project__name'], ['.project__meta'],
  ['#office-title'], ['.office__lead'], ['.office__street'], ['.office__city'], ['.office__status'], ['.office__hours span:last-child'], ['.btn--light'],
  ['.facts dt'], ['.facts dd'], ['.facts a'], ['.office__photo figcaption'],
  ['#quote-title'], ['.quote__lead'], ['.quote__call'], ['.quote__call a'], ['.field label'], ['.opt'], ['#h-reach'], ['.chip span'], ['.chip input:checked + span', CHIP],
  ['#h-details'], ['.field__error', ERR], ['.form .btn'], ['.form__note'], ['.form__done', DONE], ['.form__done a', DONE],
  ['.foot__name'], ['.foot__line'], ['.foot__h'], ['.foot__col p'], ['.foot a'], ['.foot__copy'],
];
p = await b.newPage({viewport: {width: 1440, height: 900}});
await ready(p);
await settle(p);
// plus aucune transition pendant les mesures : masquer puis rendre le texte ne doit pas relancer ses fondus
await p.addStyleTag({content: '*,*::before,*::after{transition:none!important;animation:none!important}'});
let bad = 0;
console.log('— contrastes du texte (le pire point du fond compte)');
const HIDE = '*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;text-decoration-color:transparent!important;transition:none!important;caret-color:transparent!important;background-image:none!important}';
const measure = async (page, el) => {
  await el.evaluate((e) => e.scrollIntoView({block: 'center'}));
  await page.waitForTimeout(500);
  const meta = await el.evaluate((e) => {
    const cs = getComputedStyle(e);
    // l'opacité des parents s'applique au texte
    let o = 1;
    for (let x = e; x && x !== document.documentElement; x = x.parentElement) o *= +getComputedStyle(x).opacity;
    return {color: cs.color, size: parseFloat(cs.fontSize), weight: +cs.fontWeight, o};
  });
  const box = await el.evaluate((e) => {
    const r = document.createRange();
    r.selectNodeContents(e);
    const q = [...r.getClientRects()].find((x) => x.width > 4 && x.height > 4 && x.top >= 0 && x.bottom <= innerHeight && x.left >= 0 && x.right <= innerWidth);
    return q ? {x: q.x + 1, y: q.y + 1, width: q.width - 2, height: q.height - 2} : null;
  });
  if (!box) return null;
  const tag = await page.addStyleTag({content: HIDE});
  await page.waitForTimeout(60);
  const shot = (await page.screenshot({clip: box})).toString('base64');
  await tag.evaluate((t) => t.remove());
  const {lo, hi} = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = new OffscreenCanvas(img.width, img.height);
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, img.width, img.height).data;
    const L = (r, gg, bb) => 0.2126 * r + 0.7152 * gg + 0.0722 * bb;
    let lo = null, hi = null, loL = 1e9, hiL = -1;
    for (let i = 0; i < d.length; i += 4) {
      const v = L(d[i], d[i + 1], d[i + 2]);
      if (v < loL) { loL = v; lo = [d[i], d[i + 1], d[i + 2]]; }
      if (v > hiL) { hiL = v; hi = [d[i], d[i + 1], d[i + 2]]; }
    }
    return {lo, hi};
  }, shot);
  const m = meta.color.match(/[\d.]+/g).map(Number);
  const a = (m[3] ?? 1) * meta.o;
  const blend = (base) => [0, 1, 2].map((k) => Math.round(m[k] * a + base[k] * (1 - a)));
  const worst = Math.min(ratio(blend(lo), lo), ratio(blend(hi), hi));
  const large = meta.size >= 24 || (meta.size >= 18.66 && meta.weight >= 700);
  return {worst, large, meta};
};
const run = async (page, list) => {
  for (const [sel, prep] of list) {
    if (prep) {
      await page.evaluate(prep);
      await page.waitForTimeout(300);
    }
    const el = await page.$(sel);
    if (!el) { console.log('   absent', sel); problems++; continue; }
    const r = await measure(page, el);
    if (!r) { console.log('   hors écran', sel); continue; }
    const pass = r.worst >= (r.large ? 3 : 4.5);
    if (!pass) bad++;
    console.log('  ', pass ? '✓' : '✗', sel.padEnd(56), `${r.worst.toFixed(2)}:1`, `(${r.meta.size.toFixed(1)}px, ${r.meta.weight})`);
  }
};
await run(p, checks);
// la visionneuse ouverte
await p.evaluate(() => document.querySelector('.project--a .project__ph').click());
await p.waitForTimeout(900);
await run(p, [['.viewer__title'], ['.viewer__count'], ['.viewer__list li:first-child figcaption'], ['.viewer__close'], ['.viewer__next']]);
await p.keyboard.press('Escape');
await p.waitForTimeout(400);
problems += bad;
console.log(`   ${bad ? bad + ' en dessous du seuil' : 'tout au-dessus du seuil'}`);

/* 4. Contours et repères (1.4.11) : couleur du trait contre le fond voisin */
console.log('— contrastes des contours et repères (seuil 3:1)');
const ui = await p.evaluate(() => {
  const rgb = (s) => s.match(/[\d.]+/g).map(Number);
  const flat = (c, bg) => (c.length > 3 ? [0, 1, 2].map((k) => Math.round(c[k] * c[3] + bg[k] * (1 - c[3]))) : c);
  const css = (sel, prop) => rgb(getComputedStyle(document.querySelector(sel))[prop]);
  return [
    {label: 'contour des champs du formulaire (sur blanc)', fg: css('#f-name', 'borderTopColor'), bg: [255, 255, 255]},
    {label: 'contour des champs du formulaire (sur le plâtre)', fg: css('#f-name', 'borderTopColor'), bg: [244, 246, 247]},
    {label: 'contour des sujets du devis (sur le plâtre)', fg: css('.chip span', 'borderTopColor'), bg: [244, 246, 247]},
    {label: 'cercle des étapes inactives (sur le plâtre)', fg: css('.steps__btn:not([aria-current]) .steps__n', 'borderTopColor'), bg: [244, 246, 247]},
    {label: 'bouton « Menu » (contour, sur le plâtre)', fg: css('.menu-btn', 'borderTopColor'), bg: [244, 246, 247]},
    {label: 'boutons de la visionneuse (contour)', fg: flat(css('.viewer__close', 'borderTopColor'), [11, 26, 44]), bg: [11, 26, 44]},
    {label: 'fil de progression des étapes (azur, sur le plâtre)', fg: [27, 162, 230], bg: [244, 246, 247], decorative: true},
    {label: 'trait bleu des ouvertures (azur, sur les photos)', fg: [27, 162, 230], bg: [244, 246, 247], decorative: true},
    {label: 'pastille « ouvert » (doublée par le texte)', fg: [70, 194, 122], bg: [16, 35, 58], decorative: true},
  ];
});
for (const u of ui) {
  const rr = ratio(u.fg, u.bg);
  const pass = rr >= 3 || u.decorative;
  if (!pass) problems++;
  console.log('  ', rr >= 3 ? '✓' : u.decorative ? '·' : '✗', u.label.padEnd(56), `${rr.toFixed(2)}:1`, `rgb(${u.fg}) sur rgb(${u.bg})${u.decorative && rr < 3 ? ' (décoratif ou redit en texte, non exigé)' : ''}`);
}
const focus = await p.evaluate(() => {
  const rgb = (s) => s.match(/[\d.]+/g).map(Number).slice(0, 3);
  const out = [];
  for (const sel of ['.brand', '.nav a', '.top__tel', '.top__cta', '.hero__cta .btn', '.tel', '.steps__btn', '.story .ph', '.story__more .link', '.trade', '.trades__cta .link', '.project__ph', '.office__go .btn', '.facts a', '#f-name', '.chip input', '.form .btn', '.foot a']) {
    const e = document.querySelector(sel);
    e.focus({preventScroll: true});
    // le contour d'une case cochée est dessiné sur son étiquette
    const t = e.matches('.chip input') ? e.nextElementSibling : e;
    const cs = getComputedStyle(t);
    let bg = [255, 255, 255];
    for (let x = t.parentElement; x; x = x.parentElement) {
      const c = getComputedStyle(x).backgroundColor;
      if (c && c !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(c)) { bg = rgb(c); break; }
    }
    out.push({sel, fg: rgb(cs.outlineColor), w: cs.outlineWidth, style: cs.outlineStyle, bg});
  }
  document.activeElement.blur();
  return out;
});
for (const f of focus) {
  const rr = ratio(f.fg, f.bg);
  const pass = rr >= 3 && f.style !== 'none';
  if (!pass) problems++;
  console.log('  ', pass ? '✓' : '✗', `focus ${f.sel}`.padEnd(40), `${rr.toFixed(2)}:1`, `${f.w} ${f.style}`);
}
await p.close();

/* 4 bis. Sur téléphone, où les textes rapetissent : les mots pâlis de la liste et les légendes */
console.log('— sur téléphone (390 px)');
p = await b.newPage({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
await ready(p);
await settle(p);
await p.addStyleTag({content: '*,*::before,*::after{transition:none!important;animation:none!important}'});
await run(p, [['.trade[aria-pressed="false"]', PRESS], ['.trades__hint'], ['.story__item figcaption'], ['.steps__item:has([aria-current]) .steps__text'], ['.facts dt'], ['.nav__call a', `(() => document.querySelector('.menu-btn').click())()`]]);
problems += bad;
await p.close();

/* 5. Espacement du texte élargi (1.4.12) : rien ne doit être coupé ni déborder */
for (const [w, h] of [[1440, 900], [390, 844]]) {
  p = await b.newPage({viewport: {width: w, height: h}});
  await ready(p);
  await settle(p);
  await p.addStyleTag({content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }'});
  await p.waitForTimeout(600);
  const cut = await p.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll('body *')) {
      if (!e.offsetParent || e.closest('[aria-hidden="true"], .sr, script, style, svg, .stage')) continue;
      const cs = getComputedStyle(e);
      const clips = /hidden|clip/.test(cs.overflowX + cs.overflowY) || cs.textOverflow === 'ellipsis';
      const hasText = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (hasText && clips && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)) out.push(`${e.tagName.toLowerCase()}.${e.className} « ${e.textContent.trim().slice(0, 30)} »`);
    }
    const wide = [...document.querySelectorAll('body *')].filter((e) => {
      if (!e.offsetParent || e.closest('[aria-hidden="true"], .sr, .skip, .stage, .viewer')) return false;
      const r = e.getBoundingClientRect();
      return r.width && (r.right > innerWidth + 1 || r.left < -1);
    }).map((e) => `${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]}`);
    return {cut: out.slice(0, 8), wide: [...new Set(wide)].slice(0, 8), doc: document.documentElement.scrollWidth - innerWidth};
  });
  if (cut.cut.length || cut.doc > 0 || cut.wide.length) problems++;
  console.log(`— espacement élargi (${w} px) : ${cut.cut.length ? 'texte coupé : ' + cut.cut.join(' ; ') : 'aucun texte coupé'}${cut.wide.length ? `, hors de l’écran : ${cut.wide.join(', ')}` : ''}${cut.doc > 0 ? `, défilement horizontal ${cut.doc} px` : ''}`);
  await p.close();
}

/* 6. Structure : titres, noms des contrôles, textes de remplacement, repères de page */
p = await b.newPage({viewport: {width: 1440, height: 900}});
await ready(p);
await settle(p);
const st = await p.evaluate(() => {
  // les titres d'une fenêtre fermée (la visionneuse) ne sont pas lus : on les laisse de côté
  const hs = [...document.querySelectorAll('h1, h2, h3, h4')].filter((h) => !h.closest('[hidden], dialog:not([open])'));
  const levels = hs.map((h) => +h.tagName[1]);
  const skips = [];
  for (let i = 1; i < levels.length; i++) if (levels[i] > levels[i - 1] + 1) skips.push(`${hs[i - 1].tagName} → ${hs[i].tagName} « ${hs[i].textContent.trim().slice(0, 30)} »`);
  const noAlt = [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length;
  const unnamed = [...document.querySelectorAll('a[href], button, input, select, textarea')].filter((e) => {
    if (e.closest('[hidden]')) return false;
    const lbl = e.labels?.length ? [...e.labels].map((l) => l.textContent).join('') : '';
    return !(e.getAttribute('aria-label') || e.textContent.trim() || lbl.trim() || e.getAttribute('title') || e.querySelector('img[alt]')?.alt.trim());
  }).map((e) => e.outerHTML.slice(0, 60));
  const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  const refs = [...document.querySelectorAll('[aria-labelledby], [aria-describedby], [aria-controls], label[for]')].flatMap((e) =>
    ['aria-labelledby', 'aria-describedby', 'aria-controls', 'for'].flatMap((a) => (e.getAttribute(a) || '').split(/\s+/).filter(Boolean)),
  );
  const broken = refs.filter((id) => !document.getElementById(id));
  return {
    h1: levels.filter((l) => l === 1).length,
    outline: hs.map((h) => `${'  '.repeat(+h.tagName[1] - 1)}${h.tagName.toLowerCase()} ${h.textContent.trim().slice(0, 50)}`),
    skips,
    noAlt,
    unnamed,
    dup,
    broken,
    lang: document.documentElement.lang,
    landmarks: ['header', 'nav', 'main', 'footer'].map((t) => `${t} ${document.querySelectorAll(t).length}`).join(', '),
  };
});
console.log(`— structure : ${st.h1} h1, langue « ${st.lang} », ${st.landmarks}`);
st.outline.forEach((l) => console.log('     ' + l));
const sp = st.skips.length + st.noAlt + st.unnamed.length + st.dup.length + st.broken.length + (st.h1 === 1 ? 0 : 1);
problems += sp;
console.log(`   niveaux sautés : ${st.skips.join(' ; ') || 'aucun'} ; images sans alt : ${st.noAlt} ; contrôles sans nom : ${st.unnamed.join(' ; ') || 'aucun'} ; id en double : ${st.dup.join(', ') || 'aucun'} ; références cassées : ${st.broken.join(', ') || 'aucune'}`);
await p.close();

await b.close();
console.log(problems ? `${problems} point(s) à corriger` : 'aucun point bloquant');
