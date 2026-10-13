// Audit d'accessibilité sur le site servi en local (http://127.0.0.1:8771/) :
// 1. ordre de tabulation, focus visible et jamais caché sous l'en-tête ou la barre du téléphone ;
// 2. cibles tactiles sur téléphone ; 3. contrastes du texte, mesurés sur les vrais pixels (familles ouvertes) ;
// 4. contrastes des contours et des repères (WCAG 1.4.11) ; 5. espacement du texte élargi (WCAG 1.4.12).
//   python3 -m http.server 8771 --bind 127.0.0.1 --directory dist-web   puis   node tools/a11y.mjs
import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const URL_ = process.argv[2] || 'http://127.0.0.1:8771/';
const b = await chromium.launch();
let problems = 0;
const ready = async (p) => {
  await p.goto(URL_, {waitUntil: 'load'});
  await p.waitForTimeout(400);
  await p.keyboard.press('Shift'); // achève l'ouverture
  await p.waitForTimeout(400);
};

/* 1. Clavier, sur ordinateur puis sur téléphone (barre en bas) */
for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
  const p = await b.newPage({viewport: {width: w, height: h}, isMobile: mobile, hasTouch: mobile});
  await ready(p);
  const seen = [];
  for (let i = 0; i < 260; i++) {
    await p.keyboard.press('Tab');
    await p.waitForTimeout(mobile ? 60 : 30);
    const info = await p.evaluate(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return null;
      const cs = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      const cx = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2));
      const cy = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
      const over = document.elementFromPoint(cx, cy);
      const covered = !!over && !e.contains(over) && !over.contains(e) && !!over.closest('[data-top], [data-dock]') && !e.closest('[data-top], [data-dock]');
      const label = (e.getAttribute('aria-label') || e.innerText || e.value || e.name || e.id || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      const visible = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || cs.boxShadow !== 'none';
      return {
        tag: e.tagName.toLowerCase(),
        label,
        visible,
        hidden: covered || r.bottom < 0 || r.top > innerHeight,
        sec: e.closest('section[id]')?.id || e.closest('header, footer, [data-dock]')?.className.split(' ')[0] || '',
      };
    });
    if (!info) break;
    if (seen.length && seen[0].label === info.label && seen[0].tag === info.tag) break;
    seen.push(info);
  }
  const bySec = {};
  for (const s of seen) (bySec[s.sec] ||= []).push(s);
  console.log(`— tabulation, ${mobile ? 'téléphone' : 'ordinateur'} : ${seen.length} arrêts`);
  for (const [sec, list] of Object.entries(bySec)) console.log('  ', sec.padEnd(12), String(list.length).padStart(3), 'arrêts :', list.slice(0, 4).map((x) => x.label).join(' | '));
  const invisible = seen.filter((s) => !s.visible);
  const hidden = seen.filter((s) => s.hidden);
  problems += invisible.length + hidden.length;
  console.log('   focus non visible :', invisible.length ? invisible.map((s) => s.tag + ' ' + s.label).join(', ') : 'aucun');
  console.log('   focus caché sous l’en-tête ou la barre :', hidden.length ? hidden.map((s) => s.label).join(', ') : 'aucun');
  await p.close();
}

