// Captures de travail : la page entière en mouvement réduit (tout en place) et le premier écran après l'ouverture.
//   node tools/look.mjs <url> <dossier> [largeurs séparées par des virgules]
import {chromium} from '/opt/node-tools/node_modules/playwright/index.mjs';

const [, , url, out, list = '1440,390'] = process.argv;
const b = await chromium.launch();
for (const w of list.split(',').map(Number)) {
  const h = w < 700 ? 844 : w < 1100 ? 1024 : 900;
  // le premier écran, ouverture jouée
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 1});
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await p.goto(url, {waitUntil: 'networkidle'});
  await p.waitForTimeout(3200);
  await p.screenshot({path: `${out}/fold-${w}.png`});
  await p.close();
  // la page entière, tout en place
  const q = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 1, reducedMotion: 'reduce'});
  await q.goto(url, {waitUntil: 'networkidle'});
  await q.evaluate(async () => {
    for (const img of document.querySelectorAll('img[loading="lazy"]')) img.loading = 'eager';
    await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r)))));
  });
  await q.waitForTimeout(400);
  await q.screenshot({path: `${out}/full-${w}.png`, fullPage: true});
  const dims = await q.evaluate(() => ({h: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth}));
  console.log(w, dims, errors.length ? errors : 'ok');
  await q.close();
}
await b.close();
