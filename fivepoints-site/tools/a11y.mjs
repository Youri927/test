// Audit d'accessibilité sur le site servi en local (http://127.0.0.1:8791/) :
// 1. ordre de tabulation, focus visible et jamais caché sous l'en-tête ; 2. cibles tactiles sur téléphone ;
// 3. contrastes du texte, mesurés sur les vrais pixels ; 4. contrastes des contours, des repères et du focus
// (WCAG 1.4.11) ; 5. espacement du texte élargi (WCAG 1.4.12) ; 6. titres, noms et textes de remplacement.
//   python3 -m http.server 8791 --bind 127.0.0.1 --directory dist-web   puis   node tools/a11y.mjs
import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const URL_ = process.argv[2] || 'http://127.0.0.1:8791/';
const b = await chromium.launch();
let problems = 0;
// l'ouverture (les rampants, les mots, l'étoile) dure 1,8 s
const ready = async (p, hash = '') => {
  await p.goto(URL_ + hash, {waitUntil: 'load'});
  await p.waitForTimeout(2000);
};

/* 1. Clavier, sur ordinateur puis sur téléphone */
for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
  const p = await b.newPage({viewport: {width: w, height: h}, isMobile: mobile, hasTouch: mobile});
  await ready(p);
  const seen = [];
  for (let i = 0; i < 200; i++) {
    await p.keyboard.press('Tab');
    await p.waitForTimeout(mobile ? 60 : 40);
    const info = await p.evaluate(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return null;
      const cs = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      const cx = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2));
      const cy = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
      const over = document.elementFromPoint(cx, cy);
      const covered = !!over && !e.contains(over) && !over.contains(e) && !!over.closest('[data-top]') && !e.closest('[data-top], [data-panel]');
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
  for (const [sec, list] of Object.entries(bySec)) console.log('  ', sec.padEnd(12), String(list.length).padStart(3), 'arrêts :', list.slice(0, 4).map((x) => x.label).join(' | '));
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
      if (e.closest('[hidden], [inert]')) continue;
      const r = e.getBoundingClientRect();
      if (!r.width || !r.height || getComputedStyle(e).visibility === 'hidden') continue;
      if (e.classList.contains('skip')) continue;
      // un lien dans une phrase est exempté par le critère 2.5.8
      const inline = getComputedStyle(e).display === 'inline';
      if (r.width < 44 || r.height < 44) out.push({label: (e.innerText || e.getAttribute('aria-label') || e.value || e.id || '').trim().replace(/\s+/g, ' ').slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), inline, under24: r.width < 24 || r.height < 24});
    }
    return out;
  });