/* 2. Cibles tactiles, sur téléphone (une famille ouverte, la barre affichée) */
let p = await b.newPage({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
await ready(p);
await p.evaluate(() => document.querySelectorAll('[data-fam-panel]').forEach((x) => (x.hidden = false)));
const small = await p.evaluate(() => {
  const out = [];
  for (const e of document.querySelectorAll('a[href], button, input, summary')) {
    if (e.closest('[hidden], [inert], .dock:not(.is-on), dialog:not([open]), .sheet')) continue;
    const r = e.getBoundingClientRect();
    if (!r.width || !r.height || getComputedStyle(e).visibility === 'hidden') continue;
    if (e.classList.contains('skip')) continue;
    // un lien dans une phrase est exempté par le critère 2.5.8
    const inline = getComputedStyle(e).display === 'inline';
    if (r.width < 44 || r.height < 44) out.push({label: (e.innerText || e.getAttribute('aria-label') || e.value || '').trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), inline, under24: r.width < 24 || r.height < 24});
  }
  return out;
});
const blocking = small.filter((s) => s.under24 && !s.inline);
problems += blocking.length;
console.log(`— cibles de moins de 44 px sur téléphone : ${small.length} (dont sous 24 px hors phrases : ${blocking.length})`);
const grouped = {};
for (const s of small) {
  const k = `${s.inline ? 'dans une phrase' : 'seule'}${s.under24 ? ', < 24 px' : ''}`;
  (grouped[k] ||= []).push(`${s.label} ${s.w}×${s.h}`);
}
for (const [k, v] of Object.entries(grouped)) console.log('  ', k.padEnd(28), v.length, ':', v.slice(0, 6).join(' | '));
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
const checks = [
  '.top__nav a', '.top__tel', '.top__book',
  '.hero__title span', '.hero__lede', '.hero__cap', '.hero .btn--ink', '.hero .btn--line',
  '#svc-title', '.svc .head__lede', '.concern__q', '.concern__chips .chip', '.fam__name', '.fam__count', '.fam__intro', '.fam__group', '.tx__name', '.tx p', '.tx__facts dt', '.tx__facts dd', '.fam__note', '.svc__cap span.is-on', '.also__title', '.also__list b', '.also__list span',
  '#res-title', '.res .head__lede', '.res__filters .chip[aria-pressed="true"]', '.res__filters .chip[aria-pressed="true"] span', '.res__filters .chip[aria-pressed="false"]', '.res__filters .chip[aria-pressed="false"] span', '.res__cap', '.res__cap span', '[data-res-more]',
  '#team-title', '.team .head__lede', '.lead__name', '.lead__role', '.lead__ig a', '.quote p', '.quote footer', '.mate__name', '.mate__role', '.mate__ig a', '.team__more', '.team__more b', '.team__night figcaption',
  '#mem-title', '.mem .head__lede', '.bank__title', '.bank__price', '.bank__intro p:last-child', '.bank__label', '.bank__sum', '.bank__total span', '.bank__perks-title', '.bank__perks li', '.bank__perks li b', '.bank__perks .fine', '.plan__title', '.plan .plan__price', '.plan p:not(.plan__price)', '.plan__areas',
  '#visit-title', '.visit .head__lede', '.map__wide .m-label', '.map__wide .m-label--water', '.map__wide .m-poi text', '.map__wide .m-office-name', '.map__wide .m-scale text', '.map__credit', '.visit__h', '.visit__addr', '.visit__col p a', '.visit__list li', '.visit__list b', '.visit__more',
  '.foot__tag', '.foot__h', '.foot__cols p', '.foot__cols a', '.foot__legal',
];
p = await b.newPage({viewport: {width: 1440, height: 900}});
await ready(p);
await p.evaluate(() => document.querySelectorAll('[data-fam-panel]').forEach((x) => (x.hidden = false)));
let bad = 0;
console.log('— contrastes du texte (le pire point du fond compte)');
const HIDE = '*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;text-decoration-color:transparent!important;transition:none!important;caret-color:transparent!important}text,tspan,textPath{fill:transparent!important;stroke:none!important}';
const measure = async (el) => {
  await el.evaluate((e) => e.scrollIntoView({block: 'center'}));
  await p.waitForTimeout(450);
  const meta = await el.evaluate((e) => {
    const cs = getComputedStyle(e);
    return {color: e instanceof SVGElement ? cs.fill : cs.color, size: parseFloat(cs.fontSize), weight: +cs.fontWeight, scale: e instanceof SVGElement ? e.getBoundingClientRect().height / (e.getBBox?.().height || 1) : 1};
  });
  const box = await el.evaluate((e) => {
    let q;
    if (e instanceof SVGElement) q = e.getBoundingClientRect();
    else {
      const r = document.createRange();
      r.selectNodeContents(e);
      q = [...r.getClientRects()].find((x) => x.width > 4 && x.height > 4 && x.top >= 0 && x.bottom <= innerHeight);
    }
    return q && q.top >= 0 && q.bottom <= innerHeight ? {x: q.x + 1, y: q.y + 1, width: q.width - 2, height: q.height - 2} : null;
  });
  if (!box) return null;
  const tag = await p.addStyleTag({content: HIDE});
  await p.waitForTimeout(60);
  const shot = (await p.screenshot({clip: box})).toString('base64');
  await tag.evaluate((t) => t.remove());
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
  const px = meta.size * (meta.scale || 1);
  const large = px >= 24 || (px >= 18.66 && meta.weight >= 700);
  return {worst, large, meta, px};
};
for (const sel of checks) {
  const el = await p.$(sel);
  if (!el) { console.log('   absent', sel); continue; }
  const r = await measure(el);
  if (!r) { console.log('   hors écran', sel); continue; }
  const pass = r.worst >= (r.large ? 3 : 4.5);
  if (!pass) bad++;
  console.log('  ', pass ? '✓' : '✗', sel.padEnd(44), `${r.worst.toFixed(2)}:1`, `(${r.px.toFixed(1)}px, ${r.meta.weight})`);
}
problems += bad;
console.log(`   ${bad ? bad + ' en dessous du seuil' : 'tout au-dessus du seuil'}`);

/* 4. Contours et repères (1.4.11) : couleur du trait contre le fond voisin */
console.log('— contrastes des contours et repères (seuil 3:1)');
const ui = await p.evaluate(() => {
  const rgb = (s) => s.match(/[\d.]+/g).map(Number).slice(0, 3);
  const bgOf = (e, own) => {
    for (let x = own ? e : e.parentElement; x; x = x.parentElement) {
      const c = getComputedStyle(x).backgroundColor;
      if (c && !c.endsWith(', 0)') && c !== 'transparent') return rgb(c);
    }
    return [255, 255, 255];
  };
  const pick = (sel, prop, label, bgSel) => {
    const e = document.querySelector(sel);
    if (!e) return null;
    const cs = getComputedStyle(e);
    const v = prop === 'shadow' ? cs.boxShadow.match(/rgba?\([^)]+\)/)?.[0] : cs[prop];
    return {label, fg: rgb(v), bg: bgSel ? rgb(getComputedStyle(document.querySelector(bgSel)).backgroundColor || 'rgb(255,255,255)') : bgOf(e)};
  };
  return [
    pick('.concern__chips .chip', 'borderTopColor', 'contour d’un choix (préoccupation)'),
    pick('.res__filters .chip[aria-pressed="false"]', 'borderTopColor', 'contour d’un filtre des résultats'),
    pick('.hero .btn--line', 'shadow', 'contour du bouton secondaire'),
    pick('.bank__range', 'color', 'Beauty Bank : curseur (encre)'),
    pick('.bank__months li.is-on', 'backgroundColor', 'Beauty Bank : mois remplis'),
    pick('.fam__ic', 'color', 'signe plus d’une famille'),
    pick('.map__wide .m-office', 'fill', 'carte : bâtiment du cabinet', '.map__wide svg'),
  ].filter(Boolean);
});
for (const u of ui) {
  const rr = ratio(u.fg, u.bg);
  const pass = rr >= 3;
  if (!pass) problems++;
  console.log('  ', pass ? '✓' : '✗', u.label.padEnd(40), `${rr.toFixed(2)}:1`, `rgb(${u.fg}) sur rgb(${u.bg})`);
}
await p.keyboard.press('Tab');
const focus = await p.evaluate(() => {
  const rgb = (s) => s.match(/[\d.]+/g).map(Number).slice(0, 3);
  const out = [];
  for (const sel of ['.top__nav a', '.fam__btn', '.res__filters .chip', '.res__open', '.lead__ig a', '.bank__range', '.visit__col p a', '.foot__cols a']) {
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
  console.log('  ', pass ? '✓' : '✗', `focus ${f.sel}`.padEnd(40), `${rr.toFixed(2)}:1`, `${f.w} ${f.style}`);
}
await p.close();

/* 5. Espacement du texte élargi (1.4.12) : rien ne doit être coupé ni déborder */
for (const [w, h] of [[1440, 900], [390, 844]]) {
  p = await b.newPage({viewport: {width: w, height: h}});
  await p.goto(URL_ + '#visit', {waitUntil: 'load'});
  await p.evaluate(() => document.querySelectorAll('[data-fam-panel]').forEach((x) => (x.hidden = false)));
  await p.addStyleTag({content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }'});
  await p.waitForTimeout(500);
  const cut = await p.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll('body *')) {
      if (!e.offsetParent || e.closest('[aria-hidden="true"], .sr-only, script, style, svg')) continue;
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
