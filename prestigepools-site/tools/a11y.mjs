// Audit d'accessibilité sur le site servi en local (http://127.0.0.1:8765/) :
// 1. ordre de tabulation et focus visible ; 2. cibles tactiles sur téléphone ; 3. contrastes mesurés sur les vrais pixels, de jour puis de nuit.
//   npx http-server dist-web -p 8765 -s   puis   node tools/a11y.mjs
import {createRequire} from 'node:module';
const req = createRequire(import.meta.url);
const {chromium} = req('/opt/node-tools/node_modules/playwright');
const URL_ = 'http://127.0.0.1:8765/';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});

/* 1. Clavier, sur ordinateur */
let p = await b.newPage({viewport: {width: 1440, height: 900}});
await p.goto(URL_ + '?lights=off', {waitUntil: 'load'});
await p.waitForTimeout(2000);
const seen = [];
for (let i = 0; i < 160; i++) {
  await p.keyboard.press('Tab');
  const info = await p.evaluate(() => {
    const e = document.activeElement;
    if (!e || e === document.body) return null;
    const t = e.matches('.chips input, .hues input') ? e.nextElementSibling : e;
    const cs = getComputedStyle(e);
    const ts = getComputedStyle(t);
    const r = t.getBoundingClientRect();
    const label = (e.getAttribute('aria-label') || e.innerText || e.value || e.name || e.id || '').trim().replace(/\s+/g, ' ').slice(0, 44);
    const visible = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || (ts.outlineStyle !== 'none' && parseFloat(ts.outlineWidth) >= 2) || cs.boxShadow !== 'none';
    return {tag: e.tagName.toLowerCase(), label, visible, inView: r.bottom > 0 && r.top < innerHeight, sec: e.closest('section, header, footer')?.id || e.closest('section, header, footer')?.className.split(' ')[0] || ''};
  });
  if (!info) break;
  if (seen.length && seen[0].label === info.label && seen[0].tag === info.tag) break;
  seen.push(info);
}
const bySec = {};
for (const s of seen) (bySec[s.sec] ||= []).push(s);
console.log('— tabulation :', seen.length, 'arrêts');
for (const [sec, list] of Object.entries(bySec)) console.log('  ', sec.padEnd(12), String(list.length).padStart(3), 'arrêts :', list.slice(0, 4).map((x) => x.label).join(' | '));
const invisible = seen.filter((s) => !s.visible);
console.log('  focus non visible :', invisible.length ? invisible.map((s) => s.tag + ' ' + s.label).join(', ') : 'aucun');
const offscreen = seen.filter((s) => !s.inView);
console.log('  focus hors de l’écran :', offscreen.length ? offscreen.map((s) => s.label).slice(0, 6).join(', ') : 'aucun');
await p.close();