const small = await targets();
await p.click('[data-menu]');
await p.waitForTimeout(300);
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
// [sélecteur, préparation éventuelle exécutée dans la page après le défilement]
const ERR = `(() => { document.querySelectorAll('.field__err').forEach((e) => (e.hidden = false)); })()`;
const READY = `(() => { const r = document.querySelector('[data-ready]'); r.hidden = false; document.querySelector('[data-ready-text]').textContent = 'To: fivepointsroofingfl@gmail.com'; })()`;
const FAQ = `(() => { document.querySelector('.faq details').open = true; })()`;
// le numéro du pied de page est sous le toit : la boîte de sa ligne (plus haute que les chiffres) touche les rampants,
// qui ne passent jamais derrière les chiffres ; on les masque pour mesurer le fond réel des chiffres
const CALL = `(() => { document.querySelector('.call__gable').style.visibility = 'hidden'; })()`;
const checks = [
  ['.nav a'], ['.top__tel'], ['.top__cta'],
  ['.gable__h1'], ['.hero__lead'], ['.hero .btn'], ['.hero .link'], ['.hero__photo figcaption'], ['.proof strong'], ['.proof span'], ['.proof a'],
  ['#roofs-t'], ['.roofs .head p'], ['.tabs__tab[aria-selected="true"]'], ['.tabs__tab[aria-selected="false"]'], ['.panel h3'], ['.spots li'], ['.panel > p'], ['.kit dt'], ['.kit dd'], ['.profile__note'],
  ['#storm-t'], ['.storm .head p'], ['.steps--dark h3'], ['.steps--dark p'], ['.five__t'], ['.storm figcaption'], ['.leak h3'], ['.leak li'],
  ['#decide-t'], ['.decide .head p'], ['.way h3'], ['.way p:not(.way__eg)'], ['.way__eg'], ['.job figcaption'], ['.decide__new h3'], ['.decide__new .steps li p'], ['.ticks li'],
  ['#warranty-t'], ['.warranty .head p'], ['.warranty__top figcaption'], ['.ruler__scale span'], ['.ruler__life'], ['.ruler__bars strong'], ['.ruler__bars span:not(.ruler__bar)'], ['.warranty__notes p'],
  ['#family-t'], ['.family__text > p'], ['.line b'], ['.line span'], ['.license__kind'], ['.license__no'], ['.license dt'], ['.license dd'], ['.license a'], ['.family__side figcaption'],
  ['#reviews-t'], ['.quote--lead blockquote p'], ['.quote figcaption'], ['.quotes .quote p'], ['.reviews__top figcaption'],
  ['#area-t'], ['.area__text p:not(.area__office)'], ['.area__office'], ['.towns li:nth-child(2)'], ['.towns li:first-child'],
  ['#faq-t'], ['.faq summary'], ['.faq details p', FAQ],
  ['#estimate-t'], ['.estimate__text > p'], ['.direct span'], ['.direct a'], ['.field legend'], ['.field label'], ['.opt'], ['.chips span'], ['.field__err', ERR], ['.form__note'], ['.ready h3', READY], ['.ready__text', READY],
  ['.call__tel a', CALL], ['.call__lead'], ['.call__hours'], ['.foot__brand p'], ['.foot h2'], ['.foot li'], ['.foot li a'], ['.foot__end'],
];
p = await b.newPage({viewport: {width: 1440, height: 900}});
await ready(p);
let bad = 0;
console.log('— contrastes du texte (le pire point du fond compte)');
// les noms de la carte gardent leur halo blanc (il fait partie du fond sur lequel on les lit)
const HIDE = '*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;text-decoration-color:transparent!important;transition:none!important;caret-color:transparent!important}text,tspan,textPath{fill:transparent!important;stroke:none!important}';
const measure = async (el, prep) => {
  await el.evaluate((e) => e.scrollIntoView({block: 'center'}));
  await p.waitForTimeout(1300);
  if (prep) {
    await p.evaluate(prep);
    await p.waitForTimeout(700);
  }
  const meta = await el.evaluate((e) => {
    const cs = getComputedStyle(e);
    // l'opacité des parents s'applique au texte
    let o = 1;
    for (let x = e; x && x !== document.documentElement; x = x.parentElement) o *= +getComputedStyle(x).opacity;
    return {color: e instanceof SVGElement ? cs.fill : cs.color, size: parseFloat(cs.fontSize), weight: +cs.fontWeight, o, scale: e instanceof SVGElement ? e.getBoundingClientRect().height / (e.getBBox?.().height || 1) : 1};
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
  const a = (m[3] ?? 1) * meta.o;
  const blend = (base) => [0, 1, 2].map((k) => Math.round(m[k] * a + base[k] * (1 - a)));
  const worst = Math.min(ratio(blend(lo), lo), ratio(blend(hi), hi));
  const px = meta.size * (meta.scale || 1);
  const large = px >= 24 || (px >= 18.66 && meta.weight >= 700);
  return {worst, large, meta, px};
};
for (const [sel, prep] of checks) {
  const el = await p.$(sel);
  if (!el) { console.log('   absent', sel); problems++; continue; }
  const r = await measure(el, prep);
  if (!r) { console.log('   hors écran', sel); continue; }
  const pass = r.worst >= (r.large ? 3 : 4.5);
  if (!pass) bad++;
  const note = '';
  console.log('  ', pass ? '✓' : '✗', (sel + note).padEnd(52), `${r.worst.toFixed(2)}:1`, `(${r.px.toFixed(1)}px, ${r.meta.weight})`);
}
problems += bad;
console.log(`   ${bad ? bad + ' en dessous du seuil' : 'tout au-dessus du seuil'}`);

/* 4. Contours et repères (1.4.11) : couleur du trait contre le fond voisin */
console.log('— contrastes des contours et repères (seuil 3:1)');
const ui = await p.evaluate(() => {
  const rgb = (s) => s.match(/[\d.]+/g).map(Number);
  // une couleur semi-transparente est fondue dans le fond
  const flat = (c, bg) => (c.length > 3 ? [0, 1, 2].map((k) => Math.round(c[k] * c[3] + bg[k] * (1 - c[3]))) : c);
  const bgOf = (e) => {
    for (let x = e.parentElement; x; x = x.parentElement) {
      const c = getComputedStyle(x).backgroundColor;
      if (c && !c.endsWith(', 0)') && c !== 'transparent') return rgb(c).slice(0, 3);
    }
    return [255, 255, 255];
  };
  const pick = (sel, prop, label) => {
    const e = document.querySelector(sel);
    if (!e) return {label, missing: sel};
    const cs = getComputedStyle(e);
    const bg = bgOf(e);
    return {label, fg: flat(rgb(cs[prop]), bg), bg};
  };
  return [
    pick('.top__menu', 'borderTopColor', 'contour du bouton Menu'),
    pick('#f-name', 'borderTopColor', 'contour d’un champ du formulaire'),
    pick('.chips span', 'borderTopColor', 'contour d’un choix (A home…)'),
    pick('.tabs__bar', 'backgroundColor', 'onglet choisi : l’indicateur'),
    pick('.dot__n', 'fill', 'toits : les repères numérotés'),
    pick('.profile__body', 'stroke', 'toits : le contour du bâtiment'),
    pick('.line li', 'color', 'ligne du temps (texte)'),
  ];
});
for (const u of ui) {
  if (u.missing) { console.log('   absent', u.missing); problems++; continue; }
  const rr = ratio(u.fg, u.bg);
  const pass = rr >= 3;
  if (!pass) problems++;
  console.log('  ', pass ? '✓' : '✗', u.label.padEnd(40), `${rr.toFixed(2)}:1`, `rgb(${u.fg}) sur rgb(${u.bg})`);
}
const focus = await p.evaluate(() => {
  const rgb = (s) => s.match(/[\d.]+/g).map(Number).slice(0, 3);
  const out = [];
  for (const sel of ['.brand', '.nav a', '.top__tel', '.top__cta', '.hero .btn', '.hero .link', '.proof a', '.tabs__tab', '.panel:not([hidden])', '.license a', '.faq summary', '#f-name', '.form__go .btn', '.direct a', '.call__tel a', '.foot li a']) {
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
  await ready(p, '#estimate');
  await p.addStyleTag({content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }'});
  await p.waitForTimeout(500);
  const cut = await p.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll('body *')) {
      if (!e.offsetParent || e.closest('[aria-hidden="true"], .sr, script, style, svg')) continue;
      const cs = getComputedStyle(e);
      const clips = /hidden|clip/.test(cs.overflowX + cs.overflowY) || cs.textOverflow === 'ellipsis';
      const hasText = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (hasText && clips && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)) out.push(`${e.tagName.toLowerCase()}.${e.className} « ${e.textContent.trim().slice(0, 30)} »`);
    }
    // les étiquettes des repères et le texte ne doivent pas sortir de l'écran
    const wide = [...document.querySelectorAll('body *')].filter((e) => {
      // la rangée de photos défile d'elle-même au téléphone : ses photos dépassent, dans son cadre
      if (!e.offsetParent || e.closest('[aria-hidden="true"], .sr, .skip, .job')) return false;
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
const st = await p.evaluate(() => {
  const hs = [...document.querySelectorAll('h1, h2, h3, h4')].filter((h) => !h.closest('[hidden]'));
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
