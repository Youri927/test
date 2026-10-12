// Audit d'accessibilité sur le site servi en local (http://127.0.0.1:8765/) :
// 1. ordre de tabulation, focus visible et jamais caché sous l'en-tête ou la barre d'appel ;
// 2. cibles tactiles sur téléphone ; 3. contrastes du texte, mesurés sur les vrais pixels ;
// 4. contrastes des contours de champs et des repères (WCAG 1.4.11) ; 5. espacement du texte élargi (WCAG 1.4.12).
//   python3 -m http.server 8765 --bind 127.0.0.1 --directory dist-web   puis   node tools/a11y.mjs
import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const URL_ = process.argv[2] || 'http://127.0.0.1:8765/';
const b = await chromium.launch();
let problems = 0;

/* 1. Clavier, sur ordinateur puis sur téléphone (barre d'appel en bas) */
for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
  const p = await b.newPage({viewport: {width: w, height: h}, isMobile: mobile, hasTouch: mobile});
  await p.goto(URL_, {waitUntil: 'load'});
  await p.waitForTimeout(3000);
  const seen = [];
  for (let i = 0; i < 220; i++) {
    await p.keyboard.press('Tab');
    await p.waitForTimeout(mobile ? 60 : 30);
    const info = await p.evaluate(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return null;
      const t = e.matches('.topics input') ? e.nextElementSibling : e;
      const cs = getComputedStyle(t);
      const r = t.getBoundingClientRect();
      // caché : au centre de l'élément, ce qu'on voit est l'en-tête ou la barre d'appel
      const cx = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2));
      const cy = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
      const over = document.elementFromPoint(cx, cy);
      const covered = !!over && !t.contains(over) && !over.contains(t) && !!over.closest('[data-top], [data-dock]') && !t.closest('[data-top], [data-dock]');
      const label = (e.getAttribute('aria-label') || e.innerText || e.value || e.name || e.id || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      const visible = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || cs.boxShadow !== 'none';
      return {
        tag: e.tagName.toLowerCase(),
        label,
        visible,
        hidden: covered || r.bottom < 0 || r.top > innerHeight,
        sec: e.closest('section[id], header, footer, [data-dock], #menu')?.id || e.closest('header, footer, [data-dock]')?.className.split(' ')[0] || '',
      };
    });
    if (!info) break;
    if (seen.length && seen[0].label === info.label && seen[0].tag === info.tag) break;
    seen.push(info);
  }
  const bySec = {};
  for (const s of seen) (bySec[s.sec] ||= []).push(s);
  console.log(`— tabulation, ${mobile ? 'téléphone' : 'ordinateur'} : ${seen.length} arrêts`);
  for (const [sec, list] of Object.entries(bySec)) console.log('  ', sec.padEnd(10), String(list.length).padStart(3), 'arrêts :', list.slice(0, 4).map((x) => x.label).join(' | '));
  const invisible = seen.filter((s) => !s.visible);
  const hidden = seen.filter((s) => s.hidden);
  problems += invisible.length + hidden.length;
  console.log('   focus non visible :', invisible.length ? invisible.map((s) => s.tag + ' ' + s.label).join(', ') : 'aucun');
  console.log('   focus caché sous l’en-tête ou la barre d’appel :', hidden.length ? hidden.map((s) => s.label).join(', ') : 'aucun');
  await p.close();
}

