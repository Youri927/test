// Audit d'accessibilité sur le site servi en local (http://127.0.0.1:8798/) :
// 1. le clavier : ordre de tabulation, focus visible, jamais hors de l'écran ni sous l'en-tête (dans l'enfilade comme
//    au téléphone) ; 2. les cibles au doigt ; 3. les contrastes du texte, mesurés sur les vrais pixels ; 4. les contrastes
//    des contours, des repères et du focus (WCAG 1.4.11) ; 5. l'espacement du texte élargi (1.4.12) et le zoom ;
//    6. les titres, les noms, les textes de remplacement, les repères de page.
//   node tools/a11y.mjs
import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const URL_ = process.argv[2] || 'http://127.0.0.1:8798/';
const b = await chromium.launch();
let problems = 0;
const ready = async (p) => {
  await p.goto(URL_, {waitUntil: 'load'});
  await p.waitForTimeout(2400);
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
  await p.waitForTimeout(800);
};

/* 1. Clavier : dans l'enfilade (1 440 × 900), puis au téléphone */
for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
  const p = await b.newPage({viewport: {width: w, height: h}, isMobile: mobile, hasTouch: mobile});
  await ready(p);
  const mode = await p.evaluate(() => (document.documentElement.classList.contains('h') ? 'enfilade' : 'de haut en bas'));
  const seen = [];
  for (let i = 0; i < 120; i++) {
    await p.keyboard.press('Tab');
    // le temps que la maison vienne (le navigateur décale la vue, le script reporte le décalage)
    await p.waitForTimeout(mobile ? 120 : 260);
    const info = await p.evaluate(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return null;
      const t = e.matches('.chip input') ? e.nextElementSibling : e;
      const cs = getComputedStyle(t);
      const r = t.getBoundingClientRect();
      // caché sous l'en-tête : ce qui est peint à son centre appartient à l'en-tête et pas à lui
      const cx = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2));
      const cy = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
      const over = document.elementFromPoint(cx, cy);
      const under = !!over && !e.contains(over) && !over.contains(e) && !!over.closest('.top') && !e.closest('.top');
      const off = r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight || r.left < -1 || r.right > innerWidth + 1;
      const label = (e.getAttribute('aria-label') || e.innerText || e.labels?.[0]?.innerText || e.value || e.name || e.id || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      const visible = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || cs.boxShadow !== 'none';
      return {tag: e.tagName.toLowerCase(), label, visible, hidden: under || off, sec: e.closest('section[id], footer')?.id || e.closest('header')?.className.split(' ')[0] || ''};
    });
    if (!info) break;
    if (seen.length && seen[0].label === info.label && seen[0].tag === info.tag) break;
    seen.push(info);
  }
  const bySec = {};
  for (const s of seen) (bySec[s.sec] ||= []).push(s);
  console.log(`— tabulation, ${mobile ? 'téléphone' : 'ordinateur'} (${mode}) : ${seen.length} arrêts`);
  for (const [sec, list] of Object.entries(bySec)) console.log('  ', (sec || '(lien d’évitement)').padEnd(14), String(list.length).padStart(3), 'arrêts :', list.slice(0, 4).map((x) => x.label).join(' | '));
  const invisible = seen.filter((s) => !s.visible);
  const hidden = seen.filter((s) => s.hidden);
  problems += invisible.length + hidden.length;
  console.log('   focus non visible :', invisible.length ? invisible.map((s) => s.tag + ' ' + s.label).join(', ') : 'aucun');
  console.log('   focus hors de l’écran ou sous l’en-tête :', hidden.length ? hidden.map((s) => s.label).join(', ') : 'aucun');
  await p.close();
}