/* 2. Cibles tactiles, sur téléphone */
p = await b.newPage({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
await p.goto(URL_ + '?lights=off', {waitUntil: 'load'});
await p.waitForTimeout(1500);
const small = await p.evaluate(() => {
  const out = [];
  for (const e of document.querySelectorAll('a[href], button, input, textarea')) {
    if (e.closest('[hidden], dialog:not([open]), .menu')) continue;
    const t = e.matches('.chips input, .hues input') ? e.nextElementSibling : e;
    const r = t.getBoundingClientRect();
    if (!r.width || !r.height || getComputedStyle(t).visibility === 'hidden') continue;
    if (e.closest('.grid li.is-extra')) continue;
    // un lien dans une phrase est exempté par le critère 2.5.8
    const inline = getComputedStyle(e).display === 'inline' && !!e.closest('p, dd, li, address') && !e.closest('nav');
    if (r.width < 44 || r.height < 44) out.push({label: (e.innerText || e.getAttribute('aria-label') || e.value || '').trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), inline, under24: r.width < 24 || r.height < 24});
  }
  return out;
});
console.log('— cibles de moins de 44 px sur téléphone :', small.length);
for (const s of small) console.log('  ', `${s.w}×${s.h}`, s.inline ? '(lien dans une phrase)' : '', s.under24 ? '< 24 px' : '', JSON.stringify(s.label));
await p.close();

/* 3. Contrastes : la couleur du texte contre le fond réellement peint derrière lui (capture du même endroit, texte masqué) */
const lum = (r, g, bl) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
};
const ratio = (a, c) => {
  const [x, y] = [lum(...a), lum(...c)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const checks = ['.brand__place', '.nav a', '.hero__lead', '.hero__call', '.facts li', '.hero__note', '.lead', '.glass__photos figcaption', '.pros dd', '.compare tbody th', '.compare td:nth-child(3)', '.compare thead th:nth-child(2)', '.steps p', '.filters button', '.work__count', '.board figcaption', '.opt-group__more', '.cocktail p:not(.cocktail__size)', '.cocktail .link', '.dark .lead', '.hues legend', '.hues label:nth-of-type(2) span', '.dark__more', '.dark__fig figcaption', '.dark__row figcaption', '.spas__col p', '.spas .link', '.ticks li', '.quote--big figcaption', '.quotes p', '.quotes figcaption', '.reviews__more', '.family__text p:not(.lead):not(.family__motto)', '.family__motto', '.family__facts p', '.money p', '.lenders dd', '.money .link', '.chips span', '.field label', '.field .opt', '.form__note', '.visit__status', '.visit__hours', '.visit .link', '.foot__brand > p:last-child', '.foot__col p', '.foot a', '.foot__small', '.btn--light'];
for (const mode of ['off', 'on']) {
  console.log(`— contrastes, lumières ${mode === 'off' ? 'éteintes (jour)' : 'allumées (nuit)'}`);
  p = await b.newPage({viewport: {width: 1440, height: 900}});
  await p.goto(URL_ + '?lights=' + mode, {waitUntil: 'load'});
  await p.waitForTimeout(1500);
  let bad = 0;
  for (const sel of checks) {
    const el = await p.$(sel);
    if (!el) { console.log('   absent', sel); continue; }
    await el.evaluate((e) => e.scrollIntoView({block: 'center'}));
    await p.waitForTimeout(500);
    const meta = await el.evaluate((e) => { const cs = getComputedStyle(e); return {color: cs.color, size: parseFloat(cs.fontSize), weight: +cs.fontWeight}; });
    // seulement sous les lettres (rectangles du texte), pour ne pas mesurer bordures et soulignés
    const box = await el.evaluate((e) => {
      const r = document.createRange();
      r.selectNodeContents(e);
      const q = [...r.getClientRects()].find((x) => x.width > 4 && x.height > 4 && x.top >= 0 && x.bottom <= innerHeight);
      return q ? {x: q.x + 1, y: q.y + 1, width: q.width - 2, height: q.height - 2} : null;
    });
    if (!box) continue;
    await el.evaluate((e) => {
      e.dataset.c = e.getAttribute('style') || '';
      e.style.setProperty('transition', 'none', 'important');
      e.style.setProperty('color', 'transparent', 'important');
      e.style.setProperty('text-decoration-color', 'transparent', 'important');
      e.style.setProperty('text-shadow', 'none', 'important');
      // les liens enfants aussi, soulignement compris (sinon le trait clair passe pour du fond)
      for (const k of e.querySelectorAll('*')) { k.style.setProperty('color', 'transparent', 'important'); k.style.setProperty('text-decoration-color', 'transparent', 'important'); }
    });
    await p.waitForTimeout(60);
    const shot = (await p.screenshot({clip: box})).toString('base64');
    await el.evaluate((e) => { e.setAttribute('style', e.dataset.c); for (const k of e.querySelectorAll('*')) { k.style.removeProperty('color'); k.style.removeProperty('text-decoration-color'); } });
    // le fond le plus clair et le plus sombre de la zone (le pire cas compte), lus dans la page
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
    const pass = worst >= (large ? 3 : 4.5);
    if (!pass) bad++;
    console.log('  ', pass ? '✓' : '✗', sel.padEnd(44), `${worst.toFixed(2)}:1`, `(${meta.size}px, ${meta.weight})`);
  }
  console.log(`   ${bad ? bad + ' en dessous du seuil' : 'tout au-dessus du seuil'}`);
  await p.close();
}
await b.close();