/* 2. Cibles tactiles, sur téléphone */
let p = await b.newPage({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
await p.goto(URL_, {waitUntil: 'load'});
await p.waitForTimeout(1500);
const small = await p.evaluate(() => {
  const out = [];
  for (const e of document.querySelectorAll('a[href], button, input, textarea, summary')) {
    if (e.closest('[hidden], [inert], .dock:not(.is-on), .visually-hidden')) continue;
    const t = e.matches('.topics input') ? e.nextElementSibling : e;
    const r = t.getBoundingClientRect();
    if (!r.width || !r.height || getComputedStyle(t).visibility === 'hidden') continue;
    if (e.classList.contains('skip')) continue;
    // un lien ou un mot dans une phrase est exempté par le critère 2.5.8
    const inline = getComputedStyle(e).display === 'inline' || e.classList.contains('term');
    if (r.width < 44 || r.height < 44) out.push({label: (e.innerText || e.getAttribute('aria-label') || e.value || '').trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), inline, under24: r.width < 24 || r.height < 24});
  }
  return out;
});
const blocking = small.filter((s) => s.under24 && !s.inline);
problems += blocking.length;
console.log(`— cibles de moins de 44 px sur téléphone : ${small.length} (dont sous 24 px hors phrases : ${blocking.length})`);
for (const s of small) console.log('  ', `${s.w}×${s.h}`, s.inline ? '(dans une phrase)' : '', s.under24 ? '< 24 px' : '', JSON.stringify(s.label));
await p.close();

/* 3. Contrastes : la couleur du texte contre le fond réellement peint derrière lui (même endroit, texte masqué) */
const lum = (r, g, bl) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
};
const ratio = (a, c) => {
  const [x, y] = [lum(...a), lum(...c)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const checks = [
  '.top__nav a', '.top__phone', '.top__cta', '.hero__title span', '.hero__lead', '.hero .btn:not(.btn--line)', '.hero .btn--line', '.hero__note', '.facade__cap',
  '#straight-title', '#straight .lead', '#straight .term', '.case figcaption strong', '.case figcaption', '.case__note', '.faq dt', '.faq dd', '.say--big blockquote p', '.say--big figcaption', '.others__intro', '.others h3', '.others p:not(.others__intro)',
  '#care-title', '#care .lead', '.group__title', '.item__name', '.item__gist', '.care__more h3', '.care__more p',
  '#team-title', '.sec-head--light .lead', '.face__name', '.face__role', '.face[aria-pressed="true"] .face__name', '.bio h3', '.bio__since', '.bio p:not(.bio__since)', '.bio__list li',
  '#reviews-title', '.pledge h3', '.pledge__text p', '.pledge .say blockquote p', '.pledge .say figcaption', '.more-says__title', '.more-says__cols blockquote p', '.more-says__cols figcaption', '.more-says__src',
  '#costs-title', '.costs h3', '.costs__col p', '.plans li', '.ticks li', '.costs .small', '.costs .link',
  '.board__name', '.board__line', '.entrance figcaption', '.where__addr', '.where .link', '.where__list dt', '.where__list dd', '.where__list a', '.visit__place > .small',
  '.request h3', '.request__intro', '.topics legend', '.topics label:nth-of-type(2) span', '.topics input:checked + span', '.field label', '.field__opt', '.request__send', '.request__how',
  '.foot .mark', '.foot__grid > div > p:not(.mark)', '.foot__nav a', '.foot__note',
];
p = await b.newPage({viewport: {width: 1440, height: 900}});
await p.goto(URL_, {waitUntil: 'load'});
await p.waitForTimeout(3000);
let bad = 0;
console.log('— contrastes du texte (le pire point du fond compte)');
const measure = async (sel, el) => {
  await el.evaluate((e) => e.scrollIntoView({block: 'center'}));
  await p.waitForTimeout(450);
  const meta = await el.evaluate((e) => {const cs = getComputedStyle(e); return {color: cs.color, size: parseFloat(cs.fontSize), weight: +cs.fontWeight};});
  const box = await el.evaluate((e) => {
    const r = document.createRange();
    r.selectNodeContents(e);
    const q = [...r.getClientRects()].find((x) => x.width > 4 && x.height > 4 && x.top >= 0 && x.bottom <= innerHeight);
    return q ? {x: q.x + 1, y: q.y + 1, width: q.width - 2, height: q.height - 2} : null;
  });
  if (!box) return null;
  await el.evaluate((e) => {
    e.dataset.c = e.getAttribute('style') || '';
    for (const k of [e, ...e.querySelectorAll('*')]) {
      k.style.setProperty('transition', 'none', 'important');
      k.style.setProperty('color', 'transparent', 'important');
      k.style.setProperty('text-decoration-color', 'transparent', 'important');
      k.style.setProperty('text-shadow', 'none', 'important');
    }
  });
  await p.waitForTimeout(60);
  const shot = (await p.screenshot({clip: box})).toString('base64');
  await el.evaluate((e) => {
    e.setAttribute('style', e.dataset.c);
    for (const k of e.querySelectorAll('*')) ['transition', 'color', 'text-decoration-color', 'text-shadow'].forEach((x) => k.style.removeProperty(x));
  });
  const {lo, hi} = await p.evaluate(async (b64) => {
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
  const a = m[3] ?? 1;
  const blend = (base) => [0, 1, 2].map((k) => Math.round(m[k] * a + base[k] * (1 - a)));
  const worst = Math.min(ratio(blend(lo), lo), ratio(blend(hi), hi));
  const large = meta.size >= 24 || (meta.size >= 18.66 && meta.weight >= 700);
  return {worst, large, meta};
};
for (const sel of checks) {
  const el = await p.$(sel);
  if (!el) { console.log('   absent', sel); continue; }
  const r = await measure(sel, el);
  if (!r) { console.log('   hors écran', sel); continue; }
  const pass = r.worst >= (r.large ? 3 : 4.5);
  if (!pass) bad++;
  console.log('  ', pass ? '✓' : '✗', sel.padEnd(42), `${r.worst.toFixed(2)}:1`, `(${r.meta.size}px, ${r.meta.weight})`);
}
// la définition d'un mot, ouverte
await p.locator('#straight .term').scrollIntoViewIfNeeded();
await p.click('#straight .term');
await p.waitForTimeout(250);
for (const sel of ['.def__term', '.def__text', '.def__src']) {
  const el = await p.$(sel);
  const box = await el.evaluate((e) => {const r = e.getBoundingClientRect(); return {top: r.top, bottom: r.bottom};});
  // la bulle est déjà à l'écran : pas de défilement, qui la déplacerait
  const meta = await el.evaluate((e) => {const cs = getComputedStyle(e); return {color: cs.color, size: parseFloat(cs.fontSize), weight: +cs.fontWeight, bg: getComputedStyle(e.closest('.def')).backgroundColor};});
  const c = meta.color.match(/[\d.]+/g).map(Number);
  const bg = meta.bg.match(/[\d.]+/g).map(Number);
  const a = c[3] ?? 1;
  const fg = [0, 1, 2].map((k) => Math.round(c[k] * a + bg[k] * (1 - a)));
  const rr = ratio(fg, bg);
  const pass = rr >= 4.5;
  if (!pass) bad++;
  console.log('  ', pass ? '✓' : '✗', sel.padEnd(42), `${rr.toFixed(2)}:1`, `(${meta.size}px, ${meta.weight})`, box.top > 0 ? '' : '(hors écran)');
}
problems += bad;
console.log(`   ${bad ? bad + ' en dessous du seuil' : 'tout au-dessus du seuil'}`);

/* 4. Contours et repères (1.4.11) : couleur du trait contre le fond voisin */
console.log('— contrastes des contours et repères (seuil 3:1)');
const ui = await p.evaluate(() => {
  const rgb = (s) => s.match(/[\d.]+/g).map(Number).slice(0, 3);
  const bgOf = (e) => {
    for (let x = e.parentElement; x; x = x.parentElement) {
      const c = getComputedStyle(x).backgroundColor;
      if (c && !c.endsWith(', 0)') && c !== 'transparent') return rgb(c);
    }
    return [255, 255, 255];
  };
  const pick = (sel, prop, label) => {
    const e = document.querySelector(sel);
    if (!e) return null;
    const cs = getComputedStyle(e);
    return {label, fg: rgb(cs[prop]), bg: bgOf(e)};
  };
  return [
    pick('#f-name', 'borderTopColor', 'contour d’un champ'),
    pick('.topics label:nth-of-type(2) span', 'borderTopColor', 'contour d’un choix du sujet'),
    pick('.btn--line', 'borderTopColor', 'contour du bouton secondaire'),
    pick('.term', 'textDecorationColor', 'pointillé d’un mot expliqué'),
    pick('.case__line', 'backgroundColor', 'ligne du temps du cas'),
  ].filter(Boolean);
});
for (const u of ui) {
  const rr = ratio(u.fg, u.bg);
  const pass = rr >= 3;
  if (!pass) problems++;
  console.log('  ', pass ? '✓' : '✗', u.label.padEnd(36), `${rr.toFixed(2)}:1`, `rgb(${u.fg}) sur rgb(${u.bg})`);
}
// le contour de focus, sur chaque fond
// le focus au clavier (une touche d'abord, pour que :focus-visible s'applique comme en vrai)
await p.keyboard.press('Tab');
const focus = await p.evaluate(() => {
  const rgb = (s) => s.match(/[\d.]+/g).map(Number).slice(0, 3);
  const out = [];
  for (const sel of ['.top__nav a', '.face', '#f-name', '.foot__nav a', '.item summary']) {
    const e = document.querySelector(sel);
    e.focus({preventScroll: true});
    const cs = getComputedStyle(e);
    let bg = [255, 255, 255];
    for (let x = e.parentElement; x; x = x.parentElement) {
      const c = getComputedStyle(x).backgroundColor;
      if (c && !c.endsWith(', 0)') && c !== 'transparent') { bg = rgb(c); break; }
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
  console.log('  ', pass ? '✓' : '✗', `focus ${f.sel}`.padEnd(36), `${rr.toFixed(2)}:1`, `${f.w} ${f.style}`);
}
await p.close();

/* 5. Espacement du texte élargi (1.4.12) : rien ne doit être coupé ni se chevaucher */
for (const [w, h] of [[1440, 900], [390, 844]]) {
  p = await b.newPage({viewport: {width: w, height: h}});
  await p.goto(URL_ + '#visit', {waitUntil: 'load'});
  await p.addStyleTag({content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }'});
  await p.waitForTimeout(500);
  const cut = await p.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll('body *')) {
      if (!e.offsetParent || e.closest('[aria-hidden="true"], .strip, .case, .visually-hidden, script, style, svg')) continue;
      const cs = getComputedStyle(e);
      const clips = /hidden|clip/.test(cs.overflowX + cs.overflowY) || cs.textOverflow === 'ellipsis';
      const hasText = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (hasText && clips && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)) out.push(`${e.tagName.toLowerCase()}.${e.className} « ${e.textContent.trim().slice(0, 30)} »`);
    }
    return {cut: out.slice(0, 8), doc: document.documentElement.scrollWidth - innerWidth};
  });
  if (cut.cut.length || cut.doc > 0) problems++;
  console.log(`— espacement élargi (${w} px) : ${cut.cut.length ? 'texte coupé : ' + cut.cut.join(' ; ') : 'aucun texte coupé'}${cut.doc > 0 ? `, défilement horizontal ${cut.doc} px` : ''}`);
  await p.close();
}

await b.close();
console.log(problems ? `${problems} point(s) à corriger` : 'aucun point bloquant');