/* 2. Cibles au doigt, au téléphone (la page, puis le menu ouvert) */
let p = await b.newPage({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
await ready(p);
const targets = () =>
  p.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll('a[href], button, input, select, textarea')) {
      if (e.closest('[hidden], [inert]')) continue;
      const t = e.matches('.chip input') ? e.closest('.chip').querySelector('span') : e;
      const r = t.getBoundingClientRect();
      if (!r.width || !r.height || getComputedStyle(t).visibility === 'hidden' || e.classList.contains('skip')) continue;
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
console.log(`— cibles de moins de 44 px au téléphone : ${small.length} (dont sous 24 px hors des phrases : ${blocking.length})`);
const grouped = {};
for (const s of small) (grouped[`${s.inline ? 'dans une phrase' : 'seule'}${s.under24 ? ', < 24 px' : ''}`] ||= []).push(`${s.label} ${s.w}×${s.h}`);
for (const [k, v] of Object.entries(grouped)) console.log('  ', k.padEnd(28), v.length, ':', v.slice(0, 8).join(' | '));
await p.close();

/* 3. Contrastes : la couleur du texte contre le fond réellement peint derrière lui (le texte de la page masqué).
   Mesurés sur la page de haut en bas : les couleurs sont les mêmes que dans l'enfilade, les textes plus petits. */
const lum = (r, g, bl) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
};
const ratio = (a, c) => {
  const [x, y] = [lum(...a), lum(...c)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const ERR = `(() => { for (const e of document.querySelectorAll('.field__err')) { e.hidden = false; e.textContent = 'Enter your email address.'; } })()`;
const SENT = `(() => { const s = document.querySelector('[data-sent]'); s.hidden = false; s.innerHTML = 'Your email app should open with your message to Ryan. If nothing opens, write to <a href="mailto:FeelyDev@gmail.com">FeelyDev@gmail.com</a>.'; })()`;
const checks = [
  ['.top__nav a'], ['.top__nav a[aria-current]'], ['.top__tel'], ['.btn--top'],
  ['.frieze__word'], ['.intro__title'], ['.intro__lead'], ['.intro__cta .btn'], ['.intro__cta .tel'],
  ['.plate__cap'], ['.say'], ['.detail figcaption'],
  ['.small-title'], ['.steps li'], ['.steps__n'], ['.licenses__list a'], ['.licenses__who'],
  ['.homes__title'], ['.home--palmer .status'], ['.home--palmer .home__name'], ['.home--palmer .home__lead'], ['.specs dt'], ['.specs dd'], ['.home--palmer .home__text'], ['.btn--light'], ['.home__note'],
  ['.status--sold'], ['.home--whipple .home__name'], ['.home--whipple .home__lead'], ['.floors dt'], ['.floors dd'],
  ['.meet__title .frieze__word'], ['.meet__lead'], ['.reply'], ['.reply strong'], ['.direct a'],
  ['.field label'], ['.opt'], ['.topics legend'], ['.chip span'], ['.chip input:checked + span'], ['.field__err', ERR], ['.btn--send'], ['.form__note'], ['.form__sent', SENT], ['.form__sent a', SENT],
  ['.end__line'], ['.end__facts dt'], ['.end__facts dd'], ['.end__facts a'], ['.end__base span'], ['.end__base a'],
];
// le texte masqué, et les soulignés dessinés en fond (la date de réponse) avec lui
const HIDE = '*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;text-decoration-color:transparent!important;transition:none!important;caret-color:transparent!important}.reply strong{background-image:none!important}';
const measure = async (page, el) => {
  await el.evaluate((e) => e.scrollIntoView({block: 'center'}));
  await page.waitForTimeout(350);
  const meta = await el.evaluate((e) => {
    const cs = getComputedStyle(e);
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
let bad = 0;
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
    console.log('  ', pass ? '✓' : '✗', sel.padEnd(40), `${r.worst.toFixed(2)}:1`, `(${r.meta.size.toFixed(1)}px, ${r.meta.weight})`);
  }
};
for (const [w, h, label, list] of [
  [1440, 900, 'ordinateur', checks],
  [390, 844, 'téléphone', [['.intro__lead'], ['.plate__cap'], ['.detail figcaption'], ['.steps__n'], ['.licenses__who'], ['.specs dt'], ['.home__note'], ['.floors dt'], ['.form__note'], ['.end__facts dt'], ['.end__base span']]],
]) {
  p = await b.newPage({viewport: {width: w, height: h}, reducedMotion: 'reduce'});
  await ready(p);
  await settle(p);
  await p.addStyleTag({content: '*,*::before,*::after{transition:none!important;animation:none!important}'});
  console.log(`— contrastes du texte, ${label} (le pire point du fond compte)`);
  bad = 0;
  await run(p, list);
  problems += bad;
  console.log(`   ${bad ? bad + ' en dessous du seuil' : 'tout au-dessus du seuil'}`);
  if (w === 1440) {
    /* 4. Contours, repères et focus (1.4.11) */
    console.log('— contrastes des contours et des repères (seuil 3:1)');
    const ui = await p.evaluate(() => {
      const rgb = (s) => s.match(/[\d.]+/g).map(Number).slice(0, 3);
      const css = (sel, prop) => rgb(getComputedStyle(document.querySelector(sel))[prop]);
      const chaux = [242, 241, 238];
      const buis = [34, 55, 42];
      return [
        {label: 'contour des champs du formulaire (gris Feely, sur la chaux)', fg: css('#f-name', 'borderTopColor'), bg: [251, 251, 249]},
        {label: 'contour des puces des sujets (sur la chaux)', fg: css('.chip span', 'borderTopColor'), bg: chaux},
        {label: 'puce cochée (buis, sur la chaux)', fg: buis, bg: chaux},
        {label: 'bouton vert (sur la chaux)', fg: css('.btn--send', 'backgroundColor'), bg: chaux},
        {label: 'bouton clair (sur le buis)', fg: css('.btn--light', 'backgroundColor'), bg: buis},
        {label: 'barre sous la pièce en cours, dans le menu (redite par aria-current)', fg: css('.top__bar', 'backgroundColor'), bg: chaux},
        {label: 'barres du bouton « Menu »', fg: css('.menu-btn__bars', 'color'), bg: chaux},
        // le cadre blanc d'un détail, contre la photo assombrie autour de lui, là où elle est la plus claire (le plafond
        // de planches blanches, la brique blanchie : [242, 240, 236])
        (() => {
          const m = getComputedStyle(document.querySelector('.plate__mark')).boxShadow.match(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)/);
          const a = m[4] === undefined ? 1 : +m[4];
          const bg = [242, 240, 236].map((v, i) => Math.round(v * (1 - a) + +m[i + 1] * a));
          return {label: `cadre d’un détail, contre la photo assombrie (${Math.round(a * 100)} %) là où elle est la plus claire`, fg: [255, 255, 255], bg};
        })(),
        {label: 'la barre de la frise (décorative)', fg: css('.frieze__out', 'backgroundColor'), bg: chaux, decorative: true},
        {label: 'filets des étapes et des étages (décoratifs)', fg: [207, 206, 201], bg: chaux, decorative: true},
      ];
    });
    for (const u of ui) {
      const rr = ratio(u.fg, u.bg);
      const pass = rr >= 3 || u.decorative;
      if (!pass) problems++;
      console.log('  ', rr >= 3 ? '✓' : u.decorative ? '·' : '✗', u.label.padEnd(68), `${rr.toFixed(2)}:1`, u.decorative && rr < 3 ? '(décoratif, non exigé)' : '');
    }
    const focus = await p.evaluate(() => {
      const rgb = (s) => s.match(/[\d.]+/g).map(Number).slice(0, 3);
      const out = [];
      for (const sel of ['.top__brand', '.top__nav a', '.top__tel', '.btn--top', '.intro__cta .btn', '.intro__cta .tel', '.licenses__list a', '.btn--light', '.direct a', '#f-name', '.chip input', '#f-msg', '.btn--send', '.end__mark', '.end__facts a', '.end__base a']) {
        const e = document.querySelector(sel);
        e.focus({preventScroll: true});
        const t = e.matches('.chip input') ? e.nextElementSibling : e;
        const cs = getComputedStyle(t);
        let bg = [255, 255, 255];
        for (let x = t.parentElement; x; x = x.parentElement) {
          const c = getComputedStyle(x).backgroundColor;
          if (c && c !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(c)) { bg = rgb(c); break; }
        }
        const fg = cs.outlineStyle !== 'none' ? rgb(cs.outlineColor) : rgb(cs.boxShadow.match(/rgba?\([^)]+\)/)?.[0] || 'rgb(0,0,0)');
        out.push({sel, fg, w: cs.outlineStyle !== 'none' ? cs.outlineWidth : 'ombre 2px', style: cs.outlineStyle !== 'none' ? cs.outlineStyle : 'box-shadow', bg});
      }
      document.activeElement.blur();
      return out;
    });
    for (const f of focus) {
      const rr = ratio(f.fg, f.bg);
      const pass = rr >= 3;
      if (!pass) problems++;
      console.log('  ', pass ? '✓' : '✗', `focus ${f.sel}`.padEnd(30), `${rr.toFixed(2)}:1`, `${f.w} ${f.style}`);
    }
  }
  await p.close();
}

/* 5. Espacement du texte élargi (1.4.12), zoom à 200 % : rien ne doit être coupé ni sortir de l'écran */
for (const [w, h, label] of [[1440, 900, 'enfilade'], [1280, 720, 'enfilade'], [390, 844, 'téléphone']]) {
  p = await b.newPage({viewport: {width: w, height: h}});
  await ready(p);
  await p.addStyleTag({content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }'});
  await p.waitForTimeout(1200);
  await settle(p);
  const r = await p.evaluate(() => {
    const h = document.documentElement.classList.contains('h');
    const cut = [];
    for (const e of document.querySelectorAll('body *')) {
      if (!e.offsetParent || e.closest('[aria-hidden="true"], .sr, script, style, svg, .skip')) continue;
      const cs = getComputedStyle(e);
      const clips = /hidden|clip/.test(cs.overflowX + cs.overflowY) || cs.textOverflow === 'ellipsis';
      const hasText = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (hasText && clips && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1) && !e.matches('.frieze__mask')) cut.push(`${e.tagName.toLowerCase()}.${e.className} « ${e.textContent.trim().slice(0, 30)} »`);
    }
    // dans l'enfilade, rien ne doit sortir par le bas de l'écran (la vue le couperait)
    const low = h ? [...document.querySelectorAll('.room *')].filter((e) => e.getClientRects().length && !e.closest('svg') && e.getBoundingClientRect().height && e.getBoundingClientRect().bottom > innerHeight + 1).map((e) => e.className || e.tagName).slice(0, 5) : [];
    return {h, cut: cut.slice(0, 6), low, doc: h ? 0 : document.documentElement.scrollWidth - innerWidth};
  });
  if (r.cut.length || r.low.length || r.doc > 0) problems++;
  console.log(`— espacement élargi, ${w} × ${h} (${r.h ? 'l’enfilade tient' : 'la page passe de haut en bas'}) : ${r.cut.length ? 'texte coupé : ' + r.cut.join(' ; ') : 'aucun texte coupé'}${r.low.length ? ', sort par le bas : ' + r.low.join(', ') : ''}${r.doc > 0 ? `, défilement de côté ${r.doc} px` : ''}`);
  await p.close();
}
// le zoom du navigateur à 200 % : un écran de 1 440 px devient une fenêtre de 720 px
{
  const ctx = await b.newContext({viewport: {width: 720, height: 450}, deviceScaleFactor: 2});
  p = await ctx.newPage();
  await ready(p);
  const r = await p.evaluate(() => ({h: document.documentElement.classList.contains('h'), doc: document.documentElement.scrollWidth - innerWidth}));
  if (r.h || r.doc > 0) problems++;
  console.log(`— zoom à 200 % (1 440 × 900 vu en 720 × 450) : ${r.h ? 'enfilade' : 'la page de haut en bas'}, ${r.doc > 0 ? `défilement de côté ${r.doc} px` : 'sans défilement de côté'}`);
  await ctx.close();
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
  const unnamed = [...document.querySelectorAll('a[href], button, input, select, textarea')]
    .filter((e) => {
      if (e.closest('[hidden]')) return false;
      const lbl = e.labels?.length ? [...e.labels].map((l) => l.textContent).join('') : '';
      return !(e.getAttribute('aria-label') || e.textContent.trim() || lbl.trim() || e.getAttribute('title'));
    })
    .map((e) => e.outerHTML.slice(0, 60));
  const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  const refs = [...document.querySelectorAll('[aria-labelledby], [aria-describedby], [aria-controls], label[for]')].flatMap((e) =>
    ['aria-labelledby', 'aria-describedby', 'aria-controls', 'for'].flatMap((a) => (e.getAttribute(a) || '').split(/\s+/).filter(Boolean)),
  );
  const broken = refs.filter((id) => !document.getElementById(id));
  return {
    h1: levels.filter((l) => l === 1).length,
    outline: hs.map((h) => `${'  '.repeat(+h.tagName[1] - 1)}${h.tagName.toLowerCase()} ${h.textContent.trim().replace(/\s+/g, ' ').slice(0, 60)}`),
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
