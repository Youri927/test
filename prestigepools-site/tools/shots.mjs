// Captures pour les planches : chaque section à la taille d'un écran d'ordinateur (1440 × 900), de jour et de nuit,
// puis huit écrans de téléphone (390 × 844, en 2×). Le site est lu sur le serveur local.
//   npx http-server dist-web -p 8765 -s   puis   node tools/shots.mjs <dossier> [sections|phone]
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const out = process.argv[2] || 'shots';
const only = process.argv[3];
mkdirSync(out, {recursive: true});
const URL_ = 'http://127.0.0.1:8765/';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});

// fait défiler jusqu'à un élément (décalage en px), puis laisse les révélations se terminer
const go = async (p, sel, off, wait = 1300) => {
  await p.evaluate(([s, o]) => {
    const e = document.querySelector(s);
    window.scrollTo(0, s === 'body' ? 0 : e.getBoundingClientRect().top + scrollY + o);
  }, [sel, off]);
  await p.waitForTimeout(wait);
};

/* ——— sections, sur ordinateur ——— */
const SECTIONS = [
  ['hero', 'body', 0], ['glass', '#fiberglass', -10], ['compare', '.pros', -200], ['build', '#build', -10],
  ['work', '#work', -10], ['opts', '#options', -10], ['cocktail', '.cocktail', -420], ['dark', '#after-dark', 60],
  ['spas', '#spas', -10], ['reviews', '#reviews', -10], ['family', '#family', -10], ['money', '.money', -40],
  ['plan', '#plan', -10], ['foot', '.foot', -300],
];
for (const mode of only === 'phone' ? [] : ['off', 'on']) {
  const p = await b.newPage({viewport: {width: 1440, height: 900}});
  await p.goto(`${URL_}?lights=${mode}`, {waitUntil: 'load'});
  await p.waitForTimeout(1500);
  for (const [name, sel, off] of SECTIONS) {
    await go(p, sel, off);
    await p.screenshot({path: `${out}/s-${mode}-${name}.jpg`, type: 'jpeg', quality: 86});
  }
  await p.close();
}

/* ——— téléphone ——— */
const PHONE = [
  ['accueil-jour', 'off', 'body', 0], ['accueil-nuit', 'on', '.hero__fig', -76], ['tableau', 'off', '.compare table', -90],
  ['galerie', 'off', '#work', -10], ['projecteurs', 'off', '.hues', -330], ['spas', 'off', '#spas', -10],
  ['avis', 'on', '.quote--big', -120], ['formulaire', 'off', '#plan', -10],
];
for (const [name, mode, sel, off] of only === 'sections' ? [] : PHONE) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true});
  const p = await ctx.newPage();
  await p.goto(`${URL_}?lights=${mode}`, {waitUntil: 'load'});
  await p.waitForTimeout(1600);
  if (sel !== 'body') await go(p, sel, off, 1500);
  await p.screenshot({path: `${out}/p-${name}.png`});
  await ctx.close();
}
await b.close();
console.log(`${only === 'phone' ? 0 : SECTIONS.length * 2} captures de sections et ${only === 'sections' ? 0 : PHONE.length} écrans de téléphone dans ${out}/`);
